import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SearchX } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import PageHero from "../../components/common/PageHero";
import CtaBanner from "../../components/common/CtaBanner";
import StoreProductCard from "../../components/products/StoreProductCard";
import Loader from "../../components/common/Loader";
import { getCategories } from "../../services/category.service";
import { getProducts } from "../../services/product.service";

const chip = (active) => `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-blue-600 text-white shadow-md shadow-slate-900/20" : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-blue-300 hover:text-blue-700"}`;
const control = "h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm text-[var(--ink)] outline-none transition focus:border-blue-500";

function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [brand, setBrand] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;
    Promise.all([getProducts(), getCategories()])
      .then(([productRows, categoryRows]) => {
        if (!active) return;
        setProducts(productRows);
        setCategories(categoryRows);
        const selected = searchParams.get("category");
        setCategory(selected && categoryRows.some((item) => item.slug === selected) ? selected : "");
        setError("");
      })
      .catch((issue) => {
        if (active) setError(issue.response?.data?.message || "Products could not be loaded. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [searchParams]);

  const brands = useMemo(() => [...new Set(products.map((product) => product.brand).filter(Boolean))].sort(), [products]);
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter((product) =>
      (!category || product.category?.slug === category) &&
      (!brand || product.brand === brand) &&
      (!query || `${product.name} ${product.category?.name || ""} ${product.brand || ""} ${product.description || ""}`.toLowerCase().includes(query))
    );
    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, category, brand, search, sort]);

  return (
    <>
      <PageHero eyebrow="Products" title="Find the right" accent="technology." copy="Browse the current products, availability and pricing from our store." />

      <div className="sticky top-[68px] z-30 border-y border-[var(--line)] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-3 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button type="button" onClick={() => setCategory("")} className={chip(!category)}>All</button>
            {categories.map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.slug)} className={chip(category === item.slug)}>{item.name}</button>)}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative sm:w-64">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products" className={`${control} w-full pl-10`} />
            </label>
            <select value={brand} onChange={(event) => setBrand(event.target.value)} aria-label="Filter by brand" className={control}>
              <option value="">All brands</option>
              {brands.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products" className={control}>
              <option value="featured">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        {loading ? <Loader /> : error ? (
          <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--ink)]">{filteredProducts.length}</span> products</p>
            {filteredProducts.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => <StoreProductCard key={product.id} product={product} onAddToCart={addToCart} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><SearchX size={28} /></span>
                <h2 className="mt-5 text-xl font-semibold">No products found</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">Try another search or clear the filters.</p>
                <button type="button" onClick={() => { setCategory(""); setBrand(""); setSearch(""); }} className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">Clear filters</button>
              </div>
            )}
          </>
        )}
      </section>

      <CtaBanner title="Looking for a specific model?" copy="Message us the model or your budget and we will check availability." />
    </>
  );
}

export default Products;
