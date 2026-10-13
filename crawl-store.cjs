const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage();
 let products=[];
 for(let n=1;n<=20;n++){
  const url=`https://store.hrt.org/products.json?limit=250&page=${n}`;
  await page.goto(url,{waitUntil:'domcontentloaded'});
  const data=JSON.parse(await page.locator('body').innerText());
  products.push(...data.products);console.log('Catalog page',n,data.products.length);
  if(data.products.length<250)break;
 }
 fs.writeFileSync('source-content/store-products.json',JSON.stringify(products,null,2));
 const targets=['https://store.hrt.org/','https://store.hrt.org/policies/privacy-policy','https://store.hrt.org/policies/refund-policy','https://store.hrt.org/policies/terms-of-service','https://store.hrt.org/policies/shipping-policy'];
 targets.push(...products.filter(p=>/test|panel|kit/i.test(p.product_type+' '+p.title)).map(p=>'https://store.hrt.org/products/'+p.handle));
 fs.mkdirSync('source-content/store-html',{recursive:true});
 const report=[];
 for(const url of targets){try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  const slug=new URL(url).pathname.replaceAll('/','__')||'home';
  fs.writeFileSync('source-content/store-html/'+slug+'.html',await page.content());
  report.push({url,status:response.status(),file:slug+'.html',finalUrl:page.url()});
  console.log(response.status(),url);
 }catch(error){report.push({url,error:String(error)});console.log('ERROR',url)}}
 fs.writeFileSync('source-content/store-crawl.json',JSON.stringify(report,null,2));
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
