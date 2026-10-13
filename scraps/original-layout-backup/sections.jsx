/* global React, Icons, ImageSlot, ProductCard */
const { useEffect, useRef } = React;

/* ============================================================
   COPY — per-gender content
   ============================================================ */
const COPY = {
  women: {
    eyebrow: "Balance. Energy. Mood. Sleep.",
    headlineLead: "Personalized Hormone Therapy for ",
    headlineAccent: "Women",
    sub: "Restore balance, reclaim your energy, and feel like yourself again — with provider-guided, personalized care.",
    treated: "100,000+ Women Treated",
    symptomsLead: "Hormone imbalance can affect more than you think.",
    treatmentsTitle: "Evidence-Based Treatments for ",
    treatmentsAccent: "Women",
    whyTitle: "Why Women Choose HRT",
    whyCards: [
      { ic: Icons.user, t: "Personalized Care That Puts You First", d: "We look at your whole health story — symptoms, lifestyle, labs, and goals — to create a plan that's right for you." },
      { ic: Icons.flask, t: "Lab-Informed, Evidence-Based", d: "Data-driven care using advanced lab testing to ensure safe, effective, results you can trust." },
      { ic: Icons.lock, t: "Convenient, Private & Discreet", d: "Telehealth visits and discreet shipping make prioritizing your health simple and stress-free." },
    ],
    testimonialsTitle: "Real ",
    testimonialsAccent: "Women",
    testimonialsTail: ". Real Results.",
    testimonials: [
      { initials: "M", name: "Michelle R.", age: "Age 48", q: "I finally feel like myself again. My energy is back, sleep is deeper, and my hot flashes are gone. The care I've received has been life-changing." },
      { initials: "L", name: "Lisa T.", age: "Age 52", q: "The provider listened, the plan was customized for me, and the results speak for themselves. I'm so grateful I found HRT." },
    ],
    ctaTitle: "Take the Next Step Toward ",
    ctaAccent: "Feeling Like Yourself Again",
    heroLabel: "PORTRAIT • WOMAN 40-55, NATURAL LIGHT",
    symptoms: [
      { ic: Icons.flame, n: "Hot Flashes" },
      { ic: Icons.battery, n: "Low Energy" },
      { ic: Icons.brain, n: "Mood Changes" },
      { ic: Icons.moon, n: "Poor Sleep" },
      { ic: Icons.face, n: "Brain Fog" },
      { ic: Icons.scale, n: "Weight Changes" },
      { ic: Icons.heart, n: "Low Libido" },
      { ic: Icons.venus, n: "Hormone Imbalance" },
    ],
    treatments: [
      { name: "Personalized Hormone Cream", desc: "Customized bioidentical cream designed for your unique needs.", bullets: ["Customized dosing", "Fast-absorbing", "Made for you"], productName: "HORMONE CREAM" },
      { name: "Estrogen Cream", desc: "Targeted estrogen support for balance and relief.", bullets: ["Supports balance", "Fast-absorbing", "Clinically informed"], productName: "ESTROGEN CREAM" },
      { name: "Progesterone Tablets", desc: "Supports cycle balance, restful sleep, and hormone harmony.", bullets: ["Promotes relaxation", "Supports sleep", "Easy daily dose"], productName: "PROGESTERONE" },
      { name: "Women's Hormone Test Kit", desc: "Comprehensive lab testing to uncover imbalances and guide your care.", bullets: ["CLIA-certified labs", "Private & convenient", "Results in 3–5 days"], productName: "TEST KIT" },
    ],
  },
  men: {
    eyebrow: "Science. Personalized Care. Real Results.",
    headlineLead: "Personalized Hormone Therapy for ",
    headlineAccent: "Men",
    sub: "Optimize energy, strength, focus, libido, and long-term wellness with expert-guided care tailored to you.",
    treated: "10,000+ Men Treated",
    symptomsLead: "Low hormone levels can affect more than you think.",
    treatmentsTitle: "Evidence-Based Treatments for ",
    treatmentsAccent: "Men",
    whyTitle: "Why Men Choose HRT",
    whyCards: [
      { ic: Icons.user, t: "Personalized, Not One-Size-Fits-All", d: "We look at your unique biology, lifestyle, and goals to create a plan built around you." },
      { ic: Icons.flask, t: "Lab-Informed Decisions", d: "Data-driven care using advanced lab testing to ensure safe, effective, results you can trust." },
      { ic: Icons.box, t: "Convenience You Can Count On", d: "Telehealth visits and discreet delivery make optimizing your health simple and stress-free." },
    ],
    testimonialsTitle: "Real ",
    testimonialsAccent: "Men",
    testimonialsTail: ". Real Results.",
    testimonials: [
      { initials: "M", name: "Michael R.", age: "Age 46", q: "I had no energy, low drive, and couldn't stay focused. HRT changed that. I feel like myself again — stronger, sharper, and more motivated every day." },
      { initials: "J", name: "Jason T.", age: "Age 38", q: "The process was easy, the team is top-notch, and the results speak for themselves. My workouts, sleep, and confidence have all improved." },
    ],
    ctaTitle: "Take the Next Step Toward ",
    ctaAccent: "Better Hormone Health",
    heroLabel: "PORTRAIT • MAN 35-50, GYM SETTING",
    symptoms: [
      { ic: Icons.battery, n: "Low Energy" },
      { ic: Icons.mars, n: "Low Libido" },
      { ic: Icons.dumbbell, n: "Poor Recovery" },
      { ic: Icons.brain, n: "Brain Fog" },
      { ic: Icons.face, n: "Mood Changes" },
      { ic: Icons.muscle, n: "Muscle Loss" },
      { ic: Icons.scale, n: "Weight Gain" },
      { ic: Icons.moon, n: "Poor Sleep" },
    ],
    treatments: [
      { name: "Testosterone Cream", desc: "Daily topical application for steady, consistent hormone support and improved well-being.", bullets: ["Easy to apply", "Steady absorption", "Clinically prescribed"], productName: "TESTOSTERONE CREAM" },
      { name: "Testosterone Injection", desc: "Clinically proven injections for optimal testosterone levels, energy, and performance.", bullets: ["Fast, effective results", "Long-lasting support", "Provider prescribed"], productName: "TESTOSTERONE INJ." },
      { name: "Men's Hormone Test Kit", desc: "Comprehensive lab testing that reveals what your body needs to perform at its best.", bullets: ["CLIA-certified labs", "Private & convenient", "Results in 3–5 days"], productName: "TEST KIT" },
      { name: "Recovery & Wellness Stack", desc: "Targeted supplements to support energy, recovery, and performance alongside therapy.", bullets: ["Daily support", "Provider curated", "Third-party tested"], productName: "WELLNESS STACK" },
    ],
  },
};

