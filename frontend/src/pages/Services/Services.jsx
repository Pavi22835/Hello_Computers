import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Wrench } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import Reveal from "../../components/common/Reveal";
import SectionHeading from "../../components/common/SectionHeading";
import CtaBanner from "../../components/common/CtaBanner";
import { CallCta, WhatsAppCta } from "../../components/common/CtaButtons";
import Loader from "../../components/common/Loader";
import { getServices } from "../../services/service.service";
import { whatsappLink } from "../../config/site";
import { useSiteSettings } from "../../hooks/useSiteSettings";

const steps = [
  { title: "Tell us the issue", copy: "Message or visit with your device." },
  { title: "Free diagnosis", copy: "We inspect it and share a clear quote." },
  { title: "Approve & repair", copy: "Work starts only after you agree." },
  { title: "Pick up, tested", copy: "Collect a working, tested device." },
];

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { settings } = useSiteSettings();

  useEffect(() => {
    let active = true;
    getServices()
      .then((result) => { if (active) setServices(result); })
      .catch((issue) => { if (active) setError(issue.response?.data?.message || "Services could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <PageHero eyebrow="Services" title="Expert IT service," accent="done right." copy="View available services and contact our team to arrange support.">
        <WhatsAppCta label="Book a service" message="Hi, I would like to book a service." />
        <CallCta />
      </PageHero>

      <section className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        {loading ? <Loader /> : error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p> : services.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--muted)]">Services will appear here when available.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => {
              const href = whatsappLink(settings.whatsappNumber, `Hi, I need help with: ${service.title}.`);
              const Card = (
                <>
                  <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                    {service.imageUrl && <img src={service.imageUrl} alt={service.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
                    <Wrench size={34} className="relative text-blue-700" aria-hidden="true" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-semibold">{service.title}</h2>
                    <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{service.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">Enquire <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                  </div>
                </>
              );
              return <Reveal key={service.id} delay={(index % 3) * 0.07}>
                {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-white transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg hover:shadow-slate-900/5">{Card}</a> : <Link to="/contact" className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-white transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg hover:shadow-slate-900/5">{Card}</Link>}
              </Reveal>
            })}
          </div>
        )}
      </section>

      <section className="bg-soft-gradient py-20 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
          <SectionHeading align="center" eyebrow="How it works" title="Simple, transparent" accent="process." />
          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ title, copy }, index) => (
              <Reveal key={title} delay={index * 0.08}>
                <li className="relative list-none rounded-3xl border border-[var(--line)] bg-white p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">{index + 1}</span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <ul className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-[var(--muted)]">
            {["Free diagnosis", "Transparent quotes", "Genuine spare parts", "Service warranty"].map((item) => <li key={item} className="flex items-center gap-2"><Check size={16} className="text-blue-600" />{item}</li>)}
          </ul>
        </div>
      </section>
      <CtaBanner title="Device acting up?" copy="Send us a quick message to discuss service." message="Hi, my device needs service." />
    </>
  );
}

export default Services;
