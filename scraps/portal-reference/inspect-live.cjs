const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const out=__dirname;fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
 const page=await context.newPage();await page.goto('https://portal.hrt.org/',{waitUntil:'networkidle',timeout:60000});
 await page.screenshot({path:path.join(out,'login-desktop.png'),fullPage:true});
 fs.writeFileSync(path.join(out,'login.html'),await page.content());
 const data=await page.evaluate(()=>({url:location.href,title:document.title,text:document.body.innerText,links:[...document.querySelectorAll('a')].map(a=>({text:a.textContent,href:a.href})),buttons:[...document.querySelectorAll('button')].map(a=>({text:a.textContent,type:a.type})),inputs:[...document.querySelectorAll('input')].map(a=>({name:a.name,type:a.type,placeholder:a.placeholder})),scripts:[...document.scripts].map(s=>s.src).filter(Boolean),styles:[...document.querySelectorAll('link[rel=stylesheet]')].map(s=>s.href),images:[...document.images].map(i=>({src:i.src,alt:i.alt,width:i.naturalWidth,height:i.naturalHeight})),fonts:[...new Set([...document.querySelectorAll('h1,h2,p,input,button')].map(e=>getComputedStyle(e).fontFamily))]}));
 fs.writeFileSync(path.join(out,'login.json'),JSON.stringify(data,null,2));console.log(JSON.stringify(data,null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
