import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { timingSafeEqual, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { config } from './config.js';
import { reloadData, catalog, report, knowledge, knowledgeHealth, searchProducts, getProduct, compareProducts, getServices, getSupportDetails, searchKnowledge, carePathway } from './catalog.js';
import { generateAnswer } from './ai.js';
import { isUrgent, urgentMessage } from './safety.js';
import { syncAll } from './ingest.js';

export function createApp({ answer = generateAnswer, synchronize = syncAll } = {}) {
  const app = express(), sessions = new Map();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], imgSrc: ["'self'", 'https://cdn.shopify.com', 'https://store.hrt.org', 'https://cdn.prod.website-files.com'], connectSrc: ["'self'"], frameAncestors: ["'self'", ...config.widgetOrigins], objectSrc: ["'none'"], baseUri: ["'none'"], formAction: ["'self'"], upgradeInsecureRequests: config.origin.startsWith('https:') ? [] : null } }, frameguard: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/api', rateLimit({ windowMs: 60000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Please wait a minute before trying again.' } }));
  app.use('/api', (req, res, next) => {
    if (['POST', 'DELETE', 'PUT', 'PATCH'].includes(req.method)) {
      const origin = req.get('origin');
      if (origin && origin !== config.origin && !(config.host === '127.0.0.1' && [`http://127.0.0.1:${config.port}`, `http://localhost:${config.port}`].includes(origin))) return res.status(403).json({ error: 'Request origin is not allowed.' });
      if (!req.is('application/json')) return res.status(415).json({ error: 'JSON content type required.' });
    }
    next();
  });
  app.use(express.json({ limit: '20kb' }));
  const collectSessions = () => { for (const [id, s] of sessions) if (Date.now() - s.updatedAt > config.sessionMinutes * 60000 && !s.busy) sessions.delete(id); };
  const getSession = id => {
    collectSessions();
    let session = id && sessions.get(id);
    if (!session) {
      if (sessions.size >= config.maxSessions) { const e = new Error('The guide is busy. Please try again shortly.'); e.status = 503; throw e; }
      session = { id: randomBytes(24).toString('hex'), history: [], displayed: [], updatedAt: Date.now(), busy: false };
      sessions.set(session.id, session);
    }
    session.updatedAt = Date.now(); return session;
  };
  const timer = setInterval(collectSessions, 60000); timer.unref();
  app.locals.close = () => { clearInterval(timer); sessions.clear(); };
  app.get('/api/status', (req, res) => res.json({ aiConfigured: Boolean(config.apiKey && config.model), modelAccessVerified: false, products: catalog.products.length, variants: report.variants || 0, syncedAt: catalog.syncedAt, catalogComplete: report.catalogComplete || false, knowledgeEntries: knowledge.length, sessionRetentionMinutes: config.sessionMinutes, collections: [...new Set(catalog.products.flatMap(p => p.collections))].sort() }));
  const querySchema = z.object({ q: z.string().max(300).default(''), category: z.string().max(120).optional(), maxPrice: z.coerce.number().min(0).max(100000).optional(), availability: z.enum(['all', 'available', 'unavailable']).default('all'), sort: z.enum(['relevance', 'price-asc', 'price-desc']).default('relevance'), offset: z.coerce.number().int().min(0).max(10000).default(0), limit: z.coerce.number().int().min(1).max(12).default(4) });
  app.get('/api/products', async (req, res) => {
    const args = querySchema.parse(req.query);
    if (isUrgent(args.q)) return res.json({ urgent: true, message: urgentMessage, products: [], total: 0 });
    const result = searchProducts({ ...args, query: args.q });
    // Recheck visible cards, not 1,000+ records per request.
    result.products = await Promise.all(result.products.map(p => getProduct(p.id)));
    // A refresh can move products out of requested budget/availability; never present them as matches.
    result.products = result.products.filter(p => (args.maxPrice === undefined || (p.price !== null && p.price <= args.maxPrice)) && (args.availability === 'all' || p.available === (args.availability === 'available')));
    res.json(result);
  });
  app.get('/api/products/:id', async (req, res) => { const id = z.string().regex(/^\d+$/).parse(req.params.id); const p = await getProduct(id); if (!p) return res.status(404).json({ error: 'Product not found.' }); res.json(p); });
  app.post('/api/compare', async (req, res) => { const { ids } = z.object({ ids: z.array(z.string().regex(/^\d+$/)).min(2).max(4) }).strict().parse(req.body); res.json(await compareProducts(ids)); });
  app.get('/api/services', (req, res) => res.json({ services: getServices(), support: getSupportDetails() }));
  app.post('/api/care-pathway', (req, res) => {
    const args = z.object({ country: z.string().max(100), state: z.string().max(100) }).strict().parse(req.body);
    res.json(carePathway(args.country, args.state));
  });
  app.get('/api/knowledge', (req, res) => { const q = z.string().max(300).parse(req.query.q || ''); res.json({ sources: searchKnowledge(q) }); });
  app.post('/api/session/context', (req, res) => {
    const args = z.object({ sessionId: z.string().max(60).nullable().optional(), productIds: z.array(z.string().regex(/^\d+$/)).max(12), search: querySchema.optional() }).strict().parse(req.body);
    const session = getSession(args.sessionId);
    if (session.busy) return res.status(409).json({ error: 'Wait for the current answer to finish.' });
    session.displayed = args.productIds.filter(id => catalog.products.some(p => p.id === id));
    if (args.search) session.lastSearch = args.search;
    res.json({ sessionId: session.id });
  });
  app.delete('/api/session', (req, res) => { const { sessionId } = z.object({ sessionId: z.string().max(60).nullable() }).parse(req.body); if (sessionId) sessions.delete(sessionId); res.status(204).end(); });
  app.post('/api/chat', rateLimit({ windowMs: 60000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Please wait a minute before asking another question.' } }), async (req, res) => {
    const { message, sessionId } = z.object({ message: z.string().trim().min(1).max(2500), sessionId: z.string().max(60).nullable().optional() }).strict().parse(req.body);
    const session = getSession(sessionId);
    if (session.busy) return res.status(409).json({ error: 'Please wait for the current response.' });
    session.busy = true;
    const cancellation = new AbortController();
    res.on('close', () => cancellation.abort());
    res.status(200).set({ 'Content-Type': 'text/event-stream', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' }).flushHeaders();
    const emit = (event, data) => { if (!res.destroyed) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); };
    const heartbeat = setInterval(() => { if (!res.destroyed) res.write(': heartbeat\n\n'); }, 15000);
    emit('session', { sessionId: session.id });
    try {
      const result = await answer(session, message, emit, { signal: cancellation.signal });
      // SSE transports the validated answer without artificial typing delays.
      emit('answer', result);
    } catch (e) {
      const configured = e.code === 'AI_NOT_CONFIGURED';
      emit('error', { code: configured ? e.code : 'AI_UNAVAILABLE', message: configured ? e.message : 'The AI guide couldn’t complete this request. Please try again. Catalog browsing and human support are still available.' });
    } finally { session.busy = false; session.updatedAt = Date.now(); clearInterval(heartbeat); res.end(); }
  });
  const admin = (req, res, next) => {
    const incoming = req.get('authorization')?.replace(/^Bearer /, '') || '';
    if (!config.adminToken || config.adminToken.length < 32 || incoming.length !== config.adminToken.length || !timingSafeEqual(Buffer.from(incoming), Buffer.from(config.adminToken))) return res.status(401).json({ error: 'Valid administrative authentication required.' });
    next();
  };
  let syncState = { running: false, lastResult: null };
  const refresh = async () => {
    if (syncState.running) return;
    syncState.running = true;
    try { const result = await synchronize(); await reloadData(); syncState.lastResult = { completedAt: result.completedAt, failures: result.failures.length }; }
    catch { syncState.lastResult = { error: 'Refresh failed. Check source connectivity or an existing synchronization lock.' }; }
    finally { syncState.running = false; }
  };
  app.post('/api/admin/refresh', admin, (req, res) => { if (syncState.running) return res.status(409).json({ error: 'Refresh is already running.' }); void refresh(); res.status(202).json({ message: 'Refresh started. Poll the report endpoint for completion.' }); });
  app.get('/api/admin/report', admin, (req, res) => res.json({ ...syncState, activeKnowledgeEntries: knowledge.length, knowledgeHealth, report }));
  app.locals.refresh = refresh;
  app.use(express.static(fileURLToPath(new URL('../public', import.meta.url)), { dotfiles: 'deny', maxAge: '1h', index: 'index.html' }));
  app.use((req, res) => res.status(404).json({ error: 'Not found.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error instanceof z.ZodError ? 400 : error.status === 413 ? 413 : error.status || 500;
    res.status(status).json({ error: status === 400 ? 'Please check the request fields.' : status === 413 ? 'Request is too large.' : status === 500 ? 'The request could not be completed. Please retry.' : error.message });
  });
  return app;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file:///${process.argv[1].replace(/\\/g, '/')}`))) {
  await reloadData();
  const app = createApp();
  app.listen(config.port, config.host, () => console.log(`HRT AI Guide: http://${config.host}:${config.port} | ${catalog.products.length} catalog products | AI ${config.apiKey && config.model ? 'configured; account verification occurs on first request' : 'awaiting server configuration'}`));
  if (config.syncHours) { const scheduled = setInterval(() => void app.locals.refresh(), config.syncHours * 3600000); scheduled.unref(); }
}
