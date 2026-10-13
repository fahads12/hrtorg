
  // ============================================================
  // Point this at your n8n Production webhook URL
  // (matches the "path" on the Webhook node: hormone-women-typeform-submit)
  // ============================================================
  const WEBHOOK_URL = 'https://vmi3206755.contaboserver.net/webhook/hormone-women-typeform-submit';

  // ============================================================
  // CATEGORY MAPPING
  // cat1 = Psychological
  // cat2 = Reproductive & hormonal physical symptoms (Q1a)
  // cat3 = Metabolic & general physical symptoms (Q1b)
  // cat4 = Cardiovascular & chronic disease risk (Q1c)
  // Edit freely — this drives which result (1-5) someone gets.
  // ============================================================
  const Q1A_OPTIONS = [ // Reproductive & hormonal -> cat2
    'Acne','Brittle nails','Dry skin','Thinning hair','Increased body/facial hair',
    'Inability to lose weight','Weight gain','Waist size over 35 inches','Heavy menses',
    'Menstrual irregularities','Vaginal dryness','Fibrocystic breasts','Cystic ovaries','Uterine fibroids'
  ];

  const Q1B_OPTIONS = [ // Metabolic & general physical -> cat3
    'Bone loss','Hot flashes','Headaches','Aches and pains','Infertility','Constipation',
    'Urinary incontinence','Night sweats','Heart palpitations','Low physical activity',
    'Morning fatigue','Evening fatigue','Fatigue','Cold hands and feet'
  ];

  const Q1C_OPTIONS = [ // Cardiovascular & chronic disease risk -> cat4
    'Chronic health problems','Susceptibility to infections','Allergies','Autoimmune diseases',
    'Low blood sugar','High blood sugar','Diabetes/prediabetes or family history of diabetes',
    'Elevated cholesterol','High blood pressure','Heart disease or family history of heart disease',
    'Elevated triglycerides','History of steroid usage','History of smoking'
  ];

  const Q2_OPTIONS = [ // Psychological -> cat1
    'Mood swings (PMS)','Foggy thinking','Depressed mood','Irritability',
    'Low libido/decreased sexual function','Food cravings','Sugar cravings',
    'Sleep disturbances','Anxiety','Feeling cold all the time'
  ];

  const MAILING_OPTIONS = [
    { letter: 'A', text: 'Yes, add me to your mailing list!' },
    { letter: 'B', text: 'No, just send me the results' }
  ];

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // ---- state ----
  const SCREEN_ORDER = ['q1intro','q1a','q1b','q1c','q2','email','name','mailing'];
  let currentScreen = 'landing';
  let selected = { q1a: new Set(), q1b: new Set(), q1c: new Set(), q2: new Set() };
  let userName = '', userEmail = '', mailingChoice = '', isSubmitting = false;

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const t = document.getElementById('screen-' + name);
    if (t) t.classList.add('active');
    currentScreen = name;
    const showNav = SCREEN_ORDER.includes(name);
    document.getElementById('bottomNav').style.display = showNav ? 'flex' : 'none';
    document.getElementById('progress').style.display  = showNav ? 'block' : 'none';
    document.getElementById('nav-up').disabled = (name === 'q1intro') || !showNav;
    document.getElementById('nav-down').disabled = (name === 'mailing') || !showNav;
    updateProgress();
  }

  function updateProgress() {
    const idx = SCREEN_ORDER.indexOf(currentScreen);
    const total = SCREEN_ORDER.length;
    let step = idx >= 0 ? idx : (['submitting','complete'].includes(currentScreen) ? total : 0);
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

  renderCheckboxGroup('q1a-options', Q1A_OPTIONS, selected.q1a);
  renderCheckboxGroup('q1b-options', Q1B_OPTIONS, selected.q1b);
  renderCheckboxGroup('q1c-options', Q1C_OPTIONS, selected.q1c);
  renderCheckboxGroup('q2-options', Q2_OPTIONS, selected.q2);
  renderMailing();

  document.getElementById('landing-start').addEventListener('click', () => showScreen('q1intro'));
  document.getElementById('q1intro-ok').addEventListener('click', () => showScreen('q1a'));
  document.getElementById('q1a-ok').addEventListener('click', () => showScreen('q1b'));
  document.getElementById('q1b-ok').addEventListener('click', () => showScreen('q1c'));
  document.getElementById('q1c-ok').addEventListener('click', () => showScreen('q2'));
  document.getElementById('q2-ok').addEventListener('click', () => { showScreen('email'); setTimeout(() => document.getElementById('emailInput').focus(), 100); });

  document.getElementById('nav-down').addEventListener('click', () => {
    if (currentScreen === 'q1intro') showScreen('q1a');
    else if (currentScreen === 'q1a') showScreen('q1b');
    else if (currentScreen === 'q1b') showScreen('q1c');
    else if (currentScreen === 'q1c') showScreen('q2');
    else if (currentScreen === 'q2') { showScreen('email'); setTimeout(() => document.getElementById('emailInput').focus(), 100); }
    else if (currentScreen === 'email') handleEmailNext();
    else if (currentScreen === 'name') handleNameNext();
  });
  document.getElementById('nav-up').addEventListener('click', () => {
    if (currentScreen === 'q1a') showScreen('q1intro');
    else if (currentScreen === 'q1b') showScreen('q1a');
    else if (currentScreen === 'q1c') showScreen('q1b');
    else if (currentScreen === 'q2') showScreen('q1c');
    else if (currentScreen === 'email') showScreen('q2');
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
    selected = { q1a: new Set(), q1b: new Set(), q1c: new Set(), q2: new Set() };
    userName = ''; userEmail = ''; mailingChoice = '';
    document.getElementById('nameInput').value = '';
    document.getElementById('emailInput').value = '';
    renderCheckboxGroup('q1a-options', Q1A_OPTIONS, selected.q1a);
    renderCheckboxGroup('q1b-options', Q1B_OPTIONS, selected.q1b);
    renderCheckboxGroup('q1c-options', Q1C_OPTIONS, selected.q1c);
    renderCheckboxGroup('q2-options', Q2_OPTIONS, selected.q2);
    renderMailing();
    showScreen('q1intro');
  });

  function computeCategoryScores() {
    return {
      cat1: selected.q2.size,   // psychological
      cat2: selected.q1a.size,  // reproductive & hormonal
      cat3: selected.q1b.size,  // metabolic & general physical
      cat4: selected.q1c.size   // cardiovascular & chronic disease
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
      .then(r => r.json()).then(d => console.log('[Hormone Women] webhook ok:', d))
      .catch(err => console.warn('[Hormone Women] webhook error (results still shown):', err));
    showInlineResults(cat1, cat2, cat3, cat4);
    isSubmitting = false;
  }

  function showInlineResults(cat1, cat2, cat3, cat4) {
    const result = determineResult(cat1, cat2, cat3, cat4);

    const RESULTS = {
      1: {
        label: 'Category 1 — Psychological Dominant',
        verdict: 'Your symptoms are primarily psychological — things like mood swings, foggy thinking, and anxiety. These are common early signs of hormonal imbalance in women.',
        body: 'Psychological symptoms such as mood swings, irritability, foggy thinking, and low libido are frequently linked to fluctuating estrogen and progesterone levels, along with disrupted cortisol patterns. These shifts affect neurotransmitter activity and can significantly impact mood, focus, and energy well before more obvious physical symptoms appear. A hormone panel covering estrogen, progesterone, and cortisol can help clarify what is driving these symptoms.',
        steps: [
          { title: 'Get a full hormone panel', body: 'Estrogen, progesterone, and cortisol levels will show whether hormonal imbalance is contributing to your psychological symptoms.' },
          { title: 'Prioritize sleep and stress management', body: 'Poor sleep and chronic stress both disrupt hormone production and worsen mood-related symptoms.' },
          { title: 'Speak to a specialist', body: 'A personalized consultation can help you understand whether hormone therapy is appropriate for you.' }
        ]
      },
      2: {
        label: 'Category 2 — Reproductive & Hormonal Dominant',
        verdict: 'Your symptoms are primarily reproductive and hormonal — this pattern is classically associated with estrogen and androgen imbalance in women.',
        body: 'Symptoms like menstrual irregularities, heavy menses, acne, and increased body/facial hair are among the most recognized signs of a reproductive hormone imbalance, such as excess androgens or estrogen dominance. These symptoms often develop gradually and are frequently dismissed, when in fact they are treatable with the right diagnosis and care.',
        steps: [
          { title: 'Test your reproductive hormone levels', body: 'A panel covering estrogen, testosterone, and androgens is the standard first step in diagnosing a reproductive hormone imbalance.' },
          { title: 'Ask about a pelvic ultrasound', body: 'If symptoms like cystic ovaries or fibroids are present, imaging can help identify underlying structural causes.' },
          { title: 'Book a free consultation', body: 'Our specialists can walk you through treatment options based on your specific hormone pattern.' }
        ]
      },
      3: {
        label: 'Category 3 — Metabolic & Physical Dominant',
        verdict: 'Your symptoms point to metabolic and physical changes — fatigue, weight gain, and low activity are common when hormone and thyroid function decline together.',
        body: 'Metabolic symptoms such as persistent fatigue, difficulty losing weight, and hot flashes often reflect a combination of declining hormone levels and slowing metabolism. Left unaddressed, this pattern can progress and make daily life increasingly difficult, making early evaluation valuable.',
        steps: [
          { title: 'Check hormone and thyroid levels together', body: 'Hormonal imbalance and thyroid dysfunction often overlap and worsen each other — both should be tested.' },
          { title: 'Get a metabolic panel', body: 'Fasting glucose, HbA1c, and a lipid panel will show whether metabolic markers need attention.' },
          { title: 'Combine movement with treatment', body: 'Regular physical activity helps manage weight and energy, and works well alongside any hormone therapy you pursue.' }
        ]
      },
      4: {
        label: 'Category 4 — Cardiovascular & Chronic Disease Risk Dominant',
        verdict: 'Your symptoms point mainly toward cardiovascular and chronic disease risk factors, which are closely linked to hormonal health in women.',
        body: 'Elevated cholesterol, blood pressure, blood sugar, or a personal/family history of heart disease and diabetes are all connected to hormone levels — hormonal decline is associated with increased cardiovascular risk, and treating it appropriately (alongside standard care) is an important part of a complete picture.',
        steps: [
          { title: 'Get a cardiometabolic workup', body: 'Lipid panel, blood pressure, fasting glucose/HbA1c, and a hormone panel should all be assessed together.' },
          { title: 'Talk to your doctor about your family history', body: 'Family history of heart disease or diabetes changes how aggressively these risk factors should be managed.' },
          { title: 'Ask about hormone-related cardiovascular risk', body: 'Our specialists can help you understand how hormone levels interact with your cardiovascular risk profile.' }
        ]
      },
      5: {
        label: 'Category 5 — Multiple Systems Affected',
        verdict: 'You are experiencing symptoms across all four areas — psychological, reproductive, metabolic, and cardiovascular. This broad pattern is common with significant hormonal imbalance and deserves a comprehensive evaluation.',
        body: 'When symptoms span psychological, reproductive, metabolic, and cardiovascular categories simultaneously, it usually indicates that hormonal decline has been affecting your body for some time across multiple systems. This is a common pattern seen in women with clinically significant hormone imbalance, and it typically responds well to a structured, comprehensive treatment plan.',
        steps: [
          { title: 'Get a comprehensive hormone & metabolic panel', body: 'Estrogen, progesterone, androgens, thyroid, lipids, blood sugar, and cortisol together will give a complete picture of what is driving your symptoms.' },
          { title: 'Speak with a specialist as soon as possible', body: 'With symptoms across every category, a personalized treatment plan — rather than addressing symptoms individually — will likely be most effective.' },
          { title: 'Start with lifestyle foundations', body: 'Sleep, movement, and nutrition support any hormone therapy you and your specialist decide to pursue.' }
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
