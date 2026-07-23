import { useContext, useState } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error(err);
      setLoggingOut(false);
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D1B2A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "#162333",
        borderRadius: "16px",
        border: "0.5px solid rgba(245,166,35,0.2)",
        overflow: "hidden",
      }}>
        {/* Header banner */}
        <div style={{
          background: "#F5A623",
          padding: "32px 24px 48px",
        }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#0D1B2A", letterSpacing: "1px", margin: 0 }}>
            GIGO BUSINESS COMPANY
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#0D1B2A", margin: "4px 0 0" }}>
            {t("profileTitle")}
          </h2>
        </div>

        {/* Avatar overlapping banner */}
        <div style={{ padding: "0 24px", marginTop: "-28px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#0D1B2A",
            border: "3px solid #F5A623",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: 600,
            color: "#F5A623",
            overflow: "hidden",
          }}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "16px 24px 24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>
            {user?.displayName || "Umukoresha"}
          </h3>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: "0 0 24px" }}>
            {user?.email}
          </p>

          {/* Detail rows */}
          {[
            { label: t("profileName"),        value: user?.displayName || "—" },
            { label: t("profileEmail"),        value: user?.email },
            { label: t("profileRole"),        value: user?.role === "owner" ? t("roleOwner") : user?.role === "branch_manager" ? t("roleBranchManager") : t("roleCustomer") },
            {
              label: "Konti yemejwe",
              value: user?.emailVerified ? t("profileVerifiedYes") : t("profileVerifiedNo"),
              valueColor: user?.emailVerified ? "#4ade80" : "#f87171",
            },
          ].map((row) => (
            <div key={row.label} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "0.5px solid rgba(245,166,35,0.1)",
            }}>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>{row.label}</span>
              <span style={{ fontSize: "13px", fontWeight: 500, color: row.valueColor || "#fff" }}>
                {row.value}
              </span>
            </div>
          ))}

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" }}>
            <button
              onClick={() => navigate("/orders")}
              style={{
                width: "100%",
                padding: "12px",
                background: "transparent",
                border: "1.5px solid #F5A623",
                borderRadius: "8px",
                color: "#F5A623",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {t("profileViewOrders")}
            </button>

            {/* Show dashboard link for staff */}
            {user?.role && user.role !== "customer" && (
              <button
                onClick={() => navigate("/admin/management")}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "transparent",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {t("profileDashboard")}
              </button>
            )}

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                width: "100%",
                padding: "12px",
                background: "#F5A623",
                border: "none",
                borderRadius: "8px",
                color: "#0D1B2A",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loggingOut ? "not-allowed" : "pointer",
                opacity: loggingOut ? 0.7 : 1,
              }}
            >
              {loggingOut ? t("profileLoggingOut") : t("profileLogout")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
