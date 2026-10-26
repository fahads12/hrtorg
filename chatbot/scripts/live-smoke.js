// Explicit, low-cost live check. Never run automatically or from the test suite.
import OpenAI from 'openai';
import { createApp } from '../server/index.js';
import { generateAnswer } from '../server/ai.js';
import { reloadData } from '../server/catalog.js';
await reloadData();
if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) throw new Error('Set the server key and account-verified model first.');
const real = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0, timeout: 25000 });
let calls = 0;
const usage = [];
const client = { models: real.models, responses: { stream(request, options) {
  if (++calls > 2) throw new Error('Low-cost test stopped at the two-call limit.');
  const stream = real.responses.stream({ ...request, max_output_tokens: 256, reasoning: { effort: 'none' }, tool_choice: calls === 1 ? { type: 'function', name: 'get_support_details' } : 'none' }, options);
  const final = stream.finalResponse.bind(stream);
  stream.finalResponse = async () => {
    try {
      const r = await final();
      usage.push({ input_tokens: r.usage?.input_tokens, output_tokens: r.usage?.output_tokens, cached_input_tokens: r.usage?.input_tokens_details?.cached_tokens || 0, status: r.status });
      return r;
    } catch (e) {
      console.log(JSON.stringify({ providerError: { status: e.status || null, code: e.code || null, type: e.type || null, param: e.param || e.error?.param || null } }));
      throw e;
    }
  };
  return stream;
} } };
const app = createApp({ answer: (session, message, emit, options) => generateAnswer(session, message, emit, { ...options, client }) });
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
try {
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'How can I contact HRT support? Please answer in one sentence.' }) });
  const body = await response.text();
  const frames = body.split('\n\n').map(f => ({ event: f.match(/^event: (.+)$/m)?.[1], data: f.match(/^data: (.+)$/m)?.[1] })).filter(f => f.data).map(f => ({ ...f, data: JSON.parse(f.data) }));
  const answer = frames.find(f => f.event === 'answer')?.data;
  const error = frames.find(f => f.event === 'error')?.data;
  console.log(JSON.stringify({ result: answer ? 'PASS' : 'FAIL', model: process.env.OPENAI_MODEL, apiCalls: calls, limits: { maxCalls: 2, maxOutputTokensPerCall: 256, reasoning: 'none', retries: 0 }, streamedText: frames.some(f => f.event === 'text'), usage, answer: answer?.message, verifiedSources: answer?.sources?.map(s => ({ id: s.id, url: s.url })), error }, null, 2));
  if (!answer) process.exitCode = 1;
} finally { app.locals.close(); await new Promise(resolve => server.close(resolve)); }
