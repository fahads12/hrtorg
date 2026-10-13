const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const out=__dirname;
const routes=['Privacy Policy.html','Terms and Conditions.html','Return Policy.html','legal/consent-to-telehealth/index.html','legal/health-information-privacy-practices/index.html','legal/pharmacy-information/index.html','legal/informed-consent-regarding-nutritional-and-herbal-supplements/index.html','legal/privacy-policy/index.html'];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const rows=[];
 for(const route of routes)for(const width of [1440,768,390]){
 const page=await browser.newPage({viewport:{width,height:960},deviceScaleFactor:1});
 const errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));
 const res=await page.goto('http://localhost:8000/'+route,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 await page.waitForTimeout(200);
 const data=await page.evaluate(()=>{
 const box=e=>{if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {x:r.x,y:r.y,w:r.width,h:r.height,font:s.fontFamily,size:s.fontSize,line:s.lineHeight,weight:s.fontWeight,color:s.color,display:s.display,position:s.position,padding:s.padding,margin:s.margin}};
 const prose=document.querySelector('.source-prose');const children=[...prose.children];
 return {title:document.title,url:location.href,base:document.baseURI,height:document.documentElement.scrollHeight,scrollWidth:document.documentElement.scrollWidth,viewWidth:innerWidth,bodyText:prose.innerText,hero:box(document.querySelector('.source-hero')),h1:box(document.querySelector('h1')),reading:box(document.querySelector('.source-reading')),prose:box(prose),nav:box(document.querySelector('.nav')),footer:box(document.querySelector('.footer')),headings:[...document.querySelectorAll('main h1,main h2,main h3,main h4,main h5,main h6')].map(e=>({tag:e.tagName,text:e.innerText,id:e.id,...box(e)})),blocks:children.map((e,i)=>({index:i,tag:e.tagName,text:e.innerText,html:e.outerHTML,...box(e)})),lists:[...prose.querySelectorAll('ol,ul')].map(e=>({type:e.tagName,start:e.start,style:getComputedStyle(e).listStyleType,text:e.innerText,...box(e)})),tables:[...prose.querySelectorAll('table')].map(e=>({text:e.innerText,scroll:e.scrollWidth,...box(e)})),links:[...document.querySelectorAll('a')].map(e=>({text:e.innerText,href:e.getAttribute('href'),resolved:e.href,inMain:!!e.closest('main'),...box(e)})),images:[...document.images].map(e=>({src:e.src,alt:e.alt,loaded:e.complete&&!!e.naturalWidth,...box(e)})),overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left<-.5||r.right>innerWidth+.5)}).map(e=>({tag:e.tagName,cls:e.className,text:e.innerText?.slice(0,100),...box(e)})),fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),mainImages:prose.querySelectorAll('img').length,focusables:[...document.querySelectorAll('a,button,input,summary')].filter(e=>getComputedStyle(e).display!=='none').map(e=>({text:e.innerText,tab:e.tabIndex,...box(e)}))};
 });
 const slug=route.replace(/\/index.html$/,'').replace(/\.html$/,'').replace(/[^a-z0-9]+/gi,'-');
 const stem=slug+'-'+width;
 await page.screenshot({path:path.join(out,stem+'-full.png'),fullPage:true});
 const offsets=[...new Set([0,Math.round(data.height*.25),Math.round(data.height*.5),Math.round(data.height*.75),Math.max(0,data.height-960)])];
 for(let i=0;i<offsets.length;i++){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),offsets[i]);await page.waitForTimeout(60);await page.screenshot({path:path.join(out,stem+'-section-'+i+'.png')});}
 rows.push({route,width,status:res.status(),errors,failed,...data});
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(rows,null,2));
 console.log(JSON.stringify({route,width,height:data.height,overflow:data.overflow.length,errors,failed,fonts:data.fonts}));
 await page.close();
 }
 const unique=[...new Set(rows.flatMap(r=>r.links.filter(a=>a.resolved.startsWith('http://localhost:8000/')).map(a=>a.resolved.split('#')[0])))];
 const page=await browser.newPage();const linkchecks=[];for(const url of unique){const res=await page.request.get(url);linkchecks.push({url,status:res.status()})}
 fs.writeFileSync(path.join(out,'local-link-checks.json'),JSON.stringify(linkchecks,null,2));
 await browser.close();
})();
