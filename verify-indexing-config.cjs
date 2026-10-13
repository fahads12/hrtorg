// Exercise the real metadata builder only in a private copied fixture.
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,fixture=path.join(root,'scraps/prelaunch/indexing-fixture');
const build=require('./build-page-metadata.cjs');
const {parseHTML}=require('linkedom');
const files=['About.html','404.html','glp-1/quiz/index.html','checklist/weight-loss/index.html'];
for(const file of files){fs.mkdirSync(path.dirname(path.join(fixture,file)),{recursive:true});fs.copyFileSync(path.join(root,'dist',file),path.join(fixture,file));}
const saved={cwd:process.cwd(),env:process.env.VERCEL_ENV,flag:process.env.HRT_ALLOW_INDEXING},rows=[];
try {
 process.chdir(fixture);
 for(const [environment,flag,expected] of [['preview','true',false],['production','false',false],['production','true',true]]) {
  process.env.VERCEL_ENV=environment;process.env.HRT_ALLOW_INDEXING=flag;build();
  const robots=fs.readFileSync('robots.txt','utf8'),sitemap=fs.readFileSync('sitemap.xml','utf8');
  const pages=files.map(file=>({file,robots:parseHTML(fs.readFileSync(file,'utf8')).document.querySelector('meta[name="robots"]').getAttribute('content')}));
  const pass=pages[0].robots===(expected?'index, follow':'noindex, follow')&&pages.slice(1).every(p=>p.robots==='noindex, follow')&&robots.includes(expected?'Allow: /':'Disallow: /')&&!sitemap.includes('/glp-1/quiz/')&&!sitemap.includes('/checklist/weight-loss/');
  rows.push({environment,flag,expectedIndexable:expected,pass,pages});
 }
}finally{process.chdir(saved.cwd);for(const [key,value] of [['VERCEL_ENV',saved.env],['HRT_ALLOW_INDEXING',saved.flag]])if(value===undefined)delete process.env[key];else process.env[key]=value;}
const actualNoindex=parseHTML(fs.readFileSync(path.join(root,'dist/About.html'),'utf8')).document.querySelector('meta[name="robots"]').getAttribute('content')==='noindex, follow';
fs.writeFileSync('scraps/prelaunch/indexing-verification.json',JSON.stringify({privateFixtureOnly:true,actualPublishDirectoryRemainsNoindex:actualNoindex,rows},null,2));
console.log(JSON.stringify({cases:rows.length,pass:rows.every(r=>r.pass),actualPublishDirectoryRemainsNoindex:actualNoindex}));
if(rows.some(r=>!r.pass)||!actualNoindex)process.exitCode=1;
