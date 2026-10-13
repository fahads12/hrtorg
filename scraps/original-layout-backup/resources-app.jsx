/* global React, ReactDOM, Icons, Logo */
const { useEffect } = React;

/* ============================================================
   CATEGORY ICONS (reuse stroke style)
   ============================================================ */
const Ic = (children, sw = 1.5) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

const CAT_ICONS = {
  conditions: Ic(<><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></>),
  symptoms: Ic(<><circle cx="12" cy="12" r="9" /><path d="M8 12h8 M12 8v8" /></>),
  heart: Ic(<><path d="M3 12h4l2-5 4 10 2-5h6" /></>),
  thyroid: Ic(<><path d="M12 4c-2 4-6 4-6 9a6 6 0 0 0 12 0c0-5-4-5-6-9z" /><circle cx="12" cy="14" r="1.5" /></>),
  mental: Ic(<><path d="M9 4a3 3 0 0 0-3 3v2a3 3 0 0 0-1 5 3 3 0 0 0 4 3v2a2 2 0 0 0 4 0v-2a3 3 0 0 0 4-3 3 3 0 0 0-1-5V7a3 3 0 0 0-3-3z" /></>),
  hormones: Ic(<><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" strokeDasharray="2 4" /></>),
  womens: Ic(<><circle cx="12" cy="9" r="5" /><line x1="12" y1="14" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" /></>),
  mens: Ic(<><circle cx="10" cy="14" r="5" /><line x1="14" y1="10" x2="20" y2="4" /><polyline points="15 4 20 4 20 9" /></>),
  health_test: Ic(<><path d="M9 3v9l-3 6a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-3-6V3" /><line x1="9" y1="13" x2="15" y2="13" /></>),
  genetic_test: Ic(<><path d="M6 3c0 6 12 6 12 12s-12 6-12 12 M18 3c0 6-12 6-12 12s12 6 12 12" /></>),
  nutrition: Ic(<><path d="M6 11a6 6 0 0 1 12 0c0 5-2 9-6 9s-6-4-6-9z" /><path d="M12 5c0-1 1-2 2-2" /></>),
  advice: Ic(<><path d="M3 12c0-5 4-8 9-8s9 3 9 8-4 8-9 8c-1.5 0-3-.3-4-.8L3 21l1.2-3.6C3.5 16 3 14 3 12z" /></>),
  product: Ic(<><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /></>),
  reviews: Ic(<><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" /></>),
  brands: Ic(<><path d="M3 7a4 4 0 0 1 4-4h2v6h6V3h2a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" /></>),
  qa: Ic(<><circle cx="12" cy="12" r="9" /><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4 M12 17h.01" /></>),
  news: Ic(<><rect x="3" y="5" width="18" height="14" rx="1.5" /><line x1="7" y1="9" x2="13" y2="9" /><line x1="7" y1="13" x2="17" y2="13" /><line x1="7" y1="17" x2="14" y2="17" /></>),
};

/* ============================================================
   SILOS
   ============================================================ */
const SILOS = [
  {
    id: "conditions",
    eyebrow: "Care Library",
    title: "Conditions & ",
    titleAccent: "Symptoms",
    blurb: "Understand what's going on in your body — what conditions present like, what symptoms mean, and when to act.",
    count: 86, articles: 86,
    featured: {
      gender: "",
      eyebrow: "Featured",
      title: "When fatigue is more than tired: a clinical guide to chronic energy loss",
      desc: "Five common — and often missed — drivers of low energy, from cortisol patterns to subclinical thyroid shifts, with what to test and what to ask your provider.",
      meta: ["Provider authored", "12 min read", "Updated May 2026"],
      tag: "EDITORIAL · MORNING LIGHT",
    },
    cards: [
      { ic: CAT_ICONS.conditions, t: "Conditions", d: "Plain-language overviews of common hormonal, metabolic, and reproductive conditions.", ct: "32 ARTICLES", href: "#conditions/conditions" },
      { ic: CAT_ICONS.symptoms, t: "Symptoms", d: "What your body might be telling you — and when a symptom warrants a closer look.", ct: "24 ARTICLES", href: "#conditions/symptoms" },
      { ic: CAT_ICONS.heart, t: "Heart Health", d: "Blood pressure, cholesterol, and what hormones have to do with cardiovascular risk.", ct: "11 ARTICLES", href: "#conditions/heart-health" },
      { ic: CAT_ICONS.thyroid, t: "Thyroid Health", d: "Hypo, hyper, Hashimoto's, and reading the full thyroid panel beyond TSH.", ct: "9 ARTICLES", href: "#conditions/thyroid-health" },
      { ic: CAT_ICONS.mental, t: "Mental Health", d: "Mood, anxiety, sleep, and the hormone–brain connection that drives them.", ct: "10 ARTICLES", href: "#conditions/mental-health" },
    ],
  },
  
  
  {
    id: "hormones",
    eyebrow: "By Audience",
    title: "Hormone ",
    titleAccent: "Health",
    blurb: "Deep coverage of the hormonal landscape — for women, for men, and the systems both share.",
    count: 142, articles: 142,
    featured: {
      gender: "women",
      eyebrow: "For Women",
      title: "The perimenopause playbook: what to actually do in years before menopause",
      desc: "A stage-by-stage clinical guide to perimenopause — symptoms, lab markers, treatment options, and the questions to bring to your provider visit.",
      meta: ["Provider authored", "14 min read", "Series · 4 parts"],
      tag: "EDITORIAL · WOMEN, NATURAL LIGHT",
    },
    cards: [
      { ic: CAT_ICONS.hormones, t: "Hormones 101", d: "How estrogen, testosterone, progesterone, cortisol, and thyroid hormones actually work.", ct: "38 ARTICLES", href: "#hormones/hormones" },
      { ic: CAT_ICONS.womens, t: "Women's Health", d: "Perimenopause, menopause, cycle, fertility, postpartum, and beyond.", ct: "58 ARTICLES", href: "#hormones/womens-health", cls: "women" },
      { ic: CAT_ICONS.mens, t: "Men's Health", d: "Testosterone, andropause, performance, longevity, and recovery science.", ct: "46 ARTICLES", href: "#hormones/mens-health", cls: "men" },
    ],
  },
  {
    id: "testing",
    eyebrow: "Know Your Numbers",
    title: "Lab & Genetic ",
    titleAccent: "Testing",
    blurb: "Make sense of bloodwork, genetic results, and at-home test kits — what to test, when, and what the numbers mean.",
    count: 34, articles: 34,
    featured: {
      gender: "",
      eyebrow: "Guide",
      title: "Reading your hormone panel: a provider-led walkthrough",
      desc: "From total and free testosterone to estradiol, SHBG, and DHEA — what each marker tells you and how providers interpret them in context.",
      meta: ["Provider authored", "10 min read", "With sample panels"],
      tag: "MACRO · LAB GLASS",
    },
    cards: [
      { ic: CAT_ICONS.health_test, t: "Health Testing", d: "Blood panels, at-home kits, what to test, and how often.", ct: "22 ARTICLES", href: "#testing/health-testing" },
      { ic: CAT_ICONS.genetic_test, t: "Genetic Testing", d: "MTHFR, COMT, and what genetic markers do (and don't) tell you about hormones.", ct: "12 ARTICLES", href: "#testing/genetic-testing" },
    ],
  },
  {
    id: "nutrition",
    eyebrow: "Lifestyle",
    title: "Nutrition & ",
    titleAccent: "Lifestyle",
    blurb: "The everyday choices that move your labs — nutrition, sleep, training, stress, and provider-grade advice.",
    count: 78, articles: 78,
    featured: {
      gender: "",
      eyebrow: "Series",
      title: "Eating for hormone balance: the 28-day clinician's framework",
      desc: "What our providers recommend for steady energy, mood, and weight — built around real meals, real timing, and the science behind each choice.",
      meta: ["Provider authored", "9 min read", "Includes meal plan"],
      tag: "EDITORIAL · MARKET SHOT",
    },
    cards: [
      { ic: CAT_ICONS.nutrition, t: "Nutrition", d: "Protein, micronutrients, fiber, and the food–hormone connection in practice.", ct: "44 ARTICLES", href: "#nutrition/nutrition" },
      { ic: CAT_ICONS.advice, t: "Advice", d: "Provider Q&A, lifestyle tips, and the small habits that compound into results.", ct: "34 ARTICLES", href: "#nutrition/advice" },
    ],
  },
  {
    id: "products",
    eyebrow: "Shop Smart",
    title: "Products & ",
    titleAccent: "Reviews",
    blurb: "Independent, clinician-vetted reviews of the supplements, devices, and brands we trust — and the ones we don't.",
    count: 64, articles: 64,
    featured: {
      gender: "",
      eyebrow: "Buyer's Guide",
      title: "Best at-home hormone test kits, ranked by clinicians",
      desc: "We tested twelve at-home kits against the same lab benchmarks. The winners, the watch-outs, and what we'd skip entirely.",
      meta: ["Updated quarterly", "11 min read", "Independent review"],
      tag: "FLAT LAY · KITS",
    },
    cards: [
      { ic: CAT_ICONS.product, t: "Product", d: "How specific compounds, supplements, and therapies work — and who they're for.", ct: "28 ARTICLES", href: "#products/product" },
      { ic: CAT_ICONS.reviews, t: "Product Reviews", d: "Detailed, criteria-based reviews of the products we evaluate.", ct: "24 ARTICLES", href: "#products/product-reviews" },
      { ic: CAT_ICONS.brands, t: "Trusted Brands", d: "Brands we've vetted for ingredient quality, third-party testing, and transparency.", ct: "12 ARTICLES", href: "#products/trusted-brands" },
    ],
  },
  {
    id: "news",
    eyebrow: "Stay Current",
    title: "News & ",
    titleAccent: "Q&A",
    blurb: "What's new in hormone science and care — plus the questions patients ask us most, answered by providers.",
    count: 96, articles: 96,
    featured: {
      gender: "",
      eyebrow: "Provider Q&A",
      title: "\"What's the difference between bioidentical and synthetic hormones?\"",
      desc: "One of the most common questions we get, answered with clinical nuance — and what the research actually shows about safety and efficacy.",
      meta: ["Q&A", "6 min read", "Provider answer"],
      tag: "PORTRAIT · CLINICIAN",
    },
    cards: [
      { ic: CAT_ICONS.qa, t: "Question and Answer", d: "Patient questions answered by our licensed providers in plain language.", ct: "62 ARTICLES", href: "#news/question-and-answer" },
      { ic: CAT_ICONS.news, t: "News", d: "Hormone health research, FDA updates, and HRT.org company news.", ct: "34 ARTICLES", href: "#news/news" },
    ],
  },
];

/* ============================================================
   COMPONENTS
   ============================================================ */
function ResNav() {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="HRT Home.html" style={{ textDecoration: "none" }}><Logo /></a>
        <div className="nav-links">
          <SymptomCheckMenu />
          <a className="nav-link" href="HRT Landing.html#women">For Women</a>
          <a className="nav-link" href="HRT Landing.html#men">For Men</a>
          <a className="nav-link" href="Resources.html" style={{ color: "var(--ink)", background: "var(--primary-tint)" }}>Resources</a>
          <a className="nav-link" href="Resources.html#testing">Lab Testing</a>
          <a className="nav-link" href="Resources.html#news">Journal</a>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a className="nav-link" style={{ fontSize: 13.5 }} href="https://portal.hrt.org">Sign in</a>
          <a className="btn btn-primary" href="Consultation.html">Start Consultation {Icons.arrow}</a>
        </div>
      </div>
    </nav>
  );
}

function SiloNav() {
  return (
    <div className="silo-nav">
      <div className="wrap silo-nav-inner">
        {SILOS.map(s => (
          <a key={s.id} className="silo-pill" href={`#${s.id}`}>
            {s.title.replace(" & ", " & ")}{s.titleAccent}
            <span className="count">{s.count}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function Silo({ silo }) {
  const wide = silo.cards.length === 2;
  return (
    <section id={silo.id} className="silo" style={{ scrollMarginTop: 140 }}>
      <div className="wrap">
        <div className="silo-head">
          <div className="left">
            <div className="eyebrow">{silo.eyebrow}</div>
            <h2>{silo.title}<span className="accent">{silo.titleAccent}</span></h2>
            <p className="blurb">{silo.blurb}</p>
          </div>
          <div className="silo-meta">
            <span className="big">{silo.articles}</span>
            articles
          </div>
        </div>

        <a className={`cat-featured ${silo.featured.gender}`} href="#" style={{ marginBottom: 18, display: "grid" }}>
          <div className="visual">
            <span className="tag">{silo.featured.tag}</span>
          </div>
          <div className="body">
            <div className="eyebrow">{silo.featured.eyebrow}</div>
            <h3>{silo.featured.title}</h3>
            <p className="desc">{silo.featured.desc}</p>
            <div className="meta">
              {silo.featured.meta.map((m, i) => (
                <React.Fragment key={i}>
                  <span>{m}</span>
                  {i < silo.featured.meta.length - 1 && <span className="dot"></span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </a>

        <div className={`cat-grid ${wide ? "wide" : ""}`}>
          {silo.cards.map((c, i) => (
            <a key={i} className={`cat-card ${c.cls || ""}`} href={c.href}>
              <div className="ic-wrap">{c.ic}</div>
              <h3>{c.t}</h3>
              <p className="desc">{c.d}</p>
              <div className="row">
                <div className="ct">{c.ct}</div>
                <div className="arr">{Icons.arrow}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResFooter() {
  const cols = [
    { h: "For Women", links: [["Hormone Therapy", "HRT Landing.html#women"], ["Peptides", "HRT Landing.html#women"], ["Weight Management", "HRT Landing.html#women"], ["Sexual Health", "HRT Landing.html#women"], ["Lab Testing", "Resources.html#testing"]] },
    { h: "For Men", links: [["Hormone Therapy", "HRT Landing.html#men"], ["Peptides", "HRT Landing.html#men"], ["Weight Management", "HRT Landing.html#men"], ["Sexual Health", "HRT Landing.html#men"], ["Hair Loss", "HRT Landing.html#men"], ["Lab Testing", "Resources.html#testing"]] },
    { h: "Resources", links: [["Conditions & Symptoms", "Resources.html#conditions"], ["Hormone Health", "Resources.html#hormones"], ["Lab & Genetic Testing", "Resources.html#testing"], ["Nutrition & Lifestyle", "Resources.html#nutrition"], ["Products & Reviews", "Resources.html#products"], ["News & Q&A", "Resources.html#news"]] },
    { h: "Support", links: [["help@hrt.org", "#"], ["(833) 217-HRT2", "#"], ["Mon–Fri 8am–8pm ET", "#"], ["Privacy Policy", "#"], ["Terms of Service", "#"]] },
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

function ResApp() {
  useEffect(() => {
    document.body.setAttribute("data-gender", "women");
    document.body.classList.add("resources");
    // Smooth scroll to hash on load
    if (location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, []);

  return (
    <div data-screen-label="HRT Resources">
      <ResNav />
      <section className="res-hero">
        <div className="wrap">
          <div className="eyebrow">The Library</div>
          <h1 style={{ marginTop: 18 }}>Clinician-written resources <span className="accent">for every part of your health.</span></h1>
          <p className="sub">Hundreds of provider-authored guides, reviews, and answers — organized by what you're trying to understand.</p>
        </div>
      </section>
      <SiloNav />
      {SILOS.map(s => <Silo key={s.id} silo={s} />)}
      <section className="tight">
        <div className="wrap">
          <div className="mini-cta">
            <h2>Still have a question?<br/><span className="accent">Talk to a provider.</span></h2>
            <div className="right">
              <a className="btn btn-teal" href="Consultation.html" style={{ height: 56, padding: "0 28px", fontSize: 16 }}>Start Consultation {Icons.arrow}</a>
              <div className="sub">15-minute intake · No commitment</div>
            </div>
          </div>
        </div>
      </section>
      <ResFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ResApp />);
