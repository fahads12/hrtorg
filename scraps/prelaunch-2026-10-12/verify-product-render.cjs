const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {DOMParser}=require('linkedom');const{chromium}=require('playwright');
const output='scraps/prelaunch-2026-10-12',origin='http://localhost:8013';
const source=fs.readFileSync('product-app.jsx','utf8');
const helper=vm.runInNewContext(source.slice(source.indexOf('function treatmentSections('),source.indexOf('function WhoSection('))+';treatmentContent',{DOMParser});
const context={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/restored-data.js','utf8'),context);const products=context.window.HRT_SOURCE.products;
const mapping={hrt:'hormone-replacement-therapy',peptides:'anti-aging-peptides',weight:'weight-loss-and-management',sexual:'sexual-health',hair:'hair-loss',ed:'erectile-dysfunction'};
const routes=[{route:'Product.html',p:'hrt',g:'women'}];
for(const g of ['women','men'])for(const p of Object.keys(mapping))routes.push({route:`Product.html?p=${p}&g=${g}`,p:g==='women'&&p==='ed'?'sexual':p,g});
const direct=[];for(const g of ['women','men'])for(const[p,slug]of Object.entries(mapping)){if(g==='women'&&p==='ed')continue;direct.push({route:`${g}/${slug}/index.html`,p,g});}routes.push(...direct);
const norm=s=>String(s).replace(/[\u200b-\u200d\ufeff]/g,'').replace(/\s+/g,' ').trim();
const text=html=>new DOMParser().parseFromString('<html><body>'+html+'</body></html>','text/html').body.textContent;
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const rows=[];
 for(const javaScriptEnabled of [true,false]){
  const ctx=await browser.newContext({javaScriptEnabled,viewport:{width:1440,height:900}});await ctx.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
  const page=await ctx.newPage();
  for(const spec of javaScriptEnabled?routes:direct){const row={...spec,javaScriptEnabled};try{
   await page.goto(origin+'/'+spec.route,{waitUntil:'networkidle'});
   const expected=helper(products[spec.p][spec.g]);
   const actual=await page.evaluate(()=>({sections:[...document.querySelectorAll('.p-reading-content .p-source-section')].map(n=>({id:n.id,heading:n.querySelector('h3').textContent,body:n.querySelector('.source-prose').textContent})),faqs:[...document.querySelectorAll('#faq details')].map(n=>({q:n.querySelector('summary').textContent,a:n.querySelector('.source-prose').textContent})),topics:[...document.querySelectorAll('.p-reading-nav a')].map(a=>({href:a.href,text:a.textContent})),faqLabels:[...document.querySelectorAll('.p-faq-topic')].map(n=>({id:n.id,text:n.textContent})),ids:[...document.querySelectorAll('[id]')].map(n=>n.id)}));
   assert.equal(actual.sections.length,expected.sections.length,'complete service body');
   expected.sections.forEach((s,i)=>{assert.equal(actual.sections[i].id,s.id);assert.equal(norm(actual.sections[i].body),norm(text(s.html)),'exact section prose '+s.id)});
   assert.equal(actual.faqs.length,expected.items.length,'exact FAQ count');
   expected.items.forEach((item,i)=>{assert.equal(norm(actual.faqs[i].q),norm(item.q));assert.equal(norm(actual.faqs[i].a),norm(item.a));});
   for(const section of expected.duplicates){assert.equal(actual.faqLabels.filter(label=>label.id===section.id&&norm(label.text)===norm(section.title)).length,1,'original FAQ heading retained once');assert.equal(actual.ids.filter(id=>id===section.id).length,1,'original topic ID exists once');}
   for(const anchor of actual.topics){const url=new URL(anchor.href);assert.equal(url.pathname,new URL(origin+'/'+spec.route).pathname,'copied topic stays on current route');assert.equal(url.searchParams.get('p'),spec.p);assert.equal(url.searchParams.get('g'),spec.g);assert.equal(actual.ids.filter(id=>id===url.hash.slice(1)).length,1);}
   if(javaScriptEnabled){const faqHref=actual.topics.find(a=>/faq/i.test(a.text)).href;await page.goto(faqHref,{waitUntil:'networkidle'});assert.equal(new URL(page.url()).hash,new URL(faqHref).hash);assert.equal(await page.locator(new URL(faqHref).hash).count(),1);row.copiedFaqDirectLoad=true;}
   row.bodySections=actual.sections.length;row.faqPairs=actual.faqs.length;row.pass=true;
  }catch(error){row.error=error.message;}rows.push(row);fs.writeFileSync(output+'/product-render-verification.json',JSON.stringify({scope:'24 hydrated route states +11 script-disabled canonical service pages. Exact section text, all FAQ text/order, retained single topic IDs, correct copied URLs, direct copied FAQ navigation.',rows},null,2));}
  await ctx.close();
 }
 await browser.close();console.log(JSON.stringify({cases:rows.length,failures:rows.filter(r=>!r.pass)}));if(rows.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1});
