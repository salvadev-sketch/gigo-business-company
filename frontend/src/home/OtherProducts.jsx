import { useEffect, useState } from "react";
import ProductCards from "../components/ProductCards";

const OtherProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/all-products`)
      .then((res) => res.json())
      .then((data) => setProducts((data.products || []).slice(4, 8)));
  }, []);

  return (
    <div>
      <ProductCards products={products} headline="Other Products" />
    </div>
  );
};

export default OtherProducts;
