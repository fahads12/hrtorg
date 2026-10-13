const fs=require('fs'),path=require('path'),{parseHTML}=require('linkedom');
const raw=require('./source-content/restored-data.json');
const out='source-content/category-pages';fs.mkdirSync(out,{recursive:true});
const known=new Set(raw.articles.map(a=>a.key));
function extract(html,url){const {document}=parseHTML(html);return {articles:[...new Set([...document.querySelectorAll('.blog-grid a[href]')].map(a=>new URL(a.getAttribute('href'),url).pathname.replace(/^\/|\/$/g,'')).filter(s=>s.startsWith('health/')))],next:document.querySelector('.w-pagination-next')?.getAttribute('href')};}
(async()=>{
 const result=[];
 for(let i=0;i<raw.categories.length;i+=3) await Promise.all(raw.categories.slice(i,i+3).map(async c=>{
  const slug=c.key.split('/')[1],first='https://www.hrt.org/'+c.key;
  const archived=extract(fs.readFileSync('source-content/html/'+c.key.replaceAll('/','__')+'.html','utf8'),first);
  let url=first,page=0,articles=[],sources=[],firstMatches=false;
  do{
   const r=await fetch(url);if(!r.ok)throw Error(url+' '+r.status);const html=await r.text(),members=extract(html,url);page++;
   if(page===1)firstMatches=JSON.stringify(members.articles)===JSON.stringify(archived.articles);
   const file=out+'/'+slug+'--'+page+'.html';fs.writeFileSync(file,html);sources.push({url,file,status:r.status,count:members.articles.length});articles.push(...members.articles);
   url=members.next?new URL(members.next,url).href:null;if(page>20)throw Error('Pagination loop '+c.key);
  }while(url);
  articles=[...new Set(articles)];const row={key:c.key,articles,sources,archivedFirstPageMatches:firstMatches,missingLocal:articles.filter(k=>!known.has(k))};result.push(row);console.log(slug,articles.length,'pages',page,'unchanged',firstMatches,'missing',row.missingLocal.length);
 }));
 result.sort((a,b)=>a.key.localeCompare(b.key));fs.writeFileSync('source-content/category-membership.json',JSON.stringify({retrievedAt:new Date().toISOString(),selector:'.blog-grid a[href]',categories:result},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
