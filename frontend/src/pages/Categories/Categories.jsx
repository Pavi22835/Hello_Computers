import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import Reveal from "../../components/common/Reveal";
import CtaBanner from "../../components/common/CtaBanner";
import { categories } from "../../data/storeContent";

function Categories() {
  return (
    <>
      <PageHero eyebrow="Categories" title="Find your" accent="next essential." copy="Browse our range by category and jump straight to what you need." />

      <section className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-5 md:grid-cols-2">
          {categories.map(({ title, copy, count, image, icon: Icon }, index) => (
            <Reveal key={title} delay={(index % 2) * 0.08}>
              <Link to={`/products?category=${title}`} className="group relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-3xl bg-[var(--navy)] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5 sm:p-10">
                <img src={image} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060f26] via-[#060f26]/50 to-[#060f26]/10" />
                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-blue-700 backdrop-blur"><Icon size={26} /></span>
                <div className="relative mt-12">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">{count}</p>
                  <h2 className="display-heading mt-2 text-2xl font-semibold text-white">{title}</h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">{copy}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white">Explore <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBanner title="Cannot find what you need?" copy="Ask us. We can source specific models and configurations." />
    </>
  );
}

export default Categories;
