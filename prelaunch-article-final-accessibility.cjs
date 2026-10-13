const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('fs');
const routes=['Resources.html','blog-categories/hormones/index.html','blog-categories/product/index.html','health/estrogen-and-skin-aging/index.html','health/hrt-hormone-replacement-therapy-for-men/index.html'];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const rows=[];
 for(const width of [1440,390])for(const route of routes){
  const context=await browser.newContext({viewport:{width,height:1000}});
  await context.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
  const page=await context.newPage();await page.goto('http://localhost:8013/'+route,{waitUntil:'networkidle'});
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  const semantics=await page.evaluate(()=>{let prev=1;const jumps=[];for(const h of document.querySelectorAll('main h1,main h2,main h3,main h4')){const level=+h.tagName.slice(1);if(level>prev+1)jumps.push(h.textContent);prev=level}return {headingJumps:jumps,smallHeadings:[...document.querySelectorAll('.article-heading-small')].map(h=>{const s=getComputedStyle(h);return {tag:h.tagName,text:h.textContent,font:s.font,letterSpacing:s.letterSpacing,margin:s.margin}})}});
  rows.push({route,width,violations:result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>n.target)})),...semantics});
  console.log(route,width,result.violations.length);await context.close();
 }
 fs.writeFileSync('scraps/prelaunch-2026-10-12/articles/final/accessibility.json',JSON.stringify({browser:browser.version(),rows},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
