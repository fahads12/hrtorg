
  // ═══════════════════════════════════════════════════════════
  //  CONFIG
  // ═══════════════════════════════════════════════════════════
  const WEBHOOK_URL = 'https://vmi3206755.contaboserver.net/webhook/menopause-typeform-submit';

  const QUESTIONS = [
    { name: 'q1_water_retention',      text: 'Water retention, bloating, and weight gain?' },
    { name: 'q2_facial_hair',          text: 'Increased facial hair?' },
    { name: 'q3_breast_tenderness',    text: 'Breast tenderness or swelling?' },
    { name: 'q4_pain',                 text: 'Pain in the form of: headache, migraine, lower back, muscle or joint ache?' },
    { name: 'q5_vaginal_dryness',      text: 'Vaginal dryness, pain, itching?' },
    { name: 'q6_fatigue',              text: 'Fatigue or lack of energy?' },
    { name: 'q7_concentration',        text: 'Decreased concentration, alertness, memory loss?' },
    { name: 'q8_urinary_incontinence', text: 'Urinary incontinence?' },
    { name: 'q9_irritability',         text: 'Irritability and anger?' },
    { name: 'q10_anxiety',             text: 'Anxiety?' },
    { name: 'q11_mood_swings',         text: 'Mood swings?' },
    { name: 'q12_depression',          text: 'Depression?' },
    { name: 'q13_acne',                text: 'Acne or oily skin?' },
    { name: 'q14_low_libido',          text: 'Lack of sex drive/libido?' },
    { name: 'q15_hot_flashes',         text: 'Hot flashes/night sweats?' },
    { name: 'q16_sleep_disturbance',   text: 'Sleep disturbance?' },
    { name: 'q17_heart_disease_risk',  text: 'Personal risk factors for heart disease?' },
    { name: 'q18_osteoporosis_risk',   text: 'Personal risk factor for osteoporosis?' }
  ];

  const YES_NO = [
    { letter: 'Y', text: 'Yes' },
    { letter: 'N', text: 'No'  }
  ];

  const MAILING_OPTIONS = [
    { letter: 'A', text: 'Yes, add me to your mailing list' },
    { letter: 'B', text: 'No, just send me the results' }
  ];

  let currentQIdx   = 0;
  let currentScreen = 'intro';
  let answers       = QUESTIONS.map(() => null);
  let userName      = '';
  let userEmail     = '';
  let mailingChoice = '';
  let isSubmitting  = false;

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + name);
    if (target) target.classList.add('active');
    currentScreen = name;

    const showNav = ['question','name','email','mailing'].includes(name);
    document.getElementById('bottomNav').style.display = showNav ? 'flex' : 'none';
    document.getElementById('progress').style.display  = showNav ? 'block' : 'none';

    document.getElementById('nav-up').disabled =
      (name === 'question' && currentQIdx === 0) || name === 'intro';
    document.getElementById('nav-down').disabled = (name === 'mailing');
    updateProgress();
  }

  function updateProgress() {
    const TOTAL = QUESTIONS.length + 3;
    let step = 0;
    if      (currentScreen === 'question')                       step = currentQIdx;
    else if (currentScreen === 'name')                           step = QUESTIONS.length;
    else if (currentScreen === 'email')                          step = QUESTIONS.length + 1;
    else if (currentScreen === 'mailing')                        step = QUESTIONS.length + 2;
    else if (['submitting','complete'].includes(currentScreen))  step = TOTAL;
    document.getElementById('progress-fill').style.width = ((step / TOTAL) * 100) + '%';
  }

  function renderQuestion(idx) {
    document.getElementById('q-num').textContent = String(idx + 1);
    document.getElementById('q-text').textContent = QUESTIONS[idx].text;

    const container = document.getElementById('q-options');
    container.innerHTML = '';
    YES_NO.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'option';
      if (answers[idx] === opt.text) div.classList.add('selected');
      div.dataset.text = opt.text;
      div.innerHTML =
        `<span class="option-letter">${opt.letter}</span>` +
        `<span class="option-text">${opt.text}</span>` +
        `<svg class="check-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      div.addEventListener('click', () => selectOption(idx, opt.text));
      container.appendChild(div);
    });
  }

  function selectOption(idx, text) {
    answers[idx] = text;
    document.getElementById('q-options').querySelectorAll('.option').forEach(el => {
      el.classList.toggle('selected', el.dataset.text === text);
    });
    setTimeout(() => {
      if (currentScreen === 'question' && answers[idx] === text) handleNext();
    }, 350);
  }

  function renderMailing() {
    const container = document.getElementById('mailing-options');
    container.innerHTML = '';
    MAILING_OPTIONS.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'option';
      if (mailingChoice === opt.text) div.classList.add('selected');
      div.dataset.text = opt.text;
      div.innerHTML =
        `<span class="option-letter">${opt.letter}</span>` +
        `<span class="option-text">${opt.text}</span>` +
        `<svg class="check-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      div.addEventListener('click', () => {
        mailingChoice = opt.text;
        container.querySelectorAll('.option').forEach(el => {
          el.classList.toggle('selected', el.dataset.text === opt.text);
        });
      });
      container.appendChild(div);
    });
  }

  document.getElementById('startBtn').addEventListener('click', () => {
    currentQIdx = 0; renderQuestion(0); showScreen('question');
  });
  document.getElementById('q-ok').addEventListener('click', handleNext);
  document.getElementById('nav-down').addEventListener('click', handleNext);
  document.getElementById('nav-up').addEventListener('click', handleBack);

  function handleNext() {
    if (isSubmitting) return;
    if (currentScreen === 'question') {
      if (!answers[currentQIdx]) return;
      if (currentQIdx < QUESTIONS.length - 1) {
        currentQIdx++; renderQuestion(currentQIdx); showScreen('question');
      } else {
        showScreen('name');
        setTimeout(() => document.getElementById('nameInput').focus(), 100);
      }
    } else if (currentScreen === 'name') {
      const v = document.getElementById('nameInput').value.trim();
      if (!v) { document.getElementById('nameInput').classList.add('error'); document.getElementById('nameError').classList.add('show'); return; }
      document.getElementById('nameInput').classList.remove('error'); document.getElementById('nameError').classList.remove('show');
      userName = v; showScreen('email');
      setTimeout(() => document.getElementById('emailInput').focus(), 100);
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
    if (currentScreen === 'question' && currentQIdx > 0) {
      currentQIdx--; renderQuestion(currentQIdx); showScreen('question');
    } else if (currentScreen === 'name') {
      currentQIdx = QUESTIONS.length - 1; renderQuestion(currentQIdx); showScreen('question');
    } else if (currentScreen === 'email') {
      showScreen('name'); setTimeout(() => document.getElementById('nameInput').focus(), 100);
    } else if (currentScreen === 'mailing') {
      showScreen('email'); setTimeout(() => document.getElementById('emailInput').focus(), 100);
    }
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
    if (isSubmitting) return;
    if (!mailingChoice) return;
    isSubmitting = true;
    showScreen('submitting');

    const payload = { first_name: userName, email: userEmail, mailing_list: mailingChoice };
    QUESTIONS.forEach((q, i) => { payload[q.name] = answers[i] || 'No'; });

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(d => {
      console.log('[Menopause] webhook ok:', d);
    }).catch(err => {
      console.warn('[Menopause] webhook error (results still shown):', err);
    });

    const totalScore = computeLocalScore();
    showInlineResults(totalScore);
    isSubmitting = false;
  }

  function computeLocalScore() {
    let total = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      if (answers[i] === 'Yes') total++;
    }
    return total;
  }

  function showInlineResults(score) {
    let verdictClass, verdictLabel, verdictShort, bodyText, steps;

    if (score === 0) {
      verdictClass = 'none';
      verdictLabel = 'No Symptoms Reported';
      verdictShort = 'You have not reported any menopause symptoms at this time. This is a positive result — though it is worth monitoring for changes as you move through your 40s and 50s.';
      bodyText = 'Your responses suggest you are not currently experiencing symptoms associated with menopause. Hormonal changes during and after menopause can develop gradually, and establishing a hormone baseline now — even without symptoms — provides a valuable reference point for the future. We recommend a female hormone panel as part of your routine health assessment, alongside maintaining bone density, cardiovascular health, and hormonal wellness through regular exercise, a nutrient-rich diet, and good sleep hygiene.';
      steps = [
        { title: 'Establish a hormone baseline', body: 'A female hormone panel measuring FSH, LH, oestradiol, and progesterone gives you a clear starting point — even before symptoms develop.' },
        { title: 'Protect your long-term health', body: 'Declining oestrogen after menopause increases the risk of osteoporosis and cardiovascular disease. Early lifestyle investment pays dividends later.' },
        { title: 'Know the signs', body: 'Familiarise yourself with menopause symptoms so you can act early if they arise. Hot flashes, sleep disruption, and mood changes are often the first indicators.' }
      ];
    } else if (score >= 1 && score <= 14) {
      verdictClass = 'mild';
      verdictLabel = 'Mild to Moderate Symptoms';
      verdictShort = 'You are experiencing a number of symptoms that may be linked to menopause. A hormone evaluation would help clarify whether declining oestrogen and progesterone levels are contributing to how you feel.';
      bodyText = 'Menopause causes a wide range of symptoms as oestrogen, progesterone, and testosterone levels decline — from physical changes such as hot flashes, vaginal dryness, and weight gain to emotional and cognitive changes including mood swings, anxiety, and reduced concentration. Many women normalise these symptoms or attribute them to ageing, stress, or other causes. A comprehensive hormone panel will give you and your healthcare provider a clear picture of your current hormonal status, and there are several highly effective, evidence-based treatment options available — including bioidentical hormone replacement therapy (BHRT) — that can significantly reduce or eliminate the symptoms you are experiencing.';
      steps = [
        { title: 'Get a comprehensive hormone panel', body: 'A full female hormone profile measuring FSH, LH, oestradiol, progesterone, testosterone, DHEA-S, and thyroid will identify exactly which hormones are declining and driving your symptoms.' },
        { title: 'Speak to a specialist', body: 'Our healthcare specialists can review your results privately and discuss options including bioidentical HRT, which closely mirrors your body\'s natural hormones for effective, well-tolerated symptom relief.' },
        { title: 'Track your symptoms', body: 'Keep a diary noting which symptoms occur, their severity, and when they happen. This helps your clinician identify patterns and confirm menopause versus other hormonal conditions.' }
      ];
    } else {
      verdictClass = 'significant';
      verdictLabel = 'Significant Symptoms';
      verdictShort = 'You are reporting a high number of menopause symptoms that are significantly impacting your quality of life. We strongly recommend a hormone assessment and specialist consultation as soon as possible.';
      bodyText = 'Scoring 15 or more symptoms indicates that menopause is having a substantial impact across multiple areas of your health and daily functioning. The wide range of symptoms you are experiencing — which may include hot flashes, severe sleep disruption, mood and cognitive changes, vaginal dryness, reduced libido, pain, and cardiovascular or bone health risk factors — are all well-documented consequences of declining oestrogen and progesterone. You do not have to manage these symptoms alone, and you do not have to simply endure them. Bioidentical hormone replacement therapy (BHRT) has decades of evidence demonstrating its effectiveness for reducing menopause symptoms and protecting long-term bone and cardiovascular health. The first step is a comprehensive hormone panel so we understand exactly where your levels stand — and then our specialists can build a personalised treatment plan around your specific results and health profile.';
      steps = [
        { title: 'Comprehensive hormone panel — as soon as possible', body: 'A full female hormone profile including FSH, LH, oestradiol, progesterone, testosterone, DHEA-S, cortisol, and thyroid gives the clearest picture of your hormonal status and treatment needs.' },
        { title: 'Book a free specialist consultation', body: 'Our specialists are experienced in managing complex menopause presentations and can discuss BHRT, lifestyle interventions, targeted supplementation, and bone and cardiovascular protection strategies.' },
        { title: 'Address bone and heart health now', body: 'With risk factors for both osteoporosis and heart disease identified, early intervention is critical. Declining oestrogen directly and rapidly affects both — and BHRT has strong evidence for protecting both simultaneously.' }
      ];
    }

    document.getElementById('scoreNumber').textContent = score;
    setTimeout(() => {
      document.getElementById('scoreBarFill').style.width = ((score / 18) * 100) + '%';
    }, 200);

    const verdictEl = document.getElementById('resultVerdict');
    verdictEl.className = 'result-verdict ' + verdictClass;
    document.getElementById('verdictBadge').textContent = verdictLabel;
    document.getElementById('verdictText').textContent  = verdictShort;
    document.getElementById('resultBodyText').textContent = bodyText;

    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    document.getElementById('nextSteps').innerHTML = steps.map(s =>
      `<div class="next-step">
        <div class="next-step-icon">${iconSvg}</div>
        <div class="next-step-text"><strong>${escapeHtml(s.title)}</strong>${escapeHtml(s.body)}</div>
      </div>`
    ).join('');

    if (userEmail) {
      document.getElementById('emailSentTo').textContent = userEmail;
      document.getElementById('emailNote').style.display = 'flex';
    }

    showScreen('complete');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
    );
  }

  document.addEventListener('keydown', e => {
    if (currentScreen !== 'question') return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'Enter') { e.preventDefault(); if (answers[currentQIdx]) handleNext(); return; }
    const map = { 'y': 0, 'n': 1, '1': 0, '2': 1 };
    const idx = map[e.key.toLowerCase()];
    if (typeof idx === 'number') { e.preventDefault(); selectOption(currentQIdx, YES_NO[idx].text); }
  });

  updateProgress();
