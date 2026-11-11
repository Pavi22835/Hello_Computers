import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import ProductCard from "../../components/products/ProductCard";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import { getProducts } from "../../services/product.service";

function Search() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getProducts()
      .then((result) => { if (active) setProducts(result); })
      .catch((issue) => { if (active) setError(issue.response?.data?.message || "Products could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return products;
    return products.filter((product) =>
      [product.name, product.brand, product.description, product.category?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [query, products]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold">Search Products</h1>
        <p className="mt-2 text-[var(--muted)]">Search the current store catalogue.</p>
        <div className="relative mt-8">
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." aria-label="Search products" className="w-full rounded-xl border border-[var(--line)] py-4 pl-12 pr-4 outline-none focus:border-cyan-500" />
        </div>
      </div>

      {loading ? <Loader /> : error ? (
        <p role="alert" className="mt-8 rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No products found" message={`No products matched "${query}".`} />
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </section>
  );
}

export default Search;
