/* Native accessible controls. No local payment, booking or submission simulation. */
(() => {
 // A <base> element must not send a skip link to another page.
 document.querySelectorAll('.skip-link').forEach(link => {
  link.href=location.pathname+location.search+'#main-content';
  link.addEventListener('click',event=>{
   const main=document.getElementById('main-content');
   if(!main)return;
   event.preventDefault();main.tabIndex=-1;main.focus({preventScroll:true});main.scrollIntoView({behavior:'instant',block:'start'});
  });
 });
 const button=document.querySelector('.mobile-menu'),nav=document.getElementById('site-navigation');
 button?.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
 nav?.addEventListener('click',event=>{if(event.target.closest('a[href]')){nav.classList.remove('is-open');button?.setAttribute('aria-expanded','false');}});
 matchMedia('(min-width:1001px)').addEventListener('change',event=>{if(event.matches){nav?.classList.remove('is-open');button?.setAttribute('aria-expanded','false');}});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.querySelectorAll('.source-dropdown[open]').forEach(el=>{el.open=false;el.querySelector('summary').focus();});if(nav?.classList.contains('is-open')){nav.classList.remove('is-open');button.setAttribute('aria-expanded','false');button.focus();}}});
 document.addEventListener('click',event=>{document.querySelectorAll('.source-dropdown[open]').forEach(el=>{if(!el.contains(event.target))el.open=false;});});
 const search=document.getElementById('article-search');
 if(search){const cards=[...document.querySelectorAll('[data-search]')],count=document.getElementById('search-count');const filter=()=>{const query=search.value.trim().toLocaleLowerCase();let visible=0;cards.forEach(card=>{card.hidden=!card.dataset.search.includes(query);if(!card.hidden)visible++;});count.textContent=visible+' articles';document.getElementById('no-results').hidden=visible!==0;};search.addEventListener('input',filter);filter();}
 document.querySelectorAll('.email-draft-form').forEach(form=>{
  form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const values=new FormData(form);const body=['Name: '+values.get('name'),'Email: '+values.get('email'),'Phone: '+values.get('phone'),'',values.get('message')].join('\n');location.href='mailto:info@hrt.org?subject='+encodeURIComponent('HRT.org enquiry')+'&body='+encodeURIComponent(body);});
  form.querySelector('button[type="submit"]')?.removeAttribute('disabled');
 });
 // React replaces the prerendered root after these deferred scripts can run.
 // Observe inserted content as well as the initial document, and keep CSS
 // visible by default so a missing/failed script can never hide information.
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set();
 let observer,seen=new WeakSet(),frame=0,index=0;
 const pending=new Set();
 function observeWithin(node){
  if(!(node instanceof Element)||!observer)return;
  const targets=node.matches('[data-reveal]')?[node,...node.querySelectorAll('[data-reveal]')]:node.querySelectorAll('[data-reveal]');
  targets.forEach(el=>{if(seen.has(el)||el.classList.contains('is-visible'))return;seen.add(el);el.style.setProperty('--reveal-delay',(index++%3*50)+'ms');observer.observe(el);});
 }
 function animate(){
  observer?.disconnect();observer=null;animations.forEach(a=>a.cancel());animations.clear();seen=new WeakSet();index=0;
  if(reduced.matches||!('IntersectionObserver'in window)||!Element.prototype.animate)return;
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;observer.unobserve(entry.target);entry.target.classList.add('is-visible');
   const animation=entry.target.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:parseFloat(entry.target.style.getPropertyValue('--reveal-delay'))||0,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
   animations.add(animation);animation.onfinish=animation.oncancel=()=>animations.delete(animation);
  }),{threshold:.05});observeWithin(document.body);
 }
 const contentObserver=new MutationObserver(records=>{
  records.forEach(record=>record.addedNodes.forEach(node=>{if(node instanceof Element)pending.add(node);}));
  if(pending.size&&!frame)frame=requestAnimationFrame(()=>{frame=0;pending.forEach(node=>{if(node.isConnected)observeWithin(node);});pending.clear();});
 });
 contentObserver.observe(document.body,{childList:true,subtree:true});animate();reduced.addEventListener('change',animate);
 addEventListener('pagehide',()=>{contentObserver.disconnect();observer?.disconnect();cancelAnimationFrame(frame);animations.forEach(a=>a.cancel());reduced.removeEventListener('change',animate);},{once:true});
})();
