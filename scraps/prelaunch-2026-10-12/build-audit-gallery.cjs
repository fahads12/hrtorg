const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const here = __dirname;
const workspace = path.resolve(here, '../..');
const rel = p => path.relative(workspace, p).replace(/\\/g, '/');
const read = p => JSON.parse(fs.readFileSync(path.join(here, p), 'utf8'));
const key = r => `${r.route}|${r.width}`;
const rootReview = read('main/root-visual-review.json');
const initialReviews = new Set([
  ...rootReview.initial,
  ...read('main/content-visual-review.json').filter(r => r.actualVisualReview).map(key),
  ...read('main/technical-visual-review.json').rows.map(key),
]);
const main = new Map(read('main/coverage.json').map(r => [key(r), {
  route:r.route, width:r.width, status:r.status,
  screenshot:rel(path.join(here, 'main', r.screenshot)),
  montage:rel(path.join(here, 'main', `sheet-${path.parse(r.screenshot).name}.jpg`)),
  visualReviewed:initialReviews.has(key(r)), preview:r.finalUrl,
  captureStage:'stable source preview',
}]));
const postfixReviews = new Set(rootReview.postfix);
for (const r of read('main/postfix/coverage.json')) {
  assert(postfixReviews.has(key(r)), `Unreviewed postfix ${key(r)}`);
  main.set(key(r), {...main.get(key(r)), status:r.status,
    screenshot:rel(path.join(here, 'main/postfix', r.screenshot)),
    montage:rel(path.join(here, 'main/postfix', `sheet-${path.parse(r.screenshot).name}.jpg`)),
    visualReviewed:true, preview:r.finalUrl, captureStage:'candidate dist after local fixes'});
}
const finalReviews = new Set(['root','content','technical'].flatMap(owner => {
  const data = read(`main/dedup/${owner}-visual-review.json`);
  return (data.rows || data).filter(r => r.visualReviewed).map(key);
}));
for (const r of read('main/dedup/coverage.json')) {
  assert(finalReviews.has(key(r)), `Unreviewed service ${key(r)}`);
  main.set(key(r), {...main.get(key(r)), status:r.status,
    screenshot:rel(path.join(here, 'main/dedup', r.screenshot)),
    montage:rel(path.join(here, 'main/dedup', `sheet-${path.parse(r.screenshot).name}.jpg`)),
    visualReviewed:true, preview:r.finalUrl, captureStage:'final dist after FAQ deduplication'});
}
assert.equal(main.size, 120);
fs.writeFileSync(path.join(here, 'main/final-coverage.json'), JSON.stringify([...main.values()], null, 2));
const technical = read('technical.json');
const metadata = new Map(technical.routes.map(r => [r.route, r]));
const unsupported = new Set([
  'checklist/erectile-dysfunction-ed-symptom-checklist/index.html',
  'checklist/general-nutritional-nutrient-deficiency-symptom-checklist/index.html',
  'checklist/new-patient-health-supplement-required-intake-information/index.html',
  'checklist/weight-loss/index.html', 'menopause-quiz/index.html'
]);
const externalForms = new Set([
  'checklist/erectile-dysfunction-ed-symptom-checklist/index.html',
  'checklist/weight-loss/index.html','menopause-quiz/index.html'
]);
function note(route) {
  if (route.startsWith('glp-1/') && route !== 'glp-1/ozempic-vs-wegovy/index.html') return 'Owner dependency: source content unavailable; noindex';
  if (externalForms.has(route)) return 'Original official Typeform handoff restored; external submission/results unverified; noindex';
  if (unsupported.has(route)) return 'Owner dependency: unsupported legacy workflow; truthful handoff, noindex';
  if (route === 'health/hrt-hormone-replacement-therapy-for-men/index.html') return 'Owner dependency: empty References section needs approved citations';
  if (route === 'Shop.html') return 'External Shopify entry only; checkout untested; external image/wrapping observations';
  if (route === '404.html') return 'Direct asset URL returns200; nonexistent routes separately verified as404';
  if (route === 'Consultation.html') return 'Local preparation only; real portal intake/booking untested';
  return '';
}
const rows = [
  ...[...main.values()].map(r => ({...r,scope:'Main and services'})),
  ...read('content/final-coverage.json').map(r => ({...r,scope:'Support, forms and policies'})),
  ...read('articles/final-coverage.json').map(r => ({...r,scope:'Articles and Resources'})),
].map(r => {
  const base = r.route.split('?')[0], meta = metadata.get(base);
  assert(meta, `No final metadata: ${base}`);
  assert(r.visualReviewed === true, `Not visually reviewed: ${key(r)}`);
  assert(fs.existsSync(path.join(workspace, r.screenshot)), `Missing image: ${r.screenshot}`);
  if (r.montage && !fs.existsSync(path.join(workspace, r.montage))) delete r.montage;
  return {...r, browser:'Chrome 154.0.8037.98', emulated:true, viewportHeight:r.scope==='Main and services'?900:1000,
    finalTechnicalCheck:meta.issues.length ? 'issues' : 'pass',
    title:meta.title, canonical:meta.canonical, robots:meta.robots,
    captureStage:r.captureStage||(r.evidence==='dist'?'final dist':r.evidence==='source'?'stable source preview':r.preview?.includes('8013')?'candidate dist':'source preview'),
    note:[note(r.route),r.note].filter(Boolean).join(' '), screenshot:r.screenshot.replace(/\\/g,'/')};
}).sort((a,b) => a.route.localeCompare(b.route) || b.width-a.width);
assert.equal(rows.length,963);
assert.equal(new Set(rows.map(key)).size,963);
assert.equal(new Set(rows.map(r=>r.route)).size,321);
assert.equal(new Set(rows.map(r=>r.route.split('?')[0])).size,306);
for (const route of metadata.keys()) for (const width of [1440,768,390]) assert(rows.some(r=>r.route===route && r.width===width), `Missing exact default ${route}|${width}`);
const ledger = {generatedAt:new Date().toISOString(), date:'2026-10-12', timezone:'Asia/Karachi',
  assessment:'not ready', htmlRoutes:306, queryVariants:15, routeCases:321, viewportCases:963,
  method:'Actual full-height screenshot review through full-page composition sheets and contiguous section montages, supplemented by focused state/section views. Not exhaustive medical/legal proofreading.',
  limits:'Desktop browser viewport emulation; not physical devices. All-route Chrome review; Edge six-page mobile smoke only. Mixed stable-source and affected final-dist captures; all 306 final dist pages receive separate technical scan.', rows};
