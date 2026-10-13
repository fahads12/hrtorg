const fs=require('node:fs');
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const routes=process.env.AUDIT_ROUTES?JSON.parse(process.env.AUDIT_ROUTES):['HRT Home.html','Audience.html?g=men','Treatments.html','Lab Testing.html','How It Works.html','men/hormone-replacement-therapy/index.html','health/perimenopause-navigating-the-many-symptoms-of-pre-menopause/index.html','Resources.html','Contact.html','Privacy Policy.html','checklist/hormone-symptom-checklist-for-women-female-hormone-imbalance-test/index.html'];
const output=process.env.AUDIT_OUTPUT||'scraps/prelaunch/accessibility-performance.json';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const results=[];
 for(const width of [1440,390]){
  for(const route of routes){
   const context=await browser.newContext({viewport:{width,height:1000}});
   await context.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
   await context.addInitScript(()=>{
    window.__auditMetrics={cls:0,lcp:0};
    new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__auditMetrics.cls+=e.value}).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(list=>{const e=list.getEntries().at(-1);if(e)window.__auditMetrics.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
   });
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const client=await context.newCDPSession(page);
   await client.send('Network.enable');await client.send('Network.setCacheDisabled',{cacheDisabled:true});
   if(width===390){await client.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});await client.send('Emulation.setCPUThrottlingRate',{rate:4});}
   await page.bringToFront();
   await page.goto('http://localhost:8011/'+route,{waitUntil:'networkidle',timeout:90000});
   await page.waitForTimeout(400);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const metrics=await page.evaluate(()=>{const nav=performance.getEntriesByType('navigation')[0],res=performance.getEntriesByType('resource');return{...window.__auditMetrics,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,domContentLoaded:nav.domContentLoadedEventEnd,load:nav.loadEventEnd,resourceBytes:res.reduce((n,r)=>n+r.transferSize,0),requests:res.length,largestResources:res.filter(r=>r.transferSize>150000).map(r=>({path:new URL(r.name).pathname,bytes:r.transferSize})),overflow:document.documentElement.scrollWidth>innerWidth};});
   // Full-page contents are visible before the accessibility pass.
   await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=800){scrollTo(0,y);await new Promise(r=>setTimeout(r,15));}scrollTo(0,0);});
   await page.waitForTimeout(700);
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
   const violations=axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html.slice(0,450)}))}));
   results.push({route,width,browser:browser.version(),metrics,errors,violations});
   fs.writeFileSync(output,JSON.stringify({measurement:'One cold-cache localhost run per route/width; mobile CDP 1.6Mbps,150ms,4x CPU; emulated Chrome, not field Core Web Vitals or physical device testing. Zero LCP means no entry was observed and is not a zero-millisecond load.',results},null,2));
   console.log(width,route,'violations',violations.map(v=>v.id).join(','),'CLS',metrics.cls,'LCP',Math.round(metrics.lcp));
   await context.close();
  }
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
