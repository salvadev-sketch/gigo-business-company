import { useState, useEffect, useCallback, useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import { API, C, S, fmt, fmtM, timeAgo, stockStatus, BRANCHES, CATEGORIES, ROLES, MONTH_NAMES } from "./dashboardUtils";
import Spinner from "./Spinner";

function useT() {
  const { language, translations } = useContext(LanguageContext);
  const dashLang = language === "rn" ? "fr" : language;
  return (key) => translations[dashLang]?.[key] ?? translations["en"]?.[key] ?? key;
}

function Dashboard({ token, t, language }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const dashLang = language === "rn" ? "fr" : language;

  useEffect(() => {
    fetch(`${API}/stats/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  if (!stats) return <div style={S.alert("error")}>{t("loadError") || "Failed to load dashboard data."}</div>;

  const { kpis = {}, monthlyRevenue = [], bestSellers = [], recentOrders = [] } = stats;
  const now = new Date();

  const chartData = monthlyRevenue.map(m => ({
    month: MONTH_NAMES[(m._id.month || 1) - 1],
    value: Math.round(((m.total || 0) / 1_000_000) * 10) / 10,
    total: m.total || 0,
  }));

  const kpiCards = [
    { label: t("revenueThisMonth"), value: `FRw ${fmtM(kpis.revenueThisMonth || 0)}`, delta: kpis.revenueDelta ? `${kpis.revenueDelta > 0 ? "+" : ""}${kpis.revenueDelta}% vs last month` : t("noPrevData"), up: (kpis.revenueDelta || 0) >= 0, icon: "◈", color: C.accent },
    { label: t("ordersThisMonth"), value: fmt(kpis.ordersThisMonth || 0), delta: kpis.ordersDelta ? `${kpis.ordersDelta > 0 ? "+" : ""}${kpis.ordersDelta}% vs last month` : t("noPrevData"), up: (kpis.ordersDelta || 0) >= 0, icon: "▦", color: C.green },
    { label: t("totalProducts"), value: fmt(kpis.totalProducts || 0), delta: t("registered"), up: true, icon: "◫", color: C.blue },
    { label: t("lowStockAlerts"), value: fmt(kpis.lowStockAlerts || 0), delta: (kpis.lowStockAlerts || 0) > 0 ? t("needsAttention") : t("allGood"), up: (kpis.lowStockAlerts || 0) === 0, icon: "⚠", color: C.red },
  ];

  const maxSold = bestSellers[0]?.totalSold || 1;

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "22px", fontWeight: "800", color: C.text, marginBottom: "4px" }}>{t("dashboardGreeting")}</div>
        <div style={{ fontSize: "13px", color: C.textMuted }}>
          {t("dashboardSubtitle")} — {now.toLocaleDateString(dashLang === "fr" ? "fr-FR" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      <div className="gigo-kpi-grid" style={S.grid4}>
        {kpiCards.map((k, i) => (
          <div key={i} className="gigo-kpi-card" style={S.kpiCard}>
            <div style={S.kpiBar(k.color)} />
            <span className="gigo-kpi-icon" style={S.kpiIcon(k.color)}>{k.icon}</span>
            <div className="gigo-kpi-val" style={S.kpiVal}>{k.value}</div>
            <div className="gigo-kpi-label" style={S.kpiLabel}>{k.label}</div>
            <div style={S.kpiDelta(k.up)}><span>{k.up ? "▲" : "▼"}</span>{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="gigo-2col-grid" style={S.grid2}>
        <div style={S.card}>
          <div style={S.cardHeader}><div style={S.cardTitle}>{t("recentOrders")}</div></div>
          <table className="gigo-table" style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>{t("customer")}</th>
                <th style={S.th}>{t("branch")}</th>
                <th style={S.th}>{t("total")}</th>
                <th style={S.th}>{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", color: C.textMuted }}>{t("noOrders")}</td></tr>
              )}
              {recentOrders.map((o, i) => (
                <tr key={i}>
                  <td style={S.td}>
                    <div style={{ fontWeight: "600" }}>{o.customerName}</div>
                    <div style={{ fontSize: "11px", color: C.textMuted }}>{timeAgo(o.createdAt)}</div>
                  </td>
                  <td style={{ ...S.td, color: C.textMuted, fontSize: "12px" }}>{o.branch}</td>
                  <td style={{ ...S.td, fontWeight: "700", color: C.accent }}>FRw {fmt(o.totalAmount)}</td>
                  <td style={S.td}><span style={S.badge2(o.status)}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardTitle}>{t("bestSelling")}</div>
            <span style={{ fontSize: "11px", color: C.textMuted }}>{t("thisMonth")}</span>
          </div>
          <div style={{ padding: "8px 0" }}>
            {bestSellers.length === 0 && (
              <div style={{ padding: "20px", color: C.textMuted, fontSize: "13px", textAlign: "center" }}>{t("noSales")}</div>
            )}
            {bestSellers.map((p, i) => (
              <div key={i} style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "600", fontSize: "13px" }}>{p._id}</span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: C.accent }}>FRw {fmtM(p.totalRevenue)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={S.chartBar(Math.round((p.totalSold / maxSold) * 100), C.accent)} />
                  <span style={{ fontSize: "11px", color: C.textMuted, whiteSpace: "nowrap" }}>{p.totalSold} sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardHeader}>
          <div style={S.cardTitle}>{t("monthlyRevenue")}</div>
          <span style={{ fontSize: "11px", color: C.green, fontWeight: "700" }}>
            {kpis.revenueDelta && kpis.revenueDelta > 0 ? `▲ +${kpis.revenueDelta}% vs last month` : ""}
          </span>
        </div>
        <div style={{ padding: "16px 20px 8px" }}>
          {chartData.length > 0 ? (
            <>
              <SparkBar data={chartData} />
              <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
                {chartData.map((d, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontWeight: "700", fontSize: "12px", color: i === chartData.length - 1 ? C.accent : C.text }}>
                      FRw {fmtM(d.total)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: C.textMuted, fontSize: "13px", padding: "16px 0" }}>{t("noRevenue")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PRODUCTS PAGE ─────────────────────────────────────────────────────────────

export default Dashboard;
