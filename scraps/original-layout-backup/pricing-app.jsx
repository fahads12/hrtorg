/* global React, ReactDOM, Icons, Logo */
const { useEffect, useState, useRef } = React;

/* ============================================================
   DATA
   ============================================================ */
// Membership tiers — the care platform. Medications billed separately (see pr-cats).
const PLANS = [
  {
    name: "Starter",
    sub: "For a single focus",
    monthly: 39,
    annual: 33,
    bullets: [
      "Provider messaging — up to 5 threads / month",
      "1 video visit per year",
      "Member pricing on all medications",
      "Discreet delivery on every order",
    ],
    featured: false,
  },
  {
    name: "Complete",
    sub: "Most members choose this",
    monthly: 99,
    annual: 84,
    bullets: [
      "Everything in Starter",
      "Unlocked messaging — up to 20 threads / month",
      "Quarterly provider visits",
      "2 comprehensive lab panels / year",
      "Priority provider access & dose tuning",
      "Free shipping, always",
    ],
    featured: true,
    ribbon: "MOST POPULAR",
  },
  {
    name: "Concierge",
    sub: "Fully managed care",
    monthly: 249,
    annual: 209,
    bullets: [
      "Everything in Complete",
      "Dedicated named provider",
      "Unlimited messaging & visits, same-week booking",
      "4 lab panels + genetic testing / year",
      "Direct line for you and your care team",
    ],
    featured: false,
  },
];

const CAT_ICON = {
  hrt: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" strokeDasharray="2 4" /></svg>,
  peptides: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3c0 6 12 6 12 12s-12 6-12 12 M18 3c0 6-12 6-12 12s12 6 12 12" /></svg>,
  weight: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 8l3-2 3 2" /><line x1="12" y1="6" x2="12" y2="13" /></svg>,
  sexual: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></svg>,
  hair: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13c0-6 3-9 6-9s6 3 6 9 M5 21c1-5 3-8 7-8s6 3 7 8" /></svg>,
  labs: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v9l-3 6a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-3-6V3" /><line x1="7" y1="3" x2="17" y2="3" /><line x1="9" y1="13" x2="15" y2="13" /></svg>,
};

const CATS = [
  { key: "hrt", h: "Hormone Therapy", d: "Bioidentical estrogen, progesterone & testosterone protocols.", amt: "149", per: "/mo", href: "Product.html?p=hrt" },
  { key: "peptides", h: "Peptide Therapy", d: "Recovery, longevity & body-composition peptide protocols.", amt: "189", per: "/mo", href: "Product.html?p=peptides" },
  { key: "weight", h: "Weight Management", d: "Provider-prescribed GLP-1s with coaching and labs.", amt: "249", per: "/mo", href: "Product.html?p=weight" },
  { key: "sexual", h: "Sexual Health", d: "Discreet treatments for libido, arousal & performance.", amt: "29", per: "/dose", href: "Product.html?p=sexual" },
  { key: "hair", h: "Hair Loss", d: "Clinically proven topical and oral regimens.", amt: "29", per: "/mo", href: "Product.html?p=hair" },
  { key: "labs", h: "Lab & Genetic Testing", d: "At-home panels and genetic markers, reviewed by your provider.", amt: "99", per: "one-time", href: "Resources.html#testing" },
];

const INCLUDED = [
  { n: "01", t: "Licensed providers", d: "Board-certified clinicians specializing in hormones and longevity — in all 50 states." },
  { n: "02", t: "No insurance games", d: "Flat, published pricing. No claims, no surprise codes, no waiting on approvals." },
  { n: "03", t: "Labs done right", d: "At-home kits or partner labs, with your provider walking you through every marker." },
  { n: "04", t: "Care that continues", d: "Messaging, check-ins, and dose adjustments for as long as you're a member." },
];

const NEVER = [
  { t: "No consultation fee to start", d: "Your intake and first provider review cost nothing." },
  { t: "No hidden shipping charges", d: "Delivery is included on Complete and Concierge, itemized clearly on Starter." },
  { t: "No cancellation penalties", d: "Pause or cancel anytime from your account — effective immediately." },
  { t: "No surprise price hikes", d: "Your membership rate is locked for as long as you stay enrolled." },
];

const FAQS = [
  { q: "What does the membership actually cover?", a: "Your membership covers the care platform — provider visits, unlimited messaging, dose adjustments, and member pricing on medications. Medications and lab kits are billed separately and transparently, so you always know what you're paying for." },
  { q: "How is this different from paying per treatment?", a: "You can still pay per treatment on any product page. Membership lowers the price of every medication and folds provider visits and labs into one predictable monthly cost — it pays for itself for anyone on ongoing therapy." },
  { q: "Do you bill my insurance?", a: "No. We keep pricing flat and published rather than routing through insurance. Many members use HSA/FSA dollars, and our plans are typically less than a specialist copay and visit combined." },
  { q: "Can I switch or cancel my plan?", a: "Anytime. Upgrade, downgrade, pause, or cancel from your account with no penalty. Changes to your membership take effect immediately; medication subscriptions can be paused independently." },
  { q: "Is annual billing worth it?", a: "Annual billing saves roughly 15% versus monthly and locks your rate. If you're committing to a therapy for more than a few months, it's the better value — and you can still cancel." },
];

