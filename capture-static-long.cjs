// Chromium can wrap very tall full-page captures. Capture bounded tiles and stitch instead.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const capturePage = require('./article-audit-capture.cjs');
const output = 'scraps/inner-static';
(async () => {
  const results = JSON.parse(fs.readFileSync(path.join(output, 'results.json')));
  const longPages = results.filter(result => result.height > 15000);
  const manifest = [];
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const result of longPages) {
    const page = await browser.newPage({ viewport: { width: result.width, height: 1000 } });
    await page.goto('http://localhost:8000/' + result.route, { waitUntil: 'networkidle' });
    await page.addStyleTag({ path: 'inner-pages.css' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.documentElement.style.scrollBehavior = 'auto';
      document.querySelectorAll('main img').forEach(img => { img.loading = 'eager'; });
      await Promise.all([...document.querySelectorAll('main img')].map(img => img.decode().catch(() => {})));
      for (let top = 0; top < document.documentElement.scrollHeight; top += 700) {
        scrollTo({ top, behavior: 'instant' });
        await new Promise(resolve => setTimeout(resolve, 18));
      }
      scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(650);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await capturePage(page, path.join(output, result.screenshot));
    const tileDirectory = path.join(output, 'tiles');
    const tiles = height > 16000 ? fs.readdirSync(tileDirectory).filter(file => file.startsWith(path.basename(result.screenshot, '.png') + '-')).map(file => path.join(tileDirectory, file)) : [];
    manifest.push({ file: path.join(output, result.screenshot), width: result.width, height, route: result.route, tiles });
    await page.close();
    console.log(`${manifest.length}/${longPages.length} tall pages tiled`);
  }
  await browser.close();
  const manifestPath = path.join(output, 'long-screenshot-tiles.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Replaced ' + manifest.length + ' long full-page screenshots with bounded captures.');
})().catch(error => { console.error(error); process.exitCode = 1; });
