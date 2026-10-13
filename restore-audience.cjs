// Restore the original audience components, with source-backed copy and honest interactions.
const fs=require('fs');
let s=fs.readFileSync('audience-app.jsx','utf8');
const start=s.indexOf('const AUDIENCE ='),end=s.indexOf('function AudNav(');
s=s.slice(0,start)+`const AUDIENCE = window.HRT_AUDIENCE;
for (const gender of ['women','men']) {
  AUDIENCE[gender].topSymptoms.forEach((s,i)=>{s.ic=[Icons.flame,Icons.moon,Icons.brain,Icons.heart][i];});
}
\n`+s.slice(end);
const navStart=s.indexOf('function AudNav('),heroStart=s.indexOf('function AudHero(');
s=s.slice(0,navStart)+'function AudNav(){return null;}\n\n'+s.slice(heroStart);
s=s.replace('<a className={gender === "women" ? "active" : ""} onClick={() => onSwitch("women")}>For Women</a>','<button type="button" className={gender === "women" ? "active" : ""} aria-pressed={gender === "women"} onClick={() => onSwitch("women")}>For Women</button>');
s=s.replace('<a className={gender === "men" ? "active" : ""} onClick={() => onSwitch("men")}>For Men</a>','<button type="button" className={gender === "men" ? "active" : ""} aria-pressed={gender === "men"} onClick={() => onSwitch("men")}>For Men</button>');
const recStart=s.indexOf('  let recCount, recHead, recBody, recs;'),recEnd=s.indexOf('\n  return (',recStart);
s=s.slice(0,recStart)+`  const recHead=count ? 'Bring these concerns to your care team.' : 'Select the symptoms you want to discuss.';
  const recBody='This list helps organize your concerns. Selections do not diagnose a condition or determine which treatment or test you need. They stay on this page and are not submitted.';
  const recs=count ? [
    {ic:Icons.provider,name:'Talk to a provider',sub:'Continue to the HRT.org patient portal',href:'https://portal.hrt.org/app/symptoms-tracker'},
    {ic:Icons.test,name:'Explore lab testing',sub:'Learn about at-home collection',href:'Lab Testing.html'}
  ] : [];
`+s.slice(recEnd);
s=s.replace("Check the ones that apply to you. We'll suggest what to do next — based on the pattern, not just a single symptom.",'Select the concerns you would like to discuss with a healthcare provider.');
s=s.replace('<div key={i} className={`aud-check-item ${checked.has(i) ? "on" : ""}`} onClick={() => toggle(i)}>','<button type="button" aria-pressed={checked.has(i)} key={i} className={`aud-check-item ${checked.has(i) ? "on" : ""}`} onClick={() => toggle(i)}>');
s=s.replace('<span className="meta">{s.meta}</span>\n              </div>','<span className="meta">{s.meta}</span>\n              </button>');
s=s.replace('<div className="count-row">','<div className="count-row" role="status" aria-live="polite">');
s=s.replace("Your body's needs shift across your lifespan. Here's what we typically see — and treat — at each stage.",'Explore health topics for different stages of life, from the HRT.org library.');
s=s.replace('<div key={i} className="aud-stage">','<div key={i} className="aud-stage">');
s=s.replace('<div className="tags">\n                {s.tags.map','<a className="aud-stage-link" href={s.href}>Explore this topic →</a><div className="tags">\n                {s.tags.map');
s=s.replace('Every treatment below is provider-prescribed, lab-informed where appropriate, and shipped discreetly to your door. Adjust over time with ongoing care.','Explore HRT.org’s treatment services and discuss suitability with your care team.');
s=s.replace('<span className="tag">{data.portraitTag}</span>','<img src={data.portrait} alt={data.quoteAttr.name} loading="lazy" width="400" height="460"/>');
s=s.replace('<q>{data.quote}</q>','<div className="eyebrow">Meet your care team</div><p className="aud-provider-copy">{data.quote}</p><a className="text-link" href={data.providerHref}>Read the provider profile →</a>');
s=s.replace('Provider-authored deep dives on the things you\'re navigating.','Explore original HRT.org articles on the topics you’re navigating.');
s=s.replace('className="aud-lib-card" href="Resources.html"','className="aud-lib-card" href={l.href}');
s=s.replace('15-minute intake · No commitment','Continue in the HRT.org patient portal');
const footStart=s.indexOf('function AudFooter('),appStart=s.indexOf('function AudApp(');
s=s.slice(0,footStart)+'function AudFooter(){return null;}\n\n'+s.slice(appStart);
s=s.replace('document.body.setAttribute("data-gender", gender);','document.body.setAttribute("data-gender", gender);\n    document.title = `For ${gender === "women" ? "Women" : "Men"} | HRT.org`;');
s=s.replace('<div data-screen-label={`For ${gender === "women" ? "Women" : "Men"}`}>','<main id="main-content" data-screen-label={`For ${gender === "women" ? "Women" : "Men"}`}>');
s=s.replace('<AudSymptoms data={data} gender={gender} />','<AudSymptoms key={gender} data={data} gender={gender} />');
s=s.replace('<AudFooter />\n    </div>','<AudFooter />\n    </main>');
fs.writeFileSync('audience-app.jsx',s);
