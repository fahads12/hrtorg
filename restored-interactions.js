(() => {
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){requestAnimationFrame(()=>{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('restored-visible');observer.unobserve(entry.target)}}),{threshold:.04});document.querySelectorAll('.editorial-image,.ab-value,.hw-step,.tr-item,.cat-featured').forEach(el=>{el.classList.add('restored-reveal');observer.observe(el)})});}
 // Source-route pages use a base URL for project assets; retain local in-page anchors.
 document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link)return;const id=link.getAttribute('href').slice(1);const target=document.getElementById(id);if(target){event.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});history.replaceState(null,'',location.pathname+location.search+'#'+id);}});
})();
