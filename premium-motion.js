/* Progressive enhancement: content remains readable if observers are unavailable. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let stop = () => {};
  function start() {
    stop();
    if (reduce.matches) return;
    // Shared reveals are managed once by site-interactions.js.
    const visuals = [...document.querySelectorAll('[data-parallax]')];
    let frame = 0;
    const update = () => {frame=0;if(innerWidth<701)return;visuals.forEach(el=>{const box=el.getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight)el.style.setProperty('--scroll-progress',Math.max(0,Math.min(1,(innerHeight-box.top)/(innerHeight+box.height))));});};
    const scroll = () => {if(!frame) frame=requestAnimationFrame(update);};
    if(visuals.length){addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);scroll();}
    stop=()=>{removeEventListener('scroll',scroll);removeEventListener('resize',scroll);cancelAnimationFrame(frame);};
  }
  let mountFrame=0;
  const mount = new MutationObserver(() => {if(!mountFrame)mountFrame=requestAnimationFrame(()=>{mountFrame=0;start();});});
  const root=document.getElementById('root');if(root)mount.observe(root,{childList:true});start();
  reduce.addEventListener('change',start);
  addEventListener('pagehide',()=>{stop();mount.disconnect();cancelAnimationFrame(mountFrame);reduce.removeEventListener('change',start);},{once:true});
})();
