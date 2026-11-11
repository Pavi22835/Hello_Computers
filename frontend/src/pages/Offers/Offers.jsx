import { useEffect, useState } from "react";
import { Clock, Tag } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import Reveal from "../../components/common/Reveal";
import CtaBanner from "../../components/common/CtaBanner";
import { WhatsAppCta } from "../../components/common/CtaButtons";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import Loader from "../../components/common/Loader";
import { getOfferImageUrl } from "../../data/storeContent";
import { getOffers } from "../../services/offer.service";

function offerDate(value) {
  return value ? new Date(value).toLocaleDateString() : "Available now";
}

function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getOffers()
      .then((result) => { if (active) setOffers(result); })
      .catch((issue) => { if (active) setError(issue.response?.data?.message || "Offers could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <PageHero eyebrow="Offers" title="Smart deals," accent="real savings." copy="View active offers published by our store." />
      <section className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        {loading ? <Loader /> : error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p> : offers.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--muted)]">There are no active offers right now. Check back soon.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {offers.map((offer, index) => (
              <Reveal key={offer.id} delay={(index % 2) * 0.08}>
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-white transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg hover:shadow-slate-900/5">
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                    <ImageWithFallback src={offer.imageUrl} fallbackSrc={getOfferImageUrl(offer.title)} alt={offer.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060f26]/70 to-transparent" />
                    {offer.discount != null && <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-[#06142e]"><Tag size={13} />{offer.discount}% off</span>}
                    <span className="absolute bottom-4 right-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-blue-700"><Tag size={20} /></span>
                  </div>
                  <div className="flex flex-1 flex-col p-7 sm:p-8">
                    <h2 className="display-heading text-xl font-semibold">{offer.title}</h2>
                    <p className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)]">{offer.description}</p>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]"><Clock size={14} />{offer.endsAt ? `Ends ${offerDate(offer.endsAt)}` : offer.startsAt ? `From ${offerDate(offer.startsAt)}` : "Limited availability"}</span>
                      <WhatsAppCta label="Enquire" message={`Hi, I would like to enquire about the "${offer.title}" offer.`} className="!px-5 !py-2.5" />
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
        <p className="mt-8 text-center text-xs text-[var(--muted)]">Offers are subject to availability. Terms apply.</p>
      </section>
      <CtaBanner title="Want a custom quote?" copy="Contact us for a quote based on your requirements." />
    </>
  );
}

export default Offers;
