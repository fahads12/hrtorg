const fs=require('node:fs');
const {DOMParser}=require('linkedom');
const routes=require('../../public-pages.cjs')();
const rows=routes.map(route=>{
 const doc=new DOMParser().parseFromString(fs.readFileSync('dist/'+route,'utf8'),'text/html');
 const jsonld=[...doc.querySelectorAll('script[type="application/ld+json"]')].map(script=>{
  try {const data=JSON.parse(script.textContent);return {parse:true,topLevelTypes:Array.isArray(data)?data.map(x=>x['@type']):data['@type']||null,context:Array.isArray(data)?null:data['@context']||null};}
  catch(error){return {parse:false,error:error.message};}
 });
 return {route,jsonld,microdata:doc.querySelectorAll('[itemscope],[itemtype]').length,rdfa:doc.querySelectorAll('[typeof],[vocab]').length};
});
const result={scope:'Presence and JSON syntax only, not a search-engine rich-result eligibility test. No structured data is emitted in this artifact, so none was submitted to a remote validator.',routes:rows.length,jsonldBlocks:rows.reduce((n,r)=>n+r.jsonld.length,0),microdataElements:rows.reduce((n,r)=>n+r.microdata,0),rdfaElements:rows.reduce((n,r)=>n+r.rdfa,0),parseFailures:rows.filter(r=>r.jsonld.some(x=>!x.parse)),rows};
fs.writeFileSync('scraps/prelaunch-2026-10-12/structured-data-verification.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,rows:undefined}));
