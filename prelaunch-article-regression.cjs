const {chromium}=require('playwright');
const fs=require('fs');const path=require('path');
const capture=require('./article-audit-capture.cjs');
const out=path.join(__dirname,'scraps/prelaunch/articles/recheck');
const routes=JSON.parse(fs.readFileSync('scraps/prelaunch/articles/routes.json','utf8'));
const selected=[routes[0],routes.find(r=>r.includes('/endometriosis-')),routes.find(r=>r.includes('/female-hormone-imbalance-what-')), 'Resources.html','blog-categories/hormones/index.html','category/health/index.html','health/osteoporosis-protecting-bone-health/index.html'];
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];let blocked=0;
for(const width of [1440,768,390]){
 const context=await browser.newContext({viewport:{width,height:1000}});
 await context.route('**/*',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.request().method())){blocked++;return r.abort()}return r.continue()});
 const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 for(const route of selected){errors=[];const index=routes.indexOf(route);await page.goto('http://localhost:8011/'+route,{waitUntil:'networkidle'});await page.locator('main h1').waitFor();await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));for(let y=0;y<document.documentElement.scrollHeight;y+=800){scrollTo(0,y);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}scrollTo(0,0)});await page.waitForTimeout(300);
  const prefix=width+'-'+String(index).padStart(3,'0');await capture(page,path.join(out,prefix+'-full.png'));await page.screenshot({path:path.join(out,prefix+'-top.png')});
  const locators=route.includes('Resources')?['.resource-search','#hormones','.res-final']:route.startsWith('blog-')?['.source-grid']:route.startsWith('category/')?['main']:['.art-tldr','.art-content','.art-related','.art-final'];
  for(const [n,selector] of locators.entries()){const loc=page.locator(selector).first();if(!await loc.count())continue;await loc.evaluate(e=>e.scrollIntoView({block:'start'}));await page.evaluate(()=>scrollBy(0,-150));await page.waitForTimeout(250);await page.screenshot({path:path.join(out,prefix+'-section-'+n+'.png')})}
  results.push({route,width,index,errors:[...errors],screenshot:prefix+'-full.png',...await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),contents:[...document.querySelectorAll('.art-tldr a,.art-rail a')].map(a=>({samePage:new URL(a.href).pathname===location.pathname,exists:!!document.getElementById(new URL(a.href).hash.slice(1))})),h1Count:document.querySelectorAll('h1').length}))});
  console.log(width,route);
 }
 await context.close();
}
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({blocked,results},null,2));await browser.close();})().catch(e=>{console.error(e);process.exitCode=1});
