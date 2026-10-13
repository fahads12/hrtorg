/* global React, ReactDOM, Icons, Logo */
const { useEffect, useState } = React;

const STEPS = [
  {
    n: "01", eyebrow: "Step One · 5 minutes",
    title: "Tell us what's going on.",
    time: "5–10 min · online",
    body: "Complete a thorough intake about your symptoms, medical history, current medications, lifestyle, and goals. The more we understand, the more personalized your plan becomes.",
    list: ["Confidential medical intake", "Photo of valid ID (one time)", "Insurance not required", "Save & resume anytime"],
    mockup: "intake",
  },
  {
    n: "02", eyebrow: "Step Two · Within 24 hours",
    title: "A licensed provider reviews your file.",
    time: "Provider-reviewed",
    body: "A board-certified clinician in your state reviews your intake and either prescribes a personalized plan or messages you with questions. You'll hear back within 24 hours — usually much sooner.",
    list: ["Licensed in all 50 states", "Hormone & longevity specialty", "Direct message your provider", "No appointment needed for intake"],
    mockup: "review",
  },
  {
    n: "03", eyebrow: "Step Three · As needed",
    title: "We send labs to your door — or skip it.",
    time: "Optional · most plans require",
    body: "If your treatment needs lab work, we ship a finger-prick or full venous kit to your home. No fasting commute, no waiting rooms. Drop it in the mail — results in your portal in 5–7 days.",
    list: ["At-home or partner-lab option", "Pre-paid return shipping", "Provider reviews with you", "Re-test on a schedule"],
    mockup: "lab",
  },
  {
    n: "04", eyebrow: "Step Four · 2–4 days",
    title: "Your treatment arrives — discreetly.",
    time: "Free shipping · plain packaging",
    body: "Medications, peptides, or topicals are filled by a licensed compounding or retail pharmacy and shipped in unmarked packaging. Your name and address only — nothing on the outside hints at what's inside.",
    list: ["Compounded by certified pharmacies", "Cold-chain when needed", "Track shipments in your portal", "Auto-refill, with notifications"],
    mockup: "ship",
  },
  {
    n: "05", eyebrow: "Step Five · Ongoing",
    title: "Ongoing care, dialed in over time.",
    time: "Provider check-ins · message anytime",
    body: "Hormones aren't a set-and-forget prescription. Your provider checks in on a cadence, adjusts dosing based on how you're feeling and your follow-up labs, and you can message your care team anytime.",
    list: ["Scheduled provider check-ins", "Message care team anytime", "Dose adjustments included", "Pause or cancel anytime"],
    mockup: "ongoing",
  },
];

