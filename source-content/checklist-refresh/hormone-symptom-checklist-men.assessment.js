
  // ============================================================
  // Point this at your n8n Production webhook URL
  // (matches the "path" on the Webhook node: hormone-men-typeform-submit)
  // ============================================================
  const WEBHOOK_URL = 'https://vmi3206755.contaboserver.net/webhook/hormone-men-typeform-submit';

  // ============================================================
  // CATEGORY MAPPING
  // cat1 = Psychological / cognitive
  // cat2 = Sexual & urinary / energy
  // cat3 = Metabolic & physical body symptoms
  // cat4 = Cardiovascular & chronic disease risk
  // Edit freely — this drives which result (1-5) someone gets.
  // ============================================================
  const Q1_OPTIONS = [ // Psychological Factors or Symptoms -> cat1
    'Feeling burned out','Irritable','Apathy','Depression','Anxiety','Stress',
    'Sugar cravings','Insomnia','Sleep disturbances','Hot flashes',
    'Lack of motivation','Foggy thinking','Decreased mental sharpness','Decreased libido'
  ];

  const Q2A_OPTIONS = [ // Sexual, urinary & energy symptoms -> cat2
    'Decreased erections','Erectile dysfunction','Decreased urine flow','Increased urinary urge',
    'Constipation','Prostate problems','Infertility problems','Feeling cold','Night sweats',
    'Decreased stamina','Morning fatigue','Evening fatigue','Fatigue'
  ];

  const Q2B_OPTIONS = [ // Metabolic & physical body symptoms -> cat3
    'Low physical activity','Inability to lose weight','Decreased muscle mass','Weight gain',
    'Weight gain (waist specifically)','Waist size greater than 40 inches','Oily skin','Dry skin',
    'Brittle nails','Aches and pains','Headaches','Bone loss','Fibromyalgia'
  ];

  const Q2C_OPTIONS = [ // Cardiovascular & chronic disease risk -> cat4
    'Allergies','Autoimmune disease','Susceptibility to infections','Chronic health problems',
    'History of smoking','Elevated cholesterol','High blood pressure','Elevated triglycerides',
    'Heart palpitations','Heart disease','Family history of heart disease','Low blood sugar',
    'High blood sugar','Diabetes','Family history of diabetes'
  ];

  const MAILING_OPTIONS = [
    { letter: 'A', text: 'Yes, add me to your mailing list!' },
    { letter: 'B', text: 'No, just send me the results' }
  ];

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // ---- state ----
  const SCREEN_ORDER = ['q1','q2intro','q2a','q2b','q2c','email','name','mailing'];
  let currentScreen = 'intro';
  let selected = { q1: new Set(), q2a: new Set(), q2b: new Set(), q2c: new Set() };
  let userName = '', userEmail = '', mailingChoice = '', isSubmitting = false;

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const t = document.getElementById('screen-' + name);
    if (t) t.classList.add('active');
    currentScreen = name;
    const showNav = SCREEN_ORDER.includes(name);
    document.getElementById('bottomNav').style.display = showNav ? 'flex' : 'none';
    document.getElementById('progress').style.display  = showNav ? 'block' : 'none';
    document.getElementById('nav-up').disabled = (name === 'q1') || name === 'intro' || !showNav;
    document.getElementById('nav-down').disabled = (name === 'mailing') || !showNav;
    updateProgress();
  }

  function updateProgress() {
    const idx = SCREEN_ORDER.indexOf(currentScreen);
    const total = SCREEN_ORDER.length;
    let step = idx >= 0 ? idx : (currentScreen === 'complete' || currentScreen === 'submitting' ? total : 0);
    document.getElementById('progress-fill').style.width = ((step / total) * 100) + '%';
  }

  function renderCheckboxGroup(containerId, options, setRef) {
    const c = document.getElementById(containerId);
    c.innerHTML = '';
    options.forEach((text, i) => {
      const div = document.createElement('div');
      div.className = 'option';
      if (setRef.has(text)) div.classList.add('selected');
      div.dataset.text = text;
      div.innerHTML = `<span class="option-letter">${LETTERS[i]}</span><span class="option-text">${escapeHtml(text)}</span><svg class="check-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      div.addEventListener('click', () => {
        if (setRef.has(text)) setRef.delete(text); else setRef.add(text);
        div.classList.toggle('selected');
      });
      c.appendChild(div);
    });
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
      div.addEventListener('click', () => {
        mailingChoice = opt.text;
        c.querySelectorAll('.option').forEach(el => el.classList.toggle('selected', el.dataset.text === opt.text));
      });
      c.appendChild(div);
    });
  }

  renderCheckboxGroup('q1-options', Q1_OPTIONS, selected.q1);
  renderCheckboxGroup('q2a-options', Q2A_OPTIONS, selected.q2a);
  renderCheckboxGroup('q2b-options', Q2B_OPTIONS, selected.q2b);
  renderCheckboxGroup('q2c-options', Q2C_OPTIONS, selected.q2c);
  renderMailing();

  document.getElementById('startBtn').addEventListener('click', () => showScreen('q1'));
  document.getElementById('q1-ok').addEventListener('click', () => showScreen('q2intro'));
  document.getElementById('q2intro-ok').addEventListener('click', () => showScreen('q2a'));
  document.getElementById('q2a-ok').addEventListener('click', () => showScreen('q2b'));
  document.getElementById('q2b-ok').addEventListener('click', () => showScreen('q2c'));
  document.getElementById('q2c-ok').addEventListener('click', () => { showScreen('email'); setTimeout(() => document.getElementById('emailInput').focus(), 100); });

  document.getElementById('nav-down').addEventListener('click', () => {
    if (currentScreen === 'q1') showScreen('q2intro');
    else if (currentScreen === 'q2intro') showScreen('q2a');
    else if (currentScreen === 'q2a') showScreen('q2b');
    else if (currentScreen === 'q2b') showScreen('q2c');
    else if (currentScreen === 'q2c') { showScreen('email'); setTimeout(() => document.getElementById('emailInput').focus(), 100); }
    else if (currentScreen === 'email') handleEmailNext();
    else if (currentScreen === 'name') handleNameNext();
  });
  document.getElementById('nav-up').addEventListener('click', () => {
    if (currentScreen === 'q2intro') showScreen('q1');
    else if (currentScreen === 'q2a') showScreen('q2intro');
    else if (currentScreen === 'q2b') showScreen('q2a');
    else if (currentScreen === 'q2c') showScreen('q2b');
    else if (currentScreen === 'email') showScreen('q2c');
    else if (currentScreen === 'name') showScreen('email');
    else if (currentScreen === 'mailing') showScreen('name');
  });

  function handleEmailNext() {
    const v = document.getElementById('emailInput').value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!valid) { document.getElementById('emailInput').classList.add('error'); document.getElementById('emailError').classList.add('show'); return; }
    document.getElementById('emailInput').classList.remove('error'); document.getElementById('emailError').classList.remove('show');
    userEmail = v; showScreen('name'); setTimeout(() => document.getElementById('nameInput').focus(), 100);
  }
  function handleNameNext() {
    const v = document.getElementById('nameInput').value.trim();
    if (!v) { document.getElementById('nameInput').classList.add('error'); document.getElementById('nameError').classList.add('show'); return; }
    document.getElementById('nameInput').classList.remove('error'); document.getElementById('nameError').classList.remove('show');
    userName = v; showScreen('mailing');
  }

  document.getElementById('email-ok').addEventListener('click', handleEmailNext);
  document.getElementById('name-ok').addEventListener('click', handleNameNext);
  document.getElementById('emailInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); handleEmailNext(); } });
  document.getElementById('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); handleNameNext(); } });
  document.getElementById('mailing-ok').addEventListener('click', submitAssessment);

  document.getElementById('retryBtn').addEventListener('click', () => {
    selected = { q1: new Set(), q2a: new Set(), q2b: new Set(), q2c: new Set() };
    userName = ''; userEmail = ''; mailingChoice = '';
    document.getElementById('nameInput').value = '';
    document.getElementById('emailInput').value = '';
    renderCheckboxGroup('q1-options', Q1_OPTIONS, selected.q1);
    renderCheckboxGroup('q2a-options', Q2A_OPTIONS, selected.q2a);
    renderCheckboxGroup('q2b-options', Q2B_OPTIONS, selected.q2b);
    renderCheckboxGroup('q2c-options', Q2C_OPTIONS, selected.q2c);
    showScreen('q1');
  });

  function computeCategoryScores() {
    return {
      cat1: selected.q1.size,
      cat2: selected.q2a.size,
      cat3: selected.q2b.size,
      cat4: selected.q2c.size
    };
  }

  // Same logic as the n8n "Calculate Scores" node's Determine Result step
  function determineResult(cat1, cat2, cat3, cat4) {
    if (cat1 > 0 && cat2 > 0 && cat3 > 0 && cat4 > 0) return 5;
    if (cat1 + cat2 > cat3 + cat4) return cat1 > cat2 ? 1 : 2;
    return cat3 > cat4 ? 3 : 4;
  }

  async function submitAssessment() {
    if (isSubmitting || !mailingChoice) return;
    isSubmitting = true;
    showScreen('submitting');
    const { cat1, cat2, cat3, cat4 } = computeCategoryScores();
    const payload = {
      first_name: userName,
      email: userEmail,
      mailing_list: mailingChoice,
      cat1, cat2, cat3, cat4
    };
    fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(r => r.json()).then(d => console.log('[Hormone Men] webhook ok:', d))
      .catch(err => console.warn('[Hormone Men] webhook error (results still shown):', err));
    showInlineResults(cat1, cat2, cat3, cat4);
    isSubmitting = false;
  }

  function showInlineResults(cat1, cat2, cat3, cat4) {
    const result = determineResult(cat1, cat2, cat3, cat4);

    const RESULTS = {
      1: {
        label: 'Category 1 — Psychological Dominant',
        verdict: 'Your symptoms are primarily psychological and cognitive — things like mood changes, low motivation, and mental fog. These are common early signs of hormonal imbalance in men.',
        body: 'Psychological symptoms such as irritability, apathy, brain fog, and low libido are frequently linked to declining testosterone and disrupted cortisol patterns. These changes affect neurotransmitter activity and can significantly impact mood, focus, and drive well before more obvious physical symptoms appear. A hormone panel that includes total and free testosterone, along with cortisol, can clarify what is driving these symptoms.',
        steps: [
          { title: 'Get a full hormone panel', body: 'Total & free testosterone, SHBG, and cortisol will show whether hormonal imbalance is contributing to your psychological symptoms.' },
          { title: 'Prioritize sleep and stress management', body: 'Poor sleep and chronic stress both suppress testosterone production and worsen mood-related symptoms.' },
          { title: 'Speak to a specialist', body: 'A personalized consultation can help you understand whether hormone optimization therapy is appropriate for you.' }
        ]
      },
      2: {
        label: 'Category 2 — Sexual & Urinary Dominant',
        verdict: 'Your symptoms are primarily sexual and urinary in nature — this pattern is classically associated with low testosterone (Low-T) in men.',
        body: 'Symptoms like decreased erections, erectile dysfunction, reduced stamina, and urinary changes are among the most recognized signs of testosterone deficiency. These symptoms often develop gradually and are frequently dismissed as a normal part of aging, when in fact they are treatable with the right diagnosis and care.',
        steps: [
          { title: 'Test your testosterone levels', body: 'A morning blood draw for total and free testosterone is the standard first step in diagnosing Low-T.' },
          { title: 'Rule out prostate issues', body: 'A PSA test and prostate exam help rule out other causes of urinary symptoms before starting any treatment.' },
          { title: 'Book a free consultation', body: 'Our specialists can walk you through treatment options, including testosterone replacement therapy (TRT), if appropriate.' }
        ]
      },
      3: {
        label: 'Category 3 — Metabolic & Physical Dominant',
        verdict: 'Your symptoms point to metabolic and physical changes — weight gain, muscle loss, and low activity are common when testosterone and thyroid function decline together.',
        body: 'Metabolic symptoms such as increasing waist size, difficulty losing weight, and decreased muscle mass often reflect a combination of declining testosterone and slowing metabolism. Left unaddressed, this pattern can progress toward metabolic syndrome, making early evaluation valuable.',
        steps: [
          { title: 'Check testosterone and thyroid together', body: 'Low testosterone and thyroid dysfunction often overlap and worsen each other — both should be tested.' },
          { title: 'Get a metabolic panel', body: 'Fasting glucose, HbA1c, and a lipid panel will show whether metabolic syndrome markers are present.' },
          { title: 'Combine strength training with treatment', body: 'Resistance training helps preserve muscle mass and works synergistically with any hormone therapy you pursue.' }
        ]
      },
      4: {
        label: 'Category 4 — Cardiovascular & Chronic Disease Risk Dominant',
        verdict: 'Your symptoms point mainly toward cardiovascular and chronic disease risk factors, which are closely linked to hormonal health in men.',
        body: 'Elevated cholesterol, blood pressure, blood sugar, or a personal/family history of heart disease and diabetes are all connected to testosterone levels — low testosterone is associated with increased cardiovascular risk, and treating it appropriately (alongside standard cardiac care) is an important part of a complete picture.',
        steps: [
          { title: 'Get a cardiometabolic workup', body: 'Lipid panel, blood pressure, fasting glucose/HbA1c, and testosterone should all be assessed together.' },
          { title: 'Talk to your doctor about your family history', body: 'Family history of heart disease or diabetes changes how aggressively these risk factors should be managed.' },
          { title: 'Ask about hormone-related cardiovascular risk', body: 'Our specialists can help you understand how hormone levels interact with your cardiovascular risk profile.' }
        ]
      },
      5: {
        label: 'Category 5 — Multiple Systems Affected',
        verdict: 'You are experiencing symptoms across all four areas — psychological, sexual, metabolic, and cardiovascular. This broad pattern is common with significant hormonal imbalance and deserves a comprehensive evaluation.',
        body: 'When symptoms span psychological, sexual, metabolic, and cardiovascular categories simultaneously, it usually indicates that hormonal decline has been affecting your body for some time across multiple systems. This is the most common pattern seen in men with clinically significant Low Testosterone or broader endocrine imbalance, and it typically responds well to a structured, comprehensive treatment plan.',
        steps: [
          { title: 'Get a comprehensive hormone & metabolic panel', body: 'Testosterone, SHBG, thyroid, lipids, blood sugar, and cortisol together will give a complete picture of what is driving your symptoms.' },
          { title: 'Speak with a specialist as soon as possible', body: 'With symptoms across every category, a personalized treatment plan — rather than addressing symptoms individually — will likely be most effective.' },
          { title: 'Start with lifestyle foundations', body: 'Sleep, strength training, and nutrition support any hormone therapy you and your specialist decide to pursue.' }
        ]
      }
    };

    const r = RESULTS[result];
    document.getElementById('categoryLabel').textContent = 'Category ' + result;
    document.getElementById('cat1Num').textContent = cat1;
    document.getElementById('cat2Num').textContent = cat2;
    document.getElementById('cat3Num').textContent = cat3;
    document.getElementById('cat4Num').textContent = cat4;
    document.getElementById('verdictBadge').textContent = r.label;
    document.getElementById('verdictText').textContent = r.verdict;
    document.getElementById('resultBodyText').textContent = r.body;
    const icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    document.getElementById('nextSteps').innerHTML = r.steps.map(s =>
      `<div class="next-step"><div class="next-step-icon">${icon}</div><div class="next-step-text"><strong>${escapeHtml(s.title)}</strong>${escapeHtml(s.body)}</div></div>`
    ).join('');
    if (userEmail) { document.getElementById('emailSentTo').textContent = userEmail; document.getElementById('emailNote').style.display = 'flex'; }
    showScreen('complete');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  updateProgress();
