// Compatibility for saved links to the retired audience landing page.
(()=>{
 const params=new URLSearchParams(location.search);
 const gender=params.get('g')||location.hash.slice(1);
 location.replace(new URL('Audience.html?g='+(gender==='men'?'men':'women'),location.href));
})();
