/* Audience colors belong only to the Men/Women page, never to browsing history. */
(()=>{
 const root=document.documentElement;
 try{sessionStorage.removeItem('hrt-care-theme')}catch{}
 delete root.dataset.careTheme;
 if(!/\/Audience\.html$/i.test(decodeURIComponent(location.pathname)))return;
 const valid=g=>g==='women'||g==='men';
 function apply(g){if(valid(g))root.dataset.careTheme=g;}
 apply(new URLSearchParams(location.search).get('g')==='men'?'men':'women');
 const observer=new MutationObserver(()=>apply(document.body.dataset.gender));
 observer.observe(document.body,{attributes:true,attributeFilter:['data-gender']});
})();
