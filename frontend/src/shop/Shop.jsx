import { Card } from "flowbite-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Shop = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/all-products`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  return (
    <div className="mt-28 px-4 lg:px-24">
      <h2 className="text-5xl font-bold text-center">All Products Are Here</h2>
      <div className="grid gap-8 my-12 lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 grid-cols-1">
        {products.map((product) => (
          <Card key={product._id}>
            <img
              src={product.imageURL}
              alt={product.productName}
              className="h-96 w-full object-cover"
            />
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {product.productName}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              {product.description}
            </p>
            <p className="text-blue-700 font-semibold">{product.price} BIF</p>
            <Link to={`/product/${product._id}`}>
              <button className="bg-blue-700 font-semibold text-white py-2 rounded w-full">
                Reba Vyinshi
              </button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Shop;
