const {chromium}=require('playwright');
const fs=require('node:fs');
const babel=require('@babel/standalone');
(async()=>{
  for(const file of fs.readdirSync(__dirname).filter(file=>file.endsWith('.jsx')))babel.transform(fs.readFileSync(file,'utf8'),{presets:['react'],filename:file});
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:8000/HRT%20Home.html?v=symptom-check');
    const trigger=page.getByRole('button',{name:'Symptom Check',exact:true});
    await trigger.click();
    const links=await page.locator('.symptom-nav-dropdown a').evaluateAll(links=>links.map(link=>({href:link.getAttribute('href'),label:link.textContent})));
    if(links.length!==9)throw Error('Expected nine assessment links');
    await page.screenshot({path:'scraps/symptom-menu-desktop.png'});
    await page.keyboard.press('Escape');
    if(await trigger.getAttribute('aria-expanded')!=='false')throw Error('Escape did not close menu');
    await trigger.focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');
    if(!(await page.locator('.symptom-nav-dropdown a').first().evaluate(link=>link===document.activeElement)))throw Error('Keyboard navigation failed');
    await page.mouse.click(1400,900);
    if(await trigger.getAttribute('aria-expanded')!=='false')throw Error('Outside click did not close menu');
    for(const link of links){
      await page.goto('http://127.0.0.1:8000/'+encodeURI(link.href));
      await page.waitForSelector('.self-check-option');
      await page.getByRole('checkbox').first().check();
      await page.locator('textarea').fill('Synthetic test note');
      await page.getByRole('button',{name:'Review my checklist'}).click();
      await page.getByRole('heading',{name:'Your conversation notes'}).waitFor();
      if(await page.locator('.self-check-summary li').count()!==1)throw Error('Summary selection missing '+link.label);
      if(await page.locator('.self-check-user-notes').textContent()!=='Synthetic test note')throw Error('Notes missing');
      console.log('PASS:',link.label);
    }
    await page.goto('http://127.0.0.1:8000/HRT%20Home.html?v=symptom-mobile');
    await page.setViewportSize({width:390,height:844});
    await page.getByRole('button',{name:'Symptom Check',exact:true}).click();
    const box=await page.locator('.symptom-nav-dropdown').boundingBox();
    if(box.x<0||box.x+box.width>390||box.y+box.height>844)throw Error('Mobile menu outside viewport');
    await page.locator('.symptom-nav-dropdown a').last().scrollIntoViewIfNeeded();
    await page.screenshot({path:'scraps/symptom-menu-mobile.png'});
    await page.locator('.symptom-nav-dropdown a').last().click();
    await page.waitForSelector('.self-check-option');
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile self-check overflows');
    console.log('PASS: menu keyboard, Escape, outside-click, mobile menu and checklist layout');
    if(errors.length)throw Error(errors.join('\n'));
    console.log('PASS: JSX syntax and no runtime errors');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
