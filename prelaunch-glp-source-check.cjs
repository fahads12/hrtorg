const fs = require('fs');
const { parseHTML } = require('linkedom');
const root = 'scraps/prelaunch-2026-10-12/content/glp-source-check';
fs.mkdirSync(root, { recursive: true });
const reportPath = root + '/report.json';
const previous = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : { rows: [] };
const routes = JSON.parse(fs.readFileSync('scraps/prelaunch-2026-10-12/content/routes.json', 'utf8'));
const legacy = [
  'checklist/erectile-dysfunction-ed-symptom-checklist',
  'checklist/general-nutritional-nutrient-deficiency-symptom-checklist',
  'checklist/new-patient-health-supplement-required-intake-information',
  'checklist/weight-loss',
  'menopause-quiz',
];
const tasks = [...routes.filter(route => route.startsWith('glp-1/') && !route.includes('ozempic-vs-wegovy')).map(route => ({path: route.replace(/\/index\.html$/, ''), group: 'missing-glp'})), ...legacy.map(path => ({ path, group: 'legacy-workflow' }))];
const clean = text => String(text || '').replace(/\s+/g, ' ').trim();
function inspect(html) {
  const { document } = parseHTML(html);
  const result = {
    title: clean(document.querySelector('title')?.textContent),
    headings: [...document.querySelectorAll('h1,h2,h3')].map(element => clean(element.textContent)),
    richText: [...document.querySelectorAll('.w-richtext')].map(element => clean(element.textContent)),
    forms: [...document.querySelectorAll('form')].map(form => ({ id: form.id, action: form.getAttribute('action'), method: form.getAttribute('method'), fields: [...form.querySelectorAll('input,select,textarea')].map(field => ({ tag: field.tagName, name: field.getAttribute('name'), type: field.getAttribute('type') })) })),
    frames: [...document.querySelectorAll('iframe')].map(frame => ({ src: frame.getAttribute('src'), title: frame.getAttribute('title') })),
    assessmentEmbeds: [...document.querySelectorAll('[data-tf-widget],[data-tf-live],[data-tf-popup],.typeform-widget')].map(element => element.outerHTML),
    scripts: [...document.querySelectorAll('script')].map(script => ({ src: script.getAttribute('src'), type: script.getAttribute('type'), inlineLength: script.textContent.length, possibleAssessmentLogic: !script.getAttribute('src') && /calculateScore|totalScore|questionnaire|typeform|jotform|n8n|scoreResult|currentQuestion/i.test(script.textContent) })),
  };
  document.querySelectorAll('script,style,header,footer,nav').forEach(element => element.remove());
  result.bodyTextWithoutGlobalNav = clean(document.body?.textContent);
  result.richTextCharacters = result.richText.reduce((total, value) => total + value.length, 0);
  return result;
}
async function check(task) {
  const url = 'https://hrt.org/' + task.path;
  const filename = task.group === 'missing-glp' ? task.path.split('/').pop() + '.html' : task.path.replace(/\W/g, '_') + '.html';
  const file = root + '/' + filename;
  const old = previous.rows.find(row => row.url === url && row.status && fs.existsSync(file));
  try {
    let metadata, html;
    if (old) {
      html = fs.readFileSync(file, 'utf8');
      metadata = { finalURL: old.finalURL, status: old.status, contentType: old.contentType, fetchedAt: old.fetchedAt || previous.date, reusedSamePassCache: true };
    } else {
      const response = await fetch(url, { signal: AbortSignal.timeout(25000), redirect: 'follow' });
      html = await response.text();
      fs.writeFileSync(file, html);
      metadata = { finalURL: response.url, status: response.status, contentType: response.headers.get('content-type'), fetchedAt: new Date().toISOString(), reusedSamePassCache: false };
    }
    const row = { ...task, url, ...metadata, ...inspect(html), bytes: Buffer.byteLength(html), evidence: file, method: 'GET', liveWrites: 0 };
    console.log(JSON.stringify({path:task.path,status:row.status,finalURL:row.finalURL,title:row.title,richTextCharacters:row.richTextCharacters,bodyLength:row.bodyTextWithoutGlobalNav.length,forms:row.forms.length,frames:row.frames.length,cached:metadata.reusedSamePassCache}));
    return row;
  } catch (error) {
    return { ...task, url, error: error.message, cause: error.cause?.message, method: 'GET', liveWrites: 0 };
  }
}
(async () => {
  const rows = new Array(tasks.length);
  let index = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (index < tasks.length) {
      const i = index++;
      rows[i] = await check(tasks[i]);
    }
  }));
  fs.writeFileSync(reportPath, JSON.stringify({ date: new Date().toISOString(), maxConcurrentGETs: 6, tlsCertificateVerification: 'enabled; Node --use-system-ca', rows }, null, 2));
  console.log(JSON.stringify({ total: rows.length, reused: rows.filter(row => row.reusedSamePassCache).length, errors: rows.filter(row => row.error).length }));
})();
