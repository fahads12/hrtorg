(() => {
  'use strict';
  if (window.__hrtGuideEmbed) return;
  window.__hrtGuideEmbed = true;
  const source = document.currentScript;
  // Set this to the deployed HTTPS guide origin when publishing the website.
  const deployedOrigin = '';
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const configured = source?.dataset.guideOrigin || deployedOrigin || (local ? 'http://127.0.0.1:3001' : '');
  if (!configured) return;
  let origin;
  try {
    const url = new URL(configured);
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(local && loopback && url.protocol === 'http:')) return;
    origin = url.origin;
  } catch { return; }
  const stylesheet = new URL('hrt-chatbot.css?v=polish-1', source.src).href;
  let fallback;
  function decorate(host) {
    if (!host?.shadowRoot) return;
    const syncTheme = () => { host.dataset.careTheme = document.documentElement.dataset.careTheme || 'neutral'; };
    syncTheme();
    new MutationObserver(syncTheme).observe(document.documentElement, {attributes:true,attributeFilter:['data-care-theme']});
    if (location.pathname.startsWith('/portal/')) host.setAttribute('data-portal', '');
    const style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = stylesheet;
    host.shadowRoot.append(style);
    const toggle = host.shadowRoot.querySelector('button');
    if (toggle) toggle.type = 'button';
  }
  function unavailable() {
    if (fallback) return;
    fallback = document.createElement('div');
    fallback.id = 'hrt-guide-fallback';
    const root = fallback.attachShadow({ mode: 'open' });
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.textContent = 'Ask HRT';
    toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', 'hrt-guide-status');
    const panel = document.createElement('div');
    panel.id = 'hrt-guide-status'; panel.className = 'unavailable'; panel.hidden = true;
    const message = document.createElement('p');
    message.textContent = 'The HRT guide is temporarily unavailable. Please try again or contact our team.';
    const retry = document.createElement('button');
    retry.type = 'button'; retry.textContent = 'Try again';
    retry.addEventListener('click', () => { fallback.remove(); fallback = null; load(); });
    const contact = document.createElement('a');
    contact.href = '/Contact.html'; contact.textContent = 'Contact HRT';
    panel.append(message, retry, contact);
    toggle.addEventListener('click', () => { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); });
    root.addEventListener('keydown', event => { if (event.key === 'Escape') { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); } });
    root.append(panel, toggle); document.body.append(fallback); decorate(fallback);
  }
  function load() {
    const script = document.createElement('script');
    script.src = origin + '/widget.js?v=hrt-polish-2'; script.async = true;
    script.addEventListener('load', () => {
      const host = document.getElementById('hrt-guide-widget');
      if (!host) return unavailable();
      decorate(host);
    }, { once: true });
    script.addEventListener('error', () => { script.remove(); unavailable(); }, { once: true });
    document.head.append(script);
  }
  load();
})();
