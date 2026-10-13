n4 = function () {
  const e = localStorage.getItem("token");
  return (0, sa.jsxs)(sa.Fragment, {
    children: [(0, sa.jsx)(ai, {}), (0, sa.jsx)("div", {
      className: "hrt-portal",
      children: (0, sa.jsxs)("div", {
        className: "portal-container",
        children: [(0, sa.jsxs)("div", {
          className: "hero-section",
          children: [(0, sa.jsxs)("div", {
            className: "hero-content",
            children: [(0, sa.jsx)("h1", {
              children: "Welcome to Your HRT Portal"
            }), (0, sa.jsx)("p", {
              className: "subtitle",
              children: "Your secure hub for hormone health insights. Access your lab results, update your symptoms, and explore personalized treatment options\u2014all in one place."
            })]
          }), (0, sa.jsx)("div", {
            className: "hero-image",
            children: (0, sa.jsx)("img", {
              src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
              alt: "Medical professional reviewing charts"
            })
          })]
        }), (0, sa.jsxs)("div", {
          className: "card-row",
          children: [(0, sa.jsxs)("div", {
            className: "main-card",
            children: [(0, sa.jsx)("div", {
              className: "card-icon",
              children: (0, sa.jsx)(CT, {
                size: 24
              })
            }), (0, sa.jsx)("h3", {
              children: "Already Have a Test Kit?"
            }), (0, sa.jsx)("p", {
              children: "Claim your kit to view your lab results once testing is complete."
            }), (0, sa.jsx)(ra, {
              className: "logo",
              to: e ? "/app/lab-results" : "/",
              children: (0, sa.jsxs)("button", {
                className: "action-button",
                children: ["Claim My Kit ", (0, sa.jsx)("span", {
                  className: "arrow",
                  children: "\u2192"
                })]
              })
            }), (0, sa.jsx)("p", {
              className: "note",
              children: "You do not need to submit additional forms if you are only reviewing your test results."
            })]
          }), (0, sa.jsxs)("div", {
            className: "main-card",
            children: [(0, sa.jsx)("div", {
              className: "card-icon",
              children: (0, sa.jsx)(cT, {
                size: 24
              })
            }), (0, sa.jsx)("h3", {
              children: "Interested in Treatment?"
            }), (0, sa.jsx)("p", {
              children: "Complete your medical history for our licensed providers to review."
            }), (0, sa.jsx)(ra, {
              className: "logo",
              to: e ? "/app/medical-history" : "/",
              children: (0, sa.jsxs)("button", {
                className: "action-button",
                children: ["Complete Medical History ", (0, sa.jsx)("span", {
                  className: "arrow",
                  children: "\u2192"
                })]
              })
            }), (0, sa.jsx)("p", {
              className: "note",
              children: "Required for all treatment plans and provider consultations."
            })]
          }), (0, sa.jsxs)("div", {
            className: "main-card",
            children: [(0, sa.jsx)("div", {
              className: "card-icon",
              children: (0, sa.jsx)(uT, {
                size: 24
              })
            }), (0, sa.jsx)("h3", {
              children: "Track Your Symptoms"
            }), (0, sa.jsx)("p", {
              children: "Keep a record of how you're feeling over time."
            }), (0, sa.jsx)(ra, {
              className: "logo",
              to: e ? "/app/tracker-history" : "/",
              children: (0, sa.jsxs)("button", {
                className: "action-button",
                children: ["Update My Symptoms ", (0, sa.jsx)("span", {
                  className: "arrow",
                  children: "\u2192"
                })]
              })
            }), (0, sa.jsx)("p", {
              className: "note",
              children: "Monitor trends and share with your provider for personalized care."
            })]
          })]
        }), (0, sa.jsxs)("div", {
          className: "next-steps",
          children: [(0, sa.jsxs)("div", {
            className: "steps-content",
            children: [(0, sa.jsxs)("div", {
              className: "steps-header",
              children: [(0, sa.jsx)(AT, {
                size: 28
              }), (0, sa.jsx)("h2", {
                children: "What's Next?"
              })]
            }), (0, sa.jsxs)("ul", {
              className: "steps-list",
              children: [(0, sa.jsx)("li", {
                children: "Receive a detailed hormone report"
              }), (0, sa.jsx)("li", {
                children: "Get treatment recommendations (if you opted in)"
              }), (0, sa.jsx)("li", {
                children: "Refill medications and manage follow-ups"
              })]
            })]
          }), (0, sa.jsxs)("div", {
            className: "security-notice",
            children: [(0, sa.jsx)(ST, {
              size: 20
            }), (0, sa.jsx)("p", {
              children: "We follow strict HIPAA compliance standards to protect your health data and privacy."
            })]
          })]
        })]
      })
    }), (0, sa.jsx)(Aa, {})]
  });
}