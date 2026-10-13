function IT() {
  const {
      alertSuccess: e,
      alertError: a
    } = Uu(),
    n = be(),
    t = Pe(),
    o = new URLSearchParams(t.search).get("redirect");
  (0, r.useEffect)(() => {
    const e = localStorage.getItem("token");
    o && (e ? n(o) : localStorage.setItem("orderKitRoute", o));
  }, [o]);
  const i = ko({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: hl,
    onSubmit: async r => {
      try {
        const d = qo(r);
        if (d) {
          const r = await pu("/api/users/signin", d);
          if (null !== r && void 0 !== r && r.success) {
            var t, o, i, l;
            localStorage.setItem("uFN", null === r || void 0 === r || null === (t = r.data) || void 0 === t ? void 0 : t.firstName), localStorage.setItem("uLN", null === r || void 0 === r || null === (o = r.data) || void 0 === o ? void 0 : o.lastName), localStorage.setItem("uR", null === r || void 0 === r || null === (i = r.data) || void 0 === i ? void 0 : i.role), localStorage.setItem("token", null === r || void 0 === r || null === (l = r.data) || void 0 === l ? void 0 : l.token), e(null === r || void 0 === r ? void 0 : r.message);
            const a = localStorage.getItem("productURL"),
              d = localStorage.getItem("orderKitRoute"),
              c = localStorage.getItem("symptoms_score");
            if (a) n(a), localStorage.removeItem("productURL");else if (d) n(d), localStorage.removeItem("orderKitRoute");else {
              var s, u;
              if (!c) return "admin" === $o(null === r || void 0 === r || null === (s = r.data) || void 0 === s ? void 0 : s.role) || "super-admin" === $o(null === r || void 0 === r || null === (u = r.data) || void 0 === u ? void 0 : u.role) ? n("/app/dashboard") : n("/app/home");
              n("/app/symptoms-tracker");
            }
          } else a(null === r || void 0 === r ? void 0 : r.message);
        }
      } catch (d) {
        a("An error occurred during login. Please try again.");
      }
    }
  });
  return (0, sa.jsxs)(sa.Fragment, {
    children: [(0, sa.jsx)(ca, {}), (0, sa.jsx)("div", {
      className: "login login_acc",
      children: (0, sa.jsx)("div", {
        className: "login_inner",
        children: (0, sa.jsxs)("div", {
          className: "row",
          children: [(0, sa.jsx)("div", {
            className: "left_part part col-md-6",
            children: (0, sa.jsxs)("div", {
              className: "leftpart_inner",
              children: [(0, sa.jsxs)("div", {
                className: "top_part part",
                children: [(0, sa.jsx)("h3", {
                  children: "Welcome BACK to hrt"
                }), (0, sa.jsx)("h1", {
                  children: "Your Path to Optimal Health"
                })]
              }), (0, sa.jsxs)("div", {
                className: "middle_part part",
                children: [(0, sa.jsx)("h3", {
                  className: "service_title",
                  children: "Make your healthcare process simpler with"
                }), (0, sa.jsxs)("div", {
                  className: "item_wrapper",
                  children: [(0, sa.jsx)("div", {
                    className: "item",
                    children: (0, sa.jsx)("div", {
                      className: "service_img",
                      children: (0, sa.jsx)("img", {
                        src: bT,
                        alt: "service 5"
                      })
                    })
                  }), (0, sa.jsx)("div", {
                    className: "item",
                    children: (0, sa.jsx)("div", {
                      className: "service_img",
                      children: (0, sa.jsx)("img", {
                        src: ET,
                        alt: "service 6"
                      })
                    })
                  }), (0, sa.jsx)("div", {
                    className: "item",
                    children: (0, sa.jsx)("div", {
                      className: "service_img",
                      children: (0, sa.jsx)("img", {
                        src: NT,
                        alt: "service 7"
                      })
                    })
                  }), (0, sa.jsx)("div", {
                    className: "item",
                    children: (0, sa.jsx)("div", {
                      className: "service_img",
                      children: (0, sa.jsx)("img", {
                        src: TT,
                        alt: "service 8"
                      })
                    })
                  }), (0, sa.jsx)("div", {
                    className: "item",
                    children: (0, sa.jsx)("div", {
                      className: "service_img",
                      children: (0, sa.jsx)("img", {
                        src: vT,
                        alt: "service 9"
                      })
                    })
                  }), (0, sa.jsx)("div", {
                    className: "item",
                    children: (0, sa.jsx)("div", {
                      className: "service_img",
                      children: (0, sa.jsx)("img", {
                        src: UT,
                        alt: "service 10"
                      })
                    })
                  })]
                })]
              })]
            })
          }), (0, sa.jsx)("div", {
            className: "right_part part col-md-6",
            children: (0, sa.jsx)("div", {
              className: "rightpart_inner",
              children: (0, sa.jsx)("div", {
                className: "login_form",
                children: (0, sa.jsx)("div", {
                  className: "login_form_inner",
                  children: (0, sa.jsxs)("form", {
                    noValidate: !0,
                    onSubmit: i.handleSubmit,
                    children: [(0, sa.jsx)("h1", {
                      className: "login_title",
                      children: "Login Your Account"
                    }), (0, sa.jsxs)("div", {
                      className: "form_field_wrapper",
                      children: [(0, sa.jsx)("label", {
                        children: "Email"
                      }), (0, sa.jsx)("input", {
                        type: "email",
                        name: "email",
                        onChange: i.handleChange,
                        onBlur: i.handleBlur,
                        value: i.values.email,
                        placeholder: "Enter Email",
                        className: "form-control inp_text",
                        id: "email"
                      }), (0, sa.jsx)("p", {
                        className: "error",
                        children: i.errors.email && i.touched.email && i.errors.email
                      })]
                    }), (0, sa.jsxs)("div", {
                      className: "form_field_wrapper",
                      children: [(0, sa.jsx)("label", {
                        children: "Password"
                      }), (0, sa.jsx)("input", {
                        type: "password",
                        name: "password",
                        onChange: i.handleChange,
                        onBlur: i.handleBlur,
                        value: i.values.password,
                        placeholder: "Enter Password",
                        className: "form-control"
                      }), (0, sa.jsx)("p", {
                        className: "error",
                        children: i.errors.password && i.touched.password && i.errors.password
                      })]
                    }), (0, sa.jsx)("div", {
                      className: "form_field_wrapper forgotpass",
                      children: (0, sa.jsx)(ra, {
                        className: "linkto",
                        to: "/recover-password",
                        children: "Forgot Password?"
                      })
                    }), (0, sa.jsx)("button", {
                      type: "submit",
                      className: "btn btn-primary",
                      children: "LOGIN"
                    }), (0, sa.jsx)("div", {
                      className: "form_field_wrapper signuplink_block",
                      children: (0, sa.jsxs)(ra, {
                        className: "linkto signuplink",
                        to: "/register",
                        children: ["Don't have an account yet?", " ", (0, sa.jsx)("span", {
                          className: "signup_txt",
                          children: "SIGN UP"
                        })]
                      })
                    })]
                  })
                })
              })
            })
          })]
        })
      })
    }), (0, sa.jsx)(Aa, {})]
  });
}