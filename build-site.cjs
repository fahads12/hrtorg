// Compile editable JSX ahead of time; keep the site independent of runtime Babel/CDN scripts.
const fs=require('fs'),path=require('path'),babel=require('@babel/standalone'),crypto=require('crypto');
fs.mkdirSync('assets',{recursive:true});
for(const [pkg,file] of [['react','react.production.min.js'],['react-dom','react-dom.production.min.js']])fs.copyFileSync(path.join('node_modules',pkg,'umd',file),path.join('assets',file));
for(const file of ['components.jsx','premium-components.jsx','home-app.jsx','audience-app.jsx']){
 const out=babel.transform(fs.readFileSync(file,'utf8'),{presets:[['react',{runtime:'classic'}]],filename:file,comments:false,compact:true}).code;
 fs.writeFileSync('assets/'+file.replace('.jsx','.js'),'(function(){'+out+'\n})();');
}
const shell=JSON.parse(fs.readFileSync('site-shell.json','utf8'));
const pages=JSON.parse(fs.readFileSync('source-content/page-index.json','utf8'));
for(const p of pages)if(p.key==='providers/jessica-kikla')p.image='uploads/generated/jessica-kikla-enhanced-1024.webp';
for(const p of pages)if(p.key==='providers/dr-clarence-lee-jr')p.image='uploads/generated/dr-lee-enhanced-1024.webp';
const libraryPicks=require('./source-content/audience-library.json');
const picks=['perimenopause','testosterone','semaglutide'].map(word=>pages.find(p=>p.key.startsWith('health/')&&p.title.toLowerCase().includes(word)&&p.image)).filter(Boolean);
const manifest=JSON.parse(fs.readFileSync('source-content/asset-manifest.json','utf8'));
const kit=manifest.find(a=>/Optimal_Female_Hormone_Test/i.test(a.source));
fs.writeFileSync('assets/home-data.js','window.HRT_JOURNAL='+JSON.stringify(picks)+';window.HRT_KIT_IMAGE='+JSON.stringify(kit?.file||'')+';');
const head=`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HRT.org — Personalized hormone health</title><meta name="description" content="Explore hormone care, at-home laboratory testing and health education from HRT.org. Shop test kits or connect through the patient portal."><link rel="icon" href="uploads/hrt-logo.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&display=swap" rel="stylesheet"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="home-styles.css"><link rel="stylesheet" href="premium.css"><link rel="stylesheet" href="source-site.css"><link rel="stylesheet" href="restored-layouts.css"></head><body class="home" data-gender="women">`;
const scripts=['assets/react.production.min.js','assets/react-dom.production.min.js','assets/components.js','assets/premium-components.js','assets/home-data.js','assets/home-app.js','premium-motion.js','site-interactions.js'].map(src=>`<script src="${src}" defer></script>`).join('');
const html=head+shell.nav+'<div id="root"></div>'+shell.footer+scripts+'</body></html>';
for(const file of ['index.html','HRT Home.html'])fs.writeFileSync(file,html);
// Preserve the full original audience layout, populated from the source content index.
const article=pattern=>pages.find(p=>p.key.startsWith('health/')&&pattern.test(p.title));
const audience={};
for(const gender of ['women','men']){
 const women=gender==='women',service=pages.find(p=>p.key===gender+'/hormone-replacement-therapy');
 const provider=pages.find(p=>p.key==='providers/'+(women?'jessica-kikla':'dr-clarence-lee-jr'));
 const topics=women?[/premenstrual syndrome/i,/perimenopause/i,/menopause.*symptoms/i,/^post menopause/i]:[/^testosterone.the universal/i,/stress/i,/^who or what is responsible for the decline of testosterone levels in men/i,/heart health/i];
 const reading=topics.map(article).filter(Boolean);
 const symptoms=women?['Hot flashes and night sweats','Disrupted sleep','Fatigue and low energy','Mood changes','Brain fog','Low libido','Vaginal dryness','Weight changes','Hair thinning','Cycle changes','Joint discomfort','Changes in skin']:['Low energy','Reduced libido','Sleep changes','Brain fog','Mood changes','Weight gain','Loss of muscle mass','Slower recovery','Hair thinning','Erectile concerns','Reduced strength','Difficulty concentrating'];
 const names=women?['Cycle & fertility years','Perimenopause','Menopause transition','Post-menopause & longevity']:['Hormonal health','Changing priorities','Andropause','Long-term health'];
 audience[gender]={eyebrow:women?'For Women':'For Men',headlineLead:women?'Health that ':'Strength, drive, and ',headlineAccent:women?'moves with you':'clarity',headlineTail:women?' - through every stage.':' - backed by your labs.',lead:service.intro,
 topSymptoms:(women?['Hot flashes & night sweats','Disrupted sleep & fatigue','Mood changes & brain fog','Low libido & dryness']:['Low energy and drive','Slower recovery & strength loss','Reduced libido & function','Hair loss & thinning']).map(t=>({t,meta:''})),symptoms:symptoms.map(t=>({t,meta:''})),
 stages:reading.map((p,i)=>({age:'0'+(i+1),t:names[i],accent:'',d:p.description,tags:[],href:p.route})),
 treatments:[['hrt','hormone-replacement-therapy','Hormone Therapy'],['peptides','anti-aging-peptides','Peptide Therapy'],['weight','weight-loss-and-management','Weight Management'],['sexual','sexual-health','Sexual Health'],['hair','hair-loss','Hair Loss Treatment']].map(([k,slug,n])=>{const p=pages.find(p=>p.key===gender+'/'+slug);return {k,n,d:p.description||p.intro,price:'',href:p.route};}),
 quote:women?'Jessica Kikla is a board-certified adult and gerontological primary care nurse practitioner who specializes in hormone optimization and anti-aging medicine.':'Dr. Lee is a physician-entrepreneur, nationally celebrated author, international speaker, and CEO.',
 quoteAttr:{name:provider.intro && provider.title.endsWith(provider.intro)?provider.title.slice(0,-provider.intro.length).replace(/[,\s]+$/,''):provider.title,title:provider.intro},portrait:provider.image,providerHref:provider.route,
 library:libraryPicks[gender].map(item=>{const p=pages.find(p=>p.key===item.key);if(!p)throw Error('Missing library article: '+item.key);return {tag:item.topic,t:p.title,d:item.summary,meta:['Read article'],href:p.route,image:p.image};})};
}
fs.writeFileSync('assets/audience-data.js','window.HRT_AUDIENCE='+JSON.stringify(audience)+';');
const audHead=head.replace('<title>HRT.org — Personalized hormone health</title>','<title>Care for Women and Men | HRT.org</title>').replace('</head>','<link rel="stylesheet" href="audience-styles.css"></head>').replace('class="home"','class="audience"');
const audScripts=['assets/react.production.min.js','assets/react-dom.production.min.js','assets/components.js','assets/audience-data.js','assets/audience-app.js','site-interactions.js'].map(src=>`<script src="${src}" defer></script>`).join('');
fs.writeFileSync('Audience.html',audHead+shell.nav+'<div id="root"></div>'+shell.footer+audScripts+'</body></html>');
const restoredFiles=require('./build-restored.cjs')(shell,head);
restoredFiles.push(...require('./build-recovery.cjs')());
restoredFiles.push(...require('./build-lab.cjs')(shell));
restoredFiles.push(...require('./build-how.cjs')());
restoredFiles.push(...require('./build-checklists.cjs')());
require('./localize-checklist-links.cjs').run();
require('./clean-site-references.cjs').run();
require('./format-inner-pages.cjs')();
require('./polish-footer-pages.cjs')();
require('node:child_process').execFileSync(process.execPath, ['build-glow-menu.cjs'], { stdio: 'inherit' });
require('./localize-portal-links.cjs').run();
const integrateGlowMenu = require('./integrate-glow-menu.cjs');
// Fingerprint every generated local asset URL, including nested pages.
const report=JSON.parse(fs.readFileSync('source-content/migration-report.json','utf8'));
for(const file of new Set([...report.pages.map(p=>p.file),'index.html','HRT Home.html','blog-categories/%20heart-health/index.html',...restoredFiles])){
 let text=fs.readFileSync(file,'utf8');
 // Route-qualified fallback also works with script disabled on nested pages.
 const skipTarget=file.replaceAll('\\','/').split('/').map(encodeURIComponent).join('/')+'#main-content';
 text=text.replace(/(<a class="skip-link" href=")[^"]*(")/g,'$1'+skipTarget+'$2');
 text=text.replace(/<main\b([^>]*\bid="main-content"[^>]*)>/g,(tag,attrs)=>attrs.includes('tabindex=')?tag:'<main'+attrs+' tabindex="-1">');
if(!text.includes('inner-pages.css'))text=text.replace('</head>','<link rel="stylesheet" href="inner-pages.css"></head>');text=text.replaceAll('uploads/source/10d5d243dc17a25f.webp','uploads/generated/dr-lee-enhanced-1024.webp');text=text.replaceAll('uploads/source/1f7c622dbce3646c.webp','uploads/generated/jessica-kikla-enhanced-1024.webp');if(!text.includes('care-theme.css'))text=text.replace('</head>','<link rel="stylesheet" href="care-theme.css"><script src="care-theme.js" defer></script></head>');if(!text.includes('care-polish.css'))text=text.replace('</head>','<link rel="stylesheet" href="care-polish.css"></head>');if(!text.includes('care-motion.js'))text=text.replace('</body>','<script src="care-motion.js" defer></script></body>');text=integrateGlowMenu(text);text=text.replace(/(src|href)="([^"?]+\.(?:js|css))(?:\?v=[a-f0-9]+)?"/g,(all,attr,asset)=>fs.existsSync(asset)?`${attr}="${asset}?v=${crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex').slice(0,12)}"`:all);fs.writeFileSync(file,text);
}
console.log('Production homepage compiled; all generated asset URLs fingerprinted.');
// The portal has its own visual shell and must not inherit care-site styling.
require('./build-portal.cjs')();
require('./prerender-site.cjs')();
require('./build-page-metadata.cjs')();
