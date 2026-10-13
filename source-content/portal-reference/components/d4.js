d4 = function () {
  const e = Boolean("undefined" !== typeof window && localStorage.getItem("token"));
  return (0, r.useEffect)(() => {
    MT("symptoms_tracker_visited");
  }, []), (0, sa.jsxs)("div", {
    children: [e ? (0, sa.jsx)(ai, {}) : (0, sa.jsx)(ca, {}), (0, sa.jsxs)("div", {
      className: "profile-setup-container",
      children: [(0, sa.jsx)("div", {
        className: "bg-blob bg-blob-1"
      }), (0, sa.jsx)("div", {
        className: "bg-blob bg-blob-2"
      }), (0, sa.jsx)("div", {
        className: "bg-circle bg-circle-1"
      }), (0, sa.jsx)("div", {
        className: "bg-circle bg-circle-2"
      }), (0, sa.jsx)(u4, {})]
    }), (0, sa.jsx)(Aa, {})]
  });
}