import { useState, useEffect, useCallback, useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import { API, C, S, fmt, fmtM, timeAgo, stockStatus, BRANCHES, CATEGORIES, ROLES, MONTH_NAMES } from "./dashboardUtils";
import Spinner from "./Spinner";

function useT() {
  const { language, translations } = useContext(LanguageContext);
  const dashLang = language === "rn" ? "fr" : language;
  return (key) => translations[dashLang]?.[key] ?? translations["en"]?.[key] ?? key;
}

function Users({ token, t }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ role: "employee", branch: "all", status: "active" });

  const load = useCallback(() => {
    setLoading(true);
    fetch(`${API}/users?limit=100`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (u) => { setEditing(u); setForm({ role: u.role, branch: u.branch, status: u.status || "active" }); setShowModal(true); };

  const save = async () => {
    const r = await fetch(`${API}/users/${editing._id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    const d = await r.json();
    if (d.success) { setMsg({ type: "success", text: t("userUpdated") || "User updated!" }); setShowModal(false); load(); }
    else setMsg({ type: "error", text: d.error || "Failed" });
  };

  const del = async (id) => {
    if (!window.confirm(t("deleteUserConfirm") || "Delete this user?")) return;
    const r = await fetch(`${API}/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.success) { setMsg({ type: "success", text: t("userDeleted") || "User deleted!" }); load(); }
    else setMsg({ type: "error", text: d.error || "Failed" });
  };

  const roleDesc = {
    owner: t("roleOwnerDesc") || "Full system access",
    branch_manager: t("roleBranchManagerDesc") || "Branch-level access",
    sales_manager: t("roleSalesManagerDesc") || "Sales & orders",
    warehouse_manager: t("roleWarehouseManagerDesc") || "Inventory access",
    cashier: t("roleCashierDesc") || "Sales & orders only",
    employee: t("roleEmployeeDesc") || "Limited access",
    customer: t("roleCustomerDesc") || "Customer access",
  };

  return (
    <div>
      <div className="gigo-section-header" style={S.sectionHeader}>
        <div>
          <div style={S.sectionTitle}>{t("usersAndRoles") || "Users & Roles"}</div>
          <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{users.length} {t("teamMembers") || "team members"}</div>
        </div>
      </div>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}
      <div className="gigo-2col-grid" style={S.grid2}>
        <div style={S.card}>
          <div style={S.cardHeader}><div style={S.cardTitle}>{t("teamMembers") || "Team Members"}</div></div>
          {loading ? <Spinner /> : (
            <table className="gigo-table" style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>{t("name") || "Name"}</th>
                  <th style={S.th}>{t("role") || "Role"}</th>
                  <th style={S.th}>{t("status")}</th>
                  <th style={S.th}>{t("actions") || "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", color: C.textMuted }}>{t("noUsers") || "No users found"}</td></tr>
                )}
                {users.map((u, i) => (
                  <tr key={i}>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ ...S.avatar, width: "28px", height: "28px", fontSize: "11px", flexShrink: 0 }}>
                          {u.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "13px" }}>{u.name}</div>
                          <div style={{ fontSize: "11px", color: C.textMuted }}>{u.branch}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...S.td, color: C.textMuted, fontSize: "12px" }}>{u.role}</td>
                    <td style={S.td}><span style={S.badge2(u.status || "active")}>{u.status || "active"}</span></td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={{ ...S.btn("ghost"), padding: "4px 8px", fontSize: "11px" }} onClick={() => openEdit(u)}>{t("edit") || "Edit"}</button>
                        <button style={{ ...S.btn("danger"), padding: "4px 8px", fontSize: "11px", background: C.redDim, color: C.red, border: "none", borderRadius: "6px", cursor: "pointer" }} onClick={() => del(u._id)}>{t("del") || "Del"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={S.card}>
          <div style={S.cardHeader}><div style={S.cardTitle}>{t("systemRoles") || "System Roles"}</div></div>
          <div style={{ padding: "8px 0" }}>
            {ROLES.map((r, i) => (
              <div key={i} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "600", textTransform: "capitalize" }}>{r.replace("_", " ")}</div>
                  <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>{roleDesc[r]}</div>
                </div>
                <span style={{ fontSize: "11px", color: C.textMuted }}>{users.filter(u => u.role === r).length} {t("usersCount") || "users"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && editing && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={S.modalBox}>
            <div style={S.modalTitle}>{t("editUser") || "Edit User"} — {editing.name}</div>
            <div style={S.formRow}>
              <label style={S.formLabel}>{t("role") || "Role"}</label>
              <select style={S.select} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
              </select>
            </div>
            <div style={S.formRow}>
              <label style={S.formLabel}>{t("branch")}</label>
              <select style={S.select} value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })}>
                <option value="all">{t("allBranches") || "All Branches"}</option>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={S.formRow}>
              <label style={S.formLabel}>{t("status")}</label>
              <select style={S.select} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">{t("active") || "Active"}</option>
                <option value="inactive">{t("inactive") || "Inactive"}</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button style={S.btn("ghost")} onClick={() => setShowModal(false)}>{t("cancel") || "Cancel"}</button>
              <button style={S.btn("primary")} onClick={save}>{t("saveChanges") || "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── REPORTS PAGE ──────────────────────────────────────────────────────────────

export default Users;
