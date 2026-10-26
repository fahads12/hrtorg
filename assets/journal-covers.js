/* Preserve article photography; use the HRT logo only when a card has no image. */
(function () {
  if (typeof document === 'undefined') return;

  function showBrandFallback(card, img) {
    if (img.getAttribute('data-journal-fallback') === 'brand') return;
    img.setAttribute('data-journal-fallback', 'brand');
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = '/uploads/hrt-logo.webp';
    img.alt = '';
    img.style.objectFit = 'contain';
    img.style.padding = '32px';
    img.style.boxSizing = 'border-box';
    img.style.background = '#f7f9fc';
    card.setAttribute('data-journal-cover', 'brand');
  }

  function prepare(card) {
    var img = card.querySelector('img');
    if (!img) return;
    // Lazy or responsive images can legitimately have no current src yet.
    var hasSource = ['src', 'srcset', 'data-initial-src', 'data-src'].some(function (name) {
      return (img.getAttribute(name) || '').trim().length > 0;
    });
    if (!hasSource) {
      showBrandFallback(card, img);
      return;
    }
    // A genuine load failure may use the same explicit fallback, never a gradient.
    img.addEventListener('error', function () { showBrandFallback(card, img); }, { once: true });
  }

  function run() {
    var cards = document.querySelectorAll('.jx, .source-card, .cat-card');
    for (var i = 0; i < cards.length; i++) prepare(cards[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
