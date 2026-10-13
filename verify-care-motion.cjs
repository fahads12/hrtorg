const {chromium}=require('playwright');
const assert=require('assert'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage();const errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto('http://localhost:8000/HRT%20Home.html');
  await page.locator('.care-roadmap-step').first().scrollIntoViewIfNeeded();await page.waitForTimeout(100);
  const before=await page.locator('[data-care-progress]').evaluate(e=>parseFloat(e.style.getPropertyValue('--care-progress')));
  await page.locator('.care-roadmap-step').last().scrollIntoViewIfNeeded();await page.waitForTimeout(200);
  const after=await page.locator('[data-care-progress]').evaluate(e=>parseFloat(e.style.getPropertyValue('--care-progress')));
  assert(after>before);assert.equal(await page.locator('.care-roadmap-step').count(),5);
  assert.equal(await page.locator('.care-roadmap-step.is-current').count(),1);
  assert(await page.locator('.home-care-visual img').first().evaluate(i=>i.naturalWidth>0));
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1));
  assert.equal(await page.locator('.care-roadmap-intro a').getAttribute('href'),'How It Works.html');
  checks.push({width,before,after});
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
 assert.equal(await page.locator('[data-care-progress]').evaluate(e=>e.style.getPropertyValue('--care-progress')),'1');
 assert.equal(await page.locator('.home-care-visual img').first().evaluate(e=>getComputedStyle(e).transform),'none');
 await page.goto('http://localhost:8000/Audience.html?g=women');await page.locator('.aud-stage').first().scrollIntoViewIfNeeded();
 assert.equal(await page.locator('.aud-stage').first().evaluate(e=>e.getAnimations().length),0);
 assert.deepEqual(errors,[]);await browser.close();
 fs.writeFileSync('source-content/care-motion-verification.json',JSON.stringify({checks,reducedMotion:true,errors},null,2));
 console.log('PASS hero, five-step timeline, scroll progression, CTA, responsive layouts and live reduced-motion changes');
})().catch(e=>{console.error(e);process.exit(1)});
