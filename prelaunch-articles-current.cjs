const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const capture = require('./article-audit-capture-current.cjs');
const out = path.join(__dirname,'scraps/prelaunch-2026-10-12/articles');
const articles = require('./source-content/restored-data.json').articles;
const archives = ['blog-categories','category'].flatMap(dir=>fs.readdirSync(dir).filter(n=>fs.existsSync(path.join(dir,n,'index.html'))).map(n=>dir+'/'+n+'/index.html'));
const routes = ['Article.html',...articles.map(a=>a.route),'Resources.html',...archives];
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'routes.json'),JSON.stringify(routes,null,2));
const results=[];let blocked=0;
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 await Promise.all([1440,768,390].map(async width=>{
  const context=await browser.newContext({viewport:{width,height:1000}});
  await context.route('**/*',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.request().method())){blocked++;return r.abort()}return r.continue()});
  const page=await context.newPage();let errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));
  fs.mkdirSync(path.join(out,String(width)),{recursive:true});
  for(let i=0;i<routes.length;i++){
   const route=routes[i];errors=[];failed=[];
   try{
    const response=await page.goto('http://localhost:8012/'+route,{waitUntil:'domcontentloaded'});
    await page.locator('main h1').waitFor();
    await page.evaluate(async()=>{
     await Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,3500))]);
     [...document.images].forEach(i=>i.loading='eager');
     await Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,3500))]);
    });
    // Trigger actual observers throughout the page before a full-page capture.
    await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=850){scrollTo(0,y);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}scrollTo(0,0)});
    await page.waitForTimeout(230);
    const metrics=await page.evaluate(()=>{
     const visible=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0};
     const content=document.querySelector('main');
     return {
      title:document.title,h1s:content.querySelectorAll('h1').length,height:document.documentElement.scrollHeight,documentWidth:document.documentElement.scrollWidth,
      brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
      brokenContents:[...document.querySelectorAll('.art-tldr a,.art-rail a')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),
      overflow:[...content.querySelectorAll('*')].filter(el=>{const r=el.getBoundingClientRect();return visible(el)&&(r.right>innerWidth+2||r.left< -2)}).map(el=>({tag:el.tagName,class:typeof el.className==='string'?el.className:'',text:el.textContent.slice(0,100)})).slice(0,25),
      links:[...content.querySelectorAll('a[href]')].map(a=>({text:a.textContent.trim().slice(0,130),href:a.href})),
      headings:[...content.querySelectorAll('h1,h2,h3,h4')].map(el=>({level:el.tagName,text:el.textContent})),
      bodyLength:content.innerText.length,
      placeholders:(content.innerText.match(/\b(?:lorem ipsum|coming soon|placeholder|todo)\b/gi)||[]),
      textCorruption:(content.innerText.match(/[\uFFFD]|\u00c2[\u00a0-\u00bf]|\u00e2\u20ac/g)||[]),
      tinyControls:[...content.querySelectorAll('button,input,summary')].filter(visible).filter(el=>el.getBoundingClientRect().height<40).map(el=>({tag:el.tagName,text:el.textContent.slice(0,80)}))
     };
    });
    const screenshot=width+'/'+String(i).padStart(3,'0')+'.png';
    await capture(page,path.join(out,screenshot));
    results.push({index:i,route,width,status:response.status(),screenshot,visualReview:'pending',errors:[...errors],failed:[...failed],...metrics});
   }catch(error){results.push({index:i,route,width,error:error.message})}
   fs.writeFileSync(path.join(out,'results-'+width+'.json'),JSON.stringify(results.filter(r=>r.width===width),null,2));
   if(i%15===0)console.log(width+': '+(i+1)+'/'+routes.length);
  }
  await context.close();
 }));
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
 fs.writeFileSync(path.join(out,'failures.json'),JSON.stringify(results.filter(r=>r.error||r.status!==200||r.documentWidth>r.width+2||r.errors.length||r.brokenImages.length||r.brokenContents.length||r.overflow.length||r.textCorruption.length),null,2));
 console.log({visits:results.length,blocked});await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});


