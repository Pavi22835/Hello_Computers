import Hero from "../../components/home/Hero";
import Categories from "../../components/home/Categories";
import FeaturedProducts from "../../components/home/FeaturedProducts";
import PopularProducts from "../../components/home/PopularProducts";
import WhyChooseUs from "../../components/home/WhyChooseUs";
import CtaBanner from "../../components/common/CtaBanner";

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <PopularProducts />
      <WhyChooseUs />
      <CtaBanner />
    </>
  );
}

export default Home;
