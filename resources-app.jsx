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
const SILOS=SOURCE.silos;
function ResNav(){return null;}

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

        <a className={`cat-featured ${silo.featured.gender}`} href={silo.featured.href} style={{ marginBottom: 18, display: "grid" }}>
          <div className="visual">
            <img src={silo.featured.image} alt="" loading="lazy"/><span className="tag">{silo.featured.tag}</span>
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
              <div className="ic-wrap">{c.ic||Icons.clipboard}</div>
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

function ResFooter(){return null;}

function ResApp() {
  useEffect(() => {
    document.body.setAttribute("data-gender", "women");
    document.body.classList.add("resources");
    // Smooth scroll to hash on load
    if (location.hash) {
      setTimeout(() => {
        let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? "instant" : "smooth", block: "start" });
      }, 200);
    }
  }, []);

  return (
    <div data-screen-label="HRT Resources">
      <ResNav />
      <section className="res-hero">
        <div className="wrap">
          <div className="eyebrow">The Library</div>
          <h1 style={{ marginTop: 18 }}>Health resources <span className="accent">for every part of your health.</span></h1>
          <p className="sub">Health articles, organized by the topics you want to explore.</p>
        </div>
      </section>
      <ResourceSearch/><SiloNav />
      {SILOS.map(s => <Silo key={s.id} silo={s} />)}
      <section className="tight">
        <div className="wrap">
          <div className="mini-cta">
            <h2>Still have a question?<br/><span className="accent">Talk to a provider.</span></h2>
            <div className="right">
              <a className="btn btn-teal" href="Consultation.html" style={{ minHeight: 56, padding: "14px 28px", fontSize: 16 }}>Prepare for Consultation {Icons.arrow}</a>
              <div className="sub">Prepare before continuing to the patient portal</div>
            </div>
          </div>
        </div>
      </section>
      <ResFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ResApp />);

function ResourceSearch(){
  const [query,setQuery]=React.useState('');
  const term=query.trim().toLocaleLowerCase();
  const found=SOURCE.articles.filter(p=>p.title.toLocaleLowerCase().includes(term));
  return <section className="wrap resource-search">
    <label htmlFor="resource-search">Search the library</label>
    <input id="resource-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search hormone health, symptoms, testing…" aria-describedby="resource-search-status"/>
    <p id="resource-search-status" role="status" aria-atomic="true">{term?(found.length?`${found.length} ${found.length===1?'article':'articles'} found`:'No articles found. Try a broader topic, such as hormones or testing.') : ''}</p>
    {term&&<>
      <button className="resource-search-clear" type="button" onClick={()=>{setQuery('');document.getElementById('resource-search')?.focus()}}>Clear search</button>
      {found.length>0&&<div className="cat-grid">{found.map(p=><a href={p.route} className="cat-card" key={p.key}><h3>{p.title}</h3><span>Read article →</span></a>)}</div>}
    </>}
  </section>;
}
