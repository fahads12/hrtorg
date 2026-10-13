
  const WEBHOOK_URL = 'https://vmi3206755.contaboserver.net/webhook/pms-typeform-submit';

  const QUESTIONS = [
    { name: 'q1_fluid_retention',      text: 'Fluid retention?' },
    { name: 'q2_backache',             text: 'Backache?' },
    { name: 'q3_breast_tenderness',    text: 'Breast tenderness or swelling?' },
    { name: 'q4_headache',             text: 'Headache or migraine?' },
    { name: 'q5_weight_gain',          text: 'Weight gain?' },
    { name: 'q6_fatigue',              text: 'Fatigue or lack of energy?' },
    { name: 'q7_cravings',             text: 'Craving carbohydrates, alcohol or sweets?' },
    { name: 'q8_joint_swelling',       text: 'Joint swelling?' },
    { name: 'q9_irritability',         text: 'Irritability?' },
    { name: 'q10_anxiety',             text: 'Anxiety?' },
    { name: 'q11_mood_swings',         text: 'Mood swings?' },
    { name: 'q12_depression',          text: 'Depression?' },
    { name: 'q13_hostility',           text: 'Hostility?' },
    { name: 'q14_emotional_crying',    text: 'Emotional or crying for no apparent reason?' },
    { name: 'q15_mental_confusion',    text: 'Mental confusion?' }
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
    if      (currentScreen === 'question')                        step = currentQIdx;
    else if (currentScreen === 'name')                            step = QUESTIONS.length;
    else if (currentScreen === 'email')                           step = QUESTIONS.length + 1;
    else if (currentScreen === 'mailing')                         step = QUESTIONS.length + 2;
    else if (['submitting','complete'].includes(currentScreen))   step = TOTAL;
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

    const payload = { first_name: userName, email: userEmail, mailing_list: mailingChoice };
    QUESTIONS.forEach((q, i) => { payload[q.name] = answers[i] || 'No'; });

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(d => {
      console.log('[PMS] webhook ok:', d);
    }).catch(err => {
      console.warn('[PMS] webhook error (results still shown):', err);
    });

    const totalScore = computeLocalScore();
    showInlineResults(totalScore);
    isSubmitting = false;
  }

  function computeLocalScore() {
    let total = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      if (answers[i] === 'Yes') total += 2;
    }
    return total;
  }

  function rawYesCount() {
    return answers.filter(a => a === 'Yes').length;
  }

  function showInlineResults(weightedScore) {
    const yesCount = rawYesCount();
    let verdictClass, verdictLabel, verdictShort, bodyText, steps;

    if (weightedScore === 0) {
      verdictClass = 'none';
      verdictLabel = 'No Symptoms Reported';
      verdictShort = 'You have not reported any PMS symptoms. Your hormonal cycle appears to be well-balanced at this time.';
      bodyText     = 'Not experiencing PMS symptoms is a good sign that your progesterone and oestrogen levels are in healthy balance during your luteal phase. Hormonal balance can be affected by stress, diet, sleep, and age, so it is worth keeping an eye on symptoms if anything changes.';
      steps = [
        { title: 'Maintain your healthy habits', body: 'Regular exercise, a low-sugar diet, quality sleep, and stress management are the foundations of hormonal health — keep them up.' },
        { title: 'Know the signs', body: 'PMS symptoms can develop or worsen with age, especially in your 30s and 40s as progesterone levels begin to fluctuate.' },
        { title: 'Annual hormone check', body: 'A simple hormone panel once a year gives you a clear baseline and helps catch any imbalances before they become problematic.' }
      ];
    } else if (weightedScore >= 1 && weightedScore <= 14) {
      verdictClass = 'mild';
      verdictLabel = 'Mild Symptoms';
      verdictShort = 'You are experiencing mild PMS symptoms. These are likely manageable but may still affect your comfort and mood in the days before your period.';
      bodyText     = 'Mild PMS is most commonly caused by the natural drop in progesterone in the second half of your cycle. Symptoms such as fluid retention, breast tenderness, mild irritability, and fatigue are very common and often respond well to dietary adjustments, magnesium supplementation, and regular exercise. A hormone panel can confirm whether a progesterone imbalance is contributing to your symptoms.';
      steps = [
        { title: 'Try targeted supplementation', body: 'Magnesium glycinate (300–400mg/day), vitamin B6, and evening primrose oil are evidence-based supplements shown to reduce mild PMS symptoms significantly.' },
        { title: 'Reduce sugar and caffeine', body: 'Blood sugar swings and caffeine both amplify PMS symptoms. Reducing intake in the week before your period can make a noticeable difference.' },
        { title: 'Consider a hormone panel', body: 'A female hormone panel measuring progesterone, oestradiol, and DHEA-S will confirm whether low progesterone in your luteal phase is driving your symptoms.' }
      ];
    } else if (weightedScore >= 15 && weightedScore <= 30) {
      verdictClass = 'moderate';
      verdictLabel = 'Moderate to Severe Symptoms';
      verdictShort = 'Your symptoms are significantly impacting your quality of life. This level of PMS often indicates a hormone imbalance that would benefit from professional assessment and treatment.';
      bodyText     = 'A score in this range suggests oestrogen dominance or progesterone deficiency — the most common hormonal drivers of moderate-to-severe PMS. You may be experiencing a combination of physical symptoms (bloating, breast pain, headaches, joint pain) alongside emotional symptoms (mood swings, anxiety, depression, irritability). These are not "normal" and do not need to be tolerated. Bioidentical progesterone therapy, alongside targeted nutritional support, has an excellent track record in significantly reducing symptoms at this level.';
      steps = [
        { title: 'Get a comprehensive hormone panel', body: 'A full female hormone profile including progesterone, oestradiol, testosterone, DHEA-S, cortisol, and thyroid will identify exactly which imbalances are driving your symptoms.' },
        { title: 'Speak to a specialist', body: 'Our healthcare specialists understand the complexity of PMS and can discuss bioidentical progesterone therapy, dietary strategies, and evidence-based supplements tailored to your results.' },
        { title: 'Track your cycle symptoms', body: 'Keep a daily diary noting symptom severity across your cycle. This helps your clinician identify the pattern and confirm a PMS diagnosis versus other hormonal conditions.' }
      ];
    } else {
      verdictClass = 'severe';
      verdictLabel = 'Severe Symptoms / Possible PMDD';
      verdictShort = 'Your symptom score is very high. This level of severity may indicate PMDD (Premenstrual Dysphoric Disorder), a more serious form of PMS that requires clinical attention.';
      bodyText     = 'PMDD affects around 3–8% of women of reproductive age and is characterised by severe mood and physical symptoms in the luteal phase that resolve after menstruation begins. The emotional symptoms — intense depression, anxiety, hostility, and crying — are often the most debilitating. PMDD is a recognised medical condition with effective treatments available including bioidentical progesterone, SSRIs for specific symptom periods, and hormone-targeted therapies. Please do not suffer in silence — effective help is available and you deserve to feel well throughout your entire cycle.';
      steps = [
        { title: 'Seek specialist support now', body: 'A clinician who specialises in female hormonal health can accurately diagnose PMDD and create a personalised treatment plan. Book a free consultation with our team today.' },
        { title: 'Comprehensive hormone + mental health assessment', body: 'A full hormone panel alongside a mental health screen will give the most complete picture. PMDD has both biological and psychological dimensions that respond to different interventions.' },
        { title: 'Know your options', body: 'Effective treatments include bioidentical progesterone (especially as progesterone pessaries/suppositories), GnRH agonists, SSRIs, and targeted nutritional therapy. You do not have to manage this alone.' }
      ];
    }

    document.getElementById('scoreNumber').textContent = yesCount;
    setTimeout(() => {
      document.getElementById('scoreBarFill').style.width = ((yesCount / 15) * 100) + '%';
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
