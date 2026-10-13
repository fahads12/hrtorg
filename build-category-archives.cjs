// Collection membership comes from archived HRT.org category grids, including
// every pagination page. Shared navigation/footer links are not category posts.
const fs=require('fs'),{parseHTML}=require('linkedom');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
module.exports=function buildCategoryArchives(raw){
 const archive=JSON.parse(fs.readFileSync('source-content/category-membership.json','utf8'));
 const membership=new Map(archive.categories.map(c=>[c.key,c.articles]));
 const articles=new Map(raw.articles.map(p=>[p.key,p]));
 const written=[];
 for(const category of raw.categories){
  if(!membership.has(category.key))throw Error('Missing archived category: '+category.key);
  category.articles=membership.get(category.key);
  const items=category.articles.map(key=>{if(!articles.has(key))throw Error('Missing category article: '+key);return articles.get(key)}).sort((a,b)=>a.title.localeCompare(b.title));
  const cards=items.map(p=>{
   const image=p.image?'<img src="'+escape(p.image)+'" alt="" loading="lazy" decoding="async" width="640" height="400">':'<div class="card-mark" aria-hidden="true">HRT<span>health &amp; knowledge</span></div>';
   return '<article class="source-card" data-reveal data-search="'+escape((p.title+' '+p.key).toLowerCase())+'"><a href="'+escape(p.route)+'">'+image+'<div><span class="eyebrow">health</span><h2>'+escape(p.title)+'</h2><span class="text-link">Read more →</span></div></a></article>';
  }).join('');
  const routes=[category.route];if(category.key==='blog-categories/heart-health')routes.push('blog-categories/%20heart-health/index.html');
  for(const route of routes){
   let html=fs.readFileSync(route,'utf8');const {document}=parseHTML(html);const grid=document.querySelector('.source-grid');if(!grid)throw Error('Missing category grid: '+route);
   const old=grid.outerHTML;if(!html.includes(old))throw Error('Category grid could not be safely replaced: '+route);grid.innerHTML=cards;
   html=html.replace(old,grid.outerHTML).replace(/<p class="category-empty">[\s\S]*?<\/p>/g,'');
   if(!items.length)html=html.replace(grid.outerHTML,grid.outerHTML+'<p class="category-empty">No articles have been published in this collection yet.</p>');
   fs.writeFileSync(route,html);written.push(route);
  }
 }
 return written;
};
