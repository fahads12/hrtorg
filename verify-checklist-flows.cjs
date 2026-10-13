/* Offline wizard checks. An explicitly disabled adapter fixture keeps these UI
   tests independent of delivery; verify-n8n-integration.cjs covers the real adapter.
   Both suites block every live write request and webhook. */
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const core = require('./checklist-core.js');
const { CANONICAL_ROUTES } = require('./localize-checklist-links.cjs');
const origin = process.env.CHECKLIST_AUDIT_ORIGIN || 'http://localhost:8000';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Browser verification is restricted to a local server');
const output = path.resolve(__dirname, 'scraps/checklist-localization/after');
fs.mkdirSync(output, { recursive: true });
const widths = process.env.CHECKLIST_AUDIT_WIDTHS ? process.env.CHECKLIST_AUDIT_WIDTHS.split(',').map(Number) : [1440, 768, 390];
const ids = process.env.CHECKLIST_AUDIT_IDS ? process.env.CHECKLIST_AUDIT_IDS.split(',') : Object.keys(CANONICAL_ROUTES);
const captureOnly = process.argv.includes('--capture-only');
const reportFile = path.join(output, captureOnly ? 'screenshot-report.json' : 'browser-report.json');
const report = { status: 'passed', startedAt: new Date().toISOString(), localOrigin: origin, widths, cases: [], networkGuard: 'The adapter is explicitly disabled in a browser-only fixture. All non-GET/HEAD requests and any webhook destination are intercepted and blocked before transmission.', liveSubmissions: 0, screenshotReview: 'Screenshots captured for human/agent visual inspection; capture alone does not establish visual review.' };

function offlineAdapterFixture(route) {
  if (new URL(route.request().url()).pathname !== '/checklist-integration.js') return null;
  return route.fulfill({contentType:'application/javascript',body:'window.HRTChecklistDelivery=Object.freeze({enabled:false});'});
}

