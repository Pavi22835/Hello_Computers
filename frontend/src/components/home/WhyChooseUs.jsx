import Reveal from "../common/Reveal";
import SectionHeading from "../common/SectionHeading";
import { BadgeCheck, Headphones, ShieldCheck, Truck, Wrench } from "lucide-react";

const icons = { badge: BadgeCheck, headphones: Headphones, shield: ShieldCheck, truck: Truck, wrench: Wrench };

function WhyChooseUs({ content }) {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <SectionHeading align="center" eyebrow={content.eyebrow} title={content.title} accent={content.accent} copy={content.copy} />

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map(({ title, copy, icon }, index) => {
            const Icon = icons[icon] || BadgeCheck;
            return (
            <Reveal key={title} delay={index * 0.07} className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition duration-300 hover:scale-110 hover:bg-blue-600 hover:text-white"><Icon size={24} /></span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-6 text-[var(--muted)]">{copy}</p>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
