const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true}),p=await b.newPage({viewport:{width:390,height:900}}),rows=[];
 await p.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
 for(const gender of ['men','women'])for(const key of ['hrt','peptides','weight','sexual','hair','ed']){
  await p.goto(`http://localhost:8013/Product.html?g=${gender}&p=${key}`,{waitUntil:'networkidle'});
  await p.locator('.p-hero-ctas a').first().click();await p.waitForSelector('#fn');
  assert.equal(await p.locator('.cz-gender .sel .nm').innerText(),gender==='men'?'A man':'A woman');
  const selected=new URL(p.url()).searchParams;assert.equal(selected.get('p'),key==='ed'?'sexual':key);
  rows.push({gender,product:key,guideGender:selected.get('g'),guideGoal:selected.get('p'),passed:true});
 }
 await p.goto('http://localhost:8013/Pricing.html',{waitUntil:'networkidle'});
 const links=await p.locator('.pr-cats a').evaluateAll(es=>es.map(e=>({href:e.href,text:e.innerText})));
 assert.equal(links.length,5);assert(links.every(e=>e.href.includes('Treatments.html#treatment-')));
 for(const link of links){await p.goto(link.href,{waitUntil:'networkidle'});const id=new URL(link.href).hash;assert.equal(await p.locator(id).count(),1);assert.equal(await p.locator(id+' .tx-card-link').count(),2);}
 await p.goto('http://localhost:8013/Audience.html?g=women',{waitUntil:'networkidle'});
 assert.match(await p.locator('.aud-treatment-image').last().getAttribute('src'),/tx-hair-women/);
 await p.locator('.mobile-menu').click();await p.locator('#site-navigation a[href="Audience.html?g=men"]').click();await p.waitForTimeout(500);
 assert.match(await p.locator('.aud-treatment-image').last().getAttribute('src'),/hair-care/);
 fs.writeFileSync(__dirname+'/context-handoffs.json',JSON.stringify({productGuideCases:rows,pricingLinks:links,pricingAudienceChoices:true,audienceImageSwitch:true},null,2));
 await b.close();console.log('PASS 12 product guide contexts, 5 neutral pricing destinations, audience-specific image switching');
})().catch(e=>{console.error(e);process.exitCode=1});
