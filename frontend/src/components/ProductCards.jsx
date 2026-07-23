import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

const ProductCards = ({ headline, products }) => {
  return (
    <div className="my-16 px-4 lg:px-24">
      <h2 className="text-5xl text-center font-bold text-black my-5">
        {headline}
      </h2>
      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 4, spaceBetween: 40 },
          1024: { slidesPerView: 5, spaceBetween: 50 },
        }}
        modules={[Pagination]}
        className="mySwiper w-full h-full"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <Link to={`/product/${product._id}`}>
              <div className="relative">
                <img
                  src={product.imageURL}
                  alt={product.productName}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute top-3 right-3 bg-blue-600 hover:bg-black p-2 rounded">
                  <FaCartShopping className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-center mt-2">
                <h3 className="text-xl font-semibold">
                  {product.productName}
                </h3>
                <p>{product.category}</p>
                <div>
                  <p>{product.price} BIF</p>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductCards;
