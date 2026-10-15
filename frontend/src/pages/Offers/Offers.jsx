import { Clock, Tag } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import Reveal from "../../components/common/Reveal";
import CtaBanner from "../../components/common/CtaBanner";
import { WhatsAppCta } from "../../components/common/CtaButtons";
import { offers } from "../../data/storeContent";

function Offers() {
  return (
    <>
      <PageHero eyebrow="Offers" title="Smart deals," accent="real savings." copy="Seasonal bundles and exchange offers on laptops, desktops and printers. Message us to claim any offer." />

      <section className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-5 md:grid-cols-2">
          {offers.map(({ id, tag, title, copy, image, icon: Icon, ends }, index) => (
            <Reveal key={id} delay={(index % 2) * 0.08}>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-white transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg hover:shadow-slate-900/5">
                <div className="relative h-56 overflow-hidden">
                  <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060f26]/70 to-transparent" />
                  <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-[#06142e]"><Tag size={13} />{tag}</span>
                  <span className="absolute bottom-4 right-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-blue-700"><Icon size={20} /></span>
                </div>
                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  <h2 className="display-heading text-xl font-semibold">{title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]"><Clock size={14} />{ends}</span>
                    <WhatsAppCta label="Claim offer" message={`Hi, I would like to claim the "${title}" offer.`} className="!px-5 !py-2.5" />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-[var(--muted)]">Offers are subject to availability. Terms apply.</p>
      </section>

      <CtaBanner title="Want a custom quote?" copy="Buying for a team or business? Ask us for bulk pricing." />
    </>
  );
}

export default Offers;
