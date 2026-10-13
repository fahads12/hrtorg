// Build the isolated, UI-only portal. Never execute or contact the live portal.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const babel = require('@babel/standalone');
const React = require('react');
const {renderToString} = require('react-dom/server');
const {parseHTML, DOMParser} = require('linkedom');
const pages = require('./portal-pages.json');

const components = ['portal-auth.jsx', 'portal-dashboard.jsx', 'portal-app.jsx'];
const styles = ['assets/fonts/fonts.css', 'portal-reference.css', 'portal-base.css', 'portal-auth.css', 'portal-dashboard.css', 'portal-modern.css'];
const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const assetURL = file => '/' + file + '?v=' + crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12);

function renderPortal(html, pathname, compiled) {
  const {document} = parseHTML(html);
  const location = new URL(pathname, 'https://hrt.org');
  const storage = {getItem:()=>null, setItem(){}, removeItem(){}, clear(){}};
  const render = (element, component) => { element.innerHTML = renderToString(component); };
  const context = {
    React, document, location, URL, URLSearchParams, DOMParser,
    localStorage: storage, sessionStorage: storage,
    matchMedia: query => ({matches: /min-width/.test(query), addEventListener(){}, removeEventListener(){}}),
    console: {log(){}, warn(){}, error(){}},
    ReactDOM: {
      createRoot: element => ({render: component => render(element, component)}),
      hydrateRoot: (element, component) => {render(element, component); return {render: next => render(element, next)};},
    },
  };
  context.window = context;
  const sandbox = vm.createContext(context);
  for (const item of compiled) vm.runInContext(item.code, sandbox, {filename:item.file, timeout:15000});
  const root = document.getElementById('portal-root');
  if (!root || !root.children.length) throw Error('Portal prerender produced no content: ' + pathname);
  root.setAttribute('data-prerendered', 'true');
  return document.toString();
}

function buildPortal() {
  for (const file of [...components, ...styles]) if (!fs.existsSync(file)) throw Error('Missing portal source: ' + file);
  fs.mkdirSync('assets', {recursive:true});
  const compiled = components.map(file => {
    const code = '(function(){' + babel.transform(fs.readFileSync(file,'utf8'), {
      presets:[['react', {runtime:'classic'}]], comments:false, compact:true, filename:file,
    }).code + '\n})();';
    const output = 'assets/' + file.replace('.jsx', '.js');
    fs.writeFileSync(output, code);
    return {file:output, code};
  });
  const scripts = ['assets/react.production.min.js', 'assets/react-dom.production.min.js', ...compiled.map(item=>item.file)];
  const written = [];
  for (const page of pages) {
    if (!/^\/portal\/(?:[a-z0-9-]+\/)*$/.test(page.path)) throw Error('Unsafe portal route: ' + page.path);
    const file = page.path.slice(1) + 'index.html';
    const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + escape(page.title) + '</title><meta name="description" content="HRT.org patient portal interface preview.">' +
      '<meta name="robots" content="noindex, nofollow"><link rel="icon" href="/uploads/hrt-logo.webp">' +
      styles.map(style=>'<link rel="stylesheet" href="'+assetURL(style)+'">').join('') +
      '</head><body class="portal" data-portal-design="modern" data-portal-screen="'+escape(page.screen)+'"><div id="portal-root"></div>' +
      '<noscript><style>#portal-root{display:none}.portal-noscript{max-width:40rem;margin:10vh auto;padding:2rem;font:16px/1.6 system-ui;color:#172c45} .portal-noscript a{color:inherit}</style>' +
      '<main class="portal-noscript"><h1>HRT.org patient portal preview</h1><p>This interactive interface requires JavaScript. No account is created and no information is submitted by this preview.</p><p><a href="/HRT%20Home.html">Return to HRT.org</a> · <a href="/Contact.html">Contact information</a></p></main></noscript>' +
      scripts.map(script=>'<script src="'+assetURL(script)+'" defer></script>').join('') + '</body></html>';
    const rendered = renderPortal(html, page.path, compiled);
    fs.mkdirSync(path.dirname(file), {recursive:true});
    fs.writeFileSync(file, rendered);
    written.push({route:file, path:page.path, screen:page.screen});
  }
  fs.mkdirSync('scraps/portal-ui', {recursive:true});
  fs.writeFileSync('scraps/portal-ui/portal-build.json', JSON.stringify({scope:'Static UI only; no live portal, authentication or backend connection',routes:written,assets:compiled.map(item=>item.file)}, null, 2));
  console.log('Built ' + written.length + ' isolated portal preview routes.');
  return written.map(item=>item.route);
}

module.exports = buildPortal;
if (require.main === module) buildPortal();
