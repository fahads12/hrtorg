const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const gender of ['women','men']){
  await page.goto('http://localhost:8000/Audience.html?g='+gender,{waitUntil:'networkidle'});
  await page.waitForFunction(g=>document.documentElement.dataset.careTheme===g,gender);
  const color=await page.locator('.btn-primary').first().evaluate(e=>getComputedStyle(e).backgroundColor);
  if(color!==(gender==='women'?'rgb(142, 69, 111)':'rgb(18, 59, 96)'))throw Error('Incorrect button palette '+gender+' '+color);
  const img=page.locator('.aud-care-portrait');if(!await img.evaluate(e=>e.complete&&e.naturalWidth>0&&e.currentSrc.includes('care-v2')))throw Error('Hero image');
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow '+gender+width);}
  await page.screenshot({path:'scraps/theme-'+gender+'.png',fullPage:true});
  await page.goto('http://localhost:8000/Treatments.html',{waitUntil:'networkidle'});
  if(await page.evaluate(()=>document.documentElement.dataset.careTheme)!==undefined)throw Error('Theme leaked to Treatments');
  console.log('PASS',gender,'palette, responsive hero, widths 320/390/768/1440, and neutral general pages');
 }
 await page.goto('http://localhost:8000/Audience.html?g=women',{waitUntil:'networkidle'});
 await page.locator('#site-navigation').getByRole('link',{name:'For Men',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.careTheme==='men');
 await page.locator('#site-navigation').getByRole('link',{name:'For Women',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.careTheme==='women');
 const portrait=page.locator('img[src*="jessica-kikla-enhanced"]');await portrait.scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.images].some(e=>e.src.includes('jessica-kikla-enhanced')&&e.complete&&e.naturalWidth>0));
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS live theme switch, Jessica portrait, no runtime errors');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
