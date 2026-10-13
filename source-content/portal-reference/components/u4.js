function u4() {
  const [e, a] = (0, r.useState)(1),
    [n, t] = (0, r.useState)(null),
    [o, i] = (0, r.useState)({}),
    [l, s] = (0, r.useState)(""),
    {
      alertSuccess: u,
      alertError: d
    } = Uu(),
    c = Boolean("undefined" !== typeof window && localStorage.getItem("token")),
    [A, S] = (0, r.useState)(!1),
    [h, C] = (0, r.useState)(!1),
    m = (0, r.useMemo)(() => n ? "female" === n ? [...i4, ...l4] : [...i4, ...s4] : [], [n]),
    R = (0, r.useMemo)(() => Object.values(o).reduce((e, a) => e + (a || 0), 0), [o]),
    f = (0, r.useMemo)(() => 5 * m.length, [m.length]),
    g = (0, r.useMemo)(() => R <= 9 ? {
      label: "Balanced",
      color: "balanced"
    } : R <= 19 ? {
      label: "Mild Imbalance",
      color: "mild"
    } : R <= 34 ? {
      label: "Moderate Imbalance",
      color: "moderate"
    } : {
      label: "Significant Imbalance",
      color: "significant"
    }, [R]),
    p = (0, r.useMemo)(() => {
      const e = "female" === n ? {
          Energy: ["energy", "stress"],
          Mood: ["mood", "brainfog"],
          Sleep: ["sleep"],
          Metabolic: ["weight"],
          SexHormones: ["libido", "hotflashes", "cycle", "vaginal", "hairskin"]
        } : {
          Energy: ["energy", "stress"],
          Mood: ["mood", "brainfog"],
          Sleep: ["sleep"],
          Metabolic: ["weight", "waist"],
          SexHormones: ["libido", "motivation", "ed", "recovery"]
        },
        a = [];
      return Object.entries(e).forEach(e => {
        let [r, n] = e;
        const t = n.reduce((e, a) => e + (o[a] || 0), 0),
          i = 5 * n.length;
        a.push({
          label: r,
          value: t,
          max: i
        });
      }), a;
    }, [o, n]),
    M = (0, r.useMemo)(() => {
      if (!n) return [];
      const e = Object.fromEntries(m.map(e => [e.key, e.label])),
        a = "female" === n ? {
          Energy: ["energy", "stress"],
          Mood: ["mood", "brainfog"],
          Sleep: ["sleep"],
          Metabolic: ["weight"],
          SexHormones: ["libido", "hotflashes", "cycle", "vaginal", "hairskin"]
        } : {
          Energy: ["energy", "stress"],
          Mood: ["mood", "brainfog"],
          Sleep: ["sleep"],
          Metabolic: ["weight", "waist"],
          SexHormones: ["libido", "motivation", "ed", "recovery"]
        };
      return Object.entries(a).map(a => {
        let [r, n] = a;
        return {
          group: r,
          items: n.map(a => e[a] ? {
            key: a,
            label: e[a]
          } : null).filter(Boolean)
        };
      }).filter(e => e.items.length > 0);
    }, [n, m]);
  (0, r.useEffect)(() => {
    try {
      const e = localStorage.getItem("symptoms_score");
      if (e) {
        const r = JSON.parse(e);
        r && "object" === typeof r && (r.gender && t(r.gender), r.answers && i(r.answers), a(3));
      }
    } catch (e) {
      d("Error parsing saved symptoms score");
    } finally {
      localStorage.removeItem("symptoms_score");
    }
  }, []);
  return (0, sa.jsx)("div", {
    className: "ss-container",
    children: (0, sa.jsxs)("div", {
      className: "ss-card",
      children: [(0, sa.jsx)("div", {
        className: "ss-card__header",
        children: (0, sa.jsxs)("div", {
          className: "ss-hero",
          children: [(0, sa.jsxs)("div", {
            className: "ss-hero__text",
            children: [(0, sa.jsx)("h1", {
              className: "ss-card__title",
              children: "Hormone Health Symptom Score"
            }), (0, sa.jsx)("p", {
              className: "ss-card__subtitle",
              children: "Answer a few quick questions to get your personalized score and insights. It takes ~2 minutes."
            }), (0, sa.jsxs)("div", {
              className: "ss-steps",
              children: [(0, sa.jsxs)("div", {
                className: "ss-step ".concat(e >= 1 ? "is-done" : "", " ").concat(1 === e ? "is-active" : ""),
                children: [(0, sa.jsx)("div", {
                  className: "ss-step__bullet",
                  children: "1"
                }), (0, sa.jsx)("div", {
                  className: "ss-step__label",
                  children: "Profile"
                })]
              }), (0, sa.jsxs)("div", {
                className: "ss-step ".concat(e >= 2 ? "is-done" : "", " ").concat(2 === e ? "is-active" : ""),
                children: [(0, sa.jsx)("div", {
                  className: "ss-step__bullet",
                  children: "2"
                }), (0, sa.jsx)("div", {
                  className: "ss-step__label",
                  children: "Questions"
                })]
              }), (0, sa.jsxs)("div", {
                className: "ss-step ".concat(e >= 3 ? "is-done" : "", " ").concat(3 === e ? "is-active" : ""),
                children: [(0, sa.jsx)("div", {
                  className: "ss-step__bullet",
                  children: "3"
                }), (0, sa.jsx)("div", {
                  className: "ss-step__label",
                  children: "Results"
                })]
              }), (0, sa.jsxs)("div", {
                className: "ss-step ".concat(e >= 4 ? "is-done" : "", " ").concat(4 === e ? "is-active" : ""),
                children: [(0, sa.jsx)("div", {
                  className: "ss-step__bullet",
                  children: "4"
                }), (0, sa.jsx)("div", {
                  className: "ss-step__label",
                  children: "Email"
                })]
              })]
            })]
          }), (0, sa.jsxs)("div", {
            className: "ss-hero__art",
            "aria-hidden": "true",
            children: [(0, sa.jsx)("div", {
              className: "ss-blob ss-blob--1"
            }), (0, sa.jsx)("div", {
              className: "ss-blob ss-blob--2"
            }), (0, sa.jsx)("div", {
              className: "ss-hero__ring"
            }), (0, sa.jsx)("div", {
              className: "ss-hero__ring ss-hero__ring--2"
            })]
          })]
        })
      }), (0, sa.jsxs)("div", {
        className: "ss-card__content",
        children: [1 === e && (0, sa.jsxs)("div", {
          children: [(0, sa.jsx)("h2", {
            className: "ss-heading ss-heading--center",
            children: "Who should we tailor this for?"
          }), (0, sa.jsxs)("div", {
            className: "ss-grid ss-grid--two",
            children: [(0, sa.jsx)("button", {
              onClick: () => {
                t("female"), a(2);
              },
              className: "ss-choice ".concat("female" === n ? "is-selected" : ""),
              "aria-pressed": "female" === n,
              children: (0, sa.jsxs)("div", {
                className: "ss-choice__row",
                children: [(0, sa.jsx)("div", {
                  className: "ss-choice__icon",
                  "aria-hidden": "true",
                  children: (0, sa.jsxs)("svg", {
                    width: "36",
                    height: "36",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg",
                    children: [(0, sa.jsx)("path", {
                      d: "M12 14a6 6 0 1 0 -0.001 -12.001A6 6 0 0 0 12 14Z",
                      stroke: "currentColor",
                      strokeWidth: "1.6"
                    }), (0, sa.jsx)("path", {
                      d: "M12 14v3M12 21v-4M12 17H9M12 17h3",
                      stroke: "currentColor",
                      strokeWidth: "1.6",
                      strokeLinecap: "round"
                    })]
                  })
                }), (0, sa.jsxs)("div", {
                  children: [(0, sa.jsx)("div", {
                    className: "ss-choice__title",
                    children: "Women"
                  }), (0, sa.jsx)("div", {
                    className: "ss-choice__desc",
                    children: "Menopause, perimenopause, thyroid, adrenal"
                  })]
                })]
              })
            }), (0, sa.jsx)("button", {
              onClick: () => {
                t("male"), a(2);
              },
              className: "ss-choice ".concat("male" === n ? "is-selected" : ""),
              "aria-pressed": "male" === n,
              children: (0, sa.jsxs)("div", {
                className: "ss-choice__row",
                children: [(0, sa.jsx)("div", {
                  className: "ss-choice__icon",
                  "aria-hidden": "true",
                  children: (0, sa.jsxs)("svg", {
                    width: "36",
                    height: "36",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg",
                    children: [(0, sa.jsx)("path", {
                      d: "M20 4h-5M20 4v5M20 4l-6.5 6.5",
                      stroke: "currentColor",
                      strokeWidth: "1.6",
                      strokeLinecap: "round"
                    }), (0, sa.jsx)("circle", {
                      cx: "9",
                      cy: "15",
                      r: "5.5",
                      stroke: "currentColor",
                      strokeWidth: "1.6"
                    })]
                  })
                }), (0, sa.jsxs)("div", {
                  children: [(0, sa.jsx)("div", {
                    className: "ss-choice__title",
                    children: "Men"
                  }), (0, sa.jsx)("div", {
                    className: "ss-choice__desc",
                    children: "Testosterone optimization, thyroid, adrenal"
                  })]
                })]
              })
            })]
          }), (0, sa.jsx)("div", {
            className: "ss-center ss-mt",
            children: (0, sa.jsx)("button", {
              className: "ss-btn ss-btn--primary",
              onClick: () => n ? a(2) : null,
              disabled: !n,
              children: "Continue"
            })
          })]
        }), 2 === e && n && (0, sa.jsxs)("div", {
          children: [(0, sa.jsxs)("div", {
            className: "ss-row ss-row--space",
            children: [(0, sa.jsx)("h2", {
              className: "ss-heading",
              children: "Tell us how often you experience the following:"
            }), (0, sa.jsx)("span", {
              className: "ss-muted",
              children: "0 = Never, 5 = Severe / Daily"
            })]
          }), (0, sa.jsx)("div", {
            className: "ss-questions",
            children: M.map(e => (0, sa.jsxs)("div", {
              className: "ss-section",
              children: [(0, sa.jsx)("div", {
                className: "ss-section__title",
                children: e.group
              }), e.items.map(e => {
                var a;
                return (0, sa.jsxs)("div", {
                  className: "ss-question",
                  children: [(0, sa.jsx)("div", {
                    className: "ss-question__label",
                    children: e.label
                  }), (0, sa.jsx)(t4, {
                    value: null !== (a = o[e.key]) && void 0 !== a ? a : 0,
                    onChange: a => i(r => ({
                      ...r,
                      [e.key]: a
                    }))
                  }), (0, sa.jsxs)("div", {
                    className: "ss-scale",
                    children: [(0, sa.jsx)("span", {
                      children: "Never"
                    }), (0, sa.jsx)("span", {
                      children: "Sometimes"
                    }), (0, sa.jsx)("span", {
                      children: "Severe"
                    })]
                  })]
                }, e.key);
              })]
            }, e.group))
          }), (0, sa.jsx)("div", {
            className: "ss-actions-sticky",
            children: (0, sa.jsxs)("div", {
              className: "ss-actions-sticky__inner",
              children: [(0, sa.jsx)("button", {
                className: "ss-btn ss-btn--ghost",
                onClick: () => a(1),
                children: "Back"
              }), (0, sa.jsx)("button", {
                className: "ss-btn ss-btn--primary",
                onClick: () => a(3),
                children: "See My Score"
              })]
            })
          })]
        }), 3 === e && (0, sa.jsxs)("div", {
          children: [(0, sa.jsxs)("div", {
            className: "ss-results__intro",
            children: [(0, sa.jsxs)("div", {
              className: "ss-chip ss-chip--".concat(g.color),
              children: ["Your Rating:", " ", (0, sa.jsx)("span", {
                className: "ss-chip__value ss-chip__value--".concat(g.color),
                children: g.label
              })]
            }), (0, sa.jsxs)("h2", {
              className: "ss-score",
              children: [R, " ", (0, sa.jsxs)("span", {
                className: "ss-score__max",
                children: ["/ ", f]
              })]
            }), (0, sa.jsx)("p", {
              className: "ss-muted",
              children: "Higher scores suggest more pronounced symptoms that may benefit from hormone, thyroid, or adrenal evaluation."
            })]
          }), (0, sa.jsxs)("div", {
            className: "ss-grid ss-grid--two ss-gap",
            children: [(0, sa.jsxs)("div", {
              className: "ss-panel",
              children: [(0, sa.jsx)("h3", {
                className: "ss-panel__title",
                children: "Your Domains"
              }), p.map(e => (0, sa.jsx)(o4, {
                label: e.label,
                value: e.value,
                max: e.max
              }, e.label))]
            }), (0, sa.jsxs)("div", {
              className: "ss-panel",
              children: [(0, sa.jsx)("h3", {
                className: "ss-panel__title",
                children: "Recommended Next Step"
              }), (0, sa.jsxs)("ul", {
                className: "ss-list",
                children: [(0, sa.jsx)("li", {
                  children: "Create your HRT.org account to save your score and view a personalized plan."
                }), (0, sa.jsx)("li", {
                  children: "female" === n ? "Consider a Menopause / Women\u2019s Hormone Panel." : "Consider a Male Optimization Panel."
                }), (0, sa.jsx)("li", {
                  children: "Telehealth consult with a licensed provider to review options."
                })]
              }), (0, sa.jsx)("div", {
                className: "ss-note",
                children: "This score is for wellness guidance and is not a diagnosis."
              })]
            })]
          }), (0, sa.jsx)("div", {
            className: "ss-grid ss-grid--two ss-actions",
            children: c ? (0, sa.jsx)("div", {
              className: "ss-grid ss-grid--two ss-actions",
              children: (0, sa.jsx)("button", {
                className: "ss-btn ss-btn--primary ss-btn--lg m-auto",
                onClick: () => {
                  A || (async () => {
                    S(!0);
                    try {
                      const a = () => {
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
                        },
                        r = a(),
                        t = Object.fromEntries(p.map(e => [e.label, {
                          value: e.value,
                          max: e.max
                        }])),
                        i = () => "female" === n ? [...i4, ...l4].map(e => e.key) : "male" === n ? [...i4, ...s4].map(e => e.key) : [...i4, ...l4, ...s4].map(e => e.key),
                        l = Object.fromEntries(i().map(e => [e, o && "number" === typeof o[e] ? o[e] : 0])),
                        s = {
                          userId: r,
                          genderAtEntry: n,
                          entryDate: new Date().toISOString().slice(0, 10),
                          answers: JSON.stringify(l),
                          domainScores: JSON.stringify(t),
                          totalScore: R,
                          maxTotal: f,
                          ratingLabel: g.label
                        },
                        c = await pu("/api/assessments/create-assessment", s);
                      try {
                        !c || !0 !== c.success && !0 !== c.status ? d(c && c.message || "Failed to save assessment.") : u(c.message || "Assessment saved successfully.");
                      } catch (e) {}
                      return c;
                    } catch (V4) {
                      try {
                        d("Failed to save assessment.");
                      } catch (e) {}
                      return null;
                    } finally {
                      S(!1), window.location.href = "/app/tracker-history";
                    }
                  })();
                },
                disabled: A,
                "aria-busy": A,
                children: A ? (0, sa.jsxs)(sa.Fragment, {
                  children: [(0, sa.jsx)("span", {
                    className: "ss-spinner",
                    "aria-hidden": "true"
                  }), "Saving..."]
                }) : "Save My Score"
              })
            }) : (0, sa.jsxs)(sa.Fragment, {
              children: [(0, sa.jsx)("button", {
                className: "ss-btn ss-btn--primary ss-btn--lg",
                onClick: () => {
                  (() => {
                    try {
                      const e = () => "female" === n ? [...i4, ...l4].map(e => e.key) : "male" === n ? [...i4, ...s4].map(e => e.key) : [...i4, ...l4, ...s4].map(e => e.key),
                        a = Object.fromEntries(e().map(e => [e, o && "number" === typeof o[e] ? o[e] : 0])),
                        r = {
                          gender: n,
                          email: l,
                          total: R,
                          maxTotal: f,
                          ratingLabel: g.label,
                          domainScores: p,
                          answers: a,
                          savedAt: new Date().toISOString()
                        };
                      localStorage.setItem("symptoms_score", JSON.stringify(r));
                    } catch (V4) {}
                  })(), window.location.href = "/register";
                },
                children: "Create Account & Save My Score"
              }), (0, sa.jsx)("button", {
                className: "ss-btn ss-btn--outline ss-btn--lg",
                onClick: () => a(4),
                children: "Continue Without Account (Next)"
              })]
            })
          }), (0, sa.jsx)("div", {
            className: "ss-center",
            children: (0, sa.jsx)("button", {
              className: "ss-link",
              onClick: () => a(2),
              children: "Edit my answers"
            })
          })]
        }), 4 === e && (0, sa.jsxs)("div", {
          children: [(0, sa.jsx)("h2", {
            className: "ss-heading ss-heading--center",
            children: "Get Your Results by Email"
          }), (0, sa.jsx)("p", {
            className: "ss-muted ss-muted--center",
            children: "We\u2019ll send your score and next steps. You can finish creating your account later."
          }), (0, sa.jsxs)("div", {
            className: "ss-form",
            children: [(0, sa.jsx)("input", {
              type: "email",
              placeholder: "Email address",
              value: l,
              onChange: e => s(e.target.value),
              className: "ss-input"
            }), (0, sa.jsxs)("div", {
              className: "ss-row ss-row--center ss-mt",
              children: [(0, sa.jsx)("button", {
                className: "ss-btn ss-btn--ghost",
                onClick: () => a(3),
                children: "Back"
              }), (0, sa.jsx)("button", {
                className: "ss-btn ss-btn--success",
                onClick: () => {
                  h || (async () => {
                    C(!0);
                    try {
                      const a = Object.fromEntries(p.map(e => [e.label, {
                          value: e.value,
                          max: e.max
                        }])),
                        r = () => "female" === n ? [...i4, ...l4].map(e => e.key) : "male" === n ? [...i4, ...s4].map(e => e.key) : [...i4, ...l4, ...s4].map(e => e.key),
                        t = Object.fromEntries(r().map(e => [e, o && "number" === typeof o[e] ? o[e] : 0])),
                        i = {
                          email: l,
                          genderAtEntry: n,
                          entryDate: new Date().toISOString().slice(0, 10),
                          answers: JSON.stringify(t),
                          domainScores: JSON.stringify(a),
                          totalScore: R,
                          maxTotal: f,
                          ratingLabel: g.label
                        },
                        s = await pu("/api/assessments/send-data-to-mail", i);
                      try {
                        !s || !0 !== s.success && !0 !== s.status ? d(s && s.message || "Failed to send email.") : u(s.message || "Email sent successfully.");
                      } catch (e) {}
                      return s;
                    } catch (V4) {
                      try {
                        d("Failed to send email.");
                      } catch (e) {}
                      return null;
                    } finally {
                      C(!1), window.location.href = "/app/symptoms-tracker";
                    }
                  })();
                },
                disabled: h || !l,
                "aria-busy": h,
                children: h ? (0, sa.jsxs)(sa.Fragment, {
                  children: [(0, sa.jsx)("span", {
                    className: "ss-spinner",
                    "aria-hidden": "true"
                  }), "Sending..."]
                }) : "Send Score To Your Email"
              })]
            })]
          }), (0, sa.jsx)("div", {
            className: "ss-center",
            children: (0, sa.jsx)("button", {
              className: "ss-link",
              onClick: () => {
                a(1), t(null), i({}), s("");
              },
              children: "Start over"
            })
          })]
        })]
      })]
    })
  });
}