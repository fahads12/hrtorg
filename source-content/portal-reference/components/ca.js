ca = () => {
  (0, r.useEffect)(() => (window.addEventListener("scroll", e), () => {
    window.removeEventListener("scroll", e);
  }));
  const e = e => {
    const a = document.querySelector(".header-section");
    window.scrollY >= 100 ? null === a || void 0 === a || a.classList.add("sticky") : null === a || void 0 === a || a.classList.remove("sticky");
  };
  return (0, sa.jsx)(sa.Fragment, {
    children: (0, sa.jsx)("header", {
      className: "header-section prelogin_header",
      children: (0, sa.jsx)("nav", {
        className: "navbar navbar-expand-lg navbar-light",
        children: (0, sa.jsxs)("div", {
          className: "container",
          children: [(0, sa.jsx)(na, {
            className: "logo",
            to: "/",
            children: (0, sa.jsx)("img", {
              src: da,
              alt: "Pre Login Header"
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
                  to: "/",
                  children: "Login"
                })
              }), (0, sa.jsx)("li", {
                className: "nav-item",
                children: (0, sa.jsx)(na, {
                  className: "nav-link",
                  to: "/register",
                  children: "Sign Up"
                })
              })]
            })
          })]
        })
      })
    })
  });
}