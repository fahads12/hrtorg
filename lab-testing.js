/* Original native motion: content remains visible without JavaScript. */
(() => {
  if (!document.body.classList.contains('lab-page')) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width:801px)');
  const visual = document.querySelector('.lab-hero-visual');
  const product = document.querySelector('.lab-hero-product');
  const steps = [...document.querySelectorAll('.lab-step')];
  const line = document.querySelector('.lab-steps');
  const scenes = [...document.querySelectorAll('[data-scene]')];
  let cleanup = () => {};
  function mount() {
    cleanup();
    const animations = new Set(); let raf = 0, active = -1, inView = false;
    const animate = (el, frames, options) => {
      if (reduce.matches || !el.animate) return;
      const a = el.animate(frames, options); animations.add(a);
      a.onfinish = () => animations.delete(a); return a;
    };
    document.querySelectorAll('[data-lab-intro]').forEach((el,i) => animate(el,[{opacity:.2,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:i*65,easing:'cubic-bezier(.2,.7,.2,1)'}));
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.target === visual) { inView = e.isIntersecting; visual.classList.toggle('is-visible',inView && !reduce.matches); return; }
        if (!e.isIntersecting) return;
        observer.unobserve(e.target);
        const order = Number(e.target.style.getPropertyValue('--reveal-order')) || 0;
        animate(e.target,[{opacity:.2,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,delay:order*65,easing:'cubic-bezier(.2,.7,.2,1)'});
      }), {threshold:.12});
      observer.observe(visual);
      document.querySelectorAll('[data-lab-reveal]').forEach(el => observer.observe(el));
    }
    function update() {
      raf = 0;
      const point = innerHeight * .56;
      let next = 0;
      steps.forEach((s,i) => {if (s.getBoundingClientRect().top < point) next=i;});
      const rect = line.getBoundingClientRect();
      line.style.setProperty('--lab-progress', reduce.matches ? 1 : Math.max(0,Math.min(1,(point-rect.top-24)/(rect.height-110))));
      if (next !== active) {
        active=next;
        steps.forEach((s,i) => s.classList.toggle('is-current',i===active));
        scenes.forEach((s,i) => {s.hidden=i!==active;});
        document.getElementById('lab-step-number').textContent=`0${active+1} / 05`;
        document.getElementById('lab-step-title').textContent=steps[active].dataset.visualTitle;
        document.getElementById('lab-step-caption').textContent=steps[active].dataset.visualCaption;
        if (desktop.matches) animate(scenes[active],[{opacity:.2,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'ease-out'});
      }
      if (inView && !reduce.matches && desktop.matches) product.style.transform=`translateY(${Math.max(-10,Math.min(10,-visual.getBoundingClientRect().top*.018))}px) rotate(-5deg)`;
    }
    const onScroll = () => {if(!raf) raf=requestAnimationFrame(update);};
    addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);update();
    const faqCleanup = [];
    document.querySelectorAll('.lab-faqs details,.lab-kit-detail').forEach(detail => {
      const summary = detail.querySelector('summary'); let running, wantsOpen=detail.open;
      const click = event => {
        if (reduce.matches || !detail.animate) return;
        event.preventDefault();
        const start = detail.getBoundingClientRect().height;
        wantsOpen = running ? !wantsOpen : !detail.open;
        const closing = !wantsOpen;
        running?.cancel(); running=null;
        if (!closing) detail.open=true;
        const end = closing ? summary.getBoundingClientRect().height : detail.getBoundingClientRect().height;
        detail.style.overflow='hidden';
        running=animate(detail,[{height:start+'px'},{height:end+'px'}],{duration:250,easing:'ease-in-out'});
        running.onfinish=()=>{animations.delete(running);detail.open=!closing;detail.style.overflow='';running=null;};
      };
      summary.addEventListener('click',click);
      faqCleanup.push(()=>{summary.removeEventListener('click',click);detail.style.overflow='';});
    });
    cleanup=()=>{observer?.disconnect();animations.forEach(a=>a.cancel());cancelAnimationFrame(raf);removeEventListener('scroll',onScroll);removeEventListener('resize',onScroll);faqCleanup.forEach(f=>f());visual.classList.remove('is-visible');product.style.transform='';};
  }
  mount();reduce.addEventListener('change',mount);
  addEventListener('pagehide',()=>{cleanup();reduce.removeEventListener('change',mount);},{once:true});
})();
