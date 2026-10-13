const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert');
const routes=['Product.html','Audience.html','Audience.html?g=men','How It Works.html','HRT Home.html','HRT Landing.html','index.html','Lab Testing.html','lab-testing/index.html','Treatments.html'];
const out='scraps/inner-audit/aliases';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'chrome'}),rows=[];
 for(const width of [1440,768,390]){const p=await b.newPage({viewport:{width,height:1000}});let errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 for(const route of routes){errors=[];const response=await p.goto('http://localhost:8000/'+route);await p.locator('h1').first().waitFor();await p.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));for(let y=0;y<document.documentElement.scrollHeight;y+=750){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,30))}scrollTo({top:0,behavior:'instant'});});await p.waitForTimeout(750);
 const check=await p.evaluate(()=>({h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth+1,brokenImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),height:document.documentElement.scrollHeight,heading:document.querySelector('h1')?.innerText}));assert(response.status()===200);assert(!check.overflow,route+' overflow');assert(!check.brokenImages.length);assert(check.h1===1);assert.deepEqual(errors,[]);
 const file=`${out}/${route.replaceAll(/[^a-z0-9]/gi,'-')}-${width}.png`;await p.screenshot({path:file,fullPage:true});const url=p.url();await p.reload();await p.locator('h1').first().waitFor();assert(await p.locator('h1').first().innerText()===check.heading);
 rows.push({route,width,status:response.status(),finalURL:url,...check,errors,screenshot:file});}
 await p.close();}
 fs.writeFileSync(out+'/results.json',JSON.stringify(rows,null,2));await b.close();console.log('PASS: aliases and approved main-page regression at 1440/768/390');
})().catch(e=>{console.error(e);process.exit(1)});
