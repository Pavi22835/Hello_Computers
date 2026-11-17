import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Send, Wrench } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import PageHero from "../../components/common/PageHero";
import Reveal from "../../components/common/Reveal";
import SectionHeading from "../../components/common/SectionHeading";
import CtaBanner from "../../components/common/CtaBanner";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import { CallCta, WhatsAppCta } from "../../components/common/CtaButtons";
import Loader from "../../components/common/Loader";
import { getServiceImageUrl } from "../../data/storeContent";
import { getServices } from "../../services/service.service";
import { createCustomerServiceRequest, getServiceRequestByTrackingCode } from "../../services/customer.service";
import { whatsappLink } from "../../config/site";
import { useSiteSettings } from "../../hooks/useSiteSettings";

const steps = [
  { title: "Tell us the issue", copy: "Message or visit with your device." },
  { title: "Free diagnosis", copy: "We inspect it and share a clear quote." },
  { title: "Approve & repair", copy: "Work starts only after you agree." },
  { title: "Pick up, tested", copy: "Collect a working, tested device." },
];
const serviceTypes = [
  { value: "LAPTOP_REPAIR", label: "Laptop Repair" },
  { value: "HARDWARE_ISSUES", label: "Hardware Issues" },
  { value: "SOFTWARE_ISSUES", label: "Software Issues" },
  { value: "LAPTOP_MAINTENANCE", label: "Laptop Maintenance" },
  { value: "OTHER_SERVICES", label: "Other Services" },
];

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestDetails, setRequestDetails] = useState({
    serviceType: "LAPTOP_REPAIR",
    serviceId: "",
    customerName: "",
    email: "",
    phone: "",
    laptopModel: "",
    issueDescription: "",
  });
  const [requestFeedback, setRequestFeedback] = useState("");
  const [requestError, setRequestError] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [trackedRequest, setTrackedRequest] = useState(null);
  const [trackingFeedback, setTrackingFeedback] = useState("");
  const [trackingError, setTrackingError] = useState(false);
  const [tracking, setTracking] = useState(false);
  const { settings } = useSiteSettings();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let active = true;
    getServices()
      .then((result) => {
        if (active) {
          setServices(result);
          setRequestDetails((current) => ({ ...current, serviceId: current.serviceId || result[0]?.id || "" }));
        }
      })
      .catch((issue) => { if (active) setError(issue.response?.data?.message || "Services could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setRequestDetails((current) => ({
      ...current,
      customerName: current.customerName || user.name || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || "",
    }));
  }, [isAuthenticated, user]);

  async function submitServiceRequest(event) {
    event.preventDefault();
    setRequestFeedback("");
    setRequestError(false);
    setTrackingCode("");
    setTrackedRequest(null);
    setRequesting(true);
    try {
      const result = await createCustomerServiceRequest(requestDetails);
      setTrackingCode(result.trackingCode);
      setTrackingInput(result.trackingCode);
      setTrackedRequest(result.request);
      setRequestFeedback("Your service request was submitted.");
    } catch (issue) {
      setRequestFeedback(issue.response?.data?.message || "Your service request could not be submitted.");
      setRequestError(true);
    } finally {
      setRequesting(false);
    }
  }

  async function trackServiceRequest(event) {
    event.preventDefault();
    setTrackingFeedback("");
    setTrackingError(false);
    setTrackedRequest(null);
    setTracking(true);
    try {
      setTrackedRequest(await getServiceRequestByTrackingCode(trackingInput.trim()));
    } catch (issue) {
      setTrackingFeedback(issue.response?.data?.message || "The service enquiry could not be found.");
      setTrackingError(true);
    } finally {
      setTracking(false);
    }
  }

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
                    <ImageWithFallback src={getServiceImageUrl(service.title)} fallbackSrc={service.imageUrl} alt={service.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <Wrench size={34} className="relative text-white drop-shadow-md" aria-hidden="true" />
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

      <section className="mx-auto max-w-[1280px] px-5 pb-16 sm:px-8 lg:px-10" aria-label="Request a service">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-9">
          <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Wrench size={20} /></span><div><h2 className="text-xl font-semibold">Request a service</h2><p className="mt-1 text-sm leading-6 text-[var(--muted)]">Send our team a request and track its status from your profile.</p></div></div>
          <form onSubmit={submitServiceRequest} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">Service type
              <select required value={requestDetails.serviceType} onChange={(event) => setRequestDetails((current) => ({ ...current, serviceType: event.target.value }))} className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-3">
                {serviceTypes.map((serviceType) => <option key={serviceType.value} value={serviceType.value}>{serviceType.label}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">Specific service (optional)
              <select value={requestDetails.serviceId} onChange={(event) => setRequestDetails((current) => ({ ...current, serviceId: event.target.value }))} className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-3">
                <option value="">Choose later</option>{services.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">Your name<input required maxLength={120} value={requestDetails.customerName} onChange={(event) => setRequestDetails((current) => ({ ...current, customerName: event.target.value }))} className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-3" /></label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">Email<input required type="email" maxLength={254} value={requestDetails.email} onChange={(event) => setRequestDetails((current) => ({ ...current, email: event.target.value }))} className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-3" /></label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">Phone<input required type="tel" maxLength={40} value={requestDetails.phone} onChange={(event) => setRequestDetails((current) => ({ ...current, phone: event.target.value }))} className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-3" /></label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">Laptop model (optional)<input maxLength={120} value={requestDetails.laptopModel} onChange={(event) => setRequestDetails((current) => ({ ...current, laptopModel: event.target.value }))} className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-3" placeholder="For example, model or product name" /></label>
            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">Describe the issue
              <textarea required maxLength={4000} rows={4} value={requestDetails.issueDescription} onChange={(event) => setRequestDetails((current) => ({ ...current, issueDescription: event.target.value }))} className="rounded-xl border border-[var(--line)] bg-white p-3" placeholder="Describe the device or issue you need help with." />
            </label>
            {requestFeedback && <p role={requestError ? "alert" : "status"} className={`rounded-xl p-3 text-sm sm:col-span-2 ${requestError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{requestFeedback}{trackingCode && <><br />Save this tracking code: <strong className="select-all break-all">{trackingCode}</strong></>}{isAuthenticated && !requestError && <><br /><Link to="/profile" className="font-semibold underline">View your requests in My Profile</Link></>}</p>}
            <button type="submit" disabled={requesting} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[var(--navy)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">{requesting ? "Submitting…" : "Submit request"} <Send size={15} /></button>
          </form>
          <form onSubmit={trackServiceRequest} className="mt-8 grid gap-3 border-t border-[var(--line)] pt-6 sm:grid-cols-[1fr_auto]">
            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">Track a guest request with its tracking code<input required maxLength={100} value={trackingInput} onChange={(event) => setTrackingInput(event.target.value)} className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-3" placeholder="Paste the code shown after submission" /></label>
            {trackingFeedback && <p role={trackingError ? "alert" : "status"} className={`rounded-xl p-3 text-sm sm:col-span-2 ${trackingError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{trackingFeedback}</p>}
            <button type="submit" disabled={tracking || !trackingInput.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[var(--line)] px-5 text-sm font-semibold text-[var(--ink)] disabled:opacity-60">{tracking ? "Checking…" : "Track request"}</button>
            {trackedRequest && <article className="rounded-xl bg-slate-50 p-4 text-sm sm:col-span-2"><div className="flex flex-wrap justify-between gap-2"><strong>Request {trackedRequest.id}</strong><span className="font-semibold text-blue-700">{trackedRequest.status.replace(/_/g, " ")}</span></div><p className="mt-2 text-slate-600">{serviceTypes.find(({ value }) => value === trackedRequest.serviceType)?.label || trackedRequest.serviceType}{trackedRequest.laptopModel ? ` · ${trackedRequest.laptopModel}` : ""}</p><p className="mt-1 text-slate-600">{trackedRequest.issueDescription}</p><ol className="mt-3 grid gap-2 border-l-2 border-blue-100 pl-4">{trackedRequest.statusHistory.map((entry) => <li key={`${entry.status}-${entry.createdAt}`} className="text-xs text-slate-600"><strong>{entry.status.replace(/_/g, " ")}</strong> · {new Date(entry.createdAt).toLocaleString()}</li>)}</ol></article>}
          </form>
        </div>
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
