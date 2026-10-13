const {chromium}=require('playwright');
const fs=require('fs'),assert=require('assert');
const out='scraps/inner-audit/root';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome'}),results=[];
 for(const width of [1440,768,390]){
  const page=await browser.newPage({viewport:{width,height:950}}),errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.method()+' '+r.url())});
  const go=async route=>{await page.goto('http://localhost:8000/'+route);await page.locator('h1').first().waitFor();};
  const shot=async name=>{await page.evaluate(()=>{scrollTo({top:0,behavior:'instant'});document.activeElement?.blur()});await page.waitForTimeout(300);assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'overflow: '+name+' '+width);await page.screenshot({path:`${out}/${name}-${width}.png`,fullPage:true});};
  await go('Consultation.html');
  assert(await page.locator('.cz-continue').isDisabled());
  await page.getByRole('button',{name:/A woman/}).click();
  assert(await page.getByRole('button',{name:/A woman/}).getAttribute('aria-pressed')==='true');
  await page.locator('#fn').fill('Layout Test');await page.locator('#dob').fill('1980-01-01');await page.locator('#st').selectOption('Florida');
  await page.locator('#em').fill('invalid');assert(await page.locator('.cz-continue').isDisabled());
  await page.locator('#em').fill('audit@example.invalid');await page.locator('.cz-continue').click();
  await shot('consult-step2');await page.locator('.cz-choice').first().click();await page.locator('.cz-continue').click();
  await shot('consult-step3');await page.locator('.cz-chip').first().click();await page.locator('.cz-scale button').nth(3).click();await page.locator('.cz-seg button').first().click();await page.locator('.cz-continue').click();
  await page.getByRole('button',{name:'None of the above',exact:true}).click();await shot('consult-step4');await page.locator('.cz-continue').click();
  for(const seg of await page.locator('.cz-seg').all())await seg.locator('button').first().click();await page.locator('.cz-chip').first().click();await shot('consult-step5');await page.locator('.cz-continue').click();
  await shot('consult-step6');for(const c of await page.locator('input[type=checkbox]').all())await c.check();await page.locator('.cz-continue').click();
  assert((await page.locator('.cz-center').textContent()).includes('Nothing has been submitted'));await shot('consult-review');
  await page.getByRole('button',{name:'Back',exact:true}).click();assert(await page.locator('input[type=checkbox]:checked').count()===2);await page.locator('.cz-continue').click();await page.getByRole('button',{name:'Finish preparation'}).click();
  assert((await page.locator('h1').textContent()).includes('patient portal'));await shot('consult-complete');assert(await page.evaluate(()=>localStorage.getItem('hrt-consult-v1'))===null);
  await page.reload();await page.locator('#fn').waitFor();assert(await page.locator('#fn').inputValue()==='');assert.deepEqual(writes,[]);
  await go('Consultation.html?g=men&p=hair');assert(await page.getByRole('button',{name:/A man/}).getAttribute('aria-pressed')==='true');
  await go('Pricing.html');await page.getByRole('button',{name:'Membership',exact:true}).click();assert((await page.locator('.pr-plans').textContent()).includes('confirm current membership'));assert(!(await page.locator('.pr-plans').textContent()).includes('$49.95'));await shot('pricing-membership');
  await page.getByRole('button',{name:'Care options',exact:true}).click();assert(await page.locator('.pr-plans .plan').count()===3);
  for(const summary of await page.locator('.source-faqs summary').all()){await summary.focus();await page.keyboard.press('Enter');assert(await summary.evaluate(e=>e.parentElement.open));await page.keyboard.press('Enter');}
  await go('Resources.html');await page.locator('#resource-search').fill('testosterone');assert(await page.locator('.resource-search .cat-card').count()>0);await shot('resources-search');await page.locator('#resource-search').fill('zzNoMatchingTitlezz');assert(await page.locator('.resource-search [role=status]').innerText()==='0 articles');await page.locator('#resource-search').fill('');
  await page.locator('.silo-pill').last().click();const hash=await page.evaluate(()=>location.hash);assert(hash);await page.reload();await page.locator(hash).waitFor();await go('Resources.html#%invalid');await page.waitForTimeout(250);
  if(width===390){await page.locator('.mobile-menu').click();await page.locator('#site-navigation').getByRole('link',{name:'Lab Testing',exact:true}).click();assert(page.url().includes('Lab%20Testing.html'));}
  await page.emulateMedia({reducedMotion:'reduce'});await go('Pricing.html');assert(await page.locator('.pr-plans').isVisible());
  assert.deepEqual(errors,[]);results.push({width,passed:true,checks:['all six consultation steps, review, back and completion','invalid email and disabled actions','URL prefills','ephemeral notes, no POST requests','pricing toggles and keyboard FAQs','resource search, no-results and hash refresh','reduced motion'],errors,writes});await page.close();
 }
 const p=await browser.newPage();const r=await p.goto('http://localhost:8000/not-a-real-page/');assert(r.status()===404);assert(await p.locator('h1').count()===1);await p.screenshot({path:out+'/invalid-route.png',fullPage:true});
 const external=[];await p.route('https://store.hrt.org/**',route=>{external.push(route.request().url());route.abort()});await p.goto('http://localhost:8000/Shop.html').catch(()=>{});await p.waitForTimeout(300);assert(external.length,'Shop redirect');
 await p.goto('http://localhost:8000/HRT%20Landing.html');await p.waitForTimeout(300);assert(p.url().includes('Audience.html'));
 fs.writeFileSync(out+'/interactions.json',JSON.stringify({results,invalidRoute404:true,shopRedirect:external,retiredLandingRedirect:p.url()},null,2));
 await browser.close();console.log('PASS: inner root interactions at 1440/768/390; 404 and redirects');
})().catch(e=>{console.error(e);process.exit(1)});
