// Exercise the actual metadata builder in an isolated two-page fixture, including production flags.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const buildMetadata = require('../../build-page-metadata.cjs');
const originalCwd = process.cwd();
const originalEnvironment = {VERCEL_ENV:process.env.VERCEL_ENV, HRT_ALLOW_INDEXING:process.env.HRT_ALLOW_INDEXING};
const fixture = fs.mkdtempSync(path.join(__dirname,'metadata-fixture-'));
try {
  fs.mkdirSync(path.join(fixture,'portal'),{recursive:true});
  const html = '<!doctype html><html><head><title>Fixture | HRT.org</title><meta name="description" content="Fixture."></head><body><a href="#portal-main">Skip</a><main id="portal-main"><h1>Fixture</h1></main></body></html>';
  fs.writeFileSync(path.join(fixture,'portal/index.html'),html);
  fs.writeFileSync(path.join(fixture,'Public.html'),html);
  process.chdir(fixture);
  process.env.VERCEL_ENV = 'production';
  process.env.HRT_ALLOW_INDEXING = 'true';
  buildMetadata();
  const portal = parseHTML(fs.readFileSync('portal/index.html','utf8')).document;
  const main = parseHTML(fs.readFileSync('Public.html','utf8')).document;
  assert.equal(portal.querySelector('meta[name="robots"]').getAttribute('content'),'noindex, nofollow');
  assert.equal(main.querySelector('meta[name="robots"]').getAttribute('content'),'index, follow');
  assert.equal(portal.querySelectorAll('[data-local-font]').length,0);
  assert.equal(main.querySelectorAll('[data-local-font]').length,3);
  assert.equal(portal.querySelector('a').getAttribute('href'),'#portal-main');
  assert.equal(portal.querySelector('link[rel="canonical"]').getAttribute('href'),'https://hrt.org/portal/');
  assert.ok(!fs.readFileSync('sitemap.xml','utf8').includes('/portal/'));
  assert.ok(fs.readFileSync('sitemap.xml','utf8').includes('/Public.html'));
  process.chdir(originalCwd);
  fs.writeFileSync(path.join(__dirname,'metadata-policy-tests.json'),JSON.stringify({checks:8,passed:true,mode:'Production indexing explicitly enabled; portal remains excluded'},null,2));
  console.log('Portal metadata policy: 8 checks passed.');
} finally {
  process.chdir(originalCwd);
  for (const [key,value] of Object.entries(originalEnvironment)) {if(value===undefined)delete process.env[key];else process.env[key]=value;}
}
