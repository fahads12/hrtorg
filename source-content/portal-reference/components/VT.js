VT = function () {
  var e, a, n, t, o, i, l, s, u, d, c, A, S, h, C, m, R, f, g, p, M, y, P, B, b, E, N, T, v, U, I, L, k, O, G, D, H, F, w, V;
  const [K, X] = (0, r.useState)("password"),
    [W, x] = (0, r.useState)("patient"),
    {
      alertSuccess: z,
      alertError: j
    } = Uu(),
    J = be(),
    Z = Pe(),
    _ = new URLSearchParams(Z.search),
    Y = _.get("procedure"),
    Q = _.get("productId");
  (0, r.useEffect)(() => {
    Y && Q && (localStorage.setItem("procedure", Y), localStorage.setItem("productId", Q));
    const e = localStorage.getItem("token");
    let a = localStorage.getItem("uR");
    e && a && Y && Q ? (a = $o(a), "patient" === a && J("/app/medical-history")) : Z.pathname && Z.search && localStorage.setItem("productURL", Z.pathname + Z.search);
  }, [Y, Q, J]);
  const q = e => {
      x(e), "patient" === e ? $.resetForm() : ee.resetForm();
    },
    $ = ko({
      initialValues: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        checkTick: null
      },
      validationSchema: Al,
      onSubmit: async e => {
        try {
          const a = qo(e);
          if (a.role = 2, a.agreeTerms = null !== e && void 0 !== e && e.checkTick ? 1 : 0, delete a.checkTick, a) {
            const e = await pu("/api/users/signup", a);
            null !== e && void 0 !== e && e.success ? (yT(), z("A verification email has been sent to your registered email"), J("/")) : j(null === e || void 0 === e ? void 0 : e.message);
          }
        } catch (a) {
          j("An error occurred during signup. Please try again.");
        }
      }
    }),
    ee = ko({
      initialValues: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        checkTick: null,
        npiNumber: "",
        licenseNumber: "",
        licenseState: "",
        organizationName: "",
        phoneNumber: ""
      },
      validationSchema: Sl,
      onSubmit: async e => {
        try {
          const a = qo(e);
          if (a.role = 1, a.agreeTerms = !(null === e || void 0 === e || !e.checkTick), delete a.checkTick, a) {
            const e = await pu("/api/users/register-provider", a);
            null !== e && void 0 !== e && e.success ? (yT(), z("A verification email has been sent to your registered email"), J("/")) : j(null === e || void 0 === e ? void 0 : e.message);
          }
        } catch (a) {
          j("An error occurred during signup. Please try again.");
        }
      }
    }),
    ae = "patient" === W ? $ : ee;
  return (0, sa.jsxs)(sa.Fragment, {
    children: [(0, sa.jsx)(ca, {}), (0, sa.jsx)("div", {
      className: "main_content consultation_homepage",
      children: (0, sa.jsx)("div", {
        className: "container",
        children: (0, sa.jsxs)("div", {
          className: "row",
          children: [(0, sa.jsx)("div", {
            className: "col-md-6 col-lg-7",
            children: (0, sa.jsx)("div", {
              className: "consult_login",
              children: (0, sa.jsx)("div", {
                className: "testimonial_inner",
                children: (0, sa.jsxs)("form", {
                  noValidate: !0,
                  onSubmit: null === ae || void 0 === ae ? void 0 : ae.handleSubmit,
                  children: [(0, sa.jsx)("h1", {
                    className: "login_title",
                    children: "Create An Account"
                  }), (0, sa.jsxs)("div", {
                    className: "user_type_toggle",
                    children: [(0, sa.jsx)("button", {
                      type: "button",
                      className: "toggle_btn ".concat("patient" === W ? "active" : ""),
                      onClick: () => q("patient"),
                      children: "I am a Patient"
                    }), (0, sa.jsx)("button", {
                      type: "button",
                      className: "toggle_btn ".concat("provider" === W ? "active" : ""),
                      onClick: () => q("provider"),
                      children: "I am a Provider"
                    })]
                  }), (0, sa.jsxs)("div", {
                    className: "row",
                    children: [(0, sa.jsx)("div", {
                      className: "col-sm-6",
                      children: (0, sa.jsxs)("div", {
                        className: "form_field_wrapper",
                        children: [(0, sa.jsx)("label", {
                          children: "First Name"
                        }), (0, sa.jsx)("input", {
                          type: "text",
                          name: "firstName",
                          onChange: null === ae || void 0 === ae ? void 0 : ae.handleChange,
                          onBlur: null === ae || void 0 === ae ? void 0 : ae.handleBlur,
                          value: null === ae || void 0 === ae || null === (e = ae.values) || void 0 === e ? void 0 : e.firstName,
                          placeholder: "Enter First Name",
                          className: "form-control inp_text",
                          id: "firstName"
                        }), (0, sa.jsx)("p", {
                          className: "error",
                          children: (null === ae || void 0 === ae || null === (a = ae.errors) || void 0 === a ? void 0 : a.firstName) && (null === ae || void 0 === ae || null === (n = ae.touched) || void 0 === n ? void 0 : n.firstName) && (null === ae || void 0 === ae || null === (t = ae.errors) || void 0 === t ? void 0 : t.firstName)
                        })]
                      })
                    }), (0, sa.jsx)("div", {
                      className: "col-sm-6",
                      children: (0, sa.jsxs)("div", {
                        className: "form_field_wrapper",
                        children: [(0, sa.jsx)("label", {
                          children: "Last Name"
                        }), (0, sa.jsx)("input", {
                          type: "text",
                          name: "lastName",
                          onChange: null === ae || void 0 === ae ? void 0 : ae.handleChange,
                          onBlur: null === ae || void 0 === ae ? void 0 : ae.handleBlur,
                          value: null === ae || void 0 === ae || null === (o = ae.values) || void 0 === o ? void 0 : o.lastName,
                          placeholder: "Enter Last Name",
                          className: "form-control inp_text",
                          id: "lastName"
                        }), (0, sa.jsx)("p", {
                          className: "error",
                          children: (null === ae || void 0 === ae || null === (i = ae.errors) || void 0 === i ? void 0 : i.lastName) && (null === ae || void 0 === ae || null === (l = ae.touched) || void 0 === l ? void 0 : l.lastName) && (null === ae || void 0 === ae || null === (s = ae.errors) || void 0 === s ? void 0 : s.lastName)
                        })]
                      })
                    })]
                  }), (0, sa.jsxs)("div", {
                    className: "form_field_wrapper",
                    children: [(0, sa.jsx)("label", {
                      children: "Email"
                    }), (0, sa.jsx)("input", {
                      type: "email",
                      name: "email",
                      onChange: null === ae || void 0 === ae ? void 0 : ae.handleChange,
                      onBlur: null === ae || void 0 === ae ? void 0 : ae.handleBlur,
                      value: null === ae || void 0 === ae || null === (u = ae.values) || void 0 === u ? void 0 : u.email,
                      placeholder: "Enter Email",
                      className: "form-control inp_text",
                      id: "email"
                    }), (0, sa.jsx)("p", {
                      className: "error",
                      children: (null === ae || void 0 === ae || null === (d = ae.errors) || void 0 === d ? void 0 : d.email) && (null === ae || void 0 === ae || null === (c = ae.touched) || void 0 === c ? void 0 : c.email) && (null === ae || void 0 === ae || null === (A = ae.errors) || void 0 === A ? void 0 : A.email)
                    })]
                  }), (0, sa.jsxs)("div", {
                    className: "form_field_wrapper",
                    children: [(0, sa.jsx)("label", {
                      children: "Password"
                    }), (0, sa.jsxs)("div", {
                      className: "password-input-wrapper",
                      children: [(0, sa.jsx)("input", {
                        type: K,
                        name: "password",
                        onChange: null === ae || void 0 === ae ? void 0 : ae.handleChange,
                        onBlur: null === ae || void 0 === ae ? void 0 : ae.handleBlur,
                        value: null === ae || void 0 === ae || null === (S = ae.values) || void 0 === S ? void 0 : S.password,
                        placeholder: "Enter Password",
                        className: "form-control mb-2"
                      }), "text" === K ? (0, sa.jsx)(FT.A, {
                        onClick: () => {
                          X("password");
                        }
                      }) : (0, sa.jsx)(wT.A, {
                        onClick: () => {
                          X("text");
                        }
                      })]
                    }), (0, sa.jsx)("p", {
                      className: "error",
                      children: (null === ae || void 0 === ae || null === (h = ae.errors) || void 0 === h ? void 0 : h.password) && (null === ae || void 0 === ae || null === (C = ae.touched) || void 0 === C ? void 0 : C.password) && (null === ae || void 0 === ae || null === (m = ae.errors) || void 0 === m ? void 0 : m.password)
                    })]
                  }), "provider" === W && (0, sa.jsxs)(sa.Fragment, {
                    children: [(0, sa.jsxs)("div", {
                      className: "form_field_wrapper",
                      children: [(0, sa.jsx)("label", {
                        children: "NPI Number"
                      }), (0, sa.jsx)("input", {
                        type: "text",
                        name: "npiNumber",
                        onChange: null === ae || void 0 === ae ? void 0 : ae.handleChange,
                        onBlur: null === ae || void 0 === ae ? void 0 : ae.handleBlur,
                        value: null === ae || void 0 === ae || null === (R = ae.values) || void 0 === R ? void 0 : R.npiNumber,
                        placeholder: "Enter NPI Number",
                        className: "form-control inp_text",
                        id: "npiNumber"
                      }), (0, sa.jsx)("p", {
                        className: "error",
                        children: (null === ae || void 0 === ae || null === (f = ae.errors) || void 0 === f ? void 0 : f.npiNumber) && (null === ae || void 0 === ae || null === (g = ae.touched) || void 0 === g ? void 0 : g.npiNumber) && (null === ae || void 0 === ae || null === (p = ae.errors) || void 0 === p ? void 0 : p.npiNumber)
                      })]
                    }), (0, sa.jsxs)("div", {
                      className: "row mt-4",
                      children: [(0, sa.jsx)("div", {
                        className: "col-sm-6",
                        children: (0, sa.jsxs)("div", {
                          className: "form_field_wrapper",
                          children: [(0, sa.jsx)("label", {
                            children: "License Number"
                          }), (0, sa.jsx)("input", {
                            type: "text",
                            name: "licenseNumber",
                            onChange: null === ae || void 0 === ae ? void 0 : ae.handleChange,
                            onBlur: null === ae || void 0 === ae ? void 0 : ae.handleBlur,
                            value: null === ae || void 0 === ae || null === (M = ae.values) || void 0 === M ? void 0 : M.licenseNumber,
                            placeholder: "Enter License Number",
                            className: "form-control inp_text",
                            id: "licenseNumber"
                          }), (0, sa.jsx)("p", {
                            className: "error",
                            children: (null === ae || void 0 === ae || null === (y = ae.errors) || void 0 === y ? void 0 : y.licenseNumber) && (null === ae || void 0 === ae || null === (P = ae.touched) || void 0 === P ? void 0 : P.licenseNumber) && (null === ae || void 0 === ae || null === (B = ae.errors) || void 0 === B ? void 0 : B.licenseNumber)
                          })]
                        })
                      }), (0, sa.jsx)("div", {
                        className: "col-sm-6",
                        children: (0, sa.jsxs)("div", {
                          className: "form_field_wrapper",
                          children: [(0, sa.jsx)("label", {
                            children: "License State"
                          }), (0, sa.jsx)("input", {
                            type: "text",
                            name: "licenseState",
                            onChange: null === ae || void 0 === ae ? void 0 : ae.handleChange,
                            onBlur: null === ae || void 0 === ae ? void 0 : ae.handleBlur,
                            value: null === ae || void 0 === ae || null === (b = ae.values) || void 0 === b ? void 0 : b.licenseState,
                            placeholder: "Enter License State",
                            className: "form-control inp_text",
                            id: "licenseState"
                          }), (0, sa.jsx)("p", {
                            className: "error",
                            children: (null === ae || void 0 === ae || null === (E = ae.errors) || void 0 === E ? void 0 : E.licenseState) && (null === ae || void 0 === ae || null === (N = ae.touched) || void 0 === N ? void 0 : N.licenseState) && (null === ae || void 0 === ae || null === (T = ae.errors) || void 0 === T ? void 0 : T.licenseState)
                          })]
                        })
                      })]
                    }), (0, sa.jsxs)("div", {
                      className: "row mt-2",
                      children: [(0, sa.jsx)("div", {
                        className: "col-sm-6",
                        children: (0, sa.jsxs)("div", {
                          className: "form_field_wrapper",
                          children: [(0, sa.jsx)("label", {
                            children: "Organization Name"
                          }), (0, sa.jsx)("input", {
                            type: "text",
                            name: "organizationName",
                            onChange: null === ae || void 0 === ae ? void 0 : ae.handleChange,
                            onBlur: null === ae || void 0 === ae ? void 0 : ae.handleBlur,
                            value: null === ae || void 0 === ae || null === (v = ae.values) || void 0 === v ? void 0 : v.organizationName,
                            placeholder: "Enter Organization Name",
                            className: "form-control inp_text",
                            id: "organizationName"
                          }), (0, sa.jsx)("p", {
                            className: "error",
                            children: (null === ae || void 0 === ae || null === (U = ae.errors) || void 0 === U ? void 0 : U.organizationName) && (null === ae || void 0 === ae || null === (I = ae.touched) || void 0 === I ? void 0 : I.organizationName) && (null === ae || void 0 === ae || null === (L = ae.errors) || void 0 === L ? void 0 : L.organizationName)
                          })]
                        })
                      }), (0, sa.jsx)("div", {
                        className: "col-sm-6",
                        children: (0, sa.jsxs)("div", {
                          className: "form_field_wrapper",
                          children: [(0, sa.jsx)("label", {
                            children: "Phone Number"
                          }), (0, sa.jsx)("input", {
                            type: "tel",
                            name: "phoneNumber",
                            onChange: null === ae || void 0 === ae ? void 0 : ae.handleChange,
                            onBlur: null === ae || void 0 === ae ? void 0 : ae.handleBlur,
                            value: null === ae || void 0 === ae || null === (k = ae.values) || void 0 === k ? void 0 : k.phoneNumber,
                            placeholder: "Enter Phone Number",
                            className: "form-control inp_text",
                            id: "phoneNumber"
                          }), (0, sa.jsx)("p", {
                            className: "error",
                            children: (null === ae || void 0 === ae || null === (O = ae.errors) || void 0 === O ? void 0 : O.phoneNumber) && (null === ae || void 0 === ae || null === (G = ae.touched) || void 0 === G ? void 0 : G.phoneNumber) && (null === ae || void 0 === ae || null === (D = ae.errors) || void 0 === D ? void 0 : D.phoneNumber)
                          })]
                        })
                      })]
                    })]
                  }), (0, sa.jsxs)("label", {
                    className: "mt-3",
                    children: [(0, sa.jsx)("input", {
                      type: "checkbox",
                      onChange: null === ae || void 0 === ae ? void 0 : ae.handleChange,
                      onBlur: null === ae || void 0 === ae ? void 0 : ae.handleBlur,
                      value: null === ae || void 0 === ae || null === (H = ae.values) || void 0 === H ? void 0 : H.checkTick,
                      id: "checkTick",
                      name: "checkTick"
                    }), (0, sa.jsxs)("span", {
                      children: [" ", "I agree to the", " ", (0, sa.jsx)(ra, {
                        to: "/terms-and-conditions",
                        children: "Terms And Conditions"
                      }), ", ", (0, sa.jsx)(ra, {
                        to: "/privacy-policy",
                        children: "Privacy Policy"
                      }), " and", " ", (0, sa.jsx)(ra, {
                        to: "/consent",
                        children: "Telehealth Consent"
                      }), "."]
                    })]
                  }), (0, sa.jsx)("p", {
                    className: "error",
                    children: (null === ae || void 0 === ae || null === (F = ae.errors) || void 0 === F ? void 0 : F.checkTick) && (null === ae || void 0 === ae || null === (w = ae.touched) || void 0 === w ? void 0 : w.checkTick) && (null === ae || void 0 === ae || null === (V = ae.errors) || void 0 === V ? void 0 : V.checkTick)
                  }), (0, sa.jsx)("button", {
                    type: "submit",
                    className: "btn btn-primary signup_btn",
                    children: "Sign Up"
                  }), (0, sa.jsx)("div", {
                    className: "form_field_wrapper backtologin_block",
                    children: (0, sa.jsxs)(ra, {
                      className: "linkto backtologin",
                      to: "/",
                      children: ["Already Have An Account?", " ", (0, sa.jsx)("span", {
                        className: "login_txt",
                        children: "Login"
                      })]
                    })
                  })]
                })
              })
            })
          }), (0, sa.jsx)("div", {
            className: "col-md-6 col-lg-5",
            children: (0, sa.jsx)("div", {
              className: "testimonial",
              children: (0, sa.jsx)("div", {
                className: "testimonial_inner",
                children: (0, sa.jsxs)("div", {
                  className: "consultation_block",
                  children: [(0, sa.jsx)("h2", {
                    className: "main_title",
                    children: "Start Your Free Consultation With Our Platform"
                  }), (0, sa.jsxs)("div", {
                    className: "row",
                    children: [(0, sa.jsx)("div", {
                      className: "col-12  consult_item",
                      children: (0, sa.jsxs)("div", {
                        className: "consult_item_inner",
                        children: [(0, sa.jsx)("img", {
                          src: GT,
                          alt: "Consult Image1"
                        }), (0, sa.jsxs)("div", {
                          className: "consult_desc",
                          children: [(0, sa.jsx)("h3", {
                            className: "title",
                            children: "Care"
                          }), (0, sa.jsx)("div", {
                            className: "desc",
                            children: "Ongoing support from our care team"
                          })]
                        })]
                      })
                    }), (0, sa.jsx)("div", {
                      className: "col-12  consult_item",
                      children: (0, sa.jsxs)("div", {
                        className: "consult_item_inner",
                        children: [(0, sa.jsx)("img", {
                          src: DT,
                          alt: "Consult Image2"
                        }), (0, sa.jsxs)("div", {
                          className: "consult_desc",
                          children: [(0, sa.jsx)("h3", {
                            className: "title",
                            children: "Free Shipping"
                          }), (0, sa.jsx)("div", {
                            className: "desc",
                            children: "Delivered to your doorstep"
                          })]
                        })]
                      })
                    }), (0, sa.jsx)("div", {
                      className: "col-12 consult_item",
                      children: (0, sa.jsxs)("div", {
                        className: "consult_item_inner",
                        children: [(0, sa.jsx)("img", {
                          src: HT,
                          alt: "Consult Image3"
                        }), (0, sa.jsxs)("div", {
                          className: "consult_desc",
                          children: [(0, sa.jsx)("h3", {
                            className: "title",
                            children: "Medical Evaluation"
                          }), (0, sa.jsx)("div", {
                            className: "desc",
                            children: "Medical assesments and prescriptions provided by licensed prescriber in the U.S."
                          })]
                        })]
                      })
                    })]
                  })]
                })
              })
            })
          })]
        })
      })
    }), (0, sa.jsx)(Aa, {})]
  });
}