import { EnquireCta, WhatsAppCta } from "./CtaButtons";
import Reveal from "./Reveal";
import { bannerImages } from "../../assets/images";
import { resolvePageImage } from "../../data/pageContent";

function CtaBanner({
  title = "Not sure what to pick?",
  copy = "Tell us your budget and use case. We will recommend the right system within minutes.",
  message = "Hi Hello Computers, I would like to enquire about your products.",
  imageUrl,
  whatsappLabel,
  enquiryLabel,
}) {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
      <Reveal className="bg-navy-gradient relative mx-auto max-w-[1280px] overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-14 sm:py-20">
        <img src={resolvePageImage(imageUrl, bannerImages.cta)} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity" />
        <div className="relative">
          <h2 className="display-heading mx-auto max-w-2xl text-[1.75rem] font-semibold leading-tight text-white sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-blue-100/80">{copy}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <WhatsAppCta message={message || undefined} label={whatsappLabel} />
            <EnquireCta label={enquiryLabel || "Send an Enquiry"} className="!bg-white !bg-none !text-blue-700 !shadow-none" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default CtaBanner;
