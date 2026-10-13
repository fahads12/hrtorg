// Offline extraction only. No original JavaScript, tracking code, or webhook runs.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const { chromium } = require('playwright');
const root = __dirname;
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
const normalized = s => s.replace(/\r\n/g, '\n').trim();
const evaluateLiteral = literal => JSON.parse(JSON.stringify(vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 })));
function literal(script, name) {
  const expression = script.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`));
  if (!expression) throw new Error(`Missing source constant ${name}`);
  return evaluateLiteral(expression[1]);
}
function scoring(script) {
  return script.match(/function determineResult\(cat1, cat2, cat3, cat4\) \{[\s\S]*?\n  \}/)[0];
}
function results(script) {
  return evaluateLiteral(script.match(/const RESULTS = ([\s\S]*?);\s*const r = RESULTS\[result\]/)[1]);
}
const groups = {
  women: [
    { screen: 'q1a', category: 'cat2', label: 'Reproductive & Hormonal', constant: 'Q1A_OPTIONS' },
    { screen: 'q1b', category: 'cat3', label: 'Metabolic & Physical', constant: 'Q1B_OPTIONS' },
    { screen: 'q1c', category: 'cat4', label: 'Cardiovascular', constant: 'Q1C_OPTIONS' },
    { screen: 'q2', category: 'cat1', label: 'Psychological', constant: 'Q2_OPTIONS' },
  ],
  men: [
    { screen: 'q1', category: 'cat1', label: 'Psychological', constant: 'Q1_OPTIONS' },
    { screen: 'q2a', category: 'cat2', label: 'Sexual & Urinary', constant: 'Q2A_OPTIONS' },
    { screen: 'q2b', category: 'cat3', label: 'Metabolic & Physical', constant: 'Q2B_OPTIONS' },
    { screen: 'q2c', category: 'cat4', label: 'Cardiovascular', constant: 'Q2C_OPTIONS' },
  ],
};
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.route('**/*', request => request.abort());
  const specs = { schemaVersion: 1, assessments: {} };
  const provenance = { reviewedOn: '2026-10-12', retrieval: 'Current public page HTML fetched by checklist_source_inventory; sources are saved alongside this file.', liveSubmissions: 0, assessments: {} };
  for (const gender of ['women', 'men']) {
    const slug = gender === 'women' ? 'hormone-symptom-checklist-for-women-female-hormone-imbalance-test' : 'hormone-symptom-checklist-men';
    const script = fs.readFileSync(path.join(root, `${slug}.assessment.js`), 'utf8');
    const html = fs.readFileSync(path.join(root, `${slug}.html`), 'utf8');
    const archive = fs.readFileSync(path.join(root, `../recovery/${gender}-assessment.js`), 'utf8');
    await page.setContent(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''));
    const markup = await page.locator('[id^="screen-"]').evaluateAll(elements => elements.map(el => {
      const text = selector => el.querySelector(selector)?.textContent.trim() || '';
      const input = el.querySelector('input');
      return {
        id: el.id.replace('screen-', ''),
        heading: text('h1,h2'),
        number: text('.q-num'),
        hint: text('.q-hint'),
        paragraphs: Array.from(el.querySelectorAll(':scope > .landing-page > p, :scope > .intro-content > p')).map(p => p.textContent.trim()),
        buttonText: text('button'),
        input: input ? { type: input.type, placeholder: input.placeholder, autocomplete: input.autocomplete, validationMessage: text('.input-error') } : null,
        image: el.querySelector('img') ? { src: el.querySelector('img').getAttribute('src'), alt: el.querySelector('img').alt } : null,
        resultSubtitle: text('.results-subtitle'),
        categoryLabels: Array.from(el.querySelectorAll('.cat-cell-label')).map(e => e.textContent.trim()),
        resultSectionHeadings: Array.from(el.querySelectorAll('.results-section-title')).map(e => e.textContent.trim()),
        originalSuccessCopy: text('.results-email-note span'),
        actions: Array.from(el.querySelectorAll('.results-cta a,.results-cta button')).map(a => ({ label: a.textContent.trim(), href: a.getAttribute('href') })),
      };
    }));
    const order = literal(script, 'SCREEN_ORDER');
    const parsedGroups = groups[gender].map(group => ({ ...group, options: literal(script, group.constant) }));
    const sourceFunction = scoring(script);
    const determine = vm.runInNewContext(`(${sourceFunction})`, Object.create(null), { timeout: 1000 });
    const max = ['cat1', 'cat2', 'cat3', 'cat4'].map(cat => parsedGroups.find(group => group.category === cat).options.length);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const archiveDetermine = vm.runInNewContext(`(${scoring(archive)})`, Object.create(null), { timeout: 1000 });
    let count = 0;
    let archivedScoreMismatches = 0;
    for (let a = 0; a <= max[0]; a++) for (let b = 0; b <= max[1]; b++) for (let c = 0; c <= max[2]; c++) for (let d = 0; d <= max[3]; d++) {
      const category = determine(a, b, c, d);
      if (!Number.isInteger(category) || category < 1 || category > 5) throw new Error('Invalid original category');
      distribution[category]++;
      if (category !== archiveDetermine(a, b, c, d)) archivedScoreMismatches++;
      count++;
    }
    const introductory = markup[0];
    const complete = markup.find(screen => screen.id === 'complete');
    specs.assessments[gender] = {
      id: gender,
      slug,
      originalUrl: `https://hrt.org/checklist/${slug}`,
      title: introductory.heading,
      intro: { screenId: introductory.id, paragraphs: introductory.paragraphs, buttonText: introductory.buttonText, originalImage: introductory.image },
      screenOrder: order,
      screens: order.map(id => {
        const screen = markup.find(item => item.id === id);
        const group = parsedGroups.find(item => item.screen === id);
        return { id, type: group ? 'checkbox-group' : id === 'mailing' ? 'radio-group' : screen.input ? 'text-input' : 'introduction', heading: screen.heading, number: screen.number, hint: screen.hint, buttonText: screen.buttonText, ...(group ? { category: group.category, label: group.label, options: group.options, required: false } : {}), ...(screen.input ? { input: screen.input, required: true } : {}), ...(id === 'mailing' ? { options: literal(script, 'MAILING_OPTIONS'), required: true, default: null } : {}) };
      }),
      scoring: { method: 'Count selected unique options per category, then apply source determineResult.', categoryOrder: ['cat1', 'cat2', 'cat3', 'cat4'], categoryLabels: complete.categoryLabels, maxima: max, sourceFunction, results: results(script), zeroSelectionSourceResult: 4 },
      resultsScreen: { title: complete.heading, subtitle: complete.resultSubtitle, sectionHeadings: complete.resultSectionHeadings, originalSuccessCopy: complete.originalSuccessCopy, actions: complete.actions },
      originalIntegration: {
        transport: 'POST JSON',
        webhookUrl: script.match(/const WEBHOOK_URL = '([^']+)'/)[1],
        payload: { first_name: 'Trimmed first name', email: 'Trimmed validated email', mailing_list: 'Exact selected mailing-choice text', cat1: 'Psychological selected count', cat2: gender === 'women' ? 'Reproductive & hormonal selected count' : 'Sexual & urinary / energy selected count', cat3: 'Metabolic & physical selected count', cat4: 'Cardiovascular & chronic disease selected count' },
        noRawAnswersSent: true,
        sourceDeliveryBehavior: 'Starts fetch without awaiting success, shows local result immediately, and claims email was sent even if fetch fails. Do not reproduce that unverified delivery claim.',
        enabledLocally: false,
        dependency: 'User-provided n8n workflow export and confirmed destination/response contract before enabling live delivery.',
      },
    };
    const caseInputs = [[0,0,0,0],[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1],[1,1,1,1],[1,1,0,0],[0,0,1,1],[1,0,1,0],max];
    provenance.assessments[gender] = {
      url: specs.assessments[gender].originalUrl,
      savedHtml: `${slug}.html`,
      savedScript: `${slug}.assessment.js`,
      htmlSha256: hash(html),
      scriptSha256: hash(script),
      totalOptions: parsedGroups.reduce((sum, group) => sum + group.options.length, 0),
      scoreMapping: parsedGroups.map(group => ({ screen: group.screen, category: group.category, options: group.options.length })),
      archiveComparison: { arraysIdentical: parsedGroups.every(group => JSON.stringify(group.options) === JSON.stringify(literal(archive, group.constant))), mailingOptionsIdentical: JSON.stringify(literal(script, 'MAILING_OPTIONS')) === JSON.stringify(literal(archive, 'MAILING_OPTIONS')), screenOrderIdentical: JSON.stringify(order) === JSON.stringify(literal(archive, 'SCREEN_ORDER')), resultDefinitionsIdentical: JSON.stringify(results(script)) === JSON.stringify(results(archive)), scoringFunctionIdenticalAfterLineEndingNormalization: normalized(sourceFunction) === normalized(scoring(archive)), rawScriptIdentical: script === archive, scriptIdenticalAfterLineEndingNormalization: normalized(script) === normalized(archive), archivedScoreMismatches },
      exhaustiveScoreCheck: { scoreRanges: max.map(value => [0, value]), combinationsChecked: count, resultDistribution: distribution, allResultsInRange: true, cases: caseInputs.map(scores => ({ scores, result: determine(...scores) })) },
      concerns: [
        'All-zero answer counts return Category 4 (Cardiovascular & Chronic Disease Risk Dominant). This is an original logic anomaly, not a medically valid result for selecting no symptoms. Root should preserve evidence and explicitly handle a no-selection result pending workflow approval.',
        'The source labels result 5 whenever every category has at least one selection, regardless of relative severity. The source counts symptoms only; it does not weight severity or duration.',
        'Ties select the latter side: equal category-pair sums choose cat3/cat4; within the first pair equal cat1/cat2 chooses 2, within the second pair equal cat3/cat4 chooses 4.',
        'The source result advice is educational source copy, not a verified diagnosis. Free-consultation destination/offer and n8n result-delivery wording require alignment with available local care flow.',
      ],
    };
  }
  await browser.close();
  fs.writeFileSync(path.join(root, 'hormone-specs.json'), JSON.stringify(specs, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'hormone-provenance.json'), JSON.stringify(provenance, null, 2) + '\n');
  console.log(JSON.stringify(Object.fromEntries(Object.entries(provenance.assessments).map(([id, item]) => [id, { totalOptions: item.totalOptions, archive: item.archiveComparison, exhaustive: item.exhaustiveScoreCheck }])) , null, 2));
})();
