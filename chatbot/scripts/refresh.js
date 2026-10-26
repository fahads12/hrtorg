const origin = process.env.APP_ORIGIN || 'http://localhost:3000';
const token = process.env.ADMIN_TOKEN || '';
if (token.length < 32) { console.error('Set a server-side ADMIN_TOKEN of at least 32 characters in .env.local first.'); process.exitCode = 1; }
else {
  try {
    const r = await fetch(`${origin}/api/admin/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: '{}' });
    if (!r.ok) throw new Error(`Refresh HTTP ${r.status}`);
    console.log((await r.json()).message);
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
