EY = function () {
  const [e, a] = (0, r.useState)(1),
    [n, t] = (0, r.useState)(0),
    [o, i] = (0, r.useState)(""),
    [l, s] = (0, r.useState)(""),
    {
      alertSuccess: u,
      alertError: d
    } = Uu(),
    [c, A] = (0, r.useState)([]),
    S = localStorage.getItem("token");
  let h = null;
  if (S) try {
    const e = JSON.parse(atob(S.split(".")[1]));
    h = e.role;
  } catch (f) {
    console.error("Failed to decode token:", f);
  }
  const C = (0, r.useState)({
      kitId: "J9H6O9V",
      dob_day: 14,
      dob_year: 1974,
      dob_month: 6
    }),
    m = ko({
      initialValues: C,
      validationSchema: Rl,
      onSubmit: async e => {
        const a = e.dob_year + "-" + e.dob_month + "-" + e.dob_day;
        e.dob = a, delete e.dob_year, delete e.dob_month, delete e.dob_day;
        const r = qo(e);
        try {
          const e = await pu("/api/zrt/kit/retrieve", r);
          null !== e && void 0 !== e && e.success ? (c.push(null === e || void 0 === e ? void 0 : e.data), A(c), u(null === e || void 0 === e ? void 0 : e.message)) : m.setValues({
            ...C
          });
        } catch (f) {
          d("Error submitting data ");
        }
      }
    }),
    R = async e => {
      try {
        var r, t;
        let i = await fu("/api/zrt/kits?page=" + n + "&limit=10&search=" + btoa(Qo(o)) + "&reportStatus=" + Qo(void 0 !== e ? e.reportStatus : ""));
        A(null === i || void 0 === i || null === (r = i.data) || void 0 === r ? void 0 : r.data), a(null === i || void 0 === i || null === (t = i.data) || void 0 === t ? void 0 : t.totalPages);
      } catch (f) {
        d("Error Fetching Kits Data");
      }
    };
  return (0, r.useEffect)(() => {
    R();
  }, []), (0, sa.jsx)(sa.Fragment, {
    children: (0, sa.jsxs)(bY, {
      children: [(0, sa.jsx)("div", {
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
                  children: "All Results"
                })
              }), (0, sa.jsx)("div", {
                className: "right_part",
                children: (0, sa.jsxs)("div", {
                  className: "right_part_inner",
                  children: [(0, sa.jsxs)(Tg, {
                    sx: {
                      m: 1,
                      minWidth: 120
                    },
                    size: "small",
                    children: [(0, sa.jsx)(Pg, {
                      id: "demo-simple-select-label",
                      children: "Report Status"
                    }), (0, sa.jsxs)(oM, {
                      labelId: "demo-simple-select-label",
                      id: "demo-simple-select",
                      value: l,
                      label: "Report Status",
                      onChange: e => {
                        i(""), s(e.target.value), R({
                          reportStatus: e.target.value
                        });
                      },
                      children: [(0, sa.jsx)(PY, {
                        value: "All",
                        children: "All"
                      }), (0, sa.jsx)(PY, {
                        value: "Ready",
                        children: "Ready"
                      }), (0, sa.jsx)(PY, {
                        value: "Not Ready",
                        children: "Not Ready"
                      })]
                    })]
                  }), (0, sa.jsx)("div", {
                    className: "search_bar",
                    children: (0, sa.jsxs)("div", {
                      className: "input-group",
                      children: [(0, sa.jsx)("input", {
                        type: "search",
                        value: o,
                        onInput: e => i(e.target.value),
                        className: "form-control",
                        placeholder: "Search by KitId",
                        "aria-label": "Search"
                      }), (0, sa.jsx)("button", {
                        className: "btn search-btn",
                        onClick: function (e) {
                          R();
                        },
                        children: (0, sa.jsx)(SY, {
                          size: 20
                        })
                      })]
                    })
                  })]
                })
              })]
            }), (0, sa.jsx)("div", {
              class: "bottom_bar",
              children: (0, sa.jsx)("div", {
                class: "table_wrapper dashboard",
                children: (0, sa.jsx)("div", {
                  class: "table_inner",
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
                            children: "Kit"
                          }), (0, sa.jsx)(ov, {
                            align: "right",
                            children: "Patient Name"
                          }), (0, sa.jsx)(ov, {
                            align: "right",
                            children: "Sample Received"
                          }), (0, sa.jsx)(ov, {
                            children: "Report Status"
                          }), (0, sa.jsx)(ov, {
                            align: "right",
                            children: "Report Date"
                          }), (0, sa.jsx)(ov, {
                            align: "right",
                            children: "Action"
                          })]
                        })
                      }), (0, sa.jsxs)($T, {
                        children: [c && (null === c || void 0 === c ? void 0 : c.map(e => (0, sa.jsxs)(yv, {
                          sx: {
                            "&:last-child td, &:last-child th": {
                              border: 0
                            }
                          },
                          children: [(0, sa.jsxs)(ov, {
                            align: "right",
                            children: [(0, sa.jsx)("span", {
                              className: "mob_head",
                              children: "Kit"
                            }), e.kitId]
                          }), (0, sa.jsxs)(ov, {
                            align: "right",
                            children: [(0, sa.jsx)("span", {
                              className: "mob_head",
                              children: "Patient Name"
                            }), $o(e.User.firstName), " ", $o(e.User.lastName)]
                          }), (0, sa.jsxs)(ov, {
                            align: "right",
                            children: [" ", (0, sa.jsx)("span", {
                              className: "mob_head",
                              children: "Sample Received"
                            }), $o(e.samplesReceived)]
                          }), (0, sa.jsxs)(ov, {
                            align: "right",
                            children: [" ", (0, sa.jsx)("span", {
                              className: "mob_head",
                              children: "Report Status"
                            }), " ", e.status, " "]
                          }), (0, sa.jsxs)(ov, {
                            align: "right",
                            children: [(0, sa.jsx)("span", {
                              className: "mob_head",
                              children: "Report Date"
                            }), $o(e.ReportDate)]
                          }), (0, sa.jsxs)(ov, {
                            align: "right",
                            children: [(0, sa.jsx)("span", {
                              className: "mob_head",
                              children: "Action"
                            }), "Ready" === e.status ? (0, sa.jsxs)("div", {
                              className: "icon_group",
                              children: [(0, sa.jsx)(ra, {
                                className: "action_link",
                                to: (1 === h || 3 === h ? "/app/patient-report/" : "/app/report/") + btoa(Qo(e.kitId)),
                                children: "View Reports"
                              }), (0, sa.jsx)(ra, {
                                className: "action_link",
                                onClick: () => (async e => {
                                  try {
                                    let a = await bu("/api/zrt/result/pdf/" + Qo(e));
                                    const r = new Blob([a.data], {
                                        type: "application/pdf"
                                      }),
                                      n = URL.createObjectURL(r);
                                    let t = document.createElement("a");
                                    t.href = n, t.download = e + "-results.pdf", t.click();
                                  } catch (f) {
                                    d("Error downloading the PDF");
                                  }
                                })(e.kitId),
                                children: "Download"
                              })]
                            }) : (0, sa.jsx)("div", {
                              className: "icon_group"
                            })]
                          })]
                        }, c.kitId))), 0 === (null === c || void 0 === c ? void 0 : c.length) ? (0, sa.jsx)(yv, {
                          sx: {
                            "&:last-child td, &:last-child th": {
                              border: 0
                            }
                          },
                          children: (0, sa.jsx)(ov, {
                            colSpan: 6,
                            children: (0, sa.jsx)("div", {
                              className: " notice",
                              children: (0, sa.jsx)("div", {
                                className: "alert",
                                children: (0, sa.jsx)("span", {
                                  className: "alertText",
                                  children: "No Records Found, add kit using the Add Kit button"
                                })
                              })
                            })
                          })
                        }) : ""]
                      })]
                    })
                  })
                })
              })
            })]
          })
        })
      }), (0, sa.jsx)(Q_(), {
        breakLabel: "...",
        nextLabel: "next >",
        onPageChange: e => {
          const a = e.selected;
          t(a), R();
        },
        pageRangeDisplayed: 5,
        pageCount: e,
        previousLabel: "< previous",
        renderOnZeroPageCount: null,
        marginPagesDisplayed: 2,
        containerClassName: "pagination justify-content-center",
        pageClassName: "page-item",
        pageLinkClassName: "page-link",
        previousClassName: "page-item",
        previousLinkClassName: "page-link",
        nextClassName: "page-item",
        nextLinkClassName: "page-link",
        activeClassName: "active"
      })]
    })
  });
}