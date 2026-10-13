
  const WEBHOOK_URL = 'https://vmi3206755.contaboserver.net/webhook/andropause-typeform-submit';

  const QUESTIONS = [
    { name: 'q1_falling_asleep',      text: 'How often do you fall asleep after dinner?' },
    { name: 'q2_decreased_enjoyment', text: 'Do you experience a decreased enjoyment of life?' },
    { name: 'q3_losing_height',       text: 'Do you feel like you are losing height?' },
    { name: 'q4_strength_endurance',  text: 'Have you experienced a decrease in strength and endurance?' },
    { name: 'q5_sex_drive',           text: 'Do you have a decreased sex drive (libido)?' },
    { name: 'q6_sports_performance',  text: 'Do you notice decreased performance in your ability to play sports?' },
    { name: 'q7_depressed_grumpy',    text: 'How often do you feel depressed, sad or more grumpy than normal?' },
    { name: 'q8_lack_of_energy',      text: 'Do you experience a lack of energy?' },
    { name: 'q9_work_performance',    text: 'Have you noticed a deterioration in your work performance?' },
    { name: 'q10_erection_difficulty',text: 'Are you having difficulty maintaining your erection?' }
  ];

  const SCALE_OPTIONS = [
    { letter: 'A', text: 'Never' },
    { letter: 'B', text: 'Occasionally' },
    { letter: 'C', text: 'Frequently' },
    { letter: 'D', text: 'Constantly' }
  ];

  const MAILING_OPTIONS = [
    { letter: 'A', text: 'Yes, add me to your mailing list' },
    { letter: 'B', text: 'No, just send me the results' }
  ];

  let currentQIdx = 0;
  let currentScreen = 'intro';
  let answers = QUESTIONS.map(() => null);
  let userName = '';
  let userEmail = '';
  let mailingChoice = '';
  let isSubmitting = false;

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + name);
    if (target) target.classList.add('active');
    currentScreen = name;

    const showNav = ['question','name','email','mailing'].includes(name);
    document.getElementById('bottomNav').style.display = showNav ? 'flex' : 'none';
    document.getElementById('progress').style.display = showNav ? 'block' : 'none';

    document.getElementById('nav-up').disabled =
      (name === 'question' && currentQIdx === 0) || name === 'intro';
    document.getElementById('nav-down').disabled = (name === 'mailing');

    updateProgress();
  }

  function updateProgress() {
    const TOTAL = QUESTIONS.length + 3;
    let step = 0;
    if (currentScreen === 'question') step = currentQIdx;
    else if (currentScreen === 'name')    step = QUESTIONS.length;
    else if (currentScreen === 'email')   step = QUESTIONS.length + 1;
    else if (currentScreen === 'mailing') step = QUESTIONS.length + 2;
    else if (currentScreen === 'submitting' || currentScreen === 'complete') step = TOTAL;
    document.getElementById('progress-fill').style.width = ((step / TOTAL) * 100) + '%';
  }

  function renderQuestion(idx) {
    document.getElementById('q-num').textContent = String(idx + 1);
    document.getElementById('q-text').textContent = QUESTIONS[idx].text;

    const optsContainer = document.getElementById('q-options');
    optsContainer.innerHTML = '';

    SCALE_OPTIONS.forEach((opt) => {
      const div = document.createElement('div');
      div.className = 'option';
      if (answers[idx] === opt.text) div.classList.add('selected');
      div.dataset.text = opt.text;
      div.innerHTML =
        '<span class="option-letter">' + opt.letter + '</span>' +
        '<span class="option-text">' + opt.text + '</span>' +
        '<svg class="check-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="20 6 9 17 4 12"></polyline>' +
        '</svg>';
      div.addEventListener('click', () => selectOption(idx, opt.text));
      optsContainer.appendChild(div);
    });
  }

  function selectOption(idx, text) {
    answers[idx] = text;
    const optsContainer = document.getElementById('q-options');
    optsContainer.querySelectorAll('.option').forEach(el => {
      el.classList.toggle('selected', el.dataset.text === text);
    });
    setTimeout(() => {
      if (currentScreen === 'question' && answers[idx] === text) handleNext();
    }, 350);
  }

  function renderMailing() {
    const optsContainer = document.getElementById('mailing-options');
    optsContainer.innerHTML = '';
    MAILING_OPTIONS.forEach((opt) => {
      const div = document.createElement('div');
      div.className = 'option';
      if (mailingChoice === opt.text) div.classList.add('selected');
      div.dataset.text = opt.text;
      div.innerHTML =
        '<span class="option-letter">' + opt.letter + '</span>' +
        '<span class="option-text">' + opt.text + '</span>' +
        '<svg class="check-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="20 6 9 17 4 12"></polyline>' +
        '</svg>';
      div.addEventListener('click', () => {
        mailingChoice = opt.text;
        optsContainer.querySelectorAll('.option').forEach(el => {
          el.classList.toggle('selected', el.dataset.text === opt.text);
        });
      });
      optsContainer.appendChild(div);
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

  document.getElementById('nameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleNext(); }
  });
  document.getElementById('emailInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleNext(); }
  });

  document.getElementById('retryBtn').addEventListener('click', () => {
    currentQIdx = 0;
    answers = QUESTIONS.map(() => null);
    userName = '';
    userEmail = '';
    mailingChoice = '';
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
      payload[q.name] = answers[i] || 'Never';
    });

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(d => {
      console.log('[Andropause] webhook ok:', d);
    }).catch(err => {
      console.warn('[Andropause] webhook error (results still shown):', err);
    });

    const totalScore = computeLocalScore();
    showInlineResults(totalScore);
    isSubmitting = false;
  }

  function showInlineResults(score) {
    const isHigh = score > 7;

    document.getElementById('scoreNumber').textContent = score;
    setTimeout(() => {
      document.getElementById('scoreBarFill').style.width = Math.min((score / 30) * 100, 100) + '%';
    }, 200);

    const verdictEl = document.getElementById('resultVerdict');
    verdictEl.className = 'result-verdict ' + (isHigh ? 'high' : 'low');
    document.getElementById('verdictBadge').textContent = isHigh ? 'Symptoms Present' : 'Low Likelihood';
    document.getElementById('verdictText').textContent = isHigh
      ? 'Your score suggests andropause may be affecting your quality of life. Declining testosterone levels are the most likely cause of the symptoms you are experiencing.'
      : 'Your score is low, suggesting andropause is unlikely to be significantly impacting your health right now. Testosterone levels do decline gradually with age, so it is worth monitoring.';

    document.getElementById('resultBodyText').textContent = isHigh
      ? 'Many of the symptoms you reported — such as decreased energy, reduced libido, mood changes, and diminished physical performance — can be directly linked to falling testosterone levels. Low testosterone is measurable, treatable, and very common in men over 40. A simple hormone panel will confirm your levels and open the door to personalised treatment options including testosterone replacement therapy (TRT).'
      : 'While your current score is low, testosterone naturally declines by 1–2% per year after age 30. If you notice changes in energy, mood, sexual function, or physical performance in the future, consider getting a hormone panel to establish your baseline levels.';

    const steps = isHigh ? [
      { title: 'Get a hormone panel', body: 'A simple blood spot test measuring total testosterone, free testosterone, DHEA-S, and SHBG will give you a clear picture of where your levels stand.' },
      { title: 'Speak to a specialist', body: 'Our healthcare specialists can review your results privately and discuss testosterone replacement therapy and other treatment options tailored to you.' },
      { title: 'Lifestyle support', body: 'Regular resistance training, adequate sleep, reduced alcohol intake, and a diet rich in zinc and vitamin D can help support healthy testosterone production.' }
    ] : [
      { title: 'Monitor your symptoms', body: 'Keep an eye on energy levels, mood, libido, and physical performance over the coming months. If you notice changes, retake this assessment.' },
      { title: 'Establish a baseline', body: 'Even at a low score, a hormone panel is a valuable reference point. Knowing your testosterone levels now makes future comparisons meaningful.' },
      { title: 'Healthy habits', body: 'Regular exercise, quality sleep, and a balanced diet rich in zinc and vitamin D all support healthy testosterone production as you age.' }
    ];

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

  function computeLocalScore() {
    const map = { 'never': 0, 'occasionally': 1, 'frequently': 2, 'constantly': 3 };
    let total = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      const v = answers[i];
      if (!v) continue;
      total += map[String(v).trim().toLowerCase()] || 0;
    }
    return total;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
    );
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && currentScreen === 'question') {
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        if (answers[currentQIdx]) handleNext();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (currentScreen !== 'question') return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const map = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    const idx = map[e.key.toLowerCase()];
    if (typeof idx === 'number') {
      e.preventDefault();
      selectOption(currentQIdx, SCALE_OPTIONS[idx].text);
    }
  });

  updateProgress();
