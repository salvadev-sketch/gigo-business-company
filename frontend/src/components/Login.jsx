import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

const C = {
  bg: "#0D1B2A", surface: "#1E2D3D", accent: "#F5A623",
  text: "#F8F9FA", textMuted: "#8A9BB0", border: "rgba(255,255,255,0.07)",
  red: "#C0392B", redDim: "rgba(192,57,43,0.15)",
};

const Login = () => {
  const { login } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("loginInvalidEmail"));
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || t("loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:"420px" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ width:"52px", height:"52px", background:C.accent, borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", fontWeight:"900", color:C.bg, margin:"0 auto 14px" }}>G</div>
          <div style={{ fontSize:"22px", fontWeight:"800", color:C.text, letterSpacing:"0.04em" }}>GIGO CO.</div>
          <div style={{ fontSize:"12px", color:C.textMuted, marginTop:"4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>{t("loginManagement")}</div>
        </div>
        <div style={{ background:C.surface, borderRadius:"16px", border:`1px solid ${C.border}`, padding:"32px" }}>
          <div style={{ marginBottom:"24px" }}>
            <div style={{ fontSize:"18px", fontWeight:"800", color:C.text, marginBottom:"4px" }}>{t("loginTitle")}</div>
            <div style={{ fontSize:"13px", color:C.textMuted }}>{t("loginSubtitle")}</div>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:"14px" }}>
              <label style={{ display:"block", fontSize:"11px", color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" }}>{t("loginEmail")}</label>
              <input type="email" name="email" required placeholder="example@email.com" style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"10px 14px", color:C.text, fontSize:"13px", outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ marginBottom:"24px" }}>
              <label style={{ display:"block", fontSize:"11px", color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" }}>{t("loginPassword")}</label>
              <div style={{ position:"relative" }}>
                <input type={showPassword ? "text" : "password"} name="password" required placeholder="••••••••" style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"10px 50px 10px 14px", color:C.text, fontSize:"13px", outline:"none", boxSizing:"border-box" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.textMuted, fontSize:"12px", cursor:"pointer", padding:0 }}>
                  {showPassword ? t("loginHide") : t("loginShow")}
                </button>
              </div>
            </div>
            {error && <div style={{ background:C.redDim, border:`1px solid ${C.red}`, borderRadius:"8px", padding:"10px 14px", fontSize:"12px", color:C.red, fontWeight:"600", marginBottom:"16px" }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width:"100%", background:C.accent, color:C.bg, border:"none", borderRadius:"8px", padding:"12px", fontSize:"14px", fontWeight:"800", cursor:loading?"not-allowed":"pointer", letterSpacing:"0.04em", opacity:loading?0.7:1, transition:"opacity 0.15s" }}>
              {loading ? t("loginLoading") : t("loginSubmit")}
            </button>
          </form>
          <p style={{ textAlign:"center", marginTop:"20px", fontSize:"13px", color:C.textMuted }}>
            {t("loginNoAccount")}{" "}
            <Link to="/signup" style={{ color:C.accent, fontWeight:"600", textDecoration:"none" }}>{t("loginSignupHere")}</Link>
          </p>
        </div>
        <div style={{ textAlign:"center", marginTop:"20px", fontSize:"12px", color:C.textMuted }}>
          GIGO Company Limited © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
export default Login;
