// Read-only browser and link audit. Run after npm run build from the project root.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../..');
const { CANONICAL_ROUTES, FORM_ALIASES } = require(path.join(root, 'localize-checklist-links.cjs'));
const origin = 'http://localhost:8000';
const output = path.join(__dirname, 'browser-after');
fs.mkdirSync(output, { recursive: true });
const canonicalIds = new Map(Object.entries(CANONICAL_ROUTES).map(([id, route]) => [route, id]));
const formRoutes = [...canonicalIds].map(([route, id]) => ({ route, id, canonical: true }));
for (const [alias, target] of Object.entries(FORM_ALIASES)) formRoutes.push({ route: alias + '/index.html', id: canonicalIds.get(target), canonical: false });
const failures = [], results = [], allLinks = [], assetErrors = [], consoleErrors = [], posts = [];

function isChecklist(value) { return /checklist|assessment|Symptom(?:%20| )Check\.html|menopause-quiz/i.test(value); }
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules','source-content','scraps','uploads','.git','.tools','.codex','.agents'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    const route = path.relative(root, file).replaceAll('\\', '/');
    if (!route.endsWith('.html') && !/^assets\/.*\.js$/.test(route)) continue;
    const text = fs.readFileSync(file, 'utf8').replaceAll('\\"', '"');
    const base = route.endsWith('.html') ? new URL(text.match(/<base\b[^>]*href="([^"]+)"/)?.[1] || './', origin + '/' + route) : new URL(origin + '/');
    for (const match of text.matchAll(/\bhref\s*(?:=|:)\s*["']([^"']+)["']/g)) {
      if (!isChecklist(match[1])) continue;
      const href = match[1].replaceAll('&amp;', '&');
      let url; try { url = new URL(href, base); } catch { failures.push({ route, reason: 'Invalid checklist href', href }); continue; }
      allLinks.push({ source: route, href, url: url.href });
      if (/^(?:www\.)?hrt\.org$/.test(url.hostname)) failures.push({ route, reason: 'Original site checklist link', href });
    }
  }
}
walk(root);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.on('pageerror', error => consoleErrors.push({ page: page.url(), message: error.message }));
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(origin)) assetErrors.push({ page: page.url(), url: response.url(), status: response.status() }); });
  // This audit never submits assessments; abort any unexpected data delivery.
  await page.route('**/*', route => {
    const request = route.request();
    if (!['GET','HEAD','OPTIONS'].includes(request.method())) { posts.push({ url: request.url(), method: request.method() }); return route.abort(); }
    return route.continue();
  });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const item of formRoutes) {
      const response = await page.goto(origin + '/' + item.route, { waitUntil: 'networkidle' });
      const state = await page.evaluate(() => ({
        url: location.href, title: document.title, h1: [...document.querySelectorAll('main h1')].map(h => h.textContent.trim()),
        id: document.querySelector('main')?.dataset.checklist,
        forms: document.querySelectorAll('main #hormone-assessment').length,
        screen: document.getElementById('assessment-screen')?.textContent.trim(),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        oldBody: /HRT Return Policy/.test(document.querySelector('main')?.textContent || ''),
        missingImages: [...document.images].filter(img => img.complete && img.naturalWidth === 0).map(img => img.src),
        externalLinks: [...document.querySelectorAll('a[href]')].filter(a => /^(?:www\.)?hrt\.org$/.test(new URL(a.href).hostname) && /checklist|assessment|quiz/.test(a.href)).map(a => a.href),
      }));
      const record = { ...item, width, status: response?.status(), ...state };
      results.push(record);
      if (record.status !== 200 || !state.url.startsWith(origin + '/') || state.id !== item.id || state.forms !== 1 || state.h1.length !== 1 || state.oldBody || !state.screen || state.overflow || state.missingImages.length || state.externalLinks.length) failures.push({ route: item.route, width, reason: 'Route rendering failed', state: record });
      if (item.canonical && width !== 320) {
        await page.screenshot({ path: path.join(output, item.id + '-' + width + '.png'), fullPage: true });
        const next = page.locator('#assessment-next');
        if (await next.isVisible() && /start/i.test(await next.innerText())) {
          await next.click();
          await page.locator('#checklist-panel').screenshot({ path: path.join(output, item.id + '-question-' + width + '.png') });
          if (!await page.locator('#assessment-screen input, #assessment-screen button, #assessment-screen [role="checkbox"], #assessment-screen [role="radio"]').count()) {
            // Intro screens are permitted before the first set of questions.
            record.firstScreenText = (await page.locator('#assessment-screen').innerText()).slice(0,300);
          }
        }
      }
    }
    console.log('Rendered', formRoutes.length, 'form routes at', width);
  }

  const linkTargets = [...new Set(allLinks.map(link => link.url).filter(url => url.startsWith(origin + '/')))];
  const linkResults = [];
  for (const url of linkTargets) {
    const target = new URL(url);
    const response = await page.request.get(url);
    const item = { url, status: response.status() };
    if (response.status() !== 200) failures.push({ reason: 'Checklist destination failed', ...item });
    if (target.hash && response.status() === 200) {
      await page.goto(url, { waitUntil: 'networkidle' });
      const id = decodeURIComponent(target.hash.slice(1));
      item.anchorExists = await page.evaluate(id => !!document.getElementById(id) || !!document.querySelector(`[name="${CSS.escape(id)}"]`), id);
      if (!item.anchorExists) failures.push({ reason: 'Checklist anchor missing', ...item });
    }
    linkResults.push(item);
  }

  const index = JSON.parse(fs.readFileSync(path.join(root, 'source-content/page-index.json'), 'utf8'));
  const formPaths = new Set(formRoutes.map(item => item.route));
  const remainingRoutes = index.filter(item => /checklist|assessment|menopause-quiz/.test(item.key) && !formPaths.has(item.route));
  const legacy = [];
  for (const item of remainingRoutes) {
    const response = await page.goto(origin + '/' + item.route, { waitUntil: 'networkidle' });
    legacy.push({ route: item.route, status: response.status(), ...await page.locator('main').evaluate(el => ({
      h1: el.querySelector('h1')?.textContent.trim(), forms: el.querySelectorAll('form').length,
      localAssessmentLinks: [...el.querySelectorAll('a[href]')].filter(a => a.origin === location.origin && /checklist|Symptom(?:%20| )Check/.test(a.href)).map(a => ({ text: a.textContent.trim(), href: a.href })),
      text: el.innerText.slice(0,700),
    })) });
  }
  // Render representative entry points to verify compiled navigation and article content.
  const entryPoints = [];
  for (const route of ['HRT Home.html','Audience.html?g=women','Audience.html?g=men','Symptom Check.html','health/your-health-and-hormones/index.html']) {
    await page.goto(origin + '/' + route, { waitUntil: 'networkidle' });
    const links = await page.locator('a[href]').evaluateAll(anchors => anchors.filter(a => /checklist|assessment|Symptom(?:%20| )Check\.html|menopause-quiz/i.test(a.href)).map(a => ({ text: a.textContent.trim(), href: a.href })));
    const external = links.filter(link => /https?:\/\/(?:www\.)?hrt\.org(?:\/|$)/.test(link.href));
    if (external.length) failures.push({ route, reason: 'Rendered entry point has original checklist links', external });
    entryPoints.push({ route, links });
  }
  for (const error of consoleErrors) failures.push({ reason: 'Browser exception', ...error });
  for (const error of assetErrors) failures.push({ reason: 'Missing local resource', ...error });
  for (const post of posts) failures.push({ reason: 'Unexpected submission request', ...post });
  const report = { formRoutes: formRoutes.length, widths: [1440,768,390,320], renderCount: results.length, results, linkCount: allLinks.length, allLinks, linkResults, legacy, entryPoints, consoleErrors, assetErrors, posts, failures };
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ formRoutes: formRoutes.length, renderCount: results.length, checkedLinks: allLinks.length, uniqueTargets: linkResults.length, remainingRoutes: legacy.length, failures: failures.length }));
  await browser.close();
  if (failures.length) { console.error(JSON.stringify(failures.slice(0,10), null, 2)); process.exitCode = 1; }
})().catch(error => { console.error(error); process.exitCode = 1; });
