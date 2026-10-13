/* global React, ReactDOM, Icons, Logo */
const { useEffect, useMemo, useState } = React;

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

const PRODUCTS=SOURCE.products;const SHARED_FEATURES=SOURCE.values.map((v,i)=>({...v,n:'0'+(i+1)}));const FAQS_BY_PRODUCT={};
function ProductNav(){return null;}

function Breadcrumb({ gender, product }) {
  const g = gender === "women" ? "For Women" : "For Men";
  return (
    <nav className="wrap p-breadcrumb" aria-label="Breadcrumb">
      <a href="HRT Home.html">Home</a>
      <span className="sep">/</span>
      <a href={`Audience.html?g=${gender}`}>{g}</a>
      <span className="sep">/</span>
      <a href="Treatments.html">Treatments</a>
      <span className="sep">/</span>
      <span className="current" aria-current="page">{product.short}</span>
    </nav>
  );
}

function ProductHero({ product, productKey, variant, gender, onGenderChange, anchorHref }) {
  return (
    <section className="p-hero">
      <Breadcrumb gender={gender} product={product} />
      <div className="wrap p-hero-grid" style={{ marginTop: 32 }}>
        <div>
          <div className="p-gender-switch">
            <button type="button" className={gender === "women" ? "active" : ""} aria-pressed={gender === "women"} onClick={() => onGenderChange("women")}>For Women</button>
            <button type="button" className={gender === "men" ? "active" : ""} aria-pressed={gender === "men"} onClick={() => onGenderChange("men")}>For Men</button>
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
            <a className="btn btn-primary" href={`Consultation.html?g=${gender}&p=${productKey === 'ed' ? 'sexual' : productKey}`}>Prepare for a consultation {Icons.arrow}</a>
            <a className="btn btn-ghost" href={anchorHref('plans')}>Explore Care {Icons.arrow}</a>
          </div>
          <div className="p-credibility">
            <div className="item">
              <span className="ic-c">{Icons.shield}</span>
              <span className="label"><span className="strong">Privacy information</span><br/>Available in our policies</span>
            </div>
            <div className="item">
              <span className="ic-c">{Icons.provider}</span>
              <span className="label"><span className="strong">Licensed Providers</span><br/>Florida and California</span>
            </div>
            <div className="item">
              <span className="ic-c">{Icons.truck}</span>
              <span className="label"><span className="strong">Discreet Delivery</span><br/>to your door</span>
            </div>
          </div>
        </div>
        <div className="p-visual"><EditorialImage kind={gender+"-care"}/></div>
      </div>
    </section>
  );
}

function SubNav({anchorHref}) {
  return (
    <nav className="p-subnav" aria-label="Treatment page sections">
      <div className="wrap p-subnav-inner">
        <a href={anchorHref('who')}>Who it's for</a>
        <a href={anchorHref('how')}>How it works</a>
        <a href={anchorHref('plans')}>Care & purchasing</a>
        <a href={anchorHref('why')}>Why HRT</a>
        <a href={anchorHref('faq')}>FAQ</a>
        <a href={anchorHref('more')}>More treatments</a>
      </div>
    </nav>
  );
}

// Structure the saved service copy without rewriting or discarding its content.
function treatmentSections(html) {
  // A complete document gives both browser DOMParser and the build-time parser
  // the same body children, so treatment copy also renders without JavaScript.
  const doc = new DOMParser().parseFromString('<!doctype html><html><body>' + html + '</body></html>', 'text/html');
  const nodes = [];
  const collect = node => {
    if (node.tagName === 'DIV' && !node.attributes.length) Array.from(node.children).forEach(collect);
    else nodes.push(node);
  };
  Array.from(doc.body.children).forEach(collect);
  const groups = [];
  let group;
  nodes.forEach(node => {
    if (!node.textContent.replace(/[\s\u200b-\u200d\ufeff]/g, '') && !node.querySelector('img,table')) return;
    if (node.tagName === 'H2' || (!group && node.tagName === 'H3')) {
      group = { title: node.textContent, heading: node.innerHTML, nodes: [] };
      groups.push(group);
    } else {
      if (!group) { group = { title: 'Treatment overview', heading: 'Treatment overview', nodes: [] }; groups.push(group); }
      group.nodes.push(node);
    }
  });
  return groups.map((section, index) => {
    section.nodes.forEach(node => {
      if (node.tagName === 'UL' && node.children.length > 3 && Array.from(node.children).every(li => li.textContent.trim().length < 85 && !li.querySelector('ul,ol,strong,b'))) node.classList.add('p-compact-list');
    });
    return { id: `care-topic-${index + 1}`, title: section.title, heading: section.heading, html: section.nodes.map(node => node.outerHTML.replace(/<(\/?)h3\b/g, '<$1h4')).join('') };
  });
}

function treatmentContent(variant) {
  const allSections = treatmentSections(variant.body);
  const normalize = value => String(value).replace(/[\u200b-\u200d\ufeff]/g, '').replace(/\s+/g, ' ').trim();
  const extract = section => {
    const doc = new DOMParser().parseFromString('<!doctype html><html><body>' + section.html + '</body></html>', 'text/html');
    const children = Array.from(doc.body.children);
    const headings = Array.from(doc.querySelectorAll('h3,h4'));
    const items = headings.map(heading => {
      const answer = [];
      for (let node = heading.nextElementSibling; node && !/^H[1-6]$/.test(node.tagName); node = node.nextElementSibling) answer.push(node.textContent);
      return {q: heading.textContent, a: answer.join(' ')};
    }).filter(item => item.a);
    const plainQuestions = headings.length > 0 && items.length === headings.length &&
      /^H[34]$/.test(children[0]?.tagName || '') && children.every(node => /^(H3|H4|P)$/.test(node.tagName)) &&
      !doc.querySelector('a,img,table,ul,ol');
    return {items, plainQuestions};
  };
  const faqSections = allSections.filter(section => /faq/i.test(section.title));
  const items = variant.questions?.length ? variant.questions : (faqSections.length ? extract(faqSections[0]).items : []);
  // Remove a body FAQ only when every question and answer is retained verbatim
  // in the accordion. Any unique prose or rich content stays in the article.
  const duplicates = faqSections.filter(section => {
    const candidate = extract(section);
    return candidate.plainQuestions && candidate.items.every(item => items.some(saved =>
      normalize(saved.q) === normalize(item.q) && normalize(saved.a) === normalize(item.a)));
  });
  return {allSections, sections: allSections.filter(section => !duplicates.includes(section)), items, duplicates};
}

function WhoSection({variant, anchorHref}) {
  const {sections, allSections} = useMemo(() => treatmentContent(variant), [variant]);
  const [contentsOpen, setContentsOpen] = useState(() => window.matchMedia('(min-width: 801px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 801px)');
    const update = () => setContentsOpen(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return <section id="who" className="p-information"><div className="wrap">
    <div className="section-head p-information-head"><div className="eyebrow">Treatment information</div><h2>Understand your <em>care options.</em></h2></div>
    <div className="p-reading-layout">
      <nav className="p-reading-nav" aria-label="Treatment information topics"><details open={contentsOpen} onToggle={event => setContentsOpen(event.currentTarget.open)}><summary className="eyebrow">On this page</summary><ol>{allSections.map(section => <li key={section.id}><a href={anchorHref(section.id)}>{section.title}</a></li>)}</ol></details></nav>
      <div className="p-reading-content">{sections.map(section => <article className="p-source-section" id={section.id} key={section.id}><h3 dangerouslySetInnerHTML={{__html:section.heading}}/><div className="source-prose" dangerouslySetInnerHTML={{__html:section.html}}/></article>)}</div>
    </div>
  </div></section>;
}

function HowSection(){return <section id="how" className="feat-band"><div className="wrap"><h2>Care that meets you <em>where you are.</em></h2><div className="feat-grid">{CARE_STEPS.slice(0,4).map(s=><div className="feat-card" key={s.n}><div className="num">STEP {s.n}</div><h3>{s.title}</h3><p>{s.body}</p></div>)}</div></div></section>;}

function PlansSection(){return <section id="plans"><div className="wrap"><div className="section-head"><div className="eyebrow">Your next step</div><h2>Care built around <em>your goals.</em></h2><p>See current product prices in the separate HRT.org store. Discuss treatment through the patient portal.</p></div><CareOptions/></div></section>;}

function WhySection() {
  return (
    <section id="why" className="feat-band">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 40px", maxWidth: 720 }}>
          <div className="eyebrow">Why HRT</div>
          <h2 style={{ marginTop: 12 }}>The full care platform, <span style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontWeight: 400, color: "var(--ink-3)" }}>not just a prescription.</span></h2>
        </div>
        <div className="feat-grid p-values-grid">
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

function FAQSection({product,gender}) {
  const variant = PRODUCTS[product]?.[gender];
  const {items, duplicates} = useMemo(() => treatmentContent(variant), [variant]);
  return <section id="faq"><div className="wrap"><div className="section-head"><h2>Questions, <em>answered.</em></h2>{duplicates.map(section => <p className="p-faq-topic" id={section.id} key={section.id} dangerouslySetInnerHTML={{__html:section.heading}} />)}</div><SourceFAQ items={items}/></div></section>;
}

function RelatedSection({ current, gender }) {
  const others = Object.keys(PRODUCTS).filter(k => k !== current && (gender==='men'||k!=='ed'));
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
                <div className="rc-ic">{PRODUCT_ICONS[k] || PRODUCT_ICONS.sexual}</div>
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
            <a className="btn btn-teal" href="/portal/app/symptoms-tracker/" style={{ height: 56, padding: "0 28px", fontSize: 16 }}>Start Consultation {Icons.arrow}</a>
            <div className="sub">Continue in the HRT.org patient portal</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductFooter(){return null;}

function ProductApp() {
  const params = new URLSearchParams(location.search);
  const initialGender=(params.get("g") || SOURCE.initialGender)==="men"?"men":"women";
  const requestedProduct=params.get("p") || SOURCE.initialProduct || "hrt";
  const [productKey, setProductKey] = useState(requestedProduct==="ed"&&initialGender==="women"?"sexual":(PRODUCTS[requestedProduct]?requestedProduct:"hrt"));
  const [gender, setGender] = useState((params.get("g") || SOURCE.initialGender) === "men" ? "men" : "women");

  useEffect(() => {
    document.body.setAttribute("data-gender", gender);
    document.body.classList.add("product");
  }, [gender]);

  useEffect(() => {
    const header = document.querySelector('.nav');
    const updateOffset = () => {
      const position = header && getComputedStyle(header).position;
      const height = header && /^(sticky|fixed)$/.test(position) ? header.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty('--p-header-offset', `${height}px`);
    };
    updateOffset();
    const observer = header && new ResizeObserver(updateOffset);
    if (observer) observer.observe(header);
    window.addEventListener('resize', updateOffset);
    return () => { if(observer) observer.disconnect(); window.removeEventListener('resize', updateOffset); document.documentElement.style.removeProperty('--p-header-offset'); };
  }, []);

  // Reflect state in URL
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set("p", productKey);
    url.searchParams.set("g", gender);
    history.replaceState(null, "", url);
  }, [productKey, gender]);

  const product = PRODUCTS[productKey] || PRODUCTS.hrt;
  const variant = product[gender];
  const anchorHref = id => {
    const url = new URL(location.href);
    url.searchParams.set('p', productKey);
    url.searchParams.set('g', gender);
    return url.pathname + url.search + '#' + id;
  };

  return (
    <div className="p-page" data-screen-label={`${product.short} — ${gender === "women" ? "Women" : "Men"}`}>
      <ProductNav />
      <ProductHero product={product} productKey={productKey} variant={variant} gender={gender} anchorHref={anchorHref} onGenderChange={g=>{if(g==='women'&&productKey==='ed')setProductKey('sexual');setGender(g);}} />
      <SubNav anchorHref={anchorHref} />
      <WhoSection variant={variant} anchorHref={anchorHref} />
      <HowSection />
      <PlansSection product={product} />
      <WhySection />
      <FAQSection product={productKey} gender={gender} />
      <RelatedSection current={productKey} gender={gender} />
      <ProductCTA variant={variant} />
      <ProductFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ProductApp />);
