const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const base=process.env.PORTAL_PREVIEW_URL||'http://localhost:8014';
const out=path.join(__dirname,'auth-integrated');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext();
 const blocked=[],errors=[],rows=[],checks=[];
 await context.route('**/*',route=>{
  const request=route.request();
  if(!request.url().startsWith(base+'/')||!['GET','HEAD'].includes(request.method())){
   blocked.push({url:request.url(),method:request.method()});return route.abort();
  }
  return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 async function load(route,width=1440){
  await page.setViewportSize({width,height:width===1440?1000:844});
  const response=await page.goto(base+'/portal/'+route,{waitUntil:'networkidle'});
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>!!document.querySelector('form button[type=submit]')&&!document.querySelector('form button[type=submit]').disabled);
  await page.evaluate(()=>document.fonts.ready);
 }
 for(const [view,route] of [['login',''],['register','register/'],['recover','recover-password/']])for(const width of [1440,390]){
  await load(route,width);
  const render=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),mainID:document.querySelector('main').id}));
  assert.equal(render.overflow,false);assert.deepEqual(render.broken,[]);
  const screenshot=path.join(out,view+'-'+width+'.png');await page.screenshot({path:screenshot,fullPage:true});
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  rows.push({view,width,...render,screenshot,violations:a11y.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,help:v.help,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({target:n.target,html:n.html,failureSummary:n.failureSummary}))})),incomplete:a11y.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))});
 }
 await load('');
 await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to content');
 await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'portal-main');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.name),'email');
 await page.keyboard.press('Enter');assert.equal(await page.locator('[aria-invalid=true]').count(),2);
 await page.getByLabel('Email',{exact:true}).fill('jordan@example.com');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.name),'password');
 await page.keyboard.type('SamplePreview!8');await page.keyboard.press('Enter');
 await page.waitForURL('**/portal/app/home/');
 checks.push('Desktop keyboard skip link, field order, required validation and local login routing pass.');

 await load('',390);await page.getByRole('button',{name:'Toggle navigation'}).focus();await page.keyboard.press('Enter');
 assert.equal(await page.getByRole('button',{name:'Toggle navigation'}).getAttribute('aria-expanded'),'true');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Login');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Sign Up');
 await page.keyboard.press('Enter');await page.waitForURL('**/portal/register/');
 await page.getByLabel('Password',{exact:true}).focus();await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Show password');
 await page.keyboard.press('Space');assert.equal(await page.getByLabel('Password',{exact:true}).getAttribute('type'),'text');
 await page.keyboard.press('Space');assert.equal(await page.getByLabel('Password',{exact:true}).getAttribute('type'),'password');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.type),'checkbox');
 await page.keyboard.press('Space');assert.equal(await page.getByRole('checkbox').isChecked(),true);
 checks.push('Mobile navigation, signup password visibility, and terms checkbox work by keyboard.');

 await load('recover-password/',390);await page.getByLabel('Email',{exact:true}).fill('jordan@example.com');await page.keyboard.press('Enter');
 assert.match(await page.locator('.portal-auth-status').innerText(),/no recovery email was sent/);
 checks.push('Integrated recovery remains local and explicitly confirms no email sent.');
 assert.deepEqual(blocked,[]);assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,rows,checks,blocked,errors},null,2));
 await browser.close();console.log(JSON.stringify({rows:rows.length,checks,violations:rows.map(r=>({view:r.view,width:r.width,rules:r.violations.map(v=>v.id)})),blocked,errors}));
})().catch(e=>{console.error(e);process.exit(1);});
