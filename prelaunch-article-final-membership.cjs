const fs=require('fs'),{parseHTML}=require('linkedom');
const source=require('./source-content/category-membership.json');
const raw=require('./source-content/restored-data.json');
const out='scraps/prelaunch-2026-10-12/articles/final';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const rows=[];
 for(const c of source.categories){
  const routes=[raw.categories.find(a=>a.key===c.key).route];if(c.key.endsWith('/heart-health'))routes.push('blog-categories/%20heart-health/index.html');
  for(const route of routes){const r=await fetch('http://localhost:8013/'+route),{document}=parseHTML(await r.text());const actual=[...document.querySelectorAll('.source-card>a')].map(a=>a.getAttribute('href').replace(/\/index.html$/,''));rows.push({route,status:r.status,count:actual.length,expected:c.articles.length,missing:c.articles.filter(a=>!actual.includes(a)),unexpected:actual.filter(a=>!c.articles.includes(a)),duplicate:actual.length-new Set(actual).size,emptyState:document.querySelector('.category-empty')?.textContent||null})}
 }
 const asset=await (await fetch('http://localhost:8013/assets/restored-data.js')).text(),data=JSON.parse(asset.replace(/^window.HRT_SOURCE=/,'').replace(/;$/,''));
 const silos=data.silos.map(s=>({id:s.id,count:s.articles,featured:s.featured.href,categoryCards:s.cards.map(c=>({title:c.t,count:c.ct,href:c.href}))}));
 fs.writeFileSync(out+'/membership.json',JSON.stringify({rows,silos},null,2));
 if(rows.some(r=>r.status!==200||r.missing.length||r.unexpected.length||r.duplicate||(!r.count&&!r.emptyState)))throw Error('Category source mismatch');
 for(const c of source.categories){const actual=data.categories.find(a=>a.key===c.key).articles;if(JSON.stringify(actual)!==JSON.stringify(c.articles))throw Error('Resource membership mismatch: '+c.key)}
 console.log('All19 archives,18 Resource memberships,6 silo counts and source-backed features checked.');
})().catch(e=>{console.error(e);process.exitCode=1});
