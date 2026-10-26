import * as cheerio from 'cheerio';
import { mkdir, readFile, writeFile, rename, open, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchSource } from './network.js';

export const DATA = fileURLToPath(new URL('../data/', import.meta.url));
export const clean = s => String(s ?? '').replace(/[\u200b-\u200f\ufeff]/g, '').replace(/\s+/g, ' ').trim();
export function plain(html) { const $ = cheerio.load(html || ''); $('script,style,noscript').remove(); return clean($.text()); }
export async function readData(name, fallback) { try { return JSON.parse(await readFile(path.join(DATA, name), 'utf8')); } catch (e) { if (e.code === 'ENOENT') return fallback; throw e; } }
export async function saveData(name, value) { await mkdir(DATA, { recursive: true }); const target = path.join(DATA, name); await writeFile(target + '.tmp', JSON.stringify(value, null, 2)); await rename(target + '.tmp', target); }
const urlFrom = s => { if (typeof s !== 'string' || !s.trim()) return null; try { const u = new URL(s, 'https://store.hrt.org'); return u.protocol === 'https:' ? u.href : null; } catch { return null; } };
const money = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value);
export function normalizeProduct(p, currency, syncedAt, collections = []) {
  if (!p.id || !p.handle || !p.title || !Array.isArray(p.variants)) throw new Error('Invalid product record');
  const $ = cheerio.load(p.body_html || '');
  $('script,style,noscript').remove();
  const description = clean($.text());
  const paragraphs = $('p,li,tr').map((_, el) => clean($(el).text())).get().filter(Boolean);
  function section(pattern) {
    const values = [];
    const blocks = $('h1,h2,h3,h4,h5,h6,p,li,tr').toArray();
    for (let i = 0; i < blocks.length; i++) {
      const e = blocks[i], heading = clean($(e).text());
      if (!pattern.test(heading.slice(0, 90))) continue;
      const parts = [heading];
      if (heading.length < 100) for (let j = i + 1; j < Math.min(blocks.length, i + 20); j++) {
        if (/^h[1-6]$/.test(blocks[j].tagName)) break;
        const text = clean($(blocks[j]).text());
        if (text) parts.push(text);
      }
      values.push(parts.join('\n').slice(0, 3500));
    }
    return [...new Set([...values, ...paragraphs.filter(x => pattern.test(x.slice(0, 90)))])].join('\n') || null;
  }
  const variants = p.variants.map(v => ({ id: String(v.id), name: v.title, sku: v.sku || null, options: [v.option1, v.option2, v.option3].filter(Boolean), price: money(v.price), compareAtPrice: money(v.compare_at_price), available: typeof v.available === 'boolean' ? v.available : null, image: urlFrom(v.featured_image?.src) }));
  const images = (p.images || []).map(i => ({ url: urlFrom(i.src), alt: i.alt || null })).filter(i => i.url);
  const labelImages = $('img').map((_, e) => ({ url: urlFrom($(e).attr('src')), alt: $(e).attr('alt') || null })).get().filter(i => i.url);
  // A buyable product must not advertise a cheaper, sold-out variant as its current price.
  const buyableVariants = variants.filter(v => v.available === true && v.price !== null);
  const anyAvailable = variants.some(v => v.available === true);
  const pricedVariants = anyAvailable ? buyableVariants : variants.filter(v => v.price !== null);
  const cheapestVariant = pricedVariants.reduce((best, v) => !best || v.price < best.price ? v : best, null);
  const prices = pricedVariants.map(v => v.price);
  const collectionNames = collections.map(c => c.title);
  const evidence = `${p.product_type} ${p.title} ${collectionNames.join(' ')}`;
  const category = /\b(?:tests?|testing|lab|blood spot|saliva|urine)\b/i.test(evidence) ? 'Tests' : /supplement|nutrition|capsule|tablet|vitamin|softgel/i.test(evidence) ? 'Supplements' : 'Other';
  return {
    id: String(p.id), handle: p.handle, name: p.title, url: `https://store.hrt.org/products/${encodeURIComponent(p.handle)}`,
    images, labelImages, category, sourceCategory: p.product_type || null, collections: collectionNames,
    vendor: p.vendor || null, tags: Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',').map(clean).filter(Boolean),
    description, specifications: paragraphs, price: prices.length ? Math.min(...prices) : null, currency: currency || null,
    compareAtPrice: cheapestVariant?.compareAtPrice ?? null,
    priceVariantId: cheapestVariant?.id ?? null, priceBasis: anyAvailable ? 'lowest-available-variant' : 'lowest-listed-variant',
    available: variants.some(v => v.available === true) ? true : variants.every(v => v.available === false) ? false : null,
    variants, options: p.options || [], ingredients: section(/^(?:supplement facts|ingredients|other ingredients|active ingredients)/i),
    directions: section(/^(?:suggested use|directions|recommended use|dosage)/i),
    biomarkers: section(/^(?:tests? (?:for|include)|what.*(?:test|measur)|biomarkers|analytes|blood spot:|saliva:|dried urine:|urine:)/i),
    sampleType: section(/^(?:sample type|specimen|blood spot:|saliva:|dried urine:|urine:)/i) || ([...new Set(((`${p.title} ${collectionNames.join(' ')} ${description}`).match(/\b(?:blood spot|dried urine|saliva|serum)\b(?=\s+(?:test|sample|collection|profile))/gi) || []).map(x => x.toLowerCase()))].join(', ') || null),
    collectionMethod: section(/^(?:collection method|how to collect|sample collection|how (?:it|the test|testing) works)/i),
    preparation: section(/^(?:preparation|before (?:testing|collect)|fasting|test preparation)/i),
    warnings: section(/^(?:warning|caution|contraindication|disclaimer|precaution)/i),
    restrictions: section(/^(?:restriction|eligibility|not available|cannot.*ship|new york|this test.*not)/i),
    sourceUrl: `https://store.hrt.org/products/${encodeURIComponent(p.handle)}`, syncedAt, verifiedAt: syncedAt,
    freshness: 'synced', sourceUpdatedAt: p.updated_at || null
  };
}
export function sitemapLocations(xml) { const $ = cheerio.load(xml, { xml: true }); return $('url > loc, sitemap > loc').map((_, e) => $(e).text().trim()).get(); }
const template = /lorem ipsum|heyday|is this the real life|jus tfantasy|whose book|my book!|this is some text|clarityer-free|combine elements|insert.*text|your (?:company|business) name/i;
export function extractKnowledge(html, url) {
  if (html.trim().startsWith('{')) {
    const payload = JSON.parse(html), item = payload.page || payload.policy;
    if (item) html = `<html><head><title>${item.title || new URL(url).pathname.split('/').pop()}</title></head><body><main>${item.body_html || item.body || ''}</main></body></html>`;
  }
  const $ = cheerio.load(html);
  // Keep published navigation even when its presentation wrappers are removed below.
  const links = $('a[href]').map((_, e) => ({ text: clean($(e).text()), url: $(e).attr('href') })).get();
  const title = clean($('h1').first().text() || $('title').text());
  const fullText = clean($('body').text());
  const geography = $('body *').contents().filter((_, n) => n.type === 'text').toArray().map(n => clean(n.data)).find(text => /^Telehealth services currently available in /.test(text));
  const contactEmails=links.map(l=>l.url?.match(/^mailto:((?:info|support)@hrt\.org)(?:\?|$)/i)?.[1]).filter(Boolean);
  const operational = [geography, ...new Set([...contactEmails,...(fullText.match(/\b(?:info|support)@hrt\.org\b/g) || [])]), fullText.match(/(?:\(888\)|888)[ -]?574[ -]?5524/)?.[0]].filter(Boolean);
  $('script,style,noscript,nav,footer,header,form,button,svg,iframe,.w-form-done,.w-form-fail,.w-commerce-commercecartcontainerwrapper,.w-commerce-commercecartwrapper').remove();
  let root = $('main,article,.shopify-policy__body,.rte').first(); if (!root.length) root = $('body');
  const excluded = [], seen = new Set(), blocks = [];
  // Webflow puts meaningful sentences in divs. Keep leaf text containers, not layouts.
  root.find('h1,h2,h3,h4,h5,h6,p,li,div').each((_, el) => {
    if (el.tagName === 'div' && $(el).find('div,p,li,h1,h2,h3,h4,h5,h6,section,article,main,table,form').length) return;
    if (el.tagName === 'div' && $(el).find('a').length && !$(el).contents().toArray().some(n => n.type === 'text' && clean(n.data))) return;
    const text = clean($(el).text());
    if (!text || seen.has(text)) return; seen.add(text);
    if (template.test(text)) { excluded.push(text.slice(0, 150)); return; }
    if ((text.length < 12 && !/^(?:h[1-6]|li)$/.test(el.tagName)) || /^(?:view all|add to cart|get started|shop now|learn more|copyright|©)/i.test(text)) return;
    blocks.push(text);
  });
  return { title, blocks: [...new Set([...(title && !template.test(title) ? [title] : []), ...blocks, ...operational])], excluded, url, links };
}

export function retainUnfetchedSources(previous, documents, attemptedAt) {
  const urls = new Set(documents.map(doc => doc.url));
  return [...documents, ...previous.filter(doc => !urls.has(doc.url)).map(doc => ({ ...doc, lastAttemptAt: attemptedAt, refreshStatus: 'not-refreshed', lastFetchError: 'Not refreshed in current source crawl' }))];
}

export async function syncAll(progress = () => {}) {
  await mkdir(DATA, { recursive: true });
  const lockPath = path.join(DATA, 'sync.lock');
  const lock = await open(lockPath, 'wx').catch(() => { throw new Error('A synchronization is already running; check data/sync.lock if a prior process crashed.'); });
  try {
    const startedAt = new Date().toISOString();
    const report = { startedAt, completedAt: null, discoveredProducts: 0, importedProducts: 0, variants: 0, feedPages: 0, sitemapProducts: 0, collections: 0, failures: [], gaps: [], excludedContent: [], complete: false };
    const safe = async (url, fn) => { try { return await fn(await fetchSource(url)); } catch (e) { report.failures.push({ url, error: e.message }); return null; } };
    progress('Discovering the product feed and sitemaps');
    const home = await safe('https://store.hrt.org', x => x);
    const currency = home?.match(/Shopify\.currency\s*=\s*\{[^}]*["']active["']\s*:\s*["']([A-Z]{3})/)?.[1] ?? null;
    if (!currency) report.gaps.push('Store currency could not be verified. Prices have no assumed currency.');
    const sitemap = await safe('https://store.hrt.org/sitemap.xml', sitemapLocations) || [];
    const productUrls = new Set(), collectionUrls = [], pageUrls = [];
    for (const map of sitemap.filter(u => /sitemap_(products|collections|pages)_/.test(u))) {
      const urls = await safe(map, sitemapLocations) || [];
      for (const url of urls) {
        if (url.includes('/products/')) productUrls.add(url);
        else if (url.includes('/collections/')) collectionUrls.push(url);
        else if (url.includes('/pages/')) pageUrls.push(url);
      }
    }
    report.sitemapProducts = productUrls.size;
    const raw = new Map(); let exhausted = false;
    for (let page = 1; page <= 100; page++) {
      const products = await safe(`https://store.hrt.org/products.json?limit=250&page=${page}`, t => JSON.parse(t).products);
      if (!products || !Array.isArray(products)) break;
      report.feedPages++;
      if (!products.length) { exhausted = true; break; }
      let added = 0;
      for (const p of products) { if (!raw.has(String(p.id))) added++; raw.set(String(p.id), p); }
      progress(`Imported feed page ${page}: ${raw.size} unique products`);
      if (!added) { report.gaps.push('Product feed repeated a page before reaching an empty page.'); break; }
    }
    const handles = new Set([...raw.values()].map(p => p.handle));
    for (const url of productUrls) {
      const handle = decodeURIComponent(new URL(url).pathname.split('/').pop());
      if (handles.has(handle)) continue;
      const p = await safe(`${url}.json`, t => JSON.parse(t).product);
      if (p) raw.set(String(p.id), p);
    }
    // Collection membership is discovered from every public collection, independently of product type.
    const memberships = new Map();
    for (const url of [...new Set(collectionUrls)]) {
      const handle = new URL(url).pathname.split('/').pop();
      const info = await safe(`${url}.json`, t => JSON.parse(t).collection);
      const title = info?.title || handle;
      report.collections++;
      for (let page = 1; page <= 100; page++) {
        const products = await safe(`${url}/products.json?limit=250&page=${page}`, t => JSON.parse(t).products);
        if (!products?.length) break;
        let added = 0;
        for (const p of products) {
          const id = String(p.id); if (!raw.has(id)) raw.set(id, p);
          const list = memberships.get(id) || [];
          if (!list.some(c => c.handle === handle)) { list.push({ handle, title }); added++; }
          memberships.set(id, list);
        }
        if (!added || products.length < 250) break;
      }
    }
    progress(`Reconciling ${raw.size} products with ${productUrls.size} sitemap URLs`);
    const products = [];
    for (const p of raw.values()) {
      try { products.push(normalizeProduct(p, currency, startedAt, memberships.get(String(p.id)))); }
      catch (e) { report.failures.push({ url: p.handle, error: e.message }); }
    }
    const importedHandles = new Set(products.map(p => p.handle));
    const missing = [...productUrls].filter(u => !importedHandles.has(decodeURIComponent(new URL(u).pathname.split('/').pop())));
    const feedOnly = products.filter(p => ![...productUrls].some(u => decodeURIComponent(new URL(u).pathname.split('/').pop()) === p.handle)).map(p => p.url);
    report.discoveredProducts = new Set([...raw.values()].map(p => p.handle).concat([...productUrls].map(u => decodeURIComponent(new URL(u).pathname.split('/').pop())))).size;
    report.importedProducts = products.length; report.variants = products.reduce((n, p) => n + p.variants.length, 0);
    report.missingProducts = missing; report.feedOnlyProducts = feedOnly;
    report.unavailableProducts = products.filter(p => p.available === false).length;
    report.missingFields = Object.fromEntries(['currency', 'ingredients', 'biomarkers', 'collectionMethod', 'preparation', 'restrictions'].map(k => [k, products.filter(p => !p[k]).length]));
    if (!exhausted) report.gaps.push('Product feed pagination was not proven exhausted.');
    if (!productUrls.size) report.gaps.push('No product sitemap available for independent coverage check.');
    if (missing.length) report.gaps.push(`${missing.length} sitemap products were not imported.`);
    report.catalogComplete = exhausted && productUrls.size > 0 && missing.length === 0 && products.length === report.discoveredProducts;
    if (report.catalogComplete) await saveData('catalog.json', { syncedAt: startedAt, currency, products });
    else report.gaps.push('Previous catalog snapshot retained because this inventory import was not complete.');
    progress('Auditing services, FAQs, contact details and policies');
    const siteUrls = await safe('https://hrt.org/sitemap.xml', sitemapLocations) || [];
    const previousSources = await readData('knowledge-sources.json', { documents: [] });
    const knowledgeUrls = new Set([
      'https://hrt.org', 'https://hrt.org/contact', 'https://hrt.org/lab-testing', 'https://hrt.org/providers', 'https://hrt.org/join-our-network',
      ...previousSources.documents.map(doc => doc.url).filter(url => { try { const u = new URL(url); return u.protocol === 'https:' && ['hrt.org', 'www.hrt.org', 'store.hrt.org'].includes(u.hostname); } catch { return false; } }),
      ...siteUrls.filter(u => /\/(men|women)\//.test(u) || /\/(?:return-policy|privacy-policy|terms-and-conditions)$/.test(u) || /\/legal\//.test(u)),
      ...pageUrls.filter(u => /faq|contact|about|shipping|return|test|instruction/i.test(u)),
      'https://store.hrt.org/policies/refund-policy', 'https://store.hrt.org/policies/shipping-policy',
      'https://store.hrt.org/policies/privacy-policy', 'https://store.hrt.org/policies/terms-of-service'
    ]);
    const documents = [], audit = [];
    for (const url of knowledgeUrls) {
      const doc = await safe(url, html => extractKnowledge(html, url));
      if (!doc) {
        const previous = previousSources.documents.find(item => item.url === url);
        if (previous) documents.push({ ...previous, lastAttemptAt: startedAt, refreshStatus: 'failed', lastFetchError: report.failures.find(item => item.url === url)?.error || 'Source refresh failed' });
        continue;
      }
      if (doc.blocks.join(' ').length < 40) report.gaps.push(`No substantive knowledge content at ${url}; page is not used for answers.`);
      audit.push(doc);
      if (doc.excluded.length) report.excludedContent.push({ url, snippets: doc.excluded });
      // Quarantine legacy legal/template pages and broad medical marketing. Approved factual excerpts
      // are selected separately in knowledge-review.json; no raw crawl is automatically trusted.
      documents.push({ ...doc, syncedAt: startedAt, retrievedAt: startedAt, fetchedAt: startedAt, refreshStatus: 'ok', lastFetchError: null });
    }
    // A sitemap outage or changing discovery rules must not silently erase reviewed sources.
    const retainedDocuments = retainUnfetchedSources(previousSources.documents, documents, startedAt);
    await saveData('source-audit.json', { syncedAt: startedAt, documents: audit });
    await saveData('knowledge-sources.json', { syncedAt: startedAt, documents: retainedDocuments });
    report.knowledgePages = documents.length;
    report.gaps.push('Image-only supplement labels are preserved as source images, not transcribed or inferred. Missing structured attributes remain null.');
    report.gaps.push('Bulk feed image alt text is missing for some images; the live product-detail recheck enriches it from public product JSON.');
    report.gaps.push('Clinical efficacy claims are not validated by this business-source import. Knowledge excerpts require review.');
    report.complete = report.catalogComplete && report.failures.length === 0;
    report.completedAt = new Date().toISOString();
    await saveData('import-report.json', report);
    progress(`Finished: ${report.importedProducts} products, ${report.variants} variants, ${report.failures.length} failed requests`);
    return report;
  } finally { await lock.close(); await unlink(lockPath).catch(() => {}); }
}