/* ============================================================
   NAV / FOOTER (matched to product-app)
   ============================================================ */
function PricingNav() {
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

function PricingFooter() {
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
   HERO + BILLING TOGGLE
   ============================================================ */
function Hero({ billing, setBilling }) {
  const ref = useRef(null);
  const [slider, setSlider] = useState({ left: 5, width: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const btn = ref.current.querySelector(`button[data-b="${billing}"]`);
    if (btn) setSlider({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [billing]);

  return (
    <section className="pr-hero">
      <div className="wrap">
        <div className="pr-hero-inner">
          <div className="eyebrow">Pricing &amp; Membership</div>
          <h1>Transparent care, <span className="accent">no insurance games.</span></h1>
          <p className="lead">One membership covers your provider, your visits, and member pricing on every medication. What you'll pay is published, flat, and yours to cancel anytime.</p>
          <div className="pr-hero-controls">
            <div className="billing-toggle" ref={ref}>
              <span className="bslider" style={{ left: slider.left, width: slider.width }} />
              <button data-b="monthly" className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>Monthly</button>
              <button data-b="annual" className={billing === "annual" ? "active" : ""} onClick={() => setBilling("annual")}>
                Annual <span className="save-flag">SAVE 15%</span>
              </button>
            </div>
            <span className="pr-hero-note"><strong>No cost to start.</strong> Complete your intake free, pay only when you begin care.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   MEMBERSHIP PLANS
   ============================================================ */
function Plans({ billing }) {
  return (
    <section className="pr-plans">
      <div className="wrap">
        <div className="plans-grid">
          {PLANS.map((p, i) => {
            const price = billing === "annual" ? p.annual : p.monthly;
            const showStrike = billing === "annual";
            return (
              <div key={i} className={`plan ${p.featured ? "featured" : "outline"}`}>
                {p.ribbon && <span className="ribbon">{p.ribbon}</span>}
                <h3>{p.name}</h3>
                <div className="plan-sub">{p.sub}</div>
                <div className="price">
                  <span className="amt small">${price}</span>
                  <span className="per">/mo{billing === "annual" ? ", billed yearly" : ""}</span>
                  {showStrike && <span className="strike">${p.monthly}</span>}
                </div>
                <ul>
                  {p.bullets.map((b, j) => (
                    <li key={j}><span className="check">{Icons.check}</span>{b}</li>
                  ))}
                </ul>
                <a className="plan-cta" href="Consultation.html">{p.featured ? "Start with Complete" : `Choose ${p.name}`} →</a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PRICING BY TREATMENT
   ============================================================ */
function Cats() {
  return (
    <section className="pr-cats">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 40px", maxWidth: 640 }}>
          <div className="eyebrow">Medication Pricing</div>
          <h2 style={{ marginTop: 12 }}>Every treatment, <span className="accent">priced up front.</span></h2>
          <p style={{ marginTop: 14 }}>Medications are billed separately from your membership — and members pay less. Here's where each therapy starts.</p>
        </div>
        <div className="pr-cat-grid">
          {CATS.map((c) => (
            <a key={c.key} className="pr-cat" href={c.href}>
              <div className="cat-ic">{CAT_ICON[c.key]}</div>
              <h3>{c.h}</h3>
              <p className="cat-desc">{c.d}</p>
              <div className="cat-foot">
                <div className="from">
                  <span className="lbl">from</span>
                  <span className="amt">${c.amt}</span>
                  <span className="per">{c.per}</span>
                </div>
                <span className="cat-link">Explore <span className="arrow">→</span></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   INCLUDED IN EVERY PLAN
   ============================================================ */
function Included() {
  return (
    <section className="pr-included">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 40px", maxWidth: 640 }}>
          <div className="eyebrow">In Every Membership</div>
          <h2 style={{ marginTop: 12 }}>What your membership <span className="accent">always buys.</span></h2>
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
function Transparency() {
  return (
    <section className="pr-trans">
      <div className="wrap">
        <div>
          <div className="eyebrow" style={{ color: "var(--teal)" }}>Our Pricing Promise</div>
          <h2 style={{ marginTop: 16 }}>What you'll <span className="accent">never</span> find on your bill.</h2>
          <p className="sub">We built HRT.org to be the opposite of a surprise medical bill. If it's not listed on this page, you're not paying for it.</p>
        </div>
        <ul className="pr-trans-list">
          {NEVER.map((n, i) => (
            <li key={i}>
              <span className="tick">{Icons.check}</span>
              <div>
                <div className="tt">{n.t}</div>
                <div className="td">{n.d}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */
function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="pr-faq">
      <div className="wrap">
        <div className="section-head" style={{ margin: "0 auto 40px" }}>
          <div className="eyebrow">Pricing FAQ</div>
          <h2 style={{ marginTop: 12 }}>The money <span className="accent">questions</span>.</h2>
        </div>
        <div className="faq-wrap">
          {FAQS.map((f, i) => (
            <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
              <div className="q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{f.q}</span>
                <span className="plus">+</span>
              </div>
              <div className="a">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CTA
   ============================================================ */
function CTA() {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="mini-cta">
          <h2>See your exact price <span className="accent">before you commit.</span><br/>Start your free intake today.</h2>
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
