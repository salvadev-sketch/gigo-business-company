import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { languageOptions } from "../contexts/translations";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { language, setLanguage, t } = useContext(LanguageContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/",      label: t("home") },
    { to: "/shop",  label: t("products") },
    { to: "/about", label: t("about") },
    { to: "/blog",  label: t("news") },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <nav className={`gigo-navbar ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <Link to="/" className="gigo-logo">
          <div className="gigo-logo-icon">⚡</div>
          <span className="gigo-logo-text">GIGO BISINESS COMPANY</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="gigo-nav-links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`gigo-nav-link ${location.pathname === link.to ? "active" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop auth + language switcher */}
        <div className="gigo-nav-actions">
          <div className="gigo-lang-switch">
            <button
              className="gigo-lang-btn"
              onClick={() => setLangOpen((prev) => !prev)}
            >
              🌐 {languageOptions.find((l) => l.code === language)?.label}
            </button>
            {langOpen && (
              <ul className="gigo-lang-dropdown">
                {languageOptions.map((opt) => (
                  <li key={opt.code}>
                    <button
                      className={`gigo-lang-option ${opt.code === language ? "active" : ""}`}
                      onClick={() => {
                        setLanguage(opt.code);
                        setLangOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {user ? (
            <>
              <Link to="/orders" className="gigo-btn-outline">{t("orders")}</Link>
              <Link to="/profile" className="gigo-avatar" title={user.displayName || user.email}>
                {user.photoURL
                  ? <img src={user.photoURL} alt="avatar" />
                  : initials}
              </Link>
              <button onClick={handleLogout} className="gigo-btn-solid">{t("logout")}</button>
            </>
          ) : (
            <>
              <Link to="/login"  className="gigo-btn-outline">{t("login")}</Link>
              <Link to="/signup" className="gigo-btn-solid">{t("signup")}</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="gigo-hamburger"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Funga menu" : "Fungura menu"}
          aria-expanded={menuOpen}
        >
          <span className={`gigo-bar ${menuOpen ? "open" : ""}`} />
          <span className={`gigo-bar ${menuOpen ? "open" : ""}`} />
          <span className={`gigo-bar ${menuOpen ? "open" : ""}`} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div className={`gigo-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <ul>
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`gigo-mobile-link ${location.pathname === link.to ? "active" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {user ? (
            <>
              <li><Link to="/orders"  className="gigo-mobile-link">📋 {t("myOrders")}</Link></li>
              <li><Link to="/profile" className="gigo-mobile-link">👤 {t("myAccount")}</Link></li>
            </>
          ) : null}
        </ul>

        <div className="gigo-mobile-lang">
          {languageOptions.map((opt) => (
            <button
              key={opt.code}
              className={`gigo-lang-option-mobile ${opt.code === language ? "active" : ""}`}
              onClick={() => setLanguage(opt.code)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="gigo-mobile-auth">
          {user ? (
            <>
              <div className="gigo-mobile-user">
                <div className="gigo-avatar-sm">
                  {user.photoURL
                    ? <img src={user.photoURL} alt="avatar" />
                    : initials}
                </div>
                <div>
                  <div className="gigo-mobile-name">{user.displayName || t("user")}</div>
                  <div className="gigo-mobile-email">{user.email}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="gigo-btn-solid full">{t("logout")}</button>
            </>
          ) : (
            <>
              <Link to="/login"  className="gigo-btn-outline full">{t("login")}</Link>
              <Link to="/signup" className="gigo-btn-solid full">{t("signup")}</Link>
            </>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div className="gigo-backdrop" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}
