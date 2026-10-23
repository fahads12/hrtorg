/* Audience colors follow the audience of the content, never browsing history. */
(()=>{
 const root=document.documentElement;
 try{sessionStorage.removeItem('hrt-care-theme')}catch{}
 const path=decodeURIComponent(location.pathname);
 const valid=g=>g==='women'||g==='men';
 const apply=g=>{if(valid(g))root.dataset.careTheme=g;};
 // Audience-locked top-level hubs and their subtrees.
 const WOMEN_HUBS=/^\/(womens-health|menopause)(\/|$)/i;
 const MEN_HUBS=/^\/(mens-health|low-testosterone)(\/|$)/i;
 // Condition slugs that are audience-locked (nested under /conditions/).
 const COND_WOMEN=new Set(['endometriosis','fibroids','menopause','pcos','perimenopause','pms','uti-bv-yeast']);
 const COND_MEN=new Set(['andropause','low-testosterone']);
 // Symptom slugs that are audience-locked (nested under /symptoms/).
 const SYMP_WOMEN=new Set(['hot-flashes','night-sweats','vaginal-dryness','mood-changes','irregular-periods']);
 const SYMP_MEN=new Set(['erectile-dysfunction','low-energy','poor-recovery','muscle-loss']);
 if(WOMEN_HUBS.test(path)){apply('women');return;}
 if(MEN_HUBS.test(path)){apply('men');return;}
 const condMatch=/^\/conditions\/([^\/]+)\//i.exec(path);
 if(condMatch){
  const slug=condMatch[1].toLowerCase();
  if(COND_WOMEN.has(slug)){apply('women');return;}
  if(COND_MEN.has(slug)){apply('men');return;}
 }
 const sympMatch=/^\/symptoms\/([^\/]+)\//i.exec(path);
 if(sympMatch){
  const slug=sympMatch[1].toLowerCase();
  if(SYMP_WOMEN.has(slug)){apply('women');return;}
  if(SYMP_MEN.has(slug)){apply('men');return;}
 }
 // Audience.html toggles via ?g= and body[data-gender]
 if(/\/Audience\.html$/i.test(path)){
  apply(new URLSearchParams(location.search).get('g')==='men'?'men':'women');
  const observer=new MutationObserver(()=>apply(document.body.dataset.gender));
  observer.observe(document.body,{attributes:true,attributeFilter:['data-gender']});
  return;
 }
 // Any other page: no theme (strip stale attr from a cached navigation).
 delete root.dataset.careTheme;
})();
