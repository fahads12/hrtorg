/* global React */
(() => {
  const { useState, useRef, useEffect } = React;
  const media = '/uploads/portal/';
  const logo = '/uploads/hrt-logo.webp';
  const legal = {
    terms: '/Terms%20and%20Conditions.html',
    privacy: '/legal/privacy-policy/',
    consent: '/legal/consent-to-telehealth/'
  };
  const emptyValues = () => ({ firstName: '', lastName: '', email: '', password: '', npiNumber: '', licenseNumber: '', licenseState: '', organizationName: '', phoneNumber: '', checkTick: false });
  const eyeOff = 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z';
  const eye = 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3';

  function RouteLink({ path, navigate, children, ...props }) {
    return <a {...props} href={'/portal' + (path === '/' ? '/' : path + '/')} onClick={event => {
      if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        navigate(path);
      }
    }}>{children}</a>;
  }

  function Header({ view, navigate }) {
    const [open, setOpen] = useState(false);
    const go = path => { setOpen(false); navigate(path); };
    return <header className="header-section prelogin_header">
      <nav className="navbar navbar-expand-lg navbar-light" aria-label="Portal navigation">
        <div className="container">
          <a className="logo" href="/" aria-label="HRT.org home"><img src={logo} alt="HRT.org" /></a>
          <button className="navbar-toggler" type="button" aria-controls="portal-auth-navigation" aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen(!open)}><span className="navbar-toggler-icon" /></button>
          <div className={'collapse navbar-collapse' + (open ? ' show' : '')} id="portal-auth-navigation">
            <ul className="navbar-nav mb-2 mb-lg-0">
              <li className="nav-item np-website-link"><a className="nav-link" href="/">Back to HRT.org <span aria-hidden="true">↗</span></a></li>
              <li className="nav-item"><RouteLink className={'nav-link' + (view === 'login' ? ' active' : '')} path="/" navigate={go} aria-current={view === 'login' ? 'page' : undefined}>Login</RouteLink></li>
              <li className="nav-item"><RouteLink className={'nav-link' + (view === 'register' ? ' active' : '')} path="/register" navigate={go} aria-current={view === 'register' ? 'page' : undefined}>Sign Up</RouteLink></li>
            </ul>
          </div>
        </div>
      </nav>
    </header>;
  }

  function Footer() {
    return <footer className="np-footer"><div className="np-footer-inner"><a href="/" className="np-footer-brand"><img src={logo} alt="HRT.org"/><span>Personalized care.<br/>Connected to you.</span></a><div className="np-footer-links"><a href={legal.privacy}>Privacy</a><a href={legal.terms}>Terms & conditions</a><a href="/Contact.html">Contact us</a></div><span className="np-footer-copyright">© 2026 HRT.org</span></div></footer>;
  }

  function LoginArtwork({ recovery }) {
    return <div className="left_part part col-md-6"><div className="leftpart_inner np-auth-story"><span className="np-eyebrow">YOUR HEALTH. YOUR NEXT CHAPTER.</span><h2>Your care,<br/><em>connected.</em></h2><p>Keep your results and care information together, and follow the changes you notice over time.</p><div className="np-auth-portraits"><img src="/uploads/generated/home-men-portrait.webp" alt=""/><img src="/uploads/generated/home-women-portrait.webp" alt=""/></div><div className="np-story-note"><span className="np-note-icon" aria-hidden="true">↗</span><span>Personalized hormone health.<br/><strong>Guided by science. Built around you.</strong></span></div></div></div>;
  }

  function ConsultationCard() {
    return <aside className="col-md-6 col-lg-5 np-register-aside"><span className="np-eyebrow">A MORE PERSONAL APPROACH</span><h2>A healthier chapter<br/>starts <em>with you.</em></h2><p>Take the next step in understanding your hormone health.</p><div className="np-benefits">{[['01','Your health, in one place','Keep your results and care information together.'],['02','Care that fits your life','Explore appointments and your next steps.'],['03','See the bigger picture','Track the changes you notice over time.']].map(([number,title,copy])=><div key={number}><span>{number}</span><section><h3>{title}</h3><p>{copy}</p></section></div>)}</div><div className="np-aside-note">Built around your needs.<br/><strong>At every stage of your journey.</strong></div></aside>;
  }

  function validation(values, view, role) {
    const errors = {};
    if (!values.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Please enter a valid email address.";
    if (view !== 'recover-password' && !values.password) errors.password = 'Password is required';
    if (view === 'register') {
      for (const [name, label] of [['firstName', 'First'], ['lastName', 'Last']]) {
        if (!values[name].trim()) errors[name] = label + ' name is required';
        else if (!/^[A-Za-z_ ]*$/.test(values[name])) errors[name] = 'Please enter valid ' + label + ' Name';
      }
      if (values.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(values.password)) errors.password = "Use at least 8 characters, including an uppercase letter, a lowercase letter, a number, and one of these symbols: ! @ # $ % ^ & *.";
      if (role === 'provider') {
        for (const [name, label] of [['npiNumber', 'NPI Number'], ['licenseNumber', 'License Number'], ['licenseState', 'License State'], ['organizationName', 'Organization Name'], ['phoneNumber', 'Phone Number']]) {
          if (!values[name].trim()) errors[name] = label + ' is required';
        }
        if (values.phoneNumber && !/^[+]?[1-9][\d]{0,15}$/.test(values.phoneNumber)) errors.phoneNumber = "Please enter a valid phone number.";
      }
      if (!values.checkTick) errors.checkTick = 'Please agree to the terms and conditions';
    }
    return errors;
  }

  function AuthView({ view, navigate, onEnterDemo }) {
    const [interactive, setInteractive] = useState(false);
    const [values, setValues] = useState(emptyValues);
    const [touched, setTouched] = useState({});
    const [role, setRole] = useState('patient');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState('');
    const formRef = useRef(null);
    useEffect(() => { setInteractive(true); }, []);
    const errors = validation(values, view, role);
    const recovery = view === 'recover-password';
    const register = view === 'register';
    const change = event => {
      const { name, type, checked, value } = event.target;
      setValues(previous => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
      setStatus('');
    };
    const blur = event => setTouched(previous => ({ ...previous, [event.target.name]: true }));
    const switchRole = next => {
      if (next === role) return;
      setRole(next); setValues(emptyValues()); setTouched({}); setShowPassword(false); setStatus('');
    };
    const submit = event => {
      event.preventDefault();
      setTouched(Object.fromEntries(Object.keys(values).map(name => [name, true])));
      const invalid = Object.keys(errors);
      if (invalid.length) {
        setStatus('');
        const first = Array.from(formRef.current.elements).find(control => invalid.includes(control.name));
        if (first) first.focus();
        return;
      }
      if (recovery) {
        setStatus("This is a preview of password recovery. No recovery email was sent.");
        return;
      }
      // Credentials remain only in this component's transient state. Never persist,
      // log, transmit, or pass a password into the demo profile/router.
      const profile = { role, email: values.email.trim() };
      if (register) { profile.firstName = values.firstName.trim(); profile.lastName = values.lastName.trim(); }
      setValues(previous => ({ ...previous, password: '' }));
      setShowPassword(false);
      const passwordInput = formRef.current.elements.namedItem('password');
      if (passwordInput) passwordInput.value = '';
      setStatus(register ? 'UI demo opened. No account was created.' : 'UI demo opened. No sign-in request was sent.');
      onEnterDemo(profile);
    };
    const field = (name, label, type = 'text') => {
      const error = touched[name] && errors[name];
      const id = 'portal-auth-' + name;
      const isPassword = name === 'password';
      const input = <input id={id} type={isPassword ? (showPassword ? 'text' : 'password') : type} name={name} value={values[name]} onChange={change} onBlur={blur} placeholder={'Enter ' + label} className={'form-control' + (isPassword ? (register ? ' mb-2' : '') : ' inp_text')} required disabled={!interactive} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? id + '-error' : undefined} autoComplete={isPassword ? 'new-password' : 'off'} spellCheck={false} />;
      return <div className="form_field_wrapper"><label htmlFor={id}>{label}</label>{isPassword && register ? <div className="password-input-wrapper">{input}<button className="portal-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={showPassword ? eye : eyeOff} /></svg></button></div> : input}{(!recovery || error) && <p className="error" id={id + '-error'}>{error || ''}</p>}</div>;
    };
    const stateMessage = <div className="portal-auth-status" role="status" aria-live="polite">{status && <p>{status}</p>}</div>;
    const simpleForm = <form ref={formRef} onSubmit={submit} noValidate autoComplete="off">
      <h1 className="login_title">{recovery ? 'Reset your password' : 'Welcome back'}</h1>
      {recovery && <div className="login_desc">Don't Worry! Please enter the email <br /> address associated with your account.</div>}
      {field('email', 'Email', 'email')}
      {!recovery && field('password', 'Password', 'password')}
      {!recovery && <div className="form_field_wrapper forgotpass"><RouteLink className="linkto" path="/recover-password" navigate={navigate}>Forgot Password?</RouteLink></div>}
      <button type="submit" disabled={!interactive} className={'btn btn-primary' + (recovery ? ' recoverpass' : '')}>{recovery ? 'Submit' : 'LOGIN'}</button>
      {recovery ? <div className="form_field_wrapper backtologin_block"><RouteLink className="linkto backtologin" path="/" navigate={navigate}>Already have an account? <span className="login_txt">Login</span></RouteLink></div> : <div className="form_field_wrapper signuplink_block"><RouteLink className="linkto signuplink" path="/register" navigate={navigate}>Don't have an account yet? <span className="signup_txt">SIGN UP</span></RouteLink></div>}
      {stateMessage}
    </form>;
    return <div className="portal-auth"><Header view={view} navigate={navigate} />
      {register ? <main id="portal-main" tabIndex={-1} className="main_content consultation_homepage"><div className="container"><div className="row">
        <div className="col-md-6 col-lg-7"><div className="consult_login"><div className="testimonial_inner"><form ref={formRef} onSubmit={submit} noValidate autoComplete="off">
          <h1 className="login_title">Create your account</h1>
          <div className="user_type_toggle" role="group" aria-label="Account type"><button type="button" className={'toggle_btn' + (role === 'patient' ? ' active' : '')} onClick={() => switchRole('patient')} aria-pressed={role === 'patient'}>I am a Patient</button><button type="button" className={'toggle_btn' + (role === 'provider' ? ' active' : '')} onClick={() => switchRole('provider')} aria-pressed={role === 'provider'}>I am a Provider</button></div>
          <div className="row"><div className="col-sm-6">{field('firstName', 'First Name')}</div><div className="col-sm-6">{field('lastName', 'Last Name')}</div></div>
          {field('email', 'Email', 'email')}{field('password', 'Password', 'password')}
          {role === 'provider' && <>{field('npiNumber', 'NPI Number')}<div className="row mt-4"><div className="col-sm-6">{field('licenseNumber', 'License Number')}</div><div className="col-sm-6">{field('licenseState', 'License State')}</div></div><div className="row mt-2"><div className="col-sm-6">{field('organizationName', 'Organization Name')}</div><div className="col-sm-6">{field('phoneNumber', 'Phone Number', 'tel')}</div></div></>}
          <label className="mt-3"><input type="checkbox" id="portal-auth-checkTick" name="checkTick" checked={values.checkTick} onChange={change} onBlur={blur} required disabled={!interactive} aria-invalid={touched.checkTick && errors.checkTick ? 'true' : undefined} aria-describedby={touched.checkTick && errors.checkTick ? 'portal-auth-checkTick-error' : undefined} /><span> I agree to the <a href={legal.terms}>Terms And Conditions</a>, <a href={legal.privacy}>Privacy Policy</a> and <a href={legal.consent}>Telehealth Consent</a>.</span></label>
          <p className="error" id="portal-auth-checkTick-error">{touched.checkTick && errors.checkTick ? errors.checkTick : ''}</p>
          <button type="submit" disabled={!interactive} className="btn btn-primary signup_btn">Sign Up</button>
          <div className="form_field_wrapper backtologin_block"><RouteLink className="linkto backtologin" path="/" navigate={navigate}>Already Have An Account? <span className="login_txt">Login</span></RouteLink></div>
          {stateMessage}
        </form></div></div></div><ConsultationCard />
      </div></div></main> : <main id="portal-main" tabIndex={-1} className={'login' + (recovery ? '' : ' login_acc')}><div className="login_inner"><div className="row"><LoginArtwork recovery={recovery} /><div className="right_part part col-md-6"><div className="rightpart_inner"><div className="login_form"><div className="login_form_inner">{simpleForm}</div></div></div></div></div></div></main>}
      <Footer />
    </div>;
  }

  function HRTPortalAuth(props) { return <AuthView key={props.view} {...props} />; }
  if (typeof window !== 'undefined') {
    window.HRTPortalAuth = HRTPortalAuth;
    window.HRTPortalPublicHeader = Header;
    window.HRTPortalFooter = Footer;
  }
})();
