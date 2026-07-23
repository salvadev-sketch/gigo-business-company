import { useState, useEffect, useCallback, useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import { API, C, S, fmt, fmtM, timeAgo, stockStatus, BRANCHES, CATEGORIES, ROLES, MONTH_NAMES } from "./dashboardUtils";
import Spinner from "./Spinner";

function useT() {
  const { language, translations } = useContext(LanguageContext);
  const dashLang = language === "rn" ? "fr" : language;
  return (key) => translations[dashLang]?.[key] ?? translations["en"]?.[key] ?? key;
}

function Reports({ token, t }) {
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [branchPerf, setBranchPerf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(null);

  const generate = async (type) => {
    setLoading(true); setActive(type);
    try {
      if (type === "daily") {
        const r = await fetch(`${API}/report/daily`, { headers: { Authorization: `Bearer ${token}` } });
        setDaily(await r.json());
      } else if (type === "monthly") {
        const now = new Date();
        const r = await fetch(`${API}/report/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`, { headers: { Authorization: `Bearer ${token}` } });
        setMonthly(await r.json());
      } else if (type === "branch") {
        const r = await fetch(`${API}/report/branch-performance`, { headers: { Authorization: `Bearer ${token}` } });
        setBranchPerf(await r.json());
      }
    } catch (e) {
      console.error("Report generation error:", e);
    }
    setLoading(false);
  };

  const reportCards = [
    { type: "daily", title: t("dailySalesReport") || "Daily Sales Report", icon: "◈", desc: t("dailySalesDesc") || "Today's sales summary across all branches", color: C.green },
    { type: "monthly", title: t("monthlyFinancialReport") || "Monthly Financial Report", icon: "◧", desc: `${t("reportFor") || "Report for"} ${MONTH_NAMES[new Date().getMonth()]} ${new Date().getFullYear()}`, color: C.accent },
    { type: "branch", title: t("branchPerformance") || "Branch Performance", icon: "◉", desc: t("branchPerformanceDesc") || "Compare revenue and orders by branch", color: C.blue },
    { type: "weekly", title: t("weeklyReport") || "Weekly Report", icon: "◫", desc: t("weeklyReportDesc") || "Last 7 days summary", color: C.red },
  ];

  return (
    <div>
      <div className="gigo-section-header" style={S.sectionHeader}>
        <div><div style={S.sectionTitle}>{t("reportsAndAnalytics") || "Reports & Analytics"}</div></div>
      </div>
      <div className="gigo-kpi-grid" style={{ ...S.grid2, marginBottom: "16px" }}>
        {reportCards.map((r, i) => (
          <div key={i} style={{ ...S.card, padding: "20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ fontSize: "28px", color: r.color, marginTop: "2px" }}>{r.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "700", marginBottom: "4px" }}>{r.title}</div>
              <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "14px" }}>{r.desc}</div>
              <button style={S.btn("primary")} onClick={() => generate(r.type)} disabled={loading && active === r.type}>
                {loading && active === r.type ? t("generating") || "Generating..." : t("generate") || "Generate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {daily && active === "daily" && (
        <div style={{ ...S.card, marginBottom: "16px" }}>
          <div style={S.cardHeader}><div style={S.cardTitle}>{t("dailyReport") || "Daily Report"} — {t("today") || "Today"}</div></div>
          <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: "24px", fontWeight: "800", color: C.accent }}>FRw {fmtM(daily.summary?.totalRevenue || 0)}</div><div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px", textTransform: "uppercase" }}>{t("totalRevenue") || "Total Revenue"}</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: "24px", fontWeight: "800", color: C.green }}>{daily.summary?.totalOrders || 0}</div><div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px", textTransform: "uppercase" }}>{t("totalOrders") || "Total Orders"}</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: "24px", fontWeight: "800", color: C.blue }}>{Object.keys(daily.summary?.byBranch || {}).length}</div><div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px", textTransform: "uppercase" }}>{t("activeBranches") || "Active Branches"}</div></div>
          </div>
          {daily.summary?.byBranch && (
            <table className="gigo-table" style={S.table}>
              <thead><tr><th style={S.th}>{t("branch")}</th><th style={S.th}>{t("orders")}</th><th style={S.th}>{t("revenue") || "Revenue"}</th></tr></thead>
              <tbody>
                {Object.entries(daily.summary.byBranch).map(([branch, d], i) => (
                  <tr key={i}>
                    <td style={{ ...S.td, fontWeight: "600" }}>{branch}</td>
                    <td style={S.td}>{d.orderCount}</td>
                    <td style={{ ...S.td, color: C.accent, fontWeight: "700" }}>FRw {fmt(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {monthly && active === "monthly" && (
        <div style={{ ...S.card, marginBottom: "16px" }}>
          <div style={S.cardHeader}><div style={S.cardTitle}>{t("monthlyReport") || "Monthly Report"} — {MONTH_NAMES[(monthly.period?.month || 1) - 1]} {monthly.period?.year}</div></div>
          <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "16px" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: "24px", fontWeight: "800", color: C.accent }}>FRw {fmtM(monthly.summary?.totalRevenue || 0)}</div><div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px", textTransform: "uppercase" }}>{t("totalRevenue") || "Total Revenue"}</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: "24px", fontWeight: "800", color: C.green }}>{monthly.summary?.totalOrders || 0}</div><div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px", textTransform: "uppercase" }}>{t("totalOrders") || "Total Orders"}</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: "24px", fontWeight: "800", color: C.blue }}>{monthly.summary?.paidOrders || 0}</div><div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px", textTransform: "uppercase" }}>{t("paidOrders") || "Paid Orders"}</div></div>
          </div>
          {monthly.topProducts?.length > 0 && (
            <>
              <div style={{ ...S.cardHeader, borderTop: `1px solid ${C.border}` }}><div style={S.cardTitle}>{t("topProducts") || "Top Products"}</div></div>
              <table className="gigo-table" style={S.table}>
                <thead><tr><th style={S.th}>{t("product") || "Product"}</th><th style={S.th}>{t("unitsSold") || "Units Sold"}</th><th style={S.th}>{t("revenue") || "Revenue"}</th></tr></thead>
                <tbody>
                  {monthly.topProducts.map((p, i) => (
                    <tr key={i}>
                      <td style={{ ...S.td, fontWeight: "600" }}>{p.name}</td>
                      <td style={S.td}>{p.sold}</td>
                      <td style={{ ...S.td, color: C.accent, fontWeight: "700" }}>FRw {fmt(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {branchPerf && active === "branch" && (
        <div style={S.card}>
          <div style={S.cardHeader}><div style={S.cardTitle}>{t("branchPerformance") || "Branch Performance"} — {t("thisMonth")}</div></div>
          <table className="gigo-table" style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>{t("branch")}</th>
                <th style={S.th}>{t("orders")}</th>
                <th style={S.th}>{t("revenue") || "Revenue"}</th>
                <th style={S.th}>{t("staff") || "Staff"}</th>
                <th style={S.th}>{t("lowStock") || "Low Stock"}</th>
              </tr>
            </thead>
            <tbody>
              {(branchPerf.performance || []).map((b, i) => (
                <tr key={i}>
                  <td style={{ ...S.td, fontWeight: "600" }}>{b.branch}</td>
                  <td style={S.td}>{b.ordersThisMonth}</td>
                  <td style={{ ...S.td, color: C.accent, fontWeight: "700" }}>FRw {fmt(b.revenueThisMonth)}</td>
                  <td style={S.td}>{b.activeStaff}</td>
                  <td style={S.td}>
                    {b.lowStockAlerts > 0
                      ? <span style={S.badge2("Critical")}>{b.lowStockAlerts} {t("alerts") || "alerts"}</span>
                      : <span style={S.badge2("active")}>OK</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────

export default Reports;
