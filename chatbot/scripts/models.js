import OpenAI from 'openai';
if (!process.env.OPENAI_API_KEY) { console.error('Add OPENAI_API_KEY to the ignored server-side .env.local file first. No key is printed.'); process.exitCode = 1; }
else {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const models = await client.models.list();
    const luna = models.data.filter(m => /luna/i.test(m.id)).map(m => m.id);
    console.log('Luna model IDs available to this account:', luna.length ? luna.join(', ') : 'None returned. Do not substitute another model.');
    if (process.env.OPENAI_MODEL) { const m = await client.models.retrieve(process.env.OPENAI_MODEL); console.log('Configured model verified:', m.id); }
    console.log('Official documentation identifies gpt-6-luna. Select only an account-verified identifier in OPENAI_MODEL. A live Responses call is still required to verify billing and capability.');
  } catch (e) { console.error('Model verification failed. Check account permissions and connectivity. HTTP status:', e.status || 'unavailable'); process.exitCode = 1; }
}
