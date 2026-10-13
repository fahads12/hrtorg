m4 = function () {
  const e = localStorage.getItem("token"),
    a = e.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
    n = decodeURIComponent(atob(a).split("").map(e => "%".concat(("00" + e.charCodeAt(0).toString(16)).slice(-2))).join("")),
    t = JSON.parse(n),
    o = be(),
    {
      alertError: i,
      alertSuccess: l
    } = Uu(),
    [s, u] = (0, r.useState)(!1),
    [d, c] = (0, r.useState)(""),
    [A, S] = (0, r.useState)(null),
    [h, C] = (0, r.useState)([]),
    m = async e => {
      try {
        const a = await fu("api/test/get-users-labTests/".concat(e.userId));
        if (!0 === a.success) {
          const e = a.data.sort((e, a) => new Date(a.createdAt) - new Date(e.createdAt));
          C(e);
        } else i("Error Fetching User Data");
      } catch (a) {
        i("Error -> ", a);
      }
    };
  return (0, r.useEffect)(() => {
    m(t);
  }, []), (0, sa.jsxs)("div", {
    className: "appointment-page",
    children: [e ? (0, sa.jsx)(ai, {}) : (0, sa.jsx)(ca, {}), (0, sa.jsx)("div", {
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
                children: "Lab Tests"
              })
            }), (0, sa.jsx)("div", {
              className: "right_part",
              children: (0, sa.jsx)("div", {
                className: "right_part_inner",
                children: (0, sa.jsx)("button", {
                  onClick: () => (e => {
                    o(e ? "/app/add-new-test" : "/register");
                  })(e),
                  className: "btn btn-primary add_kit",
                  children: "Add New Test"
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
                        children: "Test Name"
                      }), (0, sa.jsx)(ov, {
                        align: "right",
                        children: "Laboratory Name"
                      }), (0, sa.jsx)(ov, {
                        align: "right",
                        children: "Laboratory Location"
                      }), (0, sa.jsx)(ov, {
                        align: "right",
                        children: "Added Date"
                      }), (0, sa.jsx)(ov, {
                        align: "right",
                        children: "Action"
                      })]
                    })
                  }), (0, sa.jsx)($T, {
                    children: h && h.map(e => (0, sa.jsxs)(yv, {
                      sx: {
                        "&:last-child td, &:last-child th": {
                          border: 0
                        }
                      },
                      children: [(0, sa.jsxs)(ov, {
                        align: "right",
                        children: [(0, sa.jsx)("span", {
                          className: "mob_head",
                          children: "Test Name"
                        }), null === e || void 0 === e ? void 0 : e.testName]
                      }), (0, sa.jsxs)(ov, {
                        align: "right",
                        children: [(0, sa.jsx)("span", {
                          className: "mob_head",
                          children: "Laboratory Name"
                        }), null === e || void 0 === e ? void 0 : e.laboratoryName]
                      }), (0, sa.jsxs)(ov, {
                        align: "right",
                        children: [(0, sa.jsx)("span", {
                          className: "mob_head",
                          children: "Laboratory Location"
                        }), null === e || void 0 === e ? void 0 : e.laboratoryLocation]
                      }), (0, sa.jsxs)(ov, {
                        align: "right",
                        children: [(0, sa.jsx)("span", {
                          className: "mob_head",
                          children: "Added Date"
                        }), new Date(null === e || void 0 === e ? void 0 : e.createdAt).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric"
                        })]
                      }), (0, sa.jsxs)(ov, {
                        align: "right",
                        children: [(0, sa.jsx)("span", {
                          className: "mob_head",
                          children: "Action"
                        }), (0, sa.jsxs)("div", {
                          style: {
                            display: "flex",
                            gap: "10px"
                          },
                          children: [(0, sa.jsx)(x1, {
                            onClick: () => {
                              o("/app/test-details/".concat(null === e || void 0 === e ? void 0 : e.id));
                            },
                            size: 30,
                            color: "black",
                            cursor: "pointer"
                          }), (0, sa.jsx)(j1, {
                            onClick: () => {
                              o("/app/edit-test/".concat(null === e || void 0 === e ? void 0 : e.id));
                            },
                            cursor: "pointer",
                            size: 30,
                            color: "black"
                          }), (0, sa.jsx)(z1, {
                            onClick: () => {
                              u(!0), S(null === e || void 0 === e ? void 0 : e.id), c(null === e || void 0 === e ? void 0 : e.testName);
                            },
                            size: 30,
                            color: "red",
                            cursor: "pointer"
                          })]
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
    }), (0, sa.jsx)(Aa, {}), s && (0, sa.jsx)("div", {
      className: "delete-modal-overlay",
      onClick: () => u(!1),
      children: (0, sa.jsxs)("div", {
        className: "delete-modal",
        onClick: e => e.stopPropagation(),
        children: [(0, sa.jsx)("div", {
          className: "delete-modal-header",
          children: (0, sa.jsx)("div", {
            onClick: () => u(!1),
            children: (0, sa.jsx)(h4, {
              cursor: "pointer",
              size: 45,
              color: "red"
            })
          })
        }), (0, sa.jsxs)("div", {
          className: "delete-modal-body",
          children: [(0, sa.jsx)("h2", {
            children: "Delete Test"
          }), (0, sa.jsxs)("p", {
            children: ["Are you sure you want to delete", " ", (0, sa.jsx)("span", {
              style: {
                color: "red"
              },
              children: d
            }), " laboratory test?"]
          }), (0, sa.jsxs)("div", {
            style: {
              display: "flex",
              justifyContent: "space-evenly",
              marginTop: "40px"
            },
            children: [(0, sa.jsx)("button", {
              onClick: () => {
                u(!1);
              },
              children: "No"
            }), (0, sa.jsx)("button", {
              onClick: () => {
                (async e => {
                  try {
                    !0 === (await gu("/api/test/delete-labTest/".concat(e))).success && (l("Test Deleted Successfully"), u(!1), m(t));
                  } catch (a) {
                    i("Error Deleting Data");
                  }
                })(A);
              },
              className: "btn btn-primary add_kit",
              children: "Yes"
            })]
          })]
        })]
      })
    })]
  });
}