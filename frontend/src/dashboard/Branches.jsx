import { useState, useEffect, useCallback, useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import { API, C, S, fmt, fmtM, timeAgo, stockStatus, BRANCHES, CATEGORIES, ROLES, MONTH_NAMES } from "./dashboardUtils";
import Spinner from "./Spinner";

function useT() {
  const { language, translations } = useContext(LanguageContext);
  const dashLang = language === "rn" ? "fr" : language;
  return (key) => translations[dashLang]?.[key] ?? translations["en"]?.[key] ?? key;
}

function Branches({ token, t }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ name: "", managerName: "", managerEmail: "", location: "", phone: "" });

  const load = useCallback(() => {
    setLoading(true);
    fetch(`${API}/branches`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setBranches(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ name: "", managerName: "", managerEmail: "", location: "", phone: "" }); setShowModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({ name: b.name, managerName: b.managerName || "", managerEmail: b.managerEmail || "", location: b.location || "", phone: b.phone || "" }); setShowModal(true); };

  const save = async () => {
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `${API}/branches/${editing._id}` : `${API}/branches`;
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    const d = await r.json();
    if (d.success || d.branch) { setMsg({ type: "success", text: editing ? t("branchUpdated") || "Branch updated!" : t("branchAdded") || "Branch added!" }); setShowModal(false); load(); }
    else setMsg({ type: "error", text: d.error || "Failed" });
  };

  return (
    <div>
      <div className="gigo-section-header" style={S.sectionHeader}>
        <div>
          <div style={S.sectionTitle}>{t("branchManagement") || "Branch Management"}</div>
          <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{branches.length} {t("branches")}</div>
        </div>
        <button style={S.btn("primary")} onClick={openAdd}>+ {t("addBranch") || "Add Branch"}</button>
      </div>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}
      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {branches.length === 0 && (
            <div style={{ ...S.card, padding: "20px", color: C.textMuted, gridColumn: "1/-1", textAlign: "center" }}>{t("noBranches") || "No branches yet. Add your first branch."}</div>
          )}
          {branches.map((b, i) => (
            <div key={i} style={{ ...S.card, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "15px", marginBottom: "3px" }}>{b.name}</div>
                  <div style={{ fontSize: "12px", color: C.textMuted }}>{t("manager") || "Manager"}: {b.managerName || "—"}</div>
                </div>
                <span style={S.badge2(b.status || "active")}>{b.status || "active"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                {[
                  { label: t("staff") || "Staff", value: b.stats?.staffCount ?? 0 },
                  { label: t("orders"), value: fmt(b.stats?.orderCount ?? 0) },
                  { label: t("revenue") || "Revenue", value: `FRw ${fmtM(b.stats?.totalRevenue ?? 0)}` },
                ].map((s, j) => (
                  <div key={j} style={{ textAlign: "center", background: C.bg, borderRadius: "8px", padding: "10px 6px" }}>
                    <div style={{ fontWeight: "800", fontSize: "15px", color: j === 2 ? C.green : C.text }}>{s.value}</div>
                    <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {b.location && <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "12px" }}>📍 {b.location}</div>}
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ ...S.btn("ghost"), flex: 1 }} onClick={() => openEdit(b)}>{t("edit") || "Edit"}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={S.modalBox}>
            <div style={S.modalTitle}>{editing ? t("editBranch") || "Edit Branch" : t("addBranch") || "Add Branch"}</div>
            <div style={S.formRow}>
              <label style={S.formLabel}>{t("branchName") || "Branch Name"}</label>
              {editing ? (
                <input style={S.input} value={form.name} disabled />
              ) : (
                <select style={S.select} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}>
                  <option value="">{t("selectBranch") || "Select branch"}</option>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              )}
            </div>
            {[
              { label: t("managerName") || "Manager Name", key: "managerName" },
              { label: t("managerEmail") || "Manager Email", key: "managerEmail" },
              { label: t("location") || "Location", key: "location" },
              { label: t("phone") || "Phone", key: "phone" },
            ].map(f => (
              <div key={f.key} style={S.formRow}>
                <label style={S.formLabel}>{f.label}</label>
                <input style={S.input} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button style={S.btn("ghost")} onClick={() => setShowModal(false)}>{t("cancel") || "Cancel"}</button>
              <button style={S.btn("primary")} onClick={save}>{editing ? t("saveChanges") || "Save Changes" : t("addBranch") || "Add Branch"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── USERS PAGE ────────────────────────────────────────────────────────────────

export default Branches;
