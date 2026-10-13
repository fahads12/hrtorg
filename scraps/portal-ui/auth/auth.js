/* global React */
(() => {
  const {
    useState,
    useRef,
    useEffect
  } = React;
  const media = '/uploads/portal/';
  const logo = media + 'logo.f3d21fc3efa5e3daf8bfa2b83daad56f.svg';
  const legal = {
    terms: '/Terms%20and%20Conditions.html',
    privacy: '/legal/privacy-policy/',
    consent: '/legal/consent-to-telehealth/'
  };
  const emptyValues = () => ({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    npiNumber: '',
    licenseNumber: '',
    licenseState: '',
    organizationName: '',
    phoneNumber: '',
    checkTick: false
  });
  const eyeOff = 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z';
  const eye = 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3';
  function RouteLink({
    path,
    navigate,
    children,
    ...props
  }) {
    return /*#__PURE__*/React.createElement("a", {
      ...props,
      href: '/portal' + (path === '/' ? '/' : path + '/'),
      onClick: event => {
        if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          navigate(path);
        }
      }
    }, children);
  }
  function Header({
    view,
    navigate
  }) {
    const [open, setOpen] = useState(false);
    const go = path => {
      setOpen(false);
      navigate(path);
    };
    return /*#__PURE__*/React.createElement("header", {
      className: "header-section prelogin_header"
    }, /*#__PURE__*/React.createElement("nav", {
      className: "navbar navbar-expand-lg navbar-light",
      "aria-label": "Portal navigation"
    }, /*#__PURE__*/React.createElement("div", {
      className: "container"
    }, /*#__PURE__*/React.createElement(RouteLink, {
      className: "logo",
      path: "/",
      navigate: go,
      "aria-label": "HRT portal login"
    }, /*#__PURE__*/React.createElement("img", {
      src: logo,
      alt: "HRT.org"
    })), /*#__PURE__*/React.createElement("button", {
      className: "navbar-toggler",
      type: "button",
      "aria-controls": "portal-auth-navigation",
      "aria-expanded": open,
      "aria-label": "Toggle navigation",
      onClick: () => setOpen(!open)
    }, /*#__PURE__*/React.createElement("span", {
      className: "navbar-toggler-icon"
    })), /*#__PURE__*/React.createElement("div", {
      className: 'collapse navbar-collapse' + (open ? ' show' : ''),
      id: "portal-auth-navigation"
    }, /*#__PURE__*/React.createElement("ul", {
      className: "navbar-nav mb-2 mb-lg-0"
    }, /*#__PURE__*/React.createElement("li", {
      className: "nav-item"
    }, /*#__PURE__*/React.createElement(RouteLink, {
      className: 'nav-link' + (view === 'login' ? ' active' : ''),
      path: "/",
      navigate: go,
      "aria-current": view === 'login' ? 'page' : undefined
    }, "Login")), /*#__PURE__*/React.createElement("li", {
      className: "nav-item"
    }, /*#__PURE__*/React.createElement(RouteLink, {
      className: 'nav-link' + (view === 'register' ? ' active' : ''),
      path: "/register",
      navigate: go,
      "aria-current": view === 'register' ? 'page' : undefined
    }, "Sign Up")))))));
  }
  function Footer() {
    return /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("div", {
      className: "footer_top"
    }, /*#__PURE__*/React.createElement("div", {
      className: "container"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-md-4 footer_item footer_item1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "footer_item_inner"
    }, /*#__PURE__*/React.createElement("div", {
      className: "footer_logo"
    }, /*#__PURE__*/React.createElement("img", {
      src: logo,
      alt: "HRT.org"
    })), /*#__PURE__*/React.createElement("div", {
      className: "footer_desc"
    }, "Leading The Way In Medical Excellence, Trusted Care."))), /*#__PURE__*/React.createElement("div", {
      className: "col-md-4 footer_item footer_item2"
    }, /*#__PURE__*/React.createElement("h6", {
      className: "footer_title"
    }, "Important Links"), /*#__PURE__*/React.createElement("div", {
      className: "footer_link"
    }, /*#__PURE__*/React.createElement("a", {
      href: legal.privacy
    }, "Privacy Policy")), /*#__PURE__*/React.createElement("div", {
      className: "footer_link"
    }, /*#__PURE__*/React.createElement("a", {
      href: legal.terms
    }, "Terms And Conditions"))), /*#__PURE__*/React.createElement("div", {
      className: "col-md-4 footer_item footer_item3"
    }, /*#__PURE__*/React.createElement("h6", {
      className: "footer_title"
    }, "Contact Us"), /*#__PURE__*/React.createElement("div", {
      className: "footer_link"
    }, /*#__PURE__*/React.createElement("label", null, "Call:"), /*#__PURE__*/React.createElement("a", {
      href: "tel:8885745524"
    }, "(888) 574-5524")), /*#__PURE__*/React.createElement("div", {
      className: "footer_link"
    }, /*#__PURE__*/React.createElement("label", null, "Email:"), /*#__PURE__*/React.createElement("a", {
      href: "mailto:support@hrt.org"
    }, "support@hrt.org")))))), /*#__PURE__*/React.createElement("div", {
      className: "footer_bottom"
    }, /*#__PURE__*/React.createElement("div", {
      className: "container"
    }, /*#__PURE__*/React.createElement("small", {
      className: "copyright mt-4"
    }, "Copyright © 2023 HRT. All Right Reserved."))));
  }
  function LoginArtwork({
    recovery
  }) {
    const services = ['serviceimg5.4b890507155c0dc25ff8b0a83ae05ff7.svg', 'serviceimg6.0378cdb898fd0816faa77a732a6769c9.svg', 'serviceimg7.cff0c51fde013b9ab60c6663a591a27f.svg', 'serviceimg8.73c0d303a28cb7fafc4def3b98e5095e.svg', 'serviceimg9.028dfd6615b8cfb893ab9164a0abe1d8.svg', 'serviceimg10.3909ae623f2ef85778d87b0eaf4eb317.svg'];
    return /*#__PURE__*/React.createElement("div", {
      className: "left_part part col-md-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "leftpart_inner"
    }, recovery ? /*#__PURE__*/React.createElement("div", {
      className: "logo"
    }, /*#__PURE__*/React.createElement("img", {
      src: media + 'logo_login.6449bda0a4cfb937fa12.png',
      alt: "HRT.org"
    })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "top_part part"
    }, /*#__PURE__*/React.createElement("h3", null, "Welcome BACK to hrt"), /*#__PURE__*/React.createElement("h1", null, "Your Path to Optimal Health")), /*#__PURE__*/React.createElement("div", {
      className: "middle_part part"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "service_title"
    }, "Make your healthcare process simpler with"), /*#__PURE__*/React.createElement("div", {
      className: "item_wrapper"
    }, services.map(src => /*#__PURE__*/React.createElement("div", {
      className: "item",
      key: src
    }, /*#__PURE__*/React.createElement("div", {
      className: "service_img"
    }, /*#__PURE__*/React.createElement("img", {
      src: media + src,
      alt: ""
    })))))))));
  }
  function ConsultationCard() {
    const items = [['consultimg1.3b338318f9f10f5b86fee5e1dd31e713.svg', 'Care', 'Ongoing support from our care team'], ['consultimg2.9a368a61fe0e5d2b11ab5a2836f248a0.svg', 'Free Shipping', 'Delivered to your doorstep'], ['consultimg3.38d1d76daa95835c18298452d88c8d06.svg', 'Medical Evaluation', 'Medical assesments and prescriptions provided by licensed prescriber in the U.S.']];
    return /*#__PURE__*/React.createElement("div", {
      className: "col-md-6 col-lg-5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "testimonial"
    }, /*#__PURE__*/React.createElement("div", {
      className: "testimonial_inner"
    }, /*#__PURE__*/React.createElement("div", {
      className: "consultation_block"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "main_title"
    }, "Start Your Free Consultation With Our Platform"), /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, items.map(([src, title, description]) => /*#__PURE__*/React.createElement("div", {
      className: "col-12 consult_item",
      key: title
    }, /*#__PURE__*/React.createElement("div", {
      className: "consult_item_inner"
    }, /*#__PURE__*/React.createElement("img", {
      src: media + src,
      alt: ""
    }), /*#__PURE__*/React.createElement("div", {
      className: "consult_desc"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "title"
    }, title), /*#__PURE__*/React.createElement("div", {
      className: "desc"
    }, description))))))))));
  }
  function validation(values, view, role) {
    const errors = {};
    if (!values.email.trim()) errors.email = 'Email is required';else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Please enter valid Email';
    if (view !== 'recover-password' && !values.password) errors.password = 'Password is required';
    if (view === 'register') {
      for (const [name, label] of [['firstName', 'First'], ['lastName', 'Last']]) {
        if (!values[name].trim()) errors[name] = label + ' name is required';else if (!/^[A-Za-z_ ]*$/.test(values[name])) errors[name] = 'Please enter valid ' + label + ' Name';
      }
      if (values.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(values.password)) errors.password = 'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character';
      if (role === 'provider') {
        for (const [name, label] of [['npiNumber', 'NPI Number'], ['licenseNumber', 'License Number'], ['licenseState', 'License State'], ['organizationName', 'Organization Name'], ['phoneNumber', 'Phone Number']]) {
          if (!values[name].trim()) errors[name] = label + ' is required';
        }
        if (values.phoneNumber && !/^[+]?[1-9][\d]{0,15}$/.test(values.phoneNumber)) errors.phoneNumber = 'Please enter valid phone number';
      }
      if (!values.checkTick) errors.checkTick = 'Please agree to the terms and conditions';
    }
    return errors;
  }
  function AuthView({
    view,
    navigate,
    onEnterDemo
  }) {
    const [interactive, setInteractive] = useState(false);
    const [values, setValues] = useState(emptyValues);
    const [touched, setTouched] = useState({});
    const [role, setRole] = useState('patient');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState('');
    const formRef = useRef(null);
    useEffect(() => {
      setInteractive(true);
    }, []);
    const errors = validation(values, view, role);
    const recovery = view === 'recover-password';
    const register = view === 'register';
    const change = event => {
      const {
        name,
        type,
        checked,
        value
      } = event.target;
      setValues(previous => ({
        ...previous,
        [name]: type === 'checkbox' ? checked : value
      }));
      setStatus('');
    };
    const blur = event => setTouched(previous => ({
      ...previous,
      [event.target.name]: true
    }));
    const switchRole = next => {
      if (next === role) return;
      setRole(next);
      setValues(emptyValues());
      setTouched({});
      setShowPassword(false);
      setStatus('');
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
        setStatus('Demo only: no recovery email was sent. This screen previews the password recovery flow.');
        return;
      }
      // Credentials remain only in this component's transient state. Never persist,
      // log, transmit, or pass a password into the demo profile/router.
      const profile = {
        role,
        email: values.email.trim()
      };
      if (register) {
        profile.firstName = values.firstName.trim();
        profile.lastName = values.lastName.trim();
      }
      setValues(previous => ({
        ...previous,
        password: ''
      }));
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
      const input = /*#__PURE__*/React.createElement("input", {
        id: id,
        type: isPassword ? showPassword ? 'text' : 'password' : type,
        name: name,
        value: values[name],
        onChange: change,
        onBlur: blur,
        placeholder: 'Enter ' + label,
        className: 'form-control' + (isPassword ? register ? ' mb-2' : '' : ' inp_text'),
        required: true,
        disabled: !interactive,
        "aria-invalid": error ? 'true' : undefined,
        "aria-describedby": error ? id + '-error' : undefined,
        autoComplete: isPassword ? 'new-password' : 'off',
        spellCheck: false
      });
      return /*#__PURE__*/React.createElement("div", {
        className: "form_field_wrapper"
      }, /*#__PURE__*/React.createElement("label", {
        htmlFor: id
      }, label), isPassword && register ? /*#__PURE__*/React.createElement("div", {
        className: "password-input-wrapper"
      }, input, /*#__PURE__*/React.createElement("button", {
        className: "portal-password-toggle",
        type: "button",
        onClick: () => setShowPassword(!showPassword),
        "aria-label": showPassword ? 'Hide password' : 'Show password',
        "aria-pressed": showPassword
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: showPassword ? eye : eyeOff
      })))) : input, (!recovery || error) && /*#__PURE__*/React.createElement("p", {
        className: "error",
        id: id + '-error'
      }, error || ''));
    };
    const stateMessage = /*#__PURE__*/React.createElement("div", {
      className: "portal-auth-status",
      role: "status",
      "aria-live": "polite"
    }, status && /*#__PURE__*/React.createElement("p", null, status));
    const simpleForm = /*#__PURE__*/React.createElement("form", {
      ref: formRef,
      onSubmit: submit,
      noValidate: true,
      autoComplete: "off"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "login_title"
    }, recovery ? 'Forgot Password?' : 'Login Your Account'), recovery && /*#__PURE__*/React.createElement("div", {
      className: "login_desc"
    }, "Don't Worry! Please enter the email ", /*#__PURE__*/React.createElement("br", null), " address associated with your account."), field('email', 'Email', 'email'), !recovery && field('password', 'Password', 'password'), !recovery && /*#__PURE__*/React.createElement("div", {
      className: "form_field_wrapper forgotpass"
    }, /*#__PURE__*/React.createElement(RouteLink, {
      className: "linkto",
      path: "/recover-password",
      navigate: navigate
    }, "Forgot Password?")), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      disabled: !interactive,
      className: 'btn btn-primary' + (recovery ? ' recoverpass' : '')
    }, recovery ? 'Submit' : 'LOGIN'), recovery ? /*#__PURE__*/React.createElement("div", {
      className: "form_field_wrapper backtologin_block"
    }, /*#__PURE__*/React.createElement(RouteLink, {
      className: "linkto backtologin",
      path: "/",
      navigate: navigate
    }, "Already have an account? ", /*#__PURE__*/React.createElement("span", {
      className: "login_txt"
    }, "Login"))) : /*#__PURE__*/React.createElement("div", {
      className: "form_field_wrapper signuplink_block"
    }, /*#__PURE__*/React.createElement(RouteLink, {
      className: "linkto signuplink",
      path: "/register",
      navigate: navigate
    }, "Don't have an account yet? ", /*#__PURE__*/React.createElement("span", {
      className: "signup_txt"
    }, "SIGN UP"))), stateMessage);
    return /*#__PURE__*/React.createElement("div", {
      className: "portal-auth"
    }, /*#__PURE__*/React.createElement(Header, {
      view: view,
      navigate: navigate
    }), register ? /*#__PURE__*/React.createElement("main", {
      id: "portal-main",
      className: "main_content consultation_homepage"
    }, /*#__PURE__*/React.createElement("div", {
      className: "container"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-md-6 col-lg-7"
    }, /*#__PURE__*/React.createElement("div", {
      className: "consult_login"
    }, /*#__PURE__*/React.createElement("div", {
      className: "testimonial_inner"
    }, /*#__PURE__*/React.createElement("form", {
      ref: formRef,
      onSubmit: submit,
      noValidate: true,
      autoComplete: "off"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "login_title"
    }, "Create An Account"), /*#__PURE__*/React.createElement("div", {
      className: "user_type_toggle",
      role: "group",
      "aria-label": "Account type"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: 'toggle_btn' + (role === 'patient' ? ' active' : ''),
      onClick: () => switchRole('patient'),
      "aria-pressed": role === 'patient'
    }, "I am a Patient"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: 'toggle_btn' + (role === 'provider' ? ' active' : ''),
      onClick: () => switchRole('provider'),
      "aria-pressed": role === 'provider'
    }, "I am a Provider")), /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-sm-6"
    }, field('firstName', 'First Name')), /*#__PURE__*/React.createElement("div", {
      className: "col-sm-6"
    }, field('lastName', 'Last Name'))), field('email', 'Email', 'email'), field('password', 'Password', 'password'), role === 'provider' && /*#__PURE__*/React.createElement(React.Fragment, null, field('npiNumber', 'NPI Number'), /*#__PURE__*/React.createElement("div", {
      className: "row mt-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-sm-6"
    }, field('licenseNumber', 'License Number')), /*#__PURE__*/React.createElement("div", {
      className: "col-sm-6"
    }, field('licenseState', 'License State'))), /*#__PURE__*/React.createElement("div", {
      className: "row mt-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-sm-6"
    }, field('organizationName', 'Organization Name')), /*#__PURE__*/React.createElement("div", {
      className: "col-sm-6"
    }, field('phoneNumber', 'Phone Number', 'tel')))), /*#__PURE__*/React.createElement("label", {
      className: "mt-3"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      id: "portal-auth-checkTick",
      name: "checkTick",
      checked: values.checkTick,
      onChange: change,
      onBlur: blur,
      required: true,
      disabled: !interactive,
      "aria-invalid": touched.checkTick && errors.checkTick ? 'true' : undefined,
      "aria-describedby": touched.checkTick && errors.checkTick ? 'portal-auth-checkTick-error' : undefined
    }), /*#__PURE__*/React.createElement("span", null, " I agree to the ", /*#__PURE__*/React.createElement("a", {
      href: legal.terms
    }, "Terms And Conditions"), ", ", /*#__PURE__*/React.createElement("a", {
      href: legal.privacy
    }, "Privacy Policy"), " and ", /*#__PURE__*/React.createElement("a", {
      href: legal.consent
    }, "Telehealth Consent"), ".")), /*#__PURE__*/React.createElement("p", {
      className: "error",
      id: "portal-auth-checkTick-error"
    }, touched.checkTick && errors.checkTick ? errors.checkTick : ''), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      disabled: !interactive,
      className: "btn btn-primary signup_btn"
    }, "Sign Up"), /*#__PURE__*/React.createElement("div", {
      className: "form_field_wrapper backtologin_block"
    }, /*#__PURE__*/React.createElement(RouteLink, {
      className: "linkto backtologin",
      path: "/",
      navigate: navigate
    }, "Already Have An Account? ", /*#__PURE__*/React.createElement("span", {
      className: "login_txt"
    }, "Login"))), stateMessage)))), /*#__PURE__*/React.createElement(ConsultationCard, null)))) : /*#__PURE__*/React.createElement("main", {
      id: "portal-main",
      className: 'login' + (recovery ? '' : ' login_acc')
    }, /*#__PURE__*/React.createElement("div", {
      className: "login_inner"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement(LoginArtwork, {
      recovery: recovery
    }), /*#__PURE__*/React.createElement("div", {
      className: "right_part part col-md-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "rightpart_inner"
    }, /*#__PURE__*/React.createElement("div", {
      className: "login_form"
    }, /*#__PURE__*/React.createElement("div", {
      className: "login_form_inner"
    }, simpleForm))))))), /*#__PURE__*/React.createElement(Footer, null));
  }
  function HRTPortalAuth(props) {
    return /*#__PURE__*/React.createElement(AuthView, {
      key: props.view,
      ...props
    });
  }
  if (typeof window !== 'undefined') window.HRTPortalAuth = HRTPortalAuth;
})();