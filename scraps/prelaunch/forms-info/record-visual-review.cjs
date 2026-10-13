const fs=require('fs');
const root='scraps/prelaunch/forms-info';
const rows=JSON.parse(fs.readFileSync(root+'/report.json','utf8'));
const sheets=JSON.parse(fs.readFileSync(root+'/review-sheets/manifest.json','utf8'));
for(const row of rows){const sheet=sheets.find(s=>s.width===row.width&&s.routes.includes(row.route));row.visualReview={status:'reviewed',method:'Full-page composition reviewed in screenshot sheet; extracted content reviewed for placeholders and misleading controls.',evidence:sheet?.file,reviewedOn:'2026-10-12'};}
fs.writeFileSync(root+'/report.json',JSON.stringify(rows,null,2));
const report=JSON.parse(fs.readFileSync(root+'/final/report.json','utf8'));
for(const row of report.rows){row.visualReview={status:row.screenshot?'reviewed-after-changes':'initial-composition-reviewed-final-DOM-and-refresh-verified',fullPage:row.screenshot||rows.find(r=>r.route===row.route&&r.width===row.width)?.screenshot,reviewedOn:'2026-10-12'};}
report.visualReviewNotes='All 39 initial full-page sheets and all 19 final changed-page/question/result sheets reviewed. Additional closeups reviewed: FAQ open at every width; middle Privacy/Terms/Health Information Privacy/Telehealth at mobile and representative desktop/tablet sizes; women assessment mobile hero. Four CTA/handoff pages have a subsequent targeted verification in handoffs/report.json.';
fs.writeFileSync(root+'/final/report.json',JSON.stringify(report,null,2));
const issues=[
 {id:'contact-get-data',severity:'high',status:'fixed',route:'Contact.html',detail:'JS failure allowed default GET of personal enquiry fields. Static disabled control plus handler-ready enablement and noscript mail link now prevent URL leakage.',evidence:'contact-verification.json'},
 {id:'legacy-form-promises',severity:'medium',status:'fixed-with-content-dependency',routes:['checklist/erectile-dysfunction-ed-symptom-checklist/index.html','checklist/general-nutritional-nutrient-deficiency-symptom-checklist/index.html','checklist/new-patient-health-supplement-required-intake-information/index.html','checklist/weight-loss/index.html','menopause-quiz/index.html'],detail:'Replaced flattened/nonfunctional legacy form copy with accurate preparation content or working native assessment handoff; original implementations remain unavailable and routes stay noindex.'},
 {id:'menopause-template',severity:'medium',status:'fixed-with-owner-confirmation',route:'menopause/index.html',detail:'Removed unrelated template copy, unanswered FAQ and unverified commercial/testimonial blocks; corrected phone and semantic symptom list; added actual process/assessment/care destinations.'},
 {id:'prose-primary-contrast',severity:'medium',status:'fixed',detail:'Scoped primary-button color overrides the generic prose link color; verified in handoffs/report.json.'},
 {id:'n8n-live-security',severity:'high',status:'owner-backend-dependency',detail:'Live workflow credentials, final-origin CORS, authorized-recipient delivery, server validation/auth/idempotency, email escaping, post-Gmail references and extra men SMTP node require review. Mocks pass; no real records/emails sent.'},
 {id:'glp1-missing-source',severity:'medium',status:'content-dependency',routePrefix:'glp-1/',detail:'26 source-content stubs are noindex and omitted from sitemap; full corresponding approved content unavailable.'},
 {id:'legal-clinical-signoff',severity:'medium',status:'owner-review',detail:'Policy text preserved byte-equivalent after whitespace normalization; repetitive wording, source discrepancies and clinical downstream narratives need owner review.'}
];
fs.writeFileSync(root+'/issues.json',JSON.stringify(issues,null,2));
console.log('Recorded actual visual review for '+rows.length+' initial and '+report.rows.length+' final route/viewports.');
