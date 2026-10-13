const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const babel = require('@babel/standalone');
const {chromium} = require('playwright');
const out = path.join(__dirname, 'auth');
fs.mkdirSync(out, {recursive:true});
fs.writeFileSync(path.join(out, 'auth.js'), babel.transform(fs.readFileSync('portal-auth.jsx','utf8'), {presets:[['react',{runtime:'classic'}]]}).code);
fs.writeFileSync(path.join(out, 'index.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/portal-reference.css"><link rel="stylesheet" href="/portal-base.css"><link rel="stylesheet" href="/portal-auth.css"></head><body class="portal"><div id="root"></div><script src="/assets/react.production.min.js"></script><script src="/assets/react-dom.production.min.js"></script><script src="auth.js"></script><script>window.demoResults=[];function mount(view){ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(window.HRTPortalAuth,{view,navigate:p=>{location.href="?view="+(p==="/"?"login":p.slice(1))},onEnterDemo:p=>window.demoResults.push(p)}));}mount(new URLSearchParams(location.search).get("view")||"login");</script></body></html>');

(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const context = await browser.newContext();
 const unexpectedRequests=[],errors=[],results=[];
 await context.route('**/*', async route => {
  const request=route.request();
  if(!request.url().startsWith('http://localhost:8014/') || request.method()!=='GET') {
   unexpectedRequests.push({url:request.url(),method:request.method()});
   return route.abort();
  }
  let file=path.resolve(process.cwd(),'.'+decodeURIComponent(new URL(request.url()).pathname));
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!file.startsWith(process.cwd()+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'Not found'});
  const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png'};
  return route.fulfill({status:200,path:file,contentType:mime[path.extname(file)]||'application/octet-stream'});
 });
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(String(error)));
 async function load(view,width=1440) {
  await page.setViewportSize({width,height:width===1440?1000:844});
  await page.goto('http://localhost:8014/scraps/portal-ui/auth/?view='+view,{waitUntil:'networkidle'});
  await page.locator('button[type=submit]').waitFor();
  await page.waitForFunction(()=>!document.querySelector('button[type=submit]').disabled);
  await page.evaluate(()=>document.fonts.ready);
 }
 for(const view of ['login','register','recover-password'])for(const width of [1440,390]) {
  await load(view,width);
  const data=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),h1:[...document.querySelectorAll('h1')].map(i=>i.textContent),rects:[...document.querySelectorAll('header,main,footer,form,.left_part,.right_part,.testimonial')].map(e=>({class:e.className,tag:e.tagName,x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))}));
  assert.equal(data.overflow,false,view+' overflow '+width);
  assert.deepEqual(data.images,[],view+' broken images');
  const screenshot=path.join(out,view+'-'+width+'.png');
  await page.screenshot({path:screenshot,fullPage:true});
  results.push({view,width,screenshot,...data});
 }
 await load('login');
 await page.locator('button[type=submit]').click();
 assert.equal(await page.locator('[aria-invalid=true]').count(),2);
 assert.equal(await page.evaluate(()=>document.activeElement.name),'email');
 await page.getByLabel('Email',{exact:true}).fill('jordan@example.com');
 await page.getByLabel('Password',{exact:true}).fill('SamplePreview!8');
 await page.locator('button[type=submit]').click();
 assert.deepEqual(await page.evaluate(()=>window.demoResults),[{role:'patient',email:'jordan@example.com'}]);
 assert.equal(await page.getByLabel('Password',{exact:true}).inputValue(),'');
 results.push({check:'login required fields, focus, local success, password cleared',pass:true});

 await load('register');
 await page.locator('button[type=submit]').click();
 assert.equal(await page.locator('[aria-invalid=true]').count(),5);
 await page.getByLabel('First Name',{exact:true}).fill('Jordan');
 await page.getByLabel('Last Name',{exact:true}).fill('Taylor');
 await page.getByLabel('Email',{exact:true}).fill('jordan@example.com');
 await page.getByLabel('Password',{exact:true}).fill('weak');
 await page.getByRole('button',{name:'Show password',exact:true}).click();
 assert.equal(await page.getByLabel('Password',{exact:true}).getAttribute('type'),'text');
 await page.getByRole('button',{name:'Hide password',exact:true}).click();
 assert.equal(await page.getByLabel('Password',{exact:true}).getAttribute('type'),'password');
 await page.locator('button[type=submit]').click();
 assert.match(await page.locator('#portal-auth-password-error').innerText(),/8 Characters/);
 await page.getByLabel('Password',{exact:true}).fill('SamplePreview!8');
 await page.getByRole('checkbox').check();
 await page.locator('button[type=submit]').click();
 assert.deepEqual(await page.evaluate(()=>window.demoResults),[{role:'patient',email:'jordan@example.com',firstName:'Jordan',lastName:'Taylor'}]);
 assert.equal(await page.getByLabel('Password',{exact:true}).inputValue(),'');
 results.push({check:'patient signup validation, visibility, terms, local success, password cleared',pass:true});

 await load('register',390);
 await page.getByRole('button',{name:'I am a Provider',exact:true}).click();
 assert.equal(await page.locator('input').count(),10);
 await page.screenshot({path:path.join(out,'provider-390.png'),fullPage:true});
 await page.locator('button[type=submit]').click();
 assert.equal(await page.locator('[aria-invalid=true]').count(),10);
 for(const [label,value] of [['First Name','Jordan'],['Last Name','Taylor'],['Email','provider@example.com'],['Password','SamplePreview!8'],['NPI Number','1234567890'],['License Number','DEMO123'],['License State','CA'],['Organization Name','Sample Clinic'],['Phone Number','invalid']])await page.getByLabel(label,{exact:true}).fill(value);
 await page.getByRole('checkbox').check();
 await page.locator('button[type=submit]').click();
 assert.match(await page.locator('#portal-auth-phoneNumber-error').innerText(),/valid phone/);
 await page.getByLabel('Phone Number',{exact:true}).fill('+15555550100');
 await page.locator('button[type=submit]').click();
 assert.deepEqual(await page.evaluate(()=>window.demoResults),[{role:'provider',email:'provider@example.com',firstName:'Jordan',lastName:'Taylor'}]);
 await page.getByRole('button',{name:'I am a Patient',exact:true}).click();
 assert.equal(await page.locator('input').count(),5);
 assert.equal(await page.getByLabel('Password',{exact:true}).inputValue(),'');
 results.push({check:'provider fields, required and phone validation, local success, role reset',pass:true});

 await load('recover-password',390);
 await page.locator('button[type=submit]').click();
 assert.match(await page.locator('#portal-auth-email-error').innerText(),/required/);
 await page.getByLabel('Email',{exact:true}).fill('invalid');
 await page.locator('button[type=submit]').click();
 assert.match(await page.locator('#portal-auth-email-error').innerText(),/valid/);
 await page.getByLabel('Email',{exact:true}).fill('jordan@example.com');
 await page.locator('button[type=submit]').click();
 assert.match(await page.getByRole('status').innerText(),/no recovery email was sent/);
 assert.equal(await page.evaluate(()=>window.demoResults.length),0);
 await page.screenshot({path:path.join(out,'recover-confirmation-390.png'),fullPage:true});
 await page.getByRole('button',{name:'Toggle navigation'}).click();
 assert.equal(await page.getByRole('button',{name:'Toggle navigation'}).getAttribute('aria-expanded'),'true');
 await page.getByRole('link',{name:'Sign Up',exact:true}).click();
 assert.match(page.url(),/view=register/);
 assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 results.push({check:'recovery validation, no-email confirmation, mobile menu and navigation, no storage',pass:true});
 assert.deepEqual(unexpectedRequests,[]);
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,unexpectedRequests,errors},null,2));
 await browser.close();
 console.log(JSON.stringify({captures:8,functionalChecks:5,unexpectedRequests,errors}));
})().catch(error=>{console.error(error);process.exit(1);});
