import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../contexts/LanguageContext";
import { formatPrice } from "../currency";

const CATEGORIES = ["Alcoholic", "Non-Alcoholic", "Food", "Other"];

const ProductRow = ({ category, products, t }) => {
  const [hovered, setHovered] = useState(null);
  if (products.length === 0) return null;

  return (
    <div style={{ marginBottom: "48px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <h3 style={{ fontSize: "clamp(18px, 3vw, 24px)", fontWeight: "800", color: "#1a1a2e", margin: 0 }}>
          {category}
        </h3>
        <Link to={`/shop?category=${encodeURIComponent(category)}`} style={{
          background: "#fff", color: "#FF6B35", padding: "8px 18px", borderRadius: "50px",
          textDecoration: "none", fontWeight: "700", fontSize: "13px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)", whiteSpace: "nowrap",
        }}>
          {t("viewAll")}
        </Link>
      </div>

      <div style={{
        display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "8px",
        scrollbarWidth: "none",
      }} className="gigo-scroll-row">
        {products.map((product, i) => {
          const key = `${category}-${i}`;
          return (
            <Link key={key} to={`/product/${product._id}`} style={{ textDecoration: "none", flex: "0 0 auto", width: "220px" }}>
              <div
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "#fff", borderRadius: "20px", overflow: "hidden",
                  boxShadow: hovered === key ? "0 20px 50px rgba(255,107,53,0.2)" : "0 4px 16px rgba(0,0,0,0.06)",
                  transform: hovered === key ? "translateY(-6px)" : "translateY(0)",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ position: "relative", height: "200px", overflow: "hidden", background: "#f5f5f5" }}>
                  <img
                    src={product.imageURL}
                    alt={product.productName}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      transform: hovered === key ? "scale(1.06)" : "scale(1)",
                      transition: "transform 0.4s ease",
                    }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=GIGO"; }}
                  />
                  {hovered === key && (
                    <div style={{
                      position: "absolute", inset: 0, background: "rgba(255,107,53,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{
                        background: "#FF6B35", color: "#fff", padding: "10px 24px", borderRadius: "50px",
                        fontWeight: "700", fontSize: "13px", boxShadow: "0 4px 20px rgba(255,107,53,0.4)",
                      }}>
                        {t("buyNow")}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ padding: "16px" }}>
                  <h3 style={{
                    fontWeight: "800", fontSize: "14px", color: "#1a1a2e", marginBottom: "3px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {product.productName}
                  </h3>
                  <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "12px" }}>{product.brandName}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "900", fontSize: "17px", color: "#FF6B35" }}>
                      {formatPrice(product.price, product.branch)}
                    </span>
                    <span style={{
                      background: "#FFF3E0", color: "#FF6B35", padding: "6px 14px", borderRadius: "50px",
                      fontSize: "11px", fontWeight: "700",
                    }}>
                      {t("buyBtn")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const BestSellerProducts = () => {
  const { t } = useContext(LanguageContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/all-products?limit=100`)
      .then((res) => res.json())
      .then((data) => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const grouped = CATEGORIES.map((category) => ({
    category,
    items: products.filter((p) => p.category === category),
  })).filter((row) => row.items.length > 0);

  return (
    <div style={{ padding: "70px 5%", background: "#FAFAFA" }}>
      <style>{`.gigo-scroll-row::-webkit-scrollbar { display: none; }`}</style>

      <div style={{ marginBottom: "40px" }}>
        <div style={{
          display: "inline-block", background: "#FFF3E0", color: "#FF6B35", padding: "5px 14px",
          borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "12px",
        }}>
          {t("bestSellerBadge")}
        </div>
        <h2 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: "900", color: "#1a1a2e", margin: 0 }}>
          {t("bestSellerTitle")}
        </h2>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#999", fontSize: "16px" }}>
          {t("loading")}
        </div>
      ) : grouped.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#999" }}>{t("noProducts")}</div>
      ) : (
        grouped.map(({ category, items }) => (
          <ProductRow key={category} category={category} products={items} t={t} />
        ))
      )}

      <div style={{ textAlign: "center", marginTop: "8px" }}>
        <Link to="/shop" style={{
          display: "inline-block", background: "linear-gradient(135deg, #FF6B35, #F7931E)",
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
