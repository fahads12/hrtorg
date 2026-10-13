/* global React, ReactDOM, Icons, Logo */
const { useState } = React;

/* ============================================================
   DATA
   ============================================================ */
const STATS=[{num:'Education',accent:'',lab:'Informed decisions'},{num:'Testing',accent:'',lab:'At-home collection'},{num:'Self-care',accent:'',lab:'Daily wellbeing'},{num:'Care',accent:'',lab:'Personalized support'}];
const VAL_IC={science:Icons.flask,heart:Icons.heart,eye:Icons.clipboard};
const VALUES=SOURCE.values;const TEAM=SOURCE.providers;const BADGES=SOURCE.values.map(v=>({...v,ic:Icons.shield}));
function AboutNav(){return null;}

function AboutFooter(){return null;}

function Hero(){return <section className="ab-hero"><div className="wrap ab-hero-inner"><div className="eyebrow">About HRT.org</div><h1>Hormone health, <span className="accent">taken seriously.</span></h1><p className="lead">{SOURCE.about.intro}</p></div><EditorialImage className="wide-editorial wrap" priority responsive/></section>;}

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

function Story(){return <section className="ab-story"><div className="wrap"><div><div className="eyebrow">Our story</div><h2>Founded on <span className="accent">fundamentals.</span></h2></div><div className="body"><SourceBody html={SOURCE.about.body}/></div></div></section>;}

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
          <p style={{ marginTop: 14 }}>Meet our medical professionals.</p>
        </div>
        <div className="ab-team-grid">
          {TEAM.map((p, i) => (
            <div key={i} className="ab-person">
              <a className="photo" href={p.route}><img src={p.image} srcSet={`${p.image.replace('-1024.webp','-512.webp')} 512w, ${p.image} 1024w`} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 960px) 44vw, 420px" alt={p.title} width="1024" height="1024" loading="lazy" decoding="async"/></a>
              <h3 className="n"><a href={p.route}>{p.title}</a></h3>
              <div className="r">{p.intro}</div>
              <div className="cred">HRT.org medical board</div>
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
