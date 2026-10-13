const fs = require('fs');
const root = 'scraps/prelaunch-2026-10-12/content/glp-source-check';
function extractForm(html) {
  const match = /\bform:\s*(\{\"id\":)/.exec(html);
  if (!match) return null;
  const start = match.index + match[0].length - match[1].length;
  let braces = 0, inString = false, escaped = false;
  for (let i = start; i < html.length; i++) {
    const char = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (char === '{') braces++;
    else if (char === '}' && --braces === 0) return JSON.parse(html.slice(start, i + 1));
  }
  return null;
}
(async () => {
  const tasks = [['ed', 'JZXYRv'], ['weight', 'qHRP4cxp'], ['menopause', 'LgydNw']];
  const rows = await Promise.all(tasks.map(async ([name, id]) => {
    const url = 'https://form.typeform.com/to/' + id;
    try {
      const htmlFile = root + '/' + name + '-typeform.txt';
      let html, metadata;
      if (name === 'ed' && fs.existsSync(htmlFile)) {
        html = fs.readFileSync(htmlFile, 'utf8');
        const previous = JSON.parse(fs.readFileSync(root + '/embed-source-check.json', 'utf8')).find(row => row.name === 'ed-typeform');
        metadata = { status: previous.status, finalURL: previous.finalURL, reusedSamePassCache: true };
      } else {
        const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
        html = await response.text();
        fs.writeFileSync(htmlFile, html);
        metadata = { status: response.status, finalURL: response.url, reusedSamePassCache: false };
      }
      const form = extractForm(html);
      if (form) fs.writeFileSync(root + '/typeform-' + id + '.json', JSON.stringify(form, null, 2));
      return { name, id, url, ...metadata, title: form?.title, fieldCount: form?.fields?.length, fields: form?.fields?.map(field => ({ id: field.id, ref: field.ref, title: field.title, type: field.type, required: field.validations?.required })), logicCount: form?.logic?.length, variables: form?.variables, thankyouScreens: form?.thankyou_screens, welcomeScreens: form?.welcome_screens, settings: form?.settings, method: 'GET', liveWrites: 0, schemaRecovered: Boolean(form), fullWorkflowVerified: false };
    } catch (error) { return { name, id, url, error: error.message }; }
  }));
  fs.writeFileSync(root + '/legacy-schemas-report.json', JSON.stringify({ checkedAt: new Date().toISOString(), rows }, null, 2));
  console.log(JSON.stringify(rows, null, 2));
})();