const FEATURES = [
  { ic: Icons.provider, t: "Provider Guided", b: "Licensed providers guide your care every step of the way." },
  { ic: Icons.home, t: "At-Home Testing", b: "Private, easy, and convenient lab testing from home." },
  { ic: Icons.clipboard, t: "Personalized Plans", b: "Treatment tailored to your labs, goals, and lifestyle." },
  { ic: Icons.box, t: "Delivered to Your Door", b: "Medications shipped discreetly and reliably to you." },
];

const STEPS = [
  { ic: Icons.laptop, t: "Complete Online Intake", d: "Tell us about your health, symptoms, and goals in a secure online questionnaire." },
  { ic: Icons.provider, t: "Review with Provider", d: "A licensed provider reviews your information and creates a personalized plan." },
  { ic: Icons.test, t: "Test When Needed", d: "We ship a lab test kit to your home, or you can visit a partner lab." },
  { ic: Icons.truck, t: "Receive Personalized Treatment", d: "Your treatment is shipped discreetly to your door with ongoing provider support." },
];

/* ============================================================
   SECTIONS
   ============================================================ */
function Hero({ copy }) {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">{copy.eyebrow}</div>
          <h1 style={{ marginTop: 20 }}>
            {copy.headlineLead}<span className="accent">{copy.headlineAccent}</span>
          </h1>
          <p className="hero-sub">{copy.sub}</p>
          <div className="hero-ctas">
            <a className="btn btn-primary" href="Consultation.html">Start Consultation {Icons.arrow}</a>
            <a className="btn btn-ghost" href="Treatments.html" style={{ textDecoration: "none" }}>Explore Treatment Options {Icons.arrow}</a>
          </div>
          <div className="trust-row">
            <div className="item" style={{ color: "var(--teal)" }}>
              {Icons.shield}
              <span className="label"><span className="strong">HIPAA Compliant</span><br/>& Secure</span>
            </div>
            <div className="item">
              <div style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", background: "#fff", border: "1px solid var(--line)", fontFamily: "Newsreader, serif", fontStyle: "italic", color: "var(--ink)", fontSize: 16 }}>G</div>
              <span className="label"><span className="strong">4.9/5</span> Google Rating<br/><span style={{ color: "var(--teal)", letterSpacing: 1 }}>★★★★★</span></span>
            </div>
            <div className="item" style={{ color: "var(--primary)" }}>
              {Icons.users}
              <span className="label"><span className="strong">{copy.treated}</span></span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <ImageSlot label={copy.heroLabel} ratio="4/5">
            <div className="product-stack">
              <ProductCard name={copy.treatments[1].productName} height="short" />
              <ProductCard name={copy.treatments[0].productName} height="tall" />
              <ProductCard name={copy.treatments[2].productName} height="normal" />
            </div>
          </ImageSlot>
        </div>
      </div>
    </section>
  );
}

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

