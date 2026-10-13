/* global React, ReactDOM, COPY, Nav, Hero, FeaturesStrip, Symptoms, Treatments, HowItWorks, WhyChoose, Testimonials, CTABanner, Footer, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle, TweakSelect */
const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "gender": "women",
  "density": "comfortable",
  "showProductOverlay": true,
  "motion": "subtle"
}/*EDITMODE-END*/;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const gender = tweaks.gender;
  const [fading, setFading] = useState(false);

  // Hash-driven entry: HRT Landing.html#men or #women
  useEffect(() => {
    const applyHash = () => {
      const h = (location.hash || "").replace("#", "").toLowerCase();
      if ((h === "men" || h === "women") && h !== tweaks.gender) {
        setTweak("gender", h);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // Sync gender to body attribute (drives CSS theme)
  useEffect(() => { document.body.setAttribute("data-gender", gender); }, [gender]);

  useReveal();

  const handleGenderChange = (g) => {
    if (g === gender) return;
    setFading(true);
    setTimeout(() => {
      setTweak("gender", g);
      setTimeout(() => setFading(false), 40);
    }, 280);
  };

  const copy = COPY[gender];

  return (
    <div data-screen-label={`HRT Landing — ${gender === "women" ? "Women" : "Men"}`}>
      <Nav gender={gender} setGender={handleGenderChange} />
      <main className={`gender-fade ${fading ? "fading" : ""}`}>
        <Hero copy={copy} />
        <FeaturesStrip />
        <div className="reveal"><Symptoms copy={copy} /></div>
        <div className="reveal"><Treatments copy={copy} /></div>
        <div className="reveal"><HowItWorks /></div>
        <div className="reveal"><WhyChoose copy={copy} /></div>
        <div className="reveal"><Testimonials copy={copy} /></div>
        <div className="reveal"><CTABanner copy={copy} /></div>
        <Footer gender={gender} />
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Audience">
          <TweakRadio label="Active landing page" value={tweaks.gender} options={[{ value: "women", label: "Women" }, { value: "men", label: "Men" }]} onChange={v => handleGenderChange(v)} />
        </TweakSection>
        <TweakSection title="Layout">
          <TweakRadio label="Density" value={tweaks.density} options={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }]} onChange={v => {
            setTweak("density", v);
            document.documentElement.style.setProperty("--section-pad", v === "compact" ? "64px" : "96px");
          }} />
          <TweakToggle label="Show product overlay on hero" value={tweaks.showProductOverlay} onChange={v => setTweak("showProductOverlay", v)} />
        </TweakSection>
        <TweakSection title="Motion">
          <TweakRadio label="Reveal intensity" value={tweaks.motion} options={[{ value: "none", label: "Off" }, { value: "subtle", label: "Subtle" }]} onChange={v => setTweak("motion", v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// Apply density / overlay tweaks via CSS
const styleEl = document.createElement("style");
styleEl.id = "__tweak-overrides";
document.head.appendChild(styleEl);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
