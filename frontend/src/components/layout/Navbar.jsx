import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, MessageCircle, Phone, ShoppingBag, UserRound, X } from "lucide-react";
import logo from "../../assets/images/logo.jpeg";
import { useCart } from "../../hooks/useCart";
import { SITE, whatsappLink } from "../../config/site";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Products", path: "/products" },
  { name: "Categories", path: "/categories" },
  { name: "Offers", path: "/offers" },
  { name: "Services", path: "/services" },
  { name: "Contact Us", path: "/contact" },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items } = useCart();
  const { pathname } = useLocation();
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <>
      <div className="hidden bg-[var(--navy)] text-xs text-blue-100/80 md:block">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-2 lg:px-10">
          <p>{SITE.hours}</p>
          <a href={SITE.phoneHref} className="flex items-center gap-2 transition hover:text-white"><Phone size={13} /> {SITE.phone}</a>
        </div>
      </div>

      <header className={`sticky top-0 z-50 border-b transition duration-300 ${scrolled ? "border-[var(--line)] bg-white/85 shadow-[0_6px_30px_-12px_rgba(15,27,52,0.15)] backdrop-blur-xl" : "border-transparent bg-white"}`}>
        <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <img src={logo} alt="Hello Computers" className="h-10 w-10 rounded-xl object-cover ring-1 ring-[var(--line)]" />
            <span className="display-heading text-lg font-semibold tracking-tight text-[var(--ink)]">Hello <span className="text-gradient">Computers</span></span>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} end={link.path === "/"} className={({ isActive }) => `relative rounded-full px-3.5 py-2 text-sm font-medium transition ${isActive ? "bg-blue-50 text-blue-700" : "text-[var(--muted)] hover:bg-slate-50 hover:text-[var(--ink)]"}`}>
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link to="/cart" aria-label="Shopping cart" className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--ink)] transition hover:bg-blue-50 hover:text-blue-700">
              <ShoppingBag size={19} />
              {cartCount > 0 && <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">{cartCount}</span>}
            </Link>
            <Link to="/profile" aria-label="My account" className="hidden h-10 w-10 items-center justify-center rounded-full text-[var(--ink)] transition hover:bg-blue-50 hover:text-blue-700 sm:flex"><UserRound size={19} /></Link>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="ml-1 hidden items-center gap-2 rounded-full bg-[var(--whatsapp)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 md:inline-flex"><MessageCircle size={16} /> WhatsApp</a>
            <button type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--ink)] transition hover:bg-blue-50 xl:hidden">
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-[var(--line)] bg-white px-5 pb-6 pt-3 shadow-xl xl:hidden" aria-label="Mobile">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} end={link.path === "/"} onClick={() => setMobileOpen(false)} className={({ isActive }) => `block rounded-xl px-4 py-3.5 text-base font-medium ${isActive ? "bg-blue-50 text-blue-700" : "text-[var(--ink)]"}`}>{link.name}</NavLink>
            ))}
            <Link to="/profile" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3.5 text-base font-medium text-[var(--ink)]">My Account</Link>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[var(--whatsapp)] px-5 py-3.5 text-sm font-semibold text-white"><MessageCircle size={17} /> Chat on WhatsApp</a>
          </nav>
        )}
      </header>
    </>
  );
}

export default Navbar;
