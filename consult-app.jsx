/* global React, ReactDOM, Icons, Logo, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakColor,
   GOALS, SYMPTOMS, CONDITIONS, LIFESTYLE, SUCCESS, PROVIDERS, PLAN_PREVIEW, US_STATES */
const { useState, useEffect, useMemo, useRef } = React;

const DURATIONS = ["< 3 months", "3–12 months", "1–3 years", "3+ years"];
const today = new Date();
const latestBirthDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const validBirthDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && value <= latestBirthDate && Number.isFinite(Date.parse(value));

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "progressStyle": "bar",
  "tone": "warm",
  "ctaColor": "theme",
  "reassurance": true
}/*EDITMODE-END*/;

const TONES = {
  warm: {
    reassure: "Takes about 10 minutes · No card required",
    saved: "Saved · resume anytime",
    aboutHelp: "A few basics so a licensed provider in your state can care for you. Everything is private and HIPAA-protected.",
    symptomHelp: "Select everything that applies to you. There are no wrong answers.",
    submit: "Submit for provider review",
  },
  clinical: {
    reassure: "Est. 10 min · Payment not required to submit",
    saved: "Progress saved",
    aboutHelp: "Required for provider licensing and identity verification. Protected under HIPAA.",
    symptomHelp: "Select all that apply.",
    submit: "Submit intake for review",
  },
};

/* ============================================================
   SMALL UI HELPERS
   ============================================================ */
const tickIc = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>;
const arrowIc=Icons.arrow;
const backIc=<span aria-hidden="true">←</span>;

function Choice({ sel, icon, name, eyebrow, desc, onClick }) {
  return (
    <button type="button" aria-pressed={!!sel} className={`cz-choice${sel ? " sel" : ""}`} onClick={onClick}>
      {icon && <span className="ic">{icon}</span>}
      <span className="tx">
        <span className="nm">{name}{eyebrow && <span className="eb">{eyebrow}</span>}</span>
        {desc && <span className="ds">{desc}</span>}
      </span>
      <span className="tick">{sel && tickIc}</span>
    </button>
  );
}

function Chip({ sel, label, onClick }) {
  return (
    <button type="button" aria-pressed={!!sel} className={`cz-chip${sel ? " sel" : ""}`} onClick={onClick}>
      <span className="mk">{sel && tickIc}</span>{label}
    </button>
  );
}

function Seg({ options, value, onChange }) {
  return (
    <div className="cz-seg">
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} className={value === o ? "sel" : ""} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

/* ============================================================
   STEP RENDERERS
   ============================================================ */
function StepAbout({ a, set, tone }) {
  return (
    <div className="cz-step">
      <span className="cz-eyebrow">Step 1 · About you</span>
      <h1 className="cz-q">First, a little <span className="accent">about you.</span></h1>
      <p className="cz-help">{tone.aboutHelp} All fields below are required to continue with this optional guide.</p>

      <div className="cz-fieldset">
        <div className="cz-row">
          <span className="lab">I'm seeking care as</span>
          <div className="cz-gender">
            <Choice sel={a.gender === "women"} icon={Icons.venus} name="A woman"
              desc="Hormone, weight, sexual, hair & longevity care for women"
              onClick={() => set({ gender: "women" })} />
            <Choice sel={a.gender === "men"} icon={Icons.mars} name="A man"
              desc="TRT, weight, sexual, hair & longevity care for men"
              onClick={() => set({ gender: "men" })} />
          </div>
        </div>

        <div className="cz-grid">
          <div className="cz-field">
            <label htmlFor="fn">First name</label>
            <input id="fn" className="cz-input" type="text" required autoComplete="given-name" placeholder="Jordan" value={a.firstName || ""}
              onChange={(e) => set({ firstName: e.target.value })} />
          </div>
          <div className="cz-field">
            <label htmlFor="dob">Date of birth</label>
            <input id="dob" className="cz-input" type="date" required autoComplete="bday" max={latestBirthDate} aria-describedby="dob-help" aria-invalid={!!a.dob && !validBirthDate(a.dob)} value={a.dob || ""}
              onChange={(e) => set({ dob: e.target.value })} />
            <span id="dob-help" className="cz-input-help">Enter your date of birth. It cannot be in the future.</span>
          </div>
          <div className="cz-field">
            <label htmlFor="st">State you live in</label>
            <select id="st" className="cz-select" required autoComplete="address-level1" value={a.state || ""} onChange={(e) => set({ state: e.target.value })}>
              <option value="" disabled>Select your state</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="cz-field">
            <label htmlFor="em">Email</label>
            <input id="em" className="cz-input" type="email" required autoComplete="email" aria-describedby="email-help" placeholder="you@email.com" value={a.email || ""}
              onChange={(e) => set({ email: e.target.value })} />
            <span id="email-help" className="cz-input-help">Enter a complete email address, such as name@example.com.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepGoal({ a, set }) {
  const g = a.gender || "women";
  return (
    <div className="cz-step">
      <span className="cz-eyebrow">Step 2 · Your goal</span>
      <h1 className="cz-q">What brings you in <span className="accent">today?</span></h1>
      <p className="cz-help">Choose what matters most to you right now. You can discuss other concerns with your provider later.</p>
      <div className="cz-fieldset cz-choices cols-list">
        {GOALS.map((goal) => (
          <Choice key={goal.key} sel={a.goal === goal.key} icon={goal.icon} name={goal.name}
            eyebrow={goal.eyebrow} desc={goal.desc[g]} onClick={() => set({ goal: goal.key })} />
        ))}
      </div>
    </div>
  );
}

function StepSymptoms({ a, set, tone }) {
  const g = a.gender || "women";
  const list = (SYMPTOMS[a.goal] || SYMPTOMS.hrt)[g];
  const picked = a.symptoms || [];
  const toggle = (s) => set({ symptoms: picked.includes(s) ? picked.filter((x) => x !== s) : [...picked, s] });
  return (
    <div className="cz-step">
      <span className="cz-eyebrow">Step 3 · Your symptoms</span>
      <h1 className="cz-q">Which of these <span className="accent">sound familiar?</span></h1>
      <p className="cz-help">{tone.symptomHelp}</p>
      <div className="cz-fieldset">
        <div className="cz-chips">
          {list.map((s) => <Chip key={s} sel={picked.includes(s)} label={s} onClick={() => toggle(s)} />)}
        </div>

        <div className="cz-row" style={{ marginTop: 36 }}>
          <span className="lab">How much is this affecting your daily life?</span>
          <div className="cz-scale">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" aria-label={`${n} out of 10`} aria-pressed={a.severity === n} className={a.severity === n ? "sel" : ""} onClick={() => set({ severity: n })}>{n}</button>
            ))}
          </div>
          <div className="cz-scale-ends"><span>Barely</span><span>A great deal</span></div>
        </div>

        <div className="cz-row">
          <span className="lab">How long has this been going on?</span>
          <Seg options={DURATIONS} value={a.duration} onChange={(v) => set({ duration: v })} />
        </div>
      </div>
    </div>
  );
}

function StepHistory({ a, set }) {
  const picked = a.conditions || [];
  const toggle = (c) => {
    if (c.exclusive) { set({ conditions: picked.includes(c.label) ? [] : [c.label] }); return; }
    let next = picked.filter((x) => x !== "None of the above");
    next = next.includes(c.label) ? next.filter((x) => x !== c.label) : [...next, c.label];
    set({ conditions: next });
  };
  const flagged = CONDITIONS.some((c) => c.flag && picked.includes(c.label));
  return (
    <div className="cz-step">
      <span className="cz-eyebrow">Step 4 · Health history</span>
      <h1 className="cz-q">Have you ever been <span className="accent">diagnosed with</span> any of these?</h1>
      <p className="cz-help">Your answers help your provider prescribe safely. Answer honestly; nothing here automatically disqualifies you.</p>
      <div className="cz-fieldset">
        <div className="cz-checklist">
          {CONDITIONS.map((c) => {
            const sel = picked.includes(c.label);
            return (
              <button key={c.label} type="button" aria-pressed={sel} className={`cz-check${sel ? " sel" : ""}${c.flag ? " flagged" : ""}`} onClick={() => toggle(c)}>
                <span className="box">{sel && tickIc}</span>{c.label}
              </button>
            );
          })}
        </div>

        {flagged && (
          <div className="cz-note cz-anim">
            <span className="ic">{Icons.shield}</span>
            <span className="tx"><b>Good to know — this is exactly why we ask.</b> Some of your answers need a closer review before a provider prescribes treatment. Discuss them with a qualified clinician before starting treatment.</span>
          </div>
        )}

        <div className="cz-field full" style={{ marginTop: 26 }}>
          <label htmlFor="meds">Current medications & supplements <span className="opt">(optional)</span></label>
          <textarea id="meds" className="cz-input" placeholder="e.g. Levothyroxine 50mcg, Vitamin D, Magnesium…" value={a.meds || ""} onChange={(e) => set({ meds: e.target.value })}></textarea>
        </div>
      </div>
    </div>
  );
}

function StepLifestyle({ a, set }) {
  const g = a.gender || "women";
  const goals = (SUCCESS[a.goal] || SUCCESS.hrt)[g];
  const picked = a.success || [];
  const toggle = (s) => set({ success: picked.includes(s) ? picked.filter((x) => x !== s) : [...picked, s] });
  const ls = a.lifestyle || {};
  return (
    <div className="cz-step">
      <span className="cz-eyebrow">Step 5 · Lifestyle & goals</span>
      <h1 className="cz-q">A snapshot of your <span className="accent">daily life.</span></h1>
      <p className="cz-help">These details help your provider tailor your plan and understand things that lab results alone might miss.</p>
      <div className="cz-fieldset">
        {LIFESTYLE.map((q) => (
          <div className="cz-row" key={q.key}>
            <span className="lab">{q.q}</span>
            <Seg options={q.options} value={ls[q.key]} onChange={(v) => set({ lifestyle: { ...ls, [q.key]: v } })} />
          </div>
        ))}
        <div className="cz-row">
          <span className="lab">What would success look like for you?</span>
          <div className="cz-chips">
            {goals.map((s) => <Chip key={s} sel={picked.includes(s)} label={s} onClick={() => toggle(s)} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepVerify({a,set}){const c=a.consents||{};return <><div className="eyebrow">Before you continue</div><h1>Review your <em>next step.</em></h1><p className="cz-sub">Your preparation notes stay on this page. Use the HRT.org patient portal to complete clinical consent and any identity verification.</p><label className="cz-field"><input type="checkbox" checked={!!c.tele} onChange={e=>set({consents:{...c,tele:e.target.checked}})}/> I understand these notes have not been sent to a provider.</label><label className="cz-field"><input type="checkbox" checked={!!c.privacy} onChange={e=>set({consents:{...c,privacy:e.target.checked}})}/> I have reviewed the privacy information.</label><p><a href="Privacy Policy.html" target="_blank" rel="noopener">Read the privacy policy</a></p></>;}

function Review({a,onBack,onSubmit}){return <><div className="eyebrow">Your preparation</div><h1>Review your <em>notes.</em></h1><p className="cz-sub">Your notes have not been submitted. Keep them handy when you complete the official intake in the patient portal.</p><dl>{[['Name',a.firstName],['Care interest',GOALS.find(g=>g.key===a.goal)?.name||a.goal],['Symptoms',(a.symptoms||[]).join(', ')],['Duration',a.duration],['Medical history',(a.conditions||[]).join(', ')]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><div className="cz-foot"><button className="cz-back" onClick={onBack}>Back</button><button className="cz-continue" onClick={onSubmit}>Finish preparation</button></div></>;}

function Done(){return <><div className="eyebrow">Preparation complete</div><h1>Your next step: <em>the patient portal.</em></h1><p className="cz-sub">Your notes have not been sent to HRT.org. Go to the official patient portal to complete your intake and request care. Finishing this page does not book or confirm a consultation.</p><a className="btn btn-primary" href="/portal/app/symptoms-tracker/">Continue to HRT.org patient portal</a><p><a href="Contact.html">Contact HRT.org for help</a></p></>;}

function Progress({ style, step, total, name }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="cz-prog">
      <div className="meta">
        <span className="step-name">{name}</span>
        <span className="step-count">{String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>
      {style === "bar" && <div className="cz-bar"><i style={{ width: pct + "%" }}></i></div>}
      {style === "segments" && (
        <div className="cz-segs">
          {Array.from({ length: total }).map((_, i) => <i key={i} className={i < step ? "done" : i === step ? "active" : ""}></i>)}
        </div>
      )}
      {style === "dots" && (
        <div className="cz-dots">
          {Array.from({ length: total }).map((_, i) => <i key={i} className={i < step ? "done" : i === step ? "active" : ""}></i>)}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
const STEP_NAMES = ["About you", "Your goal", "Symptoms", "Health history", "Lifestyle & goals", "Next step"];
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");

function ConsultApp() {
  const [t, setTweak] = useState(TWEAK_DEFAULTS);

  const initial = useMemo(() => {
    let saved = null;

    const params = new URLSearchParams(location.search);
    const base = saved || { answers: {}, step: 0, phase: "intake" };
    // Prefill from URL (?g=men&p=hrt) only on a fresh start
    if (!saved) {
      if (params.get("g") === "men" || params.get("g") === "women") base.answers.gender = params.get("g");
      const p = params.get("p");
      if (p && GOALS.some((x) => x.key === p)) base.answers.goal = p;
    }
    return base;
  }, []);

  const [answers, setAnswers] = useState(initial.answers);
  const [step, setStep] = useState(initial.step);
  const [phase, setPhase] = useState(initial.phase);
  const mainRef = useRef(null);

  const set = (patch) => setAnswers((prev) => {
    const contextChanged = (patch.gender !== undefined && patch.gender !== prev.gender)
      || (patch.goal !== undefined && patch.goal !== prev.goal);
    // These answers describe a particular audience and care goal. Require a
    // fresh choice when that context changes instead of retaining hidden chips.
    return { ...prev, ...(contextChanged ? { symptoms: [], severity: undefined, duration: undefined, success: [], consents: {} } : {}), ...patch };
  });

  // Keep health answers in component memory for this visit only.
  useEffect(() => { document.body.setAttribute("data-gender", answers.gender || "women"); }, [answers.gender]);

  const initialScreen = useRef(true);
  useEffect(() => { if(initialScreen.current){initialScreen.current=false;return;} const heading=mainRef.current?.querySelector('h1'); if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'instant'});} }, [step, phase]);

  const tone = {...TONES.warm,aboutHelp:"Prepare notes for your conversation with a provider. Complete the official intake and clinical consent in the patient portal. HRT.org lists telehealth services in Florida and California.",saved:"On this page only",reassure:"Not submitted to HRT.org"};
  const ctaVar = t.ctaColor === "teal" ? "var(--teal)" : t.ctaColor === "ink" ? "var(--ink)" : "var(--primary)";

  // validation per step
  const valid = useMemo(() => {
    const a = answers;
    switch (step) {
      case 0: return !!a.gender && !!(a.firstName || "").trim() && validBirthDate(a.dob) && !!a.state && emailOk(a.email);
      case 1: return !!a.goal;
      case 2: return (a.symptoms || []).length > 0 && !!a.severity && !!a.duration;
      case 3: return (a.conditions || []).length > 0;
      case 4: return LIFESTYLE.every((q) => (a.lifestyle || {})[q.key]) && (a.success || []).length > 0;
      case 5: return (a.consents || {}).tele && (a.consents || {}).privacy;
      default: return true;
    }
  }, [answers, step]);

  const next = () => {
    if (!valid) return;
    if (step < STEP_NAMES.length - 1) setStep(step + 1);
    else setPhase("review");
  };
  const back = () => {
    if (phase === "review") { setPhase("intake"); setStep(STEP_NAMES.length - 1); return; }
    if (step > 0) setStep(step - 1);
  };

  const renderStep = () => {
    const props = { a: answers, set, tone };
    switch (step) {
      case 0: return <StepAbout {...props} />;
      case 1: return <StepGoal {...props} />;
      case 2: return <StepSymptoms {...props} />;
      case 3: return <StepHistory {...props} />;
      case 4: return <StepLifestyle {...props} />;
      case 5: return <StepVerify {...props} />;
      default: return null;
    }
  };

  const screenLabel = phase === "done" ? "Confirmation" : phase === "review" ? "Review" : STEP_NAMES[step];

  return (
    <div className="cz-shell" style={{ "--cta": ctaVar }} data-screen-label={`Consult — ${screenLabel}`}>
      <div className="cz-top">
        <div className="left"><a href="HRT Home.html" style={{ textDecoration: "none" }}><Logo /></a></div>
        {phase === "intake"
          ? <Progress style={t.progressStyle} step={step} total={STEP_NAMES.length} name={STEP_NAMES[step]} />
          : <div className="cz-prog"><div className="meta"><span className="step-name">{phase === "done" ? "Prepared" : "Review your notes"}</span><span className="step-count">{phase === "done" ? "DONE" : "ALMOST THERE"}</span></div><div className="cz-bar"><i style={{ width: "100%" }}></i></div></div>}
        <div className="right">
          {t.reassurance && phase === "intake" && (
            <span className="cz-save"><span className="dot pulse"></span>{tone.saved}</span>
          )}
          <a className="cz-exit" href="HRT Home.html">Exit</a>
        </div>
      </div>

      <div className="cz-main" ref={mainRef}>
        <div className="cz-center"><p className="cz-preparation-note">This preparation is optional. Your answers stay on this page until you leave or refresh it. <a href="/portal/app/symptoms-tracker/">Go directly to the patient portal</a> to request care.</p>
          {phase === "intake" && (
            <>
              <div key={step} className="cz-anim">{renderStep()}</div>
              <div className="cz-foot">
                {step > 0
                  ? <button className="cz-back" onClick={back}>{backIc} Back</button>
                  : <span style={{ width: 1 }}></span>}
                <div className="right">
                  {t.reassurance && <span className="reassure">{tone.reassure}</span>}
                  <button className="cz-continue" disabled={!valid} onClick={next}>
                    {step === STEP_NAMES.length - 1 ? "Review my notes" : "Continue"} {arrowIc}
                  </button>
                </div>
              </div>
            </>
          )}
          {phase === "review" && (
            <div key="review" className="cz-anim">
              <Review a={answers} tone={tone} onBack={back} onSubmit={() => setPhase("done")} />
            </div>
          )}
          {phase === "done" && <Done a={answers} />}
        </div>
      </div>

      
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ConsultApp />);
