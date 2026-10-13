const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const base='http://localhost:8011/',out=__dirname,results=[];
const slug=s=>s.replace(/[^\w-]/g,'_');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const width of [1440,768,390]){
  const context=await browser.newContext({viewport:{width,height:900}}),blocked=[],errors=[];
  await context.route('**/*',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.request().method())){blocked.push({method:r.request().method(),url:r.request().url()});return r.abort();}return r.continue();});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const go=route=>page.goto(base+route,{waitUntil:'networkidle'});
  const shot=async name=>{await page.waitForTimeout(450);await page.screenshot({path:path.join(out,`journey-${name}-${width}.png`),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+name);};
  await go('HRT Home.html');
  const homeMen=page.locator('main a[href="Audience.html?g=men"]').first();await homeMen.click();await page.waitForSelector('.aud-hero');assert(page.url().includes('g=men'));
  const firstService=page.locator('.aud-tx-card').first();await firstService.click();await page.waitForSelector('.p-hero');await page.waitForTimeout(900);assert(page.url().includes('g=men'));
  assert.match(await page.locator('.p-hero h1').innerText(),/Men/);
  assert.equal(await page.locator('.p-hero-ctas a').first().innerText().then(s=>s.trim()),'Prepare for a consultation');
  assert.equal(await page.locator('.mini-cta a.btn').getAttribute('href'),'https://portal.hrt.org/app/symptoms-tracker');
  await page.goBack({waitUntil:'networkidle'});assert.match(page.url(),/Audience\.html\?g=men/);await page.goForward({waitUntil:'networkidle'});assert.match(await page.locator('.p-hero h1').innerText(),/Men/);
  await page.locator('.p-hero-ctas a').first().click();await page.waitForSelector('#fn');assert.match(page.url(),/Consultation/);
  await go('Consultation.html');assert(await page.locator('.cz-continue').isDisabled());
  await page.getByRole('button',{name:'A woman',exact:false}).click();await page.locator('#fn').fill('Audit');await page.locator('#st').selectOption({label:'Florida'});await page.locator('#em').fill('audit@example.invalid');
  await page.locator('#dob').fill('2099-01-01');assert(await page.locator('.cz-continue').isDisabled());assert.equal(await page.locator('#dob').getAttribute('aria-invalid'),'true');await shot('invalid-date');
  await page.locator('#dob').fill('1978-01-01');await page.locator('#em').fill('invalid');assert(await page.locator('.cz-continue').isDisabled());await page.locator('#em').fill('audit@example.invalid');assert(await page.locator('.cz-continue').isEnabled());await page.locator('.cz-continue').click();
  await page.locator('.cz-choice').first().click();await page.locator('.cz-back').click();assert.equal(await page.locator('#fn').inputValue(),'Audit');await page.locator('.cz-continue').click();assert(await page.locator('.cz-continue').isEnabled());await shot('goal');await page.locator('.cz-continue').click();
  assert(await page.locator('.cz-continue').isDisabled());await page.locator('.cz-chip').first().click();await page.getByRole('button',{name:'5 out of 10',exact:true}).click();await page.locator('.cz-seg button').first().click();await shot('symptoms');await page.locator('.cz-continue').click();
  await page.locator('.cz-check').first().click();await page.getByRole('button',{name:'None of the above',exact:true}).click();assert.equal(await page.locator('.cz-check[aria-pressed="true"]').count(),1);await shot('history');await page.locator('.cz-continue').click();
  for(const seg of await page.locator('.cz-seg').all())await seg.locator('button').first().click();await page.locator('.cz-chip').first().click();await shot('lifestyle');await page.locator('.cz-continue').click();
  assert(await page.locator('.cz-continue').isDisabled());for(const checkbox of await page.locator('main input[type="checkbox"]').all())await checkbox.check();await shot('next-step');await page.locator('.cz-continue').click();assert.match(await page.locator('.cz-main').innerText(),/Nothing has been submitted/);await shot('review');await page.getByRole('button',{name:'Finish preparation'}).click();assert.match(await page.locator('.cz-main').innerText(),/Your notes have not been sent/);await shot('complete');
  assert.equal(await page.locator('.cz-main a.btn').getAttribute('href'),'https://portal.hrt.org/app/symptoms-tracker');assert(!page.url().includes('Audit'));assert(!await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}).includes('Audit')));
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('#fn').inputValue(),'');
  await go('Pricing.html');await page.getByRole('button',{name:'Membership',exact:true}).click();assert.match(await page.locator('.pr-plans').innerText(),/Contact our team to confirm/);assert.equal(await page.locator('.pr-plans a').getAttribute('href'),'Contact.html');await shot('membership');await page.getByRole('button',{name:'Care options',exact:true}).click();assert.equal(await page.locator('.pr-plans .plan').count(),3);
  for(const summary of await page.locator('.source-faqs summary').all()){await summary.focus();await page.keyboard.press('Enter');assert(await summary.evaluate(el=>el.parentElement.open));await page.keyboard.press('Enter');}
  await go('Lab Testing.html');const kits=await page.locator('.lab-product a[href^="https://store.hrt.org/"]').evaluateAll(es=>es.map(e=>({text:e.innerText,href:e.href})));assert(kits.length>=3);results.push({width,journeys:'home → men → hormone service → preparation; back/forward; all preparation states; pricing toggle/FAQs; lab kit store destinations',passed:true,blocked,errors,kits});assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);
  await context.close();console.log('PASS journeys '+width);fs.writeFileSync(path.join(out,'journeys.json'),JSON.stringify(results,null,2));
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
