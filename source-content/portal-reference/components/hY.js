hY = function () {
  const [e, a] = (0, r.useState)(1),
    [n, t] = (0, r.useState)(0),
    [o, i] = (0, r.useState)(""),
    [l, s] = (0, r.useState)(),
    {
      alertSuccess: u,
      alertError: d
    } = Uu(),
    [c, A] = (0, r.useState)([]),
    [S, h] = (0, r.useState)(!1),
    C = {
      kitId: "",
      dob_day: 14,
      dob_year: 1974,
      dob_month: 6
    },
    [m, R] = (0, r.useState)(!1),
    f = () => {
      s(), R(!1);
    },
    g = ko({
      initialValues: C,
      validationSchema: Rl,
      onSubmit: async e => {
        try {
          const a = e.dob_year + "-" + e.dob_month + "-" + e.dob_day;
          e.dob = a, delete e.dob_year, delete e.dob_month, delete e.dob_day;
          const r = qo(e),
            n = await pu("/api/zrt/kit/retrieve", r);
          null !== n && void 0 !== n && n.success ? (c.push(null === n || void 0 === n ? void 0 : n.data), A(c), R(!1)) : (g.setValues({
            ...C
          }), s(null === n || void 0 === n ? void 0 : n.message));
        } catch (a) {
          s("An error occurred while submitting the form.");
        }
      }
    }),
    p = async () => {
      try {
        var e, r, t, i;
        h(!0);
        let d = await fu("/api/zrt/kits?page=" + n + "&limit=10&search=" + o),
          S = (null === (e = d) || void 0 === e || null === (r = e.data) || void 0 === r ? void 0 : r.data) || [],
          C = null === (t = d) || void 0 === t || null === (i = t.data) || void 0 === i ? void 0 : i.totalPages;
        const m = S.filter(e => "Verified" !== e.Identity);
        var l, s, u, c;
        if (m.length > 0) await Promise.all(m.map(e => Pu("/api/zrt/refreshKit/".concat(e.kitId), {}))), d = await fu("/api/zrt/kits?page=" + n + "&limit=10&search=" + o), S = (null === (l = d) || void 0 === l || null === (s = l.data) || void 0 === s ? void 0 : s.data) || [], C = null === (u = d) || void 0 === u || null === (c = u.data) || void 0 === c ? void 0 : c.totalPages;
        A(S), a(C);
      } catch (S) {
        console.error("Error during fetch or refresh:", S), d("Failed to fetch results. Please try again.");
      } finally {
        h(!1);
      }
    };
  return (0, r.useEffect)(() => {
    p();
  }, []), (0, sa.jsxs)(sa.Fragment, {
    children: [(0, sa.jsx)(ai, {}), (0, sa.jsx)("div", {
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
                children: "My Results"
              })
            }), (0, sa.jsx)("div", {
              className: "right_part",
              children: (0, sa.jsxs)("div", {
                className: "right_part_inner",
                children: [(0, sa.jsx)("div", {
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
                        p();
                      },
                      children: (0, sa.jsx)(SY, {
                        size: 20
                      })
                    })]
                  })
                }), (0, sa.jsx)("button", {
                  className: "btn btn-primary add_kit",
                  onClick: () => {
                    g.setValues({
                      ...C
                    }), s(), R(!0);
                  },
                  children: "add kit"
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
                          children: "Sample Received"
                        }), (0, sa.jsx)(ov, {
                          children: "Report Status"
                        }), (0, sa.jsx)(ov, {
                          children: "Report Identity"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Report Date"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Action"
                        })]
                      })
                    }), (0, sa.jsxs)($T, {
                      children: [!S && (null === c || void 0 === c ? void 0 : c.map(e => (0, sa.jsxs)(yv, {
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
                            children: "Report Identity"
                          }), e.Identity]
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
                              to: "/app/report/" + btoa(Qo(e.kitId)),
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
                                } catch (a) {
                                  d("Failed to download the result. Please try again.");
                                }
                              })(e.kitId),
                              children: "Download"
                            })]
                          }) : (0, sa.jsx)(ra, {
                            style: {
                              color: "red",
                              cursor: "pointer"
                            },
                            onClick: () => (async e => {
                              try {
                                const a = await gu("/api/zrt/kits/" + e);
                                console.log(a), 200 === (null === a || void 0 === a ? void 0 : a.status) ? (u("Kit deleted successfully"), p()) : d("Failed to delete the kit. Please try again.");
                              } catch (a) {
                                d("Failed to delete the kit. Please try again.");
                              }
                            })(e.kitId),
                            children: "Delete Kit"
                          })]
                        })]
                      }, c.kitId))), S ? (0, sa.jsx)(ov, {
                        colSpan: 6,
                        children: (0, sa.jsxs)("div", {
                          className: "loading-state",
                          children: [(0, sa.jsx)("div", {
                            className: "spinner"
                          }), (0, sa.jsx)("p", {
                            children: "Loading Kits ..."
                          })]
                        })
                      }) : "", S || 0 !== (null === c || void 0 === c ? void 0 : c.length) ? "" : (0, sa.jsx)(yv, {
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
                      })]
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
        t(a), p();
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
    }), (0, sa.jsx)(lp, {
      open: m,
      onClose: f,
      "aria-labelledby": "modal-modal-title",
      "aria-describedby": "modal-modal-description",
      children: (0, sa.jsx)("form", {
        onSubmit: g.handleSubmit,
        children: (0, sa.jsxs)("div", {
          className: "modal_block add_kit",
          children: [(0, sa.jsx)("div", {
            className: "modal_header",
            children: (0, sa.jsxs)("div", {
              className: "modal_title_wrapper",
              children: [(0, sa.jsx)("h2", {
                className: "modal_title",
                children: "Add Kit"
              }), (0, sa.jsx)("p", {
                className: "modal_description",
                children: "Type in your Kit ID to add it to your account"
              })]
            })
          }), (0, sa.jsxs)("div", {
            className: "modal_content",
            children: [(0, sa.jsxs)("div", {
              className: "form_field_wrapper",
              children: [(0, sa.jsxs)("label", {
                children: ["Kit id", (0, sa.jsx)("span", {
                  className: "req",
                  children: "*"
                }), (0, sa.jsx)(AY, {
                  title: "Type in your Kit ID to add it to your account",
                  placement: "top",
                  children: (0, sa.jsx)(q_.A, {})
                })]
              }), (0, sa.jsx)("input", {
                type: "text",
                onChange: g.handleChange,
                onBlur: g.handleBlur,
                value: g.values.kitId || "",
                placeholder: "Enter kit id",
                className: "form-control inp_text",
                id: "kitId"
              }), (0, sa.jsx)("p", {
                className: "error",
                children: g.errors.kitId && g.touched.kitId && g.errors.kitId
              })]
            }), (0, sa.jsxs)("div", {
              className: "primary_btn",
              children: [(0, sa.jsx)("button", {
                className: "btn btn-secondary cancel",
                onClick: f,
                children: "Cancel"
              }), (0, sa.jsx)("button", {
                type: "submit",
                className: "btn btn-primary",
                children: "Add Kit"
              })]
            }), (0, sa.jsx)("div", {
              className: "primary_btn",
              children: l ? (0, sa.jsx)("div", {
                className: "alert",
                children: l
              }) : ""
            })]
          })]
        })
      })
    }), (0, sa.jsx)(Aa, {})]
  });
}