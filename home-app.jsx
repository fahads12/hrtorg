/* global React, Icons, Logo */
const { useEffect } = React;

/* ============================================================
   HOMEPAGE DATA
   ============================================================ */
const TREATMENTS_HOME = [
  {
    num: "01",
    eyebrow: "Hormone Replacement",
    title: "Hormone Therapy",
    titleAccent: "for every chapter",
    blurb: "Personalized HRT for women going through perimenopause and menopause, and for men focusing on testosterone, energy, and long-term wellness.",
    chips: ["Bioidentical Cream", "Estrogen", "Progesterone", "Testosterone"],
    featured: true,
    visualLabel: "MEN & WOMEN PORTRAIT • EDITORIAL",
  },
  {
    num: "02",
    eyebrow: "Performance & Longevity",
    title: "Peptide Therapy",
    titleAccent: "",
    blurb: "Learn about HRT.org’s peptide therapy options and talk with a provider about whether they’re suitable for you.",
    chips: ["BPC-157", "GHK-Cu", "Tesamorelin"],
    visualLabel: "PEPTIDE VIAL • CLOSE-UP",
  },
  {
    num: "03",
    eyebrow: "Metabolic Health",
    title: "Weight Management",
    titleAccent: "",
    blurb: "Learn about HRT.org’s weight loss and management services, and talk through your options with a provider.",
    chips: ["Semaglutide", "Tirzepatide", "Lifestyle plan"],
    visualLabel: "LIFESTYLE • ACTIVE COUPLE",
  },
  {
    num: "04",
    eyebrow: "Intimacy & Vitality",
    title: "Sexual Health",
    titleAccent: "",
    blurb: "Talk with the HRT.org care team about concerns with libido, performance, or intimacy.",
    chips: ["ED Therapy", "Libido Support", "Counseling"],
    visualLabel: "ABSTRACT • SOFT FORMS",
  },
  {
    num: "05",
    eyebrow: "Confidence",
    title: "Hair Loss",
    titleAccent: "",
    blurb: "Learn about HRT.org’s oral and topical treatments for thinning hair and pattern hair loss.",
    chips: ["Finasteride", "Minoxidil", "Compounded topical"],
    visualLabel: "DETAIL • TEXTURE",
  },
];

const PILLARS = [
 {n:'01',t:'Education',d:"Get information to help you make informed choices about your health and wellness."},
 {n:'02',t:'Testing',d:"Use assessments and results to explore care options and monitor your care."},
 {n:'03',t:'Self-Care',d:"Consider how your daily habits, exercise, diet, and nutrition affect your health."},
 {n:'04',t:'Prescriptive Care',d:"Talk with your healthcare provider about treatment tailored to you."}
];





/* ============================================================
   COMPONENTS
   ============================================================ */
function HomeNav(){return null;}

function HomeHero() {
  return <section className="home-hero"><div className="wrap home-hero-grid">
    <div><div className="eyebrow">Personalized hormone health</div>
      <h1 style={{marginTop:20}}>Personalized<br/>Hormone Health,<br/>Guided by Science.</h1>
      <p className="home-hero-sub">Hormone therapy, at-home testing, and treatment tailored to you, with guidance from a provider. For women and men.</p>
      <div className="home-hero-ctas"><a className="btn btn-primary" href="/portal/app/symptoms-tracker/">Get Started {Icons.arrow}</a><a className="btn btn-ghost" href="Treatments.html">Explore Treatments</a></div>
      <div className="hero-assurances"><span>{Icons.shield} Private care</span><span>{Icons.provider} Licensed providers</span><span>{Icons.home} At-home testing</span></div>
    </div><div className="home-care-visual home-audience-portraits" data-care-motion role="group" aria-label="Choose your care">
      {[{gender:"men",label:"For Men",image:"home-men-portrait",caption:"Explore men's care"},{gender:"women",label:"For Women",image:"home-women-portrait",caption:"Explore women's care"}].map(person=>(
        <a key={person.gender} className={`home-audience-photo ${person.gender}`} href={`Audience.html?g=${person.gender}`} aria-label={person.caption}>
          <img src={`uploads/generated/${person.image}.webp`} srcSet={`uploads/generated/${person.image}-480.webp 480w, uploads/generated/${person.image}.webp 960w`} sizes="(max-width:700px) 46vw, 24vw" width="960" height="1440" alt="" fetchpriority="high" decoding="async"/>
          <span className="home-audience-label"><span><strong>{person.label}</strong><span>{person.caption}</span></span><span className="home-audience-arrow" aria-hidden="true">{Icons.arrow}</span></span>
        </a>
      ))}
    </div>
  </div></section>;
}

function TreatmentsHome() {
  return (
    <section>
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 56px", maxWidth: 720 }}>
          <div className="eyebrow">Treatments</div>
          <h2 style={{ marginTop: 12 }}>One care platform.<br/><span style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontWeight: 400, color: "var(--ink-3)" }}>Every part of your health.</span></h2>
        </div>
        <div className="treatments-home">
          {TREATMENTS_HOME.map((t, i) => (
            <div key={i} data-reveal className={`tx-card ${t.featured ? "featured" : ""}`}>
              <div className="tx-visual tx-photo">
                <img src={'uploads/generated/'+['wellness-editorial','lab-care','weight-care','intimacy-care','hair-care'][i]+'.webp'} srcSet={i?`uploads/generated/${['','lab-care','weight-care','intimacy-care','hair-care'][i]}-720.webp 720w, uploads/generated/${['','lab-care','weight-care','intimacy-care','hair-care'][i]}.webp 1440w`:undefined} sizes="(max-width:700px) 100vw, 50vw" alt={['Two adults walking together in a coastal garden','Laboratory pipette and sample plate','Preparing a balanced meal at home','A couple sharing a quiet conversation','A man checking his hair in a mirror'][i]} width="1440" height="960" loading="lazy" decoding="async"/>
              </div>
              <div className="tx-body">
                <div className="eyebrow">{t.eyebrow}</div>
                <h3>{t.title} {t.titleAccent && <span className="serif" style={{ fontFamily: "Newsreader, serif", fontStyle: "italic" }}>{t.titleAccent}</span>}</h3>
                <p className="blurb">{t.blurb}</p>
                <div className="tx-chips">
                  {t.chips.map((c, j) => <span key={j} className="tx-chip">{c}</span>)}
                </div>
                <div className="tx-cta-row">
                  <a className="tx-cta women" href={`Product.html?p=${["hrt","peptides","weight","sexual","hair"][i]}&g=women`}><span className="gdot"></span>For Women {Icons.arrow}</a>
                  <a className="tx-cta men" href={`Product.html?p=${["hrt","peptides","weight","sexual","hair"][i]}&g=men`}><span className="gdot"></span>For Men {Icons.arrow}</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MasterYourHealth() {
  return (
    <section className="master">
      <div className="wrap master-grid">
        <div>
          <div className="eyebrow">Why HRT</div>
          <h2 style={{ marginTop: 14 }}>Master your health.<br/><span className="accent">Reclaim your rhythm.</span></h2>
          <p className="master-sub">Hormones affect your sleep, focus, energy, intimacy, and recovery. Our care brings together licensed providers, advanced lab testing, and treatments delivered to your door.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <a className="btn btn-teal" href="/portal/app/symptoms-tracker/">Explore your care {Icons.arrow}</a>
            <a href="How It Works.html" className="btn btn-light">How it works {Icons.arrow}</a>
          </div>
        <figure className="master-editorial"><img src="uploads/generated/telehealth-care.webp" srcSet="uploads/generated/telehealth-care-720.webp 720w, uploads/generated/telehealth-care.webp 1440w" sizes="(max-width:800px) 100vw, 45vw" alt="A video consultation from home" width="1440" height="960" loading="lazy"/></figure>
</div>
        <div className="pillars">
          {PILLARS.map((p, i) => (
            <div key={i} className="pillar">
              <div className="pn">{p.n}</div>
              <div>
                <div className="pt">{p.t}</div>
                <div className="pd">{p.d}</div>
              </div>
              <div className="arr">{Icons.arrow}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LabTesting() { return <TestingExperience/>; }

const HOME_TESTIMONIALS = [
  {name:"S. Miller",initial:"S",quote:"The test came quickly, was easy to understand the directions, return was easy, and received results that were easy to understand in a very timely manner. THANKS!"},
  {name:"Christina S.",initial:"C",quote:"Excellent service, very promptly delivered. After testing, I was very pleased with the detailed results/explanation that I received. Highly recommend."},
  {name:"Wayne S.",initial:"W",quote:"Easy to take, submit and quick response of test results."},
  {name:"Andrea C.",initial:"A",quote:"Everything was easy to follow and results arrived quickly!"},
  {name:"Michael B.",initial:"M",quote:"Simple to use. Test time and results were prompt"},
  {name:"Barbara S.",initial:"B",quote:"Instructions were easy to follow"},
  {name:"Unnamed customer",initial:null,quote:"Wonderful company to do my business with…Thank you guys so much …you’ve made a world of difference for me"}
];
function LoveBand(){
 const [index,setIndex]=React.useState(0);
 const review=HOME_TESTIMONIALS[index];
 const move=step=>setIndex(i=>(i+step+HOME_TESTIMONIALS.length)%HOME_TESTIMONIALS.length);
 return <section className="love-band" aria-labelledby="customer-stories-title"><div className="wrap">
  <div className="head"><div className="eyebrow">Customer experience</div><h2 id="customer-stories-title">Care, in their words.</h2></div>
  <div className="testimonial-carousel" role="region" aria-roledescription="carousel" aria-label="Customer testimonials" onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}}}>
   <div className="testimonial-stage" aria-live="polite" aria-atomic="true">
    <figure key={index} className="testimonial-slide" role="group" aria-roledescription="slide" aria-label={`${index+1} of ${HOME_TESTIMONIALS.length}`}>
     <span className="testimonial-quote-mark" aria-hidden="true">“</span>
     <blockquote>{review.quote}</blockquote>
     <figcaption><span className="testimonial-avatar" aria-hidden="true">{review.initial||Icons.heart}</span><span>{review.name}{!review.initial&&<small>Name not provided</small>}</span></figcaption>
    </figure>
   </div>
   <div className="testimonial-controls">
    <button type="button" className="testimonial-prev" aria-label="Previous testimonial" onClick={()=>move(-1)}>{Icons.arrow}</button>
    <div className="testimonial-dots">{HOME_TESTIMONIALS.map((r,i)=><button key={i} type="button" aria-label={`Show testimonial ${i+1}`} aria-current={i===index?'true':undefined} onClick={()=>setIndex(i)}><span/></button>)}</div>
    <span className="testimonial-count" aria-hidden="true">{String(index+1).padStart(2,'0')} / {String(HOME_TESTIMONIALS.length).padStart(2,'0')}</span>
    <button type="button" aria-label="Next testimonial" onClick={()=>move(1)}>{Icons.arrow}</button>
   </div>
  </div>
 </div></section>;
}

function Journal(){return <section><div className="wrap"><div className="journal-head"><div><div className="eyebrow">The Journal</div><h2>Explore your <span className="accent">hormone health.</span></h2></div><a href="Resources.html" className="tx-cta">Read all posts {Icons.arrow}</a></div><div className="journal-grid">{window.HRT_JOURNAL.map(p=><article className="jx" key={p.route}><a className="img" href={p.route}>{p.image&&<img src={p.image} alt="" loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}<span className="tag">Health education →</span></a><h3><a href={p.route}>{p.title}</a></h3><div className="read">HRT.org journal</div></article>)}</div></div></section>;}

function MiniCTA() {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="mini-cta">
          <h2>Ready to feel like <span className="accent">yourself</span>?<br/>Start your consultation in minutes.</h2>
          <div className="right">
            <a className="btn btn-teal" href="/portal/app/symptoms-tracker/" style={{ height: 56, padding: "0 28px", fontSize: 16 }}>Start Consultation {Icons.arrow}</a>
            <div className="sub">Continue in the HRT.org patient portal</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeFooter(){return null;}

function HomeApp() {
  useEffect(() => {
    document.body.setAttribute("data-gender", "women");
    document.body.classList.add("home");
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.06, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div data-screen-label="HRT Home">
      <HomeNav />
      <main id="main-content" tabIndex={-1}><HomeHero />
      <CareOverview />
      <div className="reveal"><TreatmentsHome /></div>
      <div className="reveal"><MasterYourHealth /></div>
      <div className="reveal"><LabTesting /></div>
      <CareJourney />
      <div className="reveal"><LoveBand /></div>
      <div className="reveal"><Journal /></div>
      <div className="reveal"><MiniCTA /></div>
      </main><HomeFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<HomeApp />);
