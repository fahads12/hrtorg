/* Native local checklist wizard. State is kept in memory only. */
(() => {
  'use strict';
  const spec = window.HRT_ASSESSMENT;
  const core = window.HRTChecklistCore;
  const form = document.getElementById('hormone-assessment');
  if (!spec || !core || !form) return;
  const screen = document.getElementById('assessment-screen');
  const error = document.getElementById('assessment-error');
  const back = document.getElementById('assessment-back');
  const next = document.getElementById('assessment-next');
  const results = document.getElementById('assessment-results');
  const progress = document.getElementById('checklist-progress');
  const progressText = document.getElementById('checklist-progress-text');
  const panel = document.getElementById('checklist-panel');
  if (!screen || !error || !back || !next || !results) return;
  const contacts = (spec.contactOrder || ['first_name', 'email']).map(name => ({type: 'contact', name}));
  const steps = [...spec.steps, ...contacts, {type: 'mailing', name: 'mailing_list'}];
  let index = -1;
  let answers = {};
  let contact = {first_name: '', email: '', mailing_list: ''};
  let busy = false;
  let deliveryStatus = 'local';
  let deliveryMessage = '';
  const delivery = () => window.HRTChecklistDelivery;
  const deliveryEnabled = () => delivery()?.enabled === true && typeof delivery().submit === 'function';
  const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  function navigationLabel(button, text, direction = 'next') {
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrow.setAttribute('viewBox', '0 0 24 24');
    arrow.setAttribute('width', '18');
    arrow.setAttribute('height', '18');
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke', 'currentColor');
    arrow.setAttribute('stroke-width', '1.7');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.setAttribute('focusable', 'false');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', direction === 'back' ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6');
    arrow.append(path);
    const label = node('span', '', text);
    button.replaceChildren(...(direction === 'back' ? [arrow, label] : [label, arrow]));
  }
  const clearError = () => { error.hidden = true; error.textContent = ''; screen.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid')); };
  function showError(message, input) {
    error.textContent = message;
    error.hidden = false;
    error.tabIndex = -1;
    if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
    else error.focus();
  }
  function focusScreen() {
    const heading = screen.querySelector('h2');
    if (heading) heading.focus({preventScroll: true});
    if (panel) panel.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
  function heading(text) {
    const h = node('h2', 'assessment-title', text);
    h.tabIndex = -1;
    h.id = 'assessment-step-title';
    screen.append(h);
    return h;
  }
  function paragraph(text, className = 'assessment-description') {
    if (text) screen.append(node('p', className, text));
  }
  function makeOptions(step, choices, multiple) {
    const fieldset = node('fieldset', 'assessment-fieldset');
    const legend = node('legend', 'assessment-sr-only', step.title || 'Select an option');
    fieldset.append(legend);
    const grid = node('div', 'assessment-options' + (multiple ? ' assessment-options-multiple' : ''));
    choices.forEach((choice, optionIndex) => {
      const text = typeof choice === 'string' ? choice : choice.text;
      const label = node('label', 'assessment-option');
      const input = node('input');
      input.type = multiple ? 'checkbox' : 'radio';
      input.name = step.name;
      input.value = text;
      input.id = `assessment-option-${index}-${optionIndex}`;
      if (step.type === 'mailing') input.checked = contact.mailing_list === text;
      else input.checked = multiple ? (answers[step.name] || []).includes(text) : answers[step.name] === text;
      input.addEventListener('change', () => {
        clearError();
        if (step.type === 'mailing') contact.mailing_list = text;
        else if (multiple) answers[step.name] = [...grid.querySelectorAll('input:checked')].map(el => el.value);
        else answers[step.name] = text;
      });
      label.append(input, node('span', 'assessment-option-text', text));
      grid.append(label);
    });
    fieldset.append(grid);
    screen.append(fieldset);
  }
  function setProgress(complete = false) {
    const current = complete ? steps.length : Math.max(0, index + 1);
    if (progress) { progress.max = steps.length; progress.value = current; }
    if (progressText) progressText.textContent = complete ? 'Checklist complete' : index < 0 ? 'Ready when you are' : `Step ${current} of ${steps.length}`;
  }
  function render(moveFocus = true) {
    clearError();
    form.hidden = false;
    results.hidden = true;
    screen.replaceChildren();
    screen.classList.remove('assessment-enter');
    void screen.offsetWidth;
    screen.classList.add('assessment-enter');
    back.hidden = index < 0;
    const noSymptoms = spec.mode === 'hormone' && core.score(spec, answers).score === 0;
    navigationLabel(next, index < 0 ? 'Start the checklist' : index === steps.length - 1 ? (deliveryEnabled() && !noSymptoms ? 'Send and view summary' : 'View my summary') : 'Continue');
    navigationLabel(back, 'Back', 'back');
    const localNote = document.querySelector('.checklist-local-note');
    if (localNote) localNote.textContent = deliveryEnabled() ? 'Results stay on this site. Your answers and details are sent only when you submit.' : 'Results are shown here. Nothing is sent while online delivery is unavailable.';
    setProgress();
    if (index < 0) {
      screen.append(node('span', 'assessment-kicker', 'Your symptoms. Your next conversation.'));
      heading('Take a moment for your health.');
      const intro = Array.isArray(spec.introduction) ? spec.introduction : [spec.introduction];
      intro.filter(Boolean).forEach(text => paragraph(text));
      paragraph('Choose the answers that reflect your own experience. You can go back to review or change them.', 'assessment-hint');
      const note = node('div', 'assessment-note');
      note.append(node('strong', '', 'A starting point, not a diagnosis.'), node('p', '', 'This checklist cannot measure hormone levels or diagnose a condition. Review persistent symptoms or concerns with a healthcare professional.'));
      screen.append(note);
      paragraph(deliveryEnabled() ? 'Your information will be sent only when you choose to submit at the final step.' : 'Your answers stay on this page. Email delivery is not connected, so nothing will be submitted or emailed.', 'assessment-privacy');
    } else {
      const step = steps[index];
      screen.append(node('span', 'assessment-kicker', step.type === 'contact' || step.type === 'mailing' ? 'Your details' : spec.mode === 'hormone' ? step.sectionTitle || 'Select what applies' : `Question ${spec.steps.slice(0, index + 1).filter(s => s.type === 'single').length} of ${spec.questions?.length || spec.count}`));
      if (step.type === 'contact') {
        const email = step.name === 'email';
        heading(email ? 'What is your email address?' : 'What is your first name?');
        paragraph(deliveryEnabled() ? 'Your details are included only when you submit the completed assessment.' : 'Your details remain on this page. Nothing will be emailed while delivery is not connected.', 'assessment-hint');
        const label = node('label', 'assessment-input-label', email ? 'Email address' : 'First name');
        const input = node('input', 'assessment-text-input');
        input.id = 'assessment-contact-input';
        input.type = email ? 'email' : 'text';
        input.name = step.name;
        input.autocomplete = email ? 'email' : 'given-name';
        input.inputMode = email ? 'email' : 'text';
        input.required = true;
        input.maxLength = email ? 254 : 100;
        input.value = contact[step.name];
        input.placeholder = email ? 'name@example.com' : 'Your first name';
        input.setAttribute('aria-describedby', 'assessment-error');
        label.htmlFor = input.id;
        input.addEventListener('input', () => { contact[step.name] = input.value; clearError(); });
        screen.append(label, input);
      } else if (step.type === 'mailing') {
        heading('Would you like to be notified of new assessments and health-related posts?');
        paragraph('Choose your preference. Joining the mailing list is optional.', 'assessment-hint');
        makeOptions({...step, title: 'Mailing preference'}, spec.mailingOptions, false);
        if (!deliveryEnabled()) paragraph('This preference is kept with your local answers only. No email will be sent and you will not be subscribed.', 'assessment-privacy');
        else if (noSymptoms) paragraph('With no symptoms selected, your summary will stay on this page. No email will be requested.', 'assessment-privacy');
        else if (delivery().newsletterEnabled === false) paragraph('Your preference is included with your assessment. This form sends results emails; it does not currently subscribe you to a newsletter.', 'assessment-privacy');
      } else {
        heading(step.title);
        paragraph(step.description);
        paragraph(step.hint || (step.type === 'multiple' ? 'Select all that apply, or continue without selecting any.' : ''), 'assessment-hint');
        if (step.type === 'multiple' || step.type === 'single') makeOptions(step, step.options, step.type === 'multiple');
      }
    }
    if (moveFocus) focusScreen();
  }
  function validateCurrent() {
    if (index < 0) return true;
    const step = steps[index];
    if (step.type === 'contact') {
      const input = screen.querySelector('input');
      const value = input.value.trim();
      contact[step.name] = value;
      if (!value) { showError(step.name === 'email' ? 'Please enter your email address.' : 'Please enter your first name.', input); return false; }
      if (step.name === 'first_name' && /[<>\u0000-\u001f\u007f]/.test(value)) { showError('Please enter your first name without markup or line breaks.', input); return false; }
      if (step.name === 'email' && (!input.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) { showError('Please enter a valid email address.', input); return false; }
    }
    if (step.type === 'single' && !answers[step.name]) { showError('Please select an answer before continuing.'); return false; }
    if (step.type === 'mailing' && !contact.mailing_list) { showError('Please choose a mailing preference. You can choose not to join.'); return false; }
    return true;
  }
  function resultButton(label, handler, secondary = true) {
    const button = node('button', secondary ? 'btn btn-ghost' : 'btn btn-primary', label);
    button.type = 'button'; button.addEventListener('click', handler); return button;
  }
  function svgNode(tag, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }
  function makeScoreGauge(summary) {
    const ratio = Math.max(0, Math.min(1, summary.score / summary.max));
    const label = spec.mode === 'hormone' ? 'Factors or symptoms selected' : 'Questionnaire score';
    const gauge = node('div', 'assessment-gauge');
    gauge.setAttribute('role', 'meter');
    gauge.setAttribute('aria-label', label);
    gauge.setAttribute('aria-valuemin', '0');
    gauge.setAttribute('aria-valuemax', String(summary.max));
    gauge.setAttribute('aria-valuenow', String(summary.score));
    gauge.setAttribute('aria-valuetext', `${summary.score} out of ${summary.max}. ${summary.label}. Questionnaire summary, not a diagnosis.`);
    gauge.style.setProperty('--gauge-angle', `${ratio * 180}deg`);
    gauge.style.setProperty('--gauge-offset', String(100 * (1 - ratio)));
    const graphic = svgNode('svg', {viewBox:'0 0 280 188', width:280, height:188, 'aria-hidden':'true', focusable:'false'});
    const arc = {d:'M28 146 A112 112 0 0 1 252 146', fill:'none', 'stroke-width':18, 'stroke-linecap':'round'};
    graphic.append(svgNode('path', {...arc, class:'assessment-gauge-track'}));
    for (let tick = 0; tick <= 10; tick++) {
      const angle = Math.PI + tick / 10 * Math.PI;
      const point = radius => ({x:140 + radius * Math.cos(angle), y:146 + radius * Math.sin(angle)});
      const start = point(128), end = point(tick % 5 === 0 ? 138 : 134);
      graphic.append(svgNode('line', {x1:start.x, y1:start.y, x2:end.x, y2:end.y, class:'assessment-gauge-tick'}));
    }
    graphic.append(svgNode('path', {...arc, class:'assessment-gauge-progress', pathLength:100, 'stroke-dasharray':100, 'stroke-dashoffset':100 * (1 - ratio), opacity:ratio === 0 ? 0 : 1}));
    const needle = svgNode('g', {class:'assessment-gauge-needle', 'data-target-angle':ratio * 180});
    needle.append(svgNode('path', {d:'M140 140 L51 146 L140 152 Z'}));
    graphic.append(needle, svgNode('circle', {cx:140, cy:146, r:9, class:'assessment-gauge-pivot'}), svgNode('circle', {cx:140, cy:146, r:3, class:'assessment-gauge-pin'}));
    for (const [x, value] of [[28,0],[252,summary.max]]) {
      const mark = svgNode('text', {x,y:178,'text-anchor':'middle',class:'assessment-gauge-scale'});
      mark.textContent = value; graphic.append(mark);
    }
    const value = node('p', 'assessment-score-value');
    value.append(node('strong', '', String(summary.score)), node('span', '', ` / ${summary.max}`));
    gauge.append(graphic, value, node('p', 'assessment-gauge-caption', label));
    return gauge;
  }
  function showResults(focus = true) {
    const summary = core.score(spec, answers);
    form.hidden = true;
    results.hidden = false;
    results.replaceChildren();
    results.append(node('span', 'assessment-kicker', 'Your questionnaire summary'));
    const title = node('h2', 'assessment-title', 'A clearer picture of your answers.');
    title.id = 'assessment-result-heading'; results.append(title);
    const overview = node('div', 'assessment-result-overview');
    const interpretation = node('div', 'assessment-interpretation');
    interpretation.append(node('span', 'assessment-kicker', 'Based on your answers'), node('h3', 'assessment-result-label', summary.label), node('p', 'assessment-description', 'This is a questionnaire classification based on your answers, not a diagnosis, measured hormone level, or treatment recommendation. A healthcare professional can help put your symptoms and health history in context.'));
    overview.append(makeScoreGauge(summary), interpretation);
    results.append(overview);
    if (spec.mode === 'hormone') {
      const groups = node('dl', 'assessment-counts');
      spec.groups.forEach(group => {
        const count = summary.counts[group.name] || 0;
        const row = node('div');
        const value = node('dd', '', `${count} of ${group.options.length} selected`);
        const track = node('span', 'assessment-count-track');
        track.setAttribute('aria-hidden', 'true');
        track.style.setProperty('--count-fill', `${count / group.options.length * 100}%`);
        track.append(node('span'));
        value.append(track);
        row.append(node('dt', '', group.label), value); groups.append(row);
      });
      results.append(groups);
    }
    const deliveryNote = node('div', 'assessment-note assessment-delivery');
    deliveryNote.setAttribute('role', 'status');
    deliveryNote.setAttribute('aria-atomic', 'true');
    deliveryNote.dataset.status = deliveryStatus;
    const emailIcon = svgNode('svg', {viewBox:'0 0 24 24', width:24, height:24, fill:'none', stroke:'currentColor', 'stroke-width':1.6, 'stroke-linecap':'round', 'stroke-linejoin':'round', 'aria-hidden':'true', focusable:'false', class:'assessment-delivery-icon'});
    emailIcon.append(svgNode('path', {d:'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 0 9 6 9-6'}));
    const deliveryCopy = node('div', 'assessment-delivery-copy');
    const deliveryHeading = {'email-sent':'Results email sent',accepted:'Email not confirmed','no-symptoms':'No email requested',failed:'Email could not be sent',unconfirmed:'Email not confirmed',local:'Saved on this page'};
    deliveryCopy.append(node('strong', '', deliveryHeading[deliveryStatus] || deliveryHeading.local));
    const text = deliveryStatus === 'email-sent' ? 'Your assessment was submitted and the email service accepted your results email. Check your inbox and spam folder.' : deliveryStatus === 'accepted' ? 'Your assessment was accepted. Email delivery has not been confirmed.' : deliveryStatus === 'no-symptoms' ? 'No symptoms were selected. Your summary is available here; no assessment email was requested.' : deliveryStatus === 'failed' || deliveryStatus === 'unconfirmed' ? (deliveryMessage || 'Your assessment could not be sent. Your answers are still available here. You can try again.') : 'Your summary is available here only. Nothing has been submitted or emailed.';
    deliveryCopy.append(node('p', '', text));
    if (deliveryStatus === 'email-sent' && contact.email) deliveryCopy.append(node('p', 'assessment-delivery-recipient', `Sent to ${contact.email}`));
    if (['failed','unconfirmed'].includes(deliveryStatus) && deliveryEnabled()) deliveryCopy.append(resultButton('Try sending again', complete));
    deliveryNote.append(emailIcon, deliveryCopy);
    results.append(deliveryNote);
    const review = node('details', 'assessment-review');
    review.append(node('summary', '', 'Review your answers'));
    const list = node('dl');
    spec.steps.filter(step => step.type === 'single' || step.type === 'multiple').forEach(step => {
      const entry = node('div');
      const label = step.type === 'multiple' ? spec.groups?.find(g => g.name === step.name)?.label || step.title : step.title;
      entry.append(node('dt', '', label), node('dd', '', step.type === 'multiple' ? (answers[step.name] || []).join(', ') || 'None selected' : answers[step.name] || 'Not answered'));
      list.append(entry);
    });
    review.append(list); results.append(review);
    const ctas = node('div', 'assessment-result-actions');
    const consult = node('a', 'btn btn-primary', 'Prepare for a consultation'); consult.href = 'Consultation.html';
    const testing = node('a', 'btn btn-ghost', 'Explore lab testing'); testing.href = 'Lab Testing.html';
    ctas.append(consult, testing); results.append(ctas);
    const editing = node('div', 'assessment-edit-actions');
    editing.append(resultButton('Edit my answers', () => { index = 0; deliveryStatus = 'local'; render(); }), resultButton('Start again', () => { answers = {}; contact = {first_name: '', email: '', mailing_list: ''}; index = -1; deliveryStatus = 'local'; render(); }));
    results.append(editing);
    setProgress(true);
    if (focus) { results.focus({preventScroll: true}); if (panel) panel.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }
  }
  async function complete() {
    if (busy) return;
    if (!deliveryEnabled()) { deliveryStatus = 'local'; showResults(); return; }
    busy = true;
    const controls = [...form.querySelectorAll('button,input'), ...results.querySelectorAll('button')];
    controls.forEach(el => { el.disabled = true; });
    next.textContent = 'Sending…';
    try {
      const response = await delivery().submit({assessmentId: spec.id, payload: core.buildPayload(spec, answers, contact)});
      if (response?.localOnly === true && response.reason === 'no-symptoms') deliveryStatus = 'no-symptoms';
      else {
        if (!response || response.accepted !== true) throw new Error('Not accepted');
        deliveryStatus = response.emailSent === true ? 'email-sent' : 'accepted';
      }
      deliveryMessage = '';
    } catch (error) {
      deliveryStatus = error.uncertain === true ? 'unconfirmed' : 'failed';
      deliveryMessage = ['INVALID_EMAIL','INVALID_NAME','INVALID_PAYLOAD','UNCONFIRMED','DELIVERY_DISABLED'].includes(error.code) ? error.message : '';
    }
    finally { busy = false; controls.forEach(el => { el.disabled = false; }); showResults(); }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (busy || !validateCurrent()) return;
    if (index === steps.length - 1) { complete(); return; }
    index++; render();
  });
  back.addEventListener('click', () => { if (!busy && index >= 0) { index--; render(); } });
  render(false);
  // Keep the baseline fallback inert until the questionnaire and submit handler
  // are ready. A missing script must not leave a blank, apparently working form.
  next.disabled = false;
})();
