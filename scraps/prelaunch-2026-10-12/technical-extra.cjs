const fs=require('node:fs'),path=require('node:path');
const {parseHTML}=require('linkedom');
const pages=require('../../public-pages.cjs')();
const output='scraps/prelaunch-2026-10-12', origin='http://localhost:8013';
const source=JSON.parse(fs.readFileSync('source-content/page-index.json','utf8'));
const published=new Set();
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else published.add(path.relative('dist',file).replaceAll('\\','/'));}}
walk('dist');
const sourceRoutes=new Set(source.map(p=>p.route));
const manifest=JSON.parse(fs.readFileSync('scraps/prelaunch/metadata.json','utf8'));
const sitemap=[...fs.readFileSync('dist/sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const sitemapErrors=[];
for(const href of sitemap){const url=new URL(href);const file=decodeURIComponent(url.pathname).slice(1)||'index.html';if(url.origin!=='https://hrt.org'||!published.has(file))sitemapErrors.push({href,error:'invalid-origin-or-unpublished-path'});const row=manifest.routes.find(p=>p.route===file);if(row?.unavailable)sitemapErrors.push({href,error:'unavailable-content-in-sitemap'});}
const developmentReferences=[],secretPatterns=[];
const patterns={privateKey:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,openaiKey:/\bsk-(?:proj-)?[A-Za-z0-9_-]{35,}/,awsAccessKey:/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,googleApiKey:/\bAIza[0-9A-Za-z_-]{35}\b/,stripeSecret:/\bsk_(?:live|test)_[A-Za-z0-9]{20,}/,githubToken:/\bgh[pousr]_[A-Za-z0-9]{30,}/,slackToken:/\bxox[baprs]-[0-9A-Za-z-]{20,}/,credentialedUrl:/https?:\/\/[^\s"'/:]+:[^\s"'@]+@/};
for(const file of published){if(!/\.(?:html|js|css|txt|xml)$/.test(file))continue;const body=fs.readFileSync(path.join('dist',file),'utf8');for(const[kind,re]of Object.entries(patterns))if(re.test(body))secretPatterns.push({file,kind});if(/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?=[:/])/i.test(body))developmentReferences.push(file);}
(async()=>{
 const rows=[];let cursor=0;
 await Promise.all(Array.from({length:8},async()=>{while(cursor<pages.length){const file=pages[cursor++];const url=origin+'/'+file.split('/').map(encodeURIComponent).join('/');const response=await fetch(url,{redirect:'manual'});const doc=parseHTML(fs.readFileSync(path.join('dist',file),'utf8')).document;const expected=file==='Shop.html'?307:file==='blog-categories/%20heart-health/index.html'?308:200;rows.push({route:file,sourceIndexed:sourceRoutes.has(file),status:response.status,expectedStatus:expected,httpPass:response.status===expected,title:doc.querySelector('title')?.textContent,canonical:doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),robots:doc.querySelector('meta[name="robots"]')?.getAttribute('content'),sitemapListed:sitemap.includes(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')),visualReview:'See root route ledger; this file records HTTP/static checks only'});}}));
 rows.sort((a,b)=>a.route.localeCompare(b.route));
 const badPaths=[];for(const route of ['/%00.html','/%0A.html','/%7F.html','/%E0%A4%A']){const r=await fetch(origin+route);badPaths.push({route,status:r.status,expectedStatus:400});}
 const healthy=await fetch(origin+'/index.html');
 const result={generatedAt:new Date().toISOString(),sourceIndexedPages:source.length,publicHtmlPages:pages.length,publishedFiles:published.size,sourceRoutesMissingFromPublic:[...sourceRoutes].filter(route=>!pages.includes(route)),newPublicRoutes:pages.filter(route=>!sourceRoutes.has(route)),sitemapUrls:sitemap.length,uniqueSitemapUrls:new Set(sitemap).size,sitemapErrors,developmentReferences,secretPatternFindings:secretPatterns,invalidPathRegression:{requests:badPaths,healthyStatusAfter:healthy.status},routes:rows};
 fs.writeFileSync(output+'/technical-extra.json',JSON.stringify(result,null,2));
 const columns=['route','sourceIndexed','status','expectedStatus','httpPass','title','canonical','robots','sitemapListed','visualReview'];
 const escape=v=>'"'+String(v??'').replaceAll('"','""')+'"';
 fs.writeFileSync(output+'/technical-route-checklist.csv',columns.join(',')+'\n'+rows.map(row=>columns.map(key=>escape(row[key])).join(',')).join('\n')+'\n');
 console.log(JSON.stringify({...result,routes:undefined,newPublicRoutes:result.newPublicRoutes.length,httpFailures:rows.filter(row=>!row.httpPass)},null,2));
})().catch(error=>{console.error(error.message);process.exitCode=1});
