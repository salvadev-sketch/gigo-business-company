import { Link } from "react-router-dom";

const FavProducts = () => {
  return (
    <div className="px-4 lg:px-24 my-20">
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="md:w-1/2 flex justify-center">
          <img
            src="/assets/products.jpg"
            alt="products"
            className="rounded-lg w-full max-w-sm shadow-lg"
          />
        </div>

        <div className="md:w-1/2 space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug">
            Find Your Favorite{" "}
            <span className="text-blue-700">Products Here</span>
          </h2>

          <p className="text-lg text-gray-600">
            Discover a wide range of alcoholic and non-alcoholic beverages.
            Browse our products, compare options, and find the perfect drink
            for every occasion.
          </p>

          <div className="flex justify-between items-center bg-gray-100 p-6 rounded-lg shadow-md">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-blue-700">800+</h3>
              <p className="text-sm md:text-base text-gray-600">Products</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-green-700">550+</h3>
              <p className="text-sm md:text-base text-gray-600">Customers</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-red-700">1200+</h3>
              <p className="text-sm md:text-base text-gray-600">Orders</p>
            </div>
          </div>

          <Link to="/shop" className="mt-12 block">
            <button className="bg-blue-700 text-white font-semibold px-5 py-2 rounded hover:bg-black transition-all duration-300">
              Explore More
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FavProducts;
