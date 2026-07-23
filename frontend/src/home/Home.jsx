import Banner from "./Banner";
import BestSellerProducts from "./BestSellerProducts";

const Home = () => {
  return (
    <div style={{ background: "#FAFAFA", minHeight: "100vh" }}>
      <Banner />
      <BestSellerProducts />
    </div>
  );
};

export default Home;
