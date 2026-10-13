$3 = function () {
  const e = localStorage.getItem("token"),
    [a, n] = (0, r.useState)([]),
    [t, o] = (0, r.useState)(!0),
    {
      alertError: i
    } = Uu();
  (0, r.useEffect)(() => {
    const a = e.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
      r = decodeURIComponent(atob(a).split("").map(e => "%".concat(("00" + e.charCodeAt(0).toString(16)).slice(-2))).join(""));
    (async e => {
      try {
        const a = (await fu("api/booking/get-user-bookings/".concat(e.userId))).sort((e, a) => new Date(a.createdAt) - new Date(e.createdAt));
        n(a), o(!1);
      } catch (a) {
        i("Error Fetching Booking Data");
      }
    })(JSON.parse(r));
  }, []);
  const l = be(),
    s = e => {
      e ? (localStorage.setItem("productURL", "/app/appointment-scheduling"), l("/app/medical-history")) : (localStorage.setItem("productURL", "/app/appointment-scheduling"), l("/register"));
    };
  return (0, sa.jsxs)("div", {
    className: "appointment-page",
    children: [e ? (0, sa.jsx)(ai, {}) : (0, sa.jsx)(ca, {}), t ? (0, sa.jsx)(sa.Fragment, {
      children: (0, sa.jsx)("div", {
        className: "loader-overlay",
        children: (0, sa.jsx)("div", {
          className: "loader"
        })
      })
    }) : (0, sa.jsx)(sa.Fragment, {
      children: a && 0 !== a.length ? (0, sa.jsx)("div", {
        className: "main_content",
        children: (0, sa.jsx)("div", {
          className: "container",
          children: (0, sa.jsxs)("div", {
            className: "main_block",
            children: [(0, sa.jsxs)("div", {
              className: "top_bar",
              children: [(0, sa.jsx)("div", {
                className: "left_part",
                children: (0, sa.jsx)("div", {
                  className: "main_title",
                  children: "Scheduled Appointments"
                })
              }), (0, sa.jsx)("div", {
                className: "right_part",
                children: (0, sa.jsx)("div", {
                  className: "right_part_inner",
                  children: (0, sa.jsx)("button", {
                    onClick: () => s(e),
                    className: "btn btn-primary add_kit",
                    children: "Schedule Appointments"
                  })
                })
              })]
            }), (0, sa.jsx)("div", {
              className: "table_wrapper dashboard",
              children: (0, sa.jsx)("div", {
                className: "table_inner",
                children: (0, sa.jsx)(uv, {
                  component: Kh,
                  children: (0, sa.jsxs)(jT, {
                    sx: {
                      minWidth: 650
                    },
                    "aria-label": "simple table",
                    children: [(0, sa.jsx)(Cv, {
                      children: (0, sa.jsxs)(yv, {
                        children: [(0, sa.jsx)(ov, {
                          align: "right",
                          children: "Email"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Meeting Date"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Meeting Time"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Status"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Meeting Link"
                        })]
                      })
                    }), (0, sa.jsx)($T, {
                      children: a && a.map(e => (0, sa.jsxs)(yv, {
                        sx: {
                          "&:last-child td, &:last-child th": {
                            border: 0
                          }
                        },
                        children: [(0, sa.jsxs)(ov, {
                          align: "right",
                          children: [(0, sa.jsx)("span", {
                            className: "mob_head",
                            children: "Email"
                          }), null === e || void 0 === e ? void 0 : e.attendeeEmail]
                        }), (0, sa.jsxs)(ov, {
                          align: "right",
                          children: [(0, sa.jsx)("span", {
                            className: "mob_head",
                            children: "Meeting Date"
                          }), new Date(null === e || void 0 === e ? void 0 : e.meetingStartSlot).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric"
                          })]
                        }), (0, sa.jsxs)(ov, {
                          align: "right",
                          children: [(0, sa.jsx)("span", {
                            className: "mob_head",
                            children: "Meeting Time"
                          }), new Date(null === e || void 0 === e ? void 0 : e.meetingStartSlot).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })]
                        }), (0, sa.jsxs)(ov, {
                          align: "right",
                          children: [(0, sa.jsx)("span", {
                            className: "mob_head",
                            children: "Status"
                          }), (0, sa.jsx)("span", {
                            style: {
                              display: "inline-block",
                              padding: "5px 10px",
                              borderRadius: "5px",
                              backgroundColor: "Pending" === (null === e || void 0 === e ? void 0 : e.Status) ? "#fc7f03" : "Done" === (null === e || void 0 === e ? void 0 : e.Status) ? "green" : "Expired" === (null === e || void 0 === e ? void 0 : e.Status) ? "red" : null,
                              color: "white"
                            },
                            children: null === e || void 0 === e ? void 0 : e.Status
                          })]
                        }), (0, sa.jsxs)(ov, {
                          align: "right",
                          children: [(0, sa.jsx)("span", {
                            className: "mob_head",
                            children: "Action"
                          }), (0, sa.jsx)("button", {
                            disabled: "Pending" !== e.Status,
                            onClick: () => {
                              "Pending" === e.Status && window.open(null === e || void 0 === e ? void 0 : e.meetingLink, "_blank");
                            },
                            style: {
                              cursor: "Pending" === e.Status ? "pointer" : "not-allowed",
                              opacity: "Pending" === e.Status ? 1 : .6,
                              padding: "8px 16px",
                              border: "none",
                              backgroundColor: "#007bff",
                              color: "#fff",
                              borderRadius: "4px"
                            },
                            children: "Meeting Link"
                          })]
                        })]
                      }, null === e || void 0 === e ? void 0 : e.id))
                    })]
                  })
                })
              })
            })]
          })
        })
      }) : (0, sa.jsxs)(sa.Fragment, {
        children: [(0, sa.jsxs)("div", {
          className: "modern-hero",
          children: [(0, sa.jsxs)("div", {
            className: "hero-content",
            children: [(0, sa.jsxs)("div", {
              className: "text-content",
              children: [(0, sa.jsx)("div", {
                className: "tagline",
                children: "Advanced Weight Solution"
              }), (0, sa.jsxs)("h1", {
                children: [(0, sa.jsx)("span", {
                  className: "gradient-text",
                  children: "GLP-1"
                }), " Therapy", (0, sa.jsx)("br", {}), "Redefined"]
              }), (0, sa.jsx)("p", {
                className: "subhead",
                children: "Clinically-formulated medications tailored to your metabolic needs"
              }), (0, sa.jsxs)("div", {
                className: "pricing-highlight",
                children: [(0, sa.jsxs)("div", {
                  className: "price",
                  children: [(0, sa.jsx)("span", {
                    className: "old-price",
                    children: "$247"
                  }), (0, sa.jsx)("span", {
                    className: "new-price",
                    children: "$197"
                  })]
                }), (0, sa.jsx)("div", {
                  className: "price-label",
                  children: "First month treatment"
                })]
              }), (0, sa.jsxs)("button", {
                onClick: () => s(e),
                className: "modern-cta",
                children: ["Begin Your Transformation", (0, sa.jsx)("svg", {
                  width: "20",
                  height: "20",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  children: (0, sa.jsx)("path", {
                    d: "M5 12H19M19 12L12 5M19 12L12 19",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                  })
                })]
              })]
            }), (0, sa.jsx)("div", {
              className: "visual-content",
              children: (0, sa.jsx)("div", {
                className: "image-wrapper",
                children: (0, sa.jsx)("img", {
                  src: "https://cdn.prod.website-files.com/632a33dda7f9eab7436897cc/66284ef321317aa1e648fbc2_anti%20(1).webp",
                  alt: "Happy patient achieving health goals"
                })
              })
            })]
          }), (0, sa.jsxs)("div", {
            className: "benefits-bar",
            children: [(0, sa.jsxs)("div", {
              className: "benefit",
              children: [(0, sa.jsx)("div", {
                className: "icon",
                children: "\ud83c\udfc6"
              }), (0, sa.jsx)("div", {
                className: "text",
                children: "FDA-Approved"
              })]
            }), (0, sa.jsxs)("div", {
              className: "benefit",
              children: [(0, sa.jsx)("div", {
                className: "icon",
                children: "\ud83d\udc69\u200d\u2695\ufe0f"
              }), (0, sa.jsx)("div", {
                className: "text",
                children: "Medical Supervision"
              })]
            }), (0, sa.jsxs)("div", {
              className: "benefit",
              children: [(0, sa.jsx)("div", {
                className: "icon",
                children: "\ud83d\udce6"
              }), (0, sa.jsx)("div", {
                className: "text",
                children: "Discreet Shipping"
              })]
            }), (0, sa.jsxs)("div", {
              className: "benefit",
              children: [(0, sa.jsx)("div", {
                className: "icon",
                children: "\ud83d\udcb3"
              }), (0, sa.jsx)("div", {
                className: "text",
                children: "No Insurance Needed"
              })]
            })]
          })]
        }), (0, sa.jsxs)("div", {
          className: "process-section",
          children: [(0, sa.jsx)("h2", {
            children: "Simple 3-Step Process"
          }), (0, sa.jsxs)("div", {
            className: "steps",
            children: [(0, sa.jsxs)("div", {
              className: "step",
              children: [(0, sa.jsx)("div", {
                className: "step-number",
                children: "1"
              }), (0, sa.jsx)("h3", {
                children: "Online Assessment"
              }), (0, sa.jsx)("p", {
                children: "Complete our brief health questionnaire"
              })]
            }), (0, sa.jsxs)("div", {
              className: "step",
              children: [(0, sa.jsx)("div", {
                className: "step-number",
                children: "2"
              }), (0, sa.jsx)("h3", {
                children: "Provider Review"
              }), (0, sa.jsx)("p", {
                children: "Our medical team evaluates your case"
              })]
            }), (0, sa.jsxs)("div", {
              className: "step",
              children: [(0, sa.jsx)("div", {
                className: "step-number",
                children: "3"
              }), (0, sa.jsx)("h3", {
                children: "Medication Delivery"
              }), (0, sa.jsx)("p", {
                children: "Receive treatment at your doorstep"
              })]
            })]
          })]
        }), (0, sa.jsxs)("div", {
          className: "included-section",
          children: [(0, sa.jsx)("h2", {
            children: "Your Program Includes"
          }), (0, sa.jsxs)("div", {
            className: "inclusions",
            children: [(0, sa.jsxs)("div", {
              className: "inclusion-card",
              children: [(0, sa.jsx)("div", {
                className: "icon",
                children: "\ud83d\udc8a"
              }), (0, sa.jsx)("h3", {
                children: "Monthly Medication"
              }), (0, sa.jsx)("p", {
                children: "Precise dosing for optimal results"
              })]
            }), (0, sa.jsxs)("div", {
              className: "inclusion-card",
              children: [(0, sa.jsx)("div", {
                className: "icon",
                children: "\ud83d\udcf1"
              }), (0, sa.jsx)("h3", {
                children: "Digital Tools"
              }), (0, sa.jsx)("p", {
                children: "Progress tracking and support"
              })]
            }), (0, sa.jsxs)("div", {
              className: "inclusion-card",
              children: [(0, sa.jsx)("div", {
                className: "icon",
                children: "\ud83d\udc68\u200d\u2695\ufe0f"
              }), (0, sa.jsx)("h3", {
                children: "Provider Access"
              }), (0, sa.jsx)("p", {
                children: "Ongoing medical supervision"
              })]
            })]
          })]
        })]
      })
    }), (0, sa.jsx)(Aa, {})]
  });
}