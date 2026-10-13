const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({channel:'chrome'});const p=await b.newPage();await p.goto('http://localhost:8000/legal/consent-to-telehealth/index.html');await p.keyboard.press('Tab');console.log('before',await p.evaluate(()=>({url:location.href,focused:document.activeElement.outerHTML})));await p.keyboard.press('Enter');await p.waitForTimeout(1500);console.log('after',await p.evaluate(()=>({url:location.href,title:document.title,focused:document.activeElement.tagName})));await b.close()})();

