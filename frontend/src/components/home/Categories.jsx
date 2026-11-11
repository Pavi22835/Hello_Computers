import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Reveal from "../common/Reveal";
import SectionHeading from "../common/SectionHeading";
import { categoryIcons } from "../../data/storeContent";
import { getCategories } from "../../services/category.service";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCategories()
      .then((result) => { if (active) setCategories(result.slice(0, 4)); })
      .catch((issue) => { if (active) setError(issue.response?.data?.message || "Categories are unavailable."); });
    return () => { active = false; };
  }, []);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="Shop by category" title="Everything you need," accent="in one place." copy="Browse the current categories managed by our store.">
          <Link to="/categories" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">All categories <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
        </SectionHeading>

        {error ? <p role="alert" className="mt-8 text-sm text-red-700">{error}</p> : categories.length > 0 && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const Icon = categoryIcons[category.slug] || categoryIcons.default;
              return (
                <Reveal key={category.id} delay={index * 0.07}>
                  <Link to={`/categories/${category.slug}`} className="group relative block h-full min-h-[320px] overflow-hidden rounded-3xl bg-[var(--navy)] transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5">
                    {category.imageUrl && <img src={category.imageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-110" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060f26] via-[#060f26]/55 to-transparent" />
                    <span className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-blue-700 backdrop-blur"><Icon size={20} /></span>
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                      {category.description && <p className="mt-1.5 text-sm leading-6 text-slate-300">{category.description}</p>}
                      <p className="mt-3 flex items-center justify-between text-xs font-semibold text-cyan-300">{category._count?.products ?? 0} products<ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Categories;
