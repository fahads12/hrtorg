(() => {
  const script = document.currentScript;
  if (!script || document.getElementById('hrt-guide-widget')) return;
  const widgetURL = new URL(script.src), origin = widgetURL.origin;
  const version = encodeURIComponent(widgetURL.searchParams.get('v') || 'polish-1');
  const currentTheme = () => ['women','men'].includes(document.documentElement.dataset.careTheme) ? document.documentElement.dataset.careTheme : 'neutral';
  const host = document.createElement('div'); host.id = 'hrt-guide-widget'; document.body.append(host);
  const root = host.attachShadow({mode:'open'});
  const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = `${origin}/widget.css?v=${version}`;
  const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'launcher';
  toggle.setAttribute('aria-controls','hrt-panel');
  const panel = document.createElement('div'); panel.className = 'panel'; panel.id = 'hrt-panel'; panel.hidden = true;
  panel.setAttribute('role','region'); panel.setAttribute('aria-label','HRT AI Guide');
  let iframe;
  function render() {
    toggle.setAttribute('aria-expanded',String(!panel.hidden));
    toggle.setAttribute('aria-label',panel.hidden ? 'Ask HRT — open chat' : 'Minimize HRT chat');
    toggle.innerHTML = `<span class="launcher-icon" aria-hidden="true">${panel.hidden ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z"/><path d="M7 10h8M7 14h5"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 9 6 6 6-6"/></svg>'}</span><span class="launcher-copy"><strong>${panel.hidden ? 'Ask HRT' : 'Minimize chat'}</strong><small>Your AI health guide</small></span><span class="launcher-dot" aria-hidden="true"></span>`;
  }
  function close(){panel.hidden=true;render();toggle.focus();}
  toggle.addEventListener('click',()=>{
    panel.hidden=!panel.hidden;render();
    if(!iframe){iframe=document.createElement('iframe');iframe.src=`${origin}/?widget=1&v=${version}&theme=${currentTheme()}`;iframe.title='HRT AI Guide';iframe.referrerPolicy='no-referrer';panel.append(iframe);}
    if(!panel.hidden)iframe.focus();
  });
  root.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  window.addEventListener('message',e=>{if(e.origin===origin && e.source===iframe?.contentWindow && e.data==='hrt-guide-close')close();});
  new MutationObserver(()=>iframe?.contentWindow?.postMessage({type:'hrt-guide-theme',theme:currentTheme()},origin)).observe(document.documentElement,{attributes:true,attributeFilter:['data-care-theme']});
  render();root.append(style,panel,toggle);
})();
