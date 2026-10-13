const {chromium}=require('playwright');
const fs=require('fs');
const routes=JSON.parse(fs.readFileSync('scraps/prelaunch/articles/routes.json','utf8'));
const out='scraps/prelaunch/articles/recheck/reloads.json';
const origin='http://localhost:8011/';
const rows=[];let blocked=0;
const normalized=url=>{const u=new URL(url);return decodeURIComponent(u.pathname)+u.search+u.hash};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});
await Promise.all([1440,768,390].flatMap(width=>[0,1].map(async worker=>{
 const context=await browser.newContext({viewport:{width,height:1000}});
 await context.route('**/*',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.request().method())){blocked++;return r.abort()}return r.continue()});
 const page=await context.newPage();let pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 for(let index=worker;index<routes.length;index+=2){const route=routes[index];pageErrors=[];let row={route,width,index,pass:false};
 try{const initial=await page.goto(origin+route,{waitUntil:'load'});await page.locator('main h1').waitFor();const before=page.url();
 const response=await page.reload({waitUntil:'load'});await page.locator('main h1').waitFor();
 await page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});
 const metrics=await page.evaluate(()=>({hasMain:!!document.querySelector('main'),h1s:document.querySelectorAll('main h1').length,bodyLength:document.querySelector('main')?.innerText.length||0,documentWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
 const expectedPath=normalized(origin+route),initialPath=normalized(before),finalPath=normalized(page.url());
 row={...row,initialStatus:initial.status(),status:response.status(),initialRouteMatches:expectedPath===initialPath,routeMatches:initialPath===finalPath,finalPath,pageErrors:[...pageErrors],...metrics};
 row.pass=row.initialStatus===200&&row.status===200&&row.initialRouteMatches&&row.routeMatches&&row.hasMain&&row.h1s===1&&row.bodyLength>0&&row.documentWidth<=width&&!row.pageErrors.length;
 }catch(e){row.error=e.message}
 rows.push(row);
 if(rows.length%30===0){fs.writeFileSync(out,JSON.stringify({origin,blocked,count:rows.length,rows},null,2));console.log(rows.length+'/612', 'failures:'+rows.filter(r=>!r.pass).length)}
 }
 await context.close();
})));
rows.sort((a,b)=>a.width-b.width||a.index-b.index);fs.writeFileSync(out,JSON.stringify({origin,blocked,count:rows.length,rows},null,2));await browser.close();console.log(JSON.stringify({count:rows.length,blocked,failures:rows.filter(r=>!r.pass)},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
