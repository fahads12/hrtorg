// UI-only portal router. All form/demo state lives in memory for this page session.
const {useState: usePortalState, useEffect: usePortalEffect, useRef: usePortalRef} = React;
const portalSamplePatient = {firstName:'Jordan', lastName:'Taylor', email:'jordan.taylor@example.com', role:'Patient'};

function portalRoute(pathname) {
  const clean = pathname.replace(/\/index\.html$/, '/').replace(/^\/portal(?=\/|$)/, '').replace(/\/$/, '');
  return clean || '/';
}

function portalURL(pathname) {
  const route = portalRoute(pathname);
  return '/portal' + (route === '/' ? '/' : route + '/');
}

function PortalPreviewNote() {
  const [open, setOpen] = usePortalState(false);
  const toggle = usePortalRef(null);
  const closeNote = () => {setOpen(false); toggle.current?.focus();};
  usePortalEffect(() => {
    if (!open) return;
    const close = event => {if (event.key === 'Escape') closeNote();};
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  return <aside className="portal-preview-note" aria-label="About this preview">
    <div className="portal-preview-details" id="portal-preview-details" hidden={!open}>
      <strong>Patient portal UI preview</strong>
      <p>Try the screens with sample information. Forms work only in this browser tab and do not create an account, appointment, order, medical record, or email.</p>
      <p>Changes reset when you reload. Passwords are never saved or sent.</p>
      <button type="button" onClick={closeNote}>Close</button>
    </div>
    <button ref={toggle} type="button" className="portal-preview-toggle" aria-expanded={open} aria-controls="portal-preview-details" onClick={() => setOpen(!open)}>
      <span aria-hidden="true" className="portal-preview-dot"/> UI preview · No data sent
    </button>
  </aside>;
}

function PortalApp() {
  const [route, setRoute] = usePortalState(() => portalRoute(window.location.pathname));
  const [patient, setPatient] = usePortalState({...portalSamplePatient});
  const [session, setSession] = usePortalState(0);
  const [isDemoSession, setDemoSession] = usePortalState(() => (route === '/app' || route.startsWith('/app/')) && route !== '/app/symptoms-tracker');
  const previousRoute = usePortalRef(route);
  const navigate = pathname => {
    const next = portalRoute(pathname);
    if (next !== route) window.history.pushState({}, '', portalURL(next));
    if ((next === '/app' || next.startsWith('/app/')) && next !== '/app/symptoms-tracker') setDemoSession(true);
    setRoute(next);
    window.scrollTo({top:0, behavior:'instant'});
  };
  usePortalEffect(() => {
    const onPopState = () => {setRoute(portalRoute(window.location.pathname));};
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  usePortalEffect(() => {
    const titles = {'/':'Sign in', '/register':'Create an account', '/recover-password':'Recover your password', '/app/home':'Patient portal', '/app/appointment-scheduling':'Schedule appointment', '/app/lab-results':'Lab results', '/app/medical-history':'Medical history', '/app/my-orders':'Orders', '/app/user-kit-orders':'Kit orders', '/app/lab-tests':'Lab tests', '/app/tracker-history':'Symptoms tracker', '/app/symptoms-tracker':'Symptoms tracker', '/app/change-password':'Change password'};
    document.title = (titles[route] || 'Patient portal') + ' | HRT.org';
    document.body.dataset.portalScreen = route.split('/').filter(Boolean).pop() || 'login';
    const main = document.getElementById('portal-main');
    if ((route === '/app' || route.startsWith('/app/')) && route !== '/app/symptoms-tracker') setDemoSession(true);
    if (main) {
      main.setAttribute('tabindex', '-1');
      if (previousRoute.current !== route) main.focus({preventScroll:true});
    }
    previousRoute.current = route;
  }, [route]);
  const enterDemo = (details={}) => {
    // Deliberately accept a small non-sensitive display profile, never a password/token.
    setPatient({
      firstName: String(details.firstName || portalSamplePatient.firstName),
      lastName: String(details.lastName || portalSamplePatient.lastName),
      email: String(details.email || portalSamplePatient.email),
      role: 'Patient',
    });
    setSession(value => value + 1);
    setDemoSession(true);
    navigate('/app/home');
  };
  const logout = () => {
    setPatient({...portalSamplePatient});
    setSession(value => value + 1);
    setDemoSession(false);
    navigate('/');
  };
  const auth = ['/', '/register', '/recover-password'].includes(route);
  const view = route === '/' ? 'login' : route.split('/').filter(Boolean).pop();
  return <React.Fragment>
    <a href="#portal-main" className="portal-skip-link">Skip to content</a>
    {auth
      ? <window.HRTPortalAuth key={route} view={view} navigate={navigate} onEnterDemo={enterDemo}/>
      : <window.HRTPortalDashboard key={'patient-'+session} view={view === 'app' || view === 'dashboard' ? 'home' : view} navigate={navigate} onLogout={logout} patient={patient} onPatientChange={setPatient} isDemoSession={isDemoSession}/>}
    <PortalPreviewNote/>
  </React.Fragment>;
}

const portalMount = document.getElementById('portal-root');
if (portalMount) {
  const app = <PortalApp/>;
  if (portalMount.getAttribute('data-prerendered') === 'true') ReactDOM.hydrateRoot(portalMount, app);
  else ReactDOM.createRoot(portalMount).render(app);
}
