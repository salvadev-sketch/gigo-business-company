import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/all-products`)
      .then((res) => res.json())
      .then((data) => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mt-28 px-4 lg:px-24 pb-16">
      <h2 className="text-5xl font-bold text-center mb-12">All Products Are Here</h2>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No products found.</div>
      ) : (
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
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

                {/* Category badge - top left */}
                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-white/90 text-gray-700 px-2 py-1 rounded-full">
                  {product.category}
                </span>

                {/* Stock badge - top right */}
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

                {/* Name + price overlay - bottom gradient scrim */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pt-8 pb-3">
                  <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 drop-shadow-sm">
                    {product.productName}
                  </h3>
                  <span className="text-white font-bold text-base drop-shadow-sm">
                    {product.price?.toLocaleString()} BIF
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
