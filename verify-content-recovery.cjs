const fs = require('fs'), vm = require('vm'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const specs = JSON.parse(fs.readFileSync('source-content/recovery/assessments.json', 'utf8'));
  for (const gender of ['women', 'men']) {
    const raw = fs.readFileSync(`source-content/recovery/${gender}-assessment.js`, 'utf8');
    const original = raw.match(/function determineResult\([^)]*\) \{[\s\S]*?\n  \}/)[0];
    const expected = vm.runInNewContext('(' + original + ')');
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(`assets/assessment-${gender}.js`, 'utf8'), context);
    let cases = 0;
    const ranges = specs[gender].groups.map(g => g.options.length);
    for (let a = 0; a <= ranges[0]; a++) for (let b = 0; b <= ranges[1]; b++)
      for (let c = 0; c <= ranges[2]; c++) for (let d = 0; d <= ranges[3]; d++) {
        assert.equal(context.window.hrtAssessmentCategory(a,b,c,d), expected(a,b,c,d)); cases++;
      }
    console.log('PASS exact recovered scoring:', gender, cases, 'count combinations');
  }
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const errors = [], submissions = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (r.method() === 'POST') submissions.push(r.url()); });
  const routes = [
    'hrt-products/semaglutide-injections/index.html', 'hrt-products/semaglutide-bioboost-injections/index.html',
    'checklist/hormone-symptom-checklist-for-women-female-hormone-imbalance-test/index.html',
    'checklist/hormone-symptom-checklist-men/index.html', 'women/hair-loss/index.html', 'Return Policy.html', 'Pricing.html', 'About.html',
    'hormone-symptom-checklist-women/index.html', 'symptom-checklist-for-women/index.html',
    'hormone-symptom-checklist-men/index.html', 'symptom-checklist-for-men/index.html'
  ];
  fs.mkdirSync('scraps/content-recovery', { recursive: true });
  for (const width of [390,768,1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      const response = await page.goto('http://localhost:8000/' + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, route);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route + ' overflow');
      const text = await page.locator('main').innerText();
      assert(!text.includes('$49.95'), route);
      if (route.includes('hair-loss')) assert(!text.includes('Test for a number of health conditions'));
      if (route.startsWith('hrt-products')) {
        assert(text.includes('Product Overview'));
        assert.equal(await page.locator('.source-faqs details').count(), 4);
        await page.locator('.source-faqs summary').first().click();
        assert.equal(await page.locator('.source-faqs details[open]').count(), 1);
      }
      await page.screenshot({ path: 'scraps/content-recovery/' + route.replace(/[^a-z0-9]/gi,'_') + '-' + width + '.png', fullPage: true });
    }
  }
  for (const [gender, route] of [['women', routes[2]], ['men', routes[3]]]) {
    await page.goto('http://localhost:8000/' + route, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('input[type=checkbox]').count(), specs[gender].groups.reduce((n,g)=>n+g.options.length,0));
    await page.getByRole('button', { name: 'View my summary' }).click();
    assert((await page.locator('#assessment-results').innerText()).includes('No symptoms selected.'));
    for (let i=1; i<=4; i++) await page.locator(`input[name=cat${i}]`).first().check();
    await page.getByRole('button', { name: 'View my summary' }).click();
    assert((await page.locator('#assessment-results').innerText()).includes('Category 5'));
    await page.getByRole('button', { name: 'Clear answers' }).click();
    assert.equal(await page.locator('input:checked').count(), 0);
    assert(await page.locator('#assessment-results').isHidden());
    await page.locator('input[type=checkbox]').first().focus(); await page.keyboard.press('Space');
    assert.equal(await page.locator('input:checked').count(), 1);
    await page.reload(); assert.equal(await page.locator('input:checked').count(), 0);
  }
  assert.deepEqual(errors, []); assert.deepEqual(submissions, []);
  console.log('PASS 12 routes at 390/768/1440; FAQs, empty/all-category scoring, reset, keyboard, no persistence, no submissions or runtime errors');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
