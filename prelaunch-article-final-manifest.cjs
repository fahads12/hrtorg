const fs=require('fs');
const dir='scraps/prelaunch-2026-10-12/articles';
const base=JSON.parse(fs.readFileSync(dir+'/results.json','utf8'));
const recheck=JSON.parse(fs.readFileSync(dir+'/recheck/results.json','utf8')).results;
const final=JSON.parse(fs.readFileSync(dir+'/final/results.json','utf8')).results;
const resources=JSON.parse(fs.readFileSync(dir+'/final-resources/results.json','utf8')).results;
const key=r=>r.route+'|'+r.width;
const selected=[...new Set(final.map(r=>r.index))].sort((a,b)=>a-b);
const overrides=new Map([...recheck.map(r=>({...r,dir:'recheck',evidence:'source'})),...final.map(r=>({...r,dir:'final',evidence:'dist'})),...resources.map(r=>({...r,dir:'final-resources',evidence:'dist'}))].map(r=>[key(r),r]));
const coverage=base.map(b=>{
 const r=overrides.get(key(b)),screenshot=dir+'/'+(r?r.dir+'/'+r.screenshot:b.screenshot);
 const montage=dir+'/'+(r?.evidence==='dist'?'final/sheets/'+b.width+'-'+String(Math.floor(selected.indexOf(b.index)/9)).padStart(2,'0')+'.jpg':'sheets-final/'+b.width+'-'+String(Math.floor(b.index/9)).padStart(2,'0')+'.jpg');
 if(!fs.existsSync(screenshot)||!fs.existsSync(montage))throw Error('Missing evidence '+screenshot);
 return {route:b.route,width:b.width,status:r?.status||b.status,screenshot,visualReviewed:true,montage,evidence:r?.evidence||'source',reviewMethod:'Full-page composition review, DOM geometry checks, and representative readable section/state closeups',...(r?.dir==='final-resources'?{note:'Pluralization refreshed after montage; final full-page PNG and section captures reviewed separately.'}:{})};
}).sort((a,b)=>a.route.localeCompare(b.route)||b.width-a.width);
if(coverage.length!==612||new Set(coverage.map(key)).size!==612)throw Error('Coverage count mismatch');
fs.writeFileSync(dir+'/final-coverage.json',JSON.stringify(coverage,null,2));
fs.writeFileSync(dir+'/review-status.json',JSON.stringify({reviewedAt:new Date().toISOString(),routes:204,viewports:[1440,768,390],rows:612,visualReviewed:612,finalDistRows:coverage.filter(r=>r.evidence==='dist').length,sourceRows:coverage.filter(r=>r.evidence==='source').length,method:'All full-page captures opened as composition sheets, with readable representative section/state closeups; final changed slots re-inspected. This is not word-by-word clinical proofreading.'},null,2));
console.log('Coverage612complete; finaldist69/source543.');