function Treatments({ copy }) {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="section-head">
          <h2>{copy.treatmentsTitle}<span className="accent">{copy.treatmentsAccent}</span></h2>
        </div>
        <div className="treatments-grid">
          {copy.treatments.map((t, i) => (
            <div key={i} className="treatment">
              <div className="visual">
                <div className="treatment-product">
                  <div>
                    <div className="tp-brand">HRT</div>
                    <div className="tp-tld">hrt.org</div>
                  </div>
                  <div className="tp-name">{t.productName}</div>
                  <div className="tp-sub">2 OZ • TOPICAL</div>
                </div>
              </div>
              <div className="body">
                <h3>{t.name}</h3>
                <p className="desc">{t.desc}</p>
                <ul>
                  {t.bullets.map((b, j) => (
                    <li key={j}><span className="check">{Icons.check}</span>{b}</li>
                  ))}
                </ul>
                <button className="learn-more">Learn More {Icons.arrow}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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

function Testimonials({ copy }) {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="section-head">
          <h2>{copy.testimonialsTitle}<span className="accent">{copy.testimonialsAccent}</span>{copy.testimonialsTail}</h2>
        </div>
        <div className="testimonials-grid">
          {copy.testimonials.map((t, i) => (
            <div key={i} className="testimonial">
              <div className="avatar">{t.initials}</div>
              <div style={{ flex: 1 }}>
                <div className="quote-mark">"</div>
                <p>{t.q}</p>
                <div className="meta">
                  <div>
                    <div className="name">— {t.name}</div>
                    <div className="age">{t.age}</div>
                  </div>
                  <div className="stars">★★★★★</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner({ copy }) {
  return (
    <div className="cta-banner">
      <div className="cta-inner">
        <div>
          <h2>{copy.ctaTitle}<br/><span className="accent">{copy.ctaAccent}</span></h2>
          <p className="cta-sub">Personalized care. Proven treatments. Real results.</p>
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

function Footer({ gender }) {
  const cols = [
    { h: "Explore", links: [["Home", "HRT Home.html"], ["For Women", "HRT Landing.html#women"], ["For Men", "HRT Landing.html#men"], ["Resources", "Resources.html"], ["Lab Testing", "Resources.html#testing"]] },
    { h: "Resources", links: [["Conditions & Symptoms", "Resources.html#conditions"], ["Hormone Health", "Resources.html#hormones"], ["Nutrition & Lifestyle", "Resources.html#nutrition"], ["Products & Reviews", "Resources.html#products"], ["News & Q&A", "Resources.html#news"]] },
    { h: "Company", links: [["About Us", "#"], ["Careers", "#"], ["Press", "#"], ["Privacy Policy", "#"], ["Terms of Service", "#"]] },
    { h: "Support", links: [["help@hrt.org", "#"], ["(833) 217-HRT2", "#"], ["Mon–Fri 8am–8pm ET", "#"]] },
  ];
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="brand-block">
            <Logo />
            <p>{gender === "women" ? "Women's hormone therapy personalized for you." : "Personalized hormone therapy for men, guided by science and delivered with care."}</p>
            <div className="socials">
              {["f","ig","tk","yt","in"].map(s => (
                <a key={s}><span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "rgba(255,255,255,0.5)" }}>{s}</span></a>
              ))}
            </div>
          </div>
          {cols.map((c, i) => (
            <div key={i}>
              <h4>{c.h}</h4>
              <ul>{c.links.map((l, j) => <li key={j}><a href={l[1]}>{l[0]}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 HRT.org. All rights reserved.</span>
          <span style={{ maxWidth: 520 }}>HRT.org does not diagnose, treat, cure, or prevent any disease. Treatments require a consultation with a licensed healthcare provider.</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { COPY, Hero, FeaturesStrip, Symptoms, Treatments, HowItWorks, WhyChoose, Testimonials, CTABanner, Footer });
