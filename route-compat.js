/* Preserve the project's original entry URLs while using canonical source pages. */
(() => {
 const params=new URLSearchParams(location.search),file=decodeURIComponent(location.pathname).split('/').pop();
 const gender=params.get('g')==='men'||location.hash==='#men'?'men':'women';
 const map={hrt:'hormone-replacement-therapy',peptides:'anti-aging-peptides',weight:'weight-loss-and-management',sexual:'sexual-health',hair:'hair-loss',ed:'erectile-dysfunction'};
 if(file==='Product.html'){location.replace(new URL(gender+'/'+(map[params.get('p')]||map.hrt)+'/index.html',document.baseURI));return;}
 if(file==='Article.html'){location.replace(new URL('Resources.html',document.baseURI));return;}
 if(file==='HRT Landing.html'){location.replace(new URL('Audience.html?g='+gender,document.baseURI));return;}
 if(file==='Audience.html'){
  const set=g=>{document.querySelectorAll('[data-search]').forEach(card=>{card.hidden=!card.dataset.search.includes(' '+g+'/');});document.querySelectorAll('[data-audience]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.audience===g)));history.replaceState(null,'','?g='+g);};
  document.querySelectorAll('[data-audience]').forEach(button=>button.addEventListener('click',()=>set(button.dataset.audience)));set(gender);
 }
 if(file==='Symptom Check.html'&&params.has('test')){const selected=[...document.querySelectorAll('[data-test]')].find(el=>el.dataset.test===params.get('test'));selected?.classList.add('is-selected');}
})();
