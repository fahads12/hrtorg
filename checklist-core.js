/* Pure questionnaire scoring and original n8n payload mapping. No network or storage. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HRTChecklistCore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function countsFor(spec, answers) {
    return Object.fromEntries(spec.groups.map(group => [group.name,
      new Set((answers[group.name] || []).filter(answer => group.options.includes(answer))).size]));
  }
  function score(spec, answers) {
    if (spec.mode === 'hormone') {
      const counts = countsFor(spec, answers);
      const {cat1:a, cat2:b, cat3:c, cat4:d} = counts;
      const total = a + b + c + d;
      const category = !total ? null : a && b && c && d ? 5 : a + b > c + d ? a > b ? 1 : 2 : c > d ? 3 : 4;
      return { score: total, max: spec.groups.reduce((n,g)=>n+g.options.length,0), category, counts,
        label: category ? spec.resultLabels[category-1] : 'No symptoms selected' };
    }
    let total = 0;
    for (const question of spec.questions) {
      const selected = spec.options.find(option => option.text === answers[question.name]);
      if (!selected) continue;
      total += spec.mode === 'protective-yes-no' && question.protective ? Number(selected.text === 'No') : selected.score;
    }
    const range = spec.results.find(result => total >= result.min && total <= result.max);
    return {score: total, max: spec.max, category: range ? spec.results.indexOf(range)+1 : null, label: range?.label || 'Checklist summary', counts: {}};
  }
  function buildPayload(spec, answers, contact) {
    const payload = {first_name: String(contact.first_name || '').trim(), email: String(contact.email || '').trim(), mailing_list: contact.mailing_list || ''};
    if (spec.mode === 'hormone') Object.assign(payload, countsFor(spec, answers));
    else for (const question of spec.questions) payload[question.name] = answers[question.name] || '';
    return payload;
  }
  return {score, buildPayload};
});
