/* HRT.org journal cover auto-renderer.
   Replaces stock article hero images in journal cards with on-brand typographic covers.
   Reads the card's title (h2/h3) and derives a deterministic palette from it. */
(function () {
  if (typeof document === 'undefined') return;

  var PALETTES = [
    { bg1: '#efe6eb', bg2: '#e4d7df', ink: '#42263b', accent: '#914674' }, // plum
    { bg1: '#e3eaef', bg2: '#d7e2ea', ink: '#0d2b4b', accent: '#267f91' }, // navy / teal
    { bg1: '#f0eadf', bg2: '#e5dbc9', ink: '#3a2d1a', accent: '#c89a46' }, // cream / gold
    { bg1: '#e8e9ef', bg2: '#dcdfe8', ink: '#1b2332', accent: '#5a6378' }, // slate
    { bg1: '#eef0e9', bg2: '#e1e5d9', ink: '#2b3522', accent: '#5a6b43' }  // sage
  ];

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  // The card title lives below the image as the <h3>, so the cover is image-only:
  // a brand gradient and a small accent motif. No text, no duplication, no clipping.
  function buildCover(seed, p) {
    // Rotate the dot cluster position (and a soft second circle) per seed for subtle variety.
    var variants = [
      { dx: 698, dy: 86, cx: 160, cy: 460, cr: 180 },
      { dx: 54,  dy: 86, cx: 640, cy: 460, cr: 200 },
      { dx: 698, dy: 540, cx: 180, cy: 180, cr: 160 },
      { dx: 54,  dy: 540, cx: 620, cy: 180, cr: 190 }
    ];
    var v = variants[seed % variants.length];
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" ' +
      'preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1">' +
      '<stop offset="0" stop-color="' + p.bg1 + '"/>' +
      '<stop offset="1" stop-color="' + p.bg2 + '"/>' +
      '</linearGradient>' +
      '<radialGradient id="r" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0" stop-color="' + p.accent + '" stop-opacity=".12"/>' +
      '<stop offset="1" stop-color="' + p.accent + '" stop-opacity="0"/>' +
      '</radialGradient></defs>' +
      '<rect width="800" height="600" fill="url(#g)"/>' +
      '<circle cx="' + v.cx + '" cy="' + v.cy + '" r="' + v.cr + '" fill="url(#r)"/>' +
      '<g transform="translate(' + v.dx + ' ' + v.dy + ')">' +
      '<circle cx="0" cy="0" r="5" fill="' + p.accent + '"/>' +
      '<circle cx="18" cy="0" r="5" fill="' + p.accent + '" opacity=".55"/>' +
      '<circle cx="36" cy="0" r="5" fill="' + p.accent + '" opacity=".25"/>' +
      '</g></svg>'
    );
  }

  function titleOf(card) {
    var h = card.querySelector('h2, h3, h4');
    return h ? h.textContent.trim() : '';
  }

  function swap(card) {
    var img = card.querySelector('img');
    var title = titleOf(card);
    if (!img || !title) return;
    var seed = hashStr(title);
    var p = PALETTES[seed % PALETTES.length];
    var svg = buildCover(seed, p);
    var dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    try { img.removeAttribute('srcset'); } catch (_) { }
    img.src = dataUrl;
    img.alt = title;
    card.setAttribute('data-journal-cover', 'typographic');
  }

  function run() {
    var selectors = ['.jx', '.source-card', '.cat-card'];
    for (var s = 0; s < selectors.length; s++) {
      var cards = document.querySelectorAll(selectors[s]);
      for (var i = 0; i < cards.length; i++) swap(cards[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
