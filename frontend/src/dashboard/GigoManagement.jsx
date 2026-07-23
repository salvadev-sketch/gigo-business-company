import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { API, C, S, RESPONSIVE_CSS } from "./dashboardUtils";
import Dashboard from "./Dashboard";
import Products from "./Products";
import Inventory from "./Inventory";
import Orders from "./Orders";
import Branches from "./Branches";
import Users from "./Users";
import Reports from "./Reports";

export default function GigoManagement() {
  const { user, token } = useContext(AuthContext);
  const { language, setLanguage, translations } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Single t() for the whole file, language-aware
  const dashLang = language === "rn" ? "fr" : language;
  const t = (key) => translations[dashLang]?.[key] ?? translations["en"]?.[key] ?? key;

  useEffect(() => {
    if (!user && !token) navigate("/login", { replace: true });
  }, [user, token]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/inventory/low-stock`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setLowStockCount(d.count || 0))
      .catch(() => {});
  }, [token, active]);

  const logout = () => { navigate("/login", { replace: true }); };

  if (!token) {
    return (
      <div style={{ ...S.app, alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: C.textMuted, fontSize: "14px" }}>Loading...</div>
      </div>
    );
  }

  const NAV_ITEMS = [
    { id: "dashboard", icon: "⬡", label: t("dashboard") },
    { id: "products",  icon: "▦",  label: t("products") },
    { id: "inventory", icon: "◫",  label: t("inventory") },
    { id: "orders",    icon: "◈",  label: t("orders") },
    { id: "branches",  icon: "◉",  label: t("branches") },
    { id: "users",     icon: "◎",  label: t("users") },
    { id: "reports",   icon: "◧",  label: t("reports") },
  ];

  const PAGE_LABELS = {
    dashboard: t("dashboardTitle"),
    products:  t("products"),
    inventory: t("inventory"),
    orders:    t("orders"),
    branches:  t("branches"),
    users:     t("users"),
    reports:   t("reports"),
  };

  // Pass t and language down to all child pages
  const pageProps = { token, t, language };
  const PAGE_MAP = {
    dashboard: <Dashboard {...pageProps} />,
    products:  <Products {...pageProps} />,
    inventory: <Inventory {...pageProps} />,
    orders:    <Orders {...pageProps} />,
    branches:  <Branches {...pageProps} />,
    users:     <Users {...pageProps} />,
    reports:   <Reports {...pageProps} />,
  };

  return (
    <div className="gigo-app" style={S.app}>
      <style>{RESPONSIVE_CSS}</style>

      <div
        className={`gigo-backdrop ${sidebarOpen ? "gigo-backdrop-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`gigo-sidebar ${sidebarOpen ? "gigo-sidebar-open" : ""}`} style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoTop}>
            <div style={S.logoIcon}>G</div>
            <div style={S.logoText}>GIGO CO.</div>
          </div>
          <div style={S.logoSub}>{t("managementSystem")}</div>
        </div>
        <nav style={S.nav}>
          <div style={S.navLabel}>{t("menu")}</div>
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              style={S.navItem(active === item.id)}
              onClick={() => { setActive(item.id); setSidebarOpen(false); }}
            >
              <span style={S.navIcon}>{item.icon}</span>
              {item.label}
              {item.id === "inventory" && lowStockCount > 0 && (
                <span style={{ ...S.badge, marginLeft: "auto" }}>{lowStockCount}</span>
              )}
            </div>
          ))}
        </nav>
        <div style={S.sidebarFooter}>
          <div style={S.userCard} onClick={logout} title={t("clickToLogout")}>
            <div style={S.avatar}>{user?.email?.slice(0, 2).toUpperCase() || "OW"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email || "Owner"}
              </div>
              <div style={{ fontSize: "10px", color: C.textMuted }}>{t("clickToLogout")}</div>
            </div>
            <span style={{ color: C.textMuted, fontSize: "12px" }}>⏻</span>
          </div>
        </div>
      </aside>

      <main className="gigo-main" style={S.main}>
        <div style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              className="gigo-hamburger"
              onClick={() => setSidebarOpen(true)}
              style={{ alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "18px", color: C.text }}
            >
              ☰
            </div>
            <div style={S.pageTitle}>{PAGE_LABELS[active]}</div>
          </div>
          <div style={S.topbarRight}>
            {lowStockCount > 0 && (
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setActive("inventory")}>
                <span style={{ fontSize: "18px", color: C.textMuted }}>🔔</span>
                <span style={{ ...S.badge, position: "absolute", top: "-4px", right: "-6px" }}>{lowStockCount}</span>
              </div>
            )}
            {/* Language toggle */}
            <div style={{ display: "flex", gap: "4px" }}>
              {["en", "fr"].map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer", border: `1px solid ${dashLang === lang ? C.accent : C.border}`, background: dashLang === lang ? C.accent : "transparent", color: dashLang === lang ? C.bg : C.textMuted, textTransform: "uppercase" }}
                >
                  {lang}
                </button>
              ))}
            </div>
            <div style={{ width: "1px", height: "20px", background: C.border }} />
            <span style={{ fontSize: "12px", color: C.textMuted }}>
              {new Date().toLocaleDateString(dashLang === "fr" ? "fr-FR" : "en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
        <div className="gigo-content" style={S.content}>{PAGE_MAP[active]}</div>
      </main>
    </div>
  );
}
