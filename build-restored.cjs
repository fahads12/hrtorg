// Called by build-site.cjs. Original JSX templates + saved source content.
const fs=require('fs'),path=require('path'),babel=require('@babel/standalone');
module.exports=function buildRestored(shell,baseHead){
 if(!fs.existsSync('source-content/restored-data.json'))return [];
 const raw=JSON.parse(fs.readFileSync('source-content/restored-data.json','utf8'));
 const categoryArchives=require('./build-category-archives.cjs')(raw);
 // The source weight-management page contains a copied peptide-therapy block.
 // Omit that unrelated block; retain the archived original and all relevant care copy.
 raw.services['women/weight-loss-and-management'].body = raw.services['women/weight-loss-and-management'].body.replace(/<h4>Explore Hormone Optimization<\/h4><p>Based on your consultation, you can choose to explore the benefits of peptide therapy,[\s\S]*?<\/p>/, '');
 for(const gender of ['women','men']) raw.services[gender+'/weight-loss-and-management'].body += '<h2>Learn about treatment options</h2><ul><li><a href="hrt-products/semaglutide-injections/index.html">Semaglutide injections</a></li><li><a href="hrt-products/semaglutide-bioboost-injections/index.html">Semaglutide + BioBoost injections</a></li></ul>';
 for(const p of raw.providers)if(p.key==='providers/jessica-kikla')p.image='uploads/generated/jessica-kikla-enhanced-1024.webp';
 for(const p of raw.providers)if(p.key==='providers/dr-clarence-lee-jr')p.image='uploads/generated/dr-lee-enhanced-1024.webp';
 const values=[{ic:'science',t:'Education',d:'Information to support informed decisions about health and wellness.'},{ic:'heart',t:'Testing',d:'At-home testing and results to help explore your care options.'},{ic:'eye',t:'Personalized care',d:'Patient management and monitoring with your healthcare provider.'}];
 const catalog=[['hrt','hormone-replacement-therapy','Hormone Therapy'],['peptides','anti-aging-peptides','Peptide Therapy'],['weight','weight-loss-and-management','Weight Management'],['sexual','sexual-health','Sexual Health'],['hair','hair-loss','Hair Loss Treatment'],['ed','erectile-dysfunction','Erectile Dysfunction']];
 const meta=raw.articles.map(({body,sections,...p})=>p);
 const products={},treatments=[];
 for(const [key,slug,name] of catalog){const p={name,short:name,eyebrow:name};for(const g of ['women','men']){const s=raw.services[g+'/'+slug]||raw.services['men/'+slug];p[g]={headlineLead:s.title,headlineAccent:'',lead:s.intro||s.description,pills:['Provider-guided care','HRT.org'],body:s.body,questions:s.questions};}products[key]=p;if(key!=='ed')treatments.push({key,num:'0'+(treatments.length+1),eyebrow:name,name,accent:'',desc:p.women.lead,addresses:[name],forms:['Women’s and men’s care'],timeline:'Read treatment information',requires:'Discuss with a provider',fromPrice:'Care',per:'Learn more',audience:['women','men']});}
 const definitions=[['conditions','Conditions & ','Symptoms',['conditions','symptoms']],['hormones','Hormone ','Health',['hormones','womens-health','mens-health','thyroid-health']],['testing','Lab & Genetic ','Testing',['health-testing','genetic-testing']],['nutrition','Nutrition & ','Lifestyle',['nutrition','heart-health','mental-health']],['products','Products & ','Information',['product','product-reviews','trusted-brands']],['news','News & ','Answers',['news','advice','question-and-answer']]];
 const silos=definitions.map(([id,title,titleAccent,keys])=>{const categories=raw.categories.filter(c=>keys.includes(c.key.split('/')[1]));const grouped=meta.filter(p=>categories.some(c=>c.articles.includes(p.key)));const featured=grouped[0]||meta.find(p=>p.key.includes(id))||meta[0];return {id,title,titleAccent,eyebrow:'HRT.org library',blurb:'Explore HRT.org information on '+(title+titleAccent).toLowerCase()+'.',articles:grouped.length,count:categories.length,featured:{title:featured.title,desc:featured.description,eyebrow:'Featured reading',tag:'HRT.ORG JOURNAL',gender:'women',meta:['Health education'],href:featured.route,image:featured.image||'uploads/generated/science-editorial.webp'},cards:categories.map(c=>({t:c.title,d:'Browse the HRT.org '+c.title.toLowerCase()+' collection.',ct:(count=>count+' '+(count===1?'article':'articles'))(meta.filter(p=>c.articles.includes(p.key)).length),href:c.route,ic:null}))};});
 const assets=JSON.parse(fs.readFileSync('source-content/asset-manifest.json','utf8'));
 const kitImage=assets.find(x=>/Optimal_Female_Hormone_Test/.test(x.source)).file;
 const source={...raw,articles:meta,services:undefined,values,products,treatments,silos,kitImage};
 fs.writeFileSync('assets/restored-data.js','window.HRT_SOURCE='+JSON.stringify(source)+';');
 const jsx=['restored-components.jsx','treatments-app.jsx','about-app.jsx','how-app.jsx','pricing-app.jsx','product-app.jsx','resources-app.jsx','article-app.jsx','sections.jsx','landing-restored-app.jsx','consult-data.jsx','consult-app.jsx','tweaks-panel.jsx'];
 for(const file of jsx){if(!fs.existsSync(file))continue;const code=babel.transform(fs.readFileSync(file,'utf8'),{presets:[['react',{runtime:'classic'}]],comments:false,compact:true,filename:file}).code;fs.writeFileSync('assets/'+file.replace('.jsx','.js'),'(function(){'+code+'\n})();');}
 const written=[...categoryArchives];
 function write(file,title,style,app,dataFile='assets/restored-data.js',extra=[],initial=''){
  const depth=file.split('/').length-1;
  let head=baseHead.replace(/<title>.*?<\/title>/,'<title>'+escape(title)+' | HRT.org</title>').replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+escape(title+' — health information and care from HRT.org.')+'">').replace('class="home"','class="restored"');
  if(file==='Treatments.html')head=head.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="Explore hormone therapy, peptide therapy, weight management, sexual health, and hair loss care for women and men. Learn what to discuss with your provider.">');
  if(depth)head=head.replace('<head>','<head><base href="'+'../'.repeat(depth)+'">');
  head=head.replace('</head>','<link rel="stylesheet" href="'+style+'"><link rel="stylesheet" href="restored-layouts.css"></head>');
  const scripts=['assets/react.production.min.js','assets/react-dom.production.min.js','assets/components.js',dataFile,'assets/restored-components.js',...extra,'assets/'+app,'site-interactions.js','restored-interactions.js'];
  let html=head+shell.nav+'<main id="main-content"><div id="root"></div></main>'+shell.footer+scripts.map(src=>'<script src="'+src+'" defer></script>').join('')+'</body></html>';
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html);written.push(file);
 }
 function escape(str){return str.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');}
 for(const [file,title,css,app] of [['Treatments.html','Treatments','treatments-styles.css','treatments-app.js'],['About.html','About HRT.org','about-styles.css','about-app.js'],['How It Works.html','How It Works','how-styles.css','how-app.js'],['Pricing.html','Pricing and Membership','pricing-styles.css','pricing-app.js'],['Product.html','Treatment Options','product-styles.css','product-app.js'],['Resources.html','Health Resource Library','resources-styles.css','resources-app.js']])write(file,title,css,app);
 // Source service URLs use the same original treatment-detail template.
 for(const [key,p] of Object.entries(raw.services)){
  const [g,slug]=key.split('/'),product=catalog.find(x=>x[1]===slug)?.[0];
  const dataFile='assets/service-'+g+'-'+product+'.js';fs.writeFileSync(dataFile,'window.HRT_SOURCE='+JSON.stringify({...source,articles:[],silos:[],initialProduct:product,initialGender:g})+';');
  write(p.route,p.title,'product-styles.css','product-app.js',dataFile);
 }
 function withArticle(p){let n=0,toc=[];let formatted=p.body.replace(/<p>\s*<strong>([^<]{3,180})<\/strong>\s*<\/p>/g,'<h2>$1</h2>');if(!/<h[234][ >]/.test(formatted))formatted='<h2>Article overview</h2>'+formatted;const body=formatted.replace(/<(h[234])([^>]*)>([\s\S]*?)<\/\1>/g,(m,tag,attrs,inner)=>{const id='section-'+(++n);toc.push({id,t:inner.replace(/<[^>]*>/g,'')});return '<'+tag+' id="'+id+'">'+inner+'</'+tag+'>';});return {...p,body,toc};}
 fs.mkdirSync('assets/articles',{recursive:true});
 for(const p of raw.articles){const article=withArticle(p),dataFile='assets/articles/'+p.key.split('/')[1]+'.js';const data={article,related:meta.filter(a=>a.key!==p.key).slice(0,3),faq:raw.faq,values,kitImage};fs.writeFileSync(dataFile,'window.HRT_SOURCE='+JSON.stringify(data)+';');write(p.route,p.title,'article-styles.css','article-app.js',dataFile);}
 const first=raw.articles.find(p=>p.key.includes('perimenopause-navigating'))||raw.articles[0];
 write('Article.html',first.title,'article-styles.css','article-app.js','assets/articles/'+first.key.split('/')[1]+'.js');
 fs.writeFileSync('HRT Landing.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HRT Care</title><script src="audience-redirect.js"></script></head><body><p>Continue to <a href="Audience.html?g=women">women\'s care</a> or <a href="Audience.html?g=men">men\'s care</a>.</p></body></html>');
 written.push('HRT Landing.html');
 write('Consultation.html','Prepare for Your Consultation','consult-styles.css','consult-app.js','assets/restored-data.js',['assets/tweaks-panel.js','assets/consult-data.js']);
 return written;
};
