// Remove migration attribution and localize legacy links in publishable output.
const fs=require('fs');
const pages=JSON.parse(fs.readFileSync('source-content/page-index.json','utf8'));
const routes=new Map(pages.map(p=>[p.key,p.route]));routes.set('','HRT Home.html');
const records=JSON.parse(fs.readFileSync('source-content/crawl.json','utf8'));
for(const r of records){if(r.error)continue;const target=routes.get(new URL(r.finalUrl).pathname.replace(/^\/|\/$/g,''));if(target)routes.set(new URL(r.url).pathname.replace(/^\/|\/$/g,''),target);}
for(const [key,value] of [...routes])if(key.startsWith('health/'))routes.set(key.slice(7),value);
routes.set('informed-consent-regarding-nutritional-herbal-supplements','legal/informed-consent-regarding-nutritional-and-herbal-supplements/index.html');
function local(url){const u=new URL(url);const key=decodeURIComponent(u.pathname).replace(/^\/|\/$/g,'');if(['hrt-products/semaglutide-injections','hrt-products/semaglutide-bioboost-injections'].includes(key))return key+'/index.html';if(key.startsWith('hrt-products/'))return 'https://store.hrt.org/';return routes.get(key)?routes.get(key)+u.search+u.hash:null;}
const old=/https?:\/\/(?:www\.)?(?:old\.)?hrt\.org(?:\/[^\s"'<>\\`)]*)?/g;
function clean(text,file=''){
 // Correct an exact source spelling error without modifying archived source material.
 text=text.replace(/\bPremesntrual\b/g,'Premenstrual');
 if(file.includes('/glp-1/')&&/<h1>\s*<\/h1>/.test(text)){
  const topic=file.split('/').slice(-2,-1)[0].replace(/-2500a$/,'').replace(/-/g,' ').replace(/\bglp 1\b/i,'GLP-1');
  const title=topic.charAt(0).toUpperCase()+topic.slice(1);
  text=text.replace(/<h1>\s*<\/h1>/,'<h1>'+title+'</h1>').replace(/<title>[^<]*<\/title>/,'<title>'+title+' | HRT.org</title>');
 }
 if(file.includes('/category/health/'))text=text.replace('<p>No products added yet.</p>','<p>Explore articles on hormone health, symptoms and testing.</p><p><a href="Resources.html">Browse the health library</a></p>');
 text=text.replace(/<p>Use this announcement bar to draw your user(?:’|')s attention to important updates and deals\.<\/p>/g,'');
 text=text.replace(/<div class="(?:wrap )?source-credit">[\s\S]*?<\/div>/g,'');
 text=text.replace(/<p><a href="[^"]+">Use the (?:original )?HRT\.org contact form[^<]*<\/a><\/p>/g,'');
 text=text.replace(/<a href="[^"]+">(?:Source and test-kit context|Visit the original page)<\/a>/g,'');
 text=text.replace(/<a href="(https?:\/\/(?:www\.)?(?:old\.)?hrt\.org[^" ]*)"([^>]*)>([\s\S]*?)<\/a>/g,(all,url,attrs,label)=>{const to=local(url);return to?`<a href="${to}"${attrs}>${label}</a>`:label;});
 text=text.replace(/Take the original assessment/g,'Explore your symptoms').replace(/Continue to HRT\.org to complete this assessment\./g,'Discuss your symptoms with your care team.').replace(/Start assessment →/g,'Explore assessment →');
 text=text.replace(/This page has no published article text available in the source\./g,'Information on this topic is not available yet.').replace(/<p> or <a href="Contact.html">contact HRT.org<\/a>\.<\/p>/g,'<p><a href="Contact.html">Contact our team</a> for help.</p>');
 text=text.replace(/Complete the provider application on the original website\./g,'Contact our team about joining the provider network.').replace(/<a class="btn btn-primary" href="Join Our Network.html">Provider application[^<]*<\/a>/g,'<a class="btn btn-primary" href="mailto:info@hrt.org?subject=Provider%20network%20enquiry">Contact our team</a>');
 text=text.replace(/original HRT\.org/gi,'HRT.org').replace(/its original information and questions/g,'health information and questions');
 text=text.replace(old,url=>local(url)||'Resources.html');
 text=text.replace(/<a class="btn btn-primary" href="Join Our Network.html">Provider application[^<]*<\/a>/g,'<a class="btn btn-primary" href="mailto:info@hrt.org?subject=Provider%20network%20enquiry">Contact our team</a>');
 text=text.replace(/<a class="btn btn-primary" href="[^"]+">Explore assessment[^<]*<\/a>/g,'<a class="btn btn-primary" href="Symptom Check.html">Explore symptom checks</a>');
 return text;
}
module.exports={clean,run(){
 let count=0;
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.tools','scraps','source-content','uploads','.git','dist','.vercel'].includes(e.name))continue;const f=dir+'/'+e.name;if(e.isDirectory())walk(f);else if(f.endsWith('.html')||((dir==='./assets'||dir.startsWith('./assets/'))&&f.endsWith('.js'))){const before=fs.readFileSync(f,'utf8'),after=clean(before,f);if(after!==before){fs.writeFileSync(f,after);count++;}}}}
 walk('.');console.log('Cleaned legacy references in '+count+' published files.');
}};
