const { chromium } = require('playwright');
const fs = require('fs'); const path=require('path');
const root=path.resolve(__dirname,'../../..'); const data=require(path.join(root,'source-content/restored-data.json'));
const routes=[{route:'Resources.html',kind:'hub'},{route:'category/health/index.html',kind:'category'},...data.categories.map(a=>({...a,kind:'category'})),{route:'Article.html',kind:'article'},...data.articles.map(a=>({route:a.route,kind:'article',title:a.title,key:a.key}))];
const out=__dirname, results=[], links=new Set();
const slug=r=>r==='Article.html'?'article-alias':r==='Resources.html'?'resources':r.replace(/\/index.html$/,'').replaceAll('/','--');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 await Promise.all([1440,768,390].map(async width=>{
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});let errors=[];page.on('pageerror',e=>errors.push(e.message));
  const dir=path.join(out,String(width));fs.mkdirSync(dir,{recursive:true});
  for(const [i,r] of routes.entries()){
   errors=[];
   try {
   const response=await page.goto('http://localhost:8000/'+r.route,{waitUntil:'domcontentloaded'});
   await page.locator(r.kind==='article'?'.article-page .art-content':'main h1').waitFor();
   await page.evaluate(async()=>{[...document.images].forEach(i=>i.loading='eager');await Promise.race([Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode().catch(()=>{}))]),new Promise(r=>setTimeout(r,2500))]);});
   const m=await page.evaluate(()=>{
    const main=document.querySelector('main');const content=document.querySelector('.art-content');const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
    const all=[...main.querySelectorAll('*')]; const desc=e=>e.tagName+'.'+e.className;
    return{title:document.title,h1:main.querySelector('h1')?.textContent,h1Count:main.querySelectorAll('h1').length,docWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,content:rect(content),headings:content?.querySelectorAll('h2,h3,h4').length,paragraphs:content?.querySelectorAll('p').length,cards:main.querySelectorAll('.source-card,.cat-card,.art-rel-card').length,
    overflow:all.filter(e=>{const r=e.getBoundingClientRect();return visible(e)&&r.width&&(r.right>innerWidth+2||r.left<-2)&&!e.closest('.silo-nav-inner')}).slice(0,20).map(desc),
    clipped:all.filter(e=>{const c=getComputedStyle(e);return visible(e)&&e.scrollWidth>e.clientWidth+3&&['hidden','clip'].includes(c.overflowX)&&!e.closest('.silo-nav-inner')}).slice(0,20).map(e=>({selector:desc(e),text:e.textContent.slice(0,100),sw:e.scrollWidth,cw:e.clientWidth})),
    brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),images:[...main.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),alt:i.alt,w:i.naturalWidth,h:i.naturalHeight,rect:rect(i)})),
    brokenToc:[...document.querySelectorAll('.art-tldr a,.art-rail a')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),
    links:[...document.querySelectorAll('a[href]')].filter(a=>a.origin===location.origin).map(a=>a.href),footerJournal:[...document.querySelectorAll('footer a')].find(a=>a.textContent==='Journal')?.href,
    emptyLinks:[...main.querySelectorAll('a')].filter(a=>!a.textContent.trim()&&!a.querySelector('img,svg')&&!a.getAttribute('aria-label')).map(a=>a.href),badText:main.textContent.match(/\uFFFD|\u00e2\u20ac|\u00c2\u00a9/g)
    };
   });
   m.links.forEach(l=>links.add(l));delete m.links;
   await page.screenshot({path:path.join(dir,slug(r.route)+'-top.jpg'),quality:75});
   await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.waitForTimeout(60);
   await page.screenshot({path:path.join(dir,slug(r.route)+'-bottom.jpg'),quality:75});
   results.push({route:r.route,kind:r.kind,width,status:response.status(),errors:[...errors],...m});
   }catch(e){results.push({route:r.route,kind:r.kind,width,error:e.message});}
   if(i%20===0)console.log(width+': '+(i+1)+'/'+routes.length);
   fs.writeFileSync(path.join(out,'results-partial.json'),JSON.stringify(results,null,2));
  }
  await page.close();
 }));
 const ctx=await browser.newContext();const unique=[...new Set([...links].map(h=>new URL(h).pathname))],linkResults=[];let next=0;
 await Promise.all(Array.from({length:6},async()=>{while(next<unique.length){const route=unique[next++];try{const r=await ctx.request.get('http://localhost:8000'+route);linkResults.push({route,status:r.status()})}catch(e){linkResults.push({route,error:e.message})}}}));
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));fs.writeFileSync(path.join(out,'links.json'),JSON.stringify(linkResults,null,2));
 const failed=results.filter(r=>r.error||r.status!==200||r.h1Count!==1||r.docWidth>r.width+2||r.overflow.length||r.clipped.length||r.brokenImages.length||r.brokenToc.length||r.errors.length||r.badText);
 fs.writeFileSync(path.join(out,'flagged.json'),JSON.stringify(failed,null,2));console.log(JSON.stringify({routes:routes.length,visits:results.length,flagged:failed.length,links:linkResults.length,badLinks:linkResults.filter(r=>r.status!==200)},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
