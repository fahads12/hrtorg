const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const http=require('http');
const babel=require('@babel/standalone');
const root=__dirname;
const mime={'.html':'text/html','.jsx':'text/plain','.js':'text/javascript','.css':'text/css','.png':'image/png'};
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{
 for(const name of fs.readdirSync(root).filter(n=>n.endsWith('.jsx'))){babel.transform(fs.readFileSync(path.join(root,name),'utf8'),{presets:['react'],filename:name});}
 console.log('PASS: all JSX parses');
 await new Promise(r=>server.listen(8765,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const name of fs.readdirSync(root).filter(n=>n.endsWith('.html'))){
  await page.goto('http://127.0.0.1:8765/'+encodeURIComponent(name));
  await page.waitForSelector('#root > *',{timeout:45000});
  const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));
  if(broken.length)throw Error('Broken images '+name+JSON.stringify(broken));
  console.log('PASS render:',name);
 }
 await page.goto('http://127.0.0.1:8765/HRT%20Home.html');await page.waitForSelector('.science-visual');
 for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(100);}
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1000);
 await page.screenshot({path:'scraps/redesign-desktop.png',fullPage:true});
 await page.locator('.testing-story').scrollIntoViewIfNeeded();await page.waitForTimeout(900);
 if(await page.locator('.testing-stage.is-visible').count()!==3)throw Error('Testing animation did not reveal');
 await page.getByRole('link',{name:'Get started with testing'}).click();await page.waitForSelector('.cz-shell');
 if(!await page.getByRole('button',{name:'Continue',exact:true}).isDisabled())throw Error('Intake must validate first step');
 console.log('PASS: testing CTA routes to intake; empty form blocked');
 await page.locator('.cz-gender button').first().click();
 await page.getByLabel('First name',{exact:true}).fill('Test');
 await page.getByLabel('Date of birth').fill('1980-01-01');
 await page.getByLabel('State you live in').selectOption('California');
 await page.getByLabel('Email',{exact:true}).fill('test@example.com');
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.reload();await page.waitForSelector('.cz-choices');
 await page.locator('.cz-choices button').first().click();
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.locator('.cz-chips button').first().click();
 await page.locator('.cz-scale button').nth(3).click();
 await page.locator('.cz-seg button').first().click();
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.getByRole('button',{name:'None of the above',exact:true}).click();
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 for(const row of await page.locator('.cz-row').all()){const buttons=row.locator('button');if(await buttons.count())await buttons.first().click();}
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 for(const consent of await page.locator('.cz-consent').all())await consent.click();
 await page.getByRole('button',{name:'Review my intake'}).click();
 await page.getByRole('button',{name:'Submit for provider review'}).click();
 await page.getByText('Intake submitted',{exact:true}).waitFor();
 console.log('PASS: intake save/resume, six steps, review, local confirmation');
 await page.goto('http://127.0.0.1:8765/HRT%20Home.html');await page.waitForSelector('.science-visual');
 for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(100);}
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1000);
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:900});await page.waitForTimeout(150);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Overflow at '+width);console.log('PASS width:',width);if(width===390)await page.screenshot({path:'scraps/redesign-mobile.png',fullPage:true});}
 await page.emulateMedia({reducedMotion:'reduce'});const hidden=await page.locator('[data-reveal]').evaluateAll(els=>els.filter(el=>getComputedStyle(el).opacity==='0').length);if(hidden)throw Error('Reduced motion hidden content');
 console.log('PASS: reduced-motion content visible');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: no browser runtime errors');
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1);});
