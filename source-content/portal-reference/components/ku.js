ku = () => {
  var e, a, r, n, t, o, i, l, s, u, d, c;
  const A = be(),
    {
      alertSuccess: S,
      alertError: h
    } = Uu(),
    C = ko({
      initialValues: {
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      },
      validationSchema: pl,
      onSubmit: async (e, a) => {
        let {
          resetForm: r
        } = a;
        try {
          const a = qo(e);
          if (a) {
            const e = await pu("/api/users/password/changeOld/", a);
            null !== e && void 0 !== e && e.success ? (S(null === e || void 0 === e ? void 0 : e.message), r()) : h(null === e || void 0 === e ? void 0 : e.message);
          }
        } catch (n) {
          h("An error occurred while changing the password.");
        }
      }
    });
  return (0, sa.jsxs)(sa.Fragment, {
    children: [(0, sa.jsx)(ai, {}), (0, sa.jsx)("div", {
      className: "main_content",
      children: (0, sa.jsx)("div", {
        className: "container container_change_password",
        children: (0, sa.jsx)("div", {
          className: "main_block change_password",
          children: (0, sa.jsx)("form", {
            onSubmit: null === C || void 0 === C ? void 0 : C.handleSubmit,
            encType: "multipart/form-data",
            children: (0, sa.jsxs)("fieldset", {
              children: [(0, sa.jsx)("div", {
                className: "main_title",
                children: "Change Password"
              }), (0, sa.jsxs)("div", {
                className: "form_field_wrapper",
                children: [(0, sa.jsxs)("label", {
                  children: ["Old Password", (0, sa.jsx)("span", {
                    className: "req",
                    children: "*"
                  })]
                }), (0, sa.jsx)("input", {
                  type: "password",
                  placeholder: "Old Password",
                  onChange: null === C || void 0 === C ? void 0 : C.handleChange,
                  onBlur: null === C || void 0 === C ? void 0 : C.handleBlur,
                  value: null === C || void 0 === C || null === (e = C.values) || void 0 === e ? void 0 : e.oldPassword,
                  className: "form-control inp_text",
                  id: "oldPassword"
                }), (0, sa.jsx)("p", {
                  className: "error",
                  children: (null === C || void 0 === C || null === (a = C.errors) || void 0 === a ? void 0 : a.oldPassword) && (null === C || void 0 === C || null === (r = C.touched) || void 0 === r ? void 0 : r.oldPassword) && (null === C || void 0 === C || null === (n = C.errors) || void 0 === n ? void 0 : n.oldPassword)
                })]
              }), (0, sa.jsxs)("div", {
                className: "form_field_wrapper",
                children: [(0, sa.jsxs)("label", {
                  children: ["New Password", (0, sa.jsx)("span", {
                    className: "req",
                    children: "*"
                  })]
                }), (0, sa.jsx)("input", {
                  type: "password",
                  placeholder: "New Password",
                  onChange: null === C || void 0 === C ? void 0 : C.handleChange,
                  onBlur: null === C || void 0 === C ? void 0 : C.handleBlur,
                  value: null === C || void 0 === C || null === (t = C.values) || void 0 === t ? void 0 : t.newPassword,
                  className: "form-control inp_text",
                  id: "newPassword"
                }), (0, sa.jsx)("p", {
                  className: "error",
                  children: (null === C || void 0 === C || null === (o = C.errors) || void 0 === o ? void 0 : o.newPassword) && (null === C || void 0 === C || null === (i = C.touched) || void 0 === i ? void 0 : i.newPassword) && (null === C || void 0 === C || null === (l = C.errors) || void 0 === l ? void 0 : l.newPassword)
                })]
              }), (0, sa.jsxs)("div", {
                className: "form_field_wrapper",
                children: [(0, sa.jsxs)("label", {
                  children: ["Confirm Password", (0, sa.jsx)("span", {
                    className: "req",
                    children: "*"
                  })]
                }), (0, sa.jsx)("input", {
                  type: "password",
                  placeholder: "Confirm Password",
                  onChange: null === C || void 0 === C ? void 0 : C.handleChange,
                  onBlur: null === C || void 0 === C ? void 0 : C.handleBlur,
                  value: null === C || void 0 === C || null === (s = C.values) || void 0 === s ? void 0 : s.confirmNewPassword,
                  className: "form-control inp_text",
                  id: "confirmNewPassword"
                }), (0, sa.jsx)("p", {
                  className: "error",
                  children: (null === C || void 0 === C || null === (u = C.errors) || void 0 === u ? void 0 : u.confirmNewPassword) && (null === C || void 0 === C || null === (d = C.touched) || void 0 === d ? void 0 : d.confirmNewPassword) && (null === C || void 0 === C || null === (c = C.errors) || void 0 === c ? void 0 : c.confirmNewPassword)
                })]
              }), (0, sa.jsxs)("div", {
                className: "primary_btn",
                children: [(0, sa.jsx)("input", {
                  className: "btn btn-secondary",
                  type: "button",
                  value: "previous",
                  onClick: () => A("/lab-results")
                }), (0, sa.jsx)("button", {
                  type: "submit",
                  className: "btn btn-secondary bg-danger text-white",
                  children: "Submit"
                })]
              })]
            })
          })
        })
      })
    }), (0, sa.jsx)(Aa, {})]
  });
}