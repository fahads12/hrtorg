const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const rows=[];
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000}});
  await context.route('**/*',route=>['GET','HEAD','OPTIONS'].includes(route.request().method())?route.continue():route.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  await page.locator('.preview img').waitFor();
  await page.locator('.preview img').evaluate(img=>img.decode());
  await page.screenshot({path:path.join(__dirname,`gallery-${width}.png`),fullPage:false});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  await page.locator('#search').fill('About.html');
  const searched=await page.locator('#result-count').innerText();
  await page.locator('[data-route="About.html"]').click();
  await page.locator('[data-width="390"]').click();
  const selected=await page.locator('#viewer h2').innerText();
  const broken=await page.locator('.preview img').evaluate(async img=>{try{await img.decode();return false}catch{return true}});
  await page.locator('#viewer').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(__dirname,`gallery-viewer-${width}.png`),fullPage:false});
  await page.locator('#search').fill('');
  await page.locator('#filter').selectOption('query-variant');
  const variantCount=await page.locator('.route').count();
  rows.push({width,errors,overflow,searched,selected,broken,variantCount,passed:!errors.length&&!overflow&&!broken&&variantCount===15&&selected==='About.html'});
  await context.close();
 }
 await browser.close();
 fs.writeFileSync(path.join(__dirname,'gallery-verification.json'),JSON.stringify({rows,visualReview:'pending'},null,2));
 console.log(JSON.stringify(rows));
})().catch(e=>{console.error(e);process.exit(1)});
