const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const out = __dirname;
const widths = [1440, 768, 390];
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const optional = p => fs.existsSync(path.join(root, p)) ? read(p) : null;
const inventory = require(path.join(root, 'public-pages.cjs'))(root).map(p => path.relative(root, p).replaceAll('\\', '/')).sort();
const slash = p => p.replaceAll('\\', '/');
const artifact = (p, base) => p ? (slash(p).startsWith('scraps/') ? slash(p) : path.posix.join(base, slash(p))) : null;
const local = p => p ? slash(path.relative(out, path.join(root, p))) : null;
const evidence = new Map();
const reports = [];
function add(route, width, item) {
  const key = route + '|' + width;
  if (!evidence.has(key)) evidence.set(key, []);
  evidence.get(key).push(item);
}
function report(p, label) { reports.push({path:p, href:local(p), label}); }
function notesOf(review) {
  if (typeof review === 'string') return review;
  if (!review) return '';
  return [review.method || review.status, review.reviewedOn ? 'Reviewed '+review.reviewedOn : ''].filter(Boolean).join(' — ');
}
function isReviewed(review) {
  const text = notesOf(review);
  return /reviewed|inspected/i.test(text) && !/pending|not reviewed|not yet/i.test(text);
}
function issues(row) {
  return {
    consoleErrors:row.errors?.length || 0,
    brokenImages:row.brokenImages?.length || 0,
    horizontalOverflow:typeof row.overflow === 'boolean' ? row.overflow : Array.isArray(row.overflow) ? row.overflow.length > 0 : (row.overflow || 0) > 0,
    failedRequests:(row.failed || row.requestFailures || []).length,
  };
}

const articlePath = 'scraps/prelaunch/articles/review-status.json';
const article = read(articlePath);
report(articlePath, 'Article and resource visual-review ledger');
for (const r of article.rows) add(r.route, r.width, {
  source:articlePath, group:'Articles and resources', stage:'initial', kind:'browser-and-visual',
  direct:true, reload:false, status:r.status, ...issues(r),
  visualReview:isReviewed(r.visualReview) ? 'overview-reviewed' : 'not-recorded', notes:notesOf(r.visualReview),
  screenshot:artifact(r.screenshot, 'scraps/prelaunch/articles'),
  reviewSheet:artifact(r.overviewSheet, 'scraps/prelaunch/articles/sheets'),
  readableSectionReview:r.selectedReadableCropReview ? 'Selected representative readable crops reviewed; not every paragraph.' : null,
});
const articleRecheckPath = 'scraps/prelaunch/articles/recheck/results.json';
const articleRecheck = optional(articleRecheckPath);
if (articleRecheck) {
  report(articleRecheckPath, 'Article and resource post-fix screenshots');
  const finalRows = article.finalBuild?.rows || articleRecheck.results || articleRecheck.rows || [];
  for (const r of finalRows) {
    const reviewed = isReviewed(r.visualReview);
    add(r.route, r.width, {
      source:articleRecheckPath, group:'Articles and resources', stage:'post-fix', kind:'browser-and-visual',
      direct:true, reload:false, status:r.status ?? null, ...issues(r),
      visualReview:reviewed ? 'fresh-overview-reviewed' : 'capture-not-yet-reviewed',
      notes:notesOf(r.visualReview),
      screenshot:artifact(r.screenshot,article.finalBuild?.rows ? 'scraps/prelaunch/articles' : 'scraps/prelaunch/articles/recheck'),
      reviewSheet:r.overviewSheet ? artifact(r.overviewSheet,'scraps/prelaunch/articles') : null,
      readableSectionReview:r.selectedReadableCropsReviewed?.length ? 'Selected readable crops reviewed: '+r.selectedReadableCropsReviewed.join(', ') : null,
    });
  }
}
const staticPath = 'scraps/prelaunch/articles/recheck/static-routes.json';
const staticRows = optional(staticPath) || [];
report(staticPath, 'All article/resource final static-route checks (not visual)');
for (const r of article.finalBuild?.targetedCssRecheck?.rows || []) add(r.route,r.width,{
  source:articlePath,group:'Articles and resources',stage:'latest-targeted',kind:'browser-and-section-visual',
  direct:true,reload:false,status:null,...issues(r),visualReview:'readable-crop-reviewed',notes:notesOf(r.visualReview),
  sections:[{path:artifact(r.screenshot,'scraps/prelaunch/articles'),visualReview:isReviewed(r.visualReview)?'readable-crop-reviewed':'captured-not-individually-recorded-as-reviewed'}],
});

