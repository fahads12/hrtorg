const fs=require('node:fs');
const {chromium}=require('playwright');
const output='scraps/prelaunch-2026-10-12';
const source=JSON.parse(fs.readFileSync(output+'/external-verification.json','utf8'));
for(const row of source.results)if(/checking your browser|just a moment|access denied|^pubmed\.ncbi\.nlm\.nih\.gov$/i.test(row.title||''))row.result='blocked-or-challenged';
source.systemCertificateStore=true;
fs.writeFileSync(output+'/external-verification.json',JSON.stringify(source,null,2));
const probes=source.results.filter(row=>row.result!=='reachable'||/portal\.hrt|facebook\.com|1\.usa\.gov|^https:\/\/store\.hrt\.org\/$/.test(row.url));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext();
 let preventedWrites=0;
 await context.route('**/*',r=>{if(['GET','HEAD','OPTIONS'].includes(r.request().method()))return r.continue();preventedWrites++;return r.abort();});
 const results=[];let cursor=0;
 await Promise.all(Array.from({length:2},async()=>{while(cursor<probes.length){const source=probes[cursor++];const page=await context.newPage();let row={url:source.url};try{const response=await page.goto(source.url,{waitUntil:'domcontentloaded',timeout:18000});await page.waitForTimeout(500);const body=(await page.locator('body').innerText({timeout:3000})).replace(/\s+/g,' ');row={...row,status:response?.status(),finalUrl:page.url(),title:await page.title(),unavailable:/this content isn.t available|content is not available|page not found|404 not found/i.test(body),challenge:/verify you are human|checking your browser|captcha|just a moment|access denied/i.test(body),login:/sign in|log in|login/i.test(body),bodyPreview:body.slice(0,250)};}catch(error){row.error=error.message.split('\n')[0];}results.push(row);await page.close();fs.writeFileSync(output+'/external-browser-verification.json',JSON.stringify({scope:'Unauthenticated read-only browser fallback for uncertain requests plus key handoffs; all non-read-only requests were blocked.',browser:browser.version(),preventedWrites,results},null,2));}}));
 await browser.close();console.log(JSON.stringify({tested:results.length,errors:results.filter(r=>r.error).length,unavailable:results.filter(r=>r.unavailable).length,challenged:results.filter(r=>r.challenge).length,preventedWrites}));
})().catch(error=>{console.error(error.message);process.exitCode=1});
