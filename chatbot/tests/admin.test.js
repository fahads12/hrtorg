import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/index.js';
import { config } from '../server/config.js';
test('authenticated manual refresh runs, reports status and reloads data', async () => {
  config.adminToken = 'test-only-token-'.repeat(4); let count = 0;
  const app = createApp({ synchronize: async () => { count++; return { completedAt: 'test-success', failures: [] }; } });
  const server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const auth = { Authorization: `Bearer ${config.adminToken}` };
    const r = await fetch(url + '/api/admin/refresh', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(r.status, 202);
    for (let i = 0; i < 20; i++) { const s = await (await fetch(url + '/api/admin/report', { headers: auth })).json(); if (!s.running) { assert.equal(s.lastResult.completedAt, 'test-success'); break; } await new Promise(r => setTimeout(r, 20)); }
    assert.equal(count, 1);
    assert.equal((await fetch(url + '/api/admin/report', { headers: { Authorization: 'Bearer wrong' } })).status, 401);
  } finally { app.locals.close(); await new Promise(r => server.close(r)); config.adminToken = ''; }
});
