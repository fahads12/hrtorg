const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const capturePage = require('./article-audit-capture.cjs');
const output = 'scraps/inner-static';
const excluded = new Set(['node_modules', 'uploads', 'source-content', 'scraps', '.tools', 'assets', '.git']);
function files(dir = '.') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() && !excluded.has(entry.name) ? files(file) : entry.isFile() && entry.name.endsWith('.html') ? [file] : [];
  });
}
const requested = process.argv.slice(2);
const routes = files().filter(file => fs.readFileSync(file, 'utf8').includes('class="source-hero"')).map(file => file.replaceAll('\\', '/')).filter(route => !requested.length || requested.includes(route));
const css = fs.readFileSync('inner-pages.css', 'utf8');
const results = requested.length && fs.existsSync(path.join(output, 'results.json')) ? JSON.parse(fs.readFileSync(path.join(output, 'results.json'))).filter(result => !requested.includes(result.route)) : [];
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  await Promise.all([1440, 768, 390].map(async width => {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    for (const route of routes) {
      let errors = [];
      const errorListener = error => errors.push(error.message);
      const consoleListener = message => { if (message.type() === 'error') errors.push(message.text()); };
      page.on('pageerror', errorListener);
      page.on('console', consoleListener);
      try {
        const response = await page.goto('http://localhost:8000/' + route, { waitUntil: 'networkidle' });
        await page.addStyleTag({ content: css });
        await page.evaluate(async () => {
          await document.fonts.ready;
          document.documentElement.style.scrollBehavior = 'auto';
          document.querySelectorAll('main img').forEach(image => { image.loading = 'eager'; });
          await Promise.all([...document.querySelectorAll('main img')].map(img => Promise.race([img.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 3000))])));
          for (let y = 0; y < document.documentElement.scrollHeight; y += 650) {
            scrollTo({ top: y, behavior: 'instant' });
            await new Promise(resolve => setTimeout(resolve, 18));
          }
          scrollTo({ top: 0, behavior: 'instant' });
        });
        await page.waitForTimeout(650);
        const checks = await page.evaluate(() => {
          const main = document.querySelector('main');
          return {
            height: document.documentElement.scrollHeight,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            brokenImages: [...main.querySelectorAll('img')].filter(img => !img.complete || !img.naturalWidth).map(img => img.getAttribute('src')),
            hiddenContent: [...main.querySelectorAll('h1,h2,p,.source-card')].filter(el => getComputedStyle(el).opacity === '0').map(el => el.textContent.trim().slice(0, 70)),
            emptyLinks: [...main.querySelectorAll('a')].filter(el => !el.getAttribute('href') || el.getAttribute('href') === '#').map(el => el.outerHTML.slice(0, 150)),
            links: [...main.querySelectorAll('a')].map(el => ({ href: el.href, text: el.textContent.trim() })),
            h1Count: main.querySelectorAll('h1').length,
            text: main.innerText.slice(0, 650),
            tableCount: main.querySelectorAll('table').length
          };
        });
        const file = route.replace(/[^\w]/g, '_') + '-' + width + '.png';
        await capturePage(page, path.join(output, file));
        if (['Privacy Policy.html', 'Terms and Conditions.html', 'Contact.html', 'providers/dr-clarence-lee-jr/index.html', 'hrt-products/semaglutide-injections/index.html', 'blog-categories/mens-health/index.html', 'checklist/hormone-symptom-checklist-men/index.html'].includes(route)) {
          for (const [section, fraction] of [['top', .08], ['middle', .5], ['bottom', .84]]) {
            await page.evaluate(fraction => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * fraction, behavior: 'instant' }), fraction);
            await page.screenshot({ path: path.join(output, file.replace('.png', `-${section}.png`)) });
          }
        }
        results.push({ route, width, status: response.status(), errors, ...checks, screenshot: file });
      } catch (error) { results.push({ route, width, errors: [...errors, error.message] }); }
      page.off('pageerror', errorListener);
      page.off('console', consoleListener);
      fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
      if (results.length % 24 === 0) console.log(`${results.length}/${routes.length * 3} static checks`);
    }
    await page.close();
  }));
  await browser.close();
  const failures = results.filter(result => result.status !== 200 || result.errors.length || result.overflow || result.brokenImages?.length || result.emptyLinks?.length || result.h1Count !== 1);
  console.log(JSON.stringify({ routes: routes.length, visits: results.length, failures }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
