import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#0D1B2A", flexDirection:"column", gap:"16px", fontFamily:"'Inter',sans-serif" }}>
      <div style={{ fontSize:"48px" }}>🔒</div>
      <div style={{ fontSize:"22px", fontWeight:"800", color:"#F8F9FA" }}>{t("unauthorizedTitle")}</div>
      <div style={{ fontSize:"14px", color:"#8A9BB0", textAlign:"center", maxWidth:"320px" }}>
        {t("unauthorizedMsg")}
        {user && <span> {t("unauthorizedRole")} <strong style={{ color:"#F5A623" }}>{user.role || "customer"}</strong>.</span>}
      </div>
      <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
        <button onClick={() => navigate("/")} style={{ padding:"10px 20px", borderRadius:"8px", background:"#F5A623", color:"#0D1B2A", fontWeight:"700", border:"none", cursor:"pointer", fontSize:"13px" }}>
          {t("unauthorizedGoHome")}
        </button>
        <button onClick={() => navigate(-1)} style={{ padding:"10px 20px", borderRadius:"8px", background:"rgba(245,166,35,0.15)", color:"#F5A623", fontWeight:"700", border:"none", cursor:"pointer", fontSize:"13px" }}>
          {t("unauthorizedGoBack")}
        </button>
      </div>
    </div>
  );
};
export default Unauthorized;
