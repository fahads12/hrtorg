/* global React, ReactDOM, Icons, Logo */
const { useState } = React;

/* ============================================================
   DATA
   ============================================================ */
const STATS = [
  { num: "50", accent: "K+", lab: "Members treated" },
  { num: "50", accent: "", lab: "States served" },
  { num: "4.9", accent: "★", lab: "Average rating" },
  { num: "94", accent: "%", lab: "Report feeling better" },
];

const VAL_IC = {
  science: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v9l-3 6a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-3-6V3" /><line x1="7" y1="3" x2="17" y2="3" /><line x1="9" y1="13" x2="15" y2="13" /></svg>,
  heart: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></svg>,
  eye: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>,
};

const VALUES = [
  { ic: "science", t: "Evidence over hype", d: "Every protocol we prescribe is grounded in clinical research and refined by real outcomes — never trends or shortcuts." },
  { ic: "heart", t: "Care that listens", d: "Hormones are personal. Our providers take the time to understand your history, your goals, and how you actually feel." },
  { ic: "eye", t: "Radical transparency", d: "Published pricing, plain-language lab results, and no insurance games. You always know what you're paying for and why." },
];

const TEAM = [
  { n: "Dr. Elena Cho", r: "Chief Medical Officer", cred: "MD, ENDOCRINOLOGY", tag: "PORTRAIT • CMO" },
  { n: "Dr. Marcus Reed", r: "Head of Men's Health", cred: "DO, UROLOGY", tag: "PORTRAIT • PROVIDER" },
  { n: "Dr. Priya Nair", r: "Menopause Lead", cred: "MD, OB/GYN · NCMP", tag: "PORTRAIT • PROVIDER" },
  { n: "James Okafor", r: "Head of Pharmacy", cred: "PharmD", tag: "PORTRAIT • PHARMACY" },
];

