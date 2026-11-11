import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag } from "lucide-react";
import Reveal from "../common/Reveal";
import SectionHeading from "../common/SectionHeading";
import ImageWithFallback from "../common/ImageWithFallback";
import { getOfferImageUrl } from "../../data/storeContent";
import { getOffers } from "../../services/offer.service";

function PopularProducts() {
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getOffers()
      .then((result) => { if (active) setOffers(result.slice(0, 2)); })
      .catch((issue) => { if (active) setError(issue.response?.data?.message || "Current offers are unavailable."); });
    return () => { active = false; };
  }, []);

  return (
    <section className="bg-navy-gradient relative overflow-hidden py-20 sm:py-28">
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <SectionHeading light eyebrow="Current offers" title="Smart deals," accent="updated by our team.">
          <Link to="/offers" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-200 hover:text-white">See all offers <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link>
        </SectionHeading>

        {error ? <p role="alert" className="mt-8 text-sm text-red-200">{error}</p> : offers.length > 0 && (
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {offers.map(({ id, title, description, imageUrl, discount }, index) => (
              <Reveal key={id} delay={index * 0.08}>
                <Link to="/offers" className="group relative flex h-full min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 p-6 transition duration-300 hover:-translate-y-1 sm:p-8">
                  <ImageWithFallback src={imageUrl} fallbackSrc={getOfferImageUrl(title)} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060f26] via-[#060f26]/65 to-[#060f26]/20" />
                  <div className="relative">
                    {discount != null && <p className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400 px-3 py-1 text-xs font-semibold text-[#06142e]"><Tag size={13} />{discount}% off</p>}
                    <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">{description}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PopularProducts;
