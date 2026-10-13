const fs=require('node:fs');
const {parseHTML}=require('linkedom');
const dir='scraps/prelaunch-2026-10-12/';
(async()=>{
 const previous=JSON.parse(fs.readFileSync(dir+'external-verification.json','utf8'));
 const links=JSON.parse(fs.readFileSync(dir+'external-links.json','utf8'));
 const known=new Set(previous.results.map(r=>r.url));
 const results=[];
 for(const link of links.filter(r=>!known.has(r.url))){
  const started=Date.now();
  try{
   const response=await fetch(link.url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(20000)});
   const text=await response.text(),title=parseHTML(text).document.querySelector('title')?.textContent.trim()||null;
   results.push({...link,status:response.status,finalUrl:response.url,title,ms:Date.now()-started,result:response.status<400?'reachable':'http-error-needs-review',scope:'Read-only form entry HTML, not submission or medical scoring verification'});
  }catch(error){results.push({...link,result:'unverified-network-error',error:error.cause?.code||error.name,ms:Date.now()-started});}
 }
 const addendum={generatedAt:new Date().toISOString(),scope:'Only destinations newly introduced by the verified-source legacy form handoff repair. GET only; no submission, embed, webhook or account action.',results};
 fs.writeFileSync(dir+'external-handoff-addendum.json',JSON.stringify(addendum,null,2));
 if(!fs.existsSync(dir+'external-verification-63.json'))fs.copyFileSync(dir+'external-verification.json',dir+'external-verification-63.json');
 const all=[...previous.results,...results].filter(r=>links.some(link=>link.url===r.url)).map(r=>({...r,routes:links.find(link=>link.url===r.url).routes}));
 fs.writeFileSync(dir+'external-verification.json',JSON.stringify({...previous,updatedAt:addendum.generatedAt,scope:previous.scope+' The original63-target pass is preserved separately;3 newly recovered handoffs are in external-handoff-addendum.json.',tested:all.length,total:links.length,results:all},null,2));
 console.log(JSON.stringify({newDestinations:results,total:all.length,counts:Object.fromEntries([...new Set(all.map(r=>r.result))].map(k=>[k,all.filter(r=>r.result===k).length]))},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
