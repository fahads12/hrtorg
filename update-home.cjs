// One-time content reconciliation of the approved homepage; no layout replacement.
const fs=require('fs');
let s=fs.readFileSync('home-app.jsx','utf8');
function fn(name,next,body){const start=s.indexOf('function '+name+'('),end=s.indexOf('function '+next+'(',start);if(start>=0&&end>start)s=s.slice(0,start)+body+'\n\n'+s.slice(end);}
fn('HomeNav','HomeHero','function HomeNav(){return null;}');
fn('LoveBand','Journal',`function LoveBand(){return <section className="love-band"><div className="wrap"><div className="head"><div className="eyebrow">Customer experience</div><h2>Care, in their words.</h2></div><div className="tm-card" style={{maxWidth:760,margin:'30px auto'}}><div className="qm">“</div><p>The test came quickly, was easy to understand the directions, return was easy, and received results that were easy to understand in a very timely manner. THANKS!</p><div className="meta"><div className="av">S</div><div className="nm">S. Miller</div></div></div><p style={{textAlign:'center',fontSize:12}}><a href="https://hrt.org">Customer testimonial published on HRT.org</a></p></div></section>;}`);
fn('Journal','MiniCTA',`function Journal(){return <section><div className="wrap"><div className="journal-head"><div><div className="eyebrow">The Journal</div><h2>Explore your <span className="accent">hormone health.</span></h2></div><a href="Resources.html" className="tx-cta">Read all posts {Icons.arrow}</a></div><div className="journal-grid">{window.HRT_JOURNAL.map(p=><article className="jx" key={p.route}><a className="img" href={p.route}>{p.image&&<img src={p.image} alt="" loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}<span className="tag">Health education →</span></a><h3><a href={p.route}>{p.title}</a></h3><div className="read">HRT.org journal</div></article>)}</div></div></section>;}`);
const footerStart=s.indexOf('function HomeFooter()'),appStart=s.indexOf('function HomeApp()',footerStart);
if(footerStart>=0&&appStart>footerStart)s=s.slice(0,footerStart)+'function HomeFooter(){return null;}\n\n'+s.slice(appStart);
s=s.replace('15-minute intake · No commitment','Continue in the HRT.org patient portal');
s=s.replace('At-home & partner-lab','At-home');
s=s.replace('Clinically-guided peptide protocols supporting recovery, sleep, body composition, and cellular health.','Explore the peptide therapy options described by HRT.org and discuss suitability with a provider.');
s=s.replace('Targeted oral and topical regimens for thinning and pattern hair loss — clinically proven, prescribed by providers.','Explore HRT.org’s oral and topical treatment options for thinning and pattern hair loss.');
s=s.replace('Discreet, effective treatments for libido, performance, and intimacy — backed by your care team.','Discuss libido, performance, and intimacy concerns with the HRT.org care team.');
s=s.replace('GLP-1 backed care plans paired with provider coaching and lab monitoring for sustainable results.','Explore HRT.org’s weight loss and management services and discuss your options with a provider.');
s=s.replace('href="Pricing.html">Find your plan','href="https://portal.hrt.org/app/symptoms-tracker">Explore your care');
// Replace unverified benefit promises with the four pillars from the original About page.
s=s.replace(/const PILLARS = \[[\s\S]*?\n\];/,`const PILLARS = [
 {n:'01',t:'Education',d:'Information to help you make informed decisions about your health and wellness.'},
 {n:'02',t:'Testing',d:'Assessment and results to help explore and monitor care options.'},
 {n:'03',t:'Self-Care',d:'Consider lifestyle, exercise, diet, and nutrition as part of your health.'},
 {n:'04',t:'Prescriptive Care',d:'Discuss individually customized treatment with your healthcare provider.'}
];`);
s=s.replace(/const TESTIMONIALS_3 = \[[\s\S]*?\n\];/,'').replace(/const JOURNAL_POSTS = \[[\s\S]*?\n\];/,'');
fs.writeFileSync('home-app.jsx',s);
let p=fs.readFileSync('premium-components.jsx','utf8');
p=p.replace('At-home & partner-lab testing','At-home laboratory testing').replace('At-home or partner-lab options · Provider-reviewed results','Collection methods and timing depend on your kit.').replace('At-home collection or a partner lab, based on your provider’s recommendation.','Choose your test kit and follow its specific collection instructions.').replace('href="Resources.html#testing"','href="Lab Testing.html"').replace('href="Consultation.html">Get started with testing','href="https://store.hrt.org/">Shop test kits');
p=p.replace('If home testing is recommended, your kit is sent to you.','Order your kit through the secure HRT.org store for delivery to your door.');
p=p.replace('<div className="testing-story" aria-label="Testing process">','<div className="testing-story" aria-label="Testing process">{window.HRT_KIT_IMAGE&&<a href="https://store.hrt.org/" className="home-kit-image" data-reveal><img src={window.HRT_KIT_IMAGE} alt="Original HRT.org Optimal Female Hormone Test kit packaging" loading="lazy" width="420" height="300"/></a>}');
p+='\nObject.assign(window,{MoleculeVisual,CareOverview,CareJourney,TestingExperience});\n';
fs.writeFileSync('premium-components.jsx',p);
console.log('Homepage source content updated.');
