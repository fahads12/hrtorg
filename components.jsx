/* global React */
const { useState, useEffect, useRef } = React;

/* ============================================================
   ICONS (inline SVG, stroke 1.5)
   ============================================================ */
const Icon = ({ d, size = 20, sw = 1.6, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const Icons = {
  arrow: <Icon d={<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></>} />,
  shield: <Icon d={<><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" /><path d="M9 12l2 2 4-4" /></>} />,
  users: <Icon d={<><circle cx="8" cy="9" r="3.2" /><circle cx="16" cy="9" r="2.5" /><path d="M2 20c0-3 2.7-5 6-5s6 2 6 5" /><path d="M14 20c0-2.5 2-4 4-4s4 1.5 4 4" /></>} />,
  provider: <Icon size={28} sw={1.4} d={<><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-1.5C5 16 8 14 12 14s7 2 7 5.5V21" /><path d="M9 7v-1a3 3 0 0 1 6 0v1" /></>} />,
  home: <Icon size={28} sw={1.4} d={<><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></>} />,
  clipboard: <Icon size={28} sw={1.4} d={<><rect x="6" y="4" width="12" height="17" rx="2" /><rect x="9" y="2" width="6" height="3" rx="0.6" /><line x1="9" y1="11" x2="15" y2="11" /><line x1="9" y1="15" x2="13" y2="15" /></>} />,
  box: <Icon size={28} sw={1.4} d={<><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><line x1="12" y1="11" x2="12" y2="21" /></>} />,
  laptop: <Icon size={28} sw={1.4} d={<><rect x="4" y="5" width="16" height="11" rx="1.5" /><line x1="2" y1="19" x2="22" y2="19" /></>} />,
  test: <Icon size={28} sw={1.4} d={<><path d="M9 3v9l-3 6a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-3-6V3" /><line x1="7" y1="3" x2="17" y2="3" /><line x1="9" y1="13" x2="15" y2="13" /></>} />,
  truck: <Icon size={28} sw={1.4} d={<><rect x="2" y="7" width="13" height="10" rx="1" /><path d="M15 10h4l3 4v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>} />,
  user: <Icon d={<><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></>} />,
  flask: <Icon d={<><path d="M9 3h6v5l5 10a2 2 0 0 1-2 3H6a2 2 0 0 1-2-3l5-10z" /><line x1="9" y1="3" x2="15" y2="3" /></>} />,
  lock: <Icon d={<><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>} />,
  check: <Icon size={14} sw={2.2} d={<polyline points="4 12 10 18 20 6" />} />,
  // Symptom icons (line, refined)
  flame: <Icon size={32} sw={1.5} d={<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5 2 1 3-1 3-3z" />} />,
  battery: <Icon size={32} sw={1.5} d={<><rect x="6" y="4" width="12" height="17" rx="2" /><line x1="9" y1="2" x2="15" y2="2" /><line x1="9" y1="17" x2="15" y2="17" /></>} />,
  brain: <Icon size={32} sw={1.5} d={<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 1 5 3 3 0 0 0 3 3h6a3 3 0 0 0 3-3 3 3 0 0 0 1-5 3 3 0 0 0-1-5 3 3 0 0 0-3-3z M12 4v16 M9 9h3 M12 13h3" />} />,
  moon: <Icon size={32} sw={1.5} d={<path d="M20 14a8 8 0 1 1-9-9 6 6 0 0 0 9 9z" />} />,
  face: <Icon size={32} sw={1.5} d={<><path d="M5 11c0-5 3-8 7-8s7 3 7 8c0 4-2 9-7 9s-7-5-7-9z" /><circle cx="10" cy="11" r="0.6" fill="currentColor" /><circle cx="14" cy="11" r="0.6" fill="currentColor" /></>} />,
  scale: <Icon size={32} sw={1.5} d={<><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 8l3-2 3 2" /><line x1="12" y1="6" x2="12" y2="13" /></>} />,
  heart: <Icon size={32} sw={1.5} d={<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />} />,
  venus: <Icon size={32} sw={1.5} d={<><circle cx="12" cy="9" r="5" /><line x1="12" y1="14" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" /></>} />,
  mars: <Icon size={32} sw={1.5} d={<><circle cx="10" cy="14" r="5" /><line x1="14" y1="10" x2="20" y2="4" /><polyline points="15 4 20 4 20 9" /></>} />,
  dumbbell: <Icon size={32} sw={1.5} d={<><rect x="2" y="9" width="3" height="6" rx="0.5" /><rect x="19" y="9" width="3" height="6" rx="0.5" /><rect x="5" y="10" width="2" height="4" /><rect x="17" y="10" width="2" height="4" /><line x1="7" y1="12" x2="17" y2="12" /></>} />,
  muscle: <Icon size={32} sw={1.5} d={<path d="M5 10c2 0 4-1 5-3 1 1 3 1 4 0l4 4c1 1 1 3 0 4-1 1-3 1-4 0l-1-1c-2 2-5 3-8 2v-6z" />} />,
};

/* ============================================================
   LOGO
   ============================================================ */
function Logo() {
  return (
    <img className="logo hrt-logo" src="uploads/hrt-logo.webp" alt="HRT.org" width="1800" height="900" />
  );
}

/* ============================================================
   GENDER TOGGLE
   ============================================================ */
function GenderToggle({ gender, onChange }) {
  const ref = useRef(null);
  const [slider, setSlider] = useState({ left: 4, width: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const btn = ref.current.querySelector(`button[data-g="${gender}"]`);
    if (btn) {
      setSlider({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  }, [gender]);

  return (
    <div className="gender-toggle" ref={ref}>
      <span className="slider" style={{ left: slider.left, width: slider.width }} />
      <button data-g="women" className={gender === "women" ? "active" : ""} onClick={() => onChange("women")}>Women</button>
      <button data-g="men" className={gender === "men" ? "active" : ""} onClick={() => onChange("men")}>Men</button>
    </div>
  );
}

/* ============================================================
   NAV
   ============================================================ */
function Nav({ gender, setGender }) {
  const handleGender = (g) => {
    setGender(g);
    try { history.replaceState(null, "", "#" + g); } catch (e) {}
  };
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="HRT Home.html" style={{ textDecoration: "none" }}><Logo /></a>
        <div className="nav-links">
          <SymptomCheckMenu />
          <a className="nav-link" href="HRT Home.html">Home</a>
          <a className="nav-link" href="Audience.html?g=women">For Women</a>
          <a className="nav-link" href="Audience.html?g=men">For Men</a>
          <a className="nav-link" href="Pricing.html">Pricing</a>
          <a className="nav-link" href="Resources.html">Resources</a>
          <a className="nav-link" href="About.html">About</a>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <GenderToggle gender={gender} onChange={handleGender} />
          <a className="btn btn-primary" href="/portal/app/symptoms-tracker/">Get Started</a>
        </div>
      </div>
    </nav>
  );
}

/* ============================================================
   IMAGE SLOT — gradient placeholder
   ============================================================ */
function ImageSlot({ label, ratio = "4/5", className = "", children }) {
  return (
    <div className={`image-slot ${className}`} style={{ aspectRatio: ratio }}>
      <div className="label">{label}</div>
      {children}
    </div>
  );
}

/* ============================================================
   PRODUCT CARDS (decorative)
   ============================================================ */
function ProductCard({ name, height = "normal" }) {
  const cls = height === "tall" ? "product-card tall" : height === "short" ? "product-card short" : "product-card";
  return (
    <div className={cls}>
      <div className="pc-top">
        <div>
          <div className="pc-brand">HRT</div>
          <div className="pc-tld">hrt.org</div>
        </div>
      </div>
      <div className="pc-bottom">
        <div className="pc-name">{name}</div>
      </div>
    </div>
  );
}

const SYMPTOM_CHECK_OPTIONS = [
  ["female", "Female Hormone Imbalance Test"],
  ["male", "Male Hormone Imbalance Test"],
  ["pms", "PMS Self-Assessment Test"],
  ["thyroid", "Thyroid Assessment Test"],
  ["adrenal", "Adrenal Fatigue Assessment Test"],
  ["osteoporosis", "Osteoporosis Assessment Test"],
  ["andropause", "Andropause Assessment Test"],
  ["menopause", "Menopause Assessment Test"],
  ["perimenopause", "Perimenopause Assessment Test"],
];

function SymptomCheckMenu() {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const button = useRef(null);
  const id = React.useId();
  useEffect(() => {
    if (!open) return;
    const outside = event => { if (!container.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="symptom-nav" ref={container} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={button} type="button" className="nav-link symptom-nav-trigger" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
      Symptom Check <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4"/></svg>
    </button>
    {open && <div id={id} className="symptom-nav-dropdown"><ul>
      {SYMPTOM_CHECK_OPTIONS.map(([key,label]) => <li key={key}><a href={`Symptom Check.html?test=${key}`}>{label}</a></li>)}
    </ul></div>}
  </div>;
}

Object.assign(window, { Icons, Logo, Nav, GenderToggle, ImageSlot, ProductCard, SymptomCheckMenu, SYMPTOM_CHECK_OPTIONS });
