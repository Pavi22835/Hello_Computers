import { BadgeCheck, Headphones, ShieldCheck, Wrench } from "lucide-react";
import { aboutImages } from "../../assets/images";
import PageHero from "../../components/common/PageHero";
import Reveal from "../../components/common/Reveal";
import SectionHeading from "../../components/common/SectionHeading";
import CtaBanner from "../../components/common/CtaBanner";
import { EnquireCta, WhatsAppCta } from "../../components/common/CtaButtons";

const principles = [
  { title: "Honest advice", copy: "We listen first and recommend only what fits your needs and budget.", icon: BadgeCheck },
  { title: "Genuine products", copy: "Authorised brands, proper billing and full manufacturer warranty.", icon: ShieldCheck },
  { title: "Service you can reach", copy: "An in-house team for repairs, upgrades and setup, close by when you need it.", icon: Wrench },
  { title: "Support after the sale", copy: "Questions after purchase are welcome on WhatsApp, phone or in-store.", icon: Headphones },
];

function About() {
  return (
    <>
      <PageHero eyebrow="About us" title="A computer store that" accent="puts you first." copy="Hello Computers helps individuals, students and businesses choose, buy and maintain the right technology, without the jargon or the pressure.">
        <WhatsAppCta message="Hi, I would like to know more about Hello Computers." />
        <EnquireCta label="Contact us" />
      </PageHero>

      <section className="mx-auto grid max-w-[1280px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center lg:px-10">
        <Reveal>
          <p className="eyebrow">Our story</p>
          <h2 className="display-heading mt-3 text-[1.75rem] font-semibold leading-tight sm:text-4xl">More than a <span className="text-gradient">computer shop.</span></h2>
          <div className="mt-6 space-y-4 text-base leading-7 text-[var(--muted)]">
            <p>Choosing technology should feel straightforward. From a first student laptop to a complete office setup, every recommendation starts with understanding how you actually work.</p>
            <p>We pair a carefully selected range of products with practical, patient service, so your experience stays smooth long after the purchase.</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl">
              <img src={aboutImages.store} alt="Our store" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060f26]/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                <p className="text-sm font-semibold text-cyan-300">Our promise</p>
                <p className="display-heading mt-2 text-xl font-semibold leading-snug text-white sm:text-2xl">Right product. Fair price. Support that does not disappear after billing.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-soft-gradient py-20 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
          <SectionHeading align="center" eyebrow="What we stand for" title="Built on" accent="trust." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(({ title, copy, icon: Icon }, index) => (
              <Reveal key={title} delay={index * 0.07}>
                <div className="h-full rounded-3xl border border-[var(--line)] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Icon size={22} /></span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner title="Visit us or message us today." copy="We are happy to help you compare options, with no obligation." />
    </>
  );
}

export default About;
