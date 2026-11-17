import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, SearchX } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useDebounce } from "../../hooks/useDebounce";
import PageHero from "../../components/common/PageHero";
import CtaBanner from "../../components/common/CtaBanner";
import StoreProductCard from "../../components/products/StoreProductCard";
import Loader from "../../components/common/Loader";
import { getCategories } from "../../services/category.service";
import { getProductFilters, getProducts } from "../../services/product.service";

const chip = (active) => `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-blue-600 text-white shadow-md shadow-slate-900/20" : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-blue-300 hover:text-blue-700"}`;
const control = "h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm text-[var(--ink)] outline-none transition focus:border-blue-500";

function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [brand, setBrand] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    let active = true;
    Promise.all([getCategories(), getProductFilters()])
      .then(([categoryRows, filters]) => {
        if (!active) return;
        setCategories(categoryRows);
        setBrands(filters.brands);
      })
      .catch((issue) => {
        if (active) setError(issue.response?.data?.message || "Product filters could not be loaded.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    getProducts({
      page,
      limit: 12,
      category: category || undefined,
      brand: brand || undefined,
      search: debouncedSearch.trim() || undefined,
      minPrice: minPrice === "" ? undefined : minPrice,
      maxPrice: maxPrice === "" ? undefined : maxPrice,
      sort,
    })
      .then((result) => {
        if (!active) return;
        setProducts(result.items);
        setPagination(result.pagination);
      })
      .catch((issue) => {
        if (active) setError(issue.response?.data?.message || "Products could not be loaded. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [page, category, brand, debouncedSearch, minPrice, maxPrice, sort]);

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
    setLoading(true);
    setError("");
  }

  function clearFilters() {
    setCategory("");
    setBrand("");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    setLoading(true);
    setError("");
  }

  function changePage(nextPage) {
    setPage(nextPage);
    setLoading(true);
    setError("");
  }

  return (
    <>
      <PageHero eyebrow="Products" title="Find the right" accent="technology." copy="Browse the current products, availability and pricing from our store." />

      <div className="sticky top-[68px] z-30 border-y border-[var(--line)] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-3 sm:px-8 lg:px-10">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button type="button" onClick={() => updateFilter(setCategory, "")} className={chip(!category)}>All</button>
            {categories.map((item) => <button key={item.id} type="button" onClick={() => updateFilter(setCategory, item.slug)} className={chip(category === item.slug)}>{item.name}</button>)}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <label className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} placeholder="Search products" aria-label="Search products" className={`${control} w-full pl-10`} />
            </label>
            <select value={brand} onChange={(event) => updateFilter(setBrand, event.target.value)} aria-label="Filter by brand" className={control}>
              <option value="">All brands</option>
              {brands.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="number" min="0" value={minPrice} onChange={(event) => updateFilter(setMinPrice, event.target.value)} aria-label="Minimum price" placeholder="Min ₹" className={`${control} min-w-0 w-1/2`} />
              <input type="number" min="0" value={maxPrice} onChange={(event) => updateFilter(setMaxPrice, event.target.value)} aria-label="Maximum price" placeholder="Max ₹" className={`${control} min-w-0 w-1/2`} />
            </div>
            <select value={sort} onChange={(event) => updateFilter(setSort, event.target.value)} aria-label="Sort products" className={control}>
              <option value="newest">Newest</option>
              <option value="featured">Featured first</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
            <button type="button" onClick={clearFilters} className="h-11 rounded-full border border-[var(--line)] px-4 text-sm font-medium text-[var(--muted)] transition hover:border-blue-300 hover:text-blue-700">Clear filters</button>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        {loading ? <Loader /> : error ? (
          <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--ink)]">{pagination?.total || 0}</span> products</p>
            {products.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => <StoreProductCard key={product.id} product={product} onAddToCart={addToCart} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><SearchX size={28} /></span>
                <h2 className="mt-5 text-xl font-semibold">No products found</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">Try another search or clear the filters.</p>
                <button type="button" onClick={clearFilters} className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">Clear filters</button>
              </div>
            )}
            {pagination?.totalPages > 1 && <div className="mt-10 flex items-center justify-center gap-4">
              <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-4 py-2 text-sm disabled:opacity-40"><ChevronLeft size={16} /> Previous</button>
              <span className="text-sm text-[var(--muted)]">Page {pagination.page} of {pagination.totalPages}</span>
              <button type="button" disabled={page >= pagination.totalPages} onClick={() => changePage(page + 1)} className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-4 py-2 text-sm disabled:opacity-40">Next <ChevronRight size={16} /></button>
            </div>}
          </>
        )}
      </section>

      <CtaBanner title="Looking for a specific model?" copy="Message us the model or your budget and we will check availability." />
    </>
  );
}

export default Products;