const BADGES = [
  { ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" /><path d="M9 12l2 2 4-4" /></svg>, t: "HIPAA compliant", d: "Your health data is encrypted and protected end to end." },
  { ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-1.5C5 16 8 14 12 14s7 2 7 5.5V21" /></svg>, t: "Board-certified providers", d: "Licensed clinicians specializing in hormones and longevity." },
  { ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6v5l5 10a2 2 0 0 1-2 3H6a2 2 0 0 1-2-3l5-10z" /><line x1="9" y1="3" x2="15" y2="3" /></svg>, t: "LegitScript certified", d: "Verified for safe, legal telehealth and pharmacy practices." },
  { ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /></svg>, t: "503A/503B pharmacies", d: "Medications compounded at accredited U.S. pharmacies." },
];

/* ============================================================
   NAV / FOOTER
   ============================================================ */
function AboutNav() {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="HRT Home.html" style={{ textDecoration: "none" }}><Logo /></a>
        <div className="nav-links">
          <SymptomCheckMenu />
          <a className="nav-link" href="HRT Landing.html#women">For Women</a>
          <a className="nav-link" href="HRT Landing.html#men">For Men</a>
          <a className="nav-link" href="Pricing.html">Pricing</a>
          <a className="nav-link" href="Resources.html">Resources</a>
          <a className="nav-link" href="About.html">About</a>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a className="nav-link" style={{ fontSize: 13.5 }} href="https://portal.hrt.org">Sign in</a>
          <a className="btn btn-primary" href="Consultation.html">Start Consultation {Icons.arrow}</a>
        </div>
      </div>
    </nav>
  );
}

function AboutFooter() {
  const cols = [
    { h: "For Women", links: [["Hormone Therapy", "Product.html?p=hrt&g=women"], ["Peptides", "Product.html?p=peptides&g=women"], ["Weight Management", "Product.html?p=weight&g=women"], ["Sexual Health", "Product.html?p=sexual&g=women"], ["Hair Loss", "Product.html?p=hair&g=women"]] },
    { h: "For Men", links: [["Hormone Therapy", "Product.html?p=hrt&g=men"], ["Peptides", "Product.html?p=peptides&g=men"], ["Weight Management", "Product.html?p=weight&g=men"], ["Sexual Health", "Product.html?p=sexual&g=men"], ["Hair Loss", "Product.html?p=hair&g=men"]] },
    { h: "Company", links: [["About Us", "About.html"], ["Pricing & Membership", "Pricing.html"], ["Resources", "Resources.html"], ["How It Works", "How It Works.html"], ["Member Portal", "https://portal.hrt.org"]] },
    { h: "Support", links: [["help@hrt.org", "#"], ["(833) 217-HRT2", "#"], ["Mon–Fri 8am–8pm ET", "#"], ["Privacy Policy", "#"]] },
  ];
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="brand-block">
            <Logo />
            <p>Telemedicine for women and men — guided by science, delivered with care.</p>
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
          <span style={{ maxWidth: 560 }}>HRT.org does not diagnose, treat, cure, or prevent any disease. Treatments require a consultation with a licensed healthcare provider.</span>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   SECTIONS
   ============================================================ */
function Hero() {
  return (
    <section className="ab-hero">
      <div className="wrap">
        <div className="ab-hero-inner">
          <div className="eyebrow">About HRT.org</div>
          <h1>Hormone health, <span className="accent">taken seriously.</span></h1>
          <p className="lead">We started HRT.org because hormone care was too hard to access, too quick to dismiss real symptoms, and far too opaque about cost. We built the platform we wished existed — rigorous medicine, honest pricing, and providers who actually listen.</p>
        </div>
      </div>
    </section>
  );
}

function StatsBand() {
  return (
    <section className="ab-stats tight">
      <div className="wrap">
        <div className="ab-stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="ab-stat">
              <div className="num">{s.num}<span className="accent">{s.accent}</span></div>
              <div className="lab">{s.lab}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="ab-story">
      <div className="wrap">
        <div>
          <div className="eyebrow">Our Story</div>
          <h2 style={{ marginTop: 14 }}>Built by people who were <span className="accent">dismissed too.</span></h2>
        </div>
        <div className="body">
          <p className="drop">"You're fine, your labs are normal" — the sentence that sent our founder to five different doctors before anyone took her exhaustion, brain fog, and lost sleep seriously.</p>
          <p>What she found, once she finally got care, was that the medicine wasn't the hard part. Access was. Answers were. Understanding what she was paying for was. Modern hormone therapy is safe, well-studied, and life-changing for millions of people — yet it sits behind rushed appointments, surprise bills, and a system that treats symptoms as complaints.</p>
          <p>So we built HRT.org: a place where a licensed provider actually reads your history, where labs come with a plain-language explanation, and where the price is on the page before you commit. Whether you're navigating perimenopause, optimizing testosterone, or somewhere in between — care should meet you where you are.</p>
          <div className="ab-sign">
            <div className="avatar">A</div>
            <div className="who">
              <div className="n">Ava Bennett</div>
              <div className="r">Founder &amp; CEO, HRT.org</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Values() {
  return (
    <section className="ab-values">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 40px", maxWidth: 640 }}>
          <div className="eyebrow">What We Believe</div>
          <h2 style={{ marginTop: 12 }}>Three principles behind <span className="accent">every plan.</span></h2>
        </div>
        <div className="val-grid">
          {VALUES.map((v, i) => (
            <div key={i} className="ab-val">
              <div className="v-ic">{VAL_IC[v.ic]}</div>
              <h3>{v.t}</h3>
              <p>{v.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className="ab-team">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 40px", maxWidth: 640 }}>
          <div className="eyebrow">Care Team</div>
          <h2 style={{ marginTop: 12 }}>The clinicians <span className="accent">behind your care.</span></h2>
          <p style={{ marginTop: 14 }}>A specialized team of hormone, longevity, and pharmacy experts — not a general call center.</p>
        </div>
        <div className="ab-team-grid">
          {TEAM.map((p, i) => (
            <div key={i} className="ab-person">
              <div className="photo"><span className="tag">{p.tag}</span></div>
              <div className="n">{p.n}</div>
              <div className="r">{p.r}</div>
              <div className="cred">{p.cred}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className="ab-trust tight">
      <div className="wrap">
        <div>
          <div className="eyebrow">Standards</div>
          <h2 style={{ marginTop: 14 }}>Held to the <span className="accent">highest bar.</span></h2>
        </div>
        <div className="badges">
          {BADGES.map((b, i) => (
            <div key={i} className="ab-badge">
              <span className="b-ic">{b.ic}</span>
              <div>
                <div className="bt">{b.t}</div>
                <div className="bd">{b.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="mini-cta">
          <h2>Care built for how you <span className="accent">actually feel.</span><br/>Start your consultation today.</h2>
          <div className="right">
            <a className="btn btn-teal" href="Consultation.html" style={{ height: 56, padding: "0 28px", fontSize: 16 }}>Start Consultation {Icons.arrow}</a>
            <div className="sub">15-minute intake · No cost to start</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   APP
   ============================================================ */
function AboutApp() {
  return (
    <div data-screen-label="About Us">
      <AboutNav />
      <Hero />
      <StatsBand />
      <Story />
      <Values />
      <Team />
      <Trust />
      <CTA />
      <AboutFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AboutApp />);
