import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { LanguageContext } from "../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;

const C = {
  bg: "#0D1B2A", surface: "#1E2D3D",
  accent: "#F5A623", accentDim: "rgba(245,166,35,0.15)",
  green: "#4A9B7F", greenDim: "rgba(74,155,127,0.15)",
  red: "#C0392B", redDim: "rgba(192,57,43,0.15)",
  blue: "#2E86AB", blueDim: "rgba(46,134,171,0.15)",
  text: "#F8F9FA", textMuted: "#8A9BB0",
  border: "rgba(255,255,255,0.07)",
};

const badge = (st) => {
  const m = {
    pending: { bg: C.accentDim, col: C.accent },
    processing: { bg: C.blueDim, col: C.blue },
    delivered: { bg: C.greenDim, col: C.green },
    cancelled: { bg: C.redDim, col: C.red },
    unpaid: { bg: C.redDim, col: C.red },
    pending_approval: { bg: C.blueDim, col: C.blue },
    paid: { bg: C.greenDim, col: C.green },
  };
  const s = m[st] || { bg: C.border, col: C.textMuted };
  return {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "700",
    background: s.bg, color: s.col,
  };
};

const Orders = () => {
  const { user, token } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [editProducts, setEditProducts] = useState([]);

  // Payment screenshot modal
  const [showPayment, setShowPayment] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [screenshotURL, setScreenshotURL] = useState("");

  const load = () => {
    if (!user || !token) return;
    setLoading(true);
    fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, [user, token]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  // ── CANCEL ORDER ──────────────────────────────────────────────────────────
  const handleCancel = async (orderId) => {
    if (!window.confirm(t("ordersCancelConfirm"))) return;
    try {
      const res = await fetch(`${API}/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showMsg("success", t("ordersCancelled"));
        load();
      } else {
        showMsg("error", t("ordersFailed"));
      }
    } catch (error) {
      console.error(error);
      showMsg("error", t("ordersError"));
    }
  };

  // ── EDIT ORDER ────────────────────────────────────────────────────────────
  const openEdit = (order) => {
    setEditOrder(order);
    setEditProducts(order.products.map(p => ({ ...p })));
    setShowEdit(true);
  };

  const handleEditQty = (index, qty) => {
    const updated = [...editProducts];
    updated[index].quantity = Math.max(1, Number(qty));
    updated[index].subtotal = updated[index].price * updated[index].quantity;
    setEditProducts(updated);
  };

  const saveEdit = async () => {
    const totalAmount = editProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    try {
      const res = await fetch(`${API}/orders/${editOrder._id}/customer-update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ products: editProducts, totalAmount }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg("success", t("ordersUpdated"));
        setShowEdit(false);
        load();
      } else {
        showMsg("error", t("ordersFailed"));
      }
    } catch (error) {
      console.error(error);
      showMsg("error", t("ordersError"));
    }
  };

  // ── PAYMENT SCREENSHOT ────────────────────────────────────────────────────
  const openPayment = (order) => {
    setPaymentOrder(order);
    setScreenshotURL(order.paymentScreenshot || "");
    setShowPayment(true);
  };

  const submitPayment = async () => {
    try {
      const res = await fetch(`${API}/orders/${paymentOrder._id}/mark-paid`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentScreenshot: screenshotURL }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg("success", "Kwishyura byemejwe! Tegereza kwemezwa.");
        setShowPayment(false);
        load();
      } else {
        showMsg("error", t("ordersFailed"));
      }
    } catch (error) {
      console.error(error);
      showMsg("error", t("ordersError"));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg, color: C.textMuted, fontSize: "14px" }}>
        {t("loading")}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "100px 24px 40px", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: C.text }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: C.text, marginBottom: "4px" }}>
            {t("ordersTitle")}
          </h1>
          <p style={{ color: C.textMuted, fontSize: "13px" }}>
            {orders.length} order(s)
          </p>
        </div>

        {/* Message */}
        {msg && (
          <div style={{ padding: "10px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", background: msg.type === "error" ? C.redDim : C.greenDim, color: msg.type === "error" ? C.red : C.green, border: `1px solid ${msg.type === "error" ? C.red : C.green}` }}>
            {msg.text}
          </div>
        )}

        {/* No orders */}
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: C.surface, borderRadius: "12px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: C.text, marginBottom: "8px" }}>{t("ordersNone")}</div>
            <div style={{ fontSize: "13px", color: C.textMuted }}></div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((order) => (
              <div key={order._id} style={{ background: C.surface, borderRadius: "12px", border: `1px solid ${C.border}`, overflow: "hidden" }}>

                {/* Order Header */}
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "4px" }}>
                      Komande #{order._id.slice(-6).toUpperCase()}
                    </div>
                    <div style={{ fontSize: "11px", color: C.textMuted }}>
                      {new Date(order.createdAt).toLocaleDateString("fr-RW", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={badge(order.status)}>{order.status}</span>
                    <span style={badge(order.paymentStatus)}>{order.paymentStatus}</span>
                  </div>
                </div>

                {/* Products */}
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
                  {order.products.map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < order.products.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div>
                        <span style={{ fontWeight: "600", fontSize: "13px" }}>{p.productName}</span>
                        <span style={{ color: C.textMuted, fontSize: "12px", marginLeft: "8px" }}>x{p.quantity}</span>
                      </div>
                      <span style={{ color: C.accent, fontWeight: "700", fontSize: "13px" }}>
                        {(p.price * p.quantity).toLocaleString()} BIF
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ fontWeight: "800", fontSize: "16px", color: C.accent }}>
                    Igiteranyo: {order.totalAmount.toLocaleString()} BIF
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>

                    {/* Edit — only if pending */}
                    {order.status === "pending" && (
                      <button
                        onClick={() => openEdit(order)}
                        style={{ padding: "7px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "none", background: C.accentDim, color: C.accent }}
                      >
                        ✏️ Hindura
                      </button>
                    )}

                    {/* Cancel — only if pending */}
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        style={{ padding: "7px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "none", background: C.redDim, color: C.red }}
                      >
                        ❌ Hagarika
                      </button>
                    )}

                    {/* Payment screenshot — only if unpaid */}
                    {order.paymentStatus === "unpaid" && order.status !== "cancelled" && (
                      <button
                        onClick={() => openPayment(order)}
                        style={{ padding: "7px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "none", background: C.greenDim, color: C.green }}
                      >
                        💳 Ishyura
                      </button>
                    )}

                    {/* Pending approval */}
                    {order.paymentStatus === "pending_approval" && (
                      <span style={{ fontSize: "12px", color: C.blue, fontWeight: "600" }}>
                        ⏳ Tegereza kwemezwa
                      </span>
                    )}

                    {/* Paid */}
                    {order.paymentStatus === "paid" && (
                      <span style={{ fontSize: "12px", color: C.green, fontWeight: "600" }}>
                        ✅ Yishyuwe
                      </span>
                    )}

                    {/* View screenshot */}
                    {order.paymentScreenshot && (
                      <a href={order.paymentScreenshot} target="_blank" rel="noreferrer"
                        style={{ padding: "7px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "none", background: C.blueDim, color: C.blue, textDecoration: "none" }}
                      >
                        🖼️ Reba Screenshot
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {showEdit && editOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
          onClick={e => e.target === e.currentTarget && setShowEdit(false)}>
          <div style={{ background: C.surface, borderRadius: "16px", border: `1px solid ${C.border}`, padding: "28px", width: "480px", maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", marginBottom: "20px", color: C.text }}>
              {t("ordersEdit")}
            </div>
            {editProducts.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "13px" }}>{p.productName}</div>
                  <div style={{ fontSize: "11px", color: C.textMuted }}>{p.price.toLocaleString()} BIF / rimwe</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button onClick={() => handleEditQty(i, p.quantity - 1)}
                    style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: C.redDim, color: C.red, fontWeight: "800", cursor: "pointer", fontSize: "16px" }}>−</button>
                  <span style={{ fontWeight: "700", minWidth: "24px", textAlign: "center" }}>{p.quantity}</span>
                  <button onClick={() => handleEditQty(i, p.quantity + 1)}
                    style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: C.greenDim, color: C.green, fontWeight: "800", cursor: "pointer", fontSize: "16px" }}>+</button>
                </div>
              </div>
            ))}
            <div style={{ marginTop: "16px", fontWeight: "800", fontSize: "15px", color: C.accent, textAlign: "right" }}>
              Igiteranyo: {editProducts.reduce((s, p) => s + p.price * p.quantity, 0).toLocaleString()} BIF
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button onClick={() => setShowEdit(false)}
                style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: C.accentDim, color: C.accent, fontWeight: "600", cursor: "pointer" }}>
                Reka
              </button>
              <button onClick={saveEdit}
                style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: C.accent, color: C.bg, fontWeight: "700", cursor: "pointer" }}>
                Bika Impinduka
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENT MODAL ── */}
      {showPayment && paymentOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
          onClick={e => e.target === e.currentTarget && setShowPayment(false)}>
          <div style={{ background: C.surface, borderRadius: "16px", border: `1px solid ${C.border}`, padding: "28px", width: "480px", maxWidth: "90vw" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", marginBottom: "8px", color: C.text }}>
              💳 Emeza Kwishyura
            </div>
            <div style={{ fontSize: "13px", color: C.textMuted, marginBottom: "20px" }}>
              Injiza URL ya screenshot y'ubwishyu bwawe
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px", display: "block" }}>
                Screenshot URL
              </label>
              <input
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px 14px", color: C.text, fontSize: "13px", outline: "none", width: "100%" }}
                type="text"
                placeholder="https://i.imgur.com/example.png"
                value={screenshotURL}
                onChange={e => setScreenshotURL(e.target.value)}
              />
            </div>
            {screenshotURL && (
              <img src={screenshotURL} alt="Screenshot" onError={e => e.target.style.display = "none"}
                style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "14px", background: C.bg }} />
            )}
            <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "16px" }}>
              Igiteranyo: <strong style={{ color: C.accent }}>{paymentOrder.totalAmount.toLocaleString()} BIF</strong>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowPayment(false)}
                style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: C.accentDim, color: C.accent, fontWeight: "600", cursor: "pointer" }}>
                Reka
              </button>
              <button onClick={submitPayment} disabled={!screenshotURL.trim()}
                style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: C.accent, color: C.bg, fontWeight: "700", cursor: "pointer", opacity: screenshotURL.trim() ? 1 : 0.5 }}>
                Emeza Kwishyura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
