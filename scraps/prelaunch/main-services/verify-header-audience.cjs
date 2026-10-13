const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('http://localhost:8011/Audience.html?g=women', { waitUntil: 'networkidle' });
    await page.locator('.aud-hero h1').waitFor();
    await page.evaluate(() => window.auditDocument = 'same-document');
    assert.equal(await page.locator('.aud-switch').count(), 0);
    for (const gender of ['men', 'women']) {
      if (width <= 1000) await page.locator('.mobile-menu').click();
      const link = page.locator(`#site-navigation a[href="Audience.html?g=${gender}"]`);
      await link.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(g => document.body.dataset.gender === g && document.documentElement.dataset.careTheme === g, gender);
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => window.auditDocument), 'same-document');
      assert.equal(await link.getAttribute('aria-current'), 'page');
      assert(page.url().includes('g=' + gender));
      assert.equal(await page.locator('#site-navigation.is-open').count(), 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({ path: `scraps/prelaunch/main-services/header-switch-${gender}-${width}.png`, fullPage: true });
    }
    console.log('PASS keyboard header switching, same document, URL/theme, mobile menu and layout:', width);
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#site-navigation a[href="Audience.html?g=men"]').click();
  await page.waitForFunction(() => document.body.dataset.gender === 'men');
  assert.equal(await page.locator('main').evaluate(el => getComputedStyle(el).opacity), '1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => {
    for (const gender of ['women', 'men', 'women']) document.querySelector(`#site-navigation a[href="Audience.html?g=${gender}"]`).click();
  });
  await page.waitForFunction(() => document.body.dataset.gender === 'women');
  await page.waitForTimeout(450);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.careTheme), 'women');
  assert.deepEqual(errors, []);
  console.log('PASS reduced motion, rapid switches and no runtime errors');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
