/* Tests the actual browser adapter. Every webhook is intercepted; no live submission is possible. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const core = require('./checklist-core.js');
const { CANONICAL_ROUTES } = require('./localize-checklist-links.cjs');

const origin = process.env.CHECKLIST_AUDIT_ORIGIN || 'http://localhost:8000';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Only a local test site is allowed');
const endpointOrigin = 'https://vmi3206755.contaboserver.net';
const endpointPaths = {
  women: 'hormone-women-typeform-submit', men: 'hormone-men-typeform-submit',
  pms: 'pms-typeform-submit', thyroid: 'thyroid-typeform-submit', adrenal: 'adrenal-typeform-submit',
  osteoporosis: 'osteoporosis-typeform-submit', andropause: 'andropause-typeform-submit',
  menopause: 'menopause-typeform-submit', perimenopause: 'perimenopause-typeform-submit',
};
const specs = Object.fromEntries(Object.keys(endpointPaths).map(id => [id, JSON.parse(fs.readFileSync(path.join(__dirname, 'assets/checklists', `${id}.js`), 'utf8').trim().replace(/^window\.HRT_ASSESSMENT=/, '').replace(/;$/, ''))]));
const reportFile = path.join(__dirname, 'scraps/checklist-localization/n8n-integration-mock-report.json');
const report = { startedAt: new Date().toISOString(), status: 'running', mocked: true, liveSubmissions: 0, enablement: 'The actual enabled adapter is loaded unchanged after user approval. Every outbound write is intercepted; no requests reach n8n.', networkGuard: 'Only local GET/HEAD may leave the browser. Every expected webhook POST is fulfilled/aborted by Playwright. All other external requests and write requests are aborted.', cases: [], unexpectedWrites: [], unexpectedWebhookRequests: [], mockedPosts: [] };
const contact = { first_name: 'Integration audit', email: 'integration.audit@example.invalid', mailing_list: 'No, just send me the results' };
let expectedMock = null;
const activeMocks = new Set();
const endpoint = id => `${endpointOrigin}/webhook/${endpointPaths[id]}`;
const text = option => typeof option === 'string' ? option : option.text;
function answersFor(spec, zero = false) {
  return spec.mode === 'hormone'
    ? Object.fromEntries(spec.groups.map((group, index) => [group.name, zero ? [] : group.options.slice(0, index + 1)]))
    : Object.fromEntries(spec.questions.map((question, index) => [question.name, text(spec.options[index % spec.options.length])]));
}
function payloadFor(id, zero = false) { return core.buildPayload(specs[id], answersFor(specs[id], zero), contact); }
function arrange(id, kind = 'success', body = { success: true, message: 'Assessment complete.' }) {
  assert.equal(expectedMock, null, 'Previous mock was consumed');
  let acknowledge, release;
  const received = new Promise(resolve => { acknowledge = resolve; });
  const released = new Promise(resolve => { release = resolve; });
  const mock = { id, kind, body, received, acknowledge, released, release };
  activeMocks.add(mock);
  expectedMock = mock;
  return mock;
}
async function waitRequest(mock) {
  let timer;
  try { return await Promise.race([mock.received, new Promise((_, reject) => { timer = setTimeout(() => reject(Error(`Expected ${mock.id} request did not arrive`)), 10000); })]); }
  finally { clearTimeout(timer); }
}
async function guardedRoute(route) {
  const request = route.request();
  const url = new URL(request.url());
  const method = request.method();
  const isWebhook = /\/webhook(?:-test)?\//.test(url.pathname) || url.hostname === 'vmi3206755.contaboserver.net';
  if (isWebhook) {
    if (method === 'OPTIONS' && Object.keys(endpointPaths).some(id => request.url() === endpoint(id))) return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    if (method !== 'POST' || !expectedMock || request.url() !== endpoint(expectedMock.id)) {
      report.unexpectedWebhookRequests.push({ method, url: request.url() });
      return route.abort('blockedbyclient');
    }
    const mock = expectedMock;
    expectedMock = null;
    const record = { id: mock.id, kind: mock.kind, method, url: request.url(), contentType: request.headers()['content-type'], body: request.postDataJSON() };
    report.mockedPosts.push(record);
    mock.acknowledge(record);
    if (mock.kind === 'network') return route.abort('failed');
    if (mock.kind === 'pending' || mock.kind === 'timeout') await mock.released;
    const headers = { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' };
    if (mock.kind === 'redirect') return route.fulfill({ status: 302, headers: { ...headers, Location: 'https://unexpected.example.invalid/redirect' }, body: '' });
    return route.fulfill({ status: mock.kind === 'invalid-email' ? 400 : mock.kind === 'server-error' ? 500 : 200, headers, body: mock.kind === 'invalid-json' ? '<html>not json</html>' : JSON.stringify(mock.body) }).catch(error => { if (mock.kind !== 'timeout') throw error; });
  }
  if (!['GET', 'HEAD'].includes(method)) {
    report.unexpectedWrites.push({ method, url: request.url() });
    return route.abort('blockedbyclient');
  }
  if (url.origin !== origin) return route.abort('blockedbyclient');
  return route.continue();
}
async function check(name, test) {
  try { await test(); report.cases.push({ name, status: 'passed' }); console.log(`PASS ${name}`); }
  catch (error) { report.cases.push({ name, status: 'failed', error: error.stack || error.message }); console.error(`FAIL ${name}: ${error.message}`); }
  finally { for (const mock of activeMocks) mock.release(); activeMocks.clear(); expectedMock = null; }
}
async function open(page, id) {
  const target = `${origin}/${CANONICAL_ROUTES[id]}`;
  const response = await page.goto(target, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200);
  await page.waitForFunction(() => window.HRTChecklistDelivery && window.HRT_ASSESSMENT && document.querySelector('#assessment-screen h2'));
  assert.equal(await page.evaluate(() => window.HRTChecklistDelivery.enabled), true, 'Actual adapter is enabled');
  assert.equal(await page.evaluate(() => window.HRTChecklistDelivery.newsletterEnabled), false, 'No unsupported newsletter subscription claim');
  assert.equal(await page.evaluate(() => window.HRT_ASSESSMENT.id), id);
  return target;
}
async function direct(page, id, payload = payloadFor(id)) {
  return page.evaluate(async ({ assessmentId, payload }) => {
    try { return { resolved: true, result: await window.HRTChecklistDelivery.submit({ assessmentId, payload }) }; }
    catch (error) { return { resolved: false, name: error.name, message: error.message }; }
  }, { assessmentId: id, payload });
}
async function fill(page, id, zero = false) {
  const spec = specs[id];
  const answers = answersFor(spec, zero);
  await page.locator('#assessment-next').click();
  for (const step of spec.steps) {
    if (step.type === 'single' || step.type === 'multiple') {
      const selected = step.type === 'multiple' ? answers[step.name] : [answers[step.name]];
      for (const value of selected) await page.locator(`#assessment-screen input[name="${step.name}"]`).filter({ visible: true }).evaluateAll((inputs, value) => { const input = inputs.find(input => input.value === value); if (!input) throw Error('Missing input value'); input.click(); }, value);
    }
    await page.locator('#assessment-next').click();
  }
  for (const name of spec.contactOrder) {
    await page.locator(`#assessment-screen input[name="${name}"]`).fill(contact[name]);
    await page.locator('#assessment-next').click();
  }
  // The runtime preserves the original decline value even when signup is unavailable.
  const choices = page.locator('#assessment-screen input[name="mailing_list"]');
  if (await choices.count()) {
    const decline = spec.mailingOptions.findIndex(option => text(option).startsWith('No'));
    const value = text(spec.mailingOptions[decline]);
    await choices.evaluateAll((inputs, value) => { const input = inputs.find(input => input.value === value); if (!input) throw Error('Missing original decline value'); input.click(); }, value);
  }
}
async function submitUi(page) {
  await page.locator('#assessment-next').click();
  await page.locator('#assessment-results').waitFor({ state: 'visible' });
}
async function assertFetchOptions(page) {
  const last = await page.evaluate(() => window.__n8nFetchAudit.at(-1));
  assert.equal(last.method, 'POST');
  assert.equal(last.credentials, 'omit');
  assert.equal(last.redirect, 'error');
  assert.equal(last.cache, 'no-store');
  assert.ok(last.hasSignal, 'Request has an abort signal');
  assert.equal(last.contentType, 'application/json');
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.route('**/*', guardedRoute);
  await context.addInitScript(() => {
    const nativeFetch = window.fetch.bind(window);
    window.__n8nFetchAudit = [];
    window.fetch = (input, init = {}) => {
      window.__n8nFetchAudit.push({ url: String(input), method: init.method, credentials: init.credentials, redirect: init.redirect, cache: init.cache, hasSignal: !!init.signal, contentType: new Headers(init.headers).get('Content-Type') });
      return nativeFetch(input, init);
    };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  try {
    await check('Unmodified adapter is enabled but makes no automatic submission on page load', async () => {
      await page.goto(`${origin}/${CANONICAL_ROUTES.pms}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.HRTChecklistDelivery);
      assert.equal(await page.evaluate(() => window.HRTChecklistDelivery.enabled), true);
      assert.equal(await page.evaluate(() => window.__n8nFetchAudit.length), 0);
      assert.equal(report.mockedPosts.length, 0);
    });
    for (const id of Object.keys(endpointPaths)) await check(`${id}: complete form uses exact original endpoint and flat payload`, async () => {
      const target = await open(page, id);
      await fill(page, id);
      const poison = id === 'women' ? { success: true, redirectUrl: 'https://www.hrt.org/leave-site', landingPageUrl: 'https://www.hrt.org/leave-site', totalScore: 99999, resultLabel: 'UNTRUSTED RESULT', resultContent: '<img src=x onerror=alert(1)>', message: 'UNTRUSTED MESSAGE' } : undefined;
      const mock = arrange(id, 'success', poison);
      await submitUi(page);
      const request = await waitRequest(mock);
      assert.deepEqual(request.body, payloadFor(id));
      assert.equal(request.contentType, 'application/json');
      assert.ok(!Object.hasOwn(request.body, 'assessmentId') && !Object.hasOwn(request.body, 'payload'), 'Body is not wrapped');
      await assertFetchOptions(page);
      const summary = core.score(specs[id], answersFor(specs[id]));
      assert.equal((await page.locator('.assessment-score-value strong').innerText()).trim(), String(summary.score));
      assert.equal((await page.locator('.assessment-result-label').innerText()).trim(), summary.label);
      assert.equal(page.url(), target);
      const resultText = await page.locator('#assessment-results').innerText();
      assert.doesNotMatch(resultText, /UNTRUSTED|99999/);
      assert.match(await page.locator('.assessment-delivery').innerText(), /sent|accepted/i);
      assert.doesNotMatch(await page.locator('.assessment-delivery').innerText(), /could not|failed/i);
    });
    await check('Adapter normalizes minimal success JSON without forwarding backend content', async () => {
      await open(page, 'pms');
      arrange('pms');
      assert.deepEqual(await direct(page, 'pms'), { resolved: true, result: { accepted: true, emailSent: true } });
    });
    for (const [kind, body] of [['invalid-email', { success: false, error: 'INVALID_EMAIL' }], ['server-error', { success: true }], ['invalid-json', null], ['wrong-success', { message: 'Workflow was started' }], ['false-success', { success: false }], ['string-success', { success: 'true' }], ['network', null], ['redirect', null]]) await check(`Adapter rejects ${kind} without navigating`, async () => {
      const target = await open(page, 'pms');
      arrange('pms', kind, body);
      const result = await direct(page, 'pms');
      assert.equal(result.resolved, false, JSON.stringify(result));
      assert.equal(page.url(), target);
    });
    await check('Strict payload validation rejects unsafe names, invalid contacts, answers, and extra fields before fetch', async () => {
      await open(page, 'pms');
      const valid = payloadFor('pms');
      const first = specs.pms.questions[0].name;
      const invalid = [
        { ...valid, first_name: '<b>Injected</b>' }, { ...valid, first_name: 'Injected\nName' },
        { ...valid, email: 'not-an-email' }, { ...valid, [first]: 'unknown' },
        { ...valid, [first]: true }, { ...valid, extra: 'unexpected' },
        Object.fromEntries(Object.entries(valid).filter(([key]) => key !== first)),
        { ...valid, mailing_list: 'yes' }, { assessmentId: 'pms', payload: valid },
      ];
      const before = report.mockedPosts.length;
      for (const payload of invalid) assert.equal((await direct(page, 'pms', payload)).resolved, false, JSON.stringify(payload));
      assert.equal((await direct(page, 'unknown-assessment', valid)).resolved, false);
      assert.equal(report.mockedPosts.length, before);
      assert.equal(await page.evaluate(() => window.__n8nFetchAudit.length), 0);
    });
    await check('Hormone counts require bounded integers and zero symptoms never POST', async () => {
      for (const id of ['women', 'men']) {
        await open(page, id);
        const valid = payloadFor(id);
        for (const count of [-1, 0.5, specs[id].groups.find(group => group.name === 'cat1').options.length + 1, '1']) assert.equal((await direct(page, id, { ...valid, cat1: count })).resolved, false);
        assert.deepEqual(await direct(page, id, payloadFor(id, true)), { resolved: true, result: { accepted: false, localOnly: true, reason: 'no-symptoms' } });
        assert.equal(await page.evaluate(() => window.__n8nFetchAudit.length), 0);
      }
    });
    for (const id of ['women', 'men']) await check(`${id}: zero symptom UI stays local without retry or email success`, async () => {
      const target = await open(page, id);
      const before = report.mockedPosts.length;
      await fill(page, id, true);
      await submitUi(page);
      assert.equal(report.mockedPosts.length, before);
      assert.equal(await page.evaluate(() => window.__n8nFetchAudit.length), 0);
      assert.equal((await page.locator('.assessment-score-value strong').innerText()).trim(), '0');
      assert.match(await page.locator('.assessment-delivery').innerText(), /not.*sent|nothing.*submitted|no.*email|on this page|here only|local/i);
      assert.equal(await page.getByRole('button', { name: 'Try sending again' }).count(), 0);
      assert.equal(page.url(), target);
    });
    await check('Duplicate submit events are blocked while request is pending', async () => {
      await open(page, 'pms');
      await fill(page, 'pms');
      const before = report.mockedPosts.length;
      const mock = arrange('pms', 'pending');
      await page.locator('#assessment-next').click();
      await waitRequest(mock);
      assert.equal(await page.locator('#assessment-next').isDisabled(), true);
      assert.equal(await page.locator('#assessment-back').isDisabled(), true);
      await page.locator('#hormone-assessment').evaluate(form => { form.dispatchEvent(new Event('submit', { cancelable: true })); form.dispatchEvent(new Event('submit', { cancelable: true })); });
      assert.equal(await page.evaluate(() => window.__n8nFetchAudit.length), 1);
      assert.equal(report.mockedPosts.length, before + 1);
      mock.release();
      await page.locator('#assessment-results').waitFor({ state: 'visible' });
    });
    await check('Failed UI delivery preserves local answers and retry resends the same payload once', async () => {
      const target = await open(page, 'pms');
      await fill(page, 'pms');
      const initial = arrange('pms', 'server-error', { success: false });
      await submitUi(page);
      const first = await waitRequest(initial);
      assert.match(await page.locator('.assessment-delivery').innerText(), /could not|unable|failed/i);
      assert.equal((await page.locator('.assessment-score-value strong').innerText()).trim(), String(core.score(specs.pms, answersFor(specs.pms)).score));
      const retry = arrange('pms', 'pending');
      await page.getByRole('button', { name: 'Try sending again' }).click();
      const second = await waitRequest(retry);
      assert.deepEqual(second.body, first.body);
      assert.equal(await page.getByRole('button', { name: 'Try sending again' }).isDisabled(), true);
      retry.release();
      await page.waitForFunction(() => !document.querySelector('.assessment-delivery')?.textContent.includes('could not'));
      assert.equal(page.url(), target);
      assert.equal(await page.evaluate(() => window.__n8nFetchAudit.length), 2);
    });
    await check('Thirty second timeout aborts the request without automatically retrying', async () => {
      await open(page, 'pms');
      await page.clock.install();
      const mock = arrange('pms', 'timeout');
      await page.evaluate(payload => {
        window.__timeoutResult = null;
        window.HRTChecklistDelivery.submit({ assessmentId: 'pms', payload }).then(value => { window.__timeoutResult = { resolved: true, value }; }, error => { window.__timeoutResult = { resolved: false, name: error.name }; });
      }, payloadFor('pms'));
      await waitRequest(mock);
      await page.clock.fastForward(31000);
      await page.waitForFunction(() => window.__timeoutResult !== null);
      assert.equal(await page.evaluate(() => window.__timeoutResult.resolved), false);
      assert.equal(await page.evaluate(() => window.__n8nFetchAudit.length), 1);
      mock.release();
    });
    await check('Network guard saw no unexpected writes or webhook destinations', async () => {
      assert.deepEqual(report.unexpectedWrites, []);
      assert.deepEqual(report.unexpectedWebhookRequests, []);
      assert.equal(expectedMock, null);
    });
  } finally {
    if (expectedMock) expectedMock.release();
    await browser.close();
    report.completedAt = new Date().toISOString();
    report.passed = report.cases.filter(item => item.status === 'passed').length;
    report.failed = report.cases.filter(item => item.status === 'failed').length;
    report.status = report.failed ? 'failed' : 'passed';
    fs.mkdirSync(path.dirname(reportFile), { recursive: true });
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ status: report.status, passed: report.passed, failed: report.failed, mockedPosts: report.mockedPosts.length, liveSubmissions: 0, report: reportFile }));
    if (report.failed) process.exitCode = 1;
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
