(() => {
  const valid = value => ['neutral', 'women', 'men'].includes(value);
  const apply = value => { document.documentElement.dataset.careTheme = valid(value) ? value : 'neutral'; };
  apply(new URLSearchParams(location.search).get('theme'));
  window.addEventListener('message', event => {
    if (event.source === window.parent && event.data?.type === 'hrt-guide-theme' && valid(event.data.theme)) apply(event.data.theme);
  });
})();

document.querySelector('.guide-close')?.addEventListener('click', () => { if (window.parent !== window) window.parent.postMessage('hrt-guide-close', '*'); });
