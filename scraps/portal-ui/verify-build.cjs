// Read-only checks against the local publish output and local preview server.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const root = path.resolve(__dirname, '../..');
const pages = require('../../portal-pages.json');
const output = path.join(root, 'dist');
const origin = process.env.PORTAL_TEST_ORIGIN || 'http://localhost:8014';
if (!/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin)) throw Error('Local preview origin required.');
const results = {origin, pages:[], assets:[], portalNavigation:{}, failures:[]};
const assets = new Set();
function check(condition, message) { if (!condition) results.failures.push(message); }
function localFile(url) {
  const pathname = decodeURIComponent(new URL(url, origin).pathname);
  return path.join(output, pathname.replace(/^\//,''), pathname.endsWith('/') ? 'index.html' : '');
}
function localTarget(url) { return new URL(url,origin).origin === origin; }
function scanCSS(file) {
  for (const [,raw] of fs.readFileSync(file,'utf8').matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) {
    if (raw.startsWith('data:') || raw.startsWith('#')) continue;
    check(localTarget(raw), 'External CSS asset: '+raw);
    if (localTarget(raw)) assets.add(raw);
  }
}
async function run() {
  const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml'),'utf8');
  check(!sitemap.includes('/portal/'), 'Portal route included in sitemap.');
  for (const item of pages) {
    const file = localFile(item.path);
    const html = fs.readFileSync(file,'utf8');
    const {document} = parseHTML(html);
    const portal = document.getElementById('portal-root');
    check(portal?.getAttribute('data-prerendered') === 'true' && portal.children.length > 0, 'Missing static body: '+item.path);
    check(!!document.getElementById('portal-main'), 'Missing main skip target: '+item.path);
    check(document.querySelector('meta[name="robots"]')?.getAttribute('content') === 'noindex, nofollow', 'Indexable portal: '+item.path);
    check(document.querySelector('link[rel="canonical"]')?.getAttribute('href') === 'https://hrt.org'+item.path, 'Wrong canonical: '+item.path);
    check(!!document.querySelector('noscript .portal-noscript'), 'Missing useful noscript fallback: '+item.path);
    const scripts = [...document.querySelectorAll('script[src]')].map(s=>s.getAttribute('src'));
    const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map(s=>s.getAttribute('href'));
    for (const url of [...scripts,...styles]) {
      check(localTarget(url), 'External runtime asset: '+url);
      check(!/care-|glow-navigation|\/styles\.css|premium|inner-pages/.test(url), 'Unrelated main site asset leaked into portal: '+url);
      if (localTarget(url)) assets.add(url);
    }
    for (const image of document.querySelectorAll('img[src]')) {
      const url = image.getAttribute('src');
      if (url.startsWith('data:')) continue;
      check(localTarget(url), 'External portal image: '+url);
      if (localTarget(url)) assets.add(url);
    }
    const response = await fetch(origin+item.path);
    check(response.status === 200, 'Portal route status: '+item.path+' '+response.status);
    const indexResponse = await fetch(origin+item.path+'index.html');
    const slashlessResponse = await fetch(origin+item.path.replace(/\/$/,''));
    check(indexResponse.status === 200 && slashlessResponse.status === 200, 'Portal direct-file/slashless route failed: '+item.path);
    results.pages.push({path:item.path,title:document.title,status:response.status,prerendered:!!portal?.children.length,robots:document.querySelector('meta[name="robots"]')?.getAttribute('content'),scripts:scripts.length,styles:styles.length});
  }
  for (const url of [...assets]) if (/\.css(?:\?|$)/.test(url)) scanCSS(localFile(url));
  for (const url of assets) {
    check(fs.existsSync(localFile(url)), 'Missing published asset: '+url);
    const response = await fetch(new URL(url,origin));
    check(response.status === 200, 'Asset status: '+url+' '+response.status);
    if (/\.ttf(?:\?|$)/.test(url)) check(response.headers.get('content-type') === 'font/ttf', 'TTF MIME incorrect: '+url);
    results.assets.push({url,status:response.status,type:response.headers.get('content-type')});
  }
  const allHTML = require('../../public-pages.cjs')(output);
  const counts = {};
  let externalPortalHrefs = 0;
  for (const file of allHTML) {
    const {document} = parseHTML(fs.readFileSync(file,'utf8'));
    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href');
      if (/^(?:https?:)?\/\/portal\.hrt\.org(?:\/|$)/i.test(href)) externalPortalHrefs++;
      if (!href.startsWith('/portal/')) continue;
      counts[href] = (counts[href] || 0)+1;
      check(fs.existsSync(localFile(href)), 'Portal navigation target missing: '+href+' in '+path.relative(root,file));
    }
  }
  results.portalNavigation = {externalPortalHrefs,localTargets:counts};
  check(externalPortalHrefs === 0, 'Remaining live portal navigation: '+externalPortalHrefs);
  const unknown = await fetch(origin+'/portal/does-not-exist/');
  const post = await fetch(origin+'/portal/',{method:'POST',body:'ui-only-preview-check'});
  check(unknown.status === 404, 'Unknown portal route should remain 404.');
  check(post.status === 405, 'Local preview unexpectedly accepts POST.');
  results.unknownRouteStatus=unknown.status;
  results.postStatus=post.status;
  fs.writeFileSync(path.join(__dirname,'build-verification.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({pages:results.pages.length,assets:results.assets.length,externalPortalHrefs,failures:results.failures},null,2));
  assert.equal(results.failures.length,0,'Portal build verification failed.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
