import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/index.js';
import { reloadData } from '../server/catalog.js';
let server, app, origin;
before(async () => { await reloadData(); app = createApp(); server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r)); origin = `http://127.0.0.1:${server.address().port}`; });
after(async () => { app.locals.close(); await new Promise(r => server.close(r)); });
const post = (path, body, extra = {}) => fetch(origin + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...extra }, body: JSON.stringify(body) });
test('status exposes counts and readiness, never secret values', async () => { const r = await fetch(origin + '/api/status'), data = await r.json(); assert.ok(data.products > 1000); assert.equal(data.aiConfigured, false); assert.ok(!JSON.stringify(data).includes('OPENAI_API_KEY')); assert.equal(r.headers.get('cache-control'), 'no-store'); });
test('missing key yields honest recoverable SSE error', async () => { const r = await post('/api/chat', { message: 'How does HRT work?' }); const text = await r.text(); assert.match(text, /AI_NOT_CONFIGURED/); assert.match(text, /event: session/); assert.ok(!text.includes('event: answer')); });
test('urgent symptoms return help without credentials or product actions', async () => { const text = await (await post('/api/chat', { message: 'Chest pain and cannot breathe' })).text(); assert.match(text, /event: answer/); assert.match(text, /local emergency number/); assert.match(text, /"products":\[\]/); });
test('unsupported questions do not receive hardcoded pretend AI answers', async () => { const text = await (await post('/api/chat', { message: 'What is your unpublished policy in Atlantis?' })).text(); assert.match(text, /AI_NOT_CONFIGURED/); });
test('health queries cannot turn direct catalog browsing into emergency shopping', async () => { const data = await (await fetch(origin + '/api/products?q=chest%20pain')).json(); assert.equal(data.urgent, true); assert.deepEqual(data.products, []); });
test('input limits, invalid roles and oversized requests are enforced', async () => {
  assert.equal((await post('/api/chat', { message: 'x'.repeat(2501) })).status, 400);
  assert.equal((await post('/api/chat', { message: 'hello', role: 'system' })).status, 400);
  assert.equal((await post('/api/chat', { message: 'x'.repeat(25000) })).status, 413);
  assert.equal((await fetch(origin + '/api/products?maxPrice=-2')).status, 400);
});
test('admin refresh is protected and cross-origin writes are rejected', async () => {
  assert.equal((await post('/api/admin/refresh', {})).status, 401);
  assert.equal((await fetch(origin + '/api/admin/report')).status, 401);
  assert.equal((await post('/api/chat', { message: 'hello' }, { Origin: 'https://attacker.example' })).status, 403);
});
test('session state is server-owned, clearable and opaque', async () => {
  const s = await (await post('/api/session/context', { productIds: ['2060545196086'] })).json(); assert.match(s.sessionId, /^[a-f0-9]{48}$/);
  const r = await fetch(origin + '/api/session', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: s.sessionId }) }); assert.equal(r.status, 204);
  const next = await (await post('/api/session/context', { sessionId: s.sessionId, productIds: [] })).json(); assert.notEqual(next.sessionId, s.sessionId);
});
test('security headers and static boundary protect configuration and raw data', async () => {
  const r = await fetch(origin + '/'); assert.match(r.headers.get('content-security-policy'), /frame-ancestors/); assert.match(r.headers.get('content-security-policy'), /object-src 'none'/);
  for (const path of ['/.env.local', '/server/config.js', '/data/catalog.json', '/package.json']) assert.equal((await fetch(origin + path)).status, 404);
});
