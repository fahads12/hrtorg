import test from 'node:test';
import assert from 'node:assert/strict';
import { reloadData, searchProducts, getProduct } from '../server/catalog.js';
import { executeTool, generateAnswer, needsCatalogLookup } from '../server/ai.js';

await reloadData();
const screenshotQuestion = 'What blood spot tests available, I am looking for the thyroid profile';
const eliteId = '2259228098614';
const filters = { query: 'blood spot thyroid profile', category: 'Tests', maxPrice: null, availability: 'available', sort: 'relevance', offset: 0 };
const localProduct = id => getProduct(id, false);

test('screenshot question and sample-name variants find the existing blood spot thyroid profile', () => {
  for (const query of [screenshotQuestion, 'blood spot thyroid profile', 'bloodspot thyroid profile', 'blood-spot thyroids']) {
    const result = searchProducts({ ...filters, query, limit: 12 });
    assert.ok(result.products.some(p => p.id === eliteId), query);
    assert.ok(result.products.every(p => p.category === 'Tests' && p.available), query);
    assert.ok(result.products.every(p => /thyroid/i.test(`${p.name} ${p.description}`)), query);
    assert.ok(result.products.every(p => /blood[\s-]*spot/i.test(`${p.name} ${p.sampleType} ${p.description}`)), query);
  }
});

test('category spelling is normalized and invalid categories cannot masquerade as an empty catalog', () => {
  for (const category of ['tests', 'Test', ' blood-spot testing ', 'bloodspot']) {
    assert.ok(searchProducts({ ...filters, category, limit: 12 }).products.some(p => p.id === eliteId), category);
  }
  assert.throws(() => searchProducts({ ...filters, category: 'Thyroid Profiles' }), error => error.code === 'INVALID_CATALOG_CATEGORY' && error.status === 400);
});

test('specific topic searches do not count unrelated partial matches or relax budget/stock constraints', () => {
  assert.equal(searchProducts({ ...filters, query: 'blood spot zzzz-no-such-topic' }).total, 0);
  const result = searchProducts({ ...filters, maxPrice: 200, availability: 'unavailable', limit: 12 });
  assert.ok(result.products.every(p => p.available === false && p.price !== null && p.price <= 200));
  assert.deepEqual(result.filters, { query: filters.query, category: 'Tests', maxPrice: 200, availability: 'unavailable', sort: 'relevance' });
});

test('direct availability questions require catalog evidence while discovery and service questions remain open', () => {
  for (const message of [screenshotQuestion, 'What thyroid test available', 'Do you carry thyroid test kits?', 'Show me other thyroid tests']) assert.equal(needsCatalogLookup(message), true, message);
  for (const message of ['Hi', 'Explore products', 'I have been tired lately', 'I have fatigue; should I get tests?', 'How does HRT work?', 'How does lab testing work?']) assert.equal(needsCatalogLookup(message), false, message);
});

test('catalog requests retry invalid filters and ground the first answer in the real thyroid record', async () => {
  const session = { history: [], displayed: [] };
  let rounds = 0;
  const client = { responses: { stream(request) {
    rounds++;
    assert.equal(request.store, false);
    if (rounds <= 2) {
      assert.deepEqual(request.tool_choice, { type: 'function', name: 'search_products' });
      if (rounds === 2) {
        const error = JSON.parse(request.input.find(i => i.type === 'function_call_output').output);
        assert.equal(error.code, 'INVALID_CATALOG_CATEGORY');
        assert.equal(error.retryRequired, true);
        assert.ok(error.allowedCategories.includes('Tests'));
        assert.equal(Object.hasOwn(error, 'total'), false);
      }
      const args = { ...filters, category: rounds === 1 ? 'Thyroid Profiles' : 'Tests' };
      return { finalResponse: async () => ({ status: 'completed', output: [{ type: 'function_call', name: 'search_products', arguments: JSON.stringify(args), call_id: `search${rounds}` }] }) };
    }
    assert.equal(request.tool_choice, undefined);
    const result = JSON.parse(request.input.filter(i => i.type === 'function_call_output').at(-1).output);
    assert.ok(result.products.some(p => p.id === eliteId));
    assert.ok(result.total > 0);
    return { finalResponse: async () => ({ status: 'completed', output: [], output_text: JSON.stringify({ message: 'I found the Elite Thyroid Profile Blood Spot listing. Current stock still needs a live recheck.', productIds: [eliteId], sourceIds: [], followups: [], urgent: false }) }) };
  } } };
  const result = await generateAnswer(session, screenshotQuestion, () => {}, {
    client, skipVerify: true, productLookup: localProduct,
    executor: (name, args) => executeTool(name, args, { productLookup: localProduct })
  });
  assert.equal(rounds, 3);
  assert.equal(result.products[0].id, eliteId);
  assert.deepEqual(session.displayed, [eliteId]);
  assert.deepEqual(session.lastSearch, { query: filters.query, category: 'Tests', maxPrice: null, availability: 'available', sort: 'relevance' });
});

test('an answer cannot bypass a required catalog lookup', async () => {
  const client = { responses: { stream: () => ({ finalResponse: async () => ({ status: 'completed', output: [], output_text: JSON.stringify({ message: 'No thyroid products exist.', productIds: [], sourceIds: [], followups: [], urgent: false }) }) }) } };
  await assert.rejects(() => generateAnswer({ history: [], displayed: [] }, screenshotQuestion, () => {}, { client, skipVerify: true }), /catalog lookup is required/);
});
