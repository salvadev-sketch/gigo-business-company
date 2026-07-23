import { BsFacebook, BsInstagram, BsTwitter, BsWhatsapp } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

const MyFooter = () => {
  const { t } = useContext(LanguageContext);
  return (
    <footer style={{
      background: "#1a1a2e",
      padding: "40px 5% 24px",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "32px",
        marginBottom: "32px",
      }}>
        {/* Brand */}
        <div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#FF6B35", marginBottom: "8px" }}>
            🍾 GIGO BUSINESS COMPANY LTD
          </div>
          <div style={{ fontSize: "13px", color: "#8A9BB0", maxWidth: "220px", lineHeight: 1.6 }}>
            {t("footerTagline")}
          </div>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              {t("footerLinks")}
            </div>
            {[
              { label: t("footerHome"), path: "/" },
              { label: t("footerProducts"), path: "/shop" },
              { label: t("footerAbout"), path: "/about" },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <Link to={item.path} style={{ color: "#8A9BB0", textDecoration: "none", fontSize: "13px" }}>
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              {t("footerContact")}
            </div>
            {[
              "+257 XX XX XX XX",
              "info@gigocompany.com",
              "Bujumbura, Burundi",
            ].map((item, i) => (
              <div key={i} style={{ color: "#8A9BB0", fontSize: "13px", marginBottom: "8px" }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingTop: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div style={{ color: "#8A9BB0", fontSize: "12px" }}>
          © {new Date().getFullYear()} GIGO BUSINESS COMPANY 
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          {[BsFacebook, BsInstagram, BsTwitter, BsWhatsapp].map((Icon, i) => (
            <a key={i} href="#" style={{ color: "#8A9BB0", fontSize: "18px", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#FF6B35"}
              onMouseLeave={e => e.currentTarget.style.color = "#8A9BB0"}
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default MyFooter;
