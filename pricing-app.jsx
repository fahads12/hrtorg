/* global React, ReactDOM, Icons, Logo */
const { useEffect, useState, useRef } = React;

/* ============================================================
   DATA
   ============================================================ */
// Membership tiers — the care platform. Medications billed separately (see pr-cats).
const INCLUDED=SOURCE.values.map(v=>({...v,ic:Icons.check}));const NEVER=[];const FAQS=SOURCE.faq.slice(0,4);
function PricingNav(){return null;}

function PricingFooter(){return null;}

function Hero({billing,setBilling}){return <section className="pr-hero"><div className="wrap pr-hero-inner"><div className="eyebrow">Pricing & membership</div><h1>Understand your <span className="accent">care options.</span></h1><p className="lead">Shop test kits through the HRT.org store and discuss treatment options through the patient portal.</p><div className="billing-toggle"><button aria-pressed={billing==='monthly'} className={billing==='monthly'?'active':''} onClick={()=>setBilling('monthly')}>Care options</button><button aria-pressed={billing==='annual'} className={billing==='annual'?'active':''} onClick={()=>setBilling('annual')}>Membership</button></div></div></section>;}

function Plans({billing}){return <section className="pr-plans"><div className="wrap">{billing==='annual'?<div className="plan featured"><h2>Membership enquiries</h2><p>Contact our team to confirm current membership availability, pricing, and benefits.</p><a className="plan-cta" href="Contact.html">Contact our team</a></div>:<CareOptions/>}</div></section>;}

const PR_TREATMENT_DESCRIPTIONS = {
  'hrt': 'Explore care for hormonal changes, including perimenopause, menopause, and concerns about testosterone.',
  'peptides': 'Learn about peptide therapies and discuss the specific treatment, its intended use, and its risks with a provider.',
  'weight': 'Explore medical weight management, including prescription options alongside nutrition and lifestyle changes.',
  'sexual': 'Talk about changes in desire, comfort, or sexual function. Physical health, medications, and emotional wellbeing can all play a part.',
  'hair': 'Explore care for thinning hair and hair loss, including topical and oral options where appropriate.',
};
function Cats(){return <section className="pr-cats"><div className="wrap"><div className="section-head"><h2>Explore care <em>by treatment.</em></h2></div><div className="pr-cat-grid">{SOURCE.treatments.map(t=><a className="pr-cat" key={t.key} href={'Treatments.html#treatment-'+t.key}><h3>{t.name}{t.accent}</h3><p>{PR_TREATMENT_DESCRIPTIONS[t.key]}</p><span className="cat-link">Explore →</span></a>)}</div></div></section>;}

function Included() {
  return (
    <section className="pr-included">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 40px", maxWidth: 640 }}>
          <div className="eyebrow">Care and support</div>
          <h2 style={{ marginTop: 12 }}>Explore your <span className="accent">care options.</span></h2>
        </div>
        <div className="inc-grid">
          {INCLUDED.map((f, i) => (
            <div key={i} className="inc-card">
              <div className="inc-num">{f.n}</div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TRANSPARENCY BAND — what you'll never be billed for
   ============================================================ */
function Transparency(){return <section className="pr-transparency"><div className="wrap"><h2>Purchase information, <em>in one place.</em></h2><div className="pr-cat-grid">{[['Shop prices','https://store.hrt.org/'],['Terms and conditions','Terms and Conditions.html'],['Return policy','Return Policy.html']].map(([t,h])=><a className="pr-cat" href={h} key={t}><h3>{t}</h3><span>Read more →</span></a>)}</div></div></section>;}

function FAQ(){return <section><div className="wrap"><h2>Common questions</h2><SourceFAQ items={FAQS}/></div></section>;}

function CTA() {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="mini-cta">
          <h2>Explore the next step <span className="accent">in your care.</span></h2>
          <div className="right">
            <a className="btn btn-teal" href="Consultation.html" style={{ height: 56, padding: "0 28px", fontSize: 16 }}>Prepare for a consultation {Icons.arrow}</a>
            <div className="sub">Prepare before continuing to the patient portal</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   APP
   ============================================================ */
function PricingApp() {
  const [billing, setBilling] = useState("monthly");
  return (
    <div data-screen-label="Pricing & Membership">
      <PricingNav />
      <Hero billing={billing} setBilling={setBilling} />
      <Plans billing={billing} />
      <Cats />
      <Included />
      <Transparency />
      <FAQ />
      <CTA />
      <PricingFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PricingApp />);
