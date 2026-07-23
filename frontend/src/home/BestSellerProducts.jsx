import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../contexts/LanguageContext";

const CATEGORIES = ["Alcoholic", "Non-Alcoholic", "Food", "Other"];

const BestSellerProducts = () => {
  const { t } = useContext(LanguageContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/all-products?limit=20`)
      .then(res => res.json())
      .then(data => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "all"
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div style={{ padding: "70px 5%", background: "#FAFAFA" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "inline-block", background: "#FFF3E0", color: "#FF6B35", padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "12px" }}>
          {t("bestSellerBadge")}
        </div>
        <h2 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: "900", color: "#1a1a2e", marginBottom: "20px" }}>
          {t("bestSellerTitle")}
        </h2>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* All tab */}
          <button
            onClick={() => setActiveCategory("all")}
            style={{
              padding: "8px 20px", borderRadius: "50px", border: "none",
              cursor: "pointer", fontWeight: "700", fontSize: "13px",
              background: activeCategory === "all" ? "linear-gradient(135deg, #FF6B35, #F7931E)" : "#fff",
              color: activeCategory === "all" ? "#fff" : "#666",
              boxShadow: activeCategory === "all" ? "0 4px 15px rgba(255,107,53,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
              transition: "all 0.2s",
            }}
          >
            {t("categoryAll")}
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 20px",
                borderRadius: "50px",
                border: "none",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
                background: activeCategory === cat ? "linear-gradient(135deg, #FF6B35, #F7931E)" : "#fff",
                color: activeCategory === cat ? "#fff" : "#666",
                boxShadow: activeCategory === cat ? "0 4px 15px rgba(255,107,53,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#999", fontSize: "16px" }}>
          {t("loading")}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#999" }}>
          {t("noProducts")}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "20px",
        }}>
          {filtered.slice(0, 8).map((product, i) => (
            <Link key={i} to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: hovered === i ? "0 20px 50px rgba(255,107,53,0.2)" : "0 4px 16px rgba(0,0,0,0.06)",
                  transform: hovered === i ? "translateY(-6px)" : "translateY(0)",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ position: "relative", height: "200px", overflow: "hidden", background: "#f5f5f5" }}>
                  <img
                    src={product.imageURL}
                    alt={product.productName}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      transform: hovered === i ? "scale(1.06)" : "scale(1)",
                      transition: "transform 0.4s ease",
                    }}
                    onError={e => e.target.src = "https://via.placeholder.com/300x200?text=GIGO"}
                  />
                  <div style={{
                    position: "absolute", top: "10px", left: "10px",
                    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
                    color: "#fff", padding: "3px 10px", borderRadius: "20px",
                    fontSize: "10px", fontWeight: "700",
                  }}>
                    {product.category}
                  </div>
                  {hovered === i && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "rgba(255,107,53,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{
                        background: "#FF6B35", color: "#fff",
                        padding: "10px 24px", borderRadius: "50px",
                        fontWeight: "700", fontSize: "13px",
                        boxShadow: "0 4px 20px rgba(255,107,53,0.4)",
                      }}>
                        {t("buyNow")}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ padding: "16px" }}>
                  <h3 style={{
                    fontWeight: "800", fontSize: "14px", color: "#1a1a2e",
                    marginBottom: "3px", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {product.productName}
                  </h3>
                  <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "12px" }}>
                    {product.brandName}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "900", fontSize: "17px", color: "#FF6B35" }}>
                      FRw {product.price?.toLocaleString()}
                    </span>
                    <span style={{
                      background: "#FFF3E0", color: "#FF6B35",
                      padding: "6px 14px", borderRadius: "50px",
                      fontSize: "11px", fontWeight: "700",
                    }}>
                      {t("buyBtn")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Link to="/shop" style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #FF6B35, #F7931E)",
          color: "#fff", padding: "14px 40px", borderRadius: "50px",
          textDecoration: "none", fontWeight: "700", fontSize: "15px",
          boxShadow: "0 8px 24px rgba(255,107,53,0.3)",
        }}>
          {t("viewAll")}
        </Link>
      </div>
    </div>
  );
};

export default BestSellerProducts;
