i3 = function () {
  const e = be(),
    a = (0, r.useState)(!1),
    [n, t] = (0, r.useState)(0),
    [o, i] = (0, r.useState)(1),
    [l, s] = (0, r.useState)(0),
    [u, d] = (0, r.useState)(""),
    {
      alertSuccess: c,
      alertError: A
    } = Uu(),
    [S, h] = (0, r.useState)([]),
    [C, m] = (0, r.useState)({
      men: [],
      women: []
    }),
    [R, f] = (0, r.useState)("men"),
    [g, p] = (0, r.useState)(!1),
    [M, y] = (0, r.useState)(!1),
    [P, B] = (0, r.useState)(!1),
    b = async function () {
      let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0;
      try {
        var a, r;
        y(!0);
        let n = await fu("/api/catalog/order/getpatientOrder?page=".concat(l, "&status=").concat(e, "&limit=").concat(10, "&search=").concat(btoa(Qo(u))));
        h(null === n || void 0 === n || null === (a = n.data) || void 0 === a ? void 0 : a.data), i(null === n || void 0 === n || null === (r = n.data) || void 0 === r ? void 0 : r.totalPages);
      } catch (n) {
        A("Error Getting Patients Error");
      } finally {
        y(!1);
      }
    };
  return (0, r.useEffect)(() => {
    b(), (async () => {
      try {
        var e, a;
        B(!0);
        const r = await fu("/api/catalog/get-popular-products");
        console.log(r);
        const n = (null === r || void 0 === r || null === (e = r.data) || void 0 === e ? void 0 : e.men) || [],
          t = (null === r || void 0 === r || null === (a = r.data) || void 0 === a ? void 0 : a.women) || [];
        m({
          men: Array.isArray(n) ? n : [],
          women: Array.isArray(t) ? t : []
        });
      } catch (V4) {
        m({
          men: [],
          women: []
        });
      } finally {
        B(!1);
      }
    })();
  }, [l, u]), (0, sa.jsxs)(sa.Fragment, {
    children: [(0, sa.jsx)(ai, {}), (0, sa.jsx)("div", {
      className: "main_content",
      children: (0, sa.jsxs)("div", {
        className: "container",
        children: [(0, sa.jsx)("div", {
          children: (0, sa.jsxs)("div", {
            className: "main_block",
            children: [(0, sa.jsxs)("div", {
              className: "top_bar",
              children: [(0, sa.jsx)("div", {
                className: "left_part",
                children: (0, sa.jsx)("div", {
                  className: "main_title",
                  children: "Patient Order"
                })
              }), (0, sa.jsxs)("div", {
                className: "right_part",
                style: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0, sa.jsx)("div", {
                  className: "search_bar",
                  style: {
                    marginRight: "20px"
                  },
                  children: (0, sa.jsxs)("div", {
                    className: "input-group",
                    children: [(0, sa.jsx)("input", {
                      type: "search",
                      value: u,
                      onChange: e => d(e.target.value),
                      className: "form-control",
                      placeholder: "Search by Product",
                      "aria-label": "Search"
                    }), (0, sa.jsx)("button", {
                      className: "btn search-btn",
                      onClick: function () {
                        b();
                      },
                      children: (0, sa.jsx)(SY, {
                        size: 20
                      })
                    })]
                  })
                }), (0, sa.jsx)("div", {
                  className: "status_dropdown",
                  children: (0, sa.jsxs)("select", {
                    onChange: e => {
                      const a = e.target.value || 0;
                      t(a), b(a);
                    },
                    className: "form-control",
                    value: n,
                    children: [(0, sa.jsx)("option", {
                      value: 0,
                      children: "ALL"
                    }), (0, sa.jsx)("option", {
                      value: 1,
                      children: "PENDING"
                    }), (0, sa.jsx)("option", {
                      value: 2,
                      children: "APPROVED"
                    }), (0, sa.jsx)("option", {
                      value: 3,
                      children: "COMPLETED"
                    }), (0, sa.jsx)("option", {
                      value: 4,
                      children: "CANCELLED"
                    })]
                  })
                })]
              })]
            }), (0, sa.jsx)("div", {
              className: "table_wrapper dashboard",
              children: (0, sa.jsx)("div", {
                className: "table_inner",
                children: M ? (0, sa.jsx)("div", {
                  style: {
                    padding: "40px 0",
                    display: "flex",
                    justifyContent: "center"
                  },
                  children: (0, sa.jsx)(C1, {
                    size: 44,
                    sx: {
                      color: "#e11d48"
                    }
                  })
                }) : (0, sa.jsx)(uv, {
                  component: Kh,
                  children: (0, sa.jsxs)(jT, {
                    sx: {
                      minWidth: 650
                    },
                    "aria-label": "simple table",
                    children: [(0, sa.jsx)(Cv, {
                      children: (0, sa.jsxs)(yv, {
                        children: [(0, sa.jsx)(ov, {
                          children: "SNo."
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Order ID"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Patient"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Product Name"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Quantity"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Total"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Payment Type"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Payment Status"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Order Status"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Order Date"
                        }), (0, sa.jsx)(ov, {
                          align: "right",
                          children: "Action"
                        })]
                      })
                    }), (0, sa.jsxs)($T, {
                      children: [(null === S || void 0 === S ? void 0 : S.length) > 0 && (null === S || void 0 === S ? void 0 : S.map((a, r) => {
                        return (0, sa.jsxs)(yv, {
                          children: [(0, sa.jsx)(ov, {
                            align: "right",
                            children: r + 1
                          }), (0, sa.jsx)(ov, {
                            align: "right",
                            children: null === a || void 0 === a ? void 0 : a.orderId
                          }), (0, sa.jsx)(ov, {
                            align: "right",
                            children: null === a || void 0 === a ? void 0 : a.firstName
                          }), (0, sa.jsx)(ov, {
                            align: "right",
                            children: null === a || void 0 === a ? void 0 : a.productTitle
                          }), (0, sa.jsx)(ov, {
                            align: "right",
                            children: null === a || void 0 === a ? void 0 : a.quantity
                          }), (0, sa.jsx)(ov, {
                            align: "right",
                            children: null === a || void 0 === a ? void 0 : a.total
                          }), (0, sa.jsx)(ov, {
                            align: "right",
                            children: null !== a && void 0 !== a && a.type ? null === a || void 0 === a ? void 0 : a.type : "ONE TIME"
                          }), (0, sa.jsx)(ov, {
                            children: (0, sa.jsx)("span", {
                              className: "COMPLETED" === (null === a || void 0 === a ? void 0 : a.intent) || "APPROVED" === (null === a || void 0 === a ? void 0 : a.intent) ? "badge bg-success" : "VOID" === (null === a || void 0 === a ? void 0 : a.intent) || "CANCELLED" === (null === a || void 0 === a ? void 0 : a.intent) ? "badge bg-danger" : "badge bg-warning",
                              children: null === a || void 0 === a ? void 0 : a.intent
                            })
                          }), (0, sa.jsx)(ov, {
                            children: (0, sa.jsx)("span", {
                              className: 2 === (null === a || void 0 === a ? void 0 : a.status) ? "badge bg-success" : 1 === (null === a || void 0 === a ? void 0 : a.status) || 3 === (null === a || void 0 === a ? void 0 : a.status) ? "badge bg-warning" : "badge bg-danger",
                              children: 1 === (null === a || void 0 === a ? void 0 : a.status) ? "PENDING" : 2 === (null === a || void 0 === a ? void 0 : a.status) ? "APPROVED" : 3 === (null === a || void 0 === a ? void 0 : a.status) ? "COMPLETED" : 4 === (null === a || void 0 === a ? void 0 : a.status) ? "CANCELLED" : "UNKNOWN"
                            })
                          }), (0, sa.jsx)(ov, {
                            children: (n = null === a || void 0 === a ? void 0 : a.orderCreatedAt, new Date(n).toLocaleString())
                          }), (0, sa.jsx)(ov, {
                            children: (0, sa.jsx)(Yu, {
                              children: (0, sa.jsx)(MR, {
                                variant: "contained",
                                onClick: () => {
                                  return r = null === a || void 0 === a ? void 0 : a.id, void e("/app/view-my-order/".concat(r));
                                  var r;
                                },
                                children: (0, sa.jsx)("span", {
                                  children: "View"
                                })
                              })
                            })
                          })]
                        }, null === a || void 0 === a ? void 0 : a.id);
                        var n;
                      })), 0 === (null === S || void 0 === S ? void 0 : S.length) ? (0, sa.jsx)(yv, {
                        children: (0, sa.jsx)(ov, {
                          colSpan: 11,
                          children: (0, sa.jsx)("div", {
                            className: "notice",
                            children: (0, sa.jsx)("div", {
                              className: "alert",
                              children: (0, sa.jsx)("span", {
                                className: "alertText",
                                children: "No Orders Found"
                              })
                            })
                          })
                        })
                      }) : null]
                    })]
                  })
                })
              })
            })]
          })
        }), (0, sa.jsxs)(NN, {
          isOpen: g,
          backdrop: "static",
          children: [(0, sa.jsx)(kN, {
            children: "Confirmation"
          }), (0, sa.jsx)(wN, {
            children: (0, sa.jsx)(wN, {
              children: "Are you sure you want to cancel this order?"
            })
          }), (0, sa.jsx)(zN, {
            children: (0, sa.jsxs)(sa.Fragment, {
              children: [(0, sa.jsx)("button", {
                className: "btn btn-info text-light",
                disabled: a,
                onClick: () => {
                  (async (e, a) => {})();
                },
                children: "Cancel Order"
              }), (0, sa.jsx)("button", {
                className: "btn btn-danger text-light",
                onClick: () => {
                  p(!1);
                },
                children: "close"
              })]
            })
          })]
        }), (0, sa.jsx)(Q_(), {
          breakLabel: "...",
          nextLabel: "next >",
          onPageChange: e => {
            const a = e.selected;
            s(a);
          },
          pageRangeDisplayed: 5,
          pageCount: o,
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
        }), (0, sa.jsx)("div", {
          className: "popular-products-section",
          style: {
            marginTop: 40,
            marginBottom: 40,
            background: "#fff",
            borderRadius: 24,
            padding: "40px 24px"
          },
          children: (0, sa.jsxs)("div", {
            style: {
              maxWidth: 1200,
              margin: "0 auto"
            },
            children: [(0, sa.jsx)("div", {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 28
              },
              children: (0, sa.jsxs)("div", {
                children: [(0, sa.jsx)("h2", {
                  style: {
                    margin: 0,
                    fontWeight: 800,
                    fontSize: 24,
                    color: "#111827"
                  },
                  children: "Popular Products"
                }), (0, sa.jsx)("p", {
                  style: {
                    color: "black",
                    fontSize: 14,
                    marginTop: 4
                  },
                  children: "Curated bestsellers chosen by our clinical team"
                })]
              })
            }), P ? (0, sa.jsx)("div", {
              style: {
                padding: "60px 0",
                display: "flex",
                justifyContent: "center"
              },
              children: (0, sa.jsx)(C1, {
                size: 44,
                sx: {
                  color: "#e11d48"
                }
              })
            }) : (0, sa.jsxs)(sa.Fragment, {
              children: [(0, sa.jsx)("div", {
                style: {
                  display: "flex",
                  gap: 12,
                  marginBottom: 30
                },
                children: ["men", "women"].map(e => (0, sa.jsx)("button", {
                  type: "button",
                  onClick: () => f(e),
                  style: {
                    padding: "10px 22px",
                    borderRadius: 999,
                    border: R === e ? "1px solid #f43f5e" : "1px solid #fbcfe8",
                    background: R === e ? "linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)" : "#ffffff",
                    color: R === e ? "#fff" : "#881337",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 14,
                    boxShadow: R === e ? "0 3px 10px rgba(244,63,94,0.25)" : "0 1px 2px rgba(0,0,0,0.05)",
                    transition: "all .25s ease"
                  },
                  children: "men" === e ? "Men" : "Women"
                }, e))
              }), (0, sa.jsxs)("div", {
                style: {
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 26
                },
                children: [("men" === R ? C.men : C.women).map(a => (0, sa.jsxs)("div", {
                  style: {
                    border: "1px solid #fbcfe8",
                    borderRadius: 20,
                    background: "#ffffff",
                    overflow: "hidden",
                    transition: "transform .25s ease, box-shadow .25s ease",
                    cursor: "pointer"
                  },
                  onMouseEnter: e => {
                    e.currentTarget.style.transform = "translateY(-6px)", e.currentTarget.style.boxShadow = "0 12px 28px rgba(244,63,94,0.15)";
                  },
                  onMouseLeave: e => {
                    e.currentTarget.style.transform = "none", e.currentTarget.style.boxShadow = "0 4px 14px rgba(244,63,94,0.08)";
                  },
                  children: [(0, sa.jsxs)("div", {
                    style: {
                      position: "relative",
                      background: "#fff1f2",
                      aspectRatio: "1 / 1",
                      overflow: "hidden"
                    },
                    children: [(0, sa.jsx)("img", {
                      src: a.productImage,
                      alt: a.productName,
                      style: {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform .4s ease"
                      },
                      onError: e => {
                        e.target.onerror = null, e.target.src = Z1;
                      },
                      onMouseEnter: e => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      },
                      onMouseLeave: e => {
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }), (0, sa.jsx)("div", {
                      style: {
                        position: "absolute",
                        top: 12,
                        left: 12,
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid #fecdd3",
                        padding: "5px 12px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#be123c",
                        textTransform: "uppercase",
                        letterSpacing: .5
                      },
                      children: "Featured"
                    })]
                  }), (0, sa.jsxs)("div", {
                    style: {
                      padding: 18,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%"
                    },
                    children: [(0, sa.jsx)("div", {
                      style: {
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: 6,
                        minHeight: 44,
                        lineHeight: "22px",
                        fontSize: 16
                      },
                      children: a.productName || a.name
                    }), (0, sa.jsxs)("div", {
                      style: {
                        color: "#6b7280",
                        fontSize: 13,
                        marginBottom: 10,
                        minHeight: 36
                      },
                      children: [(a.description || "").slice(0, 90), a.description && a.description.length > 90 ? "\u2026" : ""]
                    }), (0, sa.jsxs)("div", {
                      style: {
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#be123c",
                        marginBottom: 16
                      },
                      children: ["$", Number(a.basePrice || a.price || 0).toFixed(2)]
                    }), (0, sa.jsx)(MR, {
                      variant: "contained",
                      style: {
                        background: "linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                        textTransform: "none",
                        borderRadius: 10
                      },
                      onClick: () => e("/register?procedure=store-consultation&productId=".concat(a.id)),
                      children: "Proceed to Buy"
                    })]
                  })]
                }, "pop-".concat(a.id))), 0 === ("men" === R ? C.men : C.women).length && (0, sa.jsx)("div", {
                  style: {
                    color: "#9ca3af",
                    textAlign: "center",
                    padding: "32px 0"
                  },
                  children: "No products to show"
                })]
              })]
            })]
          })
        })]
      })
    }), (0, sa.jsx)(Aa, {})]
  });
}