const {chromium}=require('playwright');const fs=require('fs');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('scraps/lab-redesign',{recursive:true});
 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:1000});const response=await page.goto('http://localhost:8000/Lab%20Testing.html',{waitUntil:'networkidle'});assert.equal(response.status(),200);
  for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(35)}
  await page.waitForTimeout(1000);await page.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,5000))])});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.lab-product').count(),3);
  assert.deepEqual(await page.evaluate(()=>[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[]);
  await page.screenshot({path:`scraps/lab-redesign/full-${width}.png`,fullPage:true});
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(300);await page.screenshot({path:`scraps/lab-redesign/hero-${width}.png`});
  for(const selector of ['#lab-kits','#lab-process','#lab-results','#lab-compare','#lab-faq']){await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.screenshot({path:`scraps/lab-redesign/${selector.slice(1)}-${width}.png`});}
  const faq=page.locator('.lab-faqs details').first();await faq.locator('summary').focus();await page.keyboard.press('Enter');await page.waitForTimeout(350);assert(await faq.getAttribute('open')!==null);await page.keyboard.press('Enter');await page.waitForTimeout(350);assert.equal(await faq.getAttribute('open'),null);
  if(width>800){for(let i=0;i<5;i++){await page.locator('.lab-step').nth(i).evaluate(e=>e.scrollIntoView({block:'center'}));await page.waitForTimeout(100);assert.equal(await page.locator('[data-scene]:not([hidden])').getAttribute('data-scene'),String(i));}}
  else {assert.equal(await page.locator('.lab-process-visual').isVisible(),false);await page.locator('.mobile-menu').click();assert(await page.locator('#site-navigation').isVisible());await page.keyboard.press('Escape');}
  console.log('PASS',width,'layout, images, accordion keyboard, process, menu');
 }
 const anchors=await page.locator('main a[href^="#"]').evaluateAll(a=>a.map(x=>x.getAttribute('href')));for(const anchor of anchors)assert.equal(await page.locator(anchor).count(),1);
 const links=await page.locator('main a[href]').evaluateAll(a=>[...new Set(a.map(x=>x.href))]);fs.writeFileSync('scraps/lab-redesign/links.json',JSON.stringify(links,null,2));
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
 const reducedFaq=page.locator('.lab-faqs summary').first();await reducedFaq.click();assert(await page.locator('.lab-faqs details').first().getAttribute('open')!==null);
 await page.goto('http://localhost:8000/lab-testing/',{waitUntil:'networkidle'});assert.equal(await page.locator('.lab-product').count(),3);await page.reload();assert.equal(await page.locator('.lab-product').count(),3);
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto('http://localhost:8000/Lab%20Testing.html');assert(await nojs.locator('h1').isVisible());assert.equal(await nojs.locator('.lab-step').count(),5);await nojs.locator('.lab-faqs summary').first().click();assert(await nojs.locator('.lab-faq-answer').first().isVisible());
 assert.deepEqual(errors,[]);console.log('PASS anchors, reduced motion, direct route/refresh, no-JS content and accordions; no runtime errors');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
