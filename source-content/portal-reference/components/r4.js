r4 = function () {
  const e = Pe(),
    a = new URLSearchParams(e.search),
    n = be(),
    t = localStorage.getItem("token"),
    {
      alertSuccess: o,
      alertError: i
    } = Uu(),
    [l, s] = (0, r.useState)(""),
    [u, d] = (0, r.useState)(!1),
    [c, A] = (0, r.useState)(null),
    [S, h] = (0, r.useState)(!1),
    [C, m] = (0, r.useState)(0),
    R = a.get("slotStart"),
    f = a.get("slotEnd");
  return (0, r.useEffect)(() => {
    const e = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
      a = decodeURIComponent(atob(e).split("").map(e => "%".concat(("00" + e.charCodeAt(0).toString(16)).slice(-2))).join(""));
    (async e => {
      try {
        const a = await fu("api/users/get-user-data/".concat(e.userId));
        if (a.success) {
          const r = ei(a.data);
          A(r), s(r.email), m(e.userId);
        } else i("Error Fetching User Data");
      } catch (a) {
        i("Error -> ", a);
      }
    })(JSON.parse(a));
  }, []), (0, sa.jsxs)("div", {
    className: "booking-app",
    children: [t ? (0, sa.jsx)(ai, {}) : (0, sa.jsx)(ca, {}), (0, sa.jsx)("div", {
      className: "confirmation-hero",
      children: (0, sa.jsxs)("div", {
        className: "hero-content",
        children: [(0, sa.jsx)("h1", {
          children: "Complete Your Booking"
        }), (0, sa.jsx)("p", {
          children: "One last step to secure your appointment"
        })]
      })
    }), (0, sa.jsxs)("div", {
      className: "confirmation-container",
      children: [(0, sa.jsxs)("div", {
        className: "confirmation-card",
        children: [(0, sa.jsx)("div", {
          className: "card-decoration"
        }), (0, sa.jsxs)("div", {
          className: "card-header",
          children: [(0, sa.jsx)("div", {
            className: "emoji-circle",
            children: "\ud83d\udcc5"
          }), (0, sa.jsx)("h2", {
            children: "Confirm Your Appointment"
          }), (0, sa.jsxs)("div", {
            className: "time-display",
            children: [(0, sa.jsx)("div", {
              className: "time-badge",
              children: new Date(R).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })
            }), (0, sa.jsx)("div", {
              className: "date-display",
              children: new Date(R).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric"
              })
            })]
          })]
        }), (0, sa.jsxs)("form", {
          onSubmit: async e => {
            if (e.preventDefault(), !l) return void i("Please provide an attendee's email and select a slot.");
            d(!0);
            const a = {
              userId: C,
              attendeeEmail: l,
              slotStart: R,
              slotEnd: f
            };
            if (t) try {
              const e = await pu("/api/appointment/book-slot", a);
              e.message ? (o(e.message), s(""), n("/app/confirm-booking?id=".concat(e.body.id))) : (i("Error booking the slot."), n("/app/available-slots"));
            } catch (r) {
              i("Failed to send data to the server.");
            } finally {
              d(!1);
            } else i("Please Login To Get a Slot"), n("/");
          },
          className: "booking-form",
          children: [(0, sa.jsxs)("div", {
            className: "names_wrapper",
            children: [(0, sa.jsxs)("div", {
              className: "inputs-group",
              children: [(0, sa.jsx)("label", {
                className: "input-label",
                children: "Your First Name"
              }), (0, sa.jsx)("div", {
                className: "input-wrapper",
                children: (0, sa.jsx)("input", {
                  type: "text",
                  value: null === c || void 0 === c ? void 0 : c.firstName,
                  placeholder: "First Name",
                  className: "input-field",
                  disabled: !0
                })
              })]
            }), (0, sa.jsxs)("div", {
              className: "inputs-group",
              children: [(0, sa.jsx)("label", {
                className: "input-label",
                children: "Your Last Name"
              }), (0, sa.jsx)("div", {
                className: "input-wrapper",
                children: (0, sa.jsx)("input", {
                  type: "text",
                  value: null === c || void 0 === c ? void 0 : c.lastName,
                  placeholder: "Last Name",
                  className: "input-field",
                  disabled: !0
                })
              })]
            })]
          }), (0, sa.jsxs)("div", {
            className: "inputs-group",
            children: [(0, sa.jsx)("label", {
              className: "input-label",
              children: "Your Email Address"
            }), (0, sa.jsxs)("div", {
              className: "input-wrapper",
              children: [(0, sa.jsx)("input", {
                type: "email",
                value: l,
                onChange: e => s(e.target.value),
                required: !0,
                placeholder: "example@email.com",
                className: "input-field",
                disabled: !S
              }), (0, sa.jsx)(a4, {
                className: "edit-icon",
                onClick: () => {
                  h(!0);
                }
              })]
            }), (0, sa.jsx)("div", {
              className: "input-note",
              children: "We'll send confirmation details here"
            })]
          }), (0, sa.jsx)("button", {
            type: "submit",
            className: "submit-button ".concat(u ? "loading" : ""),
            disabled: u,
            children: u ? (0, sa.jsxs)(sa.Fragment, {
              children: [(0, sa.jsx)("span", {
                className: "spinner"
              }), "Processing..."]
            }) : (0, sa.jsxs)(sa.Fragment, {
              children: ["Confirm Booking", (0, sa.jsx)("svg", {
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
            })
          })]
        }), (0, sa.jsx)("div", {
          className: "confirmation-assurance",
          children: (0, sa.jsxs)("div", {
            className: "assurance-item",
            children: [(0, sa.jsx)("div", {
              className: "assurance-icon",
              children: "\ud83d\udd12"
            }), (0, sa.jsx)("div", {
              className: "assurance-text",
              children: "Secure booking process"
            })]
          })
        })]
      }), (0, sa.jsxs)("div", {
        className: "confirmation-sidebar",
        children: [(0, sa.jsxs)("div", {
          className: "sidebar-card",
          children: [(0, sa.jsx)("h3", {
            children: "What to Expect"
          }), (0, sa.jsxs)("ul", {
            className: "expectation-list",
            children: [(0, sa.jsxs)("li", {
              children: [(0, sa.jsx)("div", {
                className: "expectation-icon",
                children: "\ud83d\udce7"
              }), (0, sa.jsx)("div", {
                className: "expectation-text",
                children: "Instant confirmation email"
              })]
            }), (0, sa.jsxs)("li", {
              children: [(0, sa.jsx)("div", {
                className: "expectation-icon",
                children: "\u23f0"
              }), (0, sa.jsx)("div", {
                className: "expectation-text",
                children: "Reminder 24 hours before"
              })]
            }), (0, sa.jsxs)("li", {
              children: [(0, sa.jsx)("div", {
                className: "expectation-icon",
                children: "\ud83d\udc69\u200d\u2695\ufe0f"
              }), (0, sa.jsx)("div", {
                className: "expectation-text",
                children: "Video consultation link"
              })]
            })]
          })]
        }), (0, sa.jsxs)("div", {
          className: "testimonial-card",
          children: [(0, sa.jsx)("div", {
            className: "testimonial-quote",
            children: '"The booking process was seamless and the doctor was incredibly knowledgeable."'
          }), (0, sa.jsx)("div", {
            className: "testimonial-author",
            children: "- Sarah J."
          })]
        })]
      })]
    }), (0, sa.jsx)(Aa, {})]
  });
}