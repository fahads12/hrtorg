/* Educational self-checks: no diagnostic scores or treatment recommendations. */
const MENOPAUSE_SOURCE = ["National Institute on Aging", "https://www.nia.nih.gov/health/menopause/what-menopause"];
const MALE_SOURCE = ["Endocrine Society", "https://www.endocrine.org/patient-engagement/endocrine-library/hypogonadism"];
const MENOPAUSE_ITEMS = ["Hot flashes or night sweats", "Changes in sleep", "Mood changes", "Vaginal dryness or discomfort", "Changes in menstrual patterns"];
const MALE_ITEMS = ["Reduced sex drive", "Changes in erections", "Low energy", "Reduced muscle strength", "Changes in mood or concentration"];
const CHECK_TOPICS = {
  female: {title:"Female hormone health",items:MENOPAUSE_ITEMS,source:MENOPAUSE_SOURCE},
  male: {title:"Male hormone health",items:MALE_ITEMS,source:MALE_SOURCE},
  pms: {title:"PMS self-check",items:["Mood changes before a period", "Bloating before a period", "Breast tenderness", "Headaches", "Symptoms that affect daily activities"],note:"Note when symptoms appear and whether they improve after your period. A clinician can review the pattern with you.",source:["ACOG", "https://www.acog.org/womens-health/faqs/premenstrual-syndrome"]},
  thyroid: {title:"Thyroid symptom check",items:["Low energy", "Unexplained weight changes", "Feeling unusually cold or hot", "Changes in bowel habits", "Changes in heart rate"],note:"Symptoms alone cannot establish a thyroid condition. A clinician can decide whether thyroid testing is appropriate.",source:["NIDDK", "https://www.niddk.nih.gov/health-information/diagnostic-tests/thyroid"]},
  adrenal: {title:"Fatigue & stress check",items:["Persistent tiredness", "Difficulty sleeping", "Difficulty concentrating", "Feeling overwhelmed by stress"],note:"“Adrenal fatigue” is not a recognized medical diagnosis, and there is no validated test for it. Persistent fatigue has many possible causes that a clinician can assess.",source:["Endocrine Society", "https://www.endocrine.org/patient-engagement/endocrine-library/adrenal-fatigue"]},
  osteoporosis: {title:"Bone health conversation checklist",items:["A previous fracture after a minor fall", "A family history of osteoporosis", "Long-term use of steroid medications", "Changes in height or posture", "Questions about bone-density screening"],note:"Osteoporosis often has no symptoms before a fracture. This checklist helps prepare a bone-health conversation; it cannot measure bone density or calculate fracture risk.",source:["NIAMS", "https://www.niams.nih.gov/health-topics/osteoporosis"]},
  andropause: {title:"Testosterone & aging self-check",items:MALE_ITEMS,note:"Age-related changes and symptoms alone do not confirm low testosterone. Diagnosis requires clinical assessment and appropriate blood tests.",source:MALE_SOURCE},
  menopause: {title:"Menopause self-check",items:MENOPAUSE_ITEMS,source:MENOPAUSE_SOURCE},
  perimenopause: {title:"Perimenopause self-check",items:["Changes in menstrual patterns", ...MENOPAUSE_ITEMS.slice(0,4)],source:MENOPAUSE_SOURCE},
};

function SymptomCheckApp() {
  const key = new URLSearchParams(location.search).get("test");
  const topic = CHECK_TOPICS[key] || CHECK_TOPICS.female;
  const [selected,setSelected] = React.useState([]);
  const [notes,setNotes] = React.useState("");
  const [review,setReview] = React.useState(false);
  React.useEffect(() => {document.title = `${topic.title} | HRT.org`;}, [topic.title]);
  const toggle = item => setSelected(current => current.includes(item) ? current.filter(value => value !== item) : [...current,item]);
  return <>
    <nav className="nav" aria-label="Main navigation"><div className="wrap nav-inner"><a href="HRT Home.html"><Logo/></a><div className="nav-links"><a className="nav-link" href="HRT Home.html">Home</a><a className="nav-link" href="Treatments.html">Treatments</a><SymptomCheckMenu/><a className="nav-link" href="Resources.html">Resources</a></div><a href="Consultation.html" className="btn btn-primary">Get Started</a></div></nav>
    <main className="self-check wrap"><div className="eyebrow">Symptom Check · Private self-reflection</div><h1>{topic.title}</h1><p className="self-check-intro">Organize what you’ve noticed before a conversation with a healthcare professional. This is an educational checklist, not a diagnostic or laboratory test.</p>
      {topic.note && <div className="self-check-note">{topic.note}</div>}
      <div className="self-check-grid"><form className="self-check-card" onSubmit={event => {event.preventDefault();setReview(true);}}>
        <fieldset><legend>Which of these would you like to discuss?</legend>{topic.items.map(item => <label className="self-check-option" key={item}><input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)}/><span>{item}</span></label>)}</fieldset>
        <label className="self-check-notes">Anything else you’d like to note?<textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="For example, when you first noticed changes and how they affect daily life." rows="4"/></label>
        <button className="btn btn-primary" type="submit">Review my checklist {Icons.arrow}</button>
        <p className="self-check-private">Your answers stay on this page and are not saved or sent.</p>
      </form><aside className="self-check-card self-check-summary" aria-live="polite" aria-atomic="true">
        <h2>{review ? "Your conversation notes" : "A starting point for a conversation"}</h2>
        {review ? <>{selected.length ? <ul>{selected.map(item => <li key={item}>{item}</li>)}</ul> : <p>You haven’t selected any items. You can still discuss concerns with a clinician.</p>}{notes.trim() && <p className="self-check-user-notes">{notes}</p>}<p>This checklist does not determine whether you have a condition or need treatment.</p><button type="button" className="btn btn-ghost" onClick={() => window.print()}>Print my notes</button></> : <p>Choose the changes you’ve noticed, add any context, and review a summary you can print for your appointment.</p>}
        <a className="btn btn-primary" href="Consultation.html">Start a consultation {Icons.arrow}</a><a className="text-link" href="Resources.html#testing">Learn about lab testing {Icons.arrow}</a>
        <p className="self-check-source">Learn more from <a href={topic.source[1]} target="_blank" rel="noopener noreferrer">{topic.source[0]}</a>.</p>
      </aside></div>
      <a href="HRT Home.html" className="text-link">Back to HRT.org {Icons.arrow}</a>
    </main>
  </>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<SymptomCheckApp/>);
