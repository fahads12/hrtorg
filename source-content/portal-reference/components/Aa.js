Aa = () => {
  const [e, a] = (0, r.useState)(!1);
  return (0, r.useEffect)(() => {
    const e = localStorage.getItem("uR");
    e && "provider" === e && a(!0);
  }, []), (0, sa.jsx)(sa.Fragment, {
    children: (0, sa.jsxs)("footer", {
      children: [(0, sa.jsx)("div", {
        className: "footer_top",
        children: (0, sa.jsx)("div", {
          className: "container",
          children: (0, sa.jsxs)("div", {
            className: "row",
            children: [(0, sa.jsx)("div", {
              className: "col-md-4 footer_item footer_item1",
              children: (0, sa.jsxs)("div", {
                className: "footer_item_inner",
                children: [(0, sa.jsx)("div", {
                  className: "footer_logo",
                  children: (0, sa.jsx)("img", {
                    src: da,
                    alt: "Footer Logo"
                  })
                }), (0, sa.jsx)("div", {
                  className: "footer_desc",
                  children: "Leading The Way In Medical Excellence, Trusted Care."
                })]
              })
            }), localStorage.getItem("uid") ? " " : (0, sa.jsxs)(sa.Fragment, {
              children: [(0, sa.jsxs)("div", {
                className: "col-md-4 footer_item footer_item2",
                children: [(0, sa.jsx)("h6", {
                  className: "footer_title",
                  children: "Important Links"
                }), (0, sa.jsx)("div", {
                  className: "footer_link",
                  children: (0, sa.jsx)(ra, {
                    to: "/privacy-policy",
                    children: "Privacy Policy"
                  })
                }), (0, sa.jsx)("div", {
                  className: "footer_link",
                  children: (0, sa.jsx)(ra, {
                    to: "/terms-and-conditions",
                    children: "Terms And Conditions"
                  })
                })]
              }), (0, sa.jsxs)("div", {
                className: "col-md-4 footer_item footer_item3",
                children: [(0, sa.jsx)("h6", {
                  className: "footer_title",
                  children: "Contact Us"
                }), (0, sa.jsxs)("div", {
                  className: "footer_link",
                  children: [(0, sa.jsx)("label", {
                    children: "Call:"
                  }), (0, sa.jsx)("a", {
                    href: "tel:(888) 574-5524",
                    children: "(888) 574-5524"
                  })]
                }), (0, sa.jsxs)("div", {
                  className: "footer_link",
                  children: [(0, sa.jsx)("label", {
                    children: "Email:"
                  }), (0, sa.jsx)("a", {
                    href: "mailto:support@hrt.org",
                    children: "support@hrt.org"
                  })]
                })]
              })]
            })]
          })
        })
      }), (0, sa.jsx)("div", {
        className: "footer_bottom",
        children: (0, sa.jsxs)("div", {
          className: "container",
          children: [(0, sa.jsx)("small", {
            className: "copyright mt-4",
            children: "Copyright \xa9 2023 HRT. All Right Reserved."
          }), e && e ? (0, sa.jsx)(ra, {
            to: "/list-catalog",
            className: "",
            children: "Catalogs"
          }) : null]
        })
      })]
    })
  });
}