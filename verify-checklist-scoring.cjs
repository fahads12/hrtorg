/*
 * Offline verification against the refreshed original checklist sources.
 * Executes only copied literal definitions and pure scoring functions; never
 * loads original DOM scripts, fetches a URL, or submits personal information.
 * Run after `npm run build`: node verify-checklist-scoring.cjs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const base = __dirname;
const evidence = path.join(base, 'source-content', 'checklist-refresh');
const sourceHormones = JSON.parse(fs.readFileSync(path.join(evidence, 'hormone-specs.json'), 'utf8')).assessments;
const sourceSpecialties = JSON.parse(fs.readFileSync(path.join(evidence, 'specialty-specs.json'), 'utf8'));
const core = require('./checklist-core.js');
assert.equal(typeof core.score, 'function', 'CommonJS score export');
assert.equal(typeof core.buildPayload, 'function', 'CommonJS buildPayload export');
const report = { status: 'passed', checks: [], totalScoreCases: 0, sourceMedicalValidityAssessed: false, networkRequests: 0 };
const contact = { first_name: 'Local verification', email: 'checklist-verification@example.invalid', mailing_list: 'No, just send me the results' };
const started = performance.now();

function clean(value) { return JSON.parse(JSON.stringify(value)); }
function same(actual, expected, message) { assert.deepEqual(clean(actual), clean(expected), message); }
function loadPublic(id) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(base, 'assets', 'checklists', `${id}.js`), 'utf8'), context, { timeout: 1000 });
  assert.ok(context.window.HRT_ASSESSMENT, `${id}: missing public specification`);
  return clean(context.window.HRT_ASSESSMENT);
}
function literal(script, constant) {
  const match = script.match(new RegExp(`(?:const|var|let)\\s+${constant}\\s*=\\s*(\\[[\\s\\S]*?\\]);`));
  assert.ok(match, `Missing original array ${constant}`);
  return clean(vm.runInNewContext(`(${match[1]})`, Object.create(null), { timeout: 1000 }));
}
function checkPayload(spec, answers, expected) {
  const before = JSON.stringify({ answers, contact });
  const payload = core.buildPayload(spec, answers, contact);
  same(Object.keys(payload).sort(), Object.keys(expected).sort(), `${spec.id}: exact original payload keys`);
  same(payload, expected, `${spec.id}: original flat JSON values`);
  assert.equal(JSON.stringify({ answers, contact }), before, `${spec.id}: payload builder does not mutate input`);
}
function checkResult(result, expectedScore, expectedMax, expectedLabel, context) {
  assert.equal(result.score, expectedScore, `${context}: score`);
  assert.equal(result.max, expectedMax, `${context}: maximum`);
  if (expectedLabel !== undefined) assert.equal(result.label, expectedLabel, `${context}: result label`);
}

for (const id of ['women', 'men']) {
  const spec = loadPublic(id);
  const source = sourceHormones[id];
  const sourceScript = fs.readFileSync(path.join(evidence, `${source.slug}.assessment.js`), 'utf8');
  const sourceConstants = id === 'women' ? ['Q2_OPTIONS', 'Q1A_OPTIONS', 'Q1B_OPTIONS', 'Q1C_OPTIONS'] : ['Q1_OPTIONS', 'Q2A_OPTIONS', 'Q2B_OPTIONS', 'Q2C_OPTIONS'];
  assert.equal(spec.mode, 'hormone', `${id}: scoring mode`);
  same(spec.steps.map(step => ({name:step.name,title:step.title,description:step.description,options:step.options})),
    source.screens.filter(screen => screen.type === 'checkbox-group').map(screen => ({name:screen.category,title:screen.heading,description:screen.label,options:screen.options})),
    `${id}: all original question groups, wording and options remain in source order`);
  same(spec.steps.map(step => step.sectionTitle).filter(Boolean), source.screens.filter(screen => screen.type === 'introduction').map(screen => screen.heading), `${id}: section headings are preserved alongside selectable questions`);
  same(spec.groups.map(group => group.name), ['cat1', 'cat2', 'cat3', 'cat4'], `${id}: category order`);
  for (let i = 0; i < 4; i++) same(spec.groups[i].options, literal(sourceScript, sourceConstants[i]), `${id}: exact original category ${i + 1} options`);
  const originalDetermine = vm.runInNewContext(`(${source.scoring.sourceFunction})`, Object.create(null), { timeout: 1000 });
  const limits = source.scoring.maxima;
  const max = limits.reduce((a, b) => a + b, 0);
  same(spec.resultLabels, [1, 2, 3, 4, 5].map(key => source.scoring.results[key].label), `${id}: result labels`);
  const selectedArrays = spec.groups.map(group => Array.from({ length: group.options.length + 1 }, (_, count) => group.options.slice(0, count)));
  let cases = 0;
  const categories = { none: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (let a = 0; a <= limits[0]; a++) for (let b = 0; b <= limits[1]; b++) for (let c = 0; c <= limits[2]; c++) for (let d = 0; d <= limits[3]; d++) {
    const total = a + b + c + d;
    const expectedCategory = total ? originalDetermine(a, b, c, d) : null;
    const answers = { cat1: selectedArrays[0][a], cat2: selectedArrays[1][b], cat3: selectedArrays[2][c], cat4: selectedArrays[3][d] };
    const result = core.score(spec, answers);
    checkResult(result, total, max, expectedCategory ? source.scoring.results[expectedCategory].label : undefined, `${id}/${a},${b},${c},${d}`);
    assert.equal(result.category, expectedCategory, `${id}: original category classification except corrected empty selection`);
    same(result.counts, { cat1: a, cat2: b, cat3: c, cat4: d }, `${id}: category counts`);
    if (!total) assert.ok(typeof result.label === 'string' && result.label.length, `${id}: explicit empty-selection label`);
    categories[expectedCategory || 'none']++;
    cases++;
  }
  for (const sizes of [[0, 0, 0, 0], [1, 2, 3, 4], limits]) {
    const answers = Object.fromEntries(spec.groups.map((group, i) => [group.name, group.options.slice(0, sizes[i])]));
    checkPayload(spec, answers, { ...contact, cat1: sizes[0], cat2: sizes[1], cat3: sizes[2], cat4: sizes[3] });
  }
  report.totalScoreCases += cases;
  report.checks.push({ id, options: max, scoreCases: cases, coverage: 'Every attainable category-count combination', resultDistribution: categories, payloadCases: 3, approvedSourceDifference: 'No selected symptoms yields category null instead of source category 4.' });
  process.stderr.write(`${id}: ${cases.toLocaleString()} score combinations passed.\n`);
}

const routes = {
  pms: 'pms-assessment', thyroid: 'thyroid-assessment', adrenal: 'adrenal-fatigue',
  osteoporosis: 'osteoporosis-assessment', andropause: 'andropause-assessment',
  menopause: 'menopause-assessment', perimenopause: 'perimenopause-assessment',
};
for (const [id, sourceId] of Object.entries(routes)) {
  const spec = loadPublic(id);
  const source = sourceSpecialties[sourceId];
  const originalScript = fs.readFileSync(path.join(evidence, `${sourceId}.assessment.js`), 'utf8');
  const originalQuestions = literal(originalScript, 'QUESTIONS');
  const questionShape = questions => questions.map(q => ({ name: q.name, text: q.text, protective: !!q.protective }));
  same(questionShape(spec.questions), questionShape(originalQuestions), `${id}: question text, order, payload keys, protective flags`);
  same(spec.options.map(({ text, score }) => ({ text, score })), source.options.map(({ text, score }) => ({ text, score })), `${id}: exact original answer labels and weights`);
  same(spec.results.map(({ min, max, label }) => ({ min, max, label })), source.scoring.results.map(({ min, max, label }) => ({ min, max, label })), `${id}: exact result boundaries`);
  assert.equal(spec.mode, source.scoring.mode, `${id}: source scoring mode`);
  assert.equal(spec.max, source.scoring.max, `${id}: source maximum`);
  const context = vm.createContext({ QUESTIONS: clean(originalQuestions), answers: [] });
  const originalScore = vm.runInContext(`(${source.scoring.functionSource})`, context, { timeout: 1000 });
  const answerMap = list => Object.fromEntries(spec.questions.map((q, i) => [q.name, list[i]]));
  const verifyAnswers = list => {
    context.answers = list;
    const expected = originalScore();
    const band = source.scoring.results.filter(result => expected >= result.min && expected <= result.max);
    assert.equal(band.length, 1, `${id}: exactly one source band for attainable score ${expected}`);
    checkResult(core.score(spec, answerMap(list)), expected, source.scoring.max, band[0].label, `${id}/${expected}`);
    return expected;
  };
  // Dynamic programming retains a valid answer vector for every attainable score.
  let attainable = new Map([[0, []]]);
  for (const q of spec.questions) {
    const next = new Map();
    for (const [total, list] of attainable) for (const option of source.options) {
      const points = q.protective ? (option.text === 'No' ? 1 : 0) : option.score;
      if (!next.has(total + points)) next.set(total + points, [...list, option.text]);
    }
    attainable = next;
  }
  for (const [expected, list] of attainable) assert.equal(verifyAnswers(list), expected, `${id}: original scoring agrees with attainable-score calculation`);
  const allScores = [...attainable.keys()].sort((a, b) => a - b);
  assert.equal(allScores.at(-1), source.scoring.max, `${id}: maximum is reachable`);
  let masks = 0;
  // Full yes/no combinations catch reversals and per-question mapping errors.
  // Frequency assessments use all attainable totals plus each single-question value.
  if (source.options.length === 2 && spec.questions.length <= 20) {
    const limit = 2 ** spec.questions.length;
    const answers = spec.questions.map(() => source.options[0].text);
    for (let mask = 0; mask < limit; mask++) {
      for (let i = 0; i < answers.length; i++) answers[i] = source.options[(mask >>> i) & 1].text;
      verifyAnswers(answers);
      masks++;
    }
  }
  let singleQuestionCases = 0;
  if (source.options.length > 2) {
    const zero = source.options.find(option => option.score === 0).text;
    for (let i = 0; i < spec.questions.length; i++) for (const option of source.options) {
      const answers = spec.questions.map(() => zero);
      answers[i] = option.text;
      verifyAnswers(answers);
      singleQuestionCases++;
    }
  }
  if (id === 'osteoporosis') {
    same(spec.questions.filter(q => q.protective).map(q => q.name), ['q1_exercise', 'q7_calcium'], 'Exact osteoporosis protective factors');
    assert.equal(verifyAnswers(spec.questions.map(q => q.protective ? 'Yes' : 'No')), 0, 'Protective Yes and other No yields zero risk points');
    assert.equal(verifyAnswers(spec.questions.map(q => q.protective ? 'No' : 'Yes')), 13, 'Protective No and other Yes yields 13 risk points');
  }
  const payloadAnswers = answerMap(spec.questions.map((_, i) => source.options[i % source.options.length].text));
  checkPayload(spec, payloadAnswers, { ...contact, ...payloadAnswers });
  same(Object.keys(core.buildPayload(spec, payloadAnswers, contact)).sort(), source.submission.fields.slice().sort(), `${id}: source submission key set`);
  const cases = attainable.size + masks + singleQuestionCases + (id === 'osteoporosis' ? 2 : 0);
  report.totalScoreCases += cases;
  report.checks.push({ id, questions: spec.questions.length, attainableScores: allScores, exhaustiveAnswerMasks: masks, singleQuestionCases, scoreCases: cases, payloadCases: 1, sourceNotes: source.notes });
  process.stderr.write(`${id}: ${cases.toLocaleString()} score cases passed.\n`);
}
report.elapsedSeconds = Number(((performance.now() - started) / 1000).toFixed(2));
console.log(JSON.stringify(report, null, 2));
