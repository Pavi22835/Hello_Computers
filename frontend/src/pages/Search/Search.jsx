import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";

import ProductCard from "../../components/products/ProductCard";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import { getProducts } from "../../services/product.service";

function Search() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      setProducts(allProducts);
      return;
    }

    setProducts(
      allProducts.filter((product) =>
        [
          product.name,
          product.brand,
          product.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search)
      )
    );
  }, [query, allProducts]);

  async function loadProducts() {
    try {
      const response = await getProducts();

      const data = response?.data || response || [];

      setAllProducts(Array.isArray(data) ? data : []);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold">
          Search Products
        </h1>

        <p className="mt-2 text-[var(--muted)]">
          Find the product you're looking for.
        </p>

        <div className="relative mt-8">
          <SearchIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search laptops, desktops, accessories..."
            className="w-full rounded-xl border border-[var(--line)] py-4 pl-12 pr-4 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          message={`No products matched "${query}".`}
        />
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

export default Search;