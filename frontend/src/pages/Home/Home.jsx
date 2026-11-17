import Hero from "../../components/home/Hero";
import Categories from "../../components/home/Categories";
import FeaturedProducts from "../../components/home/FeaturedProducts";
import PopularProducts from "../../components/home/PopularProducts";
import WhyChooseUs from "../../components/home/WhyChooseUs";
import CtaBanner from "../../components/common/CtaBanner";
import { homePageDefaults } from "../../data/pageContent";
import { usePageContent } from "../../hooks/usePageContent";

function Home() {
  const { content, error } = usePageContent("home", homePageDefaults);

  return (
    <>
      {error && <p role="alert" className="mx-auto max-w-[1280px] px-5 pt-4 text-sm text-red-700 sm:px-8 lg:px-10">{error} Showing the default page content.</p>}
      <Hero content={content.hero} />
      <Categories content={content.categories} />
      <FeaturedProducts content={content.products} />
      <PopularProducts content={content.offers} />
      <WhyChooseUs content={content.benefits} />
      <CtaBanner {...content.cta} />
    </>
  );
}

export default Home;
