// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import required modules
import { Pagination } from "swiper/modules";

// Import React icons
import { FaStar } from "react-icons/fa6";
import { Avatar } from "flowbite-react";
import profile from  "/assets/salvator.jpg";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const Review = () => {
  // Sample reviews data
  const reviews = [
    {
      id: 1,
      name: "Salvator Ahishakiye",
      title: "CEO, Salvator energy Group Company",
      image: profile,
      rating: 4,
      review:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas voluptates beatae eveniet perspiciatis, corporis eum obcaecati? Beatae unde voluptatum incidunt, fuga recusandae quo nisi pariatur esse quidem, iusto, quasi iure?",
    },
    {
      id: 2,
      name: "Salvator Ahishakiye",
      title: "Founder, Tech Solutions",
      image: profile,
      rating: 5,
      review:
        "This company has exceeded my expectations! The team is professional and the services are top-notch. I highly recommend them to anyone looking for quality.",
    },
    {
      id: 3,
      name: "Salvator Ahishakiye",
      title: "Manager, Creative Studio",
      image: profile,
      rating: 5,
      review:
        "Absolutely love their work! The customer service is fantastic, and the results speak for themselves. Will definitely come back again!",
    },
  ];

  return (
    <div className="my-12 px-6 lg:px-24">
      <h2 className="text-4xl lg:text-5xl font-bold text-center mb-10 leading-snug">
        Our Customers
      </h2>

      <Swiper
        spaceBetween={30}
        slidesPerView={1}
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 40 },
          1024: { slidesPerView: 3, spaceBetween: 50 },
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <div className="p-6 border border-gray-200 rounded-xl shadow-lg bg-white">
              {/* Star Ratings */}
              <div className="text-amber-500 flex gap-1 mb-3">
                {Array(review.rating)
                  .fill()
                  .map((_, i) => (
                    <FaStar key={i} />
                  ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-600 italic">{review.review}</p>

              {/* User Info */}
              <div className="flex items-center gap-4 mt-5">
                <Avatar img={review.image} alt={review.name} rounded className="w-12 h-12" />
                <div>
                  <h5 className="text-lg font-semibold">{review.name}</h5>
                  <p className="text-gray-500 text-sm">{review.title}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <div className="p-6 border border-gray-200 rounded-xl shadow-lg bg-white">
              {/* Star Ratings */}
              <div className="text-amber-500 flex gap-1 mb-3">
                {Array(review.rating)
                  .fill()
                  .map((_, i) => (
                    <FaStar key={i} />
                  ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-600 italic">{review.review}</p>

              {/* User Info */}
              <div className="flex items-center gap-4 mt-5">
                <Avatar img={review.image} alt={review.name} rounded className="w-12 h-12" />
                <div>
                  <h5 className="text-lg font-semibold">{review.name}</h5>
                  <p className="text-gray-500 text-sm">{review.title}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <div className="p-6 border border-gray-200 rounded-xl shadow-lg bg-white">
              {/* Star Ratings */}
              <div className="text-amber-500 flex gap-1 mb-3">
                {Array(review.rating)
                  .fill()
                  .map((_, i) => (
                    <FaStar key={i} />
                  ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-600 italic">{review.review}</p>

              {/* User Info */}
              <div className="flex items-center gap-4 mt-5">
                <Avatar img={review.image} alt={review.name} rounded className="w-12 h-12" />
                <div>
                  <h5 className="text-lg font-semibold">{review.name}</h5>
                  <p className="text-gray-500 text-sm">{review.title}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Review;
