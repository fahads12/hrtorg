/* global React, ReactDOM, Icons, Logo */
const { useEffect, useState } = React;

/* ============================================================
   PRODUCT DATA — keyed by product slug; each has women + men variant
   ============================================================ */
const PRODUCT_ICONS = {
  hrt: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" strokeDasharray="2 4" /></svg>,
  peptides: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3c0 6 12 6 12 12s-12 6-12 12 M18 3c0 6-12 6-12 12s12 6 12 12" /></svg>,
  weight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 8l3-2 3 2" /><line x1="12" y1="6" x2="12" y2="13" /></svg>,
  sexual: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></svg>,
  hair: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13c0-6 3-9 6-9s6 3 6 9 M5 21c1-5 3-8 7-8s6 3 7 8" /></svg>,
};

const PRODUCTS = {
  hrt: {
    name: "Hormone Replacement Therapy",
    short: "Hormone Therapy",
    eyebrow: "Hormone Replacement",
    women: {
      headlineLead: "Hormone Therapy ",
      headlineAccent: "for women",
      lead: "Personalized bioidentical hormone therapy for perimenopause, menopause, and the years between — restoring sleep, energy, mood, and balance.",
      pills: ["Estrogen", "Progesterone", "Testosterone (for women)", "Bioidentical Cream"],
      bottle: "HORMONE CREAM",
      visualLabel: "PORTRAIT • WOMAN 45-55",
      who: [
        { ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5 2 1 3-1 3-3z" /></svg>, t: "Hot flashes & night sweats", d: "Vasomotor symptoms disrupting sleep and daily life." },
        { ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 14a8 8 0 1 1-9-9 6 6 0 0 0 9 9z" /></svg>, t: "Poor sleep & fatigue", d: "Trouble falling or staying asleep, daytime energy crashes." },
        { ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 1 5 3 3 0 0 0 3 3h6a3 3 0 0 0 3-3 3 3 0 0 0 1-5 3 3 0 0 0-1-5 3 3 0 0 0-3-3z" /></svg>, t: "Mood & brain fog", d: "Mood swings, irritability, and trouble focusing." },
      ],
    },
    men: {
      headlineLead: "Hormone Therapy ",
      headlineAccent: "for men",
      lead: "Provider-prescribed testosterone replacement therapy that restores energy, strength, libido, and focus — backed by labs and ongoing care.",
      pills: ["Testosterone Cream", "Testosterone Injection", "HCG", "PCT Support"],
      bottle: "TESTOSTERONE",
      visualLabel: "PORTRAIT • MAN 40-55",
      who: [
        { ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="4" width="12" height="17" rx="2" /></svg>, t: "Low energy & drive", d: "Persistent fatigue, low motivation, reduced physical drive." },
        { ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 10c2 0 4-1 5-3 1 1 3 1 4 0l4 4c1 1 1 3 0 4-1 1-3 1-4 0l-1-1c-2 2-5 3-8 2v-6z" /></svg>, t: "Muscle & recovery decline", d: "Harder to build, slower to recover, more soreness." },
        { ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="14" r="5" /><line x1="14" y1="10" x2="20" y2="4" /></svg>, t: "Libido & performance", d: "Lower libido, reduced morning function, intimacy concerns." },
      ],
    },
    plans: [
      { name: "Monthly", sub: "Pay as you go", price: "199", per: "/month", bullets: ["Provider visits included", "Personalized prescription", "Discreet shipping", "Lab review included"], featured: false },
      { name: "Quarterly", sub: "Most popular", price: "169", per: "/month, billed quarterly", bullets: ["Everything in Monthly", "Lab kit included", "Priority provider access", "Save $30/mo"], featured: true, ribbon: "BEST VALUE" },
      { name: "Annual", sub: "Best price", price: "149", per: "/month, billed annually", bullets: ["Everything in Quarterly", "2 lab kits per year", "Free shipping", "Save $600/yr"], featured: false },
    ],
  },
  peptides: {
    name: "Anti-Aging Peptide Therapy",
    short: "Peptide Therapy",
    eyebrow: "Performance & Longevity",
    women: {
      headlineLead: "Peptide therapy ",
      headlineAccent: "for women",
      lead: "Clinically-guided peptide protocols for recovery, skin, sleep, and cellular health — supporting how you age, on your terms.",
      pills: ["GHK-Cu (Skin)", "BPC-157 (Recovery)", "Tesamorelin", "MOTS-c"],
      bottle: "GHK-Cu PEPTIDE",
      visualLabel: "MACRO • PEPTIDE VIAL",
      who: [
        { ic: PRODUCT_ICONS.peptides, t: "Skin & collagen support", d: "Visible aging, fine lines, loss of skin density and glow." },
        { ic: PRODUCT_ICONS.weight, t: "Slow recovery", d: "Lingering soreness, joint discomfort, slower workout rebound." },
        { ic: PRODUCT_ICONS.hrt, t: "Sleep & cellular repair", d: "Disrupted sleep cycles affecting next-day recovery and mood." },
      ],
    },
    men: {
      headlineLead: "Peptide therapy ",
      headlineAccent: "for men",
      lead: "Provider-prescribed peptides for muscle recovery, body composition, joint health, and the longevity science of cellular repair.",
      pills: ["BPC-157", "TB-500", "Ipamorelin / CJC-1295", "Tesamorelin"],
      bottle: "BPC-157",
      visualLabel: "MACRO • PEPTIDE VIAL",
      who: [
        { ic: PRODUCT_ICONS.peptides, t: "Recovery & joint health", d: "Old injuries, slower rebound between training sessions." },
        { ic: PRODUCT_ICONS.weight, t: "Body composition", d: "Stubborn body fat, plateauing despite training and diet." },
        { ic: PRODUCT_ICONS.hrt, t: "Sleep & growth hormone", d: "Lighter sleep, less deep recovery, slower morning energy." },
      ],
    },
    plans: [
      { name: "Single Protocol", sub: "Targeted support", price: "189", per: "/month", bullets: ["One peptide protocol", "Provider consultation", "Personalized dosing", "Lab review"], featured: false },
      { name: "Stack", sub: "Most popular", price: "289", per: "/month", bullets: ["Two-peptide stack", "Cycling guidance", "Quarterly lab review", "Priority care"], featured: true, ribbon: "POPULAR" },
      { name: "Custom", sub: "Full protocol", price: "—", per: "Consult for pricing", bullets: ["Custom multi-peptide plan", "Quarterly labs included", "Dedicated provider", "Ongoing optimization"], featured: false },
    ],
  },
  weight: {
    name: "Weight Loss & Management",
    short: "Weight Management",
    eyebrow: "Metabolic Health",
    women: {
      headlineLead: "Weight management ",
      headlineAccent: "for women",
      lead: "Provider-prescribed GLP-1s paired with coaching, lab monitoring, and a plan that accounts for hormones — for sustainable results.",
      pills: ["Semaglutide", "Tirzepatide", "Hormone-aware care", "1:1 Coaching"],
      bottle: "SEMAGLUTIDE",
      visualLabel: "LIFESTYLE • ACTIVE",
      who: [
        { ic: PRODUCT_ICONS.weight, t: "Weight that won't move", d: "Plateaus despite diet and exercise — often hormone-driven." },
        { ic: PRODUCT_ICONS.hrt, t: "Cravings & appetite", d: "Constant hunger, blood sugar swings, late-night cravings." },
        { ic: PRODUCT_ICONS.peptides, t: "Metabolic syndrome", d: "Insulin resistance, belly weight, pre-diabetic markers." },
      ],
    },
    men: {
      headlineLead: "Weight management ",
      headlineAccent: "for men",
      lead: "GLP-1 therapy + provider coaching for fat loss and metabolic health, with lab markers tracked from day one.",
      pills: ["Semaglutide", "Tirzepatide", "Metabolic Labs", "1:1 Coaching"],
      bottle: "TIRZEPATIDE",
      visualLabel: "LIFESTYLE • ACTIVE",
      who: [
        { ic: PRODUCT_ICONS.weight, t: "Visceral & belly fat", d: "Stubborn weight that affects energy, sleep, and labs." },
        { ic: PRODUCT_ICONS.hrt, t: "Insulin resistance", d: "Pre-diabetic markers, energy crashes, low morning function." },
        { ic: PRODUCT_ICONS.peptides, t: "Recovery & inflammation", d: "Slower recovery, elevated inflammatory markers." },
      ],
    },
    plans: [
      { name: "Semaglutide", sub: "Starter", price: "249", per: "/month", bullets: ["Semaglutide prescription", "Provider visits", "Coaching access", "Lab review"], featured: false },
      { name: "Tirzepatide", sub: "Most popular", price: "399", per: "/month", bullets: ["Tirzepatide prescription", "Weekly coaching", "Quarterly labs", "Body comp tracking"], featured: true, ribbon: "POPULAR" },
      { name: "Custom Plan", sub: "Full support", price: "Custom", per: "Consult for pricing", bullets: ["Personalized GLP-1", "Hormone-aware plan", "Dedicated provider", "Maintenance phase"], featured: false },
    ],
  },
  sexual: {
    name: "Sexual Health",
    short: "Sexual Health",
    eyebrow: "Intimacy & Vitality",
    women: {
      headlineLead: "Sexual health ",
      headlineAccent: "for women",
      lead: "Discreet, evidence-based treatments for libido, arousal, and intimacy — supported by clinicians who understand hormones.",
      pills: ["Testosterone (for women)", "Vaginal Estrogen", "DHEA", "Counseling"],
      bottle: "INTIMACY CARE",
      visualLabel: "ABSTRACT • SOFT FORMS",
      who: [
        { ic: PRODUCT_ICONS.sexual, t: "Low libido", d: "Decline in desire, often linked to hormonal shifts." },
        { ic: PRODUCT_ICONS.hrt, t: "Painful intimacy", d: "Discomfort, dryness, or changes since perimenopause or postpartum." },
        { ic: PRODUCT_ICONS.peptides, t: "Arousal & response", d: "Reduced sensitivity or difficulty with arousal." },
      ],
    },
    men: {
      headlineLead: "Sexual health ",
      headlineAccent: "for men",
      lead: "Confidential telehealth treatment for ED, libido, and performance — provider-prescribed and discreetly delivered.",
      pills: ["Sildenafil", "Tadalafil", "PT-141", "Counseling"],
      bottle: "ED THERAPY",
      visualLabel: "ABSTRACT • CHARCOAL",
      who: [
        { ic: PRODUCT_ICONS.sexual, t: "Erectile concerns", d: "Difficulty achieving or maintaining erections." },
        { ic: PRODUCT_ICONS.hrt, t: "Low libido", d: "Reduced desire, often tied to hormone shifts." },
        { ic: PRODUCT_ICONS.peptides, t: "Performance anxiety", d: "Confidence and consistency concerns in intimacy." },
      ],
    },
    plans: [
      { name: "On-demand", sub: "When you need it", price: "29", per: "/dose", bullets: ["As-needed prescription", "Discreet delivery", "Provider consultation", "No subscription required"], featured: false },
      { name: "Monthly", sub: "Most popular", price: "79", per: "/month", bullets: ["Monthly supply", "Free shipping", "Provider check-ins", "Cancel anytime"], featured: true, ribbon: "POPULAR" },
      { name: "Full Care", sub: "Comprehensive", price: "139", per: "/month", bullets: ["Multi-medication options", "Hormone testing included", "Dedicated provider", "Counseling access"], featured: false },
    ],
  },
  hair: {
    name: "Hair Loss Treatment",
    short: "Hair Loss",
    eyebrow: "Confidence",
    women: {
      headlineLead: "Hair loss treatment ",
      headlineAccent: "for women",
      lead: "Clinically proven topical and oral therapies for thinning hair — including formulations made for women's biology.",
      pills: ["Minoxidil (Topical)", "Spironolactone", "Compounded Topical", "Supplements"],
      bottle: "HAIR SERUM",
      visualLabel: "DETAIL • HAIR TEXTURE",
      who: [
        { ic: PRODUCT_ICONS.hair, t: "Thinning at the part", d: "Widening part line, less density on top of the scalp." },
        { ic: PRODUCT_ICONS.hrt, t: "Postpartum / peri shedding", d: "Hormonal shedding after pregnancy or in perimenopause." },
        { ic: PRODUCT_ICONS.peptides, t: "Overall density loss", d: "Less volume, ponytail thinner than it used to be." },
      ],
    },
    men: {
      headlineLead: "Hair loss treatment ",
      headlineAccent: "for men",
      lead: "Provider-prescribed finasteride and minoxidil regimens for pattern hair loss — clinically proven to stop and reverse thinning.",
      pills: ["Finasteride", "Minoxidil (Topical & Oral)", "Compounded Topical", "Supplements"],
      bottle: "HAIR FORMULA",
      visualLabel: "DETAIL • HAIRLINE",
      who: [
        { ic: PRODUCT_ICONS.hair, t: "Receding hairline", d: "Temples or crown thinning, mature hairline progressing." },
        { ic: PRODUCT_ICONS.hrt, t: "Crown thinning", d: "Visible scalp at the crown, slower regrowth after haircuts." },
        { ic: PRODUCT_ICONS.peptides, t: "Pattern hair loss", d: "Family history of male pattern baldness, ongoing shedding." },
      ],
    },
    plans: [
      { name: "Topical", sub: "Starter", price: "29", per: "/month", bullets: ["Topical minoxidil", "Provider consultation", "Free shipping", "Cancel anytime"], featured: false },
      { name: "Combo", sub: "Most popular", price: "59", per: "/month", bullets: ["Topical + oral therapy", "Custom-compounded option", "Quarterly check-ins", "Photo tracking"], featured: true, ribbon: "POPULAR" },
      { name: "Premium", sub: "Full regimen", price: "99", per: "/month", bullets: ["Compounded multi-action topical", "Oral therapy + supplements", "Lab review", "Dedicated provider"], featured: false },
    ],
  },
};

const SHARED_FEATURES = [
  { n: "01", t: "Licensed providers", d: "Board-certified clinicians who specialize in hormones and longevity." },
  { n: "02", t: "Personalized plans", d: "Treatments built around your labs, symptoms, history, and goals." },
  { n: "03", t: "Discreet delivery", d: "Medications shipped quietly to your door, on your schedule." },
  { n: "04", t: "Ongoing care", d: "Check-ins, dose adjustments, and provider support whenever you need it." },
];

const FAQS_BY_PRODUCT = {
  hrt: [
    { q: "Is HRT safe?", a: "Modern hormone therapy is considered safe and effective for most patients when prescribed and monitored by a licensed provider. We use evidence-based dosing protocols and routine labs to keep your care on track." },
    { q: "How long until I feel results?", a: "Many patients report improvements in sleep and energy within 2–4 weeks. Full benefits — including libido, mood, and body composition — typically build over 8–12 weeks." },
    { q: "Do I need labs first?", a: "Yes. Hormone therapy is personalized to your biology, and labs give your provider the information needed to prescribe safely. Most plans include lab testing." },
    { q: "Can I cancel anytime?", a: "Yes. There's no long-term commitment. You can pause or cancel your plan from your account at any time." },
  ],
  peptides: [
    { q: "What are peptides?", a: "Peptides are short chains of amino acids that signal the body to perform specific functions — like tissue repair, growth hormone release, or collagen production. They're used in targeted, provider-guided protocols." },
    { q: "Are peptides legal and safe?", a: "Yes — when prescribed by a licensed provider and sourced from certified compounding pharmacies. We only use pharmaceutical-grade peptides with verified purity." },
    { q: "How are peptides administered?", a: "Most peptides are administered by subcutaneous injection using small, painless needles. Some are available as oral capsules or nasal sprays depending on the molecule." },
    { q: "How long is a typical protocol?", a: "Protocols range from 4 to 12 weeks, often followed by a break or maintenance phase. Your provider designs the cycle based on your goals." },
  ],
  weight: [
    { q: "How much weight can I expect to lose?", a: "Clinical data on GLP-1s shows average weight loss of 15–22% of body weight over 12 months, depending on the medication, dose, and lifestyle alongside it." },
    { q: "Will I keep the weight off?", a: "Long-term success depends on a maintenance phase. We build that into every plan, with tapering protocols and lifestyle support after your goal is reached." },
    { q: "What are the side effects?", a: "GLP-1 medications can cause nausea, fatigue, or GI symptoms — usually mildest after the first few weeks of dose escalation. Your provider will manage these with you." },
    { q: "Is this covered by insurance?", a: "We don't bill insurance directly, but many patients are eligible for HSA/FSA reimbursement and our plans are typically less expensive than insurance copays." },
  ],
  sexual: [
    { q: "Is this confidential?", a: "Yes. All visits are private telehealth, prescriptions ship in plain packaging, and your records are protected under HIPAA." },
    { q: "Do I need to see someone in person?", a: "No. Your entire experience — consultation, prescription, follow-up — happens online with a licensed provider." },
    { q: "How fast does it work?", a: "On-demand medications take effect in 30 minutes to an hour. Hormone-based therapies build benefits over 4–12 weeks." },
    { q: "Is this safe?", a: "Every prescription is reviewed by a licensed provider against your health history. We don't fulfill prescriptions without a proper evaluation." },
  ],
  hair: [
    { q: "How long until I see results?", a: "Most patients notice reduced shedding by month 3, with visible regrowth typically beginning around month 4–6. Full results take 9–12 months of consistent use." },
    { q: "Will I keep results if I stop?", a: "No. Hair loss is a chronic condition — stopping treatment generally means hair loss resumes within 6–12 months." },
    { q: "Are there side effects?", a: "Side effects are uncommon but possible. Your provider reviews your history and discusses any risks specific to the medication you're prescribed." },
    { q: "What if I'm in the early stages of hair loss?", a: "Early treatment delivers the best long-term results. Topical or low-dose oral therapies are very effective at preserving the hair you have." },
  ],
};

/* ============================================================
   COMPONENTS
   ============================================================ */
function ProductNav() {
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

function Breadcrumb({ gender, product }) {
  const g = gender === "women" ? "For Women" : "For Men";
  return (
    <div className="wrap p-breadcrumb">
      <a href="HRT Home.html">Home</a>
      <span className="sep">/</span>
      <a href={`HRT Landing.html#${gender}`}>{g}</a>
      <span className="sep">/</span>
      <a href="HRT Home.html">Treatments</a>
      <span className="sep">/</span>
      <span className="current">{product.short}</span>
    </div>
  );
}

function ProductHero({ product, variant, gender, onGenderChange }) {
  return (
    <section className="p-hero">
      <Breadcrumb gender={gender} product={product} />
      <div className="wrap p-hero-grid" style={{ marginTop: 32 }}>
        <div>
          <div className="p-gender-switch">
            <a className={gender === "women" ? "active" : ""} onClick={() => onGenderChange("women")}>For Women</a>
            <a className={gender === "men" ? "active" : ""} onClick={() => onGenderChange("men")}>For Men</a>
          </div>
          <div className="eyebrow">{product.eyebrow}</div>
          <h1 style={{ marginTop: 16 }}>
            {variant.headlineLead}<span className="accent">{variant.headlineAccent}</span>
          </h1>
          <p className="lead">{variant.lead}</p>
          <div className="p-pills">
            {variant.pills.map((p, i) => <span key={i} className="p-pill"><span className="dot"></span>{p}</span>)}
          </div>
          <div className="p-hero-ctas">
            <a className="btn btn-primary" href="Consultation.html">Start Consultation {Icons.arrow}</a>
            <a className="btn btn-ghost" href="#plans">See Plans {Icons.arrow}</a>
          </div>
          <div className="p-credibility">
            <div className="item">
              <span className="ic-c">{Icons.shield}</span>
              <span className="label"><span className="strong">HIPAA Compliant</span><br/>& Confidential</span>
            </div>
            <div className="item">
              <span className="ic-c">{Icons.provider}</span>
              <span className="label"><span className="strong">Licensed Providers</span><br/>in all 50 states</span>
            </div>
            <div className="item">
              <span className="ic-c">{Icons.truck}</span>
              <span className="label"><span className="strong">Discreet Delivery</span><br/>to your door</span>
            </div>
          </div>
        </div>
        <div className="p-visual">
          <div className="scene"></div>
          <span className="tag">{variant.visualLabel}</span>
          <div className="p-bottle">
            <div>
              <div className="pb-brand">HRT<span style={{ color: "var(--teal)" }}>.</span></div>
              <div className="pb-tld">hrt.org</div>
            </div>
            <div>
              <div className="pb-name">{variant.bottle}</div>
              <div className="pb-sub">{gender === "women" ? "FORMULATED FOR WOMEN" : "FORMULATED FOR MEN"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubNav() {
  return (
    <div className="p-subnav">
      <div className="wrap p-subnav-inner">
        <a href="#who">Who it's for</a>
        <a href="#how">How it works</a>
        <a href="#plans">Plans & pricing</a>
        <a href="#why">Why HRT</a>
        <a href="#faq">FAQ</a>
        <a href="#more">More treatments</a>
      </div>
    </div>
  );
}

function WhoSection({ variant }) {
  return (
    <section id="who">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 40px", maxWidth: 720 }}>
          <div className="eyebrow">Who It's For</div>
          <h2 style={{ marginTop: 12 }}>If any of these sound familiar, <span style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontWeight: 400, color: "var(--ink-3)" }}>you're in the right place.</span></h2>
        </div>
        <div className="who-grid">
          {variant.who.map((w, i) => (
            <div key={i} className="who-card">
              <div className="ic">{w.ic}</div>
              <h3>{w.t}</h3>
              <p>{w.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowSection() {
  return (
    <section id="how" className="feat-band">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 40px", maxWidth: 720 }}>
          <div className="eyebrow">How It Works</div>
          <h2 style={{ marginTop: 12 }}>Care that meets you <span style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontWeight: 400, color: "var(--ink-3)" }}>where you are.</span></h2>
        </div>
        <div className="feat-grid">
          {[
            { n: "01", t: "Complete intake", d: "Tell us about your symptoms, history, and goals in a 15-minute online questionnaire." },
            { n: "02", t: "Review with a provider", d: "A licensed clinician reviews your file and recommends a personalized plan." },
            { n: "03", t: "Test when needed", d: "We ship a lab kit to your home, or you visit a partner lab — quick and private." },
            { n: "04", t: "Treatment + ongoing care", d: "Medications arrive discreetly. Provider check-ins keep your plan dialed in." },
          ].map((f, i) => (
            <div key={i} className="feat-card">
              <div className="num">STEP {f.n}</div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlansSection({ product }) {
  return (
    <section id="plans">
      <div className="wrap">
        <div className="section-head" style={{ margin: "0 auto 48px" }}>
          <div className="eyebrow">Plans</div>
          <h2 style={{ marginTop: 12 }}>Plans built around <span style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontWeight: 400, color: "var(--primary)" }}>your goals</span>.</h2>
          <p>Transparent pricing. No insurance billing. Cancel anytime.</p>
        </div>
        <div className="plans-grid">
          {product.plans.map((p, i) => (
            <div key={i} className={`plan ${p.featured ? "featured" : "outline"}`}>
              {p.ribbon && <span className="ribbon">{p.ribbon}</span>}
              <h3>{p.name}</h3>
              <div className="plan-sub">{p.sub}</div>
              <div className="price">
                <span className="amt">{p.price.match(/^\d+$/) ? `$${p.price}` : p.price}</span>
                <span className="per">{p.per}</span>
              </div>
              <ul>
                {p.bullets.map((b, j) => (
                  <li key={j}><span className="check">{Icons.check}</span>{b}</li>
                ))}
              </ul>
              <button className="plan-cta">{p.featured ? "Start this plan" : "Choose plan"} →</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section id="why" className="feat-band">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 40px", maxWidth: 720 }}>
          <div className="eyebrow">Why HRT</div>
          <h2 style={{ marginTop: 12 }}>The full care platform, <span style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontWeight: 400, color: "var(--ink-3)" }}>not just a prescription.</span></h2>
        </div>
        <div className="feat-grid">
          {SHARED_FEATURES.map((f, i) => (
            <div key={i} className="feat-card">
              <div className="num">{f.n}</div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ product }) {
  const [open, setOpen] = useState(0);
  const faqs = FAQS_BY_PRODUCT[product] || [];
  return (
    <section id="faq">
      <div className="wrap">
        <div className="section-head" style={{ margin: "0 auto 40px" }}>
          <div className="eyebrow">FAQ</div>
          <h2 style={{ marginTop: 12 }}>Questions, <span style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontWeight: 400, color: "var(--primary)" }}>answered</span>.</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((f, i) => (
            <div key={i} className={`faq ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
              <div className="q">
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

function RelatedSection({ current, gender }) {
  const others = Object.keys(PRODUCTS).filter(k => k !== current);
  return (
    <section id="more">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 32px", maxWidth: 720 }}>
          <div className="eyebrow">Explore</div>
          <h2 style={{ marginTop: 12 }}>More treatments <span style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontWeight: 400, color: "var(--ink-3)" }}>for {gender === "women" ? "women" : "men"}.</span></h2>
        </div>
        <div className="related-grid">
          {others.map(k => {
            const p = PRODUCTS[k];
            return (
              <a key={k} className="related-card" href={`Product.html?p=${k}&g=${gender}`}>
                <div className="rc-ic">{PRODUCT_ICONS[k]}</div>
                <div>
                  <h4>{p.name}</h4>
                  <div className="rc-sub">{p.eyebrow}</div>
                </div>
                <div className="rc-row">
                  <span>LEARN MORE</span>
                  <span>→</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductCTA({ variant }) {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="mini-cta">
          <h2>Ready to feel <span className="accent">like yourself</span>?<br/>Start your consultation in minutes.</h2>
          <div className="right">
            <a className="btn btn-teal" href="Consultation.html" style={{ height: 56, padding: "0 28px", fontSize: 16 }}>Start Consultation {Icons.arrow}</a>
            <div className="sub">15-minute intake · No commitment</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductFooter() {
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

/* ============================================================
   APP — reads ?p=hrt&g=women from URL
   ============================================================ */
function ProductApp() {
  const params = new URLSearchParams(location.search);
  const [productKey, setProductKey] = useState(params.get("p") || "hrt");
  const [gender, setGender] = useState(params.get("g") === "men" ? "men" : "women");

  useEffect(() => {
    document.body.setAttribute("data-gender", gender);
    document.body.classList.add("product");
  }, [gender]);

  // Reflect state in URL
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set("p", productKey);
    url.searchParams.set("g", gender);
    history.replaceState(null, "", url);
  }, [productKey, gender]);

  const product = PRODUCTS[productKey] || PRODUCTS.hrt;
  const variant = product[gender];

  return (
    <div data-screen-label={`${product.short} — ${gender === "women" ? "Women" : "Men"}`}>
      <ProductNav />
      <ProductHero product={product} variant={variant} gender={gender} onGenderChange={setGender} />
      <SubNav />
      <WhoSection variant={variant} />
      <HowSection />
      <PlansSection product={product} />
      <WhySection />
      <FAQSection product={productKey} />
      <RelatedSection current={productKey} gender={gender} />
      <ProductCTA variant={variant} />
      <ProductFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ProductApp />);
