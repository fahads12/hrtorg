import robotsParser from 'robots-parser';
import { setTimeout as delay } from 'node:timers/promises';

export const SOURCE_HOSTS = new Set(['hrt.org', 'www.hrt.org', 'store.hrt.org']);
const robots = new Map();
let nextRequest = 0;
let queue = Promise.resolve();
export function sourceUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !SOURCE_HOSTS.has(url.hostname) || url.username || url.password || (url.port && url.port !== '443')) throw new Error('Unapproved source URL');
  return url;
}
async function fetchRetry(url, redirects = 0) {
  if (redirects > 5) throw new Error('Too many source redirects');
  for (let attempt = 0; attempt < 4; attempt++) {
    await delay(Math.max(0, nextRequest - Date.now()));
    nextRequest = Date.now() + 850;
    let response;
    try { response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(25000), headers: { 'User-Agent': 'HRTGuideCatalog/1.0 (public catalog indexing; no transactions)', Accept: /\.json(?:\?|$)/.test(url) ? 'application/json' : 'text/html,application/xml,text/plain' } }); }
    catch (e) { if (attempt === 3) throw new Error('Source network request failed'); await delay(1000 * 2 ** attempt); continue; }
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const destination = sourceUrl(new URL(response.headers.get('location'), url).href);
      if (destination.href === url) throw new Error('Redirect loop');
      return fetchRetry(destination.href, redirects + 1);
    }
    if (response.status === 429 || response.status >= 500) {
      if (attempt === 3) throw new Error(`Source HTTP ${response.status}`);
      const retry = response.headers.get('retry-after');
      const seconds = Number(retry) || (Date.parse(retry) - Date.now()) / 1000 || 2 ** (attempt + 1);
      await delay(Math.min(30000, Math.max(1000, seconds * 1000))); continue;
    }
    if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
    const text = await response.text();
    if (text.length > 12_000_000) throw new Error('Source response exceeds limit');
    return text;
  }
}
export async function fetchSource(value, { checkRobots = true } = {}) {
  const url = sourceUrl(value);
  const job = queue.then(async () => {
    if (checkRobots) {
      let rule = robots.get(url.origin);
      if (!rule || Date.now() - rule.at > 3600000) {
        const text = await fetchRetry(`${url.origin}/robots.txt`);
        rule = { parser: robotsParser(`${url.origin}/robots.txt`, text), at: Date.now() }; robots.set(url.origin, rule);
      }
      if (rule.parser.isAllowed(url.href, 'HRTGuideCatalog') === false) throw new Error('Source disallowed by robots.txt');
    }
    return fetchRetry(url.href);
  });
  queue = job.catch(() => {});
  return job;
}
