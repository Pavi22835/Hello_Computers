import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { bannerImages } from "../../assets/images";

const highlights = ["Genuine brands", "Expert repair", "Friendly support"];

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0a1f44]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#08193a] via-[#0a1f44] to-[#0f2d5c]" />

      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-10 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <p className="eyebrow !text-cyan-300">
            <span className="h-px w-8 bg-cyan-300" /> Computer sales &amp; service
          </p>
          <h1 className="display-heading mt-4 text-[2rem] font-semibold leading-[1.15] text-white sm:text-5xl sm:leading-[1.1] lg:text-[3.25rem]">
            Premium laptops, desktops &amp; <span className="text-cyan-300">expert service.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
            Genuine products from leading brands, honest advice and reliable repair, all under one roof.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/products" className="group inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-7 py-3.5 text-sm font-semibold text-[#06142e] transition hover:bg-cyan-300">
              Explore Products <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </Link>
            <Link to="/services" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
              <Wrench size={17} /> Get Service
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2"><BadgeCheck size={16} className="text-cyan-300" />{item}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }} className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="absolute -bottom-3 -right-3 h-full w-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] sm:-bottom-4 sm:-right-4" aria-hidden="true" />
          <img
            src={bannerImages.hero}
            alt="Laptop and monitor on a clean workspace"
            fetchPriority="high"
            className="relative aspect-[4/3] w-full rounded-[1.75rem] object-cover shadow-2xl shadow-black/30 lg:aspect-[5/4]"
          />
          <div className="absolute -left-2 bottom-5 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl sm:flex lg:-left-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a1f44] text-cyan-300"><BadgeCheck size={20} /></span>
            <span>
              <span className="block text-sm font-semibold text-[var(--ink)]">Manufacturer warranty</span>
              <span className="block text-xs text-[var(--muted)]">On every product</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
