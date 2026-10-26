// Rebuild all nine local questionnaires from the archived original form definitions.
const fs = require('fs');
const path = require('path');
const {CANONICAL_ROUTES, FORM_ALIASES} = require('./localize-checklist-links.cjs');
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');

module.exports = function () {
  const hormones = JSON.parse(fs.readFileSync('source-content/checklist-refresh/hormone-specs.json','utf8')).assessments;
  const specialty = JSON.parse(fs.readFileSync('source-content/checklist-refresh/specialty-specs.json','utf8'));
  const education = JSON.parse(fs.readFileSync('source-content/checklist-refresh/education.json','utf8'));
  const template = fs.readFileSync('Return Policy.html','utf8').replace(/<link[^>]+href="assessment\.css(?:\?[^"]*)?"[^>]*>/g,'');
  if (!/<main\b[^>]*>[\s\S]*?<\/main>/.test(template)) throw Error('Checklist template has no main element');
  fs.mkdirSync('assets/checklists',{recursive:true});
  const written = [];
  const titles = {women:'Hormone Symptom Checklist for Women',men:'Hormone Symptom Checklist for Men',pms:'PMS Self-Assessment',thyroid:'Thyroid Assessment',adrenal:'Adrenal Fatigue Assessment',osteoporosis:'Osteoporosis Assessment',andropause:'Andropause Assessment',menopause:'Menopause Assessment',perimenopause:'Perimenopause Assessment'};
  for (const [id,route] of Object.entries(CANONICAL_ROUTES)) {
    const slug = route.split('/')[1];
    let spec;
    if (hormones[id]) {
      const original = hormones[id];
      const groups = original.screens.filter(s=>s.type==='checkbox-group').map(s=>({name:s.category,label:s.label,options:s.options})).sort((a,b)=>a.name.localeCompare(b.name));
      // Keep section context with its first question instead of rendering an
      // empty, optionless wizard step between selectable symptom groups.
      let sectionTitle = '';
      const steps = [];
      for (const screen of original.screens) {
        if (screen.type === 'introduction') sectionTitle = screen.heading;
        if (screen.type !== 'checkbox-group') continue;
        steps.push({type:'multiple',name:screen.category,title:screen.heading,
          sectionTitle,description:screen.label||'',hint:screen.hint,options:screen.options});
        sectionTitle = '';
      }
      spec = {id, title:titles[id], mode:'hormone', groups,
        resultLabels:Object.values(original.scoring.results).map(r=>r.label),
        steps,contactOrder:['email','first_name'],mailingOptions:original.screens.find(s=>s.id==='mailing').options,
        introduction:"Select the factors or symptoms that apply to you or continue over time. Your answers can help you prepare for a conversation with a healthcare professional.",
        count:groups.reduce((n,g)=>n+g.options.length,0)+' factors and symptoms'};
    } else {
      const original = specialty[slug];
      if (!original) throw Error('Missing original assessment: '+slug);
      spec = {id,title:titles[id],mode:original.scoring.mode,questions:original.questions,options:original.options,
        max:original.scoring.max,results:original.scoring.results.map(({min,max,label})=>({min,max,label})),
        steps:original.questions.map(q=>({type:'single',name:q.name,title:q.text,options:original.options})),
        contactOrder:['first_name','email'],mailingOptions:original.mailingOptions,
        introduction:id==='pms'?"Answer these questions about symptoms you notice in the days before your period.":id==='osteoporosis'?"Answer questions about your health history and daily habits to prepare for a conversation about bone health.":"Answer questions about your symptoms and health, then use your answers to prepare questions for a healthcare professional.",
        count:original.questions.length+' questions'};
    }
    fs.writeFileSync(`assets/checklists/${id}.js`,'window.HRT_ASSESSMENT='+JSON.stringify(spec)+';\n');
    const reading = education[slug]?.html || '';
    const visual = JSON.parse(fs.readFileSync(`source-content/checklist-images/${id}.json`,'utf8'));
    for (const size of [480,960]) {
      if (!fs.existsSync(`uploads/checklists/${id}-${size}.webp`)) throw Error('Missing checklist image: '+id+' '+size);
    }
    const content = `<main id="main-content" class="checklist-page" data-checklist="${id}" tabindex="-1">
      <div class="wrap checklist-shell">
        <a class="checklist-back" href="Symptom Check.html">&#8592; All symptom checklists</a>
        <header class="checklist-heading"><div class="checklist-heading-copy"><span class="eyebrow">Understand your symptoms</span><h1>${escape(spec.title)}</h1><p>${escape(spec.introduction)}</p></div><figure class="checklist-visual"><img src="uploads/checklists/${id}-480.webp" srcset="uploads/checklists/${id}-480.webp 480w, uploads/checklists/${id}-960.webp 960w" sizes="(max-width:650px) calc(100vw - 32px), (max-width:900px) 240px, 320px" width="${visual.width}" height="${visual.height}" alt="${escape(visual.alt)}" decoding="async" fetchpriority="high"></figure></header>
        <div class="checklist-workspace">
          <aside class="checklist-aside" aria-label="Assessment progress"><span class="eyebrow">Your assessment</span><h2>${escape(spec.count)}</h2><p>Take your time. You can go back and update your answers.</p><p id="checklist-progress-text">Ready when you are</p><progress id="checklist-progress" max="100" value="0" aria-label="Checklist progress"></progress><p class="checklist-local-note">Your results appear on this page. Nothing is sent while online delivery is unavailable.</p></aside>
          <div class="checklist-panel" id="checklist-panel">
            <form id="hormone-assessment" class="checklist-form" novalidate><div id="assessment-screen"><p class="assessment-description">The interactive checklist has not loaded. Please reload the page, or <a href="Contact.html">contact the care team</a> for help.</p></div><p id="assessment-error" role="alert" hidden></p><div class="checklist-actions"><button class="btn btn-ghost" id="assessment-back" type="button" hidden>Back</button><button class="btn btn-primary" id="assessment-next" type="submit" disabled>Start the checklist</button></div></form>
            <section id="assessment-results" tabindex="-1" aria-labelledby="assessment-result-heading" hidden></section>
            <noscript><p>Please enable JavaScript to complete the interactive checklist. You can also <a href="Contact.html">contact the care team</a>.</p></noscript>
          </div>
        </div>
        <p class="checklist-disclaimer">This questionnaire is for education and discussion. It cannot diagnose a condition or confirm hormone levels. Discuss symptoms and results with a qualified healthcare professional.</p>
        ${reading ? `<details class="checklist-education"><summary>Read more about this assessment</summary><article class="source-prose">${reading}</article></details>` : ''}
      </div></main>`;
    const scripts = ['checklist-core.js',`assets/checklists/${id}.js`,'checklist-integration.js','assessment.js'].map(src=>`<script src="${src}" defer></script>`).join('');
    const aliases = Object.entries(FORM_ALIASES).filter(([,canonical])=>canonical===route).map(([alias])=>alias+'/index.html');
    for (const file of [route,...aliases]) {
      const base = '../'.repeat(file.split('/').length-1) || './';
      const html = template.replace(/<base href="[^"]*">/,`<base href="${base}">`)
        .replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(spec.title)} | HRT.org</title>`)
        .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(spec.introduction)}">`)
        .replace(/<main\b[^>]*>[\s\S]*?<\/main>/,content)
        .replace('</head>','<link rel="stylesheet" href="assessment.css"></head>')
        .replace('</body>',scripts+'</body>');
      if (!html.includes(`data-checklist="${id}"`)) throw Error('Checklist main was not replaced: '+file);
      fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html);written.push(file);
    }
  }
  console.log('Built nine local checklists and their '+(written.length-9)+' aliases.');
  return written;
};
