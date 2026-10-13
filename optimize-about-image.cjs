// Deterministic responsive derivative of the approved About photograph.
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage();
 const raw=fs.readFileSync('uploads/generated/wellness-editorial.webp').toString('base64');
 const result=await page.evaluate(async raw=>{
  const img=new Image();img.src='data:image/webp;base64,'+raw;await img.decode();
  const canvas=document.createElement('canvas');canvas.width=720;canvas.height=Math.round(img.height*720/img.width);
  canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
  return {data:canvas.toDataURL('image/webp',.84).split(',')[1],width:canvas.width,height:canvas.height};
 },raw);
 const file='uploads/generated/wellness-editorial-720.webp';fs.writeFileSync(file,Buffer.from(result.data,'base64'));
 await browser.close();console.log(JSON.stringify({file,width:result.width,height:result.height,bytes:fs.statSync(file).size}));
})().catch(error=>{console.error(error);process.exitCode=1});
