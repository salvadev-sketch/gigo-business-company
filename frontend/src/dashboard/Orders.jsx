import { useState, useEffect, useCallback, useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import { API, C, S, fmt, fmtM, timeAgo, stockStatus, BRANCHES, CATEGORIES, ROLES, MONTH_NAMES } from "./dashboardUtils";
import Spinner from "./Spinner";

function useT() {
  const { language, translations } = useContext(LanguageContext);
  const dashLang = language === "rn" ? "fr" : language;
  return (key) => translations[dashLang]?.[key] ?? translations["en"]?.[key] ?? key;
}

function Orders({ token, t }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [msg, setMsg] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const q = filter !== "all" ? `?status=${filter}` : "";
    fetch(`${API}/orders${q}&limit=100`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token, filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    const r = await fetch(`${API}/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
    const d = await r.json();
    if (d.success) { setMsg({ type: "success", text: t("ordersUpdated") }); load(); }
    else setMsg({ type: "error", text: d.error || t("ordersError") });
  };

  const approvePayment = async (id) => {
    const r = await fetch(`${API}/orders/${id}/approve-payment`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.success) { setMsg({ type: "success", text: t("paymentApproved") || "Payment approved!" }); load(); }
    else setMsg({ type: "error", text: d.error || t("ordersError") });
  };

  const tabLabels = {
    all: t("ordersStatusAll"),
    pending: t("ordersStatusPending"),
    processing: t("ordersStatusProcessing"),
    delivered: t("ordersStatusDelivered"),
    cancelled: t("ordersStatusCancelled"),
  };

  return (
    <div>
      <div className="gigo-section-header" style={S.sectionHeader}>
        <div>
          <div style={S.sectionTitle}>{t("orders")}</div>
          <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{orders.length} {t("orders")}</div>
        </div>
      </div>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <div className="gigo-tabs-scroll" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {Object.entries(tabLabels).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)} style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", background: filter === key ? C.accent : "transparent", color: filter === key ? C.bg : C.textMuted, border: `1px solid ${filter === key ? C.accent : C.border}` }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {loading ? <Spinner /> : (
          <table className="gigo-table" style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>{t("customer")}</th>
                <th style={S.th}>{t("branch")}</th>
                <th style={S.th}>{t("total")}</th>
                <th style={S.th}>{t("status")}</th>
                <th style={S.th}>{t("payment") || "Payment"}</th>
                <th style={S.th}>{t("date") || "Date"}</th>
                <th style={S.th}>{t("actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: C.textMuted }}>{t("noOrdersFound") || "No orders found"}</td></tr>
              )}
              {orders.map((o, i) => (
                <tr key={i}>
                  <td style={S.td}>
                    <div style={{ fontWeight: "600" }}>{o.customerName}</div>
                    <div style={{ fontSize: "11px", color: C.textMuted }}>{o.customerEmail}</div>
                  </td>
                  <td style={{ ...S.td, color: C.textMuted, fontSize: "12px" }}>{o.branch}</td>
                  <td style={{ ...S.td, fontWeight: "700", color: C.accent }}>FRw {fmt(o.totalAmount)}</td>
                  <td style={S.td}><span style={S.badge2(o.status)}>{o.status}</span></td>
                  <td style={S.td}><span style={S.badge2(o.paymentStatus)}>{o.paymentStatus}</span></td>
                  <td style={{ ...S.td, fontSize: "11px", color: C.textMuted }}>{timeAgo(o.createdAt)}</td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {o.status === "pending" && <button style={{ ...S.btn("ghost"), padding: "4px 8px", fontSize: "10px" }} onClick={() => updateStatus(o._id, "processing")}>{t("process") || "Process"}</button>}
                      {o.status === "processing" && <button style={{ ...S.btn("primary"), padding: "4px 8px", fontSize: "10px" }} onClick={() => updateStatus(o._id, "delivered")}>{t("deliver") || "Deliver"}</button>}
                      {o.paymentStatus === "pending_approval" && <button style={{ ...S.btn("primary"), padding: "4px 8px", fontSize: "10px" }} onClick={() => approvePayment(o._id)}>✓ {t("pay") || "Pay"}</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── BRANCHES PAGE ─────────────────────────────────────────────────────────────

export default Orders;
