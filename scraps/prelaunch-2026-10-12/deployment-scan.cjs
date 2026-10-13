const fs=require('node:fs');
const {chromium}=require('playwright');
const origin='http://localhost:8013',output='scraps/prelaunch-2026-10-12';
(async()=>{
 const redirects=[];
 for(const rule of require('../../vercel.json').redirects) {
  const source=rule.source.includes(':path*')?'/blog-categories/%2520heart-health/index.html':rule.source;
  const r=await fetch(origin+source,{redirect:'manual',method:'HEAD'});
  const target=r.headers.get('location');
  const final=target?.startsWith('/')?await fetch(new URL(target,origin),{method:'HEAD'}):null;
  redirects.push({source,status:r.status,target,expected:rule.destination,finalStatus:final?.status,pass:r.status===(rule.permanent?308:307)&&!!target&&(!final||final.status===200)});
 }
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const queryPaint=[];
 const context=await browser.newContext({viewport:{width:390,height:900}});
 await context.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
 await context.route('**/assets/product-app.js*',r=>r.abort());
 for(const gender of ['women','men'])for(const product of ['hrt','peptides','weight','sexual','hair','ed','invalid']) {
  const page=await context.newPage();await page.goto(`${origin}/Product.html?p=${product}&g=${gender}`,{waitUntil:'networkidle'});
  const initial=await page.locator('.p-page').getAttribute('data-screen-label');
  const h1=await page.locator('main h1').allTextContents();
  const data=await page.evaluate(()=>({gender:document.body.dataset.gender,templateCount:document.querySelectorAll('template').length,overflow:document.documentElement.scrollWidth>innerWidth}));
  queryPaint.push({product,gender,initial,h1,...data});await page.close();
 }
 await context.close();await browser.close();
 let edge=[];
 try {
  const b=await chromium.launch({channel:'msedge',headless:true});
  const c=await b.newContext({viewport:{width:390,height:900}});await c.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
  const routes=['HRT Home.html','Audience.html?g=women','Treatments.html','How It Works.html','Resources.html','Contact.html'];
  fs.mkdirSync(output+'/edge',{recursive:true});
  for(const [index,route] of routes.entries()) {
   const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
   const response=await p.goto(origin+'/'+route,{waitUntil:'networkidle'});
   await p.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}const images=[...document.images].filter(i=>i.getBoundingClientRect().width>0);images.forEach(i=>i.loading='eager');await Promise.all(images.map(i=>i.decode().catch(()=>{})));scrollTo(0,0)});await p.waitForTimeout(500);
   const screenshot=`edge/${index}.png`;await p.screenshot({path:output+'/'+screenshot,fullPage:true});
   edge.push({route,width:390,browser:b.version(),status:response.status(),errors,screenshot,...await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>i.currentSrc&&i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src')),unrequestedHiddenImages:[...document.images].filter(i=>!i.complete&&!i.getBoundingClientRect().width).map(i=>i.getAttribute('src'))}))});await p.close();
  }await c.close();await b.close();
 }catch(e){edge={unavailable:e.message};}
 fs.writeFileSync(output+'/deployment-verification.json',JSON.stringify({scope:'Local mirror of configured redirects; actual Vercel edge and domain not deployed or verified',redirects,queryPaint,edge},null,2));
 console.log(JSON.stringify({redirects:redirects.length,failures:redirects.filter(r=>!r.pass),queryVariants:queryPaint.length,edge},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});

