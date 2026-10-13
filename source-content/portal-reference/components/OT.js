OT = function () {
  var e, a, r, n;
  const {
      alertSuccess: t,
      alertError: o
    } = Uu(),
    i = ko({
      initialValues: {
        email: ""
      },
      validationSchema: Cl,
      onSubmit: async (e, a) => {
        let {
          resetForm: r
        } = a;
        try {
          const a = qo(e);
          if (a) {
            const e = await pu("/api/users/recovery-password", a);
            null !== e && void 0 !== e && e.success ? (t(null === e || void 0 === e ? void 0 : e.message), r()) : o(null === e || void 0 === e ? void 0 : e.message);
          }
        } catch (n) {
          o("An error occurred while processing your request.");
        }
      }
    });
  return (0, sa.jsxs)(sa.Fragment, {
    children: [(0, sa.jsx)(ca, {}), (0, sa.jsx)("div", {
      className: "login",
      children: (0, sa.jsx)("div", {
        className: "login_inner",
        children: (0, sa.jsxs)("div", {
          className: "row",
          children: [(0, sa.jsx)("div", {
            className: "left_part part col-md-6",
            children: (0, sa.jsx)("div", {
              className: "leftpart_inner",
              children: (0, sa.jsx)("div", {
                className: "logo",
                children: (0, sa.jsx)("img", {
                  src: LT,
                  alt: "Logo Img"
                })
              })
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
                    onSubmit: null === i || void 0 === i ? void 0 : i.handleSubmit,
                    children: [(0, sa.jsx)("h1", {
                      className: "login_title",
                      children: "Forgot Password?"
                    }), (0, sa.jsxs)("div", {
                      className: "login_desc",
                      children: ["Don't Worry! Please enter the email ", (0, sa.jsx)("br", {}), " address associated with your account."]
                    }), (0, sa.jsxs)("div", {
                      className: "form_field_wrapper",
                      children: [(0, sa.jsx)("label", {
                        children: "Email"
                      }), (0, sa.jsx)("input", {
                        type: "email",
                        name: "email",
                        onChange: null === i || void 0 === i ? void 0 : i.handleChange,
                        onBlur: null === i || void 0 === i ? void 0 : i.handleBlur,
                        value: null === i || void 0 === i || null === (e = i.values) || void 0 === e ? void 0 : e.email,
                        placeholder: "Enter Email",
                        className: "form-control inp_text",
                        id: "email"
                      }), (null === i || void 0 === i || null === (a = i.errors) || void 0 === a ? void 0 : a.email) && (null === i || void 0 === i || null === (r = i.touched) || void 0 === r ? void 0 : r.email) && (0, sa.jsx)("p", {
                        className: "error",
                        children: null === i || void 0 === i || null === (n = i.errors) || void 0 === n ? void 0 : n.email
                      })]
                    }), (0, sa.jsx)("button", {
                      variant: "primary",
                      type: "submit",
                      className: "btn btn-primary recoverpass",
                      children: "Submit"
                    }), (0, sa.jsx)("div", {
                      className: "form_field_wrapper backtologin_block",
                      children: (0, sa.jsxs)(ra, {
                        className: "linkto backtologin",
                        to: "/",
                        children: ["Already have an account?", " ", (0, sa.jsx)("span", {
                          className: "login_txt",
                          children: "Login"
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