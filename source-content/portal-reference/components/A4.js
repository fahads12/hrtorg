A4 = function () {
  var e;
  const a = localStorage.getItem("token"),
    [n] = la(),
    t = n.get("id"),
    [o, i] = (0, r.useState)(null);
  return (0, r.useEffect)(() => {
    (async e => {
      try {
        const a = await fu("api/booking/get-booking-detail/".concat(e));
        i(a);
      } catch (a) {
        console.error("ERROR -> ", a);
      }
    })(t);
  }, []), (0, sa.jsxs)("div", {
    className: "confirmation-app",
    children: [a ? (0, sa.jsx)(ai, {}) : (0, sa.jsx)(ca, {}), (0, sa.jsx)("div", {
      className: "confirmation-hero",
      children: (0, sa.jsxs)("div", {
        className: "hero-content",
        children: [(0, sa.jsx)("h1", {
          children: "Your Appointment is Confirmed!"
        }), (0, sa.jsx)("p", {
          children: "We're looking forward to seeing you"
        })]
      })
    }), (0, sa.jsxs)("div", {
      className: "confirmation-container",
      children: [(0, sa.jsxs)("div", {
        className: "confirmation-card",
        children: [(0, sa.jsx)("div", {
          className: "confetti"
        }), (0, sa.jsx)("div", {
          className: "checkmark",
          children: "\u2713"
        }), (0, sa.jsxs)("h2", {
          children: ["Thank You ", null === o || void 0 === o || null === (e = o.user) || void 0 === e ? void 0 : e.firstName, " for Booking"]
        }), (0, sa.jsxs)("p", {
          className: "appointment-details",
          children: ["Your consultation is scheduled for", (0, sa.jsx)("br", {}), (0, sa.jsxs)("strong", {
            children: [new Date(null === o || void 0 === o ? void 0 : o.meetingStartSlot).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            }), " ", "at", " ", new Date(null === o || void 0 === o ? void 0 : o.meetingStartSlot).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })]
          })]
        }), (0, sa.jsxs)("div", {
          className: "confirmation-actions",
          children: [(0, sa.jsxs)("a", {
            href: "/app/home",
            className: "action-btn primary",
            children: [(0, sa.jsxs)("svg", {
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              children: [(0, sa.jsx)("path", {
                d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z",
                stroke: "currentColor",
                strokeWidth: "2"
              }), (0, sa.jsx)("path", {
                d: "M9 22V12h6v10",
                stroke: "currentColor",
                strokeWidth: "2"
              })]
            }), "Go To Home"]
          }), (0, sa.jsxs)("a", {
            href: "/app/appointment-scheduling",
            className: "action-btn tertiary",
            children: [(0, sa.jsx)("svg", {
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              children: (0, sa.jsx)("path", {
                d: "M3 10h18M7 15h1m4 0h1m4 0h1M3 19h18a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v10a2 2 0 002 2z",
                stroke: "currentColor",
                strokeWidth: "2"
              })
            }), "Schedule Another Meeting"]
          })]
        }), (0, sa.jsx)("div", {
          className: "confirmation-info",
          children: (0, sa.jsxs)("div", {
            className: "info-item",
            children: [(0, sa.jsx)("div", {
              className: "info-icon",
              children: "\ud83d\udce7"
            }), (0, sa.jsxs)("div", {
              children: [(0, sa.jsx)("h4", {
                children: "Confirmation Sent"
              }), (0, sa.jsxs)("p", {
                children: ["We've emailed details to ", null === o || void 0 === o ? void 0 : o.attendeeEmail]
              })]
            })]
          })
        })]
      }), (0, sa.jsxs)("div", {
        className: "next-steps",
        children: [(0, sa.jsx)("h3", {
          children: "What to Do Next"
        }), (0, sa.jsxs)("ul", {
          children: [(0, sa.jsx)("li", {
            children: "Check your email for Invitation"
          }), (0, sa.jsx)("li", {
            children: "Accept the Invitation"
          }), (0, sa.jsx)("li", {
            children: "Add the appointment to your calendar"
          }), (0, sa.jsx)("li", {
            children: "Prepare any questions for your provider"
          })]
        }), (0, sa.jsxs)("div", {
          className: "testimonial",
          children: [(0, sa.jsx)("div", {
            className: "author",
            children: "- Important"
          }), (0, sa.jsx)("p", {
            children: '"You will receive an email shortly with Invitation and Meet Link. Please Accept the Invitation so that your booking got confirmed"'
          })]
        })]
      })]
    }), (0, sa.jsx)(Aa, {})]
  });
}