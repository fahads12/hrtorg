const bounded = (key, fallback, min, max) => Math.min(max, Math.max(min, Number(process.env[key]) || fallback));
export const config = {
  port: bounded('PORT', 3000, 1, 65535), host: process.env.HOST || '127.0.0.1',
  origin: process.env.APP_ORIGIN || 'http://localhost:3000',
  widgetOrigins: (process.env.WIDGET_ORIGINS || 'https://hrt.org,https://store.hrt.org').split(',').map(x => x.trim()).filter(Boolean),
  apiKey: process.env.OPENAI_API_KEY || '', model: process.env.OPENAI_MODEL || '',
  adminToken: process.env.ADMIN_TOKEN || '',
  sessionMinutes: bounded('SESSION_TTL_MINUTES', 30, 1, 120), maxSessions: bounded('MAX_SESSIONS', 500, 1, 5000),
  freshMinutes: bounded('CATALOG_FRESH_MINUTES', 15, 1, 60),
  syncHours: process.env.SYNC_INTERVAL_HOURS === '0' ? 0 : bounded('SYNC_INTERVAL_HOURS', 24, 1, 168),
  trustProxy: bounded('TRUST_PROXY_HOPS', 0, 0, 5)
};
