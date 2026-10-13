const fs=require('fs');
const path=require('path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../..');
const {CANONICAL_ROUTES,FORM_ALIASES}=require(path.join(root,'localize-checklist-links.cjs'));
const origin='http://localhost:8000';
const entries=[...Object.entries(CANONICAL_ROUTES).map(([id,route])=>({id,route,kind:'canonical'})),...Object.entries(FORM_ALIASES).map(([route,canonical])=>({id:Object.keys(CANONICAL_ROUTES).find(id=>CANONICAL_ROUTES[id]===canonical),route:route+'/index.html',kind:'alias'}))];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:320,height:800},deviceScaleFactor:1});
 const blockedWrites=[];
 await context.route('**/*',route=>{
   const req=route.request(),url=new URL(req.url());
   if(!['GET','HEAD'].includes(req.method())){blockedWrites.push(req.url());return route.abort();}
   if(url.origin!==origin)return route.abort();
   return route.continue();
 });
 const report={width:320,liveSubmissions:0,routes:[],blockedWrites};
 for(const entry of entries){
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(origin+'/'+entry.route,{waitUntil:'networkidle'});
  await page.waitForSelector('#assessment-screen h2');
  await page.locator('.checklist-visual img').evaluate(img=>img.decode());
  const initial=await page.evaluate(()=>({id:window.HRT_ASSESSMENT.id,overflow:document.documentElement.scrollWidth>innerWidth,image:{src:document.querySelector('.checklist-visual img').currentSrc,loaded:document.querySelector('.checklist-visual img').naturalWidth>0}}));
  await page.locator('#assessment-next').click();
  await page.waitForTimeout(1100);
  const question=await page.evaluate(()=>{
   const header=document.querySelector('header.nav').getBoundingClientRect(),title=document.querySelector('#assessment-screen h2').getBoundingClientRect(),option=document.querySelector('#assessment-screen input[type=radio],#assessment-screen input[type=checkbox]');
   const first=option?.closest('label').getBoundingClientRect();
   return{title:document.querySelector('#assessment-screen h2').textContent,optionCount:document.querySelectorAll('#assessment-screen input[type=radio],#assessment-screen input[type=checkbox]').length,overflow:document.documentElement.scrollWidth>innerWidth,navBottom:header.bottom,titleTop:title.top,firstOptionTop:first?.top,titleOverlapsNavigation:title.top<header.bottom,firstOptionOverlapsNavigation:first?first.top<header.bottom:true};
  });
  const item={...entry,status:response.status(),initial,question,errors};
  item.pass=item.status===200&&initial.id===entry.id&&initial.image.loaded&&!initial.overflow&&!question.overflow&&question.optionCount>0&&!question.titleOverlapsNavigation&&!question.firstOptionOverlapsNavigation&&!errors.length;
  if(!item.pass||entry.kind==='canonical')await page.screenshot({path:path.join(__dirname,`320-${entry.id}-${entry.kind}.png`)});
  report.routes.push(item);console.log((item.pass?'PASS':'FAIL')+' '+entry.route+' '+JSON.stringify(question));await page.close();
 }
 report.passed=report.routes.filter(r=>r.pass).length;report.failed=report.routes.length-report.passed;
 fs.writeFileSync(path.join(__dirname,'320-report.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({passed:report.passed,failed:report.failed,blockedWrites}));
})().catch(e=>{console.error(e);process.exitCode=1;});
