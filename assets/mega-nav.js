/* HRT.org mega-nav for For Women, For Men, Symptoms, Lab Testing, and Treatments.
 * Injects a 3-column mega panel below the sticky nav; hover opens it on desktop,
 * click opens it on touch devices. Click outside or press Esc to close. */
(function () {
  if (typeof document === 'undefined') return;
  try { console.info('[hrt-mega] script loaded v7'); } catch (_) {}

  // ---------- Content ----------
  // Each panel: accent · image · col1 (list links) · col2 (pills) · aside quizCta + resources.
  const PANELS = {
    women: {
      accent: '#8e456f',
      imgSrc: '/uploads/generated/women-care-v2-720.webp',
      imgAlt: 'Hormone care for women',
      col1Label: 'By Care Area',
      col1: [
        ['General health', '/womens-health/'],
        ['Perimenopause', '/conditions/perimenopause/'],
        ['Menopause', '/menopause/'],
        ['Hormone Replacement (HRT)', '/womens-health/hormone-replacement-therapy/'],
        ['Weight', '/weight-loss/'],
        ['Sexual Health', '/sexual-health/'],
        ['PCOS / PMDD', '/conditions/pcos/'],
        ['Thyroid', '/thyroid/'],
        ['UTI, BV & Yeast Infections', '/conditions/uti-bv-yeast/'],
        ['Hair Loss', '/womens-health/hair-loss/'],
        ['AgeWell / Longevity', '/longevity/'],
        ['Cancer & Survivorship', '/cancer-survivorship/'],
      ],
      col2Label: 'By Symptom',
      col2: [
        ['Weight gain', '/symptoms/weight-changes/'],
        ['Hot flashes & night sweats', '/symptoms/hot-flashes/'],
        ['Low sex drive & vaginal dryness', '/symptoms/vaginal-dryness/'],
        ['Irregular periods', '/symptoms/irregular-periods/'],
        ['Sleep & insomnia', '/symptoms/poor-sleep/'],
        ['Hair loss & excess growth', '/symptoms/hair-loss/'],
        ['Skin changes', '/symptoms/skin-changes/'],
        ['Mood swings', '/symptoms/mood-changes/'],
        ['Brain fog & forgetfulness', '/symptoms/brain-fog/'],
        ['Low energy', '/symptoms/low-energy/'],
        ['Bone, muscle & joint pain', '/symptoms/bone-joint-pain/'],
        ['Anxiety', '/symptoms/anxiety/'],
        ['Depression', '/symptoms/depression/'],
      ],
      quizCta: ['Take the 2-min quiz', '/menopause/qualify/'],
      resources: [
        ['Browse the full Women\'s hub', '/womens-health/'],
        ['HRT.org Journal', '/Resources.html'],
      ],
    },
    men: {
      accent: '#0b294a',
      imgSrc: '/uploads/generated/men-care-v2-720.webp',
      imgAlt: 'Hormone care for men',
      col1Label: 'By Care Area',
      col1: [
        ['General health', '/mens-health/'],
        ['Low Testosterone', '/conditions/low-testosterone/'],
        ['Andropause', '/conditions/andropause/'],
        ['Testosterone Replacement (TRT)', '/low-testosterone/'],
        ['Weight', '/weight-loss/'],
        ['Sexual Health', '/sexual-health/'],
        ['Erectile Dysfunction', '/sexual-health/erectile-dysfunction/'],
        ['Thyroid', '/thyroid/'],
        ['Hair Loss', '/mens-health/hair-loss/'],
        ['Fertility (TRT-safe)', '/low-testosterone/trt-fertility/'],
        ['AgeWell / Longevity', '/longevity/'],
        ['Cancer & Survivorship', '/cancer-survivorship/'],
      ],
      col2Label: 'By Symptom',
      col2: [
        ['Weight gain', '/symptoms/weight-changes/'],
        ['Low energy & fatigue', '/symptoms/low-energy/'],
        ['Erectile dysfunction', '/symptoms/erectile-dysfunction/'],
        ['Low libido', '/symptoms/low-libido/'],
        ['Muscle loss', '/symptoms/muscle-loss/'],
        ['Poor recovery', '/symptoms/poor-recovery/'],
        ['Sleep & insomnia', '/symptoms/poor-sleep/'],
        ['Hair loss', '/symptoms/hair-loss/'],
        ['Brain fog & forgetfulness', '/symptoms/brain-fog/'],
        ['Mood changes', '/symptoms/mood-changes/'],
        ['Bone, muscle & joint pain', '/symptoms/bone-joint-pain/'],
        ['Anxiety', '/symptoms/anxiety/'],
        ['Depression', '/symptoms/depression/'],
      ],
      quizCta: ['Take the 2-min TRT quiz', '/low-testosterone/qualify/'],
      resources: [
        ['Browse the full Men\'s hub', '/mens-health/'],
        ['HRT.org Journal', '/Resources.html'],
      ],
    },
    symptoms: {
      accent: '#267f91',
      imgSrc: '/uploads/generated/lab-care-720.webp',
      imgAlt: 'Browse symptoms',
      layout: 'four-col',
      col1Label: 'For Women',
      col1: [
        ['Hot flashes', '/symptoms/hot-flashes/'],
        ['Night sweats', '/symptoms/night-sweats/'],
        ['Vaginal dryness', '/symptoms/vaginal-dryness/'],
        ['Irregular periods', '/symptoms/irregular-periods/'],
        ['Hair loss & excess growth', '/symptoms/hair-loss/'],
        ['Skin changes', '/symptoms/skin-changes/'],
      ],
      col2Label: 'For Men',
      col2: [
        ['Erectile dysfunction', '/symptoms/erectile-dysfunction/'],
        ['Low libido', '/symptoms/low-libido/'],
        ['Muscle loss', '/symptoms/muscle-loss/'],
        ['Poor recovery', '/symptoms/poor-recovery/'],
        ['Hair loss', '/symptoms/hair-loss/'],
      ],
      col3Label: 'Everyone',
      col3: [
        ['Low energy', '/symptoms/low-energy/'],
        ['Weight changes', '/symptoms/weight-changes/'],
        ['Brain fog', '/symptoms/brain-fog/'],
        ['Poor sleep', '/symptoms/poor-sleep/'],
        ['Mood changes', '/symptoms/mood-changes/'],
        ['Anxiety', '/symptoms/anxiety/'],
        ['Depression', '/symptoms/depression/'],
        ['Bone/joint pain', '/symptoms/bone-joint-pain/'],
      ],
      quizCta: ['Take the symptom tracker', '/portal/app/symptoms-tracker/'],
      resources: [
        ['Browse the full Symptoms hub', '/symptoms/'],
        ['A–Z Biomarker library', '/lab-testing/biomarkers/'],
      ],
    },
    labs: {
      accent: '#15334d',
      imgSrc: '/uploads/lab/hormone-640.webp',
      imgAlt: 'Lab testing',
      col1Label: 'Core Panels',
      col1: [
        ['Sex Hormones', '/lab-testing/hormone-testing/'],
        ['Thyroid', '/lab-testing/thyroid-testing/'],
        ['Cortisol & Adrenal', '/lab-testing/cortisol-testing/'],
        ['Metabolic', '/lab-testing/metabolic-testing/'],
        ['Insulin Resistance', '/lab-testing/insulin-testing/'],
        ['Nutrient', '/lab-testing/nutrient-testing/'],
        ['Testosterone', '/lab-testing/testosterone-testing/'],
        ['Estrogen', '/lab-testing/estrogen-testing/'],
      ],
      col2Label: 'Advanced',
      col2: [
        ['Cardiovascular', '/lab-testing/cardiovascular-testing/'],
        ['Inflammation', '/lab-testing/inflammation-testing/'],
        ['Fertility', '/lab-testing/fertility-testing/'],
        ['Prostate', '/lab-testing/prostate-testing/'],
        ['Bone Health', '/lab-testing/bone-health-testing/'],
        ['Progesterone', '/lab-testing/progesterone-testing/'],
        ['Genetic / Pharmacogenomic', '/lab-testing/genetic-testing/'],
      ],
      quizCta: ['Shop at-home kits', '/Lab%20Testing.html'],
      resources: [
        ['Biomarker library (all 15)', '/lab-testing/'],
        ['A–Z Biomarker index', '/lab-testing/biomarkers/'],
      ],
    },
    treatments: {
      accent: '#2f5f43',
      imgSrc: '/uploads/generated/care-journey-v2-720.webp',
      imgAlt: 'Treatments',
      layout: 'four-col',
      col1Label: 'For Women',
      col1: [
        ['Hormone Replacement (HRT)', '/womens-health/hormone-replacement-therapy/'],
        ['Menopause care', '/menopause/'],
        ['Perimenopause care', '/conditions/perimenopause/'],
        ['PCOS / PMDD', '/conditions/pcos/'],
        ['Hair loss (women)', '/womens-health/hair-loss/'],
      ],
      col2Label: 'For Men',
      col2: [
        ['Testosterone Replacement (TRT)', '/low-testosterone/'],
        ['TRT-safe fertility', '/low-testosterone/trt-fertility/'],
        ['Erectile Dysfunction', '/sexual-health/erectile-dysfunction/'],
        ['Hair loss (men)', '/mens-health/hair-loss/'],
      ],
      col3Label: 'Everyone',
      col3: [
        ['Weight loss (GLP-1)', '/weight-loss/'],
        ['Sexual health', '/sexual-health/'],
        ['Thyroid treatment', '/thyroid/'],
        ['Peptides', '/peptides/'],
        ['Longevity / AgeWell', '/longevity/'],
        ['Cancer & survivorship', '/cancer-survivorship/'],
      ],
      quizCta: ['Browse all treatments', '/Treatments.html'],
      resources: [
        ['Full Treatments hub', '/Treatments.html'],
        ['Shop products', 'https://store.hrt.org/'],
      ],
    },
  };

  // ---------- Inline styles ----------
  const style = document.createElement('style');
  style.textContent = `
.hrt-mega{position:absolute;top:100%;left:0;right:0;background:#fdfbfa;border-top:1px solid rgba(22,35,63,.06);box-shadow:0 20px 60px -20px rgba(13,43,75,.15);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .18s ease,transform .18s ease,visibility 0s linear .18s;z-index:40}
.hrt-mega.is-open{opacity:1;visibility:visible;transform:translateY(0);transition:opacity .18s ease,transform .18s ease,visibility 0s}
.hrt-mega-wrap{max-width:1200px;margin:0 auto;padding:36px 40px 44px}
.hrt-mega-panel{display:none;grid-template-columns:minmax(220px,.9fr) minmax(300px,1.2fr) minmax(240px,.9fr);gap:40px}
.hrt-mega-panel.is-active{display:grid}
.hrt-mega-panel.is-four-col{grid-template-columns:minmax(170px,1fr) minmax(170px,1fr) minmax(240px,1.3fr) minmax(240px,1fr);gap:32px}
.hrt-mega-head{font:500 11px/1 'Geist Mono',monospace;letter-spacing:3px;text-transform:uppercase;color:#8094a7;margin:0 0 20px}
.hrt-mega-col ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px}
.hrt-mega-col ul a{display:block;padding:9px 0;color:#15334d;text-decoration:none;font-size:15px;font-weight:500;letter-spacing:-.005em;transition:color .15s;border-bottom:1px solid transparent}
.hrt-mega-col ul a:hover{color:var(--mega-accent,#0b294a)}
.hrt-mega-pills{display:flex;flex-wrap:wrap;gap:8px}
.hrt-mega-pills a{display:inline-flex;align-items:center;padding:9px 14px;background:#fff;border:1.5px solid rgba(22,35,63,.1);border-radius:999px;color:#15334d;text-decoration:none;font-size:13.5px;font-weight:500;transition:border-color .15s,background .15s}
.hrt-mega-pills a:hover{border-color:var(--mega-accent,#0b294a);background:#f6f9fc}
.hrt-mega-aside{display:flex;flex-direction:column;gap:16px;padding:20px;background:#fff;border:1px solid rgba(22,35,63,.08);border-radius:16px}
.hrt-mega-aside img{width:100%;height:160px;object-fit:cover;border-radius:10px;margin-bottom:4px}
.hrt-mega-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;background:var(--mega-accent,#0b294a);color:#fff;text-decoration:none;border-radius:999px;font-size:13.5px;font-weight:500;align-self:flex-start}
.hrt-mega-aside .hrt-mega-head{margin-bottom:10px}
.hrt-mega-aside a:not(.hrt-mega-cta){color:#15334d;text-decoration:none;font-size:14px;font-weight:500;padding:6px 0;display:block;transition:color .15s}
.hrt-mega-aside a:not(.hrt-mega-cta):hover{color:var(--mega-accent,#0b294a)}
.hrt-mega-close{position:absolute;top:14px;right:20px;background:transparent;border:none;color:#8094a7;cursor:pointer;padding:8px;font-size:14px;display:none}
@media(max-width:1000px){.hrt-mega-wrap{padding:24px 24px 32px}.hrt-mega-panel,.hrt-mega-panel.is-four-col{grid-template-columns:1fr;gap:28px}.hrt-mega-aside{order:99}.hrt-mega-close{display:block}.hrt-mega{position:fixed;top:68px;left:0;right:0;max-height:calc(100vh - 68px);overflow-y:auto}}
header.nav{position:sticky;top:0;z-index:50}
`;
  document.head.appendChild(style);

  // ---------- Build mega HTML ----------
  function listCol(label, items) {
    const li = items.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join('');
    return `<div class="hrt-mega-col"><div class="hrt-mega-head">${label}</div><ul>${li}</ul></div>`;
  }
  function pillsCol(label, items) {
    const a = items.map(([t, h]) => `<a href="${h}">${t}</a>`).join('');
    return `<div class="hrt-mega-col"><div class="hrt-mega-head">${label}</div><div class="hrt-mega-pills">${a}</div></div>`;
  }
  function asideCol(cfg) {
    const resources = cfg.resources.map(([t, h]) => `<a href="${h}">${t}</a>`).join('');
    return `<div class="hrt-mega-col hrt-mega-aside">
      <img src="${cfg.imgSrc}" alt="${cfg.imgAlt}" loading="lazy">
      <div>
        <div class="hrt-mega-head">Next step</div>
        <a class="hrt-mega-cta" href="${cfg.quizCta[1]}">${cfg.quizCta[0]} →</a>
      </div>
      <div>
        <div class="hrt-mega-head">Resources</div>
        ${resources}
      </div>
    </div>`;
  }

  function panelHtml(key, cfg) {
    const isFourCol = cfg.layout === 'four-col';
    const classes = 'hrt-mega-panel' + (isFourCol ? ' is-four-col' : '');
    const cols = isFourCol
      ? [
          listCol(cfg.col1Label, cfg.col1),
          listCol(cfg.col2Label, cfg.col2),
          pillsCol(cfg.col3Label, cfg.col3),
          asideCol(cfg),
        ]
      : [
          listCol(cfg.col1Label, cfg.col1),
          pillsCol(cfg.col2Label, cfg.col2),
          asideCol(cfg),
        ];
    return `<div class="${classes}" data-panel="${key}" style="--mega-accent:${cfg.accent}">${cols.join('')}</div>`;
  }

  const header = document.querySelector('header.nav');
  if (!header) { try { console.warn('[hrt-mega] no header.nav found — mega not attached'); } catch (_) {} return; }
  try { console.info('[hrt-mega] attaching mega panel to header.nav'); } catch (_) {}
  const mega = document.createElement('div');
  mega.className = 'hrt-mega';
  mega.setAttribute('aria-hidden', 'true');
  mega.innerHTML = `
    <button type="button" class="hrt-mega-close" aria-label="Close menu">✕</button>
    <div class="hrt-mega-wrap">
      ${Object.keys(PANELS).map(k => panelHtml(k, PANELS[k])).join('')}
    </div>`;
  header.appendChild(mega);

  // ---------- Open / close logic ----------
  let activePanel = null;
  let closeTimer = null;

  function open(key) {
    clearTimeout(closeTimer);
    mega.querySelectorAll('.hrt-mega-panel').forEach(p => p.classList.toggle('is-active', p.dataset.panel === key));
    mega.classList.add('is-open');
    mega.setAttribute('aria-hidden', 'false');
    activePanel = key;
    try { console.info('[hrt-mega] open', key); } catch (_) {}
  }

  function close() {
    mega.classList.remove('is-open');
    mega.setAttribute('aria-hidden', 'true');
    activePanel = null;
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(close, 180);
  }

  // Detect any of the 5 nav triggers. Matches by href patterns first (robust against
  // nested spans or motion animations inside the glow menu), falls back to text + aria-label.
  function isMegaTrigger(el) {
    const a = el.closest && el.closest('a, button');
    if (!a) return null;
    // Only inside the main nav — ignore matches in page body / footer
    if (!a.closest('header.nav, #site-navigation, nav')) return null;
    // Explicitly skip footer links (if nav selector overlaps)
    if (a.closest('footer')) return null;

    // Normalize href: lowercase, decode %20 → space, drop query/hash
    const rawHref = (a.getAttribute('href') || '').toLowerCase();
    const href = rawHref.replace(/%20/g, ' ').replace(/[?#].*$/, '');
    const aria = (a.getAttribute('aria-label') || '').toLowerCase();
    const txt = (a.textContent || '').trim().replace(/\s+/g, ' ').toLowerCase();

    // Primary: href pattern matching
    if (rawHref.includes('g=women')) return 'women';
    if (rawHref.includes('g=men')) return 'men';
    // Symptoms hub — exact /symptoms/ path (not deep links like /symptoms/hot-flashes/)
    if (href === '/symptoms/' || href === 'symptoms/') return 'symptoms';
    // Lab Testing — kit page (Lab Testing.html, with or without leading slash / url encoding) or library hub
    if (href === 'lab testing.html' || href === '/lab testing.html' || href === '/lab-testing/' || href === 'lab-testing/') return 'labs';
    // Treatments hub
    if (href === 'treatments.html' || href === '/treatments.html') return 'treatments';

    // Secondary: aria-label
    if (aria === 'for women') return 'women';
    if (aria === 'for men') return 'men';
    if (aria === 'symptoms') return 'symptoms';
    if (aria === 'lab testing') return 'labs';
    if (aria === 'treatments') return 'treatments';

    // Tertiary: visible text
    if (txt === 'for women') return 'women';
    if (txt === 'for men') return 'men';
    if (txt === 'symptoms') return 'symptoms';
    if (txt === 'lab testing') return 'labs';
    if (txt === 'treatments') return 'treatments';

    return null;
  }

  const isTouch = window.matchMedia('(hover: none)').matches;

  document.addEventListener('mouseover', (e) => {
    if (isTouch) return;
    const key = isMegaTrigger(e.target);
    if (key) open(key);
  });

  document.addEventListener('mouseout', (e) => {
    if (isTouch) return;
    const key = isMegaTrigger(e.target);
    if (!key) return;
    const toEl = e.relatedTarget;
    if (!toEl || (!mega.contains(toEl) && !isMegaTrigger(toEl))) scheduleClose();
  });

  mega.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  mega.addEventListener('mouseleave', scheduleClose);

  // Touch / click: intercept the triggers and open the mega instead of navigating
  document.addEventListener('click', (e) => {
    const key = isMegaTrigger(e.target);
    if (key) {
      e.preventDefault();
      if (activePanel === key) close(); else open(key);
      return;
    }
    if (!mega.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  mega.querySelector('.hrt-mega-close').addEventListener('click', close);
  mega.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
})();