async function runCaptureCase(browser, id, width) {
  const item = { id, width, route: CANONICAL_ROUTES[id], status: 'passed', screenshots: [], mode: 'fresh screenshot capture only' };
  const context = await browser.newContext({ viewport: { width, height: width >= 1000 ? 1000 : 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const blocked = [];
  await page.route('**/*', route => {
    const request = route.request();
    if (!['GET', 'HEAD'].includes(request.method()) || /contaboserver|\/webhook(?:-test)?\//i.test(request.url())) { blocked.push(request.url()); return route.abort(); }
    const fixture = offlineAdapterFixture(route); if (fixture) return fixture;
    return route.continue();
  });
  try {
    await page.goto(`${origin}/${CANONICAL_ROUTES[id]}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.HRT_ASSESSMENT && document.querySelector('#assessment-screen h2'));
    await page.evaluate(() => document.fonts.ready);
    const spec = await page.evaluate(() => window.HRT_ASSESSMENT);
    item.screenshots.push(await capture(page, id, width, 'intro'));
    await page.locator('#assessment-next').click();
    let first = true;
    for (let index = 0; index < spec.steps.length; index++) {
      const step = spec.steps[index];
      await waitForState(page, step.title);
      if (step.type !== 'intro') {
        const options = page.locator(`#assessment-screen input[name="${step.name}"]`);
        if (step.type === 'multiple') for (let i = 0; i < 1 + index % 3; i++) await options.nth(i).check();
        else await options.nth(index % step.options.length).check();
        if (first) { item.screenshots.push(await capture(page, id, width, 'question')); first = false; }
      }
      await page.locator('#assessment-next').click();
    }
    for (const field of spec.contactOrder) {
      await page.locator(`#assessment-screen input[name="${field}"]`).fill(field === 'email' ? 'checklist.audit@example.com' : 'Local audit');
      await page.locator('#assessment-next').click();
    }
    const decline = spec.mailingOptions.findIndex(option => (typeof option === 'string' ? option : option.text).startsWith('No'));
    await page.locator('#assessment-screen input[name="mailing_list"]').nth(decline).check();
    await page.locator('#assessment-next').click();
    await page.locator('#assessment-results').waitFor({ state: 'visible' });
    item.screenshots.push(await capture(page, id, width, 'result'));
    await layoutAudit(page, `${id}/${width}/fresh-result`);
    assert.deepEqual(blocked, [], 'Screenshot flow makes no submission attempts');
  } catch (error) { item.status = 'failed'; item.error = error.stack || error.message; }
  finally { await context.close(); }
  report.cases.push(item);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`${id} ${width} screenshots: ${item.status}`);
}

function screenshotName(id, width, stage) { return `${id}-${width}-${stage}.png`; }
async function capture(page, id, width, stage) {
  const file = screenshotName(id, width, stage);
  // Start composites at the document origin so offscreen fixed skip links do not
  // appear at the previous scroll offset in Chromium's full-page screenshot.
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(output, file), fullPage: true, animations: 'disabled' });
  return file;
}
async function layoutAudit(page, label) {
  const audit = await page.evaluate(() => {
    const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    return {
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      brokenImages: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.getAttribute('src')),
      smallControls: [...document.querySelectorAll('#assessment-next,#assessment-back,.assessment-option,.assessment-text-input')].filter(visible).filter(el => el.getBoundingClientRect().height < 43).map(el => ({ tag: el.tagName, text: el.textContent.trim().slice(0, 70), height: el.getBoundingClientRect().height })),
    };
  });
  assert.ok(audit.scrollWidth <= audit.width + 1, `${label}: horizontal overflow (${audit.scrollWidth}/${audit.width})`);
  assert.deepEqual(audit.brokenImages, [], `${label}: broken images`);
  assert.deepEqual(audit.smallControls, [], `${label}: controls must have comfortable touch targets`);
  return audit;
}
async function rejectEmpty(page, field) {
  const before = await page.locator('#assessment-screen h2').innerText();
  await page.locator('#assessment-next').click();
  assert.equal(await page.locator('#assessment-screen h2').innerText(), before, `${field}: empty submission stays on current screen`);
  assert.equal(await page.locator('#assessment-error').isVisible(), true, `${field}: validation message is visible`);
  assert.ok((await page.locator('#assessment-error').innerText()).trim(), `${field}: validation explains issue`);
}
async function waitForState(page, heading) {
  await page.waitForFunction(text => document.querySelector('#assessment-screen h2')?.textContent === text, heading);
}
async function runCase(browser, id, width) {
  const item = { id, width, route: CANONICAL_ROUTES[id], status: 'passed', screenshots: [], checks: [], consoleErrors: [], pageErrors: [], localResourceFailures: [], externalNetworkNoise: [], blockedWriteRequests: [] };
  const context = await browser.newContext({ viewport: { width, height: width >= 1000 ? 1000 : 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.route('**/*', async route => {
    const request = route.request();
    if (!['GET', 'HEAD'].includes(request.method()) || /contaboserver|\/webhook(?:-test)?\//i.test(request.url())) {
      item.blockedWriteRequests.push({ method: request.method(), url: request.url() });
      return route.abort('blockedbyclient');
    }
    const fixture = offlineAdapterFixture(route); if (fixture) return fixture;
    return route.continue();
  });
  page.on('pageerror', error => item.pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const location = message.location().url || '';
    const value = { message: message.text(), url: location };
    if (location && !location.startsWith(origin)) item.externalNetworkNoise.push(value);
    else item.consoleErrors.push(value);
  });
  page.on('requestfailed', request => {
    const value = { url: request.url(), method: request.method(), failure: request.failure()?.errorText };
    if (request.url().startsWith(origin)) item.localResourceFailures.push(value);
    else item.externalNetworkNoise.push(value);
  });
  page.on('response', response => {
    if (response.status() < 400) return;
    const value = { url: response.url(), status: response.status() };
    if (response.url().startsWith(origin)) item.localResourceFailures.push(value);
    else item.externalNetworkNoise.push(value);
  });
  try {
    const target = `${origin}/${CANONICAL_ROUTES[id]}`;
    const response = await page.goto(target, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `${id}: direct route loads`);
    await page.waitForFunction(() => window.HRT_ASSESSMENT && document.querySelector('#assessment-screen h2'));
    await page.evaluate(() => document.fonts.ready);
    const spec = await page.evaluate(() => window.HRT_ASSESSMENT);
    assert.equal(spec.id, id, 'Correct assessment rendered');
    assert.ok(spec.steps.every(step => ['single','multiple'].includes(step.type) && step.options.length > 0), 'Every assessment step contains selectable answers, never an empty divider');
    const visual = page.locator('.checklist-visual img');
    assert.equal(await visual.count(), 1, 'Checklist has its own visual');
    assert.match(await visual.getAttribute('src'), new RegExp(`/checklists/${id}-480\\.webp$`), 'Correct checklist-specific image');
    assert.ok(await visual.evaluate(image => image.complete && image.naturalWidth > 0 && image.alt.length > 15 && image.width > 0 && image.height > 0), 'Image loaded with descriptive alt text and reserved dimensions');
    assert.equal(await page.locator('main h1').count(), 1, 'One visible document title');
    assert.equal(await page.locator('#assessment-back').isVisible(), false, 'Back hidden at intro');
    assert.equal(await page.evaluate(() => window.HRTChecklistDelivery?.enabled), false, 'Offline UI fixture disables delivery');
    item.screenshots.push(await capture(page, id, width, 'intro'));
    await layoutAudit(page, `${id}/${width}/intro`);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('#assessment-screen h2'));
    assert.equal(page.url(), target, 'Refresh remains on local checklist URL');
    item.checks.push('Direct access and refresh');
    await page.locator('#assessment-next').click();
    assert.ok(await page.locator('#assessment-screen input').count() > 0, 'Starting the checklist immediately shows selectable answers');
    assert.equal(await page.locator('#assessment-next svg[aria-hidden="true"]').count(), 1, 'Continue includes a decorative direction arrow');
    assert.equal(await page.locator('#assessment-back svg[aria-hidden="true"]').count(), 1, 'Back includes a decorative direction arrow');
    const answers = {};
    let firstQuestion = true;
    let validatedSingle = false;
    for (let index = 0; index < spec.steps.length; index++) {
      const step = spec.steps[index];
      await waitForState(page, step.title);
      if (step.type === 'intro') { await page.locator('#assessment-next').click(); continue; }
      const options = page.locator(`#assessment-screen input[name="${step.name}"]`);
      assert.equal(await options.count(), step.options.length, `${id}/${step.name}: all options visible`);
      assert.equal(await options.locator('xpath=..').first().isVisible(), true, 'Native option label visible');
      if (step.type === 'single' && !validatedSingle) { await rejectEmpty(page, step.name); validatedSingle = true; }
      if (step.type === 'multiple' && firstQuestion) {
        await page.locator('#assessment-next').click();
        assert.equal(await page.locator('#assessment-error').isVisible(), false, 'No symptoms selected is permitted');
        await page.locator('#assessment-back').click();
        await waitForState(page, step.title);
        assert.equal(await page.locator('#assessment-screen input:checked').count(), 0, 'Optional symptom group remains blank');
      }
      if (step.type === 'multiple') {
        const values = step.options.slice(0, 1 + (index % 3)).map(option => typeof option === 'string' ? option : option.text);
        for (let i = 0; i < values.length; i++) await options.nth(i).check();
        answers[step.name] = values;
      } else {
        const optionIndex = index % step.options.length;
        await options.nth(optionIndex).check();
        answers[step.name] = typeof step.options[optionIndex] === 'string' ? step.options[optionIndex] : step.options[optionIndex].text;
      }
      if (firstQuestion) {
        item.screenshots.push(await capture(page, id, width, 'question'));
        await page.locator('#assessment-next').click();
        await page.locator('#assessment-back').click();
        await waitForState(page, step.title);
        const expected = Array.isArray(answers[step.name]) ? answers[step.name] : [answers[step.name]];
        assert.deepEqual(await page.locator('#assessment-screen input:checked').evaluateAll(inputs => inputs.map(input => input.value)), expected, 'Back navigation preserves selected answer');
        item.checks.push('Back navigation preserves answers');
        firstQuestion = false;
      }
      await layoutAudit(page, `${id}/${width}/${step.name}`);
      await page.locator('#assessment-next').click();
    }
    for (const field of spec.contactOrder) {
      const input = page.locator(`#assessment-screen input[name="${field}"]`);
      await input.waitFor();
      assert.equal(await input.inputValue(), '', `${field}: no prefilled personal data`);
      await rejectEmpty(page, field);
      if (field === 'email') {
        await input.fill('not-an-email');
        await rejectEmpty(page, 'invalid email');
        await input.fill('checklist.audit@example.com');
      } else await input.fill('Local audit');
      await page.locator('#assessment-next').click();
    }
    const mailing = page.locator('#assessment-screen input[name="mailing_list"]');
    assert.equal(await mailing.count(), spec.mailingOptions.length, 'Original mailing choices present');
    assert.equal(await mailing.locator('xpath=..').first().isVisible(), true);
    assert.equal(await page.locator('#assessment-screen input:checked').count(), 0, 'No preselected marketing opt-in');
    await rejectEmpty(page, 'mailing preference');
    const decline = spec.mailingOptions.findIndex(option => (typeof option === 'string' ? option : option.text).startsWith('No'));
    assert.ok(decline >= 0, 'Optional marketing decline option exists');
    await mailing.nth(decline).check();
    await page.locator('#assessment-next').click();
    await page.locator('#assessment-results').waitFor({ state: 'visible' });
    const expected = core.score(spec, answers);
    assert.equal((await page.locator('.assessment-result-label').innerText()).trim(), expected.label, 'Displayed category matches original scoring');
    assert.equal((await page.locator('.assessment-score-value strong').innerText()).trim(), String(expected.score), 'Displayed score matches original scoring');
    assert.equal((await page.locator('.assessment-score-value span').innerText()).trim(), `/ ${expected.max}`, 'Displayed maximum matches source questions');
    if (spec.mode === 'hormone') {
      const visibleCounts = await page.locator('.assessment-counts dd').allTextContents();
      assert.deepEqual(visibleCounts, spec.groups.map(group => `${expected.counts[group.name]} of ${group.options.length} selected`), 'Category counts and available choices match selected symptoms');
    }
    assert.equal(page.url(), target, 'Results stay on current local URL');
    assert.match(await page.locator('.assessment-delivery').innerText(), /Nothing has been submitted or emailed/, 'No simulated delivery confirmation');
    assert.equal(await page.locator('#hormone-assessment').isVisible(), false, 'Question form hidden on results');
    await page.locator('.assessment-review summary').click();
    assert.equal(await page.locator('.assessment-review').getAttribute('open'), '', 'Review answers accordion opens');
    assert.equal(await page.locator('.assessment-review dl > div').count(), spec.steps.filter(step => step.type === 'single' || step.type === 'multiple').length, 'All answers available for review');
    await page.locator('.assessment-review summary').click();
    await layoutAudit(page, `${id}/${width}/result`);
    item.screenshots.push(await capture(page, id, width, 'result'));
    item.result = expected;
    item.checks.push('Native validation: unanswered required question, blank contact, invalid email, unselected mailing preference', 'Original local score and category', 'Local-only results and truthful delivery status', 'Review answers accordion');
    for (const link of await page.locator('.assessment-result-actions a').evaluateAll(links => links.map(link => link.href))) {
      assert.ok(link.startsWith(origin), 'Result action points to local route');
      assert.equal((await context.request.get(link)).status(), 200, 'Result action destination exists');
    }
    const educational = page.locator('details.checklist-education');
    if (await educational.count()) {
      await educational.locator('summary').focus();
      await page.keyboard.press('Enter');
      assert.equal(await educational.getAttribute('open'), '', 'Educational details opens by keyboard');
      assert.ok((await educational.locator('article').innerText()).trim().length > 40, 'Educational content is populated');
      await layoutAudit(page, `${id}/${width}/education`);
      await educational.locator('summary').click();
      item.checks.push('Educational section and keyboard disclosure');
    } else item.checks.push('No educational article was provided for this original route');
    await page.getByRole('button', { name: 'Edit my answers', exact: true }).click();
    for (const step of spec.steps) {
      await waitForState(page, step.title);
      if (step.type !== 'intro') {
        const expectedAnswers = Array.isArray(answers[step.name]) ? answers[step.name] : [answers[step.name]];
        assert.deepEqual(await page.locator('#assessment-screen input:checked').evaluateAll(inputs => inputs.map(input => input.value)), expectedAnswers, 'Edit retains prior selection');
        break;
      }
      await page.locator('#assessment-next').click();
    }
    // Finish retained answers without changes, then retake to verify reset.
    for (let guard = 0; guard < spec.steps.length + 5 && !(await page.locator('#assessment-results').isVisible()); guard++) await page.locator('#assessment-next').click();
    await page.locator('#assessment-results').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Start again', exact: true }).click();
    assert.equal(await page.locator('#assessment-results').isVisible(), false, 'Retake hides previous results');
    assert.equal(await page.locator('#assessment-back').isVisible(), false, 'Retake returns to intro');
    await page.locator('#assessment-next').click();
    for (const step of spec.steps) {
      await waitForState(page, step.title);
      if (step.type !== 'intro') { assert.equal(await page.locator('#assessment-screen input:checked').count(), 0, 'Retake clears previously selected answers'); break; }
      await page.locator('#assessment-next').click();
    }
    assert.equal(await page.evaluate(() => Object.keys(localStorage).some(key => /assessment|checklist|symptoms|email/i.test(key))), false, 'Sensitive answers are not stored in localStorage');
    item.checks.push('Result CTAs resolve locally', 'Edit preserves answers', 'Retake clears answers', 'No persistent checklist storage');
    assert.deepEqual(item.blockedWriteRequests, [], 'No submission or old webhook attempts');
    assert.deepEqual(item.pageErrors, [], 'No browser JavaScript errors');
    assert.deepEqual(item.localResourceFailures, [], 'No failed local assets');
    assert.deepEqual(item.consoleErrors, [], 'No local console errors');
  } catch (error) {
    item.status = 'failed';
    item.error = error.stack || error.message;
    try { item.screenshots.push(await capture(page, id, width, 'failure')); } catch {}
  } finally {
    await context.close();
  }
  report.cases.push(item);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`${id} ${width}: ${item.status}${item.error ? ' — ' + item.error.split('\n')[0] : ''}`);
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of widths) for (const id of ids) await (captureOnly ? runCaptureCase : runCase)(browser, id, width);
  } finally { await browser.close(); }
  report.status = report.cases.every(item => item.status === 'passed') ? 'passed' : 'failed';
  report.completedAt = new Date().toISOString();
  report.passed = report.cases.filter(item => item.status === 'passed').length;
  report.failed = report.cases.filter(item => item.status === 'failed').length;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ status: report.status, passed: report.passed, failed: report.failed, report: reportFile }, null, 2));
  if (report.failed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
