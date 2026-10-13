const fs = require('node:fs');
const {parseHTML} = require('linkedom');
const publicPages = require('./public-pages.cjs');
const {FORM_ALIASES} = require('./localize-checklist-links.cjs');
const origin = 'https://hrt.org';
const absolute = file => new URL(file, origin+'/').href;
const permanentNoindex = new Set(['404.html','Shop.html','HRT Landing.html','Product.html','checklist/general-nutritional-nutrient-deficiency-symptom-checklist/index.html','checklist/new-patient-health-supplement-required-intake-information/index.html','checklist/erectile-dysfunction-ed-symptom-checklist/index.html','checklist/weight-loss/index.html','menopause-quiz/index.html']);
const aliases = {
  'index.html':'', 'HRT Home.html':'',
  'lab-testing/index.html':'Lab Testing.html',
  'legal/privacy-policy/index.html':'Privacy Policy.html',
  'blog-categories/%20heart-health/index.html':'blog-categories/heart-health/index.html',
  ...Object.fromEntries(Object.entries(FORM_ALIASES).map(([from,to])=>[from+'/index.html',to])),
};
module.exports = function buildMetadata() {
  // Search indexing requires an explicit production-only decision. Preview builds stay closed.
  const indexable = process.env.VERCEL_ENV === 'production' && process.env.HRT_ALLOW_INDEXING === 'true';
  const pages = publicPages(), manifest=[];
  for (const file of pages) {
    const portalPage = file.startsWith('portal/');
    const {document} = parseHTML(fs.readFileSync(file,'utf8').replaceAll('uploads/hrt-logo.png','uploads/hrt-logo.webp'));
    const head = document.head;
    // Serve the approved fonts locally and discover the two critical Latin faces early.
    // This avoids the extra Google stylesheet round-trip and its late layout shifts.
    for (const link of head.querySelectorAll('link[href]')) {
      if (/fonts\.(?:googleapis|gstatic)\.com/.test(link.getAttribute('href')) || link.hasAttribute('data-local-font')) link.remove();
    }
    if (!portalPage) {
    const fonts=document.createElement('link');fonts.setAttribute('rel','stylesheet');fonts.setAttribute('href','/assets/fonts/fonts.css');fonts.setAttribute('data-local-font','');head.prepend(fonts);
    for (const name of ['geist-normal-latin','newsreader-normal-latin']) {
      const preload=document.createElement('link');preload.setAttribute('rel','preload');preload.setAttribute('as','font');preload.setAttribute('type','font/woff2');preload.setAttribute('crossorigin','');preload.setAttribute('href','/assets/fonts/'+name+'.woff2');preload.setAttribute('data-local-font','');head.prepend(preload);
    }
    }
    const meta = (attribute, key, value) => {
      const matches = [...head.querySelectorAll(`meta[${attribute}="${key}"]`)];
      const element = matches.shift() || head.appendChild(document.createElement('meta'));
      matches.forEach(el=>el.remove());
      element.setAttribute(attribute,key); element.setAttribute('content',value);
    };
    // Duplicate styles were inserted by multiple legacy builders.
    const seen = new Set();
    for (const link of head.querySelectorAll('link[rel="stylesheet"]')) {
      const key=link.getAttribute('href').split('?')[0];
      if(seen.has(key))link.remove(); else seen.add(key);
    }
    let canonicalFile = Object.hasOwn(aliases,file)?aliases[file]:file;
    if (portalPage) canonicalFile = file.replace(/index\.html$/, '');
    if(file==='Article.html') {
      const data=[...document.querySelectorAll('script[src]')].find(s=>s.getAttribute('src').startsWith('assets/articles/'));
      if(data)canonicalFile='health/'+data.getAttribute('src').split('/').pop().split('.js')[0]+'/index.html';
    }
    const canonical=absolute(canonicalFile);
    head.querySelectorAll('link[rel="canonical"]').forEach(el=>el.remove());
    const link=document.createElement('link');link.setAttribute('rel','canonical');link.setAttribute('href',canonical);head.append(link);
    const title=document.querySelector('title')?.textContent.trim() || 'HRT.org';
    const unavailable=/Information on this topic is not available yet|Content is not available/i.test(document.querySelector('main')?.textContent||'');
    const excluded=portalPage||permanentNoindex.has(file)||unavailable;
    let description=(head.querySelector('meta[name="description"]')?.getAttribute('content') || (unavailable?'Explore related care information and contact the HRT.org team.':title.replace(/\s*\|\s*HRT\.org$/,'')+' — explore information, resources and next steps with HRT.org.')).replace(/\s+/g,' ').trim();
    // Keep aliases aligned while distinguishing the actual care and assessment
    // pages in search snippets; these descriptions make no clinical claims.
    if(file==='Audience.html')description='Explore care for women and men across life stages, including hormone therapy, weight management, sexual health, hair loss and health resources.';
    if(document.querySelector('script[src^="assessment.js"]')&&!excluded)description=title.replace(/\s*\|\s*HRT\.org$/,'')+'. Review your responses and prepare questions for a healthcare professional.';
    meta('name','description',description);
    meta('name','robots',portalPage?'noindex, nofollow':indexable&&!excluded?'index, follow':'noindex, follow');
    meta('name','referrer','strict-origin-when-cross-origin');
    const photo=document.querySelector('main img[src],main img[data-initial-src]');
    const image=absolute(photo?.getAttribute('src')||photo?.getAttribute('data-initial-src')||'uploads/hrt-logo.webp');
    meta('property','og:type',file.startsWith('health/')?'article':'website');
    meta('property','og:site_name','HRT.org');meta('property','og:title',title);
    meta('property','og:description',description);meta('property','og:url',canonical);
    meta('property','og:image',image);meta('property','og:image:alt',photo?.getAttribute('alt')||title.replace(/\s*\|\s*HRT\.org$/,''));
    meta('name','twitter:card','summary_large_image');meta('name','twitter:title',title);
    meta('name','twitter:description',description);meta('name','twitter:image',image);
    // Build-time anchors remain correct when copied/opened in a new tab on pages with <base>.
    for(const anchor of portalPage ? [] : document.querySelectorAll('a[href^="#"]')) {
      const hash=anchor.getAttribute('href');if(hash.length>1)anchor.setAttribute('href','/'+file.split('/').map(encodeURIComponent).join('/')+hash);
    }
    // No-JS navigation stays usable; dynamic controls clearly advertise their dependency.
    document.getElementById('no-script-navigation')?.remove();
    const header=document.querySelector('header.nav');
    if(header) {
      const fallback=document.createElement('noscript');fallback.id='no-script-navigation';
      fallback.innerHTML='<style>.mobile-menu{display:none!important}.nav-links{display:flex!important}.no-script-notice{max-width:1180px;margin:20px auto;padding:16px 24px;color:#12304f;background:#f1f6f9;border-radius:10px;font:14px/1.7 system-ui,sans-serif}</style><p class="no-script-notice">You can read the information and follow the links on this page. Interactive tools require JavaScript. For assistance, <a href="Contact.html">contact our team</a>.</p>';
      if(['Audience.html','Product.html'].includes(file))fallback.innerHTML+='<style>#root{display:none}</style><main id="main-content" class="wrap source-reading"><h1>Care for women and men</h1><p>Explore hormone therapy, weight management, sexual health, and hair loss care.</p><div class="source-cta"><a class="btn btn-primary" href="women/hormone-replacement-therapy/index.html">Explore women’s care</a><a class="btn btn-primary" href="men/hormone-replacement-therapy/index.html">Explore men’s care</a><a class="btn btn-ghost" href="Treatments.html">All treatments</a></div></main>';
      header.after(fallback);
    }
    fs.writeFileSync(file,document.toString());
    manifest.push({route:file,canonical,indexable:!excluded&&canonicalFile===file,unavailable,title,description,image});
  }
  const urls=[absolute(''),...manifest.filter(p=>p.indexable).map(p=>p.canonical)];
  fs.writeFileSync('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+[...new Set(urls)].map(url=>'  <url><loc>'+url.replaceAll('&','&amp;')+'</loc></url>').join('\n')+'\n</urlset>\n');
  fs.writeFileSync('robots.txt',indexable?'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n':'User-agent: *\nDisallow: /\n');
  fs.mkdirSync('scraps/portal-ui',{recursive:true});
  fs.writeFileSync('scraps/portal-ui/metadata.json',JSON.stringify({indexableBuild:indexable,routes:manifest},null,2));
  console.log('Metadata and preview-safe indexing generated for '+pages.length+' pages.');
};
