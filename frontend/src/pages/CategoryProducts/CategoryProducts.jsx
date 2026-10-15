import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ProductCard from "../../components/products/ProductCard";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { getProducts } from "../../services/product.service";

function CategoryProducts() {
  const { slug } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [slug]);

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await getProducts();

      const allProducts =
        response?.data || response || [];

      const filtered = Array.isArray(allProducts)
        ? allProducts.filter(
            (product) =>
              product.category?.slug === slug ||
              product.categorySlug === slug
          )
        : [];

      setProducts(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const title = slug
    ? slug.charAt(0).toUpperCase() +
      slug.slice(1).replaceAll("-", " ")
    : "Category";

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-semibold">
        {title}
      </h1>

      <p className="mt-2 text-[var(--muted)]">
        Browse products in this category.
      </p>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products in this category"
          message="Products will appear here when available."
        />
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoryProducts;