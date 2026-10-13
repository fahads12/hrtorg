/* global React, ReactDOM, Icons, Logo */
const { useEffect, useState, useRef } = React;

/* ============================================================
   ARTICLE — example: a Conditions article on perimenopause
   Demonstrates the full template: TLDR, sectioned body, sidebar
   sub-links, contextual callouts/CTAs, related & final CTA.
   ============================================================ */
const ARTICLE = {
  category: "Conditions",
  categoryHref: "Resources.html#conditions",
  subCategory: "Hormone Health · Women",
  subCategoryHref: "Audience.html?g=women",
  // Category-driven CTA mapping — sidebar + final CTA adapt to this
  ctaKind: "conditions", // conditions | symptoms | testing | nutrition | product | reviews | qa
  audience: "women",
  title: "The perimenopause playbook: ",
  titleAccent: "what to actually do in the years before menopause",
  deck: "Most women spend a decade in perimenopause before their final period. Here's what changes, what the labs show, and the evidence-based moves that actually help.",
  author: { initials: "RL", name: "Dr. Rachel Lin, MD", title: "Internal Medicine · Hormone Specialist" },
  publishedOn: "May 12, 2026",
  updatedOn: "May 13, 2026",
  readMin: 14,
  tldr: [
    "Perimenopause typically starts in your late 30s or 40s — sometimes 8–10 years before your final period.",
    "Hormones don't decline smoothly. They fluctuate, then drop — which is why symptoms can seem random and intense.",
    "The earliest signals are sleep, mood, and cycle changes — often years before hot flashes.",
    "Bloodwork is useful, but a single panel rarely tells the full story. Symptom tracking matters more than a number on a single day.",
    "Lifestyle helps. Hormone therapy works. Both have strong evidence in the right candidates.",
    "Earlier intervention is generally better than waiting for symptoms to become severe.",
  ],
  toc: [
    { id: "what", t: "What perimenopause actually is" },
    { id: "signals", t: "The earliest signals" },
    { id: "labs", t: "What the labs show (and don't)" },
    { id: "lifestyle", t: "Lifestyle: what moves the needle" },
    { id: "hrt", t: "When hormone therapy makes sense" },
    { id: "starting", t: "How to start" },
  ],
};

const RELATED = [
  { tag: "HORMONE HEALTH", t: "Bioidentical vs synthetic hormones: what the research actually shows", meta: ["11 min read", "Updated May 2026"] },
  { tag: "SYMPTOMS", t: "Why sleep falls apart in your 40s — and the hormonal fix most doctors miss", meta: ["8 min read", "Provider authored"] },
  { tag: "TESTING", t: "Reading your hormone panel: a provider-led walkthrough", meta: ["10 min read", "With sample panels"] },
];

// CTA presets keyed by category type. Pick a sensible set of CTAs for each.
const CTA_PRESETS = {
  conditions: {
    sideHead: "If this is happening to you",
    sideBody: "A licensed provider can read your symptoms in context and recommend a plan — labs, lifestyle, or therapy.",
    sideBtn: "Start Consultation",
    sideSub: "15-MIN INTAKE · NO COMMITMENT",
    sideLinks: [
      { t: "Take symptom checklist", href: "Audience.html?g=women#symptoms" },
      { t: "Hormone therapy plans", href: "Product.html?p=hrt&g=women" },
      { t: "Order at-home labs", href: "Resources.html#testing" },
    ],
    inline: { kind: "symptoms", strong: "Recognize a pattern?", body: "We mapped the most common symptom clusters to next steps — quick checklist, no signup.", cta: "Open checklist", href: "Audience.html?g=women#symptoms" },
    inlineMid: { kind: "test", strong: "Know your numbers.", body: "Comprehensive hormone panel — at-home or partner lab. Provider-reviewed results in 3–5 days.", cta: "Order lab kit", href: "Resources.html#testing" },
    inlineLate: { kind: "product", strong: "Treatment, personalized.", body: "Bioidentical hormone therapy, prescribed by a clinician and delivered to your door.", cta: "See HRT plans", href: "Product.html?p=hrt&g=women" },
    finalH: "Ready to stop guessing?",
    finalAccent: "We'll map a plan with you.",
    finalP: "Three ways to start, based on where you are: a 15-minute provider intake, a 5-minute symptom checklist, or an at-home lab kit.",
    finalOpts: [
      { name: "Start a consultation", sub: "15-min intake, provider-reviewed", href: "How It Works.html" },
      { name: "Take the symptom checklist", sub: "5 min · no signup", href: "Audience.html?g=women#symptoms" },
      { name: "Order an at-home lab kit", sub: "Results in 3–5 days", href: "Resources.html#testing" },
    ],
  },
  symptoms: {
    sideHead: "Sounds familiar?",
    sideBody: "Map your symptoms in 5 minutes. We'll suggest the right next step — quiz, panel, or visit.",
    sideBtn: "Open symptom checklist",
    sideSub: "5 MIN · NO SIGNUP",
    sideLinks: [
      { t: "All conditions library", href: "Resources.html#conditions" },
      { t: "Hormone therapy plans", href: "Product.html?p=hrt&g=women" },
      { t: "Talk to a provider", href: "How It Works.html" },
    ],
  },
  testing: {
    sideHead: "Test before you treat.",
    sideBody: "At-home hormone panels, provider-reviewed, no clinic visit. Get the picture before deciding next steps.",
    sideBtn: "Order a lab kit",
    sideSub: "CLIA-CERTIFIED · 3-5 DAY RESULTS",
    sideLinks: [
      { t: "What's tested", href: "Resources.html#testing" },
      { t: "Reading your panel", href: "Resources.html#testing" },
      { t: "Talk to a provider", href: "How It Works.html" },
    ],
  },
  nutrition: {
    sideHead: "Eat for hormone balance.",
    sideBody: "Provider-built nutrition framework that pairs with treatment — or stands on its own.",
    sideBtn: "Read the guide",
    sideSub: "PROVIDER AUTHORED · 9 MIN",
    sideLinks: [
      { t: "All nutrition articles", href: "Resources.html#nutrition" },
      { t: "Weight Management plans", href: "Product.html?p=weight&g=women" },
      { t: "Talk to a provider", href: "How It Works.html" },
    ],
  },
  product: {
    sideHead: "Ready to start?",
    sideBody: "Provider-prescribed care, delivered to your door. Cancel anytime.",
    sideBtn: "Start Consultation",
    sideSub: "FREE SHIPPING · NO INSURANCE NEEDED",
    sideLinks: [
      { t: "See all treatments", href: "Treatments.html" },
      { t: "How it works", href: "How It Works.html" },
      { t: "Order labs first", href: "Resources.html#testing" },
    ],
  },
};

/* ============================================================
   COMPONENTS
   ============================================================ */
function ArtNav() {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="HRT Home.html" style={{ textDecoration: "none" }}><Logo /></a>
        <div className="nav-links">
          <SymptomCheckMenu />
          <a className="nav-link" href="Treatments.html">Treatments</a>
          <a className="nav-link" href="Audience.html?g=women">For Women</a>
          <a className="nav-link" href="Audience.html?g=men">For Men</a>
          <a className="nav-link" href="How It Works.html">How it Works</a>
          <a className="nav-link" href="Resources.html" style={{ color: "var(--ink)", background: "var(--primary-tint)" }}>Resources</a>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a className="nav-link" style={{ fontSize: 13.5 }} href="https://portal.hrt.org">Sign in</a>
          <a className="btn btn-primary" href="Consultation.html">Start Consultation {Icons.arrow}</a>
        </div>
      </div>
    </nav>
  );
}

