import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import Reveal from "../../components/common/Reveal";
import { WhatsAppCta } from "../../components/common/CtaButtons";
import { submitEnquiry } from "../../services/contact.service";
import { useSiteSettings } from "../../hooks/useSiteSettings";

const field = "mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function Contact() {
  const { settings, error: settingsError } = useSiteSettings();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [feedback, setFeedback] = useState({ message: "", error: false });
  const [submitting, setSubmitting] = useState(false);
  const details = [
    settings.phone && { icon: Phone, label: "Phone", value: settings.phone, href: `tel:${settings.phone}` },
    settings.email && { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    settings.address && { icon: MapPin, label: "Visit the store", value: settings.address },
    settings.hours && { icon: Clock, label: "Opening hours", value: settings.hours },
  ].filter(Boolean);
  const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ message: "", error: false });
    setSubmitting(true);
    try {
      await submitEnquiry(formData);
      setFeedback({ message: "Thank you! We will get back to you soon.", error: false });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setFeedback({ message: error.response?.data?.message || "We could not send your enquiry. Please try again.", error: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero eyebrow="Contact us" title="Let us help you" accent="get it right." copy="Product advice, a repair quote or a bulk order? Reach us the way that suits you." />

      <section className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <Reveal className="min-w-0">
          <div className="bg-navy-gradient relative overflow-hidden rounded-3xl p-8 text-white sm:p-10">
            <div className="relative">
              <h2 className="display-heading text-2xl font-semibold">Talk to us now</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100/75">The fastest way to get an answer is WhatsApp.</p>
              {settingsError && <p role="alert" className="mt-4 text-sm text-red-200">{settingsError}</p>}
              <WhatsAppCta className="mt-6 w-full sm:w-auto" />

              <ul className="mt-10 space-y-6">
                {details.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200"><Icon size={18} /></span>
                    <span className="min-w-0 text-sm">
                      <span className="block text-blue-200/80">{label}</span>
                      {href ? <a href={href} className="mt-0.5 block break-words font-medium text-white transition hover:text-blue-200">{value}</a> : <span className="mt-0.5 block font-medium text-white">{value}</span>}
                    </span>
                  </li>
                ))}
                {details.length === 0 && !settingsError && <li className="text-sm text-blue-100/75">Store contact details have not been configured yet.</li>}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="min-w-0">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm sm:p-10">
            <h2 className="display-heading text-2xl font-semibold">Send an enquiry</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Fill in the form and we will get back to you shortly.</p>
            {feedback.message && <p role={feedback.error ? "alert" : "status"} className={`mt-5 rounded-xl px-4 py-3 text-sm ${feedback.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{feedback.message}</p>}

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium">Name<input required name="name" value={formData.name} onChange={handleChange} placeholder="Your name" className={field} /></label>
              <label className="text-sm font-medium">Phone<input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91" className={field} /></label>
              <label className="text-sm font-medium sm:col-span-2">Email<input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={field} /></label>
              <label className="text-sm font-medium sm:col-span-2">Message<textarea required name="message" rows={5} value={formData.message} onChange={handleChange} placeholder="Tell us what you are looking for" className={`${field} resize-none`} /></label>
            </div>

            <button type="submit" disabled={submitting} className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-7 py-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-70 sm:w-auto">
              {submitting ? "Sending..." : "Send enquiry"} <Send size={16} className="transition group-hover:translate-x-0.5" />
            </button>
          </form>
        </Reveal>
      </section>
    </>
  );
}

export default Contact;
