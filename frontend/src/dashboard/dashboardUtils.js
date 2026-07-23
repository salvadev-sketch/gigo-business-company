// ── SHARED CONSTANTS, STYLES & HELPERS ───────────────────────────────────────

export const API = "https://gigo-backend-4iea.onrender.com";

export const C = {
  bg: "#0D1B2A", surface: "#1E2D3D", surfaceHover: "#243547",
  accent: "#F5A623", accentDim: "rgba(245,166,35,0.15)", accentGlow: "rgba(245,166,35,0.35)",
  green: "#4A9B7F", greenDim: "rgba(74,155,127,0.15)",
  red: "#C0392B", redDim: "rgba(192,57,43,0.15)",
  blue: "#2E86AB", blueDim: "rgba(46,134,171,0.15)",
  text: "#F8F9FA", textMuted: "#8A9BB0",
  border: "rgba(255,255,255,0.07)",
};

export const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const BRANCHES = ["Bujumbura HQ","Kampala","Uganda","DRC"];
export const ROLES = ["owner","branch_manager","sales_manager","warehouse_manager","cashier","employee"];
export const CATEGORIES = ["Alcoholic","Non-Alcoholic","Food","Other"];

export const fmt = (n) => new Intl.NumberFormat("fr-RW").format(Math.round(n || 0));
export const fmtM = (n) => {
  const num = Number(n);
  if (isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return String(Math.round(num));
};
export const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
export const stockStatus = (p) => {
  if (!p.stock || p.stock === 0) return "Out of Stock";
  if (p.stock <= p.minStockLevel) return "Critical";
  if (p.stock <= p.minStockLevel * 2) return "Low Stock";
  return "In Stock";
};

export const S = {
  app: { fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: C.bg, minHeight: "100vh", display: "flex", color: C.text, fontSize: "14px" },
  sidebar: { width: "220px", flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100 },
  logo: { padding: "24px 20px 20px", borderBottom: `1px solid ${C.border}` },
  logoTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" },
  logoIcon: { width: "36px", height: "36px", background: C.accent, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: C.bg, fontWeight: "900", flexShrink: 0 },
  logoText: { fontSize: "15px", fontWeight: "800", color: C.text, lineHeight: 1.2, letterSpacing: "0.04em" },
  logoSub: { fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: "46px" },
  nav: { flex: 1, padding: "16px 12px", overflowY: "auto" },
  navLabel: { fontSize: "10px", color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px" },
  navItem: (a) => ({ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", cursor: "pointer", marginBottom: "2px", background: a ? C.accentDim : "transparent", borderLeft: a ? `3px solid ${C.accent}` : "3px solid transparent", color: a ? C.accent : C.textMuted, fontWeight: a ? "600" : "400", fontSize: "13.5px", transition: "all 0.15s", userSelect: "none" }),
  navIcon: { fontSize: "16px", width: "18px", textAlign: "center", flexShrink: 0 },
  sidebarFooter: { padding: "16px 12px", borderTop: `1px solid ${C.border}` },
  userCard: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: C.accentDim, borderRadius: "10px", cursor: "pointer" },
  avatar: { width: "32px", height: "32px", borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: C.bg, flexShrink: 0 },
  main: { marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
  topbar: { background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 28px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 },
  pageTitle: { fontSize: "17px", fontWeight: "700", color: C.text },
  topbarRight: { display: "flex", alignItems: "center", gap: "12px" },
  badge: { background: C.red, color: "#fff", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "10px" },
  content: { padding: "24px 28px", flex: 1 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "20px" },
  card: { background: C.surface, borderRadius: "12px", border: `1px solid ${C.border}`, overflow: "hidden" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.border}` },
  cardTitle: { fontSize: "13px", fontWeight: "700", color: C.text, letterSpacing: "0.02em", textTransform: "uppercase" },
  kpiCard: { background: C.surface, borderRadius: "12px", border: `1px solid ${C.border}`, padding: "20px", position: "relative", overflow: "hidden" },
  kpiBar: (col) => ({ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: col }),
  kpiIcon: (col) => ({ fontSize: "20px", color: col, marginBottom: "12px", display: "block" }),
  kpiVal: { fontSize: "26px", fontWeight: "800", color: C.text, lineHeight: 1, marginBottom: "6px", letterSpacing: "-0.02em" },
  kpiLabel: { fontSize: "11px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  kpiDelta: (up) => ({ fontSize: "11px", fontWeight: "600", color: up ? C.green : C.red, display: "flex", alignItems: "center", gap: "4px" }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 16px", textAlign: "left", fontWeight: "600", borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.02)" },
  td: { padding: "12px 16px", fontSize: "13px", color: C.text, borderBottom: `1px solid ${C.border}`, verticalAlign: "middle" },
  badge2: (st) => {
    const m = {
      "Active": { bg: C.greenDim, col: C.green }, "active": { bg: C.greenDim, col: C.green },
      "Completed": { bg: C.greenDim, col: C.green }, "delivered": { bg: C.greenDim, col: C.green },
      "In Stock": { bg: C.greenDim, col: C.green }, "paid": { bg: C.greenDim, col: C.green },
      "Processing": { bg: C.blueDim, col: C.blue }, "processing": { bg: C.blueDim, col: C.blue },
      "pending_approval": { bg: C.blueDim, col: C.blue },
      "Pending": { bg: "rgba(245,166,35,0.15)", col: C.accent }, "pending": { bg: "rgba(245,166,35,0.15)", col: C.accent },
      "Low Stock": { bg: "rgba(245,166,35,0.15)", col: C.accent },
      "Inactive": { bg: C.redDim, col: C.red }, "inactive": { bg: C.redDim, col: C.red },
      "Critical": { bg: C.redDim, col: C.red }, "Out of Stock": { bg: C.redDim, col: C.red },
      "cancelled": { bg: C.redDim, col: C.red }, "unpaid": { bg: C.redDim, col: C.red },
    };
    const s = m[st] || { bg: C.border, col: C.textMuted };
    return { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", background: s.bg, color: s.col };
  },
  btn: (v = "primary") => ({ padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", letterSpacing: "0.04em", cursor: "pointer", border: "none", outline: "none", background: v === "primary" ? C.accent : v === "danger" ? "transparent" : C.accentDim, color: v === "primary" ? C.bg : v === "danger" ? C.red : C.accent, transition: "opacity 0.15s" }),
  input: { background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px 14px", color: C.text, fontSize: "13px", outline: "none", width: "100%" },
  select: { background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px 14px", color: C.text, fontSize: "13px", outline: "none", width: "100%" },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: C.text },
  pill: (l) => { const c = l === "Alcoholic" ? { bg: "rgba(192,57,43,0.15)", col: "#E74C3C" } : { bg: C.blueDim, col: C.blue }; return { display: "inline-block", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "700", background: c.bg, color: c.col }; },
  chartBar: (pct, col) => ({ height: "8px", background: `linear-gradient(90deg,${col} ${pct}%,${C.border} ${pct}%)`, borderRadius: "4px", width: "100%" }),
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modalBox: { background: C.surface, borderRadius: "16px", border: `1px solid ${C.border}`, padding: "28px", width: "480px", maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto" },
  modalTitle: { fontSize: "16px", fontWeight: "800", marginBottom: "20px", color: C.text },
  formRow: { marginBottom: "14px" },
  formLabel: { fontSize: "11px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px", display: "block" },
  spinner: { display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", color: C.textMuted, fontSize: "13px" },
  alert: (t) => ({ padding: "10px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", marginBottom: "14px", background: t === "error" ? C.redDim : C.greenDim, color: t === "error" ? C.red : C.green, border: `1px solid ${t === "error" ? C.red : C.green}` }),
};

export const RESPONSIVE_CSS = `
  .gigo-app { overflow-x: hidden; }
  .gigo-hamburger { display: none; }
  .gigo-backdrop { display: none; }
  @media (max-width: 880px) {
    .gigo-main { overflow-x: hidden; }
    .gigo-sidebar { transform: translateX(-100%); transition: transform 0.25s ease; box-shadow: 2px 0 24px rgba(0,0,0,0.4); }
    .gigo-sidebar.gigo-sidebar-open { transform: translateX(0); }
    .gigo-main { margin-left: 0 !important; }
    .gigo-hamburger { display: flex; }
    .gigo-backdrop.gigo-backdrop-open { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 90; }
    .gigo-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .gigo-2col-grid { grid-template-columns: 1fr !important; }
    .gigo-content { padding: 14px 12px !important; }
    .gigo-kpi-card { padding: 12px !important; }
    table.gigo-table { display: block !important; overflow-x: auto !important; white-space: nowrap !important; }
  }
`;