const formsPath = 'scraps/prelaunch/forms-info/report.json';
report(formsPath, 'Information, policies and assessment initial review');
for (const r of read(formsPath)) add(r.route,r.width,{
  source:formsPath, group:'Information, policies and assessments', stage:'initial', kind:'browser-and-visual',
  direct:true,reload:false,status:r.status,...issues(r),
  visualReview:isReviewed(r.visualReview) ? 'overview-reviewed' : 'not-recorded', notes:notesOf(r.visualReview),
  screenshot:artifact(r.screenshot,'scraps/prelaunch/forms-info'),
  reviewSheet:artifact(r.visualReview?.evidence,'scraps/prelaunch/forms-info'),
});
const formsFinalPath = 'scraps/prelaunch/forms-info/final/report.json';
const formsFinal = read(formsFinalPath);
report(formsFinalPath, 'Information, policies and assessment final refresh checks');
const readSections = new Set([
  'Privacy Policy.html|390|middle','Privacy Policy.html|1440|middle',
  'Terms and Conditions.html|390|middle','Terms and Conditions.html|768|middle',
  'legal/health-information-privacy-practices/index.html|390|middle','legal/health-information-privacy-practices/index.html|1440|middle',
  'legal/consent-to-telehealth/index.html|390|middle','legal/consent-to-telehealth/index.html|768|middle',
]);
for (const r of formsFinal.rows) add(r.route,r.width,{
  source:formsFinalPath,group:'Information, policies and assessments',stage:'post-fix',kind:r.screenshot ? 'browser-and-visual' : 'browser-only',
  direct:true,reload:!!r.refreshURL,status:r.status,...issues(r),
  visualReview:r.screenshot && r.visualReview?.status === 'reviewed-after-changes' ? 'fresh-overview-reviewed' : 'final-DOM-only-initial-visual-retained',
  notes:notesOf(r.visualReview),screenshot:artifact(r.screenshot,'scraps/prelaunch/forms-info/final'),
  sections:(r.sections || []).map(p=>({path:artifact(p,'scraps/prelaunch/forms-info/final'),visualReview:readSections.has(`${r.route}|${r.width}|${p.split('-').pop().replace('.png','')}`) ? 'readable-crop-reviewed' : 'captured-not-individually-recorded-as-reviewed'})),
});
const handoffPath = 'scraps/prelaunch/forms-info/handoffs/report.json';
const handoffs = read(handoffPath);
report(handoffPath, 'Latest information-page CTA and handoff verification');
for (const r of handoffs.rows) add(r.route,r.width,{
  source:handoffPath,group:'Information, policies and assessments',stage:'latest-targeted',kind:'browser-and-visual',
  direct:true,reload:false,status:null,checksPassed:r.passed,
  visualReview:isReviewed(r.visualReview) ? 'fresh-overview-reviewed' : 'capture-not-yet-reviewed',notes:handoffs.visualReview,
  screenshot:artifact(r.screenshot,'scraps/prelaunch/forms-info/handoffs'),
});
for (const [p, stage] of [['scraps/prelaunch/main-services/coverage.json','initial'],['scraps/prelaunch/main-services/final/coverage.json','post-fix']]) {
  const rows = optional(p);
  if (!rows) continue;
  report(p,stage === 'initial' ? 'Main pages and services initial review' : 'Main pages and services final review');
  for (const r of Array.isArray(rows) ? rows : rows.rows) add(r.route,r.width,{
    source:p,group:'Main pages and services',stage,kind:'browser-and-visual',
    direct:true,reload:!!(r.reload || r.refreshURL || r.reloaded),status:r.status,...issues(r),
    visualReview:isReviewed(r.visualReview) ? (stage==='initial' ? 'overview-reviewed' : 'fresh-overview-reviewed') : 'capture-not-yet-reviewed',
    notes:notesOf(r.visualReview)+(r.reviewNotes ? ' '+r.reviewNotes : ''),
    screenshot:artifact(r.screenshot,path.posix.dirname(p)),
    reviewSheet:artifact(r.reviewSheet || r.sheet,path.posix.dirname(p)),
  });
}
if(optional('scraps/prelaunch/forms-info/additional-main-review.json')) report('scraps/prelaunch/forms-info/additional-main-review.json','Independent final review of 42 main/service screenshots');
for(const [p,group] of [
  ['scraps/prelaunch/articles/recheck/reloads.json','Articles and resources'],
  ['scraps/prelaunch/main-services/final/reloads.json','Main pages and services'],
]) {
  const d=optional(p);
  if(!d) continue;
  report(p,group+' explicit final direct/refresh audit (browser-only)');
  for(const r of Array.isArray(d)?d:(d.rows||d.results||[])) add(r.route,r.width,{
    source:p,group,stage:'final-reload',kind:'browser-only',
    direct:!!r.initialStatus,reload:true,status:r.status ?? null,checksPassed:r.pass ?? r.passed ?? null,
    consoleErrors:(r.pageErrors||r.errors||[]).length,
    horizontalOverflow:r.documentWidth>r.viewport,
    routeMatches:r.routeMatches ?? null,
    visualReview:'browser-only-no-new-pixel-review',
    notes:'Explicit direct navigation and page refresh. This records browser assertions, not a new screenshot or pixel review.',
  });
}

