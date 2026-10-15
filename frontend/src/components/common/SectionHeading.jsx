import Reveal from "./Reveal";

function SectionHeading({ eyebrow, title, accent, copy, align = "left", light = false, children }) {
  const centered = align === "center";
  return (
    <Reveal className={`flex flex-col gap-5 ${centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className={`eyebrow ${light ? "!text-blue-200" : ""}`}>{eyebrow}</p>}
        <h2 className={`display-heading mt-3 text-[1.75rem] font-semibold leading-[1.2] sm:text-4xl ${light ? "text-white" : "text-[var(--ink)]"}`}>
          {title} {accent && <span className={light ? "text-blue-300" : "text-gradient"}>{accent}</span>}
        </h2>
        {copy && <p className={`mt-4 text-base leading-7 ${light ? "text-blue-100/80" : "text-[var(--muted)]"}`}>{copy}</p>}
      </div>
      {children}
    </Reveal>
  );
}

export default SectionHeading;
