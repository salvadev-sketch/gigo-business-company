import { useState, useEffect, useCallback, useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import { API, C, S, fmt, fmtM, timeAgo, stockStatus, BRANCHES, CATEGORIES, ROLES, MONTH_NAMES } from "./dashboardUtils";
import Spinner from "./Spinner";

function useT() {
  const { language, translations } = useContext(LanguageContext);
  const dashLang = language === "rn" ? "fr" : language;
  return (key) => translations[dashLang]?.[key] ?? translations["en"]?.[key] ?? key;
}

function Inventory({ token, t }) {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("in");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/all-products?limit=100`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/inventory/low-stock`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([p, ls]) => { setProducts(p.products || []); setLowStock(ls.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openModal = (type, product = null) => { setModalType(type); setSelectedProduct(product); setQty("1"); setReason(""); setShowModal(true); };

  const submit = async () => {
    if (!selectedProduct) return;
    const r = await fetch(`${API}/inventory/stock-${modalType}`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId: selectedProduct._id, quantity: Number(qty), reason }),
    });
    const d = await r.json();
    if (d.success) { setMsg({ type: "success", text: d.message }); setShowModal(false); load(); }
    else setMsg({ type: "error", text: d.error || "Failed" });
  };

  const inStock = products.filter(p => stockStatus(p) === "In Stock").length;
  const lowCount = products.filter(p => stockStatus(p) === "Low Stock").length;
  const critical = products.filter(p => ["Critical", "Out of Stock"].includes(stockStatus(p))).length;

  return (
    <div>
      <div className="gigo-section-header" style={S.sectionHeader}>
        <div>
          <div style={S.sectionTitle}>{t("inventoryManagement") || "Inventory Management"}</div>
          <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{t("realTimeStock") || "Real-time stock tracking"}</div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={S.btn("ghost")} onClick={() => openModal("in")}>{t("stockIn") || "Stock In"}</button>
          <button style={S.btn("primary")} onClick={() => openModal("out")}>{t("stockOut") || "Stock Out"}</button>
        </div>
      </div>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}
      {lowStock.length > 0 && (
        <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: "10px", padding: "12px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>⚠</span>
          <div>
            <span style={{ fontWeight: "700", color: C.red }}>{lowStock.length} {t("productsNeedAttention") || "products need attention"}</span>
            <span style={{ color: C.textMuted, fontSize: "12px" }}> — {t("lowStockDetected") || "Low stock or critical levels detected."}</span>
          </div>
        </div>
      )}
      <div className="gigo-kpi-grid" style={{ ...S.grid4, marginBottom: "20px" }}>
        {[
          { label: t("totalProducts"), value: products.length, color: C.blue },
          { label: t("inStock") || "In Stock", value: inStock, color: C.green },
          { label: t("lowStock") || "Low Stock", value: lowCount, color: C.accent },
          { label: t("criticalOut") || "Critical / Out", value: critical, color: C.red },
        ].map((s, i) => (
          <div key={i} className="gigo-stat-card" style={{ ...S.card, padding: "16px 20px" }}>
            <div className="gigo-stat-val" style={{ fontSize: "24px", fontWeight: "800", color: s.color }}>{s.value}</div>
            <div className="gigo-stat-label" style={{ fontSize: "11px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>
      {loading ? <Spinner /> : (
        <div style={S.card}>
          <div style={S.cardHeader}><div style={S.cardTitle}>{t("stockLevels") || "Stock Levels"}</div></div>
          <table className="gigo-table" style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>{t("product") || "Product"}</th>
                <th style={S.th}>{t("branch")}</th>
                <th style={S.th}>{t("stock") || "Stock"}</th>
                <th style={S.th}>{t("minLevel") || "Min Level"}</th>
                <th style={S.th}>{t("status")}</th>
                <th style={S.th}>{t("action") || "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", color: C.textMuted }}>{t("noProducts")}</td></tr>
              )}
              {products.map((p, i) => {
                const st = stockStatus(p);
                const max = Math.max(p.stock || 0, (p.minStockLevel || 10) * 4, 1);
                return (
                  <tr key={i}>
                    <td style={{ ...S.td, fontWeight: "600" }}>{p.productName}</td>
                    <td style={{ ...S.td, color: C.textMuted, fontSize: "12px" }}>{p.branch}</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "60px", height: "6px", borderRadius: "3px", background: C.border, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(((p.stock || 0) / max) * 100, 100)}%`, background: st === "Critical" || st === "Out of Stock" ? C.red : st === "Low Stock" ? C.accent : C.green, borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontWeight: "700", color: st === "Critical" || st === "Out of Stock" ? C.red : st === "Low Stock" ? C.accent : C.text }}>{fmt(p.stock || 0)}</span>
                      </div>
                    </td>
                    <td style={{ ...S.td, color: C.textMuted }}>{p.minStockLevel || 10}</td>
                    <td style={S.td}><span style={S.badge2(st)}>{st}</span></td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={{ ...S.btn("primary"), padding: "5px 12px", fontSize: "11px" }} onClick={() => openModal("in", p)}>+ {t("stockIn") || "Stock In"}</button>
                        <button style={{ ...S.btn("ghost"), padding: "5px 12px", fontSize: "11px" }} onClick={() => openModal("out", p)}>- {t("stockOut") || "Stock Out"}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={S.modalBox}>
            <div style={S.modalTitle}>{modalType === "in" ? t("stockInTitle") || "Stock In — Add Stock" : t("stockOutTitle") || "Stock Out — Remove Stock"}</div>
            <div style={S.formRow}>
              <label style={S.formLabel}>{t("product") || "Product"}</label>
              <select style={S.select} value={selectedProduct?._id || ""} onChange={e => setSelectedProduct(products.find(p => p._id === e.target.value) || null)}>
                <option value="">{t("selectProduct") || "Select product"}</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.productName} (stock: {p.stock || 0})</option>)}
              </select>
            </div>
            <div style={S.formRow}>
              <label style={S.formLabel}>{t("quantity") || "Quantity"}</label>
              <input style={S.input} type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} />
            </div>
            <div style={S.formRow}>
              <label style={S.formLabel}>{t("reason") || "Reason"}</label>
              <input style={S.input} type="text" placeholder={modalType === "in" ? "e.g. Restock" : "e.g. Sale, Damaged"} value={reason} onChange={e => setReason(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button style={S.btn("ghost")} onClick={() => setShowModal(false)}>{t("cancel") || "Cancel"}</button>
              <button style={S.btn("primary")} onClick={submit}>{t("confirm") || "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ORDERS PAGE ───────────────────────────────────────────────────────────────

export default Inventory;
