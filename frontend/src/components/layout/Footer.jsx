import { Link } from "react-router-dom";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import logo from "../../assets/images/logo.jpeg";
import { SITE, whatsappLink } from "../../config/site";

const columns = [
  { title: "Explore", links: [["Home", "/"], ["About Us", "/about"], ["Products", "/products"], ["Categories", "/categories"]] },
  { title: "Support", links: [["Offers", "/offers"], ["Services", "/services"], ["Contact Us", "/contact"], ["My Orders", "/orders"]] },
];

function Footer() {
  return (
    <footer className="bg-navy-gradient text-white">
      <div className="mx-auto max-w-[1280px] px-5 pb-8 pt-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr_0.6fr_1.2fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={logo} alt="Hello Computers" className="h-11 w-11 rounded-xl object-cover" />
              <span className="display-heading text-lg font-semibold">Hello Computers</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-blue-100/70">Laptops, desktops, accessories and expert IT service, with honest advice and support that stays with you after the sale.</p>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--whatsapp)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"><MessageCircle size={17} /> Chat on WhatsApp</a>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-white">{column.title}</p>
              <ul className="mt-5 space-y-3 text-sm text-blue-100/70">
                {column.links.map(([label, path]) => <li key={path}><Link to={path} className="transition hover:text-white">{label}</Link></li>)}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-sm font-semibold text-white">Visit or call us</p>
            <ul className="mt-5 space-y-4 text-sm text-blue-100/70">
              <li className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0 text-blue-300" /><a href={SITE.phoneHref} className="transition hover:text-white">{SITE.phone}</a></li>
              <li className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0 text-blue-300" /><a href={`mailto:${SITE.email}`} className="break-all transition hover:text-white">{SITE.email}</a></li>
              <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-blue-300" />{SITE.address}</li>
              <li className="flex gap-3"><Clock size={16} className="mt-0.5 shrink-0 text-blue-300" />{SITE.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-blue-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Hello Computers. All rights reserved.</p>
          <p className="flex gap-5"><Link to="/privacy-policy" className="transition hover:text-white">Privacy Policy</Link><Link to="/terms" className="transition hover:text-white">Terms</Link></p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
