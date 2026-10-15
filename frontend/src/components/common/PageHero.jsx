import Reveal from "./Reveal";

function PageHero({ eyebrow, title, accent, copy, children }) {
  return (
    <section className="bg-soft-gradient relative isolate overflow-hidden">
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-10">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-heading mt-4 max-w-3xl text-[2rem] font-semibold leading-[1.15] sm:leading-[1.1] text-[var(--ink)] sm:text-5xl">
            {title} {accent && <span className="text-gradient">{accent}</span>}
          </h1>
          {copy && <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">{copy}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}

export default PageHero;
