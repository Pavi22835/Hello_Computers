import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/products/ProductCard";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { getCategoryBySlug } from "../../services/category.service";
import { getProducts } from "../../services/product.service";

function CategoryProducts() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getCategoryBySlug(slug), getProducts({ category: slug })])
      .then(([categoryResult, productRows]) => {
        if (!active) return;
        setCategory(categoryResult);
        setProducts(productRows);
        setError("");
      })
      .catch((issue) => {
        if (active) setError(issue.response?.data?.message || "Category products could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-semibold">{category?.name || "Category"}</h1>
      {category?.description && <p className="mt-2 text-[var(--muted)]">{category.description}</p>}
      {loading ? <Loader /> : error ? (
        <p role="alert" className="mt-8 rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p>
      ) : products.length === 0 ? (
        <EmptyState title="No products in this category" message="Products will appear here when available." />
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </section>
  );
}

export default CategoryProducts;
