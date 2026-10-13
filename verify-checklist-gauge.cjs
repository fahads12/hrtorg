/* On-site result visual verification. Browser-only delivery fixtures are used;
   only local GET/HEAD requests can leave the browser. No live record or email. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const core = require('./checklist-core.js');
const { CANONICAL_ROUTES } = require('./localize-checklist-links.cjs');

const origin = process.env.CHECKLIST_AUDIT_ORIGIN || 'http://localhost:8000';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Use a local development site');
const output = path.join(__dirname, 'scraps/checklist-results');
fs.mkdirSync(output, {recursive: true});
const specs = Object.fromEntries(Object.keys(CANONICAL_ROUTES).map(id => [id, JSON.parse(fs.readFileSync(path.join(__dirname, 'assets/checklists', `${id}.js`), 'utf8').trim().replace(/^window\.HRT_ASSESSMENT=/, '').replace(/;$/, ''))]));
const widths = process.env.CHECKLIST_AUDIT_WIDTHS ? process.env.CHECKLIST_AUDIT_WIDTHS.split(',').map(Number) : [1440, 768, 390];
const ids = process.env.CHECKLIST_AUDIT_IDS ? process.env.CHECKLIST_AUDIT_IDS.split(',') : Object.keys(CANONICAL_ROUTES);
const report = {startedAt: new Date().toISOString(), status: 'running', liveSubmissions: 0, networkGuard: 'Only local GET/HEAD requests are permitted. All external traffic and all writes are aborted. Delivery is replaced by explicit browser-only fixtures.', cases: [], screenshots: [], unexpectedWrites: [], visualReview: 'Captures are provided for visual review; capture itself does not establish review.'};
const text = option => typeof option === 'string' ? option : option.text;

function answersFor(spec, level) {
  if (spec.mode === 'hormone') return Object.fromEntries(spec.groups.map((group, i) => [group.name, level === 'zero' ? [] : level === 'max' ? group.options : group.options.slice(0, Math.ceil(group.options.length / 2))]));
  return Object.fromEntries(spec.questions.map((question, index) => {
    const scored = spec.options.map(option => ({text: text(option), score: spec.mode === 'protective-yes-no' && question.protective ? Number(text(option) === 'No') : option.score})).sort((a, b) => a.score - b.score);
    return [question.name, (level === 'zero' || level === 'mid' && index % 2 === 0 ? scored[0] : scored.at(-1)).text];
  }));
}

function deliveryFixture(kind) {
  return `window.__deliveryCalls=0; window.HRTChecklistDelivery={enabled:${kind !== 'local'},newsletterEnabled:false,submit:async()=>{window.__deliveryCalls++; ${kind === 'pending' ? 'await new Promise(resolve=>window.__releaseDelivery=resolve);' : ''} ${kind === 'failed' ? 'throw new Error("Mock failure");' : kind === 'unconfirmed' ? 'const error=new Error("Your request may have been received. Email delivery is unconfirmed.");error.uncertain=true;error.code="UNCONFIRMED";throw error;' : `return ${JSON.stringify(kind === 'no-symptoms' ? {localOnly: true, reason: 'no-symptoms'} : {accepted: true, emailSent: kind !== 'accepted'})};`}}};`;
}

async function createPage(browser, id, width, kind = 'local', motion = 'reduce') {
  const context = await browser.newContext({viewport: {width, height: width >= 1000 ? 1000 : 900}, reducedMotion: motion, serviceWorkers: 'block'});
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const pageErrors = [];
  const resourceFailures = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('response', response => {if (response.url().startsWith(origin) && response.status() >= 400) resourceFailures.push({url: response.url(), status: response.status()});});
  await context.route('**/*', route => {
    const request = route.request();
    const url = new URL(request.url());
    if (!['GET','HEAD'].includes(request.method())) {report.unexpectedWrites.push({method: request.method(), url: request.url()}); return route.abort('blockedbyclient');}
    if (url.origin !== origin) return route.abort('blockedbyclient');
    if (url.pathname === '/checklist-integration.js') return route.fulfill({contentType: 'application/javascript', body: deliveryFixture(kind)});
    return route.continue();
  });
  const target = `${origin}/${CANONICAL_ROUTES[id]}`;
  const response = await page.goto(target, {waitUntil: 'domcontentloaded'});
  assert.equal(response.status(), 200);
  await page.waitForFunction(() => window.HRT_ASSESSMENT && window.HRTChecklistDelivery && document.querySelector('#assessment-screen h2'));
  return {context, page, target, pageErrors, resourceFailures};
}

async function fill(page, id, level = 'mid') {
  const spec = specs[id];
  const answers = answersFor(spec, level);
  await page.locator('#assessment-next').click();
  for (const step of spec.steps) {
    const values = step.type === 'multiple' ? answers[step.name] : [answers[step.name]];
    await page.locator(`#assessment-screen input[name="${step.name}"]`).evaluateAll((inputs, values) => {
      for (const value of values) {const input = inputs.find(input => input.value === value); if (!input) throw Error('Missing answer option'); input.click();}
    }, values);
    await page.locator('#hormone-assessment').evaluate(form => form.requestSubmit());
  }
  for (const name of spec.contactOrder) {
    await page.locator(`#assessment-screen input[name="${name}"]`).fill(name === 'email' ? 'gauge.audit@example.invalid' : 'Local visual audit');
    await page.locator('#hormone-assessment').evaluate(form => form.requestSubmit());
  }
  await page.locator('#assessment-screen input[name="mailing_list"]').evaluateAll(inputs => inputs.find(input => input.value.startsWith('No')).click());
  await page.locator('#hormone-assessment').evaluate(form => form.requestSubmit());
  return core.score(spec, answers);
}

async function assertGauge(page, expected, motion) {
  const gauge = page.locator('.assessment-gauge');
  await gauge.waitFor({state: 'visible'});
  assert.equal(await gauge.getAttribute('role'), 'meter');
  assert.equal(await gauge.getAttribute('aria-valuemin'), '0');
  assert.equal(Number(await gauge.getAttribute('aria-valuenow')), expected.score);
  assert.equal(Number(await gauge.getAttribute('aria-valuemax')), expected.max);
  assert.ok((await gauge.getAttribute('aria-label') || await gauge.getAttribute('aria-labelledby')), 'Gauge has an accessible name');
  assert.equal((await page.locator('.assessment-score-value strong').innerText()).trim(), String(expected.score), 'Final score is immediately readable');
  assert.equal((await page.locator('.assessment-result-label').innerText()).trim(), expected.label, 'Original classification retained');
  const ratio = expected.score / expected.max;
  assert.ok(Math.abs(Number(await page.locator('.assessment-gauge-needle').getAttribute('data-target-angle')) - ratio * 180) < 0.001, 'Needle target represents score fraction');
  assert.ok(Math.abs(Number(await page.locator('.assessment-gauge-progress').getAttribute('stroke-dashoffset')) - 100 * (1 - ratio)) < 0.001, 'Progress arc represents score fraction');
  const animations = await page.locator('.assessment-gauge-needle,.assessment-gauge-progress').evaluateAll(nodes => nodes.map(node => ({name: getComputedStyle(node).animationName, duration: getComputedStyle(node).animationDuration})));
  if (motion === 'reduce') assert.ok(animations.every(animation => animation.name === 'none' || parseFloat(animation.duration) <= 0.001), 'Reduced motion disables sweeping animation');
  else assert.ok(animations.every(animation => animation.name !== 'none' && parseFloat(animation.duration) > 0), 'Normal mode animates needle and progress');
  await gauge.evaluate(async node => {await Promise.all(node.getAnimations({subtree: true}).map(animation => animation.finished.catch(() => {})));});
  const final = await gauge.evaluate(node => ({transform: getComputedStyle(node.querySelector('.assessment-gauge-needle')).transform, offset: getComputedStyle(node.querySelector('.assessment-gauge-progress')).strokeDashoffset}));
  const matrix = final.transform.match(/^matrix\(([^)]+)\)$/);
  if (matrix) {const parts = matrix[1].split(',').map(Number); let angle = Math.atan2(parts[1], parts[0]) * 180 / Math.PI; if (angle < -0.01) angle += 360; assert.ok(Math.abs(angle - ratio * 180) < 0.05, 'Rendered needle settles at expected angle');}
  else assert.equal(expected.score, 0, 'Only the zero needle may have no transform');
  assert.ok(Math.abs(parseFloat(final.offset) - 100 * (1 - ratio)) < 0.01, 'Rendered progress settles at expected amount');
}

async function layoutAudit(page) {
  const audit = await page.evaluate(() => ({width: innerWidth, scrollWidth: document.documentElement.scrollWidth, brokenImages: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.src), resultBounds: document.querySelector('#assessment-results').getBoundingClientRect().toJSON(), gaugeBounds: document.querySelector('.assessment-gauge').getBoundingClientRect().toJSON()}));
  assert.ok(audit.scrollWidth <= audit.width + 1, 'No horizontal overflow');
  assert.deepEqual(audit.brokenImages, [], 'Images load');
  assert.ok(audit.gaugeBounds.width > 100 && audit.gaugeBounds.right <= audit.resultBounds.right + 1 && audit.gaugeBounds.left >= audit.resultBounds.left - 1, 'Gauge fits results container');
}

async function capture(page, name) {
  await page.evaluate(async () => {await document.fonts.ready; window.scrollTo({top: 0, left: 0, behavior: 'instant'});});
  await page.waitForTimeout(100);
  const full = `${name}-full.png`, section = `${name}-result.png`;
  const screenshot = await page.screenshot({path: path.join(output, full), fullPage: true, animations: 'disabled'});
  // Crop the document-origin capture rather than asking Chromium to scroll a
  // tall locator into view. The latter can paint an offscreen fixed skip link
  // inside the composite even though it is absent from the actual viewport.
  const cropped = await page.locator('#checklist-panel').evaluate(async (panel, png) => {
    const rect = panel.getBoundingClientRect();
    const image = new Image(); image.src = 'data:image/png;base64,' + png; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = Math.ceil(rect.width); canvas.height = Math.ceil(rect.height);
    canvas.getContext('2d').drawImage(image, Math.floor(rect.left + scrollX), Math.floor(rect.top + scrollY), canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png').split(',')[1];
  }, screenshot.toString('base64'));
  fs.writeFileSync(path.join(output, section), Buffer.from(cropped, 'base64'));
  report.screenshots.push(full, section);
}

async function check(name, task) {
  try {await task(); report.cases.push({name, status: 'passed'}); console.log(`PASS ${name}`);}
  catch (error) {report.cases.push({name, status: 'failed', error: error.stack || error.message}); console.error(`FAIL ${name}: ${error.message}`);}
  fs.writeFileSync(path.join(output, 'gauge-report.json'), JSON.stringify(report, null, 2));
}

(async () => {
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  try {
    for (const id of ids) for (const width of widths) await check(`${id} ${width}: local results and layout`, async () => {
      const state = await createPage(browser, id, width);
      try {
        const expected = await fill(state.page, id);
        await assertGauge(state.page, expected, 'reduce');
        await layoutAudit(state.page);
        assert.equal(state.page.url(), state.target, 'Results stay on the same local route');
        assert.equal(await state.page.locator('.assessment-delivery').getAttribute('data-status'), 'local');
        assert.match(await state.page.locator('.assessment-delivery').innerText(), /Nothing has been submitted or emailed/);
        assert.equal(await state.page.evaluate(() => window.__deliveryCalls), 0);
        await capture(state.page, `${id}-${width}`);
        assert.deepEqual(state.pageErrors, []);
        assert.deepEqual(state.resourceFailures, []);
      } finally {await state.context.close();}
    });
    for (const id of ids) for (const level of ['zero','max']) await check(`${id}: ${level} gauge endpoint`, async () => {
      const state = await createPage(browser, id, 1440);
      try {const expected = await fill(state.page, id, level); assert.equal(expected.score, level === 'zero' ? 0 : expected.max); await assertGauge(state.page, expected, 'reduce'); assert.equal(state.page.url(), state.target);} finally {await state.context.close();}
    });
    for (const level of ['mid','max']) await check(`Normal motion: ${level} animation settles correctly`, async () => {
      const state = await createPage(browser, 'pms', 1440, 'local', 'no-preference');
      try {const expected = await fill(state.page, 'pms', level); await assertGauge(state.page, expected, 'no-preference');} finally {await state.context.close();}
    });
    for (const status of ['email-sent','accepted','failed','unconfirmed','no-symptoms']) await check(`Delivery status: ${status}`, async () => {
      const state = await createPage(browser, status === 'no-symptoms' ? 'women' : 'pms', 390, status);
      try {
        const expected = await fill(state.page, status === 'no-symptoms' ? 'women' : 'pms', status === 'no-symptoms' ? 'zero' : 'mid');
        await assertGauge(state.page, expected, 'reduce');
        assert.equal(await state.page.locator('.assessment-delivery').getAttribute('data-status'), status);
        assert.equal(await state.page.locator('.assessment-delivery').getAttribute('role'), 'status');
        assert.equal(await state.page.evaluate(() => window.__deliveryCalls), 1);
        assert.equal(state.page.url(), state.target);
        if (['failed','unconfirmed'].includes(status)) assert.equal(await state.page.getByRole('button', {name: 'Try sending again'}).count(), 1);
        if (status === 'email-sent') assert.match(await state.page.locator('.assessment-delivery').innerText(), /email service accepted|accepted your results email/i);
        if (status === 'accepted') assert.match(await state.page.locator('.assessment-delivery').innerText(), /not.*confirmed/i);
        await layoutAudit(state.page);
        await capture(state.page, `status-${status}-390`);
      } finally {await state.context.close();}
    });
    await check('Pending delivery: disabled submit then confirmed on-site result', async () => {
      const state = await createPage(browser, 'pms', 1440, 'pending');
      try {
        const expected = await fill(state.page, 'pms');
        assert.equal(await state.page.locator('#assessment-next').isDisabled(), true);
        assert.match(await state.page.locator('#assessment-next').innerText(), /Sending/);
        assert.equal(await state.page.locator('#assessment-results').isVisible(), false);
        await state.page.evaluate(() => window.__releaseDelivery());
        await assertGauge(state.page, expected, 'reduce');
        assert.equal(await state.page.locator('.assessment-delivery').getAttribute('data-status'), 'email-sent');
        assert.equal(state.page.url(), state.target);
      } finally {await state.context.close();}
    });
    await check('No live writes occurred', async () => assert.deepEqual(report.unexpectedWrites, []));
  } finally {
    await browser.close();
    report.status = report.cases.some(item => item.status !== 'passed') ? 'failed' : 'passed';
    report.completedAt = new Date().toISOString();
    fs.writeFileSync(path.join(output, 'gauge-report.json'), JSON.stringify(report, null, 2));
    if (report.status !== 'passed') process.exitCode = 1;
    console.log(`${report.cases.length} checks; ${report.screenshots.length} screenshots; ${report.status}; 0 live submissions`);
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
