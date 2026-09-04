import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../currency";
import { BranchContext } from "../contexts/BranchContext";
import { LanguageContext } from "../contexts/LanguageContext";

const CATEGORY_ORDER = ["Alcoholic", "Non-Alcoholic", "Food", "Other"];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { branch } = useContext(BranchContext);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    if (!branch) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/all-products?branch=${encodeURIComponent(branch)}`)
      .then((res) => res.json())
      .then((data) => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [branch]);

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat);
    return acc;
  }, {});
  // Catch any product with a category outside the known list
  const otherCats = products.filter(p => !CATEGORY_ORDER.includes(p.category));
  if (otherCats.length > 0) grouped["Uncategorized"] = otherCats;

  const ProductCard = (product) => (
    <div
      key={product._id}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col"
    >
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.imageURL}
          alt={product.productName}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "https://placehold.co/400x400?text=GIGO"; }}
        />

        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-white/90 text-gray-700 px-2 py-1 rounded-full">
          {product.category}
        </span>

        {product.stock === 0 && (
          <span className="absolute top-2 right-2 text-[10px] font-bold bg-red-600 text-white px-2 py-1 rounded-full">
            Out of Stock
          </span>
        )}
        {product.stock > 0 && product.stock <= (product.minStockLevel || 10) && (
          <span className="absolute top-2 right-2 text-[10px] font-bold bg-amber-500 text-white px-2 py-1 rounded-full">
            Low Stock
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pt-8 pb-3">
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 drop-shadow-sm">
            {product.productName}
          </h3>
          <span className="text-white font-bold text-base drop-shadow-sm">
            {formatPrice(product.price, product.branch)}
          </span>
        </div>
      </div>

      <Link to={`/product/${product._id}`} className="p-3">
        <button
          className="bg-blue-700 hover:bg-blue-800 transition-colors font-semibold text-white py-2 rounded-lg w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={product.stock === 0}
        >
          Reba Vyinshi
        </button>
      </Link>
    </div>
  );

  return (
    <div className="mt-28 px-4 lg:px-24 pb-16">
      <h2 className="text-5xl font-bold text-center mb-14">{branch ? `${t("products") || "Products"} — ${branch}` : "All Products Are Here"}</h2>

      {!branch ? null : loading ? (
        <div className="text-center py-20 text-gray-400">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No products found.</div>
      ) : (
        Object.entries(grouped).map(([category, items]) => {
          if (items.length === 0) return null;
          return (
            <section key={category} className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{category}</h3>
                <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {items.map(ProductCard)}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};

export default Shop;
