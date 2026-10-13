/* global React, ReactDOM, Icons, Logo */
const { useEffect, useState } = React;

/* ============================================================
   AUDIENCE DATA — keyed by gender
   ============================================================ */
const ICN = (children, sw = 1.5, size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

const TX_ICONS = {
  hrt: ICN(<><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" strokeDasharray="2 4" /></>),
  peptides: ICN(<><path d="M6 3c0 6 12 6 12 12s-12 6-12 12 M18 3c0 6-12 6-12 12s12 6 12 12" /></>),
  weight: ICN(<><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 8l3-2 3 2" /><line x1="12" y1="6" x2="12" y2="13" /></>),
  sexual: ICN(<><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></>),
  hair: ICN(<><path d="M6 13c0-6 3-9 6-9s6 3 6 9 M5 21c1-5 3-8 7-8s6 3 7 8" /></>),
};

const AUDIENCE = window.HRT_AUDIENCE;
const AUD_TREATMENT_IMAGES = {
  hrt: ['wellness-editorial', 'Two adults walking together in a coastal garden'],
  peptides: ['lab-care', 'Laboratory pipette and sample plate'],
  weight: ['weight-care', 'Preparing a balanced meal at home'],
  sexual: ['intimacy-care', 'A couple sharing a quiet conversation'],
  hair: ['hair-care', 'A man checking his hair in a mirror'],
};
for (const gender of ['women','men']) {
  AUDIENCE[gender].topSymptoms.forEach((s,i)=>{s.ic=[Icons.flame,Icons.moon,Icons.brain,Icons.heart][i];});
}

function AudNav(){return null;}

function AudHero({ data, gender }) {
  const portrait = gender === "women" ? "women-care-v2" : "men-care-v2";
  return (
    <section className="aud-hero">
      <div className="wrap">
        <div className="aud-hero-grid">
          <div>
            <div className="eyebrow">{data.eyebrow}</div>
            <h1 style={{ marginTop: 16 }}>{data.headlineLead}<span className="accent">{data.headlineAccent}</span>{data.headlineTail}</h1>
            <p className="lead">{data.lead}</p>
            <div className="aud-hero-ctas">
              <a className="btn btn-primary" href="/portal/app/symptoms-tracker/">Start Consultation {Icons.arrow}</a>
              <a className="btn btn-ghost" href="Treatments.html" style={{ textDecoration: "none" }}>Browse Treatments {Icons.arrow}</a>
            </div>
          </div>
          <div className="aud-hero-media"><img className="aud-care-portrait" src={`uploads/generated/${portrait}.webp`} srcSet={`uploads/generated/${portrait}-720.webp 720w, uploads/generated/${portrait}.webp 1440w`} sizes="(max-width:960px) 100vw, 45vw" width="1440" height="960" alt={gender==='women'?'Woman enjoying a quiet moment on a sunlit garden terrace':'Man standing on a sunlit garden terrace'} fetchpriority="high"/>
          <div className="aud-hero-card">
            <div className="head">Common concerns</div>
            <ul>
              {data.topSymptoms.map((s, i) => (
                <li key={i}>
                  <span className="ic">{s.ic}</span>
                  <span>{s.t}</span>
                  <span className="pct" style={{ whiteSpace: "pre-line", fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--ink-3)", letterSpacing: "0.08em", textAlign: "right", lineHeight: 1.3 }}>{s.meta}</span>
                </li>
              ))}
            </ul>
          </div></div>
        </div>
      </div>
    </section>
  );
}

function AudSymptoms({ data, gender }) {
  const [checked, setChecked] = useState(new Set());

  function toggle(i) {
    const next = new Set(checked);
    if (next.has(i)) next.delete(i); else next.add(i);
    setChecked(next);
  }

  const count = checked.size;
  const recHead=count ? 'Bring these concerns to your care team.' : 'Select the symptoms you want to discuss.';
  const recBody='This list helps organize your concerns. Selections do not diagnose a condition or determine which treatment or test you need. They stay on this page and are not submitted.';
  const recs=count ? [
    {ic:Icons.provider,name:'Talk to a provider',sub:'Continue to the HRT.org patient portal',href:'/portal/app/symptoms-tracker/'},
    {ic:Icons.test,name:'Explore lab testing',sub:'Learn about at-home collection',href:'Lab Testing.html'}
  ] : [];

  return (
    <section className="aud-symptoms">
      <div className="wrap">
        <div className="aud-sec-head">
          <div className="eyebrow">Symptoms</div>
          <h2 style={{ marginTop: 14 }}>Which of these sound <span className="accent">familiar?</span></h2>
          <p>Select the concerns you would like to discuss with a healthcare provider.</p>
        </div>
        <div className="aud-symptoms-grid">
          <div className="aud-checklist">
            {data.symptoms.map((s, i) => (
              <button type="button" aria-pressed={checked.has(i)} key={i} className={`aud-check-item ${checked.has(i) ? "on" : ""}`} onClick={() => toggle(i)}>
                <span className="box">{Icons.check}</span>
                <span className="label">{s.t}</span>
                <span className="meta">{s.meta}</span>
              </button>
            ))}
          </div>
          <div className="aud-check-result">
            <div className="count-row" role="status" aria-live="polite">
              <div className="num">{count}</div>
              <div className="num-sub">{count === 0 ? "Symptoms selected" : count === 1 ? "Symptom selected" : "Symptoms selected"}</div>
            </div>
            <h4>{recHead}</h4>
            <p>{recBody}</p>
            {recs.length > 0 && (
              <div className="recs">
                {recs.map((r, i) => (
                  <a key={i} className="rec" href={r.href}>
                    <span className="ic-wrap">{r.ic}</span>
                    <div>
                      <div className="name">{r.name}</div>
                      <div className="sub">{r.sub}</div>
                    </div>
                    <span className="arr">→</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AudStages({ data }) {
  return (
    <section className="aud-stages">
      <div className="wrap">
        <div className="aud-sec-head">
          <div className="eyebrow">Life Stages</div>
          <h2 style={{ marginTop: 14 }}>Different decades, <span className="accent">different priorities.</span></h2>
          <p>Explore health topics for different stages of life, from the HRT.org library.</p>
        </div>
        <div className="aud-stage-grid">
          {data.stages.map((s, i) => (
            <div key={i} className="aud-stage">
              <div className="age">{s.age}</div>
              <h3>{s.t}<span className="accent">{s.accent}</span></h3>
              <p>{s.d}</p>
              <a className="aud-stage-link" href={s.href}>Explore this topic →</a><div className="tags">
                {s.tags.map((t, j) => <span key={j} className="tag-mini">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudTreatments({ data, gender }) {
  const images = gender === 'women'
    ? { ...AUD_TREATMENT_IMAGES, hair: ['tx-hair-women', 'Illustrative clinician examining a female adult scalp with a dermatoscope'] }
    : AUD_TREATMENT_IMAGES;
  return (
    <section className="aud-tx">
      <div className="wrap">
        <div className="aud-sec-head">
          <div className="eyebrow">Treatments</div>
          <h2 style={{ marginTop: 14 }}>Programs built <span className="accent">for you.</span></h2>
          <p>Explore HRT.org’s treatment services and discuss suitability with your care team.</p>
        </div>
        <div className="aud-tx-grid">
          {data.treatments.map((t, i) => (
            <a key={i} className="aud-tx-card" href={t.href}>
              <img className="aud-treatment-image" src={`uploads/generated/${images[t.k][0]}.webp`} srcSet={t.k==='hrt'?undefined:`uploads/generated/${images[t.k][0]}-720.webp 720w, uploads/generated/${images[t.k][0]}.webp 1440w`} sizes="(max-width:600px) 100vw, (max-width:960px) 50vw, 40vw" width="1440" height="960" alt={images[t.k][1]} loading="lazy" decoding="async"/>
              <div className="aud-treatment-body">
              <div className="ic-wrap">{TX_ICONS[t.k]}</div>
              <h3>{t.n}</h3>
              <p>{t.d}</p>
              <div className="row">
                <span className="price">{t.price}</span>
                <span>LEARN MORE →</span>
              </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudQuote({ data }) {
  return (
    <section className="aud-quote">
      <div className="wrap aud-quote-inner">
        <div className="aud-quote-portrait">
          <img src={data.portrait} srcSet={data.portrait.includes("jessica-kikla-enhanced")?"uploads/generated/jessica-kikla-enhanced-512.webp 512w, uploads/generated/jessica-kikla-enhanced-1024.webp 1024w":data.portrait.includes("dr-lee-enhanced")?"uploads/generated/dr-lee-enhanced-512.webp 512w, uploads/generated/dr-lee-enhanced-1024.webp 1024w":undefined} sizes="240px" alt={data.quoteAttr.name} loading="lazy" width="400" height="460"/>
        </div>
        <div>
          <div className="eyebrow">Meet your care team</div><p className="aud-provider-copy">{data.quote}</p><a className="text-link" href={data.providerHref}>Read the provider profile →</a>
          <div className="attr">
            <span className="name">{data.quoteAttr.name}</span> · {data.quoteAttr.title}
          </div>
        </div>
      </div>
    </section>
  );
}

function AudLibrary({ data }) {
  return (
    <section className="aud-library">
      <div className="wrap">
        <div className="aud-sec-head">
          <div className="eyebrow">Read More</div>
          <h2 style={{ marginTop: 14 }}>From the <span className="accent">library</span>.</h2>
          <p>Explore HRT.org articles on the topics you’re navigating.</p>
        </div>
        <div className="aud-library-grid">
          {data.library.map((l, i) => (
            <a key={i} className="aud-lib-card" href={l.href}>
              {l.image&&<img className="aud-library-image" src={l.image} alt="" loading="lazy" width="480" height="280"/>}
              <span className="tag">{l.tag}</span>
              <h4>{l.t}</h4>
              {l.d&&<p className="aud-library-summary">{l.d}</p>}
              <div className="meta">
                {l.meta.map((m, j) => <span key={j}>{m}</span>)}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudCTA() {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="mini-cta">
          <h2>Your body's been <span className="accent">trying to tell you something</span>.<br/>Let's listen.</h2>
          <div className="right">
            <a className="btn btn-teal" href="/portal/app/symptoms-tracker/" style={{ height: 56, padding: "0 28px", fontSize: 16 }}>Start Consultation {Icons.arrow}</a>
            <div className="sub">Continue in the HRT.org patient portal</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AudFooter(){return null;}

function AudApp() {
  const params = new URLSearchParams(location.search);
  const [gender, setGender] = useState(params.get("g") === "men" ? "men" : "women");

  useEffect(() => {
    const nav = document.getElementById("site-navigation");
    let transition;
    let animation;
    let requested = new URLSearchParams(location.search).get("g") === "men" ? "men" : "women";
    const switchAudience = event => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href);
      const next = url.searchParams.get("g");
      if (url.origin !== location.origin || url.pathname !== location.pathname || !["women", "men"].includes(next)) return;
      event.preventDefault();
      if (requested === next) return;
      requested = next;
      transition?.skipTransition();
      animation?.cancel();
      const update = () => ReactDOM.flushSync(() => setGender(requested));
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        update();
      } else if (document.startViewTransition) {
        transition = document.startViewTransition(update);
        // Rapid choices intentionally skip the previous visual transition.
        transition.ready.catch(() => {});
      } else {
        update();
        animation = document.getElementById("main-content").animate(
          [{ opacity: 0.35, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 320, easing: "ease-out" }
        );
      }
    };
    nav?.addEventListener("click", switchAudience);
    return () => {
      nav?.removeEventListener("click", switchAudience);
      transition?.skipTransition();
      animation?.cancel();
    };
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-gender", gender);
    document.title = `For ${gender === "women" ? "Women" : "Men"} | HRT.org`;
    const url = new URL(location.href);
    url.searchParams.set("g", gender);
    history.replaceState(null, "", url);
    document.querySelectorAll('#site-navigation a[href*="Audience.html?g="]').forEach(link => {
      if (new URL(link.href).searchParams.get("g") === gender) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }, [gender]);

  const data = AUDIENCE[gender];
  return (
    <main id="main-content" tabIndex={-1} data-screen-label={`For ${gender === "women" ? "Women" : "Men"}`}>
      <AudNav gender={gender} />
      <AudHero data={data} gender={gender} />
      <AudSymptoms key={gender} data={data} gender={gender} />
      <AudStages data={data} />
      <AudTreatments data={data} gender={gender} />
      <AudQuote data={data} />
      <AudLibrary data={data} />
      <AudCTA />
      <AudFooter />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AudApp />);
