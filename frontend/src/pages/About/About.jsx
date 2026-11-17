import { BadgeCheck, Headphones, ShieldCheck, Wrench } from "lucide-react";
import { aboutImages } from "../../assets/images";
import PageHero from "../../components/common/PageHero";
import Reveal from "../../components/common/Reveal";
import SectionHeading from "../../components/common/SectionHeading";
import CtaBanner from "../../components/common/CtaBanner";
import { EnquireCta, WhatsAppCta } from "../../components/common/CtaButtons";
import { aboutPageDefaults, resolvePageImage } from "../../data/pageContent";
import { usePageContent } from "../../hooks/usePageContent";

const principleIcons = { badge: BadgeCheck, headphones: Headphones, shield: ShieldCheck, wrench: Wrench };

function About() {
  const { content, error } = usePageContent("about", aboutPageDefaults);

  return (
    <>
      {error && <p role="alert" className="mx-auto max-w-[1280px] px-5 pt-4 text-sm text-red-700 sm:px-8 lg:px-10">{error} Showing the default page content.</p>}
      <PageHero {...content.hero}>
        <WhatsAppCta message={content.hero.message} label={content.hero.whatsappLabel} />
        <EnquireCta label={content.hero.enquiryLabel} />
      </PageHero>

      <section className="mx-auto grid max-w-[1280px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center lg:px-10">
        <Reveal>
          <p className="eyebrow">{content.story.eyebrow}</p>
          <h2 className="display-heading mt-3 text-[1.75rem] font-semibold leading-tight sm:text-4xl">{content.story.title} <span className="text-gradient">{content.story.accent}</span></h2>
          <div className="mt-6 space-y-4 text-base leading-7 text-[var(--muted)]">
            {content.story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl">
              <img src={resolvePageImage(content.story.imageUrl, aboutImages.store)} alt={content.story.imageAlt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060f26]/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                <p className="text-sm font-semibold text-cyan-300">{content.story.promiseLabel}</p>
                <p className="display-heading mt-2 text-xl font-semibold leading-snug text-white sm:text-2xl">{content.story.promiseCopy}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-soft-gradient py-20 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
          <SectionHeading align="center" eyebrow={content.principles.eyebrow} title={content.principles.title} accent={content.principles.accent} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.principles.items.map(({ title, copy, icon }, index) => {
              const Icon = principleIcons[icon] || BadgeCheck;
              return (
              <Reveal key={title} delay={index * 0.07}>
                <div className="h-full rounded-3xl border border-[var(--line)] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Icon size={22} /></span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                </div>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBanner {...content.cta} />
    </>
  );
}

export default About;