const INCLUDED = [
  { ic: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-1.5C5 16 8 14 12 14s7 2 7 5.5V21" /></svg>, t: "Licensed providers", d: "Board-certified clinicians in all 50 states — hormone and longevity specialists." },
  { ic: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="13" height="10" rx="1" /><path d="M16 10h4l3 4v3h-7z" /><circle cx="7" cy="18" r="2" /></svg>, t: "Free shipping", d: "Discreet, unmarked packaging delivered to your door — included with every plan." },
  { ic: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v9l-3 6a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-3-6V3" /><line x1="9" y1="13" x2="15" y2="13" /></svg>, t: "Lab work, when needed", d: "At-home test kits with pre-paid return shipping — provider reviews results with you." },
  { ic: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12c0-5 4-8 9-8s9 3 9 8-4 8-9 8c-1.5 0-3-.3-4-.8L3 21l1.2-3.6C3.5 16 3 14 3 12z" /></svg>, t: "Provider messaging", d: "Direct, unlimited messaging with your care team — get answers, not voicemail." },
  { ic: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>, t: "Scheduled check-ins", d: "Regular provider visits to review labs, adjust dosing, and dial in your plan." },
  { ic: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" /><path d="M9 12l2 2 4-4" /></svg>, t: "HIPAA-compliant care", d: "Your records, messages, and labs are encrypted and protected end-to-end." },
  { ic: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /></svg>, t: "Transparent pricing", d: "Flat monthly pricing, no insurance billing, no surprise charges. Cancel anytime." },
  { ic: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 11a6 6 0 0 1 12 0c0 5-2 9-6 9s-6-4-6-9z" /></svg>, t: "Compounded options", d: "Custom-compounded formulations available for sensitivities, preferences, and complex cases." },
];

const QUESTIONS = [
  { q: "How quickly can I start?", a: "Most patients complete intake in under 10 minutes and receive a provider review within 24 hours. If your plan doesn't require labs, treatment can ship the same day your provider approves it." },
  { q: "Do I need to use insurance?", a: "No — we don't bill insurance, which is what keeps pricing transparent and prevents prescription delays. Many plans are eligible for HSA/FSA, and your treatment is typically cheaper than an insurance copay." },
  { q: "What if I'm already on a similar medication?", a: "Bring it. During intake, you'll list your current medications, dosing, and prescriber. Your HRT.org provider can take over your care or coordinate with your existing one — whichever you prefer." },
  { q: "How do labs work — do I need to go to a clinic?", a: "Most lab work happens at home with a kit we ship to you, including pre-paid return shipping. If you need a full venous draw, we'll partner with a lab near you — usually a 10-minute visit, no appointment." },
  { q: "Can I cancel or pause my plan?", a: "Yes, anytime. There are no contracts or commitments. Manage everything from your patient portal — pause, cancel, switch plans, or reschedule a shipment with one click." },
  { q: "Is my information private?", a: "Yes. We're HIPAA-compliant, your records are encrypted, packaging is unmarked, and we never share data with employers, insurers, or third parties. Your care is between you and your provider." },
];

/* ============================================================
   COMPONENTS
   ============================================================ */
function HwNav() {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="HRT Home.html" style={{ textDecoration: "none" }}><Logo /></a>
        <div className="nav-links">
          <SymptomCheckMenu />
          <a className="nav-link" href="Treatments.html">Treatments</a>
          <a className="nav-link" href="HRT Landing.html#women">For Women</a>
          <a className="nav-link" href="HRT Landing.html#men">For Men</a>
          <a className="nav-link" href="How It Works.html" style={{ color: "var(--ink)", background: "var(--primary-tint)" }}>How it Works</a>
          <a className="nav-link" href="Resources.html">Resources</a>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a className="nav-link" style={{ fontSize: 13.5 }} href="https://portal.hrt.org">Sign in</a>
          <a className="btn btn-primary" href="Consultation.html">Start Consultation {Icons.arrow}</a>
        </div>
      </div>
    </nav>
  );
}

function HwHero() {
  return (
    <section className="hw-hero">
      <div className="wrap">
        <div className="eyebrow">How It Works</div>
        <h1 style={{ marginTop: 16 }}>Five steps from <span className="accent">curious</span> to <span className="accent">cared for.</span></h1>
        <p className="lead">No clinics. No waiting rooms. No insurance gauntlet. Just a licensed provider, your labs, and a plan built around how you actually feel — delivered to your door and adjusted over time.</p>
        <div className="hw-hero-stats">
          <div className="hw-stat">
            <div className="num">10<span style={{ fontSize: "0.5em" }}>min</span></div>
            <div className="lbl">Intake from your couch — save and resume anytime.</div>
          </div>
          <div className="hw-stat">
            <div className="num">24<span style={{ fontSize: "0.5em" }}>hr</span></div>
            <div className="lbl">Average provider review time — often within hours.</div>
          </div>
          <div className="hw-stat">
            <div className="num">50<span style={{ fontSize: "0.5em" }}>states</span></div>
            <div className="lbl">Licensed providers cover every U.S. state and territory.</div>
          </div>
          <div className="hw-stat">
            <div className="num">2–4<span style={{ fontSize: "0.5em" }}>days</span></div>
            <div className="lbl">From provider approval to medication at your door.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Different mockup contents per step */
function StepMockup({ kind }) {
  if (kind === "intake") {
    return (
      <div className="hw-step-mockup">
        <div className="mock-header">
          <span className="mock-title">Health intake — Section 4 of 6</span>
          <span className="mock-tag">SAVED · 2:14PM</span>
        </div>
        <div className="mock-row"><span>Sleep quality</span><span className="val">Poor (4 nights/wk)</span></div>
        <div className="mock-row"><span>Energy on a scale of 1–10</span><span className="val">3</span></div>
        <div className="mock-row"><span>Mood changes</span><span className="val warn">Daily</span></div>
        <div className="mock-row"><span>Libido changes</span><span className="val">Yes, last 12 mo</span></div>
        <div className="mock-progress"><div style={{ width: "62%" }}></div></div>
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--ink-3)", fontFamily: "Geist Mono, monospace", letterSpacing: "0.06em" }}>4 / 6 SECTIONS COMPLETE</div>
      </div>
    );
  }
  if (kind === "review") {
    return (
      <div className="hw-step-mockup">
        <div className="mock-header">
          <span className="mock-title">Message from your provider</span>
          <span className="mock-tag">NEW · 8H AGO</span>
        </div>
        <div className="mock-msg">
          <div className="av">DR</div>
          <div className="body">
            "Reviewed your intake — symptoms and history are a good fit for a low-dose testosterone protocol. I'd like to confirm with a baseline panel before we start. Lab kit is on the way."
            <div className="by">Dr. Rachel Lin, MD · ME, NH, MA, NY</div>
          </div>
        </div>
        <div className="pills-row">
          <span className="pill-tiny">✓ Approved for treatment</span>
          <span className="pill-tiny">Labs required</span>
        </div>
      </div>
    );
  }
  if (kind === "lab") {
    return (
      <div className="hw-step-mockup lab-card">
        <div className="mock-header">
          <span className="mock-title">Hormone Panel (Women)</span>
          <span className="mock-tag">SHIPPED · ETA TUE</span>
        </div>
        <div className="mock-row"><span>Estradiol</span><span className="val">Included</span></div>
        <div className="mock-row"><span>Progesterone</span><span className="val">Included</span></div>
        <div className="mock-row"><span>Free & total testosterone</span><span className="val">Included</span></div>
        <div className="mock-row"><span>DHEA-S, SHBG, TSH</span><span className="val">Included</span></div>
        <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
          Finger-prick · 5-minute collection · pre-paid return
        </div>
      </div>
    );
  }
  if (kind === "ship") {
    return (
      <div className="hw-step-mockup">
        <div className="mock-header">
          <span className="mock-title">Shipment · Order #4821</span>
          <span className="mock-tag">EN ROUTE</span>
        </div>
        <div className="mock-row"><span>Compounded cream (90-day)</span><span className="val ok">✓ Filled</span></div>
        <div className="mock-row"><span>Progesterone capsules</span><span className="val ok">✓ Filled</span></div>
        <div className="mock-row"><span>Applicator + instructions</span><span className="val ok">✓ Included</span></div>
        <div className="mock-progress"><div style={{ width: "78%" }}></div></div>
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-2)", display: "flex", justifyContent: "space-between" }}>
          <span>Shipped Tue · Cambridge, MA</span>
          <span style={{ color: "var(--teal)" }}>Arriving Thursday</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--ink-3)", fontFamily: "Geist Mono, monospace", letterSpacing: "0.06em" }}>UNMARKED · PLAIN BROWN ENVELOPE</div>
      </div>
    );
  }
  if (kind === "ongoing") {
    return (
      <div className="hw-step-mockup">
        <div className="mock-header">
          <span className="mock-title">Care timeline — Next 12 months</span>
          <span className="mock-tag">ON TRACK</span>
        </div>
        <div className="mock-row"><span>Week 2 — Provider check-in</span><span className="val ok">✓ Done</span></div>
        <div className="mock-row"><span>Week 6 — Symptom review</span><span className="val ok">✓ Done</span></div>
        <div className="mock-row"><span>Month 3 — Follow-up labs</span><span className="val">May 14</span></div>
        <div className="mock-row"><span>Month 6 — Dose review</span><span className="val">Aug 14</span></div>
        <div className="mock-msg" style={{ marginTop: 14 }}>
          <div className="av" style={{ background: "var(--teal)" }}>M</div>
          <div className="body">
            "Sleep is great, energy steady, mood much better. No side effects." — your last update
            <div className="by">Sent 12 days ago · viewed by Dr. Lin</div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function HwSteps() {
  return (
    <section className="hw-steps">
      <div className="wrap">
        <div className="hw-section-head">
          <div className="eyebrow">The Process</div>
          <h2 style={{ marginTop: 16 }}>From intake to <span className="accent">treatment in your hands</span> — here's how.</h2>
        </div>
        {STEPS.map((s) => (
          <div key={s.n} className="hw-step" data-reveal>
            <div className="hw-step-num">
              <span className="accent">{s.n[0]}</span>{s.n[1]}
            </div>
            <div className="hw-step-head">
              <div className="step-eyebrow">{s.eyebrow}</div>
              <h3>{s.title}</h3>
              <span className="time-pill"><span className="dot"></span>{s.time}</span>
            </div>
            <div className="hw-step-body">
              <p>{s.body}</p>
              <ul>
                {s.list.map((l, i) => (
                  <li key={i}><span className="check">{Icons.check}</span>{l}</li>
                ))}
              </ul>
              <StepMockup kind={s.mockup} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HwIncluded() {
  return (
    <section className="hw-included">
      <div className="wrap">
        <div className="eyebrow" style={{ color: "#E8A8C5" }}>What's Included</div>
        <h2 style={{ marginTop: 12 }}>Every plan includes <span className="accent">all of this</span>.</h2>
        <div className="hw-incl-grid">
          {INCLUDED.map((it, i) => (
            <div key={i} className="hw-incl-card">
              <div className="ic">{it.ic}</div>
              <h3>{it.t}</h3>
              <p>{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HwQuestions() {
  const [open, setOpen] = useState(0);
  return (
    <section className="hw-q">
      <div className="wrap">
        <div className="section-head" style={{ margin: "0 auto 40px" }}>
          <div className="eyebrow">Common Questions</div>
          <h2 style={{ marginTop: 12 }}>The things <span style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontWeight: 400, color: "var(--primary)" }}>people ask</span> before signing up.</h2>
        </div>
        <div className="hw-q-grid">
          {QUESTIONS.map((qq, i) => (
            <div key={i} className={`hw-q-item ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
              <div className="q">
                <span>{qq.q}</span>
                <span className="plus">+</span>
              </div>
              <div className="a">{qq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HwFinal() {
  return (
    <section className="hw-final">
      <div className="wrap inner">
        <div>
          <div className="eyebrow">Ready when you are</div>
          <h2 style={{ marginTop: 16 }}>Start with a <span className="accent">10-minute intake</span>. No commitment.</h2>
        </div>
        <div className="right-col">
          <a className="btn btn-primary" href="Consultation.html" style={{ height: 56, padding: "0 28px", fontSize: 16 }}>Start Consultation {Icons.arrow}</a>
          <a className="btn btn-ghost" href="Treatments.html">Browse Treatments {Icons.arrow}</a>
          <div className="sub">Save and resume anytime · No card required</div>
        </div>
      </div>
    </section>
  );
}

function HwFooter() {
  const cols = [
    { h: "Treatments", links: [["All Treatments", "Treatments.html"], ["Hormone Therapy", "Product.html?p=hrt&g=women"], ["Peptides", "Product.html?p=peptides&g=women"], ["Weight Management", "Product.html?p=weight&g=women"], ["Sexual Health", "Product.html?p=sexual&g=women"], ["Hair Loss", "Product.html?p=hair&g=women"]] },
    { h: "Who We Serve", links: [["For Women", "HRT Landing.html#women"], ["For Men", "HRT Landing.html#men"], ["How It Works", "How It Works.html"], ["Lab Testing", "Resources.html#testing"]] },
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

function HowApp() {
  useEffect(() => { document.body.setAttribute("data-gender", "women"); }, []);
  return (
    <div data-screen-label="How It Works">
      <HwNav />
      <HwHero />
      <HwSteps />
      <HwIncluded />
      <HwQuestions />
      <HwFinal />
      <HwFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<HowApp />);
