/* global React, ReactDOM, Icons, Logo */
const { useEffect, useState } = React;

/* ============================================================
   TREATMENTS DATA
   ============================================================ */
const TREATMENTS = [
  {
    key: "hrt", num: "01",
    eyebrow: "Hormone Replacement",
    name: "Hormone Therapy ", accent: "for life balance",
    desc: "Personalized bioidentical hormone therapy — estrogen, progesterone, testosterone — to restore sleep, energy, mood, libido, and metabolic balance.",
    addresses: ["Hot flashes & night sweats", "Low testosterone (women & men)", "Poor sleep & mood", "Libido & sexual function"],
    forms: ["Cream", "Injection", "Pellet (men)"],
    timeline: "Results in 4–12 weeks",
    requires: "Lab work, provider visit",
    fromPrice: "149", per: "/mo, billed annually",
    audience: ["women", "men"],
  },
  {
    key: "peptides", num: "02",
    eyebrow: "Performance & Longevity",
    name: "Anti-Aging ", accent: "Peptide Therapy",
    desc: "Provider-prescribed peptide protocols for tissue repair, skin, recovery, sleep, and cellular health — single-target therapies and curated stacks.",
    addresses: ["Recovery & joint health", "Skin & collagen support", "Sleep quality", "Body composition"],
    forms: ["Subcutaneous injection", "Oral capsule", "Nasal spray"],
    timeline: "Results in 4–12 weeks",
    requires: "Provider visit",
    fromPrice: "189", per: "/mo",
    audience: ["women", "men"],
  },
  {
    key: "weight", num: "03",
    eyebrow: "Metabolic Health",
    name: "Weight Loss ", accent: "& Management",
    desc: "GLP-1 medication (semaglutide, tirzepatide) plus provider coaching, lab tracking, and a maintenance phase that accounts for hormones.",
    addresses: ["Weight that won't move", "Cravings & insulin resistance", "Visceral & belly fat", "Metabolic syndrome"],
    forms: ["Weekly injection"],
    timeline: "15–22% body weight over 12 months",
    requires: "Lab work, provider visit",
    fromPrice: "249", per: "/mo",
    audience: ["women", "men"],
  },
  {
    key: "sexual", num: "04",
    eyebrow: "Intimacy & Vitality",
    name: "Sexual ", accent: "Health",
    desc: "Confidential, evidence-based treatments for libido, arousal, and performance — for women and men. Discreet shipping, on-demand or daily options.",
    addresses: ["Low libido (women & men)", "Erectile concerns", "Painful intimacy", "Performance & confidence"],
    forms: ["Tablet", "Cream", "Injection (PT-141)"],
    timeline: "30 min — 12 weeks (varies)",
    requires: "Provider visit",
    fromPrice: "29", per: "/dose",
    audience: ["women", "men"],
  },
  {
    key: "hair", num: "05",
    eyebrow: "Confidence",
    name: "Hair Loss ", accent: "Treatment",
    desc: "Clinically proven topicals and orals for pattern hair loss and hormonal shedding — including custom-compounded formulations for women.",
    addresses: ["Receding hairline", "Crown thinning", "Postpartum / peri shedding", "Pattern hair loss"],
    forms: ["Topical (foam, liquid)", "Oral tablet", "Compounded multi-action"],
    timeline: "Visible regrowth in 4–6 months",
    requires: "Provider visit, photos",
    fromPrice: "29", per: "/mo",
    audience: ["women", "men"],
  },
];

const PRODUCT_ICONS = {
  hrt: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" strokeDasharray="2 4" /></svg>,
  peptides: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3c0 6 12 6 12 12s-12 6-12 12 M18 3c0 6-12 6-12 12s12 6 12 12" /></svg>,
  weight: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 8l3-2 3 2" /><line x1="12" y1="6" x2="12" y2="13" /></svg>,
  sexual: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></svg>,
  hair: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13c0-6 3-9 6-9s6 3 6 9 M5 21c1-5 3-8 7-8s6 3 7 8" /></svg>,
};

