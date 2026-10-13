// Exercise delivery states using an in-browser mock only. Never calls a webhook.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const core = require('./checklist-core.js');

(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const requests = [];
  page.on('request',r=>{if(r.method()!=='GET') requests.push({method:r.method(),url:r.url()});});
  await page.route('**/checklist-integration.js*',route=>route.fulfill({contentType:'application/javascript',body:`
    window.__auditCalls=[];window.__auditMode='failed';
    window.HRTChecklistDelivery={enabled:true,async submit(request){
      window.__auditCalls.push(request);
      if(window.__auditMode==='pending')return new Promise(resolve=>window.__auditResolve=resolve);
      if(window.__auditMode==='failed')throw Error('Mock unavailable');
      return {accepted:true,emailSent:window.__auditMode==='email'};
    }};`}));
  const url = 'http://localhost:8000/checklist/pms-assessment/';
  const report = [];
  async function complete(mode) {
    await page.goto(url);
    await page.evaluate(mode=>window.__auditMode=mode,mode);
    const spec = await page.evaluate(()=>window.HRT_ASSESSMENT);
    await page.locator('#assessment-next').click();
    for(const step of [...spec.steps,...spec.contactOrder.map(name=>({type:'contact',name})),{type:'mailing',name:'mailing_list'}]) {
      if(step.type==='single') await page.locator('#assessment-screen input').last().check();
      if(step.type==='contact') await page.locator('#assessment-screen input').fill(step.name==='email'?'local-audit@example.com':'Local audit');
      if(step.type==='mailing') await page.locator('#assessment-screen input').last().check();
      await page.locator('#assessment-next').click();
    }
    return spec;
  }
  try {
    const spec=await complete('failed');
    await page.locator('#assessment-results').waitFor({state:'visible'});
    assert.match(await page.locator('.assessment-delivery').innerText(),/could not be sent/);
    const answers=Object.fromEntries(spec.questions.map(q=>[q.name,'No']));
    const expected=core.buildPayload(spec,answers,{first_name:'Local audit',email:'local-audit@example.com',mailing_list:spec.mailingOptions.at(-1).text});
    assert.deepEqual(await page.evaluate(()=>window.__auditCalls),[{assessmentId:'pms',payload:expected}]);
    await page.evaluate(()=>window.__auditMode='accepted');
    await page.getByRole('button',{name:'Try sending again'}).click();
    assert.match(await page.locator('.assessment-delivery').innerText(),/Email delivery has not been confirmed/);
    report.push('Failed delivery preserves answers; retry reuses exact original payload; accepted request does not claim email delivery.');
    await complete('email');
    assert.match(await page.locator('.assessment-delivery').innerText(),/email service accepted your results email/);
    report.push('Explicit emailSent confirmation is required before showing the email send acknowledgement; inbox arrival is not claimed.');
    await complete('pending');
    assert.equal(await page.locator('#assessment-next').isDisabled(),true);
    assert.equal(await page.locator('#assessment-back').isDisabled(),true);
    await page.locator('#hormone-assessment').evaluate(el=>el.dispatchEvent(new Event('submit',{cancelable:true})));
    assert.equal(await page.evaluate(()=>window.__auditCalls.length),1);
    await page.evaluate(()=>window.__auditResolve({accepted:false}));
    await page.getByRole('button',{name:'Try sending again'}).waitFor({state:'visible'});
    assert.match(await page.locator('.assessment-delivery').innerText(),/could not be sent/);
    report.push('Pending request blocks duplicate submissions; rejected acknowledgement shows failure.');
    assert.equal(new URL(page.url()).pathname,new URL(url).pathname);
    assert.deepEqual(requests,[]);
    const file=path.join('scraps','checklist-localization','delivery-mock-report.json');
    fs.writeFileSync(file,JSON.stringify({date:new Date().toISOString(),passed:true,mocked:true,liveSubmissions:0,checks:report},null,2));
    console.log(JSON.stringify({passed:true,checks:report,liveSubmissions:0}));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
