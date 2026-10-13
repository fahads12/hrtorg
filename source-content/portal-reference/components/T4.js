function t4(e) {
  let {
    value: a,
    onChange: r
  } = e;
  return (0, sa.jsx)("div", {
    className: "ss-likert",
    role: "group",
    "aria-label": "Symptom severity",
    children: [0, 1, 2, 3, 4, 5].map((e, n) => (0, sa.jsxs)("button", {
      type: "button",
      onClick: () => r(e),
      className: "ss-likert__btn ".concat(0 === n ? "is-first" : "", " ").concat(5 === n ? "is-last" : "", " ").concat(a === e ? "is-active" : ""),
      "aria-pressed": a === e,
      title: "".concat(e, " - ").concat(0 === e ? "Never" : 5 === e ? "Severe" : ""),
      children: [(0, sa.jsx)("span", {
        className: "ss-likert__num",
        children: e
      }), (0, sa.jsx)("span", {
        className: "ss-likert__dot",
        "aria-hidden": "true"
      })]
    }, e))
  });
}