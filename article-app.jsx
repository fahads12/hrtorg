/* global React, ReactDOM, Icons, Logo */
const { useEffect, useState, useRef } = React;

/* ============================================================
   ARTICLE — example: a Conditions article on perimenopause
   Demonstrates the full template: TLDR, sectioned body, sidebar
   sub-links, contextual callouts/CTAs, related & final CTA.
   ============================================================ */
function formatArticle(article){
  let body=article.body;
  // Exact source-copy repairs preserve the original medical wording and citations.
  if(article.key==='health/perimenopause-navigating-the-many-symptoms-of-pre-menopause')body=body.replace('50’s.The','50’s. The');
  if(article.key==='health/endometriosis-explained-understanding-signs-symptoms-treatment-options-new-therapies-pregnancy-outcomes')body=body.replace('40’s[25]suffer','40’s[25] suffer');
  if(article.key==='health/osteoporosis-protecting-bone-health')body=body.replace(/<br\s*\/?>In-text citations: \(Staff, 2014\) Add pages \/ notes/,'');
  // Restore the source's heading hierarchy while keeping its compact visual style.
  if(article.key==='health/estrogen-and-skin-aging')body=body.replace(/<h4([^>]*)>/g,'<h2$1 class="article-heading-small">').replace(/<\/h4>/g,'</h2>');
  if(article.key==='health/hrt-hormone-replacement-therapy-for-men')body=body.replace(/<h4([^>]*)>(Related products:[\s\S]*?)<\/h4>/,'<h3$1 class="article-heading-small">$2</h3>');
  // A detached div serializes the formatted body in both browsers and prerendering.
  const template=document.createElement('div');
  template.innerHTML=body;
  const readable=text=>text.replace(/[\u200B-\u200D\uFEFF]/g,'').trim();
  template.querySelectorAll('p,h2,h3,h4').forEach(node=>{
    if(!readable(node.textContent)&&!node.querySelector('img,video,iframe'))node.remove();
  });
  let extraHeading=0;
  template.querySelectorAll('p').forEach(node=>{
    const child=node.firstElementChild;
    if(node.children.length===1&&child?.matches('strong,b')&&readable(node.textContent)===readable(child.textContent)&&readable(node.textContent).length<=180){
      const heading=document.createElement('h2');
      heading.id='article-heading-'+(++extraHeading);
      heading.innerHTML=child.innerHTML;
      node.replaceWith(heading);
    }
  });
  // Restore citation targets from the original, explicitly numbered References list.
  // Do not guess a destination from the article's section order.
  const referenceHeading=[...template.querySelectorAll('h2,h3,h4')].find(node=>/^references?$/i.test(readable(node.textContent)));
  const existingIds=new Set([...template.querySelectorAll('[id]')].map(node=>node.id));
  for(let node=referenceHeading?.nextElementSibling;node&&!node.matches('h2,h3,h4');node=node.nextElementSibling){
    const label=node.matches('p')&&node.firstElementChild;
    if(!label||!label.matches('sub,sup'))continue;
    const number=readable(label.textContent).replace(/^\[|\]$/g,'');
    if(/^\d+$/.test(number)&&!label.id&&!existingIds.has(number)){
      label.id=number;
      existingIds.add(number);
    }
  }
  const toc=[...template.querySelectorAll('h2,h3,h4')].map((node,i)=>{
    if(!node.id)node.id='article-section-'+(i+1);
    return {id:node.id,t:readable(node.textContent)};
  });
  return {...article,body:template.innerHTML,toc};
}
const ARTICLE=formatArticle(SOURCE.article);const RELATED=SOURCE.related;const PRESET={sideHead:'Explore your next step',sideBody:'Discuss your concerns with the HRT.org care team.',sideBtn:'Preparation guide',sideSub:'A guide before you visit the patient portal',sideLinks:[{t:'Lab Testing',href:'Lab Testing.html'},{t:'Treatments',href:'Treatments.html'},{t:'Shop',href:'https://store.hrt.org/'}],finalH:'Care starts with',finalAccent:'a conversation.',finalP:'Explore information, testing and provider-guided care.',finalOpts:[{name:'Prepare for consultation',sub:'Explore the preparation guide',href:'Consultation.html'},{name:'Explore testing',sub:'At-home laboratory testing',href:'Lab Testing.html'}]};
// Absolute local paths keep contents links on the article, including when opened in a new tab.
const articleAnchor=id=>location.pathname+location.search+'#'+encodeURIComponent(id);
function ArtNav(){return null;}

function ArtTop({article}){const [saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem('hrt-saved-articles')||'[]').includes(article.key)}catch{return false}});const [message,setMessage]=useState('');async function share(){try{if(navigator.share)await navigator.share({title:article.title,url:location.href});else{await navigator.clipboard.writeText(location.href);setMessage('Link copied.')}}catch{setMessage('You can copy the page address to share.')}}function save(){try{const list=JSON.parse(localStorage.getItem('hrt-saved-articles')||'[]');localStorage.setItem('hrt-saved-articles',JSON.stringify(saved?list.filter(k=>k!==article.key):[...new Set([...list,article.key])]));setSaved(!saved)}catch{setMessage('Saving is unavailable in this browser.')}}return <div className="art-top"><div className="wrap art-top-inner"><div className="art-crumb"><a href="HRT Home.html">Home</a><span>/</span><a href="Resources.html">Resources</a></div><div className="art-utils"><button onClick={share}>Share</button><button onClick={save} aria-pressed={saved}>{saved?'Saved':'Save'}</button><button onClick={()=>window.print()}>Print</button><span role="status">{message}</span></div></div></div>;}

function ArtHero({article}){return <section className="art-hero"><div className="wrap"><div className="cat-tag">HRT.org · Health education</div><h1>{article.title}</h1><p className="deck">{article.description}</p>{article.image&&<img className="article-source-image" src={article.image} alt="" width="1000" height="500" decoding="async" fetchpriority="high"/>}<nav className="art-tldr" aria-label="Article contents"><div className="art-tldr-head">Explore<span className="tldr-big">In this article</span></div><div className="art-contents-links"><ul>{article.toc.slice(0,4).map((t,i)=><li key={t.id}><span className="n" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><a href={articleAnchor(t.id)}>{t.t}</a></li>)}</ul>{article.toc.length>4&&<details className="art-more-contents"><summary>View all {article.toc.length} sections</summary><ul>{article.toc.slice(4).map((t,i)=><li key={t.id}><span className="n" aria-hidden="true">{String(i+5).padStart(2,'0')}</span><a href={articleAnchor(t.id)}>{t.t}</a></li>)}</ul></details>}</div></nav></div></section>;}

function ReadingRail({ toc, activeId, progress }) {
  return (
    <aside className="art-rail" aria-label="Reading navigation">
      <div className="label">In this article</div>
      <ul>
        {toc.map(t => (
          <li key={t.id}>
            <a href={articleAnchor(t.id)} className={activeId === t.id ? "active" : ""} aria-current={activeId === t.id ? "location" : undefined}>{t.t}</a>
          </li>
        ))}
      </ul>
      <div className="progress" aria-hidden="true"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
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

function ArtBody({article,presets}){return <section className="art-body"><div className="wrap art-body-grid"><ReadingRailContainer toc={article.toc}/><article className="art-content"><SourceBody html={article.body}/></article><SidebarRail presets={presets}/></div></section>;}

function ReadingRailContainer({ toc }) {
  const [active, setActive] = useState(toc[0]?.id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame=0;
    function updatePosition() {
      frame=0;
      // progress
      const article = document.querySelector(".art-content");
      if (article) {
        const rect = article.getBoundingClientRect();
        const total = Math.max(1,rect.height - window.innerHeight);
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
      setActive(visible.length > 0 ? visible[visible.length - 1].id : toc[0]?.id);
    }
    function onScroll(){if(!frame)frame=requestAnimationFrame(updatePosition)}
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {window.removeEventListener("scroll", onScroll);window.removeEventListener("resize", onScroll);cancelAnimationFrame(frame)};
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
        <a className="btn btn-primary" href="Consultation.html">{presets.sideBtn} →</a>
        <div className="ssub">{presets.sideSub}</div>
      </div>
      <div className="art-side-card">
        <h2>Related on HRT</h2>
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
          <h2>Keep reading <span className="accent">from the journal</span></h2>
          <a href="Resources.html">BROWSE THE LIBRARY →</a>
        </div>
        <div className="art-related-grid">
          {RELATED.map((r, i) => (
            <a key={i} className="art-rel-card" href={r.route}>
              <span className="tag">Health education</span>
              <h3>{r.title}</h3>
              <div className="meta">
                Read article
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

function ArtFooter(){return null;}

function ArtApp() {
  useEffect(() => { document.body.setAttribute("data-gender", "women"); }, []);
  const presets = PRESET;
  return (
    <div className="article-page" data-screen-label="Health article">
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
