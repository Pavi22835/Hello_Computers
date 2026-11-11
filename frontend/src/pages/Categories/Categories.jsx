import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import Reveal from "../../components/common/Reveal";
import CtaBanner from "../../components/common/CtaBanner";
import Loader from "../../components/common/Loader";
import CategoryImage from "../../components/common/CategoryImage";
import { categoryIcons } from "../../data/storeContent";
import { getCategories } from "../../services/category.service";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCategories()
      .then((result) => { if (active) setCategories(result); })
      .catch((issue) => { if (active) setError(issue.response?.data?.message || "Categories could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <PageHero eyebrow="Categories" title="Find your" accent="next essential." copy="Browse the current products by category." />
      <section className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        {loading ? <Loader /> : error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p> : categories.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--muted)]">Categories will appear here when available.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {categories.map((category, index) => {
              const Icon = categoryIcons[category.slug] || categoryIcons.default;
              return (
                <Reveal key={category.id} delay={(index % 2) * 0.08}>
                  <Link to={`/categories/${category.slug}`} className="group relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-3xl bg-[var(--navy)] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5 sm:p-10">
                    <CategoryImage category={category} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060f26] via-[#060f26]/50 to-[#060f26]/10" />
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-blue-700 backdrop-blur"><Icon size={26} /></span>
                    <div className="relative mt-12">
                      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">{category._count?.products ?? 0} products</p>
                      <h2 className="display-heading mt-2 text-2xl font-semibold text-white">{category.name}</h2>
                      {category.description && <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">{category.description}</p>}
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white">Explore <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
      <CtaBanner title="Cannot find what you need?" copy="Ask us about a product or configuration." />
    </>
  );
}

export default Categories;
