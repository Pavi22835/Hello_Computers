import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "../common/Reveal";
import SectionHeading from "../common/SectionHeading";
import StoreProductCard from "../products/StoreProductCard";
import { useCart } from "../../hooks/useCart";
import { getProducts } from "../../services/product.service";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;
    getProducts()
      .then((result) => { if (active) setProducts(result.slice(0, 4)); })
      .catch((issue) => { if (active) setError(issue.response?.data?.message || "Featured products are unavailable."); });
    return () => { active = false; };
  }, []);

  return (
    <section className="bg-soft-gradient py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="Featured" title="Popular picks" accent="from our store." copy="The latest products and availability from Hello Computers.">
          <Link to="/products" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">View all products <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link>
        </SectionHeading>

        {error ? <p role="alert" className="mt-8 text-sm text-red-700">{error}</p> : products.length > 0 && (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <Reveal key={product.id} delay={index * 0.07}><StoreProductCard product={product} onAddToCart={addToCart} /></Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
