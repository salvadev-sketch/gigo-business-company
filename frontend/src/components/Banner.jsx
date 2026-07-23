import { Link } from "react-router-dom";
import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

const Banner = () => {
  const { t } = useContext(LanguageContext);

  
  return (
    <div style={{
      background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
      minHeight: "90vh",
      display: "flex",
      alignItems: "center",
      padding: "100px 5% 60px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "500px", height: "500px", background: "rgba(255,255,255,0.06)", borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "-100px", left: "20%", width: "350px", height: "350px", background: "rgba(255,255,255,0.04)", borderRadius: "50%", zIndex: 0 }} />

      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        gap: "40px",
        flexWrap: "wrap",
        zIndex: 2,
      }}>
        <div style={{ flex: "1 1 280px", zIndex: 2, maxWidth: "550px" }}>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 62px)",
            fontWeight: "900",
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: "20px",
            fontFamily: "'Inter', sans-serif",
          }}>
            {t("heroTitleLine1")}<br />
            <span style={{ color: "#FFF3E0" }}>{t("heroTitleLine2")}</span><br />
            {t("heroTitleLine3")}
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "clamp(14px, 2vw, 16px)",
            lineHeight: 1.7,
            marginBottom: "36px",
            maxWidth: "440px",
          }}>
            {t("heroSubtitle")}
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link to="/shop" style={{
              background: "#fff",
              color: "#FF6B35",
              padding: "14px 32px",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: "800",
              fontSize: "15px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}>
              {t("heroBtnShop")}
            </Link>
            <Link to="/about" style={{
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "15px",
              border: "2px solid rgba(255,255,255,0.4)",
            }}>
              {t("heroBtnAbout")}
            </Link>
          </div>

          <div style={{ display: "flex", gap: "32px", marginTop: "48px", flexWrap: "wrap" }}>
            {[
              { num: "4+", label: t("statBranches") },
              { num: "100+", label: t("statProducts") },
              { num: "1,000+", label: t("statCustomers") },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: "900", color: "#fff" }}>{s.num}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          flex: "1 1 280px",
          maxWidth: "500px",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          margin: "0 auto",
        }}>
          <div style={{
            position: "absolute",
            width: "320px",
            height: "320px",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "50%",
            zIndex: 0,
          }} />
          <img
            src="https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600"
            alt="GIGO Premium Drinks"
            style={{
              width: "100%",
              maxWidth: "380px",
              height: "clamp(280px, 40vw, 460px)",
              objectFit: "cover",
              borderRadius: "30px",
              boxShadow: "0 40px 80px rgba(0,0,0,0.3)",
              position: "relative",
              zIndex: 1,
            }}
          />
          <div style={{
            position: "absolute",
            bottom: "20px",
            left: "0px",
            background: "#fff",
            borderRadius: "16px",
            padding: "12px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{ fontSize: "20px" }}>🍾</span>
            <div>
              <div style={{ fontWeight: "800", fontSize: "12px", color: "#1a1a2e" }}>{t("badgePremiumTitle")}</div>
              <div style={{ fontSize: "10px", color: "#999" }}>{t("badgePremiumSubtitle")}</div>
            </div>
          </div>
          <div style={{
            position: "absolute",
            top: "20px",
            right: "0px",
            background: "#FF6B35",
            borderRadius: "16px",
            padding: "10px 14px",
            boxShadow: "0 8px 32px rgba(255,107,53,0.4)",
            zIndex: 3,
          }}>
            <div style={{ fontWeight: "800", fontSize: "12px", color: "#fff" }}>{t("badgeDeliveryTitle")}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)" }}>{t("badgeDeliverySubtitle")}</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-image { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Banner;
