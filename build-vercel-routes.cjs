// Preserve observed public URLs when the new static site replaces the original host.
const fs=require('node:fs');
const pages=JSON.parse(fs.readFileSync('source-content/page-index.json','utf8'));
const routes=new Map(pages.map(p=>[p.key,p.route]));routes.set('','HRT Home.html');
for(const record of JSON.parse(fs.readFileSync('source-content/crawl.json','utf8'))) {
  if(record.error)continue;
  const from=new URL(record.url).pathname.replace(/^\/|\/$/g,'');
  const to=new URL(record.finalUrl).pathname.replace(/^\/|\/$/g,'');
  if(routes.has(to))routes.set(from,routes.get(to));
}
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const redirects=[
  {source:'/Shop.html',destination:'https://store.hrt.org/',permanent:false},
  {source:'/blog-categories/%20heart-health/:path*',destination:'/blog-categories/heart-health/index.html',permanent:true},
];
for(const [key,route] of [...routes].sort(([a],[b])=>a.localeCompare(b))) {
  if(!key || key.includes('%') || route.replace(/\/index\.html$/,'')===key || !fs.existsSync(route))continue;
  redirects.push({source:'/'+key,destination:'/'+route.split('/').map(encodeURIComponent).join('/'),permanent:true});
}
config.redirects=redirects;
fs.writeFileSync('vercel.json',JSON.stringify(config,null,2)+'\n');
console.log('Prepared '+redirects.length+' Vercel redirects from observed source routes.');
