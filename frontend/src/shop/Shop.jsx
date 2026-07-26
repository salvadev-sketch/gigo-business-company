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
              <div className="w-full aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={product.imageURL}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "https://placehold.co/400x400?text=GIGO"; }}
                />
              </div>
              <div className="flex flex-col gap-1 p-4 flex-1">
                <span className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                  {product.category}
                </span>
                <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
                  {product.productName}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-blue-700 text-lg">
                    {product.price?.toLocaleString()} BIF
                  </span>
                  {product.stock <= (product.minStockLevel || 10) && product.stock > 0 && (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Low Stock
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
                <Link to={`/product/${product._id}`} className="mt-3">
                  <button
                    className="bg-blue-700 hover:bg-blue-800 transition-colors font-semibold text-white py-2 rounded-lg w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={product.stock === 0}
                  >
                    Reba Vyinshi
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
