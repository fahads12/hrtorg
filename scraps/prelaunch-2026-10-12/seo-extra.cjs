const fs=require('node:fs'),path=require('node:path');
const {parseHTML}=require('linkedom');
const routes=require('../../public-pages.cjs')();
const rows=[];
for(const route of routes){
 const doc=parseHTML(fs.readFileSync(path.join('dist',route),'utf8')).document,issues=[];
 const meta=name=>doc.querySelector(`meta[property="${name}"],meta[name="${name}"]`)?.getAttribute('content');
 const canonical=doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
 if(doc.documentElement.getAttribute('lang')!=='en')issues.push('Missing expected English language');
 if(!/width=device-width/.test(meta('viewport')||''))issues.push('Missing responsive viewport');
 if(!doc.querySelector('meta[charset]'))issues.push('Missing charset');
 for(const field of ['og:title','og:description','og:type','og:url','og:image','og:image:alt','twitter:card','twitter:title','twitter:description','twitter:image'])if(!meta(field))issues.push('Missing '+field);
 const c=new URL(canonical);if(c.origin!=='https://hrt.org'||c.search||c.hash)issues.push('Canonical format');
 if(meta('og:url')!==canonical)issues.push('OG/canonical mismatch');
 const image=new URL(meta('og:image'));if(image.origin==='https://hrt.org'&&!fs.existsSync(path.join('dist',decodeURIComponent(image.pathname))))issues.push('Missing local OG image');
 rows.push({route,issues});
}
const result={scope:'All emitted pages: language, viewport, charset, Open Graph/Twitter fields, canonical format/alignment, local social image existence. Does not simulate a social network crawler.',routes:rows.length,failures:rows.filter(r=>r.issues.length),rows};
fs.writeFileSync('scraps/prelaunch-2026-10-12/seo-extra-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,rows:undefined}));