fs.writeFileSync(path.join(here,'route-checklist.json'),JSON.stringify(ledger,null,2));
const fields = ['route','width','viewportHeight','scope','status','visualReviewed','finalTechnicalCheck','browser','emulated','captureStage','screenshot','montage','note'];
const csv = v => `"${String(v??'').replace(/"/g,'""')}"`;
fs.writeFileSync(path.join(here,'route-checklist.csv'),'\uFEFF'+fields.join(',')+'\n'+rows.map(r=>fields.map(f=>csv(r[f])).join(',')).join('\n')+'\n');
const data = JSON.stringify(rows).replace(/</g,'\\u003c');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HRT prelaunch audit evidence — 12 October 2026</title><style>
:root{font-family:system-ui,sans-serif;color:#102a43;background:#f5f7f9}body{margin:0}main{max-width:1300px;padding:32px 22px;margin:auto}h1{font-size:clamp(28px,4vw,44px);margin:0 0 12px}p{line-height:1.6;max-width:1000px}a{color:#075777}a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #b45309;outline-offset:3px}.status{padding:14px 18px;background:#fff1da;border-left:5px solid #8b4000}.stats{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0}.stats span{background:#fff;padding:14px 18px;border:1px solid #cad5df;border-radius:8px}.filters{display:flex;flex-wrap:wrap;gap:14px;padding:18px;background:white;border:1px solid #cad5df;border-radius:8px}.filters label{display:grid;gap:6px;font-weight:600}.filters input,.filters select{min-height:42px;font:inherit;border:1px solid #657b8c;border-radius:4px;padding:0 10px}.filters input{width:min(420px,75vw)}.tablewrap{overflow-x:auto;background:#fff;border:1px solid #cad5df;margin-top:16px}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:12px;vertical-align:top;border-bottom:1px solid #dbe3e9}th{background:#e7eef4}td:first-child{min-width:190px;overflow-wrap:anywhere}td:last-child{min-width:220px}small{display:block;color:#465c6f;margin-top:5px}td a{display:inline-block;min-height:30px;margin-right:10px}.pass{color:#176238}.notice{color:#783b00}footer{margin-top:28px;font-size:14px;color:#465c6f}</style>
<main><h1>HRT.org prelaunch audit evidence</h1><p>12 October 2026 · Local source and publish-output review · No deployment or live submissions.</p><p class="status"><strong>Launch assessment: not ready.</strong> Resolve missing content and unsupported workflows, confirm medical/business statements, and verify authorized backend delivery and real production behavior before launch.</p>
<div class="stats"><span><strong>306</strong> public HTML files</span><span><strong>15</strong> extra query variants</span><span><strong>963</strong> reviewed route/viewport cases</span><span><strong>3</strong> emulated widths</span></div>
<p>Every case below has an actually inspected full-page screenshot. Full-page composition sheets, contiguous section montages and readable close-ups aided review. This is a composition and functional audit, not exhaustive clinical or legal proofreading. Chrome 154.0.8037.98 was used at 1440, 768 and 390 pixels wide (900px viewport height for main/services; 1000px for articles/support); Edge has a separate six-page smoke check. Physical devices, Safari and Firefox were not tested. Screenshots combine stable source-preview captures with refreshed captures for affected final-build pages; final technical checks cover all 306 published pages.</p>
<p><a href="../../PRELAUNCH-AUDIT.md">Launch report</a> · <a href="route-checklist.csv">CSV checklist</a> · <a href="route-checklist.json">JSON ledger</a> · <a href="main/REPORT.md">Main journeys</a> · <a href="content/REPORT.md">Support and assessments</a> · <a href="articles/REPORT.md">Articles and Resources</a></p>
<div class="filters"><label>Find a route or issue<input id="search" type="search" placeholder="e.g. menopause, hair, noindex"></label><label>Viewport<select id="width"><option value="">All widths</option><option>1440</option><option>768</option><option>390</option></select></label><label>Scope<select id="scope"><option value="">All pages</option><option>Main and services</option><option>Support, forms and policies</option><option>Articles and Resources</option></select></label><label>Owner dependencies<select id="issues"><option value="">All cases</option><option value="yes">Cases with a recorded note</option></select></label></div>
<p id="count" role="status" aria-live="polite"></p><div class="tablewrap"><table><thead><tr><th scope="col">Route</th><th scope="col">Width</th><th scope="col">Check</th><th scope="col">Evidence</th><th scope="col">Notes</th></tr></thead><tbody id="rows"></tbody></table></div><noscript><p>Use the CSV or JSON checklist to inspect all evidence when JavaScript is unavailable.</p></noscript><footer>This folder is private audit evidence and excluded from dist. HTTP 200 for an unavailable-content page means its fallback renders; it does not mean the missing content or workflow is ready. Direct404.html is a200 asset; actual missing routes were separately checked for HTTP 404.</footer></main>
<script>const rows=${data};const prefix='scraps/prelaunch-2026-10-12/';const el=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const href=p=>p.startsWith(prefix)?p.slice(prefix.length):'../../'+p;function render(){const q=el('search').value.toLowerCase(),w=el('width').value,s=el('scope').value,i=el('issues').value;const found=rows.filter(r=>(!w||String(r.width)===w)&&(!s||r.scope===s)&&(!i||r.note)&&[r.route,r.note,r.title,r.robots].join(' ').toLowerCase().includes(q));el('count').textContent=found.length+' of '+rows.length+' reviewed cases';el('rows').innerHTML=found.map(r=>'<tr><td>'+esc(r.route)+'<small>'+esc(r.scope)+'</small></td><td>'+r.width+'px</td><td><span class="pass">Visually reviewed</span><small>HTTP '+r.status+' · Final technical '+esc(r.finalTechnicalCheck)+'</small></td><td><a href="'+esc(href(r.screenshot))+'">Full screenshot</a>'+(r.montage?'<a href="'+esc(href(r.montage))+'">Review sheet / montage</a>':'')+'<small>'+esc(r.captureStage||'See scope report for capture stage')+'</small></td><td class="notice">'+esc(r.note||'No route-specific blocker recorded; global launch dependencies still apply.')+'</td></tr>').join('')}['search','width','scope','issues'].forEach(id=>el(id).addEventListener('input',render));render();</script></html>`;
fs.writeFileSync(path.join(here,'index.html'),html);
console.log(JSON.stringify({routeCases:321,viewportCases:rows.length,reviewed:rows.filter(r=>r.visualReviewed).length,filesVerified:true}));
