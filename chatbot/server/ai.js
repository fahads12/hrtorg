import OpenAI from 'openai';
import { z } from 'zod';
import { config } from './config.js';
import { catalog, knowledge, searchProducts, getProduct, compareProducts, searchKnowledge, getServices, getSupportDetails, productCategories } from './catalog.js';
import { instructions, urgentMessage, isUrgent } from './safety.js';

const nullableString = z.string().max(300).nullable();
export const toolSchemas = {
  search_knowledge: z.object({ query: z.string().max(300) }).strict(),
  search_products: z.object({ query: z.string().max(300), category: nullableString, maxPrice: z.number().min(0).max(100000).nullable(), availability: z.enum(['all', 'available', 'unavailable']), sort: z.enum(['relevance', 'price-asc', 'price-desc']), offset: z.number().int().min(0).max(10000) }).strict(),
  get_product: z.object({ id: z.string().regex(/^\d+$/) }).strict(),
  compare_products: z.object({ ids: z.array(z.string().regex(/^\d+$/)).min(2).max(4) }).strict(),
  get_service: z.object({ query: z.string().max(200) }).strict(),
  get_support_details: z.object({}).strict()
};
const descriptions = {
  search_knowledge: 'Find reviewed source excerpts for service facts, FAQs, policies and shipping; each has source id and URL.',
  search_products: 'Search the product catalog, not service FAQs, for product existence, availability and matches. Use concise topic/sample keywords and category Tests, Supplements or an exact collection name; use null if unsure. Preserve explicit budget and availability constraints. Invalid filters are errors, not evidence of absence. Returns up to 4 matches, total, filters and freshness.',
  get_product: 'Get a verified product and every variant, source description, attributes and current price/availability recheck.',
  compare_products: 'Compare 2-4 verified product IDs including variants, price, collection and ingredient fields. Unknown fields are null.',
  get_service: 'Find reviewed HRT service information. Always retrieve geography with get_support_details before prescription service navigation.',
  get_support_details: 'Get verified human support contacts and telehealth geography; shipping availability is separate.'
};
function schema(value) { const result = z.toJSONSchema(value); delete result.$schema; return result; }
// Only the message string is progressively displayed; commerce data and links wait for validation.
export function partialMessage(json) {
  const start = json.match(/"message"\s*:\s*"/); if (!start) return '';
  let encoded = '', escaped = false;
  for (const ch of json.slice(start.index + start[0].length)) {
    if (ch === '"' && !escaped) break;
    encoded += ch; if (ch === '\\' && !escaped) escaped = true; else escaped = false;
  }
  for (let trim = 0; trim <= 6 && trim <= encoded.length; trim++) {
    try { return JSON.parse('"' + encoded.slice(0, encoded.length - trim) + '"').replace(/https?:\/\/\S+/gi, '[source link]'); } catch { /* A unicode escape can span chunks. */ }
  }
  return '';
}
export const tools = Object.entries(toolSchemas).map(([name, s]) => ({ type: 'function', name, description: descriptions[name], parameters: schema(s), strict: true }));
export const answerSchema = z.object({
  message: z.string().min(1).max(7000).describe('The guide response in plain text, including one relevant question when discovery would help. Answer clear requests directly.'),
  productIds: z.array(z.string()).max(4),
  sourceIds: z.array(z.string()).max(6),
  followups: z.array(z.string().max(120)).max(3).describe('Optional clickable visitor replies or requests, sent as the next user message. Never questions the guide asks the visitor or invented personal history. Use [] when no continuation is needed.'),
  urgent: z.boolean()
}).strict();
export const answerFormat = { type: 'json_schema', name: 'hrt_guide_answer', strict: true, schema: schema(answerSchema) };

// Streaming helpers add parsed values that are not accepted as API input fields.
export function responseInput(output) {
  return output.map(item => {
    if (item.type === 'function_call') {
      const { parsed_arguments, ...wireItem } = item;
      return wireItem;
    }
    if (item.type === 'message') return { ...item, content: item.content.map(content => {
      if (content.type !== 'output_text') return content;
      const { parsed, ...wireContent } = content;
      return wireContent;
    }) };
    return item;
  });
}

export async function executeTool(name, rawArgs, { productLookup = getProduct } = {}) {
  if (!Object.hasOwn(toolSchemas, name)) throw new Error('Unknown tool');
  const args = toolSchemas[name].parse(rawArgs);
  switch (name) {
    case 'search_knowledge': return { sources: searchKnowledge(args.query) };
    case 'get_service': return { sources: getServices(args.query) };
    case 'get_support_details': return { sources: getSupportDetails() };
    case 'search_products': {
      const result = searchProducts(args);
      result.products = await Promise.all(result.products.map(p => productLookup(p.id)));
      result.products = result.products.filter(p => p && (args.maxPrice === null || (p.price !== null && p.price <= args.maxPrice)) && (args.availability === 'all' || p.available === (args.availability === 'available')));
      return result;
    }
    case 'get_product': return { products: [await getProduct(args.id)].filter(Boolean) };
    case 'compare_products': return compareProducts(args.ids);
  }
}
// Explicit catalog requests must reach catalog evidence before an answer can be released.
// Broad discovery (e.g. "Explore products") and general service questions stay conversational.
export function needsCatalogLookup(message, context = {}) {
  // Personal medical decisions must never be forcibly routed through a shopping tool.
  if (/\b(?:should I|right for me|recommend|diagnos\w*|prescrib\w*|my (?:dose|dosage|lab results?)|change my|stop taking)\b/i.test(message)) return false;
  if (/\b(?:consultation|appointment|visit fee|insurance|copay|membership|treatment cost|therapy cost)\b/i.test(message) && !/\b(?:test kit|supplement|product)\b/i.test(message)) return false;
  const price = /\b(?:price|pricing|cost|how much|cheaper|less expensive|under \$?\d|below \$?\d)\b/i.test(message);
  const product = /\b(?:products?|supplements?|tests?|testing|kits?|panels?|profiles?|vitamins?|capsules?|tablets?|DHEA|magnesium|omega.?3|cortisol|thyroid)\b/i.test(message);
  const activeProductReference = Boolean(context.displayed?.length) && !context.sourceIds?.length;
  return (price && (product || activeProductReference)) || ((/\b(?:show|find|looking for|search|sell|stock|carry|available|availability|sold out)\b/i.test(message)
      || /\b(?:do|does|can|could)\s+(?:you|hrt|the store)\s+have\b/i.test(message))
    && product);
}
const operationalQuestion = text => /\b(?:HRT|portal|log.?in|sign.?in|password|shipping|delivery|return|refund|order|appointment|consultation|eligib|insurance|cost|price|payment|hours|contact|phone|email|services?|products?|tests?|kits?|supplements?)\b/i.test(text);
const admitsGap = text => /(?:can(?:not|'t|’t) (?:verify|confirm|access|check|find)|(?:don'?t|do not) have (?:verified|confirmed|access|enough)|not (?:verified|confirmed|available in (?:the|my) sources)|unable to (?:verify|confirm)|could(?: not|n't) (?:verify|confirm|find)|no verified|I don’t have)/i.test(text);
export function validateAnswer(raw, evidence, { requireEvidence = false } = {}) {
  const answer = answerSchema.parse(raw);
  if (answer.productIds.some(id => !evidence.products.has(id)) || answer.sourceIds.some(id => !evidence.sources.has(id))) throw new Error('Ungrounded response IDs');
  const capabilityLimit=/(?:can(?:not|'t|’t)|(?:am not|not) able to).{0,30}(?:place|process|accept|take|book|cancel|log in|reset|access).{0,45}(?:order|payment|card|appointment|account|password|results?)/i.test(answer.message);
  const clarificationOnly=/^[^.!;:\n]*\?$/.test(answer.message.trim()) && !/[$€£]|\d|\b(?:free|guaranteed|covered|approved|cures?)\b/i.test(answer.message);
  if (requireEvidence && !answer.sourceIds.length && !answer.productIds.length && !answer.urgent && !admitsGap(answer.message) && !capabilityLimit && !clarificationOnly) throw new Error('A factual HRT answer requires a verified citation or an explicit information gap');
  // Links are exclusively rendered from validated records, never model-generated URLs.
  answer.message = answer.message.replace(/https?:\/\/\S+/gi, '[see verified source links]');
  if (answer.urgent) { answer.productIds = []; answer.message = urgentMessage; answer.followups = []; }
  return answer;
}
export function sourceForDisplay(source) {
  const target = source.displayUrl || source.action?.url;
  if (!target) return source;
  try {
    const u = new URL(target);
    if (u.protocol !== 'https:' || !['hrt.org','www.hrt.org','store.hrt.org','portal.hrt.org'].includes(u.hostname) || u.username || u.password || (u.port && u.port !== '443')) return source;
    return { ...source, sourceUrl: source.url, url: u.href, title: source.action?.title || source.title };
  } catch { return source; }
}
function sourceForModel(source) {
  // Review anchors remain on disk for audit; don't reintroduce excluded marketing via evidence fields.
  const {id,type,title,url,text,tags,links,action,conflict,verifiedAt,freshness,sourceStatus,verificationLimit}=source;
  return {id,type,title,url,text,tags,links,action,conflict,verifiedAt,freshness,sourceStatus,verificationLimit};
}
export function retrievalContext(session, message) {
  const displayed = (session.displayed || []).map(id => catalog.products.find(p => p.id === id)).filter(Boolean).slice(0, 4).map(p => ({ id:p.id, name:p.name, url:p.url }));
  const prior = (session.sourceIds || []).map(id => knowledge.find(s => s.id === id)).filter(Boolean);
  const reference = /\b(?:it|its|that|those|these|this|them|second|first|third|cheaper|what about|how much|and (?:for|in))\b/i.test(message);
  const explicitTopic = /\b(?:shipping|refund|returns?|insurance|portal|log.?in|password|appointment|consultation|ordering|order status|privacy|contact)\b/i.test(message);
  const followup = reference || (!explicitTopic && message.trim().split(/\s+/).length <= 5);
  const query = followup && session.lastTopic ? `${session.lastTopic} ${message}` : message;
  const relevant = searchKnowledge(query, 6);
  const sources = [...new Map([...relevant, ...(followup ? prior : [])].map(s => [s.id,s])).values()].slice(0, 8);
  return { displayed, sources, query, followup };
}
let modelCheck = null;
export async function verifyConfiguredModel(client) {
  if (!config.apiKey || !config.model) { const e = new Error('Live chat is temporarily unavailable. You can still browse products, compare listings and explore HRT services, or use Contact HRT for help.'); e.status = 503; e.code = 'AI_NOT_CONFIGURED'; throw e; }
  if (!modelCheck || Date.now() - modelCheck.at > 3600000) {
    const model = await client.models.retrieve(config.model);
    if (!model?.id || model.id !== config.model) throw new Error('The configured model could not be verified in this account.');
    modelCheck = { at: Date.now(), id: model.id };
  }
}
export async function generateAnswer(session, message, emit, { client: injectedClient, executor = executeTool, productLookup = getProduct, skipVerify = false, signal } = {}) {
  if (isUrgent(message)) {
    session.history = [...(session.history || []), {role:'user',content:message}, {role:'assistant',content:urgentMessage}].slice(-12);
    session.displayed = []; session.lastSearch = null; session.sourceIds = []; session.lastTopic = '';
    return { message: urgentMessage, products: [], sources: [], followups: [], urgent: true };
  }
  if (!injectedClient && (!config.apiKey || !config.model)) await verifyConfiguredModel();
  const client = injectedClient || new OpenAI({ apiKey: config.apiKey, timeout: 45000, maxRetries: 1 });
  if (!skipVerify) await verifyConfiguredModel(client);
  const evidence = { products: new Map(), sources: new Map() };
  const retrieved = retrievalContext(session, message);
  const context = { displayedProductIds: session.displayed || [], displayedProducts: retrieved.displayed, lastSearch: session.lastSearch || null, previousSourceIds: session.sourceIds || [] };
  const input = [...(session.history || []).slice(-12), { role: 'user', content: JSON.stringify({ message, interfaceContext: context }) }];
  // Always fetch relevant excerpts, but never dump the entire knowledge base/catalog.
  const initial = retrieved.sources;
  initial.forEach(s => evidence.sources.set(s.id, s));
  input.push({ role: 'user', content: JSON.stringify({ untrustedRetrievedExcerpts: initial.map(sourceForModel) }) });
  let lastSearch = null;
  const catalogRequired = needsCatalogLookup(message, session);
  let validationRetries = 0;
  for (let round = 0; round < 6; round++) {
    emit('status', { message: round ? 'Checking the source details…' : 'Looking into your question…' });
    const stream = client.responses.stream({ model: config.model, instructions, input, tools, parallel_tool_calls: false, text: { format: answerFormat }, max_output_tokens: 3500, store: false, ...(catalogRequired && !lastSearch ? { tool_choice: { type: 'function', name: 'search_products' } } : {}) }, { signal });
    // Buffer prose as well as cards: rejected or incomplete model text must never reach visitors.
    const response = await stream.finalResponse();
    if (response.status && response.status !== 'completed') throw new Error('The AI response was incomplete. Please retry.');
    const calls = response.output.filter(item => item.type === 'function_call');
    if (calls.length > 6) throw new Error('Too many tool requests');
    if (calls.length) {
      input.push(...responseInput(response.output));
      for (const call of calls.slice(0, 6)) {
        let result;
        try {
          result = await executor(call.name, JSON.parse(call.arguments));
          (result.products || []).forEach(p => evidence.products.set(p.id, p));
          (result.sources || []).forEach(s => evidence.sources.set(s.id, s));
          if (call.name === 'search_products' && result.filters && !result.error) lastSearch = result;
        } catch (error) {
          result = error.code === 'INVALID_CATALOG_CATEGORY'
            ? { error: error.message, code: error.code, allowedCategories: productCategories(), retryRequired: true }
            : { error: 'This source lookup could not be completed. Do not guess; offer support or retry.' };
        }
        // Keep relevant specs, not entire catalog or oversized descriptions.
        const bounded = { ...result, sources: result.sources?.map(sourceForModel), products: result.products?.map(p => ({ ...p, description: p.description.slice(0, 7000), specifications: p.specifications.slice(0, 25) })) };
        input.push({ type: 'function_call_output', call_id: call.call_id, output: JSON.stringify(bounded) });
      }
      continue;
    }
    if (catalogRequired && !lastSearch) throw new Error('A catalog lookup is required before answering this product request. Please retry.');
    const output = response.output_text || response.output.flatMap(o => o.content || []).filter(c => c.type === 'output_text').map(c => c.text).join('');
    let answer;
    try { answer = validateAnswer(JSON.parse(output), evidence, {requireEvidence: operationalQuestion(message)}); }
    catch (error) {
      if (validationRetries++ >= 1) throw error;
      input.push({role:'user',content:JSON.stringify({answerValidationError:'The proposed answer failed citation/schema validation. Return a corrected answer using only verified IDs, retrieve needed evidence, or clearly state the information gap. Do not invent a source.',verifiedSourceIds:[...evidence.sources.keys()],verifiedProductIds:[...evidence.products.keys()]})});
      continue;
    }
    const products = answer.urgent ? [] : await Promise.all(answer.productIds.map(id => productLookup(id)));
    const sources = answer.sourceIds.map(id => sourceForDisplay(evidence.sources.get(id)));
    emit('text', {text:answer.message});
    session.history ||= [];
    session.history.push({ role: 'user', content: message }, { role: 'assistant', content: answer.message });
    session.history = session.history.slice(-12);
    if (answer.urgent || answer.productIds.length) session.displayed = answer.productIds;
    if (lastSearch) session.lastSearch = lastSearch.filters;
    session.sourceIds = answer.sourceIds;
    if (!retrieved.followup || !session.lastTopic) session.lastTopic = message;
    if (answer.urgent) { session.displayed = []; session.lastSearch = null; session.sourceIds = []; session.lastTopic = ''; }
    return { ...answer, products: products.filter(Boolean), sources, search: lastSearch ? { ...lastSearch, products: undefined } : null };
  }
  throw new Error('The guide could not finish its source checks. Please try a more specific question.');
}
