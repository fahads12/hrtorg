
  const WEBHOOK_URL = 'https://vmi3206755.contaboserver.net/webhook/adrenal-typeform-submit';
  const QUESTIONS = [
    { name: 'q1_fatigue',        text: 'Do you feel fatigued or exhausted throughout the day?' },
    { name: 'q2_irritability',   text: 'Do you feel irritable, or unable to control your temper?' },
    { name: 'q3_anxious',        text: 'Do you feel nervous or anxious?' },
    { name: 'q4_sleep',          text: 'Do you have difficulty falling and staying asleep?' },
    { name: 'q5_energy_crashes', text: 'Do you experience energy crashes, and feel tired especially in the afternoon?' }
  ];
  const FREQUENCY_OPTIONS = [
    { letter: 'A', text: 'Never',        score: 0 },
    { letter: 'B', text: 'Occasionally', score: 2 },
    { letter: 'C', text: 'Frequently',   score: 5 },
    { letter: 'D', text: 'Constantly',   score: 8 }
  ];
  const MAILING_OPTIONS = [
    { letter: 'A', text: 'Yes, add me to your mailing list' },
    { letter: 'B', text: 'No, just send me the results' }
  ];

  let currentQIdx = 0, currentScreen = 'intro';
  let answers = QUESTIONS.map(() => null);
  let userName = '', userEmail = '', mailingChoice = '', isSubmitting = false;

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const t = document.getElementById('screen-' + name);
    if (t) t.classList.add('active');
    currentScreen = name;
    const showNav = ['question','name','email','mailing'].includes(name);
    document.getElementById('bottomNav').style.display = showNav ? 'flex' : 'none';
    document.getElementById('progress').style.display  = showNav ? 'block' : 'none';
    document.getElementById('nav-up').disabled = (name === 'question' && currentQIdx === 0) || name === 'intro';
    document.getElementById('nav-down').disabled = (name === 'mailing');
    updateProgress();
  }

  function updateProgress() {
    const TOTAL = QUESTIONS.length + 3;
    let step = 0;
    if      (currentScreen === 'question')                      step = currentQIdx;
    else if (currentScreen === 'name')                          step = QUESTIONS.length;
    else if (currentScreen === 'email')                         step = QUESTIONS.length + 1;
    else if (currentScreen === 'mailing')                       step = QUESTIONS.length + 2;
    else if (['submitting','complete'].includes(currentScreen)) step = TOTAL;
    document.getElementById('progress-fill').style.width = ((step / TOTAL) * 100) + '%';
  }

  function renderQuestion(idx) {
    document.getElementById('q-num').textContent = String(idx + 1);
    document.getElementById('q-text').textContent = QUESTIONS[idx].text;
    const c = document.getElementById('q-options');
    c.innerHTML = '';
    FREQUENCY_OPTIONS.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'option';
      if (answers[idx] === opt.text) div.classList.add('selected');
      div.dataset.text = opt.text;
      div.innerHTML = `<span class="option-letter">${opt.letter}</span><span class="option-text">${opt.text}</span><svg class="check-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      div.addEventListener('click', () => selectOption(idx, opt.text));
      c.appendChild(div);
    });
  }

  function selectOption(idx, text) {
    answers[idx] = text;
    document.getElementById('q-options').querySelectorAll('.option').forEach(el => el.classList.toggle('selected', el.dataset.text === text));
    setTimeout(() => { if (currentScreen === 'question' && answers[idx] === text) handleNext(); }, 350);
  }

  function renderMailing() {
    const c = document.getElementById('mailing-options');
    c.innerHTML = '';
    MAILING_OPTIONS.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'option';
      if (mailingChoice === opt.text) div.classList.add('selected');
      div.dataset.text = opt.text;
      div.innerHTML = `<span class="option-letter">${opt.letter}</span><span class="option-text">${opt.text}</span><svg class="check-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      div.addEventListener('click', () => { mailingChoice = opt.text; c.querySelectorAll('.option').forEach(el => el.classList.toggle('selected', el.dataset.text === opt.text)); });
      c.appendChild(div);
    });
  }

  document.getElementById('startBtn').addEventListener('click', () => { currentQIdx = 0; renderQuestion(0); showScreen('question'); });
  document.getElementById('q-ok').addEventListener('click', handleNext);
  document.getElementById('nav-down').addEventListener('click', handleNext);
  document.getElementById('nav-up').addEventListener('click', handleBack);

  function handleNext() {
    if (isSubmitting) return;
    if (currentScreen === 'question') {
      if (!answers[currentQIdx]) return;
      if (currentQIdx < QUESTIONS.length - 1) { currentQIdx++; renderQuestion(currentQIdx); showScreen('question'); }
      else { showScreen('name'); setTimeout(() => document.getElementById('nameInput').focus(), 100); }
    } else if (currentScreen === 'name') {
      const v = document.getElementById('nameInput').value.trim();
      if (!v) { document.getElementById('nameInput').classList.add('error'); document.getElementById('nameError').classList.add('show'); return; }
      document.getElementById('nameInput').classList.remove('error'); document.getElementById('nameError').classList.remove('show');
      userName = v; showScreen('email'); setTimeout(() => document.getElementById('emailInput').focus(), 100);
    } else if (currentScreen === 'email') {
      const v = document.getElementById('emailInput').value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!valid) { document.getElementById('emailInput').classList.add('error'); document.getElementById('emailError').classList.add('show'); return; }
      document.getElementById('emailInput').classList.remove('error'); document.getElementById('emailError').classList.remove('show');
      userEmail = v; renderMailing(); showScreen('mailing');
    } else if (currentScreen === 'mailing') {
      submitAssessment();
    }
  }

  function handleBack() {
    if (currentScreen === 'question' && currentQIdx > 0) { currentQIdx--; renderQuestion(currentQIdx); showScreen('question'); }
    else if (currentScreen === 'name') { currentQIdx = QUESTIONS.length - 1; renderQuestion(currentQIdx); showScreen('question'); }
    else if (currentScreen === 'email') { showScreen('name'); setTimeout(() => document.getElementById('nameInput').focus(), 100); }
    else if (currentScreen === 'mailing') { showScreen('email'); setTimeout(() => document.getElementById('emailInput').focus(), 100); }
  }

  document.getElementById('name-ok').addEventListener('click', handleNext);
  document.getElementById('email-ok').addEventListener('click', handleNext);
  document.getElementById('mailing-ok').addEventListener('click', handleNext);
  document.getElementById('nameInput').addEventListener('keydown',  e => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } });
  document.getElementById('emailInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } });
  document.getElementById('retryBtn').addEventListener('click', () => {
    currentQIdx = 0; answers = QUESTIONS.map(() => null);
    userName = ''; userEmail = ''; mailingChoice = '';
    document.getElementById('nameInput').value = '';
    document.getElementById('emailInput').value = '';
    renderQuestion(0); showScreen('question');
  });

  async function submitAssessment() {
    if (isSubmitting || !mailingChoice) return;
    isSubmitting = true;
    showScreen('submitting');
    const payload = { first_name: userName, email: userEmail, mailing_list: mailingChoice };
    QUESTIONS.forEach((q, i) => { payload[q.name] = answers[i] || 'Never'; });
    fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(r => r.json()).then(d => console.log('[Adrenal] webhook ok:', d))
      .catch(err => console.warn('[Adrenal] webhook error (results still shown):', err));
    showInlineResults(computeLocalScore());
    isSubmitting = false;
  }

  function computeLocalScore() {
    const m = { 'never': 0, 'occasionally': 2, 'frequently': 5, 'constantly': 8 };
    return answers.reduce((t, a) => t + (m[(a || 'never').trim().toLowerCase()] || 0), 0);
  }

  function showInlineResults(score) {
    let verdictClass, verdictLabel, verdictShort, bodyText, steps;
    if (score <= 9) {
      verdictClass = 'minimal'; verdictLabel = 'Minimal Adrenal Load';
      verdictShort = 'Your score suggests a low level of adrenal stress at this time. Your cortisol and adrenal function appear to be coping well with your current demands.';
      bodyText = 'A low score indicates that your stress response system is not significantly overloaded right now. Your adrenal glands — which produce cortisol, DHEA, and adrenaline — appear to be functioning within a healthy range. Maintaining the habits that support this is key: regular sleep, balanced nutrition, moderate exercise, and effective stress management practices. It is still worth monitoring these symptoms over time, as adrenal stress can develop gradually.';
      steps = [
        { title: 'Protect your sleep', body: 'Quality sleep is the single most important recovery mechanism for your adrenal glands. Aim for 7–9 hours, with a consistent bedtime before 11pm.' },
        { title: 'Maintain your stress management habits', body: 'Regular practices such as walking, meditation, breathwork, or yoga keep cortisol levels from creeping upward over time.' },
        { title: 'Consider an annual adrenal panel', body: 'A saliva or blood cortisol panel, combined with DHEA-S measurement, gives you a clear baseline of your adrenal reserve as you age.' }
      ];
    } else if (score <= 22) {
      verdictClass = 'mild'; verdictLabel = 'Mild to Moderate Adrenal Stress';
      verdictShort = 'You are experiencing some signs of adrenal stress. Your body is managing, but the early warning signs of adrenal dysfunction are present — particularly fatigue, irritability, anxiety, and disrupted sleep.';
      bodyText = 'A score in this range suggests your HPA axis (hypothalamic-pituitary-adrenal axis) is under moderate strain. Sustained stress causes cortisol to remain elevated for extended periods, which disrupts sleep, depletes energy, increases anxiety, and eventually leads to adrenal fatigue as cortisol output begins to decline. At this stage, targeted nutritional support, lifestyle changes, and an adrenal hormone panel can make a significant difference before the condition progresses. DHEA levels in particular tend to drop as cortisol demands increase, and restoring DHEA can meaningfully improve energy, mood, and resilience.';
      steps = [
        { title: 'Get an adrenal hormone panel', body: 'A salivary or blood cortisol profile (ideally a 4-point cortisol curve) plus DHEA-S will show exactly how your adrenal output is patterned throughout the day.' },
        { title: 'Prioritise sleep and recovery', body: 'Sleep deprivation is both a cause and consequence of adrenal stress. Establish a consistent sleep schedule, reduce screen exposure in the evening, and consider magnesium glycinate (300mg) before bed.' },
        { title: 'Support your adrenals nutritionally', body: 'Key nutrients for adrenal function include vitamin C, B5 (pantothenic acid), magnesium, and adaptogenic herbs such as ashwagandha and rhodiola — all with clinical evidence for lowering cortisol and improving stress resilience.' }
      ];
    } else if (score <= 39) {
      verdictClass = 'moderate'; verdictLabel = 'Moderate to Severe Adrenal Fatigue';
      verdictShort = 'Your score indicates significant adrenal dysfunction. The symptoms you are experiencing — persistent exhaustion, emotional dysregulation, anxiety, poor sleep, and afternoon energy crashes — are hallmarks of adrenal fatigue that require attention.';
      bodyText = 'At this level, your adrenal glands have been under prolonged stress and are likely producing abnormal cortisol patterns — either chronically elevated (early-stage) or depleted (late-stage adrenal fatigue). Both patterns produce overlapping symptoms but respond to different interventions, which is why a proper adrenal hormone panel is essential. The cascade of effects from dysregulated cortisol is wide-ranging: it disrupts thyroid function, sex hormone production (lowering testosterone and progesterone), immune function, blood sugar regulation, and sleep architecture. A comprehensive hormonal assessment alongside targeted adrenal support is strongly recommended.';
      steps = [
        { title: 'Comprehensive adrenal + hormone panel', body: 'A full assessment should include 4-point salivary cortisol, DHEA-S, testosterone, thyroid (TSH, fT3, fT4), and blood sugar markers. Adrenal dysfunction rarely exists in isolation.' },
        { title: 'Speak to a specialist urgently', body: 'Our healthcare specialists can interpret your results and create a personalised protocol combining adrenal support, hormone optimisation, and evidence-based lifestyle interventions.' },
        { title: 'Immediate lifestyle interventions', body: 'Reduce caffeine and alcohol, eliminate ultra-processed foods, establish strict sleep hygiene, and incorporate short daily walks. These changes can reduce cortisol load meaningfully within 2–4 weeks.' }
      ];
    } else {
      verdictClass = 'severe'; verdictLabel = 'Severe Adrenal Exhaustion';
      verdictShort = 'Your score is at the maximum level, indicating severe adrenal exhaustion. Every symptom assessed is occurring constantly. This requires immediate clinical attention.';
      bodyText = 'Scoring at the maximum level suggests your adrenal glands are severely depleted. Adrenal exhaustion — sometimes called stage 3 adrenal fatigue — is characterised by extremely low cortisol output, profound fatigue that does not improve with rest, intense anxiety or emotional numbness, complete inability to sleep restoratively, and crashing energy levels. Without intervention, this state can significantly impair your immune function, cardiovascular health, metabolic health, and quality of life. Recovery is possible but takes time, the right treatment, and professional guidance. Please reach out to one of our specialists as soon as possible.';
      steps = [
        { title: 'Seek specialist support immediately', body: 'Severe adrenal exhaustion requires professional assessment and a structured recovery protocol. Book a free consultation with our team today.' },
        { title: 'Full hormonal and metabolic panel', body: 'You need a comprehensive panel including 4-point cortisol, DHEA-S, full thyroid panel, sex hormones, blood sugar, and inflammatory markers to understand the full picture of what is driving your symptoms.' },
        { title: 'Targeted recovery protocol', body: 'Recovery from severe adrenal exhaustion typically involves adrenal glandular support, DHEA replacement where indicated, adaptogenic herbs at therapeutic doses, strict sleep optimisation, and careful stress reduction — guided by your test results and a specialist.' }
      ];
    }

    document.getElementById('scoreNumber').textContent = score;
    setTimeout(() => { document.getElementById('scoreBarFill').style.width = ((score / 40) * 100) + '%'; }, 200);
    const ve = document.getElementById('resultVerdict');
    ve.className = 'result-verdict ' + verdictClass;
    document.getElementById('verdictBadge').textContent = verdictLabel;
    document.getElementById('verdictText').textContent  = verdictShort;
    document.getElementById('resultBodyText').textContent = bodyText;
    const icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    document.getElementById('nextSteps').innerHTML = steps.map(s =>
      `<div class="next-step"><div class="next-step-icon">${icon}</div><div class="next-step-text"><strong>${escapeHtml(s.title)}</strong>${escapeHtml(s.body)}</div></div>`
    ).join('');
    if (userEmail) { document.getElementById('emailSentTo').textContent = userEmail; document.getElementById('emailNote').style.display = 'flex'; }
    showScreen('complete');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  document.addEventListener('keydown', e => {
    if (currentScreen !== 'question') return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'Enter') { e.preventDefault(); if (answers[currentQIdx]) handleNext(); return; }
    const map = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
    const idx = map[e.key.toLowerCase()];
    if (typeof idx === 'number') { e.preventDefault(); selectOption(currentQIdx, FREQUENCY_OPTIONS[idx].text); }
  });

  updateProgress();
