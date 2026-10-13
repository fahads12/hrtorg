/* Native motion enhancement. No hidden default content, extra runtime or scroll interception. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let cleanup=()=>{},mount;
 function start(){cleanup();const animations=new Set();let frame=0,observer;
  const timeline=document.querySelector('[data-care-progress]'),steps=timeline?[...timeline.children]:[],hero=document.querySelector('[data-hero-depth]');
  const targets=[...document.querySelectorAll('[data-care-motion],.aud-stage,.aud-tx-card,.aud-lib-card,.ab-person,.cat-card')];
  function update(){frame=0;if(timeline){const rect=timeline.getBoundingClientRect(),point=innerHeight*.62;const progress=Math.max(0,Math.min(1,(point-rect.top-24)/Math.max(1,rect.height-88)));timeline.style.setProperty('--care-progress',reduced.matches?1:progress);let active=0;steps.forEach((s,i)=>{if(s.getBoundingClientRect().top<point)active=i});steps.forEach((s,i)=>s.classList.toggle('is-current',i===active));}if(hero)hero.style.setProperty('--hero-offset',!reduced.matches&&innerWidth>800?Math.min(10,Math.max(0,-hero.getBoundingClientRect().top*.035))+'px':'0px');}
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
  if(!reduced.matches&&'IntersectionObserver'in window&&Element.prototype.animate){observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;observer.unobserve(e.target);const animation=e.target.animate([{opacity:.35,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,easing:'cubic-bezier(.2,.65,.3,1)',fill:'none'});animations.add(animation);animation.onfinish=()=>animations.delete(animation)}),{threshold:.12});targets.forEach(el=>observer.observe(el));}
  if(timeline||hero){addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);update()}
  cleanup=()=>{observer?.disconnect();animations.forEach(a=>a.cancel());cancelAnimationFrame(frame);removeEventListener('scroll',scroll);removeEventListener('resize',scroll)};
 }
 let mountFrame=0;const root=document.getElementById('root');if(root){mount=new MutationObserver(()=>{if(!mountFrame)mountFrame=requestAnimationFrame(()=>{mountFrame=0;start()})});mount.observe(root,{childList:true})}start();
 reduced.addEventListener('change',start);addEventListener('pagehide',()=>{cleanup();mount?.disconnect();cancelAnimationFrame(mountFrame);reduced.removeEventListener('change',start)},{once:true});
})();
