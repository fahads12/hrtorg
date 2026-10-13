// Development verification of the local UI only. Never contacts the live patient portal.
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const pages = require('../../portal-pages.json');
const base = process.env.PORTAL_TEST_URL || 'http://localhost:8014';
const dir = path.resolve(__dirname, 'screenshots');
fs.mkdirSync(dir, {recursive:true});
async function main() {
  const browser = await chromium.launch({channel:'chrome', headless:true});
  const context = await browser.newContext({reducedMotion:'reduce'});
  const calls = [], issues = [], checks = [];
  await context.route('**/*', route => {
    const req=route.request();
    const item={url:req.url(), method:req.method(), type:req.resourceType()};
    calls.push(item);
    if (!req.url().startsWith(base+'/') || !['GET','HEAD'].includes(req.method())) {
      issues.push({type:'unexpected-network', ...item});
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error=>issues.push({type:'pageerror', route:page.url(), message:error.message}));
  page.on('console', message=>{if(message.type()==='error')issues.push({type:'console', route:page.url(), message:message.text()});});
  page.on('response', response=>{if(response.status()>=400)issues.push({type:'http', url:response.url(), status:response.status()});});
  for (const width of [1440,1024,768,390]) {
    await page.setViewportSize({width,height:width===390?844:1000});
    for (const item of pages) {
      const response = await page.goto(base+item.path, {waitUntil:'networkidle'});
      await page.evaluate(()=>document.fonts.ready);
      const state = await page.evaluate(()=>({
        title:document.title,
        width:window.innerWidth,
        scrollWidth:document.documentElement.scrollWidth,
        heading:document.querySelector('main h1,main h2,.hrt-portal h1')?.textContent,
        main:!!document.getElementById('portal-main'),
        brokenImages:[...document.images].filter(img=>img.complete&&!img.naturalWidth).map(img=>img.src),
        noindex:document.querySelector('meta[name="robots"]')?.content,
        storage:{local:Object.keys(localStorage),session:Object.keys(sessionStorage)},
      }));
      const name=(item.path.slice(8).replaceAll('/','-')||'login').replace(/-$/,'')+'-'+width;
      await page.screenshot({path:path.join(dir,name+'.png'),fullPage:true});
      const check={path:item.path,width,status:response.status(),...state,screenshot:'screenshots/'+name+'.png'};
      checks.push(check);
      if(state.scrollWidth>width+1)issues.push({type:'overflow',path:item.path,width,scrollWidth:state.scrollWidth});
      if(state.brokenImages.length)issues.push({type:'images',path:item.path,width,images:state.brokenImages});
      if(!state.main)issues.push({type:'skip-target',path:item.path});
      if(!state.noindex?.includes('noindex'))issues.push({type:'robots',path:item.path});
    }
  }
  await browser.close();
  const report={checkedAt:new Date().toISOString(),base,routeCount:pages.length,checks,issues,network:{requests:calls.length,methods:[...new Set(calls.map(c=>c.method))],origins:[...new Set(calls.map(c=>new URL(c.url).origin))],apiCalls:calls.filter(c=>['fetch','xhr','websocket'].includes(c.type))}};
  fs.writeFileSync(path.join(__dirname,'browser-verification.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({routeCount:pages.length,cases:checks.length,issues,network:report.network},null,2));
  if(issues.length)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
