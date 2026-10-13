
  const WEBHOOK_URL = 'https://vmi3206755.contaboserver.net/webhook/perimenopause-typeform-submit';

  const QUESTIONS = [
    { name: 'q1_water_retention',       text: 'Water retention or bloating?' },
    { name: 'q2_facial_hair',           text: 'Increased facial hair?' },
    { name: 'q3_breast_tenderness',     text: 'Breast tenderness or swelling?' },
    { name: 'q4_pain',                  text: 'Pain in the form of: headache, migraine, lower back, muscle or joint ache?' },
    { name: 'q5_vaginal_dryness',       text: 'Vaginal dryness, pain, or itching?' },
    { name: 'q6_fatigue',               text: 'Fatigue or lack of energy?' },
    { name: 'q7_concentration',         text: 'Decreased concentration, alertness, or memory loss?' },
    { name: 'q8_urinary_incontinence',  text: 'Urinary incontinence?' },
    { name: 'q9_irritability',          text: 'Irritability and anger?' },
    { name: 'q10_anxiety',              text: 'Anxiety?' },
    { name: 'q11_mood_swings',          text: 'Mood swings?' },
    { name: 'q12_depression',           text: 'Depression?' },
    { name: 'q13_acne',                 text: 'Acne or oily skin?' },
    { name: 'q14_low_libido',           text: 'Lack of sex drive / libido?' },
    { name: 'q15_hot_flashes',          text: 'Hot flashes or night sweats?' },
    { name: 'q16_sleep_disturbance',    text: 'Sleep disturbance?' },
    { name: 'q17_heart_disease_risk',   text: 'Personal risk factors for heart disease?' },
    { name: 'q18_osteoporosis_risk',    text: 'Personal risk factor for osteoporosis?' },
    { name: 'q19_weight_gain',          text: 'Unexplained weight gain or difficulty losing weight?' },
    { name: 'q20_irregular_periods',    text: 'Irregular, heavier, or lighter periods than usual?' }
  ];

  const YES_NO = [
    { letter: 'Y', text: 'Yes' },
    { letter: 'N', text: 'No'  }
  ];

  const MAILING_OPTIONS = [
    { letter: 'A', text: 'Yes, add me to your mailing list' },
    { letter: 'B', text: 'No, just send me the results' }
  ];

  let currentQIdx  = 0;
  let currentScreen = 'intro';
  let answers      = QUESTIONS.map(() => null);
  let userName     = '';
  let userEmail    = '';
  let mailingChoice = '';
  let isSubmitting = false;

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
    if      (currentScreen === 'question')   step = currentQIdx;
    else if (currentScreen === 'name')       step = QUESTIONS.length;
    else if (currentScreen === 'email')      step = QUESTIONS.length + 1;
    else if (currentScreen === 'mailing')    step = QUESTIONS.length + 2;
    else if (['submitting','complete'].includes(currentScreen)) step = TOTAL;
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
    currentQIdx = 0;
    renderQuestion(0);
    showScreen('question');
  });

  document.getElementById('q-ok').addEventListener('click', handleNext);
  document.getElementById('nav-down').addEventListener('click', handleNext);
  document.getElementById('nav-up').addEventListener('click', handleBack);

  function handleNext() {
    if (isSubmitting) return;

    if (currentScreen === 'question') {
      if (!answers[currentQIdx]) return;
      if (currentQIdx < QUESTIONS.length - 1) {
        currentQIdx++;
        renderQuestion(currentQIdx);
        showScreen('question');
      } else {
        showScreen('name');
        setTimeout(() => document.getElementById('nameInput').focus(), 100);
      }
    } else if (currentScreen === 'name') {
      const v = document.getElementById('nameInput').value.trim();
      if (!v) {
        document.getElementById('nameInput').classList.add('error');
        document.getElementById('nameError').classList.add('show');
        return;
      }
      document.getElementById('nameInput').classList.remove('error');
      document.getElementById('nameError').classList.remove('show');
      userName = v;
      showScreen('email');
      setTimeout(() => document.getElementById('emailInput').focus(), 100);
    } else if (currentScreen === 'email') {
      const v = document.getElementById('emailInput').value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!valid) {
        document.getElementById('emailInput').classList.add('error');
        document.getElementById('emailError').classList.add('show');
        return;
      }
      document.getElementById('emailInput').classList.remove('error');
      document.getElementById('emailError').classList.remove('show');
      userEmail = v;
      renderMailing();
      showScreen('mailing');
    } else if (currentScreen === 'mailing') {
      submitAssessment();
    }
  }

  function handleBack() {
    if (currentScreen === 'question' && currentQIdx > 0) {
      currentQIdx--;
      renderQuestion(currentQIdx);
      showScreen('question');
    } else if (currentScreen === 'name') {
      currentQIdx = QUESTIONS.length - 1;
      renderQuestion(currentQIdx);
      showScreen('question');
    } else if (currentScreen === 'email') {
      showScreen('name');
      setTimeout(() => document.getElementById('nameInput').focus(), 100);
    } else if (currentScreen === 'mailing') {
      showScreen('email');
      setTimeout(() => document.getElementById('emailInput').focus(), 100);
    }
  }

  document.getElementById('name-ok').addEventListener('click', handleNext);
  document.getElementById('email-ok').addEventListener('click', handleNext);
  document.getElementById('mailing-ok').addEventListener('click', handleNext);

  document.getElementById('nameInput').addEventListener('keydown',  e => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } });
  document.getElementById('emailInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } });

  document.getElementById('retryBtn').addEventListener('click', () => {
    currentQIdx = 0;
    answers = QUESTIONS.map(() => null);
    userName = ''; userEmail = ''; mailingChoice = '';
    document.getElementById('nameInput').value = '';
    document.getElementById('emailInput').value = '';
    renderQuestion(0);
    showScreen('question');
  });

  async function submitAssessment() {
    if (isSubmitting) return;
    if (!mailingChoice) return;

    isSubmitting = true;
    showScreen('submitting');

    const payload = {
      first_name:   userName,
      email:        userEmail,
      mailing_list: mailingChoice
    };
    QUESTIONS.forEach((q, i) => {
      payload[q.name] = answers[i] || 'No';
    });

    fetch(WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    }).then(r => r.json()).then(d => {
      console.log('[Perimenopause] webhook ok:', d);
    }).catch(err => {
      console.warn('[Perimenopause] webhook error (results still shown):', err);
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
    let tier, verdictClass, verdictLabel, verdictShort, bodyText, steps;

    if (score === 0) {
      tier         = 1;
      verdictClass = 'none';
      verdictLabel = 'No Symptoms Reported';
      verdictShort = 'You have not reported any perimenopause symptoms at this time. This is reassuring, though symptoms can emerge gradually — it is worth revisiting this assessment if anything changes.';
      bodyText     = 'Your score suggests you are not currently experiencing symptoms associated with perimenopause. Hormonal changes can begin subtly in your late 30s or early 40s, so it is useful to establish a hormonal baseline now through a simple hormone panel, giving you a clear point of reference for the future.';
      steps = [
        { title: 'Establish a hormone baseline', body: 'Even without current symptoms, a female hormone panel (FSH, LH, oestradiol, progesterone) gives you a reference point as you age.' },
        { title: 'Know the early signs', body: 'Familiarise yourself with early perimenopause symptoms — irregular periods, subtle mood changes, and sleep disruption are often the first indicators.' },
        { title: 'Healthy habits now', body: 'Weight-bearing exercise, a calcium-rich diet, reduced alcohol intake, and quality sleep all support hormonal health in the years ahead.' }
      ];
    } else if (score >= 1 && score <= 14) {
      tier         = 2;
      verdictClass = 'mild';
      verdictLabel = 'Mild–Moderate Symptoms';
      verdictShort = 'You are experiencing some symptoms that may be linked to perimenopause. A hormone evaluation would help clarify whether fluctuating oestrogen and progesterone levels are contributing to how you feel.';
      bodyText     = 'Perimenopause can cause a wide range of symptoms — from mood changes and fatigue to sleep disruption and irregular periods — as oestrogen and progesterone levels begin to fluctuate. Many women find that these symptoms come and go, making them easy to dismiss. A hormone panel will give you and your healthcare provider a clear picture of where your levels currently stand, and there are several effective, evidence-based options available to relieve symptoms if needed.';
      steps = [
        { title: 'Get a hormone panel', body: 'A blood or saliva test measuring FSH, LH, oestradiol, and progesterone will confirm whether your hormones are in the perimenopausal range.' },
        { title: 'Speak to a specialist', body: 'Our healthcare specialists can review your hormone results privately and discuss options including bioidentical hormone replacement therapy (BHRT), lifestyle changes, and supplements.' },
        { title: 'Track your symptoms', body: 'Keep a simple diary of symptoms, cycle changes, and mood. This helps your clinician spot patterns and tailor any treatment plan to you.' }
      ];
    } else {
      tier         = 3;
      verdictClass = 'high';
      verdictLabel = 'Significant Symptoms';
      verdictShort = 'Your score indicates a high number of symptoms strongly associated with perimenopause. We recommend speaking with a hormone specialist as soon as possible to discuss your options.';
      bodyText     = 'Scoring 15 or more symptoms suggests your hormonal health is significantly impacted. The wide range of symptoms you are experiencing — which may include hot flashes, sleep disruption, mood disturbance, vaginal dryness, and cognitive changes — are all well-documented effects of declining oestrogen and progesterone. The good news is that perimenopause is very manageable. Bioidentical hormone replacement therapy (BHRT), lifestyle interventions, and targeted supplements have helped millions of women reclaim their quality of life. The first step is a hormone panel so we can understand exactly where your levels stand.';
      steps = [
        { title: 'Get a comprehensive hormone panel', body: 'A full female hormone profile — including FSH, LH, oestradiol, progesterone, testosterone, DHEA-S, and cortisol — will give the clearest picture of what is happening hormonally.' },
        { title: 'Book a free consultation', body: 'Our specialists can guide you through your results and discuss bioidentical hormone replacement therapy (BHRT), which is clinically shown to reduce perimenopause symptoms effectively.' },
        { title: 'Prioritise bone and heart health', body: 'Your risk factors for osteoporosis and heart disease are worth discussing with your clinician, as declining oestrogen directly affects both. Early intervention makes a significant difference.' }
      ];
    }

    document.getElementById('scoreNumber').textContent = score;
    setTimeout(() => {
      document.getElementById('scoreBarFill').style.width = ((score / 20) * 100) + '%';
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
    if (typeof idx === 'number') {
      e.preventDefault();
      selectOption(currentQIdx, YES_NO[idx].text);
    }
  });

  updateProgress();
