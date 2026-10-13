const fs = require('fs');
const {chromium} = require('playwright');
const capture = require('./prelaunch-content-capture.cjs');
const output = 'scraps/prelaunch-2026-10-12/content';
const reportFile = output + '/report.json';
const previous = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const recovered = {
  'checklist/erectile-dysfunction-ed-symptom-checklist/index.html': { label:'Open ED questionnaire', url:'https://form.typeform.com/to/JZXYRv' },
  'checklist/weight-loss/index.html': { label:'Open weight-loss request form', url:'https://form.typeform.com/to/qHRP4cxp' },
  'menopause-quiz/index.html': { label:'Open menopause questionnaire', url:'https://form.typeform.com/to/LgydNw' },
};
const changed = process.env.RECOVERED_ONLY ? [...Object.keys(recovered),'About.html'] : process.env.GLP_ONLY ? ['glp-1/ozempic-vs-wegovy/index.html'] : ['Privacy Policy.html','legal/privacy-policy/index.html','glp-1/ozempic-vs-wegovy/index.html'];
const retry = previous.filter(row => row.error || changed.includes(row.route));
(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  for (const old of retry) {
    const context = await browser.newContext({viewport:{width:old.width,height:1000},reducedMotion:'reduce'});
    await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
    const page = await context.newPage();
    const errors=[],failed=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('requestfailed',r=>failed.push(r.url()));
    const response=await page.goto((process.env.AUDIT_BASE_URL||'http://localhost:8012')+'/'+old.route,{waitUntil:'networkidle'});
    await page.reload({waitUntil:'networkidle'});
    await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));for(let y=0;y<document.documentElement.scrollHeight;y+=750){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,8))}scrollTo({top:0,behavior:'instant'})});
    const state=await page.evaluate(()=>{const m=document.querySelector('main')||document.body;return {height:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth+1,h1:m.querySelectorAll('h1').length,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')),hiddenText:[...m.querySelectorAll('h1,h2,h3,p')].filter(e=>getComputedStyle(e).opacity==='0').map(e=>e.textContent.trim().slice(0,80)),links:[...m.querySelectorAll('a[href]')].map(a=>({text:a.textContent.trim(),href:a.href})),headings:[...m.querySelectorAll('h1,h2,h3')].map(e=>e.textContent.trim()),forms:[...m.querySelectorAll('form')].map(f=>({class:f.className,action:f.getAttribute('action')})),text:m.innerText}});
    if (old.route==='glp-1/ozempic-vs-wegovy/index.html' && /take the (?:GLP-1 )?quiz/i.test(state.text)) throw new Error('Unavailable quiz is still promoted');
    const handoff = recovered[old.route];
    if (handoff) {
      if (!state.links.some(link=>link.text===handoff.label&&link.href===handoff.url)) throw new Error('Original form handoff missing');
      if (!state.text.includes('This form opens on Typeform.')) throw new Error('External form host disclosure missing');
      if (!/noindex/.test(await page.locator('meta[name="robots"]').getAttribute('content'))) throw new Error('External workflow must remain noindex');
      if (state.forms.length) throw new Error('Unexpected local form introduced');
    }
    const screenshot=output+'/'+old.route.replace(/[^a-z0-9-]/gi,'_')+'-'+old.width+'.png';
    await capture(page,screenshot);
    const row={route:old.route,width:old.width,status:response.status(),finalURL:page.url(),errors,failed,blockedWrites:0,...state,screenshot,visualReview:'pending',recaptured:true};
    if (handoff) {
      let intercepted = false;
      await page.route(handoff.url, async route => { if(route.request().method()!=='GET') throw new Error('Unexpected handoff write'); intercepted=true; await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Intercepted safe handoff</title><p>Destination intercepted for local verification.</p>'}); });
      await page.getByRole('link',{name:handoff.label,exact:true}).click();
      await page.waitForURL(handoff.url);
      if(!intercepted)throw new Error('External handoff was not intercepted');
      row.externalHandoff={...handoff,interceptedGET:true,liveSubmissions:0,sourceIdentityEvidence:'content/glp-source-check/legacy-schemas-report.json'};
    }
    const at=previous.findIndex(r=>r.route===old.route&&r.width===old.width);previous[at]=row;
    fs.writeFileSync(reportFile,JSON.stringify(previous,null,2));
    console.log('Retested '+old.route+' / '+old.width);
    await context.close();
  }
  await browser.close();
})();