const DECISION_PATHS = [
  { ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 1 5 3 3 0 0 0 3 3h6a3 3 0 0 0 3-3 3 3 0 0 0 1-5 3 3 0 0 0-1-5 3 3 0 0 0-3-3z" /></svg>, t: "Not sure where to start", d: "Take a 5-minute intake quiz. We'll suggest the right treatment based on your symptoms, history, and goals.", r: "START QUIZ", href: "#" },
  { ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-1.5C5 16 8 14 12 14s7 2 7 5.5V21" /></svg>, t: "Want to talk to a provider", d: "Book a 15-minute consultation. A licensed clinician will help you map out the right plan for your goals.", r: "BOOK CONSULTATION", href: "#" },
  { ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 3v9l-3 6a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-3-6V3" /></svg>, t: "Want to see my labs first", d: "Order an at-home hormone or metabolic panel. We'll review the results with you before recommending treatment.", r: "ORDER LAB KIT", href: "Resources.html#testing" },
];

/* ============================================================
   COMPONENTS
   ============================================================ */
function TrNav() {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="HRT Home.html" style={{ textDecoration: "none" }}><Logo /></a>
        <div className="nav-links">
          <SymptomCheckMenu />
          <a className="nav-link" href="Treatments.html" style={{ color: "var(--ink)", background: "var(--primary-tint)" }}>Treatments</a>
          <a className="nav-link" href="HRT Landing.html#women">For Women</a>
          <a className="nav-link" href="HRT Landing.html#men">For Men</a>
          <a className="nav-link" href="Resources.html">Resources</a>
          <a className="nav-link" href="Resources.html#testing">Lab Testing</a>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a className="nav-link" style={{ fontSize: 13.5 }} href="https://portal.hrt.org">Sign in</a>
          <a className="btn btn-primary" href="Consultation.html">Start Consultation {Icons.arrow}</a>
        </div>
      </div>
    </nav>
  );
}

function TrHero() {
  return (
    <section className="tr-hero">
      <div className="wrap">
        <div className="eyebrow">Treatment Options</div>
        <h1 style={{ marginTop: 16 }}>Care, mapped to <span className="accent">what your body needs.</span></h1>
        <p className="lead">Five clinician-led treatment programs across hormones, longevity, metabolic health, intimacy, and confidence — for women and men. Personalized plans, transparent pricing, ongoing provider care.</p>
      </div>
    </section>
  );
}

function TrFilter({ filter, setFilter, count }) {
  return (
    <div className="tr-filter">
      <div className="wrap tr-filter-inner">
        <div className="tr-tabs">
          <button className={`tr-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All Treatments</button>
          <button className={`tr-tab ${filter === "women" ? "active" : ""}`} onClick={() => setFilter("women")}>For Women</button>
          <button className={`tr-tab ${filter === "men" ? "active" : ""}`} onClick={() => setFilter("men")}>For Men</button>
        </div>
        <div className="tr-count">{count} TREATMENTS</div>
      </div>
    </div>
  );
}

function TrItem({ t, filter }) {
  const isAll = filter === "all";
  const linkGender = filter === "men" ? "men" : "women";
  const href = `Product.html?p=${t.key}&g=${linkGender}`;

  const Body = (
    <>
      <div className="tr-num">{t.num}</div>
      <div className="tr-head">
        <div className="tr-eyebrow">{t.eyebrow}</div>
        <h2>{t.name}<span className="accent">{t.accent}</span></h2>
        {isAll && (
          <div className="tr-genders">
            <a className="tr-gender-pill women" href={`Product.html?p=${t.key}&g=women`}>
              <span className="gdot"></span>For Women
            </a>
            <a className="tr-gender-pill men" href={`Product.html?p=${t.key}&g=men`}>
              <span className="gdot"></span>For Men
            </a>
          </div>
        )}
      </div>
      <div className="tr-body">
        <p>{t.desc}</p>
        <div className="tr-meta">
          <div>
            <div className="label">Addresses</div>
            <div className="val">{t.addresses.slice(0, 2).join(" · ")}</div>
          </div>
          <div>
            <div className="label">Available as</div>
            <div className="val">{t.forms.join(", ")}</div>
          </div>
          <div>
            <div className="label">Typical results</div>
            <div className="val">{t.timeline}</div>
          </div>
          <div>
            <div className="label">Requires</div>
            <div className="val">{t.requires}</div>
          </div>
        </div>
      </div>
      <div className="tr-cta">
        <div className="tr-price">
          <div className="from">FROM</div>
          <div className="amt">${t.fromPrice}</div>
          <div className="per">{t.per}</div>
        </div>
        {isAll ? (
          <a className="tr-arrow" href={`Product.html?p=${t.key}&g=women`} aria-label="Learn more">{Icons.arrow}</a>
        ) : (
          <div className="tr-arrow">{Icons.arrow}</div>
        )}
      </div>
    </>
  );

  if (isAll) return <div className="tr-item">{Body}</div>;
  return <a className="tr-item" href={href}>{Body}</a>;
}

function TrList({ filter, setFilter }) {
  const filtered = filter === "all" ? TREATMENTS : TREATMENTS.filter(t => t.audience.includes(filter));
  return (
    <>
      <TrFilter filter={filter} setFilter={setFilter} count={filtered.length} />
      <section className="tr-list">
        <div className="wrap">
          {filtered.map(t => <TrItem key={t.key} t={t} filter={filter} />)}
        </div>
      </section>
    </>
  );
}

function TrCompare() {
  return (
    <section className="tr-compare">
      <div className="wrap">
        <div className="eyebrow">Comparison</div>
        <h2 style={{ marginTop: 12 }}>Side-by-side, <span className="accent">at a glance.</span></h2>
        <div className="tr-table">
          <table>
            <thead>
              <tr>
                <th>Treatment</th>
                <th>For Women</th>
                <th>For Men</th>
                <th>Labs Needed</th>
                <th>Time to Results</th>
                <th>From</th>
              </tr>
            </thead>
            <tbody>
              {TREATMENTS.map(t => (
                <tr key={t.key}>
                  <td>
                    <div className="name">{t.name}{t.accent}<span className="sub">{t.eyebrow}</span></div>
                  </td>
                  <td>{t.audience.includes("women") ? <span className="yes">✓ Available</span> : <span className="no">—</span>}</td>
                  <td>{t.audience.includes("men") ? <span className="yes">✓ Available</span> : <span className="no">—</span>}</td>
                  <td>{t.requires.includes("Lab") ? <span className="yes">Required</span> : <span style={{ color: "var(--ink-3)" }}>Optional</span>}</td>
                  <td>{t.timeline}</td>
                  <td><span className="price-cell">${t.fromPrice}</span><span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 4 }}>{t.per}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function TrHelper() {
  return (
    <section className="tr-helper">
      <div className="wrap">
        <div className="eyebrow" style={{ color: "#E8A8C5" }}>Not Sure Yet?</div>
        <h2 style={{ marginTop: 12 }}>Three ways to <span className="accent">find your fit.</span></h2>
        <div className="tr-helper-grid">
          {DECISION_PATHS.map((p, i) => (
            <a key={i} className="tr-helper-card" href={p.href}>
              <div className="ic">{p.ic}</div>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
              <div className="route">
                <span>{p.r}</span>
                <span>→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrFooter() {
  const cols = [
    { h: "For Women", links: [["Hormone Therapy", "Product.html?p=hrt&g=women"], ["Peptides", "Product.html?p=peptides&g=women"], ["Weight Management", "Product.html?p=weight&g=women"], ["Sexual Health", "Product.html?p=sexual&g=women"], ["Hair Loss", "Product.html?p=hair&g=women"]] },
    { h: "For Men", links: [["Hormone Therapy", "Product.html?p=hrt&g=men"], ["Peptides", "Product.html?p=peptides&g=men"], ["Weight Management", "Product.html?p=weight&g=men"], ["Sexual Health", "Product.html?p=sexual&g=men"], ["Hair Loss", "Product.html?p=hair&g=men"]] },
    { h: "Resources", links: [["Conditions & Symptoms", "Resources.html#conditions"], ["Hormone Health", "Resources.html#hormones"], ["Lab & Genetic Testing", "Resources.html#testing"], ["Nutrition & Lifestyle", "Resources.html#nutrition"], ["Products & Reviews", "Resources.html#products"]] },
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

function TreatmentsApp() {
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    document.body.setAttribute("data-gender", filter === "men" ? "men" : "women");
  }, [filter]);

  return (
    <div data-screen-label="Treatments Overview">
      <TrNav />
      <TrHero />
      <TrList filter={filter} setFilter={setFilter} />
      <TrCompare />
      <TrHelper />
      <TrFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<TreatmentsApp />);
