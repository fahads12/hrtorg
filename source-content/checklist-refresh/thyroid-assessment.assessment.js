
(function () {
  var WEBHOOK_URL = 'https://vmi3206755.contaboserver.net/webhook/thyroid-typeform-submit';

  var QUESTIONS = [
    { name: 'q1_thinking_slow',        text: 'Is your thinking slow?' },
    { name: 'q10_weight_difficulty',   text: 'Are you having difficulty losing weight, even when eating less / exercising more?' },
    { name: 'q13_excessive_sleep',     text: 'How often do you need a lot of sleep?' },
    { name: 'q18_slow_movements',      text: 'Do you notice your movements are slow?' },
    { name: 'q24_morning_fatigue',     text: 'Do you have low energy first thing in the morning, even after good sleep?' },
    { name: 'q11_miss_meal',           text: 'Do you feel unwell if you miss a meal?' },
    { name: 'q15_not_sweating',        text: 'Do you experience not sweating much, even when exercising?' },
    { name: 'q22_feeling_cold',        text: 'Do you feel cold more than most other people?' },
    { name: 'q27_cold_extremities',    text: 'Are your hands and feet often cold?' },
    { name: 'q3_bags_under_eyes',      text: 'Do you have bags under the eyes?' },
    { name: 'q6_yellowing',            text: 'Do you notice the yellowing of palms of your hands and/or soles of feet?' },
    { name: 'q9_bloated_face',         text: 'Does your face look bloated?' },
    { name: 'q19_thinning_eyebrows',   text: 'Are your eyebrows thinning?' },
    { name: 'q23_dry_skin_hair',       text: 'How often do you have dry skin or hair and/or experience hair loss?' },
    { name: 'q26_puffy_eyelids',       text: 'Are your eyelids swollen and puffy?' },
    { name: 'q2_joint_stiffness',      text: 'Do you experience joint stiffness and pain, which sometimes gets better after movement?' },
    { name: 'q4_dizziness',            text: 'Do you experience dizziness or poor sense of balance?' },
    { name: 'q17_headaches',           text: 'How often do you have headaches (often worse in morning)?' },
    { name: 'q5_nasal_congestion',     text: 'Do you suffer from nasal congestion?' },
    { name: 'q8_bowel_issues',         text: 'Do you experience difficulties with your bowel movements, or how often do they occur less than daily?' },
    { name: 'q16_frequent_infections', text: 'Do you suffer from frequent infections?' },
    { name: 'q7_depression',           text: 'How often do you feel depressed?' },
    { name: 'q12_memory_issues',       text: 'Do you notice your memory is not as good as it used to be?' },
    { name: 'q14_pms',                 text: 'How often do you suffer from PMS?' },
    { name: 'q20_concentration',       text: 'Do you have trouble concentrating?' },
    { name: 'q25_moody_irritable',     text: 'How often do you feel moody or irritable?' },
    { name: 'q21_low_sex_drive',       text: 'Do you experience a low sex drive?' }
  ];

  var SCALE_OPTIONS = [
    { letter: 'A', text: 'Never' },
    { letter: 'B', text: 'Occasionally' },
    { letter: 'C', text: 'Frequently' },
    { letter: 'D', text: 'Constantly' }
  ];

  var MAILING_OPTIONS = [
    { letter: 'A', text: 'Yes, add me to your mailing list' },
    { letter: 'B', text: 'No, just send me the results' }
  ];

  var currentQIdx = 0, currentScreen = 'intro';
  var answers = QUESTIONS.map(function(){ return null; });
  var userName = '', userEmail = '', mailingChoice = '', isSubmitting = false;

  function $(id){ return document.getElementById(id); }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  function computeLocalScore(){
    var map = { never:0, occasionally:1, frequently:2, constantly:3 }, total = 0;
    for(var i=0;i<QUESTIONS.length;i++){
      var v = answers[i]; if(!v) continue;
      var k = String(v).trim().toLowerCase(); if(k in map) total += map[k];
    }
    return total;
  }

  function showScreen(name){
    document.querySelectorAll('.tq-screen').forEach(function(s){ s.classList.remove('active'); });
    var t = $('tq-'+name); if(t) t.classList.add('active');
    currentScreen = name;
    var showNav = ['question','name','email','mailing'].indexOf(name) > -1;
    $('tq-bottomNav').style.display = showNav ? 'flex' : 'none';
    $('tq-progress').style.display  = showNav ? 'block' : 'none';
    $('tq-navUp').disabled   = (name==='question' && currentQIdx===0);
    $('tq-navDown').disabled = (name==='mailing');
    updateProgress();
  }

  function updateProgress(){
    var TOTAL = QUESTIONS.length + 3, step = 0;
    if(currentScreen==='question') step = currentQIdx;
    else if(currentScreen==='name')    step = QUESTIONS.length;
    else if(currentScreen==='email')   step = QUESTIONS.length+1;
    else if(currentScreen==='mailing') step = QUESTIONS.length+2;
    else if(currentScreen==='submitting'||currentScreen==='complete') step = TOTAL;
    $('tq-progressFill').style.width = ((step/TOTAL)*100)+'%';
  }

  function renderQuestion(idx){
    $('tq-qNum').textContent  = String(idx+1);
    $('tq-qText').textContent = QUESTIONS[idx].text;
    var c = $('tq-qOptions'); c.innerHTML = '';
    SCALE_OPTIONS.forEach(function(opt){
      var d = document.createElement('div');
      d.className = 'tq-option'; if(answers[idx]===opt.text) d.classList.add('selected');
      d.dataset.text = opt.text;
      d.innerHTML = '<span class="tq-opt-letter">'+opt.letter+'</span>'+
        '<span class="tq-opt-text">'+opt.text+'</span>'+
        '<svg class="tq-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      d.addEventListener('click', function(){ selectOption(idx, opt.text); });
      c.appendChild(d);
    });
  }

  function selectOption(idx, text){
    answers[idx] = text;
    $('tq-qOptions').querySelectorAll('.tq-option').forEach(function(el){
      el.classList.toggle('selected', el.dataset.text===text);
    });
    setTimeout(function(){ if(currentScreen==='question'&&answers[idx]===text) handleNext(); }, 350);
  }

  function renderMailing(){
    var c = $('tq-mailingOptions'); c.innerHTML = '';
    MAILING_OPTIONS.forEach(function(opt){
      var d = document.createElement('div');
      d.className = 'tq-option'; if(mailingChoice===opt.text) d.classList.add('selected');
      d.dataset.text = opt.text;
      d.innerHTML = '<span class="tq-opt-letter">'+opt.letter+'</span>'+
        '<span class="tq-opt-text">'+opt.text+'</span>'+
        '<svg class="tq-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      d.addEventListener('click', function(){
        mailingChoice = opt.text;
        c.querySelectorAll('.tq-option').forEach(function(el){
          el.classList.toggle('selected', el.dataset.text===opt.text);
        });
      });
      c.appendChild(d);
    });
  }

  function handleNext(){
    if(isSubmitting) return;
    if(currentScreen==='question'){
      if(!answers[currentQIdx]) return;
      if(currentQIdx < QUESTIONS.length-1){ currentQIdx++; renderQuestion(currentQIdx); showScreen('question'); }
      else { showScreen('name'); setTimeout(function(){ $('tq-nameInput').focus(); },100); }
    } else if(currentScreen==='name'){
      var v = $('tq-nameInput').value.trim();
      if(!v){ $('tq-nameInput').classList.add('tq-err'); $('tq-nameErr').classList.add('show'); return; }
      $('tq-nameInput').classList.remove('tq-err'); $('tq-nameErr').classList.remove('show');
      userName = v; showScreen('email'); setTimeout(function(){ $('tq-emailInput').focus(); },100);
    } else if(currentScreen==='email'){
      var ev = $('tq-emailInput').value.trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ev)){ $('tq-emailInput').classList.add('tq-err'); $('tq-emailErr').classList.add('show'); return; }
      $('tq-emailInput').classList.remove('tq-err'); $('tq-emailErr').classList.remove('show');
      userEmail = ev; renderMailing(); showScreen('mailing');
    } else if(currentScreen==='mailing'){
      submitAssessment();
    }
  }

  function handleBack(){
    if(currentScreen==='question'&&currentQIdx>0){ currentQIdx--; renderQuestion(currentQIdx); showScreen('question'); }
    else if(currentScreen==='name'){ currentQIdx=QUESTIONS.length-1; renderQuestion(currentQIdx); showScreen('question'); }
    else if(currentScreen==='email'){ showScreen('name'); setTimeout(function(){ $('tq-nameInput').focus(); },100); }
    else if(currentScreen==='mailing'){ showScreen('email'); setTimeout(function(){ $('tq-emailInput').focus(); },100); }
  }

  $('tq-startBtn').addEventListener('click', function(){ currentQIdx=0; renderQuestion(0); showScreen('question'); });
  $('tq-qOk').addEventListener('click', handleNext);
  $('tq-navDown').addEventListener('click', handleNext);
  $('tq-navUp').addEventListener('click', handleBack);
  $('tq-nameOk').addEventListener('click', handleNext);
  $('tq-emailOk').addEventListener('click', handleNext);
  $('tq-mailingOk').addEventListener('click', handleNext);
  $('tq-nameInput').addEventListener('keydown',  function(e){ if(e.key==='Enter'){e.preventDefault();handleNext();} });
  $('tq-emailInput').addEventListener('keydown', function(e){ if(e.key==='Enter'){e.preventDefault();handleNext();} });

  document.addEventListener('keydown', function(e){
    if(e.key==='Enter'&&currentScreen==='question'){
      var tag=(document.activeElement&&document.activeElement.tagName)||'';
      if(tag!=='INPUT'&&tag!=='TEXTAREA'){e.preventDefault();if(answers[currentQIdx])handleNext();}
    }
  });
  document.addEventListener('keydown', function(e){
    if(currentScreen!=='question') return;
    var tag=(document.activeElement&&document.activeElement.tagName)||'';
    if(tag==='INPUT'||tag==='TEXTAREA') return;
    var map={'1':0,'2':1,'3':2,'4':3,'a':0,'b':1,'c':2,'d':3};
    var idx=map[e.key.toLowerCase()];
    if(typeof idx==='number'){e.preventDefault();selectOption(currentQIdx,SCALE_OPTIONS[idx].text);}
  });

  async function submitAssessment(){
    if(isSubmitting||!mailingChoice) return;
    isSubmitting=true; showScreen('submitting');
    var payload={first_name:userName,email:userEmail,mailing_list:mailingChoice};
    QUESTIONS.forEach(function(q,i){payload[q.name]=answers[i]||'Never';});
    try{
      var res = await fetch(WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      var data = await res.json().catch(function(){return{};});
      var redirectUrl = (data&&data.landingPageUrl)||('https://www.hrt.org/score-total?type=th&score='+computeLocalScore());
      var shownTotal = (data&&typeof data.totalScore!=='undefined')?data.totalScore:computeLocalScore();
      var r=$('tq-completeResults');
      r.innerHTML='<div><strong>Your Assessment Score:</strong><span class="tq-score-big">'+escapeHtml(String(shownTotal))+'</span></div>';
      r.style.display='block';
      var lnk=$('tq-viewLink'); lnk.href=redirectUrl; lnk.style.display='inline-block';
      showScreen('complete');
      setTimeout(function(){ window.location.href=redirectUrl; },1200);
    } catch(err){
      window.location.href='https://www.hrt.org/score-total?type=th&score='+computeLocalScore();
    } finally { isSubmitting=false; }
  }

  updateProgress();
})();
