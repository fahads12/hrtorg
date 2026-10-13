
  const WEBHOOK_URL = 'https://vmi3206755.contaboserver.net/webhook/osteoporosis-typeform-submit';

  const QUESTIONS = [
    { name: 'q1_exercise',          text: 'I have a regular weight-bearing exercise routine.',                                              protective: true,  flag: 'Protective factor — "Yes" reduces your risk' },
    { name: 'q2_alcohol',           text: 'I drink two or more glasses of alcohol a day on a regular basis.',                               protective: false },
    { name: 'q3_inactive',          text: 'I am physically inactive for prolonged periods of time.',                                        protective: false },
    { name: 'q4_smoke',             text: 'I smoke.',                                                                                       protective: false },
    { name: 'q5_caffeine',          text: 'I regularly drink more than three cups of caffeinated beverages (coffee, soda, tea) in a day.',   protective: false },
    { name: 'q6_medication',        text: 'I take steroids, anticonvulsants, or thyroid medication.',                                       protective: false },
    { name: 'q7_calcium',           text: 'I consume the minimum recommended daily requirement for calcium.',                               protective: true,  flag: 'Protective factor — "Yes" reduces your risk' },
    { name: 'q8_absent_periods',    text: 'I have an abnormal absence of menstrual periods.',                                               protective: false },
    { name: 'q9_postmenopausal',    text: 'I am postmenopausal, including early menopause and/or surgically induced menopause.',             protective: false },
    { name: 'q10_low_testosterone', text: 'I have low testosterone.',                                                                       protective: false },
    { name: 'q11_ethnicity',        text: 'I am Caucasian or Asian.',                                                                       protective: false },
    { name: 'q12_family_history',   text: 'I have a family history of osteoporosis.',                                                       protective: false },
    { name: 'q13_curved_back',      text: 'My upper back curves forward.',                                                                  protective: false }
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
    const q = QUESTIONS[idx];
    document.getElementById('q-num').textContent = String(idx + 1);
    document.getElementById('q-text').textContent = q.text;

    const flagEl = document.getElementById('q-flag');
    const flagText = document.getElementById('q-flag-text');
    if (q.protective && q.flag) {
      flagText.textContent = q.flag;
      flagEl.style.display = 'flex';
    } else {
      flagEl.style.display = 'none';
    }

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
      console.log('[Osteoporosis] webhook ok:', d);
    }).catch(err => {
      console.warn('[Osteoporosis] webhook error (results still shown):', err);
    });

    const riskScore = computeRiskScore();
    showInlineResults(riskScore);
    isSubmitting = false;
  }

  function computeRiskScore() {
    let score = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i];
      const ans = answers[i];
      if (q.protective) {
        if (ans === 'No') score++;
      } else {
        if (ans === 'Yes') score++;
      }
    }
    return score;
  }

  function showInlineResults(score) {
    const isHighRisk = score > 3;
    let verdictClass, verdictLabel, verdictShort, bodyText, steps;

    if (!isHighRisk) {
      verdictClass = 'low';
      verdictLabel = 'Lower Risk Profile';
      verdictShort = 'You have few identified risk factors for osteoporosis. Maintaining your current protective habits and monitoring bone health periodically is recommended.';
      bodyText = 'Your responses suggest a lower risk profile for osteoporosis at this time. With fewer than four risk factors identified, your bone density is less likely to be significantly compromised — particularly if you are maintaining a regular exercise routine and meeting your daily calcium requirements. That said, bone loss is a gradual process that begins earlier than most people realise. Establishing your bone density baseline with a DEXA scan, especially if you are over 40, is a proactive step that gives you a clear picture of your current bone health and a reference point for the future.';
      steps = [
        { title: 'Maintain weight-bearing exercise', body: 'Activities like walking, jogging, resistance training, and dancing stimulate bone formation. Aim for at least 30 minutes most days.' },
        { title: 'Optimise your calcium and vitamin D intake', body: 'Calcium (1000–1200mg/day) and vitamin D3 (1000–2000 IU/day) are the foundation of bone health. Consider a bone health panel to check your current levels.' },
        { title: 'Consider a baseline DEXA scan', body: 'A DEXA scan measures your bone mineral density and is the gold standard for detecting low bone density before fractures occur. Recommended from age 40 onwards.' }
      ];
    } else {
      verdictClass = 'high';
      verdictLabel = 'Elevated Risk Profile';
      verdictShort = 'You have identified multiple risk factors for osteoporosis. We recommend a bone density assessment and a consultation with a specialist to discuss prevention and treatment options.';
      bodyText = 'Your responses indicate an elevated risk profile for osteoporosis, with four or more risk factors identified. Osteoporosis is often called the "silent disease" because bone loss occurs gradually and without symptoms — until a fracture happens. The good news is that with the right assessment, lifestyle changes, and treatment where needed, bone loss can be significantly slowed or even reversed. Key factors in your profile — which may include postmenopausal status, low testosterone, physical inactivity, smoking, high alcohol or caffeine intake, or a family history of osteoporosis — are all clinically recognised contributors to reduced bone mineral density. Hormone replacement therapy (HRT) has strong evidence for protecting bone density, particularly in women around menopause, as does testosterone replacement in men with low levels. A comprehensive bone health assessment including a DEXA scan and hormone panel is the recommended first step.';
      steps = [
        { title: 'Get a DEXA bone density scan', body: 'A DEXA scan is the most accurate way to measure bone mineral density and determine your actual fracture risk. It is quick, painless, and widely available.' },
        { title: 'Get a hormone and bone health panel', body: 'Low oestrogen, low testosterone, low vitamin D, and low calcium absorption are the key hormonal and nutritional drivers of bone loss. A comprehensive panel identifies exactly which factors apply to you.' },
        { title: 'Speak to a specialist about treatment', body: 'Depending on your results, options may include hormone replacement therapy (HRT), bisphosphonates, calcium and vitamin D supplementation, and structured exercise programmes — all with strong evidence for protecting and rebuilding bone density.' }
      ];
    }

    document.getElementById('scoreNumber').textContent = score;
    setTimeout(() => {
      document.getElementById('scoreBarFill').style.width = ((score / 13) * 100) + '%';
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
