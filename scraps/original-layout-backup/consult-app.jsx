/* global React, ReactDOM, Icons, Logo, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakColor,
   GOALS, SYMPTOMS, CONDITIONS, LIFESTYLE, SUCCESS, PROVIDERS, PLAN_PREVIEW, US_STATES */
const { useState, useEffect, useMemo, useRef } = React;

const STORE_KEY = "hrt-consult-v1";
const DURATIONS = ["< 3 months", "3–12 months", "1–3 years", "3+ years"];

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
    symptomHelp: "Select everything that sounds like you — there are no wrong answers.",
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

function Choice({ sel, icon, name, eyebrow, desc, onClick }) {
  return (
    <button type="button" className={`cz-choice${sel ? " sel" : ""}`} onClick={onClick}>
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
    <button type="button" className={`cz-chip${sel ? " sel" : ""}`} onClick={onClick}>
      <span className="mk">{sel && tickIc}</span>{label}
    </button>
  );
}

function Seg({ options, value, onChange }) {
  return (
    <div className="cz-seg">
      {options.map((o) => (
        <button key={o} type="button" className={value === o ? "sel" : ""} onClick={() => onChange(o)}>{o}</button>
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
      <p className="cz-help">{tone.aboutHelp}</p>

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
            <input id="fn" className="cz-input" type="text" placeholder="Jordan" value={a.firstName || ""}
              onChange={(e) => set({ firstName: e.target.value })} />
          </div>
          <div className="cz-field">
            <label htmlFor="dob">Date of birth</label>
            <input id="dob" className="cz-input" type="date" value={a.dob || ""}
              onChange={(e) => set({ dob: e.target.value })} />
          </div>
          <div className="cz-field">
            <label htmlFor="st">State you live in</label>
            <select id="st" className="cz-select" value={a.state || ""} onChange={(e) => set({ state: e.target.value })}>
              <option value="" disabled>Select your state</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="cz-field">
            <label htmlFor="em">Email</label>
            <input id="em" className="cz-input" type="email" placeholder="you@email.com" value={a.email || ""}
              onChange={(e) => set({ email: e.target.value })} />
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
      <p className="cz-help">Pick what matters most right now. You can add more with your provider later.</p>
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
              <button key={n} type="button" className={a.severity === n ? "sel" : ""} onClick={() => set({ severity: n })}>{n}</button>
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
      <p className="cz-help">This helps your provider prescribe safely. Be honest — nothing here disqualifies you automatically.</p>
      <div className="cz-fieldset">
        <div className="cz-checklist">
          {CONDITIONS.map((c) => {
            const sel = picked.includes(c.label);
            return (
              <button key={c.label} type="button" className={`cz-check${sel ? " sel" : ""}${c.flag ? " flagged" : ""}`} onClick={() => toggle(c)}>
                <span className="box">{sel && tickIc}</span>{c.label}
              </button>
            );
          })}
        </div>

        {flagged && (
          <div className="cz-note cz-anim">
            <span className="ic">{Icons.shield}</span>
            <span className="tx"><b>Good to know — this is exactly why we ask.</b> A few of your answers are things your provider will want to review closely before prescribing. It doesn't rule anything out; it just means a clinician looks before you start.</span>
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
      <p className="cz-help">Context helps your provider tailor the plan — and pick up on things labs alone might miss.</p>
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

function StepVerify({ a, set, tone }) {
  const fileRef = useRef(null);
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => set({ idImage: ev.target.result, idName: f.name });
    reader.readAsDataURL(f);
  };
  const consents = a.consents || {};
  const tc = (k) => set({ consents: { ...consents, [k]: !consents[k] } });
  return (
    <div className="cz-step">
      <span className="cz-eyebrow">Step 6 · Verify & consent</span>
      <h1 className="cz-q">Last step — let's <span className="accent">verify it's you.</span></h1>
      <p className="cz-help">A one-time photo of a government ID confirms your identity and state. Required by law for telehealth prescribing.</p>
      <div className="cz-fieldset">
        <div className={`cz-upload${a.idImage ? " has" : ""}`}>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} aria-label="Upload ID" />
          {a.idImage ? (
            <>
              <img className="preview" src={a.idImage} alt="ID preview" />
              <div className="done-tag">{tickIc} {a.idName || "ID uploaded"} — looks good</div>
            </>
          ) : (
            <>
              <div className="uic">{Icons.shield}</div>
              <div className="ut">Upload a photo of your ID</div>
              <div className="us">Driver's license or passport · Drag & drop or click to browse</div>
            </>
          )}
        </div>

        <div className="cz-consents">
          <button type="button" className={`cz-consent${consents.tele ? " sel" : ""}`} onClick={() => tc("tele")}>
            <span className="box">{consents.tele && tickIc}</span>
            <span>I agree to the <a onClick={(e) => e.preventDefault()} href="#">Telehealth Consent</a> and to be treated by a licensed HRT.org provider.</span>
          </button>
          <button type="button" className={`cz-consent${consents.privacy ? " sel" : ""}`} onClick={() => tc("privacy")}>
            <span className="box">{consents.privacy && tickIc}</span>
            <span>I've read the <a onClick={(e) => e.preventDefault()} href="#">Privacy Practices</a> and consent to confidential handling of my health information.</span>
          </button>
        </div>
        {!a.idImage && (
          <div className="cz-hint" style={{ fontFamily: "inherit", fontSize: 12.5 }}>You can upload your ID now or we'll remind you before your first shipment.</div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   REVIEW / RECOMMENDATION
   ============================================================ */
function Review({ a, tone, onBack, onSubmit }) {
  const g = a.gender || "women";
  const goal = GOALS.find((x) => x.key === a.goal) || GOALS[0];
  const prov = PROVIDERS[g];
  const plan = PLAN_PREVIEW[a.goal] || PLAN_PREVIEW.hrt;
  const topSymptoms = (a.symptoms || []).slice(0, 4);
  return (
    <>
      <div className="cz-step wide">
        <span className="cz-eyebrow">Your personalized review</span>
        <h1 className="cz-q">Here's what we'll send your <span className="accent">provider, {a.firstName || "friend"}.</span></h1>
        <p className="cz-help">Review your summary below. When you submit, a licensed provider reviews everything and responds — usually within 24 hours.</p>

        <div className="cz-rev-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div className="cz-panel cz-summary">
              <h3>Your intake summary</h3>
              <div className="cz-summ-row"><span className="k">Seeking care for</span><span className="v">{goal.name}</span></div>
              <div className="cz-summ-row"><span className="k">Symptoms</span><span className="v"><span className="cz-tags">{topSymptoms.map((s) => <span key={s}>{s}</span>)}{(a.symptoms || []).length > 4 && <span>+{a.symptoms.length - 4} more</span>}</span></span></div>
              <div className="cz-summ-row"><span className="k">Daily impact</span><span className="v">{a.severity}/10 · {a.duration}</span></div>
              <div className="cz-summ-row"><span className="k">Goals</span><span className="v">{(a.success || []).join(", ") || "—"}</span></div>
              <div className="cz-summ-row"><span className="k">State</span><span className="v">{a.state || "—"}</span></div>
              <div className="cz-summ-row"><span className="k">ID verification</span><span className="v">{a.idImage ? "Uploaded ✓" : "Pending"}</span></div>
            </div>
            <div className="cz-panel">
              <h3>Your matched provider</h3>
              <div className="cz-provider">
                <div className="av">{prov.initials}</div>
                <div>
                  <div className="pn">{prov.name}</div>
                  <div className="ps">{prov.spec}</div>
                </div>
              </div>
              <div className="cz-prov-line">{prov.line} · {prov.states}. They'll review your intake personally before any prescription.</div>
            </div>
          </div>

          <div className="cz-panel cz-plan">
            <h3>Likely a good fit</h3>
            <div className="pname">{plan.name}</div>
            <div className="price"><span className="amt">from {plan.from}</span><span className="per">{plan.per}</span></div>
            <ul>
              {plan.includes.map((i) => <li key={i}><span className="ck">{tickIc}</span>{i}</li>)}
            </ul>
            <div className="note">Final plan & pricing are confirmed by your provider after review. You won't be charged anything to submit.</div>
          </div>
        </div>
      </div>
      <div className="cz-foot wide">
        <button className="cz-back" onClick={onBack}>{backIc} Back</button>
        <div className="right">
          {tone === TONES.clinical ? null : <span className="reassure">No card required · Cancel anytime</span>}
          <button className="cz-continue" onClick={onSubmit}>{tone.submit} {arrowIc}</button>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   CONFIRMATION
   ============================================================ */
function Done({ a }) {
  const g = a.gender || "women";
  const prov = PROVIDERS[g];
  const tl = [
    { ring: "now", label: <>{Icons.check}</>, t: "Intake submitted", d: "Your information is securely with our clinical team — just now." },
    { ring: "next", label: "1", t: `${prov.name} reviews your file`, d: "A licensed provider personally reviews everything. Expect a reply within 24 hours." },
    { ring: "next", label: "2", t: "Lab kit ships, if needed", d: "Some plans start with a quick at-home lab kit — finger-prick, pre-paid return." },
    { ring: "next", label: "3", t: "Your plan is confirmed", d: "Approve your plan, then treatment ships discreetly to your door." },
  ];
  return (
    <div className="cz-done cz-anim">
      <div className="seal"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg></div>
      <h1>You're all set{a.firstName ? `, ${a.firstName}` : ""}.<br/><span className="accent">Your provider takes it from here.</span></h1>
      <p className="sub">We've sent a confirmation to {a.email || "your email"}. Nothing's been charged — you only pay once your provider confirms your plan.</p>
      <div className="cz-timeline">
        {tl.map((item, i) => (
          <div className="cz-tl-item" key={i}>
            <div className="marker">
              <div className={`ring ${item.ring}`}>{item.label}</div>
              <div className="stem"></div>
            </div>
            <div className="body">
              <div className="tt">{item.t}</div>
              <div className="td">{item.d}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="cz-done-actions">
        <a className="btn btn-primary" href="https://portal.hrt.org">Go to my dashboard {arrowIc}</a>
        <a className="btn btn-ghost" href="Resources.html">Explore resources while you wait</a>
      </div>
    </div>
  );
}

const arrowIc = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></svg>;
const backIc = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="11 18 5 12 11 6" /></svg>;

/* ============================================================
   PROGRESS
   ============================================================ */
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
const STEP_NAMES = ["About you", "Your goal", "Symptoms", "Health history", "Lifestyle & goals", "Verify & consent"];
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");

function ConsultApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const initial = useMemo(() => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); } catch (e) {}
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

  const set = (patch) => setAnswers((prev) => ({ ...prev, ...patch }));

  // theme + persistence
  useEffect(() => { document.body.setAttribute("data-gender", answers.gender || "women"); }, [answers.gender]);
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ answers, step, phase })); } catch (e) {}
  }, [answers, step, phase]);
  useEffect(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }, [step, phase]);

  const tone = TONES[t.tone] || TONES.warm;
  const ctaVar = t.ctaColor === "teal" ? "var(--teal)" : t.ctaColor === "ink" ? "var(--ink)" : "var(--primary)";

  // validation per step
  const valid = useMemo(() => {
    const a = answers;
    switch (step) {
      case 0: return !!a.gender && !!(a.firstName || "").trim() && !!a.dob && !!a.state && emailOk(a.email);
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
          : <div className="cz-prog"><div className="meta"><span className="step-name">{phase === "done" ? "Submitted" : "Review your intake"}</span><span className="step-count">{phase === "done" ? "DONE" : "ALMOST THERE"}</span></div><div className="cz-bar"><i style={{ width: "100%" }}></i></div></div>}
        <div className="right">
          {t.reassurance && phase === "intake" && (
            <span className="cz-save"><span className="dot pulse"></span>{tone.saved}</span>
          )}
          <a className="cz-exit" href="HRT Home.html">Save & exit</a>
        </div>
      </div>

      <div className="cz-main" ref={mainRef}>
        <div className="cz-center">
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
                    {step === STEP_NAMES.length - 1 ? "Review my intake" : "Continue"} {arrowIc}
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

      <TweaksPanel title="Tweaks">
        <TweakSection label="Progress" />
        <TweakRadio label="Indicator" value={t.progressStyle} options={["bar", "segments", "dots"]}
          onChange={(v) => setTweak("progressStyle", v)} />
        <TweakSection label="Voice" />
        <TweakRadio label="Tone" value={t.tone} options={["warm", "clinical"]}
          onChange={(v) => setTweak("tone", v)} />
        <TweakToggle label="Reassurance microcopy" value={t.reassurance}
          onChange={(v) => setTweak("reassurance", v)} />
        <TweakSection label="Accent" />
        <TweakRadio label="Button color" value={t.ctaColor}
          options={["theme", "teal", "ink"]}
          onChange={(v) => setTweak("ctaColor", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ConsultApp />);
