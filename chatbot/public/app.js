const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
const icons = {
  spark: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="m3 11 4 0 2-3 3 7 2-4h7"/>',
  test: '<path d="M9 3h6m-5 0v7l-6 8a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-8V3M7 14h10"/><path d="M9 17h.01M14 18h.01"/>',
  leaf: '<path d="M20 3c-9-1-16 3-16 9a7 7 0 0 0 7 7c6 0 9-7 9-16Z"/><path d="M3 22 15 10M8 17v-5m0 5h5"/>',
  compare: '<path d="M4 4h6v16H4V4Zm10 0h6v16h-6V4ZM7 8h0m10 4h0M7 12h0m10 4h0"/>',
  support: '<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 11H2v7h4v-7H4Zm16 0h2v7h-4v-7h2Zm0 7c0 3-4 3-7 3"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  arrow: '<path d="M12 20V4m-6 6 6-6 6 6"/>',
  edit: '<path d="m14 4 6 6M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15l-1 5Z"/>'
};
function icon(name) { const s = document.createElement('span'); s.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`; return s; }
$$('[data-icon]').forEach(el => el.replaceChildren(icon(el.dataset.icon)));
if (new URLSearchParams(location.search).get('widget') === '1') document.body.classList.add('widget');
function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
function button(text, className, handler) { const b = el('button', className, text); b.type = 'button'; if (handler) b.addEventListener('click', handler); return b; }
function link(text, url, className = 'source-link') {
  const a = el('a', className, text);
  try { const u = new URL(url); if (u.protocol !== 'https:' || !['hrt.org', 'store.hrt.org', 'portal.hrt.org'].includes(u.hostname)) return el('span', className, text); a.href = u.href; } catch { return el('span', className, text); }
  a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
}
const state = { sessionId: null, busy: false, selected: new Map(), products: new Map(), status: null, request: null, generation: 0 };
let toastTimer;
function toast(text) { $('#toast').textContent = text; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').hidden = true, 3500); }
async function api(url, body, method) {
  const response = await fetch(url, body === undefined ? {} : { method: method || 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'Connection interrupted. Please try again.'); }
  return response.status === 204 ? null : response.json();
}
function scrollTo(node) { requestAnimationFrame(() => node.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })); }
function message(text, user = false, label = 'HRT AI Guide') {
  $('#welcome').hidden = true;
  const node = el('article', `message ${user ? 'user' : 'assistant'}`);
  if (user) node.textContent = text;
  else { const head = el('div', 'message-head'); const avatar = el('span', 'guide-avatar'); avatar.append(icon('spark')); head.append(avatar, el('span', '', label)); if (label !== 'HRT AI Guide') head.append(el('span', 'message-label', 'Verified source content')); node.append(head); if (text) node.append(el('div', 'answer-text', text)); }
  $('#messages').append(node); scrollTo(node); return node;
}
function pending(node, text = 'Checking the HRT Store…') { const row = el('div', 'loading'); row.append(el('span', 'loading-dot'), el('span', '', text)); node.append(row); return row; }
function errorBox(node, err, retry) { const box = el('div', 'error-box', err.message || String(err)); if (retry) box.append(document.createElement('br'), button('Try again ↗', 'text-button', () => { box.remove(); retry(); })); node.append(box); }
function money(price, currency) { if (price === null || !currency) return 'Price unavailable'; try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price) + ` ${currency}`; } catch { return 'Price unavailable'; } }
function stock(product) { return product.available === true ? 'Available' : product.available === false ? 'Sold out' : 'Availability unconfirmed'; }
function imageFor(p, className = '') { const img = el('img', className); if (p.images?.[0]?.url) { img.src = p.images[0].url; img.alt = p.images[0].alt || p.name; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer'; img.addEventListener('error', () => img.replaceWith(el('span', 'image-unavailable', 'Image unavailable')), { once: true }); return img; } return el('span', 'image-unavailable', 'No source image available'); }
function freshness(p) { return p.freshness === 'fresh' ? `Checked ${new Date(p.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Price & stock not reverified. Confirm on the product page.'; }
function updateTray() {
  $('#compare-tray').hidden = !state.selected.size; $('#compare-count').textContent = `${state.selected.size} of 4 products selected`;
  $('#run-compare').disabled = state.selected.size < 2;
  $$('.compare-toggle').forEach(b => { const on = state.selected.has(b.dataset.id); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '✓ Selected' : 'Compare'; });
}
function selectProduct(p) { if (state.selected.has(p.id)) state.selected.delete(p.id); else if (state.selected.size === 4) return toast('You can compare up to 4 products at a time.'); else state.selected.set(p.id, p); updateTray(); }
function productCard(p, filters = {}) {
  state.products.set(p.id, p);
  const card = el('article', 'product-card'); card.dataset.productId = p.id;
  const image = el('div', 'product-image'); image.append(imageFor(p), el('span', 'product-tag', p.category));
  const body = el('div', 'product-body'); body.append(button(p.name, 'product-name', () => showDetails(p.id)));
  const price = el('div', 'product-price-row'); price.append(el('span', 'product-price', `${p.variants.some(v => v.price !== p.price) ? 'From ' : ''}${money(p.price, p.currency)}`), el('span', `stock ${p.available ? '' : 'unavailable'}`, stock(p))); body.append(price);
  const fact = [p.vendor ? `By ${p.vendor}` : '', p.sampleType ? `Sample: ${p.sampleType.slice(0, 100)}` : '', p.sourceCategory || ''].filter(Boolean).join(' · ');
  body.append(el('p', 'product-description', fact || (p.description ? `Store description: ${p.description.slice(0, 150)}${p.description.length > 150 ? '…' : ''}` : 'See the product page for published details.')));
  const reason = filters.query || filters.q ? `Listed for your search: “${filters.query || filters.q}”. Check the details for the exact match.` : filters.category ? `From the ${filters.category.toLowerCase()} catalog${filters.maxPrice != null ? `, within your listed-price budget` : ''}.` : 'An option from the HRT Store catalog.';
  body.append(el('p', 'match-reason', reason), el('p', `freshness ${p.freshness === 'fresh' ? '' : 'stale'}`, freshness(p)));
  const actions = el('div', 'product-actions'); const compare = button('Compare', 'compare-toggle', () => selectProduct(p)); compare.dataset.id = p.id; compare.setAttribute('aria-pressed', String(state.selected.has(p.id))); compare.setAttribute('aria-label', `Compare ${p.name}`);
  actions.append(link('View Product ↗', p.url, 'view-product'), compare); body.append(actions); card.append(image, body); return card;
}
async function saveContext(products, filters) { try { const data = await api('/api/session/context', { sessionId: state.sessionId, productIds: products.map(p => p.id), ...(filters ? { search: filters } : {}) }); state.sessionId = data.sessionId; } catch { /* Browsing is usable even when chat context is temporarily unavailable. */ } }
function sources(node, entries) { const row = el('div', 'sources'); const seen = new Set(); for (const s of entries || []) { if (seen.has(s.url)) continue; seen.add(s.url); row.append(link(`${s.title} ↗`, s.url)); } if (row.childNodes.length) node.append(row); }
function productResults(node, result, append = false) {
  if (result.urgent) { node.append(el('div', 'error-box urgent-box', result.message)); return; }
  if (!append) node.append(el('p', 'results-label', `${result.total.toLocaleString()} catalog matches · showing up to ${result.limit || 4} at a time`));
  let grid = $('.product-grid', node); if (!grid) { grid = el('div', 'product-grid'); node.append(grid); }
  result.products.forEach(p => grid.append(productCard(p, result.filters)));
  updateTray();
  if (!result.products.length) node.append(el('p', 'answer-text', result.total ? 'No displayed items still match after the live check. Try the next page or adjust your filters.' : 'No catalog products match these filters. Try a broader search or contact HRT for help.'));
  if (result.hasMore) {
    const more = button('Show more products ↓', 'show-more', async () => {
      more.disabled = true;
      try { const q = paramsFrom({ ...result.filters, q: result.filters.query || '', offset: result.offset + result.limit }); const next = await api(`/api/products?${q}`); more.remove(); productResults(node, next, true); await saveContext(next.products); } catch (e) { more.disabled = false; toast(e.message); }
    }); node.append(more);
  }
}
function paramsFrom(filters) { return new URLSearchParams(Object.entries(filters).filter(([k, v]) => v !== '' && v !== null && v !== undefined && k !== 'query')); }
function browse(category = 'All', initialQuery = '') {
  const node = message(category === 'All' ? 'Explore the HRT Store. Search the catalog, narrow your budget, or choose products to compare.' : `Explore ${category === 'Tests' ? 'at-home testing' : 'supplements'} from the HRT Store. These are catalog matches; a clinician can help decide what’s appropriate for you.`, false, 'HRT Store');
  const form = el('form', 'browse-filters');
  const inputField = (label, input) => { const wrap = el('label', 'filter-field'); wrap.append(el('span', '', label), input); form.append(wrap); return input; };
  const search = el('input'); search.type = 'search'; search.name = 'q'; search.placeholder = 'e.g. cortisol, vitamin D'; search.value = initialQuery; search.maxLength = 300; inputField('Search catalog', search);
  const select = el('select'); select.name = 'category'; for (const text of ['All', 'Tests', 'Supplements', 'Other', ...(state.status?.collections || [])]) { const o = el('option', '', text); o.value = text; select.append(o); } select.value = category; inputField('Category or collection', select);
  const budget = el('input'); budget.type = 'number'; budget.min = '0'; budget.max = '100000'; budget.step = '0.01'; budget.name = 'maxPrice'; budget.placeholder = 'Any budget'; inputField('Max listed price (USD)', budget);
  const bottom = el('div', 'filter-bottom'), available = el('select'), sort = el('select'); available.setAttribute('aria-label', 'Product availability'); sort.setAttribute('aria-label', 'Sort products');
  for (const [v, t] of [['all', 'All availability'], ['available', 'Available only'], ['unavailable', 'Sold out only']]) { const o = el('option', '', t); o.value = v; available.append(o); }
  for (const [v, t] of [['relevance', 'Relevance'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']]) { const o = el('option', '', t); o.value = v; sort.append(o); }
  const submit = button('Find products', 'small-button'); submit.type = 'submit'; bottom.append(available, sort, submit); form.append(bottom); node.append(form);
  const results = el('div', 'browse-results'); node.append(results); let requestVersion = 0;
  async function run() {
    const version = ++requestVersion; submit.disabled = true; results.replaceChildren(); const loading = pending(results);
    const filters = { q: search.value.trim(), category: select.value, availability: available.value, sort: sort.value, ...(budget.value ? { maxPrice: Number(budget.value) } : {}) };
    try { const result = await api(`/api/products?${paramsFrom(filters)}`); if (version !== requestVersion) return; loading.remove(); productResults(results, result); await saveContext(result.products, filters); }
    catch (e) { if (version === requestVersion) { loading.remove(); errorBox(results, e, run); } }
    finally { if (version === requestVersion) submit.disabled = false; }
  }
  form.addEventListener('submit', e => { e.preventDefault(); void run(); }); void run(); return node;
}
async function showDetails(id) {
  const dialog = $('#detail-dialog'), content = $('#detail-content'); content.replaceChildren(); pending(content); dialog.showModal();
  try {
    const p = await api(`/api/products/${id}`); content.replaceChildren(); content.append(imageFor(p, 'detail-image'), el('h2', '', p.name));
    const summary = el('p', '', `${money(p.price, p.currency)} · ${stock(p)} · ${freshness(p)}`); content.append(summary);
    const label = el('label', 'filter-field', 'Variant'); const select = el('select', 'variant-select');
    for (const v of p.variants) { const o = el('option', '', `${v.name} — ${money(v.price, p.currency)}${v.available === false ? ' · sold out' : ''}`); o.value = v.id; select.append(o); } label.append(select); content.append(label);
    const view = link('View selected variant on HRT Store ↗', `${p.url}?variant=${select.value}`, 'view-product');
    select.addEventListener('change', () => { const v = p.variants.find(v => v.id === select.value); summary.textContent = `${money(v.price, p.currency)} · ${stock(v)} · ${freshness(p)}`; view.href = `${p.url}?variant=${v.id}`; });
    content.append(view); const fields = el('div', 'detail-fields');
    for (const [key, title] of [['description', 'Published store description'], ['biomarkers', 'Biomarkers / what is measured'], ['sampleType', 'Sample type'], ['collectionMethod', 'Collection method'], ['ingredients', 'Published ingredients'], ['directions', 'Label directions (not personal dosing advice)'], ['preparation', 'Published preparation instructions'], ['warnings', 'Warnings'], ['restrictions', 'Product-specific restrictions']]) {
      const details = el('details'); details.append(el('summary', '', title), el('p', '', p[key] || 'Not specified in the extracted product information. Check the product page or ask HRT support.')); fields.append(details);
    }
    if (p.images.length + p.labelImages.length > 1) { const d = el('details'); d.append(el('summary', '', 'Product and label images')); const row = el('div', 'label-images'); for (const i of [...p.images.slice(1), ...p.labelImages]) { const img = el('img'); img.src = i.url; img.alt = i.alt || `${p.name} — additional source image`; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer'; row.append(img); } d.append(row); fields.append(d); }
    content.append(fields, el('p', 'product-description', 'Published descriptions and label directions are store content, not a personal treatment recommendation. Follow your kit instructions and ask your clinician about medicines or preparation changes. Shipping restrictions can also apply; see the store FAQs.')); sources(content, [{ title: 'Store FAQs & restrictions', url: 'https://store.hrt.org/pages/easy-faqs' }]);
  } catch (e) { content.replaceChildren(); errorBox(content, e, () => { dialog.close(); void showDetails(id); }); }
}
async function showComparison() {
  if (state.selected.size < 2) return toast('Choose at least two products using their Compare buttons.');
  const dialog = $('#compare-dialog'), content = $('#compare-content'); content.replaceChildren(); pending(content, 'Rechecking your selected products…'); dialog.showModal();
  try {
    const result = await api('/api/compare', { ids: [...state.selected.keys()] }); content.replaceChildren();
    content.append(el('p', '', result.note)); const wrap = el('div', 'table-scroll'), table = el('table', 'compare-table'), head = el('thead'), row = el('tr'); row.append(el('th', '', 'Published details'));
    for (const p of result.products) { const th = el('th'); th.scope = 'col'; th.append(imageFor(p), el('div', '', p.name)); row.append(th); } head.append(row); table.append(head); const body = el('tbody');
    const rows = [['Price', p => `${money(p.price, p.currency)}${p.variants.some(v => v.price !== p.price) ? ' (from)' : ''}`], ['Availability', stock], ['Last checked', freshness], ['Variant options', p => p.variants.map(v => `${v.name}: ${money(v.price, p.currency)} · ${stock(v)}`).join('\n')], ['Sample type', p => p.sampleType], ['Biomarkers', p => p.biomarkers], ['Collection method', p => p.collectionMethod], ['Ingredients', p => p.ingredients], ['Label directions', p => p.directions], ['Preparation', p => p.preparation], ['Warnings', p => p.warnings], ['Restrictions', p => p.restrictions]];
    for (const [title, value] of rows) { const tr = el('tr'), th = el('th', '', title); th.scope = 'row'; tr.append(th); for (const p of result.products) { const td = el('td'), text = value(p) || 'Not specified by extracted source'; if (text.length > 260) { const d = el('details'); d.append(el('summary', '', `${text.slice(0, 120)}… Read published details`), el('p', '', text)); td.append(d); } else td.textContent = text; tr.append(td); } body.append(tr); }
    const actions = el('tr'); actions.append(el('th', '', 'Next step')); for (const p of result.products) { const td = el('td'); td.append(link('View Product ↗', p.url, 'view-product')); actions.append(td); } body.append(actions); table.append(body); wrap.append(table); content.append(wrap); await saveContext(result.products);
  } catch (e) { content.replaceChildren(); errorBox(content, e, () => { dialog.close(); void showComparison(); }); }
}
async function showServices() {
  const node = message('Explore care for every chapter of your health. These pages explain HRT’s services; deciding on treatment is a conversation with a licensed clinician.', false, 'HRT Services'); const loading = pending(node, 'Reading verified HRT service information…');
  try { const result = await api('/api/services'); loading.remove(); const geography = result.support.find(s => s.type === 'geography'); if (geography) node.append(el('p', 'product-description', geography.text)); const grid = el('div', 'service-grid'); for (const s of result.services) { const card = el('section', 'service-card'); card.append(el('h3', '', s.title), el('p', '', s.text), link('Explore service ↗', s.url, '')); for (const l of s.links || []) card.append(el('span', '', ' · '), link(l.title + ' ↗', l.url, '')); grid.append(card); } node.append(grid); if (!result.services.length) node.append(el('p', 'answer-text', 'Service information is awaiting a source check. Please contact HRT directly.')); sources(node, geography ? [geography] : []); }
  catch (e) { loading.remove(); errorBox(node, e, showServices); }
  const care = el('section', 'service-card mt-4'); care.append(el('h3', '', 'Thinking about a consultation?'), el('p', '', 'Check HRT’s published service area before taking the next step. Product shipping rules are separate.'));
  const form = el('form', 'browse-filters'), countryLabel = el('label', 'filter-field', 'Country'), country = el('select'), stateLabel = el('label', 'filter-field', 'State'), region = el('select');
  country.required = true; region.required = true;
  for (const [value, title] of [['', 'Choose country'], ['United States', 'United States'], ['Other', 'Another country']]) { const o = el('option', '', title); o.value = value; country.append(o); }
  for (const [value, title] of [['', 'Choose state'], ['Florida', 'Florida'], ['California', 'California'], ['Other', 'Another state / region']]) { const o = el('option', '', title); o.value = value; region.append(o); }
  countryLabel.append(country); stateLabel.append(region); const check = button('Check next step', 'small-button'); check.type = 'submit'; form.append(countryLabel, stateLabel, check); const answer = el('div'); care.append(form, answer); node.append(care);
  form.addEventListener('submit', async e => { e.preventDefault(); check.disabled = true; answer.replaceChildren(); try { const result = await api('/api/care-pathway', { country: country.value, state: region.value }); answer.append(el('p', '', result.message)); if (result.action) answer.append(link(result.action.title + ' ↗', result.action.url, 'view-product')); sources(answer, result.sources); } catch (error) { errorBox(answer, error); } finally { check.disabled = false; } });
}
async function showKnowledge(query, label) {
  const node = message('', false, label), loading = pending(node, 'Finding the published guidance…');
  try { const { sources: items } = await api(`/api/knowledge?q=${encodeURIComponent(query)}`); loading.remove(); if (!items.length) node.append(el('p', 'answer-text', 'I don’t have verified information for this yet. Please contact HRT for help.')); for (const s of items.slice(0, 4)) { const section = el('section', 'service-card'); section.append(el('h3', '', s.title), el('p', '', s.text)); sources(section, [s]); node.append(section); } }
  catch (e) { loading.remove(); errorBox(node, e, () => showKnowledge(query, label)); }
}
async function send(text) {
  if (state.busy || !text.trim()) return; state.busy = true; $('#send').disabled = true;
  message(text, true); const node = message(''), loading = pending(node, 'Connecting to your guide…');
  state.request = new AbortController(); const generation = state.generation;
  try {
    const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, sessionId: state.sessionId }), signal: state.request.signal });
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'The guide is temporarily unavailable.'); }
    const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = '', completed = false, provisional = null;
    while (true) {
      const { value, done } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true });
      let end; while ((end = buffer.indexOf('\n\n')) >= 0) {
        const frame = buffer.slice(0, end); buffer = buffer.slice(end + 2); if (generation !== state.generation) return;
        const event = frame.split('\n').find(l => l.startsWith('event:'))?.slice(7); const raw = frame.split('\n').find(l => l.startsWith('data:'))?.slice(6); if (!raw) continue; const data = JSON.parse(raw);
        if (event === 'session') state.sessionId = data.sessionId;
        if (event === 'status') loading.lastChild.textContent = data.message;
        if (event === 'text') { if (!provisional) { provisional = el('div', 'answer-text provisional'); node.append(provisional); } provisional.textContent = data.text; }
        if (event === 'error' || event === 'answer') provisional?.remove();
        if (event === 'error') { loading.remove(); completed = true; errorBox(node, new Error(data.message), data.code === 'AI_NOT_CONFIGURED' ? null : () => send(text)); if (data.code === 'AI_NOT_CONFIGURED') { const row = el('div', 'followups'); row.append(button('Browse the catalog', '', () => browse()), button('Explore HRT services', '', showServices), button('Contact HRT', '', () => showKnowledge('support contact', 'HRT Support'))); node.append(row); } }
        if (event === 'answer') {
          loading.remove(); completed = true; node.append(el('div', data.urgent ? 'error-box urgent-box' : 'answer-text', data.message));
          if (data.products?.length && !data.urgent) productResults(node, { products: data.products, total: data.search?.total || data.products.length, limit: 4, offset: data.search?.offset || 0, hasMore: data.search?.hasMore || false, filters: data.search?.filters || {} });
          sources(node, data.sources); const row = el('div', 'followups'); for (const text of data.followups || []) row.append(button(text, '', () => send(text))); node.append(row);
        }
      }
    }
    if (!completed) throw new Error('The connection ended before an answer arrived. Please try again.');
  } catch (e) { loading.remove(); $('.provisional', node)?.remove(); if (e.name !== 'AbortError' && generation === state.generation) errorBox(node, e, () => send(text)); }
  finally { if (generation === state.generation) { state.busy = false; $('#send').disabled = false; state.request = null; $('#question').focus({ preventScroll: true }); } }
}
async function reset() {
  const id = state.sessionId; state.generation++; state.request?.abort(); state.sessionId = null; state.busy = false; state.selected.clear(); state.products.clear(); updateTray(); $('#send').disabled = false; $('#messages').replaceChildren(); $('#welcome').hidden = false; $('#question').value = ''; $('#question').style.height = ''; window.scrollTo(0, 0);
  if (id) try { await api('/api/session', { sessionId: id }, 'DELETE'); } catch { toast('Chat cleared here. The server copy will expire automatically.'); }
}
const actions = { services: showServices, tests: () => browse('Tests'), supplements: () => browse('Supplements'), compare: () => { toast('Choose two to four products with Compare, then open your comparison.'); browse(); }, how: () => showKnowledge('how process works testing consultation', 'How HRT works'), support: () => showKnowledge('support contact', 'HRT Support') };
$$('[data-action]').forEach(b => b.addEventListener('click', () => actions[b.dataset.action]()));
$$('[data-new],[data-home]').forEach(b => b.addEventListener('click', reset));
$$('[data-privacy]').forEach(b => b.addEventListener('click', () => $('#privacy-dialog').showModal()));
$$('.close-dialog').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
$$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) { const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } }));
$('#run-compare').addEventListener('click', showComparison); $('#clear-compare').addEventListener('click', () => { state.selected.clear(); updateTray(); });
$('#chat-form').addEventListener('submit', e => { e.preventDefault(); const input = $('#question'), text = input.value.trim(); if (!text || state.busy) return; input.value = ''; input.style.height = ''; void send(text); });
$('#question').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('#chat-form').requestSubmit(); } });
$('#question').addEventListener('input', e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px'; });
try {
  state.status = await api('/api/status'); const s = state.status;
  $('#connection-status').replaceChildren(el('span', 'status-dot'), document.createTextNode(s.aiConfigured ? 'Ready to help · HRT sources' : 'Explore HRT services and products'));
  $('#retention').textContent = s.sessionRetentionMinutes;
} catch { $('#connection-status').textContent = 'Connection unavailable — retry your action to reconnect'; }
if (document.body.classList.contains('widget')) document.addEventListener('keydown', e => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) window.parent.postMessage('hrt-guide-close', '*'); });
