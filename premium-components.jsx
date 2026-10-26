/* Original vector artwork. Abstract forms are not molecular models or product renders. */
function MoleculeVisual() {
  return <div className="science-visual" data-parallax aria-hidden="true">
    <div className="science-orbit orbit-one"/><div className="science-orbit orbit-two"/>
    <svg viewBox="0 0 560 500" className="molecule-art" fill="none">
      <defs><radialGradient id="blueAtom" cx="30%" cy="25%"><stop stopColor="#fff"/><stop offset=".35" stopColor="#d8e8ee"/><stop offset="1" stopColor="#6087a3"/></radialGradient><radialGradient id="plumAtom" cx="30%" cy="25%"><stop stopColor="#fff"/><stop offset=".4" stopColor="#eddce7"/><stop offset="1" stopColor="#a66a8a"/></radialGradient></defs>
      <g stroke="#a5bac9" strokeWidth="9"><path d="M115 185L232 126 352 194 350 326 234 390 117 322Z M352 194L455 134 497 252 350 326 M232 126L239 57 M117 322L58 370"/></g>
      {[[115,185,32],[232,126,40],[352,194,34],[350,326,44],[234,390,30],[117,322,35],[455,134,25],[497,252,29],[239,57,20],[58,370,22]].map(([cx,cy,r],i)=><circle key={i} cx={cx} cy={cy} r={r} fill={`url(#${i%3===0?'plumAtom':'blueAtom'})`}/>)}
    </svg>
    <div className="science-note"><span className="science-dot"/> Your biology. Your care.</div>
    <span className="science-caption">SCIENCE MEETS PERSONAL CARE</span>
  </div>;
}

function CareOverview() {
 const benefits = [["provider","Provider guided","Care from licensed clinicians."],["test","At-home lab testing","Convenient testing, when needed."],["clipboard","Personalized plans","Built around your needs and goals."],["box","Discreet delivery","Care delivered to your door."]];
 const symptoms = [["battery","Low energy"],["moon","Poor sleep"],["brain","Brain fog"],["face","Mood changes"],["scale","Weight changes"],["heart","Low libido"],["flame","Hot flashes"],["dumbbell","Poor recovery"]];
 return <section className="care-overview"><div className="wrap">
  <div className="care-benefits">{benefits.map(([ic,t,d])=><div key={t} data-reveal>{Icons[ic]}<div><h3>{t}</h3><p>{d}</p></div></div>)}</div>
  <div className="symptom-overview"><h2>Hormone health touches more than you think.</h2><p>Start a conversation about the changes you’ve noticed.</p><div className="symptom-pills">{symptoms.map(([ic,t])=><a href="Consultation.html" key={t} data-reveal>{Icons[ic]}<span>{t}</span></a>)}</div></div>
 </div></section>;
}

const CARE_JOURNEY = [
 ['laptop','Complete your intake','Share your symptoms, health history, and goals online.'],
 ['provider','Meet your care team','A licensed provider reviews your history and recommends next steps.'],
 ['test','Test when needed','Choose your test kit and follow its specific collection instructions.'],
 ['box','Receive your treatment','If prescribed, your treatment is delivered discreetly to your door.'],
 ['heart','Stay connected','Provider check-ins and follow-up labs help guide ongoing care.']
];
function CareJourney(){return <section className="care-roadmap" aria-labelledby="care-roadmap-title"><div className="wrap care-roadmap-grid"><div className="care-roadmap-intro"><span className="eyebrow">How it works</span><h2 id="care-roadmap-title">A clear path.<br/><em>A team beside you.</em></h2><p>See what comes next, from your first conversation to ongoing care.</p><a className="btn btn-primary" href="How It Works.html">Explore the care process {Icons.arrow}</a><figure className="roadmap-photo"><img src="uploads/generated/care-planning.webp" srcSet="uploads/generated/care-planning-720.webp 720w, uploads/generated/care-planning.webp 1440w" sizes="(max-width:800px) 100vw, 35vw" width="1440" height="960" alt="Woman writing questions in a notebook before a care appointment" loading="lazy"/></figure></div><ol className="care-roadmap-steps" data-care-progress>{CARE_JOURNEY.map(([ic,t,d],i)=><li key={t} className="care-roadmap-step" data-care-motion><span className="roadmap-number" aria-hidden="true">0{i+1}</span><div className="roadmap-card"><div className="roadmap-card-heading"><span className="roadmap-icon" aria-hidden="true">{Icons[ic]}</span><h3>{t}</h3></div><p>{d}</p></div></li>)}</ol></div></section>}

function TestingExperience(){return <section className="testing-experience" id="lab-testing"><div className="wrap testing-grid">
 <div className="testing-copy"><span className="eyebrow">At-home laboratory testing</span><h2>Better understanding.<br/><em>More personal care.</em></h2><p>Your provider looks at your lab results together with your symptoms, health history, and goals.</p><p>If you need testing, your care team explains how to collect your sample and reviews the results with you.</p><div className="home-hero-ctas"><a className="btn btn-primary" href="https://store.hrt.org/">Shop test kits {Icons.arrow}</a><a className="text-link" href="Lab Testing.html">Explore lab testing {Icons.arrow}</a></div><span className="testing-footnote">Collection methods and timing depend on your kit.</span><img className="testing-lab-photo" src="uploads/generated/lab-care.webp" srcSet="uploads/generated/lab-care-720.webp 720w, uploads/generated/lab-care.webp 1440w" sizes="(max-width:800px) 100vw, 45vw" width="1440" height="960" alt="Laboratory pipette and sample plate" loading="lazy"/></div>
 <div className="testing-story" aria-label="Testing process">{window.HRT_KIT_IMAGE&&<a href="https://store.hrt.org/" className="home-kit-image" data-reveal><img src={window.HRT_KIT_IMAGE} alt="HRT.org Optimal Female Hormone Test kit packaging" loading="lazy" width="420" height="300"/></a>}<div className="testing-story-head"><span className="eyebrow">From collection to conversation</span>{Icons.test}</div>
 {[['box','01','Receive your kit','Order your kit through the secure HRT.org store for delivery to your door.'],['test','02','Collect & return',"Follow the collection instructions that come with your kit and use the prepaid return shipping."],['clipboard','03','Review together','Your provider explains your results and discusses next steps.']].map(([ic,n,t,d])=><div className="testing-stage" key={n} data-reveal><div className="testing-stage-icon">{Icons[ic]}</div><div><span className="testing-stage-number">{n}</span><h3>{t}</h3><p>{d}</p></div></div>)}
 </div></div></section>}

Object.assign(window,{MoleculeVisual,CareOverview,CareJourney,TestingExperience});
