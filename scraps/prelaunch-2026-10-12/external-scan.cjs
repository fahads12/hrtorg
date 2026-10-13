const fs = require('node:fs');
const { parseHTML } = require('linkedom');
const output = 'scraps/prelaunch-2026-10-12';
const links = JSON.parse(fs.readFileSync(output + '/external-links.json', 'utf8'));
let cursor = 0;
const results = [];
async function inspect(link) {
  const started = Date.now();
  try {
    const response = await fetch(link.url, {
      method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(18000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HRTPrelaunchReadOnlyAudit/1.0)', 'Accept': 'text/html,application/pdf;q=0.9,*/*;q=0.8' },
    });
    const isHtml = (response.headers.get('content-type') || '').includes('text/html');
    let title = null;
    if (isHtml) {
      const text = await response.text();
      title = parseHTML(text.slice(0, 2000000)).document.querySelector('title')?.textContent.trim() || null;
    } else await response.body?.cancel();
    const challenge = /checking your browser|just a moment|access denied|^pubmed\.ncbi\.nlm\.nih\.gov$/i.test(title || '');
    return { ...link, status: response.status, finalUrl: response.url, title, ms: Date.now() - started,
      result: challenge || [401, 403, 429].includes(response.status) ? 'blocked-or-challenged' : response.status < 400 ? 'reachable' : [404, 410].includes(response.status) ? 'http-not-found-needs-browser-review' : 'http-error-needs-review' };
  } catch (error) {
    return { ...link, result: 'unverified-network-error', error: error.cause?.code || error.name, ms: Date.now() - started };
  }
}
(async () => {
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < links.length) {
      const link = links[cursor++];
      results.push(await inspect(link));
      fs.writeFileSync(output + '/external-verification.json', JSON.stringify({ generatedAt: new Date().toISOString(), scope: 'Read-only GET requests, no authenticated actions, submissions, or transactions. A 2xx response proves reachability only; failed/challenged requests do not establish a dead destination.', tested: results.length, total: links.length, results }, null, 2));
    }
  }));
  console.log(JSON.stringify({ tested: results.length, counts: Object.fromEntries([...new Set(results.map(r => r.result))].map(k => [k, results.filter(r => r.result === k).length])) }, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
