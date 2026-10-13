e4 = function () {
  const [e, a] = (0, r.useState)([]),
    [n, t] = (0, r.useState)(null),
    [o, i] = (0, r.useState)([]),
    [l, s] = (0, r.useState)(!1),
    [u, d] = (0, r.useState)(null),
    {
      alertError: c
    } = Uu(),
    A = be(),
    S = localStorage.getItem("token");
  return (0, r.useEffect)(() => {
    (async () => {
      s(!0);
      try {
        const e = await fu("/api/appointment/available-times");
        null !== e && void 0 !== e && e.availableSlots && (a(e.availableSlots), e.availableSlots.length > 0 && (t(e.availableSlots[0].date), i(e.availableSlots[0].slots)));
      } catch (e) {
        c("Error fetching slots.");
      } finally {
        s(!1);
      }
    })();
  }, []), (0, sa.jsxs)("div", {
    className: "booking-app",
    children: [S ? (0, sa.jsx)(ai, {}) : (0, sa.jsx)(ca, {}), (0, sa.jsx)("div", {
      className: "booking-hero",
      children: (0, sa.jsxs)("div", {
        className: "hero-content",
        children: [(0, sa.jsx)("h1", {
          children: "Schedule Your Consultation"
        }), (0, sa.jsx)("p", {
          children: "Select an available time that works best for you"
        })]
      })
    }), (0, sa.jsxs)("div", {
      className: "booking-container",
      children: [(0, sa.jsxs)("div", {
        className: "booking-info",
        children: [(0, sa.jsxs)("div", {
          className: "info-card",
          children: [(0, sa.jsx)("h3", {
            children: "What to expect"
          }), (0, sa.jsxs)("ul", {
            children: [(0, sa.jsxs)("li", {
              children: [(0, sa.jsx)("div", {
                className: "icon",
                children: "\u23f1\ufe0f"
              }), (0, sa.jsx)("div", {
                className: "text",
                children: "15-minute video consultation"
              })]
            }), (0, sa.jsxs)("li", {
              children: [(0, sa.jsx)("div", {
                className: "icon",
                children: "\ud83d\udc69\u200d\u2695\ufe0f"
              }), (0, sa.jsx)("div", {
                className: "text",
                children: "Board-certified providers"
              })]
            }), (0, sa.jsxs)("li", {
              children: [(0, sa.jsx)("div", {
                className: "icon",
                children: "\ud83d\udc8a"
              }), (0, sa.jsx)("div", {
                className: "text",
                children: "Personalized treatment plan"
              })]
            })]
          })]
        }), (0, sa.jsxs)("div", {
          className: "testimonial-card",
          children: [(0, sa.jsx)("div", {
            className: "quote",
            children: '"The consultation was professional and the treatment has been life-changing."'
          }), (0, sa.jsx)("div", {
            className: "author",
            children: "- Sarah M."
          })]
        })]
      }), (0, sa.jsxs)("div", {
        className: "booking-card",
        children: [(0, sa.jsxs)("div", {
          className: "booking-header",
          children: [(0, sa.jsx)("div", {
            className: "step-indicator active",
            children: "1"
          }), (0, sa.jsx)("h2", {
            children: "Select Date & Time"
          })]
        }), l ? (0, sa.jsxs)("div", {
          className: "loading-state",
          children: [(0, sa.jsx)("div", {
            className: "spinner"
          }), (0, sa.jsx)("p", {
            children: "Loading available slots..."
          })]
        }) : (0, sa.jsxs)(sa.Fragment, {
          children: [(0, sa.jsxs)("div", {
            className: "date-picker",
            children: [(0, sa.jsx)("h3", {
              children: "Available Dates"
            }), (0, sa.jsx)("div", {
              className: "date-scroller",
              children: e.map(a => {
                let {
                  date: r,
                  slots: o
                } = a;
                const l = new Date(r).toLocaleDateString("en-US", {
                    weekday: "short"
                  }),
                  s = new Date(r).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                  });
                return (0, sa.jsxs)("button", {
                  className: "date-card ".concat(r === n ? "active" : ""),
                  onClick: () => (a => {
                    t(a), d(null);
                    const r = e.find(e => e.date === a);
                    i(r ? r.slots : []);
                  })(r),
                  children: [(0, sa.jsx)("span", {
                    className: "day",
                    children: l
                  }), (0, sa.jsx)("span", {
                    className: "date",
                    children: s
                  }), (0, sa.jsxs)("span", {
                    className: "slots-available",
                    children: [o.length, " slots"]
                  })]
                }, r);
              })
            })]
          }), (0, sa.jsxs)("div", {
            className: "time-picker",
            children: [(0, sa.jsx)("h3", {
              children: "Available Times"
            }), o.length > 0 ? (0, sa.jsx)("div", {
              className: "time-grid",
              children: o.map((e, a) => (0, sa.jsx)("button", {
                className: "time-slot ".concat(u === e ? "selected" : ""),
                onClick: () => (e => {
                  d(e);
                })(e),
                children: new Date(e.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              }, a))
            }) : (0, sa.jsx)("div", {
              className: "no-slots",
              children: (0, sa.jsx)("p", {
                children: "No available time slots for this date"
              })
            })]
          }), (0, sa.jsxs)("button", {
            className: "continue-btn",
            onClick: () => {
              A("/app/booking-page?slotStart=".concat(u.startTime, "&slotEnd=").concat(u.endTime));
            },
            disabled: !u,
            children: ["Confirm Appointment", (0, sa.jsx)("svg", {
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              children: (0, sa.jsx)("path", {
                d: "M5 12H19M19 12L12 5M19 12L12 19",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round"
              })
            })]
          })]
        })]
      })]
    }), (0, sa.jsx)(Aa, {})]
  });
}