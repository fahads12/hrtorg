/* global React, Icons, ImageSlot, ProductCard */
const { useEffect, useRef } = React;

/* ============================================================
   COPY — per-gender content
   ============================================================ */
const FEATURES=SOURCE.values.map(v=>({...v,b:v.d,ic:Icons.check}));const STEPS=CARE_STEPS.slice(0,4).map(s=>({t:s.title,d:s.body,ic:Icons.provider}));
function Hero({copy}){return <section className="hero"><div className="wrap hero-grid"><div className="hero-copy"><div className="eyebrow">{copy.eyebrow}</div><h1>{copy.headlineLead}<span className="accent">{copy.headlineAccent}</span></h1><p className="hero-sub">{copy.sub}</p><div className="hero-ctas"><a className="btn btn-primary" href="Consultation.html">Start Consultation {Icons.arrow}</a><a className="btn btn-ghost" href="Treatments.html">Explore Treatments {Icons.arrow}</a></div></div><div className="hero-visual"><EditorialImage/></div></div></section>;}

function FeaturesStrip() {
  return (
    <div className="wrap">
      <div className="features">
        {FEATURES.map((f, i) => (
          <div key={i} className="feature">
            <div className="ic">{f.ic}</div>
            <div>
              <div className="ft">{f.t}</div>
              <div className="fb">{f.b}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Symptoms({ copy }) {
  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <h2>Feeling Off? <span className="accent">You're Not Alone.</span></h2>
          <p>{copy.symptomsLead}</p>
        </div>
        <div className="symptoms-grid">
          {copy.symptoms.map((s, i) => (
            <div key={i} className="symptom">
              <div className="si">{s.ic}</div>
              <div className="sn">{s.n}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Treatments({copy}){return <section className="tight"><div className="wrap"><div className="section-head"><h2>{copy.treatmentsTitle}<span className="accent">{copy.treatmentsAccent}</span></h2></div><div className="treatments-grid">{copy.treatments.map(t=><div className="treatment" key={t.name}><div className="visual">{t.image?<img className="original-product-photo" src={t.image} alt="HRT.org hormone test kit" loading="lazy"/>:<EditorialImage kind="science"/>}</div><div className="body"><h3>{t.name}</h3><p className="desc">{t.desc}</p><a className="learn-more" href={t.href}>Learn More {Icons.arrow}</a></div></div>)}</div></div></section>;}

function HowItWorks() {
  return (
    <section className="howitworks">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Process</div>
          <h2 style={{ marginTop: 12 }}>How It <span className="accent">Works</span></h2>
        </div>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={i} className="step">
              <div className="step-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="step-ic">{s.ic}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChoose({ copy }) {
  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <h2>{copy.whyTitle.split(" Choose ")[0]} <span className="accent">Choose HRT</span></h2>
        </div>
        <div className="why-grid">
          {copy.whyCards.map((c, i) => (
            <div key={i} className="why-card">
              <div className="why-ic">{c.ic}</div>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials(){return <section className="tight"><div className="wrap"><div className="section-head"><h2>A test-kit <span className="accent">customer story.</span></h2></div><div className="testimonials-grid"><div className="testimonial"><div className="avatar">S</div><div><p>“The test came quickly, was easy to understand the directions, return was easy, and received results that were easy to understand in a very timely manner. THANKS!”</p><div className="name">S. Miller — quoted on HRT.org</div></div></div></div></div></section>;}

function CTABanner({ copy }) {
  return (
    <div className="cta-banner">
      <div className="cta-inner">
        <div>
          <h2>{copy.ctaTitle}<br/><span className="accent">{copy.ctaAccent}</span></h2>
          <p className="cta-sub">Explore education, testing and provider-guided care.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <a className="btn btn-teal" href="Consultation.html" style={{ height: 56, padding: "0 28px", fontSize: 16 }}>Get Started Today {Icons.arrow}</a>
          <div className="cta-meta">
            <span>🔒 Secure</span><span>•</span><span>Private</span><span>•</span><span>Confidential</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer(){return null;}
Object.assign(window,{Hero,FeaturesStrip,Symptoms,Treatments,HowItWorks,WhyChoose,Testimonials,CTABanner});