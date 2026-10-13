const fs = require('fs');
const vm = require('vm');
const { chromium } = require('playwright');
const out = 'scraps/footer-audit/support/after';
fs.mkdirSync(out, { recursive: true });
(async () => {
 const browser = await chromium.launch({ channel: 'chrome', headless: true });
 const results = [];
 for (const width of [1440, 768, 390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
  for (const route of ['Contact.html', 'FAQ.html']) {
   const errors = [];
   const listen = e => errors.push(e.message);
   page.on('pageerror', listen);
   const response = await page.goto('http://localhost:8000/' + route, { waitUntil: 'networkidle' });
   await page.evaluate(() => document.fonts.ready);
   await page.evaluate(async () => { for (let y=0;y<document.documentElement.scrollHeight;y+=800) { scrollTo(0,y); await new Promise(r=>setTimeout(r,25)); } scrollTo(0,0); });
   await page.screenshot({ path: `${out}/${route}-${width}.png`, fullPage: true });
   const row = { route, width, status: response.status(), errors };
   row.skip = await page.locator('.skip-link').evaluate(e => e.href);
   await page.locator('.skip-link').focus();
   await page.keyboard.press('Enter');
   row.skipFocusedMain = await page.evaluate(() => document.activeElement.id === 'main-content');
   row.skipStayedOnPage = page.url().includes(route);
   if (route === 'Contact.html') {
    await page.locator('button[type=submit]').click();
    row.invalidBlankFormBlocked = await page.locator('input[name=name]').evaluate(e => e.validity.valueMissing && document.activeElement===e);
    await page.locator('input[name=name]').fill('Layout audit');
    await page.locator('input[name=email]').fill('invalid');
    row.invalidEmailBlocked = await page.locator('input[name=email]').evaluate(e => e.validity.typeMismatch);
    await page.locator('input[name=email]').fill('audit@example.com');
    await page.locator('textarea').fill('Local validation check only.');
    row.validFormAccepted = await page.locator('form').evaluate(e => e.checkValidity());
    row.contactLinks = await page.locator('.contact-grid a').evaluateAll(elements => elements.map(e=>({text:e.textContent,href:e.href})));
    await page.locator('.contact-grid').screenshot({ path:`${out}/contact-form-${width}.png` });
   } else {
    row.groups = await page.locator('.faq-group h2').allTextContents();
    row.questions = await page.locator('.source-faqs details').count();
    row.keyboardAccordions = [];
    for (let i=0;i<row.questions;i++) {
     const summary=page.locator('.source-faqs summary').nth(i);
     await summary.focus(); await page.keyboard.press('Enter');
     row.keyboardAccordions.push(await summary.evaluate(e=>e.parentElement.open && e.nextElementSibling.getBoundingClientRect().height>0));
     await page.keyboard.press('Enter');
    }
    row.topicLinks=[];
    for(let i=0;i<3;i++) {
     await page.locator('.faq-topics a').nth(i).click();
     row.topicLinks.push(await page.evaluate(()=>{const e=document.getElementById(location.hash.slice(1));return !!e&&e.getBoundingClientRect().top>=0&&e.getBoundingClientRect().top<innerHeight;}));
    }
    await page.locator('.source-faqs details').first().evaluate(e=>e.open=true);
    await page.locator('.faq-group').first().screenshot({ path:`${out}/faq-expanded-${width}.png` });
   }
   row.overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   results.push(row); page.off('pageerror',listen);
  }
  await page.close();
 }
 // Exercise the actual email-draft handler against an inert location object.
 // This verifies encoding without opening mail software or sending a message.
 let submit;
 const values=new Map([['name','Audit & Check'],['email','audit@example.com'],['phone',''],['message','Line one\nLine two & more']]);
 const form={addEventListener:(type,handler)=>{if(type==='submit')submit=handler;},reportValidity:()=>true};
 const location={href:''};
 const document={querySelector:()=>null,getElementById:()=>null,querySelectorAll:s=>s==='.email-draft-form'?[form]:[],addEventListener:()=>{},documentElement:{classList:{remove:()=>{}}}};
 vm.runInNewContext(fs.readFileSync('site-interactions.js','utf8'),{document,location,matchMedia:()=>({matches:true,addEventListener:()=>{}}),FormData:class{get(key){return values.get(key);}},encodeURIComponent});
 submit({preventDefault(){}});
 const mail=new URL(location.href);
 const draft={recipient:mail.pathname,subject:mail.searchParams.get('subject'),body:mail.searchParams.get('body'),sent:false};
 if(draft.recipient!=='info@hrt.org'||!draft.body.includes('Line two & more'))throw Error('Draft composition failed');
 fs.writeFileSync(out+'/results.json',JSON.stringify({results,draft},null,2));
 await browser.close();
 console.log(JSON.stringify({views:results.length,failures:results.filter(r=>r.status!==200||r.errors.length||r.overflow||!r.skipFocusedMain||!r.skipStayedOnPage||r.keyboardAccordions?.includes(false)||r.topicLinks?.includes(false)),draft},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
