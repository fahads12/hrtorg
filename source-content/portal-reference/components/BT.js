BT = function () {
  const [e, a] = r.useState("1"),
    n = be(),
    t = R(e => e.tab.value),
    o = v(),
    {
      alertError: i
    } = Uu(),
    [l, s] = (0, r.useState)(null),
    [u, d] = (0, r.useState)(null),
    c = (e, a) => {
      o(CE(a));
    };
  async function A() {
    try {
      const a = await fu("/api/intakeForms/check/formStatus"),
        r = localStorage.getItem("procedure"),
        t = localStorage.getItem("productId"),
        l = localStorage.getItem("productURL");
      if (a) {
        if ("5" === a.data.status) {
          if (MT("medical_history_completed"), r && t) try {
            o(RT({}));
            const e = await async function (e) {
                try {
                  return await fu("/api/catalog/" + e);
                } catch (a) {
                  i("Error Fetching Product Details");
                }
              }(t),
              a = null === e || void 0 === e ? void 0 : e.data;
            d(null === a || void 0 === a ? void 0 : a.productImage), s(a);
            "store-consultation" === localStorage.getItem("procedure") && localStorage.removeItem("procedure");
          } catch (e) {
            i("Error Getting Product Detail");
          }
          l && (n("/app/available-slots"), localStorage.removeItem("productURL"));
        }
        o(CE(a.data.status));
      }
    } catch (a) {
      i("Error Fetching Form Status");
    }
  }
  return (0, r.useEffect)(() => {
    if (l && u) {
      const e = {
        productId: localStorage.getItem("productId"),
        paypalProductId: null === l || void 0 === l ? void 0 : l.paypalProductId,
        productTitle: null === l || void 0 === l ? void 0 : l.productName,
        selectedValue: "",
        productPrice: null === l || void 0 === l ? void 0 : l.basePrice,
        productImageUrl: u,
        quantity: 1,
        totalPrice: null === l || void 0 === l ? void 0 : l.basePrice,
        variantData: null,
        planId: "",
        plan: {}
      };
      o(RT(e)), n("/app/checkout");
    }
  }, [l, u]), (0, r.useEffect)(() => {
    A();
  }, []), (0, sa.jsxs)(sa.Fragment, {
    children: [(0, sa.jsx)(ai, {}), (0, sa.jsx)("div", {
      className: "main_content intake_form",
      children: (0, sa.jsxs)("div", {
        className: "container",
        children: [(0, sa.jsx)("div", {
          className: "back_link",
          children: (0, sa.jsxs)(ra, {
            className: "action_link",
            to: "/app/lab-results",
            children: [(0, sa.jsx)(sT, {}), "Lab Results"]
          })
        }), (0, sa.jsxs)("div", {
          className: "main_block",
          children: [(0, sa.jsx)("div", {
            className: "top_bar",
            children: (0, sa.jsx)("div", {
              className: "main_title",
              children: "Medical History Intake Questionnaire"
            })
          }), (0, sa.jsx)("div", {
            className: "bottom_bar",
            children: "5" !== t ? (0, sa.jsx)("div", {
              className: "tabs",
              children: (0, sa.jsx)(Yu, {
                children: (0, sa.jsxs)(wd, {
                  value: t,
                  children: [(0, sa.jsx)(Yu, {
                    children: (0, sa.jsxs)(Gc, {
                      onChange: c,
                      variant: "scrollable",
                      scrollButtons: "auto",
                      "aria-label": "scrollable auto tabs example",
                      children: [(0, sa.jsx)(Hd, {
                        label: "1 Personal Information",
                        value: "1"
                      }), (0, sa.jsx)(Hd, {
                        label: "2 History",
                        value: "2"
                      }), (0, sa.jsx)(Hd, {
                        label: "3 Questions",
                        value: "3"
                      }), (0, sa.jsx)(Hd, {
                        label: "4 Verify your identity",
                        value: "4"
                      })]
                    })
                  }), (0, sa.jsx)(Vc, {
                    value: "1",
                    children: (0, sa.jsx)("div", {
                      className: "tabpanel_inner personal_info",
                      children: (0, sa.jsx)(RE, {
                        handleChange: c,
                        tabVal: t
                      })
                    })
                  }), (0, sa.jsx)(Vc, {
                    value: "2",
                    children: (0, sa.jsx)("div", {
                      className: "tabpanel_inner history",
                      children: (0, sa.jsx)(yE, {
                        handleChange: c,
                        tabVal: e
                      })
                    })
                  }), (0, sa.jsx)(Vc, {
                    value: "3",
                    children: (0, sa.jsx)("div", {
                      className: "tabpanel_inner question",
                      children: (0, sa.jsx)(PE, {
                        handleChange: c,
                        tabVal: e
                      })
                    })
                  }), (0, sa.jsx)(Vc, {
                    value: "4",
                    children: (0, sa.jsx)("div", {
                      className: "tabpanel_inner signature",
                      children: (0, sa.jsx)(YN, {
                        handleChange: c,
                        tabVal: e,
                        check: A
                      })
                    })
                  })]
                })
              })
            }) : (0, sa.jsx)("div", {
              className: "alert",
              children: (0, sa.jsx)("span", {
                className: "alertText",
                children: "You have already submitted the Intake Form. Thanks !"
              })
            })
          })]
        })]
      })
    }), (0, sa.jsx)(Aa, {})]
  });
}