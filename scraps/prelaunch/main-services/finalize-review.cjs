const fs=require('fs'),path=require('path');
const base='scraps/prelaunch/main-services',file=base+'/final/coverage.json';
const rows=JSON.parse(fs.readFileSync(file,'utf8')), additional=JSON.parse(fs.readFileSync('scraps/prelaunch/forms-info/additional-main-review.json','utf8')).rows;
const extra=new Map(additional.map(r=>[r.route+'|'+r.width,r]));
for(const row of rows){const other=extra.get(row.route+'|'+row.width);row.visualReview='actually reviewed full-height section montage';row.visualReviewer=other?'prelaunch_forms_info':'prelaunch_main_services';row.visualReviewDate='2026-10-12';row.visualReviewScope='Full-page composition at captured viewport; selected readable text, image, button, card and footer inspection. Not a clinical content approval.';row.reviewSheet='scraps/prelaunch/main-services/final/sheet-'+row.screenshot;row.visualNotes=other?other.notes:'No remaining local overlap, clipping, broken images or misaligned cards observed. See report for content and external integration limitations.';}
fs.writeFileSync(file,JSON.stringify(rows,null,2)+'\n');
console.log({rows:rows.length,reviewed:rows.filter(r=>r.visualReview.startsWith('actually')).length,independentReviews:additional.length,local:rows.filter(r=>r.route!=='Shop.html').length,localErrors:rows.filter(r=>r.route!=='Shop.html'&&((r.errors||[]).length||(r.brokenImages||[]).length||r.overflow))});