function ArtTop({ article }) {
  return (
    <div className="art-top">
      <div className="wrap art-top-inner">
        <div className="art-crumb">
          <a href="HRT Home.html">Home</a>
          <span className="sep">/</span>
          <a href="Resources.html">Resources</a>
          <span className="sep">/</span>
          <a href={article.categoryHref}>{article.category}</a>
          <span className="sep">/</span>
          <span className="current">Perimenopause</span>
        </div>
        <div className="art-utils">
          <button>↗ Share</button>
          <button>☆ Save</button>
          <button>🖶 Print</button>
        </div>
      </div>
    </div>
  );
}

function ArtHero({ article }) {
  return (
    <section className="art-hero">
      <div className="wrap">
        <div className="cat-tag"><span className="dot"></span>{article.category} · {article.subCategory}</div>
        <h1>{article.title}<span className="accent">{article.titleAccent}</span></h1>
        <p className="deck">{article.deck}</p>
        <div className="art-byline">
          <div className="author">
            <div className="av">{article.author.initials}</div>
            <div>
              <div className="name">{article.author.name}</div>
              <div className="sub">{article.author.title}</div>
            </div>
          </div>
          <div className="meta">
            <span>{article.readMin} MIN READ</span>
            <span className="dot"></span>
            <span>UPDATED {article.updatedOn.toUpperCase()}</span>
            <span className="dot"></span>
            <span>PROVIDER REVIEWED</span>
          </div>
        </div>
        <div className="art-tldr">
          <div className="art-tldr-head">
            TL;DR
            <span className="tldr-big">In short</span>
            <span className="read-est">{article.tldr.length} TAKEAWAYS · ~30 SEC</span>
          </div>
          <ul>
            {article.tldr.map((t, i) => (
              <li key={i}><span className="n">{String(i + 1).padStart(2, "0")}</span><span>{t}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ReadingRail({ toc, activeId, progress }) {
  return (
    <aside className="art-rail">
      <div className="label">In this article</div>
      <ul>
        {toc.map(t => (
          <li key={t.id}>
            <a href={`#${t.id}`} className={activeId === t.id ? "active" : ""}>{t.t}</a>
          </li>
        ))}
      </ul>
      <div className="progress"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
    </aside>
  );
}

function InlineCallout({ kind = "product", strong, body, cta, href }) {
  const icMap = {
    symptoms: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 12 10 18 20 6" /></svg>,
    test: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3v9l-3 6a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-3-6V3" /></svg>,
    product: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4-9 4-9-4z M3 7v10l9 4 9-4V7" /></svg>,
  };
  return (
    <div className={`art-callout ${kind}`}>
      <div className="body">
        <span className="strong"><span className="ic">{icMap[kind]}</span>{strong}</span>
        {body}
      </div>
      <a className="cta-btn" href={href}>{cta} →</a>
    </div>
  );
}

function ArtBody({ article, presets }) {
  return (
    <section className="art-body">
      <div className="wrap art-body-grid">
        <ReadingRailContainer toc={article.toc} />
        <article className="art-content">
          <section id="what">
            <p><span className="lead-in">Perimenopause is the slow, often years-long unwinding</span> of your reproductive hormone system. It is not the same as menopause — menopause is a single calendar moment, 12 consecutive months after your final period. Perimenopause is the runway. For most women, it begins in the late 30s or 40s, and lasts an average of four to eight years.</p>
            <p>What makes it confusing is that it doesn't move in a straight line. Estrogen doesn't drop smoothly — it fluctuates, sometimes wildly, before declining. That volatility is what drives most of the early symptoms: a great night of sleep, then three terrible ones; a steady mood, then a week of irritability; a normal cycle, then one that's 19 days long.</p>

            <h2>The earliest <span className="accent">signals</span></h2>
          </section>

          <section id="signals">
            <p>By the time hot flashes arrive — usually the most stereotyped sign — many women have been in perimenopause for years. The earliest signals are subtler, and more often dismissed:</p>
            <ul>
              <li>Sleep that fragments, particularly in the second half of the night.</li>
              <li>Mood changes, especially anxiety, irritability, or a flatness that's hard to name.</li>
              <li>Cycle changes — shorter, longer, heavier, lighter, occasionally skipped.</li>
              <li>Brain fog, word-finding pauses, harder-than-usual focus.</li>
              <li>Energy that's no longer reliable, especially in the afternoon.</li>
            </ul>

            <InlineCallout {...presets.inline} />

            <h2>What the <span className="accent">labs show</span> (and don't)</h2>
          </section>

          <section id="labs">
            <p>Bloodwork is useful but limited in perimenopause. Because hormones fluctuate, a single estradiol value tells you what your body looked like on Tuesday at 9am — not necessarily what it's doing across your cycle. FSH is more reliable in late perimenopause but unreliable early. Progesterone, measured at the right point in the cycle, can be informative.</p>
            <div className="art-pull">
              <div className="num">8–10y</div>
              <div className="body">
                <span className="strong">Typical perimenopause runway.</span>
                Average duration from first symptoms to final menstrual period. Many women in their early 40s are already mid-runway and don't know it.
              </div>
            </div>
            <p>For most patients, we recommend a panel that includes:</p>
            <ul>
              <li>Estradiol, progesterone, total and free testosterone</li>
              <li>FSH, LH, SHBG, DHEA-S</li>
              <li>A full thyroid panel — TSH alone is not enough</li>
              <li>Vitamin D, ferritin, fasting insulin, A1C</li>
            </ul>

            <InlineCallout {...presets.inlineMid} />

            <h2>Lifestyle: <span className="accent">what moves the needle</span></h2>
          </section>

          <section id="lifestyle">
            <p>Lifestyle is not a substitute for hormone therapy in candidates who need it, but it's foundational. The interventions with the strongest evidence in perimenopause:</p>
            <h3>Strength training, two to four times a week</h3>
            <p>Loss of muscle and bone density accelerates in perimenopause. Resistance training — heavy enough to be challenging — protects both, and improves insulin sensitivity, sleep, and mood.</p>
            <h3>Protein at meaningful doses</h3>
            <p>Most women in perimenopause are under-eating protein. A practical target is 0.7–1.0 grams per pound of goal body weight, distributed across meals.</p>
            <h3>Sleep hygiene that takes hormonal sleep disruption seriously</h3>
            <p>If your sleep is fragmenting at 3am, a sleep tracker and a magnesium habit may not be enough. Treating the hormonal driver often matters more than perfecting the wind-down routine.</p>

            <blockquote>
              Most of the women I see have been told their symptoms are normal — that they should just push through. They're not normal, and you don't have to.
              <span className="cite">— Dr. Rachel Lin, MD</span>
            </blockquote>

            <h2>When <span className="accent">hormone therapy</span> makes sense</h2>
          </section>

          <section id="hrt">
            <p>The data on hormone therapy has shifted meaningfully in the last decade. Modern bioidentical therapy, started in the right window — generally within ten years of your final menstrual period — has a strong safety profile in most candidates, and benefits that extend well beyond hot flashes: sleep, mood, libido, bone density, and metabolic health.</p>
            <p>Candidates for HRT typically have moderate-to-severe symptoms, no contraindications, and a desire to treat both symptoms and long-term risk. Candidates not currently a fit — for example, those with certain cancer histories — still have meaningful non-hormonal options.</p>

            <InlineCallout {...presets.inlineLate} />

            <h2>How to <span className="accent">start</span></h2>
          </section>

          <section id="starting">
            <p>If you read this and recognize yourself, you have three reasonable next moves: <a href="Audience.html?g=women#symptoms">map your symptoms</a> to see if a pattern emerges, <a href="Resources.html#testing">order a hormone panel</a> to get a clinical picture, or <a href="How It Works.html">talk to a licensed provider</a> who can synthesize both with your history. None of them require a prior referral or insurance.</p>
            <p>What we ask you not to do: power through. Perimenopausal symptoms are real, treatable, and tied to long-term health. Earlier intervention is generally better than later.</p>
          </section>
        </article>
        <SidebarRail presets={presets} />
      </div>
    </section>
  );
}

function ReadingRailContainer({ toc }) {
  const [active, setActive] = useState(toc[0]?.id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      // progress
      const article = document.querySelector(".art-content");
      if (article) {
        const rect = article.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const scrolled = -rect.top;
        const p = Math.max(0, Math.min(100, (scrolled / total) * 100));
        setProgress(p);
      }
      // active section
      const offsets = toc.map(t => {
        const el = document.getElementById(t.id);
        return { id: t.id, top: el ? el.getBoundingClientRect().top : Infinity };
      });
      const visible = offsets.filter(o => o.top < 140);
      if (visible.length > 0) setActive(visible[visible.length - 1].id);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  return <ReadingRail toc={toc} activeId={active} progress={progress} />;
}

function SidebarRail({ presets }) {
  return (
    <aside className="art-side">
      <div className="label">Take action</div>
      <div className="art-side-cta">
        <div className="head">{presets.sideHead}</div>
        <p>{presets.sideBody}</p>
        <button>{presets.sideBtn} →</button>
        <div className="ssub">{presets.sideSub}</div>
      </div>
      <div className="art-side-card">
        <h4>Related on HRT</h4>
        <div className="lnks">
          {presets.sideLinks.map((l, i) => (
            <a key={i} href={l.href}>
              <span>{l.t}</span>
              <span className="arr">→</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ArtRelated() {
  return (
    <section className="art-related">
      <div className="wrap">
        <div className="head">
          <h2>Keep reading <span className="accent">in this series</span></h2>
          <a href="Resources.html#hormones">ALL HORMONE HEALTH →</a>
        </div>
        <div className="art-related-grid">
          {RELATED.map((r, i) => (
            <a key={i} className="art-rel-card" href="Article.html">
              <span className="tag">{r.tag}</span>
              <h4>{r.t}</h4>
              <div className="meta">
                {r.meta.map((m, j) => <span key={j}>{m}</span>)}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArtFinal({ presets }) {
  return (
    <section className="art-final">
      <div className="wrap inner">
        <div>
          <h2>{presets.finalH} <span className="accent">{presets.finalAccent}</span></h2>
          <p>{presets.finalP}</p>
        </div>
        <div className="right">
          {presets.finalOpts.map((o, i) => (
            <a key={i} className="opt" href={o.href}>
              <div>
                <div className="name">{o.name}</div>
                <div className="sub">{o.sub}</div>
              </div>
              <span className="arr">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArtFooter() {
  const cols = [
    { h: "Treatments", links: [["All Treatments", "Treatments.html"], ["Hormone Therapy", "Product.html?p=hrt&g=women"], ["Peptides", "Product.html?p=peptides&g=women"], ["Weight Management", "Product.html?p=weight&g=women"], ["Sexual Health", "Product.html?p=sexual&g=women"], ["Hair Loss", "Product.html?p=hair&g=women"]] },
    { h: "Who We Serve", links: [["For Women", "Audience.html?g=women"], ["For Men", "Audience.html?g=men"], ["How It Works", "How It Works.html"], ["Lab Testing", "Resources.html#testing"]] },
    { h: "Resources", links: [["Conditions & Symptoms", "Resources.html#conditions"], ["Hormone Health", "Resources.html#hormones"], ["Nutrition & Lifestyle", "Resources.html#nutrition"], ["Products & Reviews", "Resources.html#products"]] },
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

function ArtApp() {
  useEffect(() => { document.body.setAttribute("data-gender", ARTICLE.audience); }, []);
  const presets = CTA_PRESETS[ARTICLE.ctaKind];
  return (
    <div data-screen-label="Article — Perimenopause">
      <ArtNav />
      <ArtTop article={ARTICLE} />
      <ArtHero article={ARTICLE} />
      <ArtBody article={ARTICLE} presets={presets} />
      <ArtRelated />
      <ArtFinal presets={presets} />
      <ArtFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ArtApp />);
