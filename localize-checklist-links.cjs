// Keep published assessment navigation on the local site. Source archives are never edited.
const fs = require('fs');
const path = require('path');

const CANONICAL_ROUTES = Object.freeze({
  women: 'checklist/hormone-symptom-checklist-for-women-female-hormone-imbalance-test/index.html',
  men: 'checklist/hormone-symptom-checklist-men/index.html',
  pms: 'checklist/pms-assessment/index.html',
  thyroid: 'checklist/thyroid-assessment/index.html',
  adrenal: 'checklist/adrenal-fatigue/index.html',
  osteoporosis: 'checklist/osteoporosis-assessment/index.html',
  andropause: 'checklist/andropause-assessment/index.html',
  menopause: 'checklist/menopause-assessment/index.html',
  perimenopause: 'checklist/perimenopause-assessment/index.html',
});

// These older URLs describe the same assessment topic. Extra ED, nutritional,
// weight and intake forms must retain their own destinations.
const FORM_ALIASES = Object.freeze({
  'hormone-symptom-checklist-women': CANONICAL_ROUTES.women,
  'symptom-checklist-for-women': CANONICAL_ROUTES.women,
  'hormone-symptom-checklist-men': CANONICAL_ROUTES.men,
  'symptom-checklist-for-men': CANONICAL_ROUTES.men,
  // The original Low T page embeds EdKIn3 (Q009 Hormone Symptom Checklist Men).
  // Its 55 options and four groups exactly match the recovered men's checklist.
  'checklist/low-testosterone-low-t-quiz-free-evaluation': CANONICAL_ROUTES.men,
  'low-testosterone-low-t-quiz-free-evaluation': CANONICAL_ROUTES.men,
  'checklist/premenstrual-syndrome-pms-self-assessment': CANONICAL_ROUTES.pms,
  'pms-symptom-self-assessment': CANONICAL_ROUTES.pms,
  'thyroid-assessment': CANONICAL_ROUTES.thyroid,
  'checklist/adrenal-fatigue-stress-test': CANONICAL_ROUTES.adrenal,
  'checklist/osteoporosis-signs-symptoms-assessment-free-self-check-evaluation': CANONICAL_ROUTES.osteoporosis,
  'checklist/andropause-symptoms-test-assessment': CANONICAL_ROUTES.andropause,
  'andropause-assessment': CANONICAL_ROUTES.andropause,
  'checklist/perimenopause-symptom-self-assessment': CANONICAL_ROUTES.perimenopause,
});

function routeKey(value) {
  try { value = decodeURIComponent(value); } catch { return null; }
  return value.replace(/^(?:\.\/)+/, '').replace(/^\/+|\/+$/g, '').replace(/\/index\.html$/, '');
}

function makeRouteMap(root = __dirname) {
  const routes = new Map();
  const indexFile = path.join(root, 'source-content', 'page-index.json');
  if (fs.existsSync(indexFile)) {
    for (const item of JSON.parse(fs.readFileSync(indexFile, 'utf8'))) {
      if (/^(?:checklist\/|hormone-symptom-checklist-|symptom-checklist-for-)|^(?:thyroid-assessment|menopause-quiz)$/.test(item.key)) {
        routes.set(item.key, item.route);
      }
    }
  }
  for (const route of Object.values(CANONICAL_ROUTES)) routes.set(routeKey(route), route);
  for (const [alias, route] of Object.entries(FORM_ALIASES)) routes.set(alias, route);
  // Redirects observed in the original crawl; these remain distinct assessments/articles.
  routes.set('symptom-checklist', 'checklist/hormone-symptom-checklist/index.html');
  return routes;
}

const ROUTE_MAP = makeRouteMap();

function localizeURL(value, routes = ROUTE_MAP) {
  let local = value;
  if (/^(?:https?:)?\/\//i.test(value)) {
    let url;
    try { url = new URL(value.startsWith('//') ? 'https:' + value : value); } catch { return value; }
    if (!/^(?:www\.)?hrt\.org$/i.test(url.hostname) || !/^https?:$/.test(url.protocol)) return value;
    // Retain literal query/hash encoding, including HTML &amp; entities.
    local = value.replace(/^(?:https?:)?\/\/(?:www\.)?hrt\.org(?=\/|[?#]|$)/i, '');
  } else if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('#') || value.startsWith('?')) {
    return value;
  }
  const suffixAt = local.search(/[?#]/);
  const pathname = suffixAt < 0 ? local : local.slice(0, suffixAt);
  const suffix = suffixAt < 0 ? '' : local.slice(suffixAt);
  const target = routes.get(routeKey(pathname));
  return target ? target + suffix : value;
}

function localizeText(text, routes = ROUTE_MAP) {
  // Absolute source URLs also occur in JSON-serialized article bodies.
  text = text.replace(/(?:https?:)?\/\/(?:www\.)?hrt\.org(?:\/[^\s"'<>\\`)]*)?/gi, value => localizeURL(value, routes));
  // Normalize existing local aliases only in href attributes/React properties.
  // Handles ordinary HTML/JSX, compiled JS, and escaped HTML inside JSON strings.
  return text.replace(/(\bhref\s*(?:=|:)\s*\{?\s*(?:\\?["']))([^"'\\\s<>]+)((?:\\?["']))/g,
    (all, before, value, after) => before + localizeURL(value, routes) + after);
}

function run(root = __dirname) {
  const routes = makeRouteMap(root);
  const excluded = new Set(['node_modules', 'source-content', 'scraps', 'uploads', '.git', '.tools', '.agents', '.codex', '.aws', 'dist', '.vercel']);
  let examined = 0, changed = 0;
  function walk(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (excluded.has(item.name)) continue;
      const file = path.join(dir, item.name);
      if (item.isDirectory()) { walk(file); continue; }
      const relative = path.relative(root, file).replaceAll('\\', '/');
      const published = relative.endsWith('.html') || /^assets\/.*\.js$/.test(relative);
      const editable = dir === root && (relative.endsWith('.jsx') || relative === 'site-shell.json');
      if (!published && !editable) continue;
      examined++;
      const before = fs.readFileSync(file, 'utf8');
      const after = localizeText(before, routes);
      if (after !== before) { fs.writeFileSync(file, after); changed++; }
    }
  }
  walk(root);
  console.log(`Localized checklist links in ${changed} of ${examined} published/editable files.`);
  return { examined, changed };
}

module.exports = { CANONICAL_ROUTES, FORM_ALIASES, ROUTE_MAP, makeRouteMap, localizeURL, localizeText, run };
if (require.main === module) run();
