'use strict';

// Offline only: read the nine original exports and write inactive review copies.
// This script never imports, updates, activates, or calls an n8n workflow.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const sourceDirectory = process.argv[2] ? path.resolve(process.argv[2]) : path.dirname(__dirname);
const outputDirectory = path.join(__dirname, 'source-content', 'n8n-review', 'repairs');
const workflows = [
  ['adrenal', 'Adrenal Fatigue & Stress Typeform Assessment.json'],
  ['andropause', 'Andropause Typeform Assessment.json'],
  ['men', 'Hormone Checklist Men Typeform Assessment.json'],
  ['women', 'Hormone Checklist Women Typeform Assessment.json'],
  ['menopause', 'Menopause Typeform Assessment.json'],
  ['osteoporosis', 'Osteoporosis Typeform Assessment.json'],
  ['perimenopause', 'Perimenopause Typeform Assessment.json'],
  ['pms', 'PMS Typeform Assessment.json'],
  ['thyroid', 'Thyroid Typeform Assessment.json'],
];

const escapeHelper = [
  '// Escape only the dynamic name used in the HTML greeting.',
  'function escapePatientName(value) {',
  '  return String(value)',
  "    .replace(/&/g, '&amp;')",
  "    .replace(/</g, '&lt;')",
  "    .replace(/>/g, '&gt;')",
  `    .replace(/"/g, '&quot;')`,
  `    .replace(/'/g, '&#39;');`,
  '}',
  '',
].join('\n');

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
function node(workflow, name) {
  const matches = workflow.nodes.filter(item => item.name === name);
  assert.equal(matches.length, 1, `Expected one ${name} node`);
  return matches[0];
}
function replaceExactlyOnce(value, from, to, description) {
  assert.equal(value.split(from).length - 1, 1, `Unexpected ${description} pattern`);
  return value.replace(from, to);
}
function escapeName(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function evaluateExpression(expression, upstream) {
  assert(expression.startsWith('={{') && expression.endsWith('}}'));
  const context = vm.createContext({
    // Simulate a Gmail response with none of the assessment fields.
    $json: { id: 'offline-gmail-message', threadId: 'offline-thread' },
    $: name => ({ first: () => ({ json: upstream[name] }) }),
  });
  return new vm.Script(`(${expression.slice(3, -2).trim()})`).runInContext(context, { timeout: 1000 });
}
function renderEmail(code, patientName) {
  const fixture = {
    patientName, patientEmail: 'audit@example.invalid', mailingList: 'No, just send me the results',
    result: 1, cat1: 1, cat2: 0, cat3: 0, cat4: 0, totalScore: 1, riskScore: 1,
    rawYesCount: 1, weightedScore: 1, resultNum: 1, resultLabel: 'Offline fixture',
    resultContent: 'Offline fixture content', landingPageUrl: 'https://example.invalid/results',
  };
  const context = vm.createContext({ $input: { first: () => ({ json: fixture }) } });
  const result = new vm.Script(`(function () {\n${code}\n})()`).runInContext(context, { timeout: 1000 });
  assert.equal(result.length, 1);
  assert.equal(typeof result[0].json.htmlEmailBody, 'string');
  return result[0].json;
}

const pending = [];
for (const [assessment, filename] of workflows) {
  const sourcePath = path.join(sourceDirectory, filename);
  const sourceBytes = fs.readFileSync(sourcePath);
  const original = JSON.parse(sourceBytes.toString('utf8').replace(/^\uFEFF/, ''));
  const repaired = clone(original);
  const hormone = assessment === 'men' || assessment === 'women';
  const changes = [];

  repaired.active = false;
  for (const field of ['pinData', 'meta', 'versionId']) delete repaired[field];
  changes.push('Set active:false; removed pinData, meta (including instanceId), and versionId.');

  const success = node(repaired, 'Respond - Success');
  let response = success.parameters.responseBody;
  if (!hormone) {
    assert(response.includes('$json.'), 'Expected specialty response to use incoming Gmail JSON');
    response = response.replace(/\$json\.([A-Za-z_][A-Za-z0-9_]*)/g,
      (_, field) => `$('Calculate Scores').first().json.${field}`);
    changes.push('Read success assessment fields from Calculate Scores, retaining existing field names and values.');
  }
  response = replaceExactlyOnce(response, 'success: true,',
    'success: true,\n  accepted: true,\n  emailSent: true,', 'success response');
  success.parameters.responseBody = response;
  changes.push('Added accepted:true and emailSent:true only to the existing post-Gmail success response.');

  const email = node(repaired, 'Build HTML Email');
  const originalEmailCode = email.parameters.jsCode;
  const originalGreeting = originalEmailCode.split('\n').find(line => line.startsWith('const greeting ='));
  assert(originalGreeting, 'Expected one greeting assignment');
  const repairedGreeting = hormone
    ? replaceExactlyOnce(originalGreeting, 'startCase(d.patientName)', 'escapePatientName(startCase(d.patientName))', 'hormone greeting')
    : replaceExactlyOnce(originalGreeting, "('Dear ' + d.patientName)", "('Dear ' + escapePatientName(d.patientName))", 'specialty greeting');
  email.parameters.jsCode = replaceExactlyOnce(originalEmailCode, originalGreeting,
    escapeHelper + repairedGreeting, 'email greeting line');
  changes.push('HTML-escaped dynamic patientName in the greeting; existing name capitalization and clinical content preserved.');

  if (assessment === 'men') {
    const extra = node(repaired, 'Send an Email');
    assert.equal(extra.type, 'n8n-nodes-base.emailSend');
    assert.deepEqual(extra.parameters, { options: {} });
    repaired.nodes = repaired.nodes.filter(item => item.name !== extra.name);
    delete repaired.connections[extra.name];
    for (const connections of Object.values(repaired.connections)) {
      for (const outputs of Object.values(connections)) {
        for (let index = 0; index < outputs.length; index++) {
          outputs[index] = outputs[index].filter(target => target.node !== extra.name);
        }
      }
    }
    changes.push('Removed the incomplete extra SMTP Send an Email node and its edge from Gmail.');
  }

  // Verify retained identity/credentials, unchanged medical logic, and response ordering.
  assert.equal(repaired.id, original.id);
  assert.equal(repaired.active, false);
  assert.deepEqual(node(repaired, 'Calculate Scores'), node(original, 'Calculate Scores'));
  assert.deepEqual(node(repaired, 'Respond - Invalid Email'), node(original, 'Respond - Invalid Email'));
  for (const item of repaired.nodes) {
    assert.deepEqual(item.credentials, node(original, item.name).credentials);
    if (!['Build HTML Email', 'Respond - Success'].includes(item.name)) {
      assert.deepEqual(item, node(original, item.name));
    }
  }
  const incomingSuccess = [];
  for (const [source, connections] of Object.entries(repaired.connections)) {
    for (const outputs of Object.values(connections)) {
      for (const targets of outputs) {
        for (const target of targets) {
          assert(repaired.nodes.some(item => item.name === target.node), 'Dangling node reference');
          if (target.node === 'Respond - Success') incomingSuccess.push(source);
        }
      }
    }
  }
  assert.deepEqual(incomingSuccess, ['Send Email']);
  assert.equal(node(repaired, 'Send Email').type, 'n8n-nodes-base.gmail');
  assert(!node(repaired, 'Send Email').continueOnFail);
  assert(!node(repaired, 'Send Email').onError);
  if (assessment === 'men') assert(!repaired.nodes.some(item => item.type === 'n8n-nodes-base.emailSend'));
  // Reversing the greeting-only patch must reproduce the whole original template byte for byte.
  assert.equal(email.parameters.jsCode.replace(escapeHelper + repairedGreeting, originalGreeting), originalEmailCode);

  const scoreValues = {
    totalScore: 17, riskScore: 11, rawYesCount: 5, weightedScore: 9,
    resultNum: 2, resultLabel: 'Offline response fixture', resultContent: 'Offline response fixture content',
    landingPageUrl: 'https://example.invalid/score-results',
  };
  const buildValues = {
    result: 2, cat1: 1, cat2: 3, cat3: 0, cat4: 0,
    redirectUrl: 'https://example.invalid/redirect', landingPageUrl: 'https://example.invalid/email-results',
  };
  const responseResult = evaluateExpression(response, { 'Calculate Scores': scoreValues, 'Build HTML Email': buildValues });
  assert.equal(responseResult.success, true);
  assert.equal(responseResult.accepted, true);
  assert.equal(responseResult.emailSent, true);
  for (const [key, value] of Object.entries(responseResult)) assert.notEqual(value, undefined, `Missing response ${key}`);
  if (hormone) {
    assert.equal(responseResult.result, buildValues.result);
    assert.equal(responseResult.categoryScores.cat2, buildValues.cat2);
    assert.equal(responseResult.landingPageUrl, buildValues.landingPageUrl);
  } else {
    for (const key of Object.keys(responseResult).filter(key => key in scoreValues)) {
      assert.equal(responseResult[key], scoreValues[key]);
    }
  }

  // Normal/empty greetings must render identically; unsafe characters must stay text.
  for (const name of ['Audit Person', '']) {
    assert.equal(renderEmail(email.parameters.jsCode, name).htmlEmailBody,
      renderEmail(originalEmailCode, name).htmlEmailBody);
  }
  const unsafeName = '<b>Audit & "Test"</b> O\'Name';
  const rendered = renderEmail(email.parameters.jsCode, unsafeName).htmlEmailBody;
  const normalizedName = hormone
    ? unsafeName.toLowerCase().replace(/(^|\s|-)\S/g, character => character.toUpperCase())
    : unsafeName;
  assert(rendered.includes(escapeName(normalizedName)));
  assert(!rendered.includes(normalizedName));

  const allowedTopLevelChanges = new Set(['active', 'pinData', 'meta', 'versionId', 'nodes', 'connections']);
  for (const key of Object.keys(original)) {
    if (!allowedTopLevelChanges.has(key)) assert.deepEqual(repaired[key], original[key]);
  }
  if (assessment !== 'men') assert.deepEqual(repaired.connections, original.connections);
  assert.equal(sha256(fs.readFileSync(sourcePath)), sha256(sourceBytes), 'Original export changed');
  const outputName = `${assessment}.inactive.json`;
  const outputBytes = JSON.stringify(repaired, null, 2) + '\n';
  pending.push({
    outputName, outputBytes,
    manifest: {
      assessment, sourceFile: filename, sourceSha256: sha256(sourceBytes),
      outputFile: outputName, outputSha256: sha256(outputBytes), active: false,
      workflowIdentityRetained: true, retainedCredentialReferencesUnchanged: true,
      checks: ['Score node unchanged', 'Clinical template text unchanged', 'Original files unchanged',
        'Success follows Gmail only', 'Response fields survive Gmail-shaped input',
        'Normal and empty names render identically', 'HTML-sensitive name characters escaped'],
      changes,
    },
  });
}

// Write only after all nine copies and offline checks pass.
fs.mkdirSync(outputDirectory, { recursive: true });
for (const item of pending) fs.writeFileSync(path.join(outputDirectory, item.outputName), item.outputBytes);
fs.writeFileSync(path.join(outputDirectory, 'manifest.json'), JSON.stringify({
  purpose: 'Inactive technical repair copies for manual review only; not imported or activated.',
  verification: 'Offline only. No provider calls or network requests were made.',
  workflows: pending.map(item => item.manifest),
}, null, 2) + '\n');
console.log(`Prepared and verified ${pending.length} inactive workflow copies in source-content/n8n-review/repairs.`);
