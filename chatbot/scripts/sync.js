import { syncAll } from '../server/ingest.js';
try { const report = await syncAll(message => console.log(message)); console.log(JSON.stringify(report, null, 2)); if (!report.catalogComplete) process.exitCode = 1; }
catch (e) { console.error(e.message); process.exitCode = 1; }
