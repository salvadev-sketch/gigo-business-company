import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards, Autoplay } from 'swiper/modules';

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=500",
    name: "Jack Daniel's Whiskey",
    price: "FRw 45,000",
  },
  {
    img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500",
    name: "Premium Red Wine",
    price: "FRw 28,000",
  },
  {
    img: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500",
    name: "Heineken Beer",
    price: "FRw 5,000",
  },
  {
    img: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=500",
    name: "Vodka Premium",
    price: "FRw 32,000",
  },
  {
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
    name: "Champagne",
    price: "FRw 65,000",
  },
];

const BarnnerCard = () => {
  return (
    <div style={{ padding: "20px 0", display: "flex", justifyContent: "center" }}>
      <Swiper
        effect="cards"
        grabCursor={true}
        modules={[EffectCards, Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        style={{ width: "280px", height: "360px" }}
      >
        {SLIDES.map((slide, i) => (
          <SwiperSlide key={i} style={{
            borderRadius: "20px",
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <img
              src={slide.img}
              alt={slide.name}
              style={{ width: "100%", height: "280px", objectFit: "cover" }}
            />
            <div style={{ padding: "16px", background: "#fff" }}>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#333", marginBottom: "4px" }}>
                {slide.name}
              </div>
              <div style={{ fontWeight: "800", fontSize: "16px", color: "#FF6B35" }}>
                {slide.price}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BarnnerCard;
