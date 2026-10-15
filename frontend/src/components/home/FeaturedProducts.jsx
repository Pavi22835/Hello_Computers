import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "../common/Reveal";
import SectionHeading from "../common/SectionHeading";
import StoreProductCard from "../products/StoreProductCard";
import { products } from "../../data/storeContent";
import { useCart } from "../../hooks/useCart";

const featured = [1, 4, 5, 6].map((id) => products.find((product) => product.id === id));

function FeaturedProducts() {
  const { addToCart } = useCart();

  return (
    <section className="bg-soft-gradient py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="Featured" title="Popular picks" accent="this month." copy="Top-rated machines and accessories chosen by our customers.">
          <Link to="/products" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">View all products <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link>
        </SectionHeading>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.07}><StoreProductCard product={product} onAddToCart={addToCart} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
