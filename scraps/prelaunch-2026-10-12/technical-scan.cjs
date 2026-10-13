const fs=require('node:fs'),path=require('node:path');
const {parseHTML}=require('linkedom');
const pages=require('../../public-pages.cjs')();
const root=path.resolve('dist'),origin='http://localhost:8013';
const out='scraps/prelaunch-2026-10-12';fs.mkdirSync(out,{recursive:true});
const published=new Set();
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else published.add(path.relative(root,f).replaceAll('\\','/'));}}walk(root);
const targets=new Map(),external=new Map(),failures=[],rows=[],secrets=[];
const documents=new Map();
for(const file of pages)documents.set(file,parseHTML(fs.readFileSync(path.join(root,file),'utf8')).document);
function targetFile(url){let file=decodeURIComponent(url.pathname).replace(/^\//,'');if(!file||file.endsWith('/'))file+='index.html';if(!path.extname(file))file+='/index.html';return file;}
for(const [file,doc] of documents){
 const base=new URL(doc.querySelector('base')?.getAttribute('href')||'',origin+'/'+file.split('/').map(encodeURIComponent).join('/'));
 const row={route:file,title:doc.querySelector('title')?.textContent,description:doc.querySelector('meta[name="description"]')?.getAttribute('content'),canonical:doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),h1:[...doc.querySelectorAll('h1')].filter(el=>!el.closest('noscript,template')).length,robots:doc.querySelector('meta[name="robots"]')?.getAttribute('content'),og:!!doc.querySelector('meta[property="og:title"]'),emptyRoot:!!doc.querySelector('#root:empty'),issues:[]};
 for(const key of ['title','description','canonical','og'])if(!row[key])row.issues.push('Missing '+key);
 if(row.h1!==1&&!['Shop.html','HRT Landing.html'].includes(file))row.issues.push('H1 count '+row.h1);
 if(row.emptyRoot)row.issues.push('Empty React root');
 for(const el of doc.querySelectorAll('a[href],img[src],script[src],link[href],source[srcset],img[srcset]')){
  const values=[];
  if(el.hasAttribute('href'))values.push(el.getAttribute('href'));
  if(el.hasAttribute('src'))values.push(el.getAttribute('src'));
  if(el.hasAttribute('srcset'))values.push(...el.getAttribute('srcset').split(',').map(s=>s.trim().split(/\s+/)[0]));
  for(const href of values){
   if(!href||/^(?:mailto:|tel:|data:|javascript:)/i.test(href))continue;
   let url;try{url=new URL(href,base);}catch{row.issues.push('Malformed link');continue;}
   if(url.origin!==origin){if(el.tagName==='A'){const refs=external.get(url.href)||[];refs.push(file);external.set(url.href,refs);}continue;}
   const target=targetFile(url);
   if(!published.has(target)){row.issues.push('Missing/case-mismatched target: '+target);continue;}
   if(url.hash&&documents.has(target)){
    let id;try{id=decodeURIComponent(url.hash.slice(1));}catch{row.issues.push('Malformed anchor');continue;}
    if(id&&!documents.get(target).getElementById(id)&&!['men','women'].includes(id))row.issues.push('Missing anchor: '+target+url.hash);
   }
   const request=url.href.split('#')[0];const refs=targets.get(request)||[];refs.push(file);targets.set(request,refs);
  }
 }
 for(const script of doc.querySelectorAll('script[type="application/ld+json"]'))try{JSON.parse(script.textContent)}catch{row.issues.push('Invalid structured data');}
 if(row.issues.length)failures.push({route:file,issues:[...new Set(row.issues)]});rows.push(row);
}
for(const file of published){
 if(!/\.(?:html|js|css|txt|xml)$/.test(file))continue;
 const body=fs.readFileSync(path.join(root,file),'utf8');
 const patterns={privateKey:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,openaiKey:/\bsk-(?:proj-)?[A-Za-z0-9_-]{35,}/,awsAccessKey:/\bAKIA[A-Z0-9]{16}\b/,googleApiKey:/\bAIza[0-9A-Za-z_-]{35}\b/,credentialedUrl:/https?:\/\/[^\s"'/:]+:[^\s"'@]+@/};
 for(const [kind,re] of Object.entries(patterns))if(re.test(body))secrets.push({file,kind});
}
(async()=>{
 let cursor=0;const requests=[...targets.keys()],http=[];
 await Promise.all(Array.from({length:8},async()=>{while(cursor<requests.length){const url=requests[cursor++];try{const r=await fetch(url,{method:'HEAD',redirect:'manual'});if(r.status>=300&&r.status<400){const final=await fetch(url,{method:'HEAD'});http.push({url,redirect:r.status,finalUrl:final.url,status:final.status});}else http.push({url,status:r.status});}catch(e){http.push({url,error:e.message});}}}));
 const invalid=[];
 for(const pathname of ['/missing-prelaunch-page','/health/does-not-exist/index.html','/source-content/page-index.json','/SOURCE-CONTENT/html/','/.git/config','/scraps/prelaunch/metadata.json','/node_modules/react/package.json']){const r=await fetch(origin+pathname);invalid.push({path:pathname,status:r.status,branded404:(await r.text()).includes('We couldn')});}
 const result={generatedAt:new Date().toISOString(),scope:'Allowlisted dist served locally; this does not verify Vercel edge behavior',htmlRoutes:pages.length,publishedFiles:published.size,distinctLocalTargets:targets.size,externalDestinations:external.size,metadataFailures:failures,secretPatternFindings:secrets,httpFailures:http.filter(r=>r.status!==200),invalidRoutes:invalid,routes:rows};
 fs.writeFileSync(out+'/technical.json',JSON.stringify(result,null,2));fs.writeFileSync(out+'/internal-links.json',JSON.stringify(http,null,2));fs.writeFileSync(out+'/external-links.json',JSON.stringify([...external].map(([url,routes])=>({url,routes:[...new Set(routes)]})),null,2));
 console.log(JSON.stringify({...result,routes:undefined},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});

