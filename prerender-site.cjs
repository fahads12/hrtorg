// Render the existing React components at build time. No browser or remote service is required.
const fs = require('node:fs');
const vm = require('node:vm');
const React = require('react');
const {renderToString} = require('react-dom/server');
const {parseHTML, DOMParser} = require('linkedom');
const publicPages = require('./public-pages.cjs');
// Query-based pages choose a variant before requesting its images. Otherwise the
// browser's preload scanner downloads the default women's portrait for men's URLs.
function deferDefaultImages(root) {
  for(const image of root.querySelectorAll('img'))for(const attr of ['src','srcset'])if(image.hasAttribute(attr)){image.setAttribute('data-initial-'+attr,image.getAttribute(attr));image.removeAttribute(attr);}
}
const restoreInitialImages="document.getElementById('root').querySelectorAll('img[data-initial-src]').forEach(i=>{for(const a of ['srcset','src']){const v=i.getAttribute('data-initial-'+a);if(v){i.setAttribute(a,v);i.removeAttribute('data-initial-'+a);}}});";

function prerender(html, file) {
  if (!html.includes('<div id="root"></div>')) return html;
  const {document} = parseHTML(html);
  const location = new URL(file, 'https://hrt.org/');
  const context = {
    React, document, location, URL, URLSearchParams, DOMParser,
    localStorage: {getItem:()=>null},
    matchMedia: query => ({matches: /min-width/.test(query), addEventListener(){}, removeEventListener(){}}),
    console: {log(){},warn(){},error(){}},
    ReactDOM: {createRoot: element => ({render: component => {element.innerHTML = renderToString(component);}})},
  };
  context.window = context;
  const sandbox = vm.createContext(context);
  for (const script of document.querySelectorAll('script[src]')) {
    const source = script.getAttribute('src').split('?')[0];
    // Run only local compiled templates and their data. Effects and event handlers do not run.
    if (!source.startsWith('assets/') || /react(?:-dom)?\.production|glow-navigation/.test(source)) continue;
    vm.runInContext(fs.readFileSync(source,'utf8'), sandbox, {filename:source,timeout:15000});
  }
  const root = document.getElementById('root');
  if (!root?.querySelector('h1')) throw Error('Prerender produced no heading: '+file);
  if (document.querySelector('script[src*="product-app"]')) document.body.classList.add('product');
  if (document.querySelector('script[src*="resources-app"]')) document.body.classList.add('resources');
  root.setAttribute('data-prerendered', 'true');
  return document.toString();
}

module.exports = function prerenderSite() {
  const rendered = [];
  for (const file of publicPages()) {
    const html = fs.readFileSync(file,'utf8');
    if (!html.includes('<div id="root"></div>')) continue;
    let renderedHtml=prerender(html,file);
    if(file==='Audience.html') {
      const {document}=parseHTML(renderedHtml);
      const men=parseHTML(prerender(html,'Audience.html?g=men')).document.getElementById('root');
      const template=document.createElement('template');template.id='initial-audience-men';template.innerHTML=men.innerHTML;
      const root=document.getElementById('root');deferDefaultImages(root);root.after(template);
      const initializer=document.createElement('script');
      // A tiny parser-time selection avoids painting women's content before the men's app loads.
      initializer.textContent="(()=>{const t=document.getElementById('initial-audience-men');if(new URLSearchParams(location.search).get('g')==='men'){document.getElementById('root').replaceChildren(t.content.cloneNode(true));document.body.dataset.gender='men';document.documentElement.dataset.careTheme='men';}t.remove();"+restoreInitialImages+"})();";
      template.after(initializer);
      renderedHtml=document.toString();
    }
    if(file==='Product.html') {
      const {document}=parseHTML(renderedHtml),root=document.getElementById('root');
      const templates=document.createElement('div');templates.hidden=true;templates.id='initial-product-variants';
      for(const gender of ['women','men'])for(const product of ['hrt','peptides','weight','sexual','hair','ed']) {
        if(gender==='women'&&['hrt','ed'].includes(product))continue;
        const variant=parseHTML(prerender(html,`Product.html?p=${product}&g=${gender}`)).document.getElementById('root');
        const template=document.createElement('template');template.id=`initial-product-${gender}-${product}`;template.innerHTML=variant.innerHTML;templates.append(template);
      }
      deferDefaultImages(root);root.after(templates);
      const initializer=document.createElement('script');
      initializer.textContent="(()=>{const q=new URLSearchParams(location.search),g=q.get('g')==='men'?'men':'women';let p=q.get('p')||'hrt';if(g==='women'&&p==='ed')p='sexual';if(!['hrt','peptides','weight','sexual','hair','ed'].includes(p))p='hrt';const t=document.getElementById('initial-product-'+g+'-'+p);if(t)document.getElementById('root').replaceChildren(t.content.cloneNode(true));document.body.dataset.gender=g;document.getElementById('initial-product-variants').remove();"+restoreInitialImages+"})();";
      templates.after(initializer);renderedHtml=document.toString();
    }
    fs.writeFileSync(file, renderedHtml);
    rendered.push(file);
  }
  console.log('Prerendered '+rendered.length+' React page bodies for resilient first paint.');
  return rendered;
};
module.exports.render = prerender;
