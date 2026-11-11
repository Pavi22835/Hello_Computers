import { Link } from "react-router-dom";
import { MessageCircle, Phone, ArrowRight } from "lucide-react";
import { whatsappLink } from "../../config/site";
import { useSiteSettings } from "../../hooks/useSiteSettings";

const base = "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition duration-300";

export function WhatsAppCta({ message, label = "Chat on WhatsApp", className = "" }) {
  const { settings } = useSiteSettings();
  const href = whatsappLink(settings.whatsappNumber, message);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} bg-[var(--whatsapp)] text-white shadow-sm hover:-translate-y-0.5 hover:brightness-110 ${className}`}>
      <MessageCircle size={18} /> {label}
    </a>
  );
}

export function EnquireCta({ to = "/contact", label = "Enquire Now", className = "" }) {
  return (
    <Link to={to} className={`${base} bg-brand-gradient text-white shadow-sm hover:-translate-y-0.5 hover:brightness-110 ${className}`}>
      {label} <ArrowRight size={17} className="transition group-hover:translate-x-1" />
    </Link>
  );
}

export function CallCta({ label, className = "", light = false }) {
  const { settings } = useSiteSettings();
  if (!settings.phone) return null;
  return (
    <a href={`tel:${settings.phone}`} className={`${base} border ${light ? "border-white/30 text-white hover:bg-white/10" : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-blue-300 hover:text-blue-700"} ${className}`}>
      <Phone size={17} /> {label || settings.phone}
    </a>
  );
}