const queryRoutes = [...new Set([...evidence.keys()].map(k=>k.slice(0,k.lastIndexOf('|'))).filter(r=>r.includes('?')))].sort();
const routeRows = [...inventory.map(route=>({route,type:'public-html'})),...queryRoutes.map(route=>({route,type:'query-variant'}))].map(({route,type})=>{
  const views = widths.map(width=>{
    const events = evidence.get(route+'|'+width) || [];
    const visual = events.filter(e=>/^(overview-reviewed|fresh-overview-reviewed)$/.test(e.visualReview));
    const fresh = visual.filter(e=>e.stage!=='initial');
    const screenshots = events.filter(e=>e.screenshot);
    return {
      width, directChecked:events.some(e=>e.direct), reloadChecked:events.some(e=>e.reload),
      initialOverviewReviewed:visual.some(e=>e.stage==='initial'), freshFullPageReviewed:fresh.length>0,
      readableSectionReviewed:events.some(e=>e.readableSectionReview || e.sections?.some(s=>s.visualReview==='readable-crop-reviewed')),
      capturedNotYetReviewed:events.some(e=>e.stage!=='initial' && e.screenshot && e.visualReview==='capture-not-yet-reviewed'),
      latestVisualScreenshot:(fresh.at(-1) || visual.at(-1))?.screenshot || null,
      latestCapturedScreenshot:screenshots.at(-1)?.screenshot || null,
      evidence:events,
    };
  });
  const relatedVariants=type==='public-html' ? queryRoutes.filter(r=>r.split('?')[0]===route) : [];
  return {
    route,type,group:views.flatMap(v=>v.evidence)[0]?.group || 'Exact default route not recorded',
    file:route.split('?')[0], relatedVariants,
    exactRouteRepresented:views.some(v=>v.evidence.length),fileRepresented:views.some(v=>v.evidence.length)||relatedVariants.length>0,
    missingDirectWidths:views.filter(v=>!v.directChecked).map(v=>v.width),
    missingVisualWidths:views.filter(v=>!v.initialOverviewReviewed&&!v.freshFullPageReviewed).map(v=>v.width),
    notFreshReviewedWidths:views.filter(v=>!v.freshFullPageReviewed).map(v=>v.width),
    finalStaticCheck:staticRows.find(r=>r.route===route) || null,
    viewports:views,
  };
});
const pages=routeRows.filter(r=>r.type==='public-html');
const gaps={
  unrepresentedPublicFiles:pages.filter(r=>!r.fileRepresented).map(r=>r.route),
  exactRoutesMissingChecks:routeRows.filter(r=>r.missingDirectWidths.length).map(r=>({route:r.route,widths:r.missingDirectWidths,relatedVariants:r.relatedVariants})),
  missingVisualReview:routeRows.filter(r=>r.missingVisualWidths.length).map(r=>({route:r.route,widths:r.missingVisualWidths})),
  finalCapturesPendingVisualReview:routeRows.flatMap(r=>r.viewports.filter(v=>v.capturedNotYetReviewed).map(v=>({route:r.route,width:v.width}))),
  reloadAssertionFailures:routeRows.flatMap(r=>r.viewports.flatMap(v=>v.evidence.filter(e=>e.stage==='final-reload'&&e.checksPassed===false).map(e=>({route:r.route,width:v.width,source:e.source})))),
};
const paths = new Set();
for(const r of routeRows) for(const v of r.viewports) for(const e of v.evidence) {
  [e.screenshot,e.reviewSheet,...(e.sections||[]).map(s=>s.path)].filter(Boolean).forEach(p=>paths.add(p));
}
gaps.missingArtifactFiles=[...paths].filter(p=>!fs.existsSync(path.join(root,p)));
const data={
  generatedAt:new Date().toISOString(),inventorySource:'public-pages.cjs',viewports:widths,
  summary:{
    publicHTML:inventory.length, publicFilesRepresented:pages.filter(r=>r.fileRepresented).length,
    exactPublicRoutesRepresented:pages.filter(r=>r.exactRouteRepresented).length,queryVariants:queryRoutes.length,
    exactRouteViewportSlots:routeRows.length*widths.length,
    directCheckedSlots:routeRows.reduce((n,r)=>n+r.viewports.filter(v=>v.directChecked).length,0),
    reloadCheckedSlots:routeRows.reduce((n,r)=>n+r.viewports.filter(v=>v.reloadChecked).length,0),
    actualVisualReviewedSlots:routeRows.reduce((n,r)=>n+r.viewports.filter(v=>v.initialOverviewReviewed||v.freshFullPageReviewed).length,0),
    freshVisualReviewedSlots:routeRows.reduce((n,r)=>n+r.viewports.filter(v=>v.freshFullPageReviewed).length,0),
    finalStaticRoutesChecked:staticRows.length,
  },
  limits:[
    'This is a route and responsive-layout evidence ledger, not clinical approval or word-by-word proofreading of all content.',
    'Initial visual review means actual full-page overview/contact-sheet review. Readable section crops are representative and separately labeled.',
    'A final direct/refresh DOM check is not a fresh pixel review. Captured screenshots are not counted reviewed until explicitly confirmed.',
    'File coverage can include query variants; default no-query URLs and all query variants are listed independently.',
    'Tests used Chrome desktop emulation at 1440, 768 and 390 pixels; live orders, bookings, emails and external record creation were blocked or mocked.',
    'Fresh review means post-fix artifact review at the recorded stage; later coordinated builds may include unrelated shared changes. It does not assert every route was recaptured after every build.',
  ],gaps,reports,pages,queryVariants:routeRows.filter(r=>r.type==='query-variant'),
};
fs.writeFileSync(path.join(out,'route-checklist.json'),JSON.stringify(data,null,2)+'\n');
const columns=['route','type','group','width','direct_checked','reload_checked','initial_overview_reviewed','fresh_full_page_reviewed','readable_section_reviewed','capture_pending_review','latest_reviewed_screenshot','latest_captured_screenshot','evidence_reports'];
const csvCell=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const csv=[columns,...routeRows.flatMap(r=>r.viewports.map(v=>[r.route,r.type,r.group,v.width,v.directChecked,v.reloadChecked,v.initialOverviewReviewed,v.freshFullPageReviewed,v.readableSectionReviewed,v.capturedNotYetReviewed,v.latestVisualScreenshot,v.latestCapturedScreenshot,[...new Set(v.evidence.map(e=>e.source))].join('; ')]))].map(row=>row.map(csvCell).join(',')).join('\r\n');
fs.writeFileSync(path.join(out,'route-checklist.csv'),'\ufeff'+csv+'\r\n');
const galleryData={...data,pages:routeRows.map(r=>({...r,viewports:r.viewports.map(v=>({...v,evidence:v.evidence.map(e=>({...e,href:local(e.screenshot),sheetHref:local(e.reviewSheet),sourceHref:local(e.source),sections:(e.sections||[]).map(s=>({...s,href:local(s.path)}))}))}))})),queryVariants:undefined};
const template=fs.readFileSync(path.join(out,'route-gallery-template.html'),'utf8');
fs.writeFileSync(path.join(out,'index.html'),template.replace('/* AUDIT_DATA */',JSON.stringify(galleryData).replaceAll('<','\\u003c')));
fs.writeFileSync(path.join(out,'consolidation-status.json'),JSON.stringify({summary:data.summary,gaps:data.gaps},null,2)+'\n');
console.log(JSON.stringify({summary:data.summary,gaps:data.gaps},null,2));
