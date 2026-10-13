const { chromium } = require('playwright');
const fs = require('fs');
const assert = require('node:assert/strict');
const dir = 'scraps/glow-navigation';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [], rows = [];
    page.on('pageerror', e => errors.push(e.message));
    const home = async () => {
      await page.goto('http://localhost:8000/HRT%20Home.html', { waitUntil: 'networkidle' });
      await page.waitForSelector('#site-navigation[data-glow-ready]', { state: 'attached' });
    };
    for (const width of [1440, 1280, 1251, 1200, 1024, 1001, 1000, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      await home();
      if (width <= 1000) await page.locator('.mobile-menu').click();
      const layout = await page.locator('.glow-menu-list').evaluate(el => ({
        links: [...el.querySelectorAll('a')].map(a => {
          const r = a.getBoundingClientRect();
          return { label: a.ariaLabel, x: r.x, w: r.width, h: r.height };
        }), scroll: document.documentElement.scrollWidth,
      }));
      assert(layout.scroll <= width + 1);
      for (const link of layout.links) { assert(link.h >= 44); assert(link.x >= 0 && link.x + link.w <= width + 1); }
      await page.locator('.source-dropdown summary').click();
      assert.equal(await page.locator('.source-dropdown[open] a').count(), 9);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.source-dropdown[open]').count(), 0);
      if (width <= 1000) await page.locator('.mobile-menu').click();
      if ([1440, 768, 390, 320].includes(width)) await page.screenshot({ path: `${dir}/header-${width}.png` });
      if (width <= 1000) await page.keyboard.press('Escape');
      rows.push({ width, pass: true, layout });
    }
    await page.setViewportSize({ width: 1440, height: 960 });
    await home();
    const men = page.locator('.glow-menu-link').filter({ hasText: 'For Men' });
    await men.hover(); await page.waitForTimeout(800);
    assert(await men.locator('.glow-menu-back').evaluate(el => Number(getComputedStyle(el).opacity)) > .95);
    assert.equal(await page.locator('.glow-menu-link').filter({ hasText: 'Resources' }).locator('.glow-menu-back').evaluate(el => getComputedStyle(el).opacity), '0');
    await page.screenshot({ path: `${dir}/desktop-hover.png` });
    await men.focus(); await page.waitForTimeout(800);
    await page.screenshot({ path: `${dir}/desktop-focus.png` });
    const originalUrl = page.url();
    const popupPromise = context.waitForEvent('page');
    await men.click({ modifiers: ['Control'] });
    const popup = await popupPromise;
    await popup.waitForLoadState();
    assert(popup.url().includes('Audience.html?g=men'));
    assert.equal(page.url(), originalUrl);
    await popup.close();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    const reduced = page.locator('.glow-menu-link').filter({ hasText: 'For Men' });
    await reduced.hover(); await page.waitForTimeout(200);
    assert.equal(await reduced.locator('.glow-menu-back').evaluate(el => getComputedStyle(el).opacity), '0');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 960 });
      await home();
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${dir}/home-full-${width}.png`, fullPage: true });
    }
    for (const [route, active] of [['Product.html?g=men&p=hrt', 'Treatments'], ['blog-categories/advice/', 'Resources']]) {
      await page.goto('http://localhost:8000/' + route, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.glow-menu-link[aria-current="page"]').getAttribute('aria-label'), active);
    }
    assert.deepEqual(errors, []);
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 960 } });
    const fallback = await nojs.newPage();
    await fallback.goto('http://localhost:8000/Contact.html');
    assert.equal(await fallback.locator('a[data-glow-fallback]:visible').count(), 6);
    await nojs.close();
    const result = { rows, errors, hover: 'single link only', modifiedClick: 'new tab, original document unchanged', reducedMotion: 'no flip', noJavaScript: 'six native fallback links', activeCategoryFixes: 'pass' };
    fs.writeFileSync(`${dir}/verification.json`, JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ widths: rows.map(r => r.width), checks: 'layout, 44px targets, dropdown/Escape, isolated hover, focus, Ctrl+click, reduced motion, fallback, active categories', errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
