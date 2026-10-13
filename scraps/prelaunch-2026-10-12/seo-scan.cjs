const fs=require('node:fs');const{parseHTML}=require('linkedom');
const out='scraps/prelaunch-2026-10-12';
const manifest=JSON.parse(fs.readFileSync('scraps/prelaunch/metadata.json','utf8'));
const groups=field=>{
 const map=new Map();for(const row of manifest.routes){map.set(row[field],[...(map.get(row[field])||[]),row]);}
 return[...map].filter(([,rows])=>rows.length>1).map(([value,rows])=>({value,routes:rows.map(p=>p.route),canonicals:[...new Set(rows.map(p=>p.canonical))],eligibleCanonicalCount:new Set(rows.filter(p=>p.indexable||['index.html','HRT Home.html'].includes(p.route)).map(p=>p.canonical)).size}));
};
(async()=>{
 const queryRows=[];
 const queries=['Audience.html?g=women','Audience.html?g=men','Treatments.html?g=women','Treatments.html?g=men','Resources.html?q=menopause','Consultation.html?g=men&p=hair'];
 for(const g of ['women','men'])for(const p of ['hrt','peptides','weight','sexual','hair','ed','invalid'])queries.push(`Product.html?p=${p}&g=${g}`);
 for(const route of queries){const response=await fetch('http://localhost:8013/'+route);const document=parseHTML(await response.text()).document;const canonical=document.querySelector('link[rel="canonical"]')?.getAttribute('href');const robots=document.querySelector('meta[name="robots"]')?.getAttribute('content');queryRows.push({route,status:response.status,title:document.querySelector('title')?.textContent,canonical,robots,canonicalHasQuery:!!new URL(canonical).search,productPermanentlyExcluded:!route.startsWith('Product')||!manifest.routes.find(r=>r.route==='Product.html').indexable});}
 const result={scope:'Static emitted metadata, exact duplicate grouping accounting for canonical aliases, and20 direct query-response documents. Preview noindex remains enabled. Product variations are permanent-noindex; audience/filter views canonically identify their shared generic base page.',duplicateTitles:groups('title'),duplicateDescriptions:groups('description'),canonicalAliases:groups('canonical'),queryRows};
 result.actionableDuplicateTitles=result.duplicateTitles.filter(g=>g.eligibleCanonicalCount>1);result.actionableDuplicateDescriptions=result.duplicateDescriptions.filter(g=>g.eligibleCanonicalCount>1);
 fs.writeFileSync(out+'/seo-verification.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify({queries:queryRows.length,queryFailures:queryRows.filter(r=>r.status!==200||r.canonicalHasQuery||!r.productPermanentlyExcluded),actionableDuplicateTitles:result.actionableDuplicateTitles,actionableDuplicateDescriptions:result.actionableDuplicateDescriptions}));
})().catch(e=>{console.error(e.message);process.exitCode=1});
