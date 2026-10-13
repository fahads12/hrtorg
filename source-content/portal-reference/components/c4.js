function c4() {
  const {
      alertError: e
    } = Uu(),
    [a, n] = (0, r.useState)(!0),
    [t, o] = (0, r.useState)([]),
    [i, l] = (0, r.useState)(null),
    s = (0, r.useMemo)(() => function () {
      try {
        const e = "undefined" !== typeof window ? localStorage.getItem("token") : null;
        if (!e) return null;
        const a = e.split(".");
        if (a.length < 2) return null;
        const r = JSON.parse(atob(a[1].replace(/-/g, "+").replace(/_/g, "/")));
        return r.userId || r.sub || r.id || null;
      } catch (V4) {
        return null;
      }
    }(), []);
  (0, r.useEffect)(() => {
    let a = !0;
    return async function () {
      if (s) try {
        const r = await fu("/api/assessments/get-all-assessments/".concat(s));
        a && (!r || !0 !== r.success && !0 !== r.status ? Array.isArray(r) ? o(r) : (o([]), e(r && r.message || "Failed to load assessments")) : o(Array.isArray(r.data) ? r.data : []));
      } catch (V4) {
        if (a) {
          o([]);
          try {
            e("Failed to load assessments");
          } catch (r) {}
        }
      } finally {
        a && n(!1);
      } else n(!1);
    }(), () => {
      a = !1;
    };
  }, [s]);
  const u = e => {
      try {
        let a = e;
        for (; "string" === typeof a;) a = JSON.parse(a);
        return a;
      } catch (a) {
        return e;
      }
    },
    d = e => {
      try {
        return "string" !== typeof e || 0 === e.length ? e : e.charAt(0).toUpperCase() + e.slice(1);
      } catch (a) {
        return e;
      }
    },
    c = (0, r.useMemo)(() => (t || []).map(e => {
      var a, r, n, t;
      const o = e.entryDate || e.date || e.createdAt || e.created_at,
        i = e.genderAtEntry || e.gender || e.gender_at_entry,
        l = null !== (a = null !== (r = e.totalScore) && void 0 !== r ? r : e.total) && void 0 !== a ? a : e.total_score,
        s = null !== (n = null !== (t = e.maxTotal) && void 0 !== t ? t : e.max_total) && void 0 !== n ? n : e.max,
        d = e.ratingLabel || e.rating || e.rating_label;
      return {
        id: e.id || "".concat(o, "-").concat(l, "-").concat(s),
        entryDate: o,
        genderAtEntry: i,
        totalScore: l,
        maxTotal: s,
        ratingLabel: d,
        domainScores: (() => {
          try {
            var a;
            const r = null !== (a = e.domainScores) && void 0 !== a ? a : e.domain_scores,
              n = u(r);
            return n && "object" === typeof n ? n : {};
          } catch {
            return {};
          }
        })(),
        answers: (() => {
          try {
            var a, r;
            const n = null !== (a = null !== (r = e.answers) && void 0 !== r ? r : e.answers_json) && void 0 !== a ? a : e.answersJson,
              t = u(n);
            return t && "object" === typeof t ? t : {};
          } catch {
            return {};
          }
        })()
      };
    }), [t]);
  (0, r.useEffect)(() => {
    if (c.length > 0) {
      const e = [...c].sort((e, a) => new Date(a.entryDate) - new Date(e.entryDate)),
        a = e[0];
      i && i.id === a.id || l(a);
    }
  }, [c]);
  const A = (0, r.useMemo)(() => {
      try {
        return new Date().toISOString().slice(0, 10);
      } catch {
        return "";
      }
    }, []),
    S = (0, r.useMemo)(() => c.some(e => (e.entryDate || "").slice(0, 10) === A), [c, A]),
    h = (0, r.useMemo)(() => [...c].sort((e, a) => new Date(a.entryDate).getTime() - new Date(e.entryDate).getTime()), [c]),
    C = (0, r.useMemo)(() => S ? h : [{
      id: "add-today",
      special: !0
    }, ...h], [S, h]);
  return (0, sa.jsxs)("div", {
    children: [(0, sa.jsx)(ai, {}), (0, sa.jsx)("div", {
      className: "ua-container",
      children: (0, sa.jsxs)("div", {
        className: "ua-card",
        children: [(0, sa.jsxs)("div", {
          className: "ua-header",
          children: [(0, sa.jsx)("h1", {
            className: "ua-title",
            children: "Symptoms Tracker History"
          }), (0, sa.jsx)("p", {
            className: "ua-subtitle",
            children: "View and analyze all your previous assessment entries over time."
          })]
        }), a ? (0, sa.jsxs)("div", {
          className: "ua-loading",
          children: [(0, sa.jsx)("span", {
            className: "ua-spinner",
            "aria-hidden": "true"
          }), "Loading assessments..."]
        }) : 0 === c.length ? (0, sa.jsxs)("div", {
          className: "ua-empty",
          children: [(0, sa.jsx)("div", {
            className: "ua-empty__icon",
            "aria-hidden": "true",
            children: "\ud83d\udcc4"
          }), (0, sa.jsx)("div", {
            className: "ua-empty__title",
            children: "No assessments found"
          }), (0, sa.jsx)("div", {
            className: "ua-empty__text",
            children: "Your saved assessments will appear here after you submit."
          }), (0, sa.jsx)("div", {
            style: {
              marginTop: 20
            },
            children: (0, sa.jsxs)("button", {
              className: "ua-chip-btn ua-chip-btn--primary",
              onClick: () => {
                window.location.href = "/app/symptoms-tracker";
              },
              title: "Start a new assessment",
              children: [(0, sa.jsx)("span", {
                className: "ua-chip-btn__icon",
                children: "+"
              }), "Add Your First Symptoms"]
            })
          })]
        }) : (0, sa.jsxs)(sa.Fragment, {
          children: [(0, sa.jsx)("div", {
            className: "ua-datepick",
            children: (0, sa.jsxs)("div", {
              className: "ua-datepick__row",
              children: [(0, sa.jsx)("div", {
                className: "ua-datepick__label",
                children: "Select Date"
              }), (0, sa.jsx)("div", {
                className: "ua-datepick__buttons",
                children: C.map(e => e.special ? (0, sa.jsxs)("button", {
                  className: "ua-chip-btn ua-chip-btn--primary",
                  onClick: () => {
                    window.location.href = "/app/symptoms-tracker";
                  },
                  title: "Start a new assessment for today",
                  children: [(0, sa.jsx)("span", {
                    className: "ua-chip-btn__icon",
                    children: "+"
                  }), "Add Today's Symptoms"]
                }, "add-today") : (0, sa.jsx)("button", {
                  onClick: () => l(e),
                  className: "ua-chip-btn ".concat(i && i.id === e.id ? "is-active" : ""),
                  children: e.entryDate
                }, e.id))
              })]
            })
          }), i && (0, sa.jsxs)(sa.Fragment, {
            children: [(0, sa.jsxs)("div", {
              className: "ua-summary",
              children: [(0, sa.jsxs)("div", {
                className: "ua-summary__card",
                children: [(0, sa.jsx)("div", {
                  className: "ua-summary__label",
                  children: "Total Score"
                }), (0, sa.jsxs)("div", {
                  className: "ua-summary__value",
                  children: [i.totalScore, " ", (0, sa.jsxs)("span", {
                    className: "ua-summary__max",
                    children: ["/ ", i.maxTotal]
                  })]
                })]
              }), (0, sa.jsxs)("div", {
                className: "ua-summary__card",
                children: [(0, sa.jsx)("div", {
                  className: "ua-summary__label",
                  children: "Status"
                }), (0, sa.jsx)("div", {
                  className: "ua-summary__value",
                  children: i.ratingLabel
                })]
              }), (0, sa.jsxs)("div", {
                className: "ua-summary__card",
                children: [(0, sa.jsx)("div", {
                  className: "ua-summary__label",
                  children: "Gender"
                }), (0, sa.jsx)("div", {
                  className: "ua-summary__value ua-capitalize",
                  children: i.genderAtEntry
                })]
              })]
            }), (0, sa.jsxs)("div", {
              className: "ua-panel2",
              children: [(0, sa.jsx)("div", {
                className: "ua-panel2__title",
                children: "Domain Scores"
              }), (0, sa.jsx)("div", {
                className: "ua-domains",
                children: Object.entries(i.domainScores || {}).map(e => {
                  var a, r;
                  let [n, t] = e;
                  const o = null !== (a = t && t.value) && void 0 !== a ? a : 0,
                    i = null !== (r = t && t.max) && void 0 !== r ? r : 1,
                    l = Math.min(100, Math.max(0, o / i * 100));
                  return (0, sa.jsxs)("div", {
                    className: "ua-domain",
                    children: [(0, sa.jsxs)("div", {
                      className: "ua-domain__row",
                      children: [(0, sa.jsx)("span", {
                        className: "ua-domain__label",
                        children: n
                      }), (0, sa.jsxs)("span", {
                        className: "ua-domain__value",
                        children: [o, " / ", i]
                      })]
                    }), (0, sa.jsx)("div", {
                      className: "ua-domain__track",
                      children: (0, sa.jsx)("div", {
                        className: "ua-domain__fill ".concat(l > 50 ? "is-high" : l > 25 ? "is-mid" : "is-low"),
                        style: {
                          width: "".concat(l, "%")
                        }
                      })
                    })]
                  }, n);
                })
              })]
            }), (0, sa.jsx)("div", {
              className: "ua-answers",
              children: (0, sa.jsxs)("details", {
                className: "ua-details",
                children: [(0, sa.jsx)("summary", {
                  className: "ua-details__summary",
                  children: "Answers"
                }), (0, sa.jsx)("div", {
                  className: "ua-ansgrid",
                  children: Object.entries(i.answers || {}).map(e => {
                    let [a, r] = e;
                    return (0, sa.jsxs)("div", {
                      className: "ua-anscard",
                      children: [(0, sa.jsx)("div", {
                        className: "ua-anscard__key",
                        children: d(a)
                      }), (0, sa.jsx)("div", {
                        className: "ua-anscard__val",
                        children: String(r)
                      })]
                    }, a);
                  })
                })]
              })
            })]
          }), (0, sa.jsxs)("p", {
            className: "ua-footer",
            children: ["\xa9 ", new Date().getFullYear(), " MedHealth Systems \u2014 Symptom Tracker"]
          })]
        })]
      })
    }), (0, sa.jsx)(Aa, {})]
  });
}