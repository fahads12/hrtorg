import { readData, normalizeProduct, clean } from './ingest.js';
import { fetchSource } from './network.js';
import { config } from './config.js';
import { activateKnowledge, rankKnowledge, rankServices } from './knowledge.js';

export let catalog = { products: [], syncedAt: null, currency: null };
export let report = {};
export let knowledge = [];
export let knowledgeHealth = { rejected: [] };
const refreshed = new Map(), pending = new Map();
const stop = new Set('a an the and or of to for me i my want show find get with some please options product products kit kits at home does include is what cheaper option'.split(' '));
export function tokens(text) { return [...new Set(clean(text).toLowerCase().replace(/[^\p{L}\p{N} -]/gu, ' ').split(/\s+/).filter(t => t.length > 1 && !stop.has(t)))]; }
export async function reloadData() {
  catalog = await readData('catalog.json', { products: [], syncedAt: null, currency: null });
  report = await readData('import-report.json', {});
  const review = await readData('knowledge-review.json', { entries: [] });
  const source = await readData('knowledge-sources.json', { documents: [] });
  const active = activateKnowledge(review, source);
  knowledge = active.entries;
  knowledgeHealth = { rejected: active.rejected, active: knowledge.length, reviewed: review.entries.length };
  refreshed.clear();
}
export function safeProduct(product) {
  const age = Date.now() - Date.parse(product.verifiedAt);
  return { ...product, freshness: product.freshness === 'unverified' ? 'unverified' : age <= config.freshMinutes * 60000 ? 'fresh' : 'stale' };
}
const productStop = new Set('am are can could would you your we our have has do does there any which list looking look available availability please tell about the a an for i me my want show find get with some options product products kit kits test tests testing profile profiles panel panels price prices cost costs how much buy purchase order ordering sell stock carry'.split(' '));
function productText(text) {
  return clean(text).toLowerCase().replace(/blood[\s-]*spot/g, 'bloodspot').replace(/\bthyroids\b/g, 'thyroid').replace(/\bvitamins\b/g, 'vitamin').replace(/\bvitamin\s+([abcdek])\s*(\d*)\b/g,'vitamin vitamin$1$2').replace(/[^\p{L}\p{N}]+/gu, ' ');
}
const hasProductTerm = (words, term) => words.has(term) || (term.length > 3 && words.has(term + 's')) || (/^(?:vitamin)?[abcdek]$/.test(term) && [...words].some(word => new RegExp('^' + term + '\\d+$').test(word)));
export function productCategories() { return ['All', 'Tests', 'Supplements', 'Other', ...new Set(catalog.products.flatMap(p => p.collections))]; }
function resolveCategory(category) {
  if (!category || !category.trim()) return null;
  const normalized = productText(category).trim();
  const aliases = { test: 'Tests', testing: 'Tests', supplement: 'Supplements', bloodspot: 'Blood Spot Testing', 'bloodspot test': 'Blood Spot Testing' };
  const resolved = (Object.hasOwn(aliases, normalized) ? aliases[normalized] : null) || productCategories().find(value => productText(value).trim() === normalized);
  if (resolved) return resolved;
  const error = new Error('Unknown catalog category. Choose a listed category or search without a category filter.');
  error.status = 400; error.code = 'INVALID_CATALOG_CATEGORY';
  throw error;
}
export function searchProducts({ query = '', category = null, maxPrice = null, availability = 'all', sort = 'relevance', offset = 0, limit = 4 } = {}) {
  category = resolveCategory(category);
  // Product names include meaningful single-letter vitamins (C/D/K) and compound markers.
  const queryTerms = [...new Set(productText(query).split(/\s+/).filter(t => t && !stop.has(t)))];
  const specificTerms = queryTerms.filter(term => !productStop.has(term));
  const terms = specificTerms;
  const preferredTerms = queryTerms.filter(term => /^(?:profile|profiles|panel|panels)$/.test(term));
  const matches = catalog.products.map(raw => {
    const p = safeProduct(refreshed.get(raw.id) || raw);
    const title = productText(p.name), body = productText(`${p.tags.join(' ')} ${p.collections.join(' ')} ${p.sampleType || ''} ${p.description}`);
    const titleWords = new Set(title.split(/\s+/)), bodyWords = new Set(body.split(/\s+/));
    const score = terms.reduce((s, t) => s + (hasProductTerm(titleWords, t) ? 8 : hasProductTerm(bodyWords, t) ? 1 : 0), 0)
      + preferredTerms.reduce((s, t) => s + (title.includes(t) ? 4 : 0), 0);
    return { p, score, matchesQuery: terms.every(t => hasProductTerm(titleWords, t) || hasProductTerm(bodyWords, t)) };
  }).filter(({ p, matchesQuery }) => matchesQuery && (!category || category === 'All' || p.category === category || p.collections.includes(category)) && (maxPrice === null || (p.price !== null && p.price <= maxPrice)) && (availability === 'all' || p.available === (availability === 'available')));
  matches.sort((a, b) => sort === 'price-asc' ? (a.p.price ?? Infinity) - (b.p.price ?? Infinity) : sort === 'price-desc' ? (b.p.price ?? -1) - (a.p.price ?? -1) : b.score - a.score || (terms.length ? a.p.name.length - b.p.name.length : 0) || a.p.name.localeCompare(b.p.name));
  return { total: matches.length, offset, limit, hasMore: offset + limit < matches.length, products: matches.slice(offset, offset + limit).map(x => x.p), filters: { query, category, maxPrice, availability, sort }, syncedAt: catalog.syncedAt };
}
export async function getProduct(id, recheck = true) {
  const product = refreshed.get(id) || catalog.products.find(p => p.id === id);
  if (!product) return null;
  if (!recheck || (refreshed.has(id) && safeProduct(product).freshness === 'fresh')) return safeProduct(product);
  if (pending.has(id)) return pending.get(id);
  const job = (async () => {
    try {
      const raw = JSON.parse(await fetchSource(`https://store.hrt.org/products/${encodeURIComponent(product.handle)}.json`)).product;
      if (String(raw.id) !== id) throw new Error('Product identity mismatch');
      // The .json endpoint supplies exact currency and image alt text, but omits availability.
      // Shopify's public product .js endpoint supplies availability and minor-unit prices.
      const live = JSON.parse(await fetchSource(`https://store.hrt.org/products/${encodeURIComponent(product.handle)}.js`));
      if (String(live.id) !== id) throw new Error('Product identity mismatch');
      for (const variant of raw.variants) {
        const current = live.variants.find(v => String(v.id) === String(variant.id));
        if (!current || typeof current.available !== 'boolean') throw new Error('Variant availability unavailable');
        variant.available = current.available;
      }
      const currencies = [...new Set(raw.variants.map(v => v.price_currency).filter(Boolean))];
      const p = normalizeProduct(raw, currencies.length === 1 ? currencies[0] : null, product.syncedAt, product.collections.map(title => ({ title })));
      p.verifiedAt = new Date().toISOString(); p.freshness = 'fresh'; refreshed.set(id, p); return p;
    } catch { return { ...product, freshness: 'unverified' }; }
    finally { pending.delete(id); }
  })();
  pending.set(id, job); return job;
}
export async function compareProducts(ids) {
  const products = await Promise.all([...new Set(ids)].slice(0, 4).map(id => getProduct(id)));
  if (products.some(p => !p)) throw new Error('Unknown product ID');
  return { products, fields: ['price', 'currency', 'available', 'variants', 'biomarkers', 'sampleType', 'collectionMethod', 'ingredients', 'directions', 'preparation', 'warnings', 'restrictions'], note: 'Unknown means the source does not provide an extracted value. Different tests are not interchangeable; confirm suitability with a clinician.' };
}
export function searchKnowledge(query, limit = 5) {
  return rankKnowledge(knowledge, query, limit);
}
export function getServices(query = '') { return rankServices(knowledge,query); }
export function getSupportDetails() { return knowledge.filter(k => ['support', 'geography'].includes(k.type)); }
export function carePathway(country, state) {
  const geography = knowledge.find(k => k.id === 'telehealth-geography');
  const pathway = knowledge.find(k => k.id === 'care-pathway');
  const supported = Boolean(geography && pathway && geography.freshness === 'verified' && pathway.freshness === 'verified' && country === 'United States' && (geography.supportedStates || []).includes(state));
  return { supported, message: supported ? 'HRT currently lists telehealth in your state. Continue to its published Get Started portal; HRT and a licensed clinician must still confirm your eligibility and appropriate next steps.' : 'I can’t verify an HRT treatment pathway for this location from the published information. Please contact HRT to confirm availability.', action: supported ? pathway.action : null, sources: getSupportDetails() };
}
