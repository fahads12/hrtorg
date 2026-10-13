ai = () => {
  const [e, a] = (0, r.useState)();
  let n = be();
  const t = () => {
    localStorage.removeItem("Auth Token"), localStorage.removeItem("uid"), localStorage.removeItem("uFN"), localStorage.removeItem("uLN"), localStorage.removeItem("uR"), localStorage.removeItem("procedure"), localStorage.removeItem("productId"), localStorage.removeItem("__paypal_storage__"), localStorage.removeItem("token"), n("/");
  };
  (0, r.useEffect)(() => {
    let e = localStorage.getItem("token");
    return a(e), window.addEventListener("scroll", o), () => {
      window.removeEventListener("scroll", o);
    };
  }, []);
  const o = e => {
    var a, r;
    const n = document.querySelector(".header-section");
    window.scrollY >= 100 ? null === n || void 0 === n || null === (a = n.classList) || void 0 === a || a.add("sticky") : null === n || void 0 === n || null === (r = n.classList) || void 0 === r || r.remove("sticky");
  };
  return (0, sa.jsxs)(sa.Fragment, {
    children: ["", (0, sa.jsx)("header", {
      className: "header-section",
      children: (0, sa.jsx)("nav", {
        className: "navbar navbar-expand-lg navbar-light",
        children: (0, sa.jsxs)("div", {
          className: "container",
          children: [(0, sa.jsx)(na, {
            className: "logo",
            to: e ? "/app/home" : "/",
            children: (0, sa.jsx)("img", {
              src: da,
              alt: "Header Logo"
            })
          }), (0, sa.jsx)("button", {
            className: "navbar-toggler",
            type: "button",
            "data-bs-toggle": "collapse",
            "data-bs-target": "#navbarSupportedContent",
            "aria-controls": "navbarSupportedContent",
            "aria-expanded": "false",
            "aria-label": "Toggle navigation",
            children: (0, sa.jsx)("span", {
              className: "navbar-toggler-icon"
            })
          }), (0, sa.jsx)("div", {
            className: "collapse navbar-collapse",
            id: "navbarSupportedContent",
            children: (0, sa.jsxs)("ul", {
              className: "navbar-nav mb-2 mb-lg-0",
              children: [(0, sa.jsx)("li", {
                className: "nav-item",
                children: (0, sa.jsx)(na, {
                  className: "nav-link",
                  to: "/app/appointment-scheduling",
                  children: "Schedule Appointment"
                })
              }), (0, sa.jsx)("li", {
                className: "nav-item",
                children: (0, sa.jsx)(na, {
                  className: "nav-link ",
                  to: "/app/lab-results",
                  children: "Lab Results"
                })
              }), (0, sa.jsx)("li", {
                className: "nav-item",
                children: (0, sa.jsx)(na, {
                  className: "nav-link",
                  to: "/app/medical-history",
                  children: "Medical History"
                })
              }), (0, sa.jsx)("li", {
                className: "nav-item",
                children: (0, sa.jsx)(na, {
                  className: "nav-link",
                  to: "/app/my-orders",
                  children: "Orders"
                })
              }), (0, sa.jsx)("li", {
                className: "nav-item",
                children: (0, sa.jsx)(na, {
                  className: "nav-link",
                  to: "/app/user-kit-orders",
                  children: "Kit Orders"
                })
              }), (0, sa.jsx)("li", {
                className: "nav-item",
                children: (0, sa.jsx)(na, {
                  className: "nav-link",
                  to: "/app/lab-tests",
                  children: "Lab Tests"
                })
              }), (0, sa.jsx)("li", {
                className: "nav-item",
                children: (0, sa.jsx)(na, {
                  className: "nav-link",
                  to: "/app/tracker-history",
                  children: "Symptoms Tracker"
                })
              })]
            })
          }), (0, sa.jsxs)("div", {
            className: "profile dropdown",
            children: [(0, sa.jsx)("div", {
              className: "profile_inner dropdown-toggle",
              "data-bs-toggle": "dropdown",
              "aria-expanded": "false",
              children: (0, sa.jsxs)("div", {
                className: "profile_desc",
                children: [(0, sa.jsxs)("div", {
                  className: "profile_name",
                  children: [$o(localStorage.getItem("uFN")), " ", $o(localStorage.getItem("uLN"))]
                }), (0, sa.jsx)("div", {
                  className: "profile_desc",
                  children: $o(localStorage.getItem("uR"))
                })]
              })
            }), (0, sa.jsxs)("ul", {
              className: "dropdown-menu",
              children: [(0, sa.jsx)("li", {
                children: (0, sa.jsx)(na, {
                  className: "dropdown-item",
                  to: "/app/change-password",
                  children: "Change Password"
                })
              }), (0, sa.jsx)("li", {
                children: (0, sa.jsx)("a", {
                  className: "dropdown-item",
                  href: "/",
                  onClick: t,
                  children: "Log Out"
                })
              })]
            })]
          })]
        })
      })
    })]
  });
}