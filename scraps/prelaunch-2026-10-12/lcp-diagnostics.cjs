const fs=require('node:fs');
const {chromium}=require('playwright');
const origin='http://localhost:8013';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 // A painted blank page avoids the first-window compositor's occasional missing paint entry.
 const warm=await browser.newPage();await warm.setContent('<p>Audit initialization</p>');await warm.screenshot();await warm.close();
 const rows=[];
 for(const test of [{route:'HRT Home.html',width:1440},{route:'About.html',width:390},{route:'About.html',width:390,eagerExperiment:true},{route:'Audience.html?g=men',width:390}]){
  const context=await browser.newContext({viewport:{width:test.width,height:1000}});
  await context.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
  if(test.eagerExperiment)await context.route('**/About.html',async route=>{
   const response=await route.fetch();let body=await response.text();
   const marker='<figure class="editorial-image wide-editorial wrap"><img';
   const start=body.indexOf(marker),end=body.indexOf('>',start+marker.length);
   if(start<0||end<0)throw Error('Hero markup not found');
   const original=body.slice(start,end),replacement=original.replace('loading="lazy"','loading="eager" fetchpriority="high"');
   if(original===replacement)throw Error('Lazy hero not found');body=body.slice(0,start)+replacement+body.slice(end);
   await route.fulfill({response,body});
  });
  await context.addInitScript(()=>{
   window.__lcp={};new PerformanceObserver(list=>{const e=list.getEntries().at(-1);window.__lcp={value:e.startTime,renderTime:e.renderTime,loadTime:e.loadTime,size:e.size,url:e.url,element:e.element?.outerHTML};}).observe({type:'largest-contentful-paint',buffered:true});
  });
  const page=await context.newPage();const client=await context.newCDPSession(page);await client.send('Network.enable');await client.send('Network.setCacheDisabled',{cacheDisabled:true});
  if(test.width===390){await client.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});await client.send('Emulation.setCPUThrottlingRate',{rate:4});}
  await page.bringToFront();await page.goto(origin+'/'+test.route,{waitUntil:'networkidle'});await page.waitForTimeout(500);
  const metrics=await page.evaluate(()=>({lcp:window.__lcp,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,visibility:document.visibilityState,resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('wellness-editorial')).map(r=>({name:r.name,start:r.startTime,end:r.responseEnd,duration:r.duration,transfer:r.transferSize})),image:document.querySelector('.ab-hero .editorial-image img')?.outerHTML}));
  rows.push({...test,metrics});console.log(JSON.stringify({...test,metrics}));await context.close();
 }
 await browser.close();fs.writeFileSync('scraps/prelaunch-2026-10-12/lcp-diagnostics.json',JSON.stringify({scope:'Controlled local cold-cache repeat, identical throttle. Eager experiment modifies only returned About hero markup in the audit browser, not source or dist.',rows},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
