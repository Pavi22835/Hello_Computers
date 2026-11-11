import { Link } from "react-router-dom";
import { MessageCircle, ShoppingBag } from "lucide-react";
import ProductVisual from "./ProductVisual";
import { whatsappLink } from "../../config/site";
import { formatPrice } from "../../utils/formatPrice";
import { useSiteSettings } from "../../hooks/useSiteSettings";

function StoreProductCard({ product, onAddToCart }) {
  const hasDiscount = product.oldPrice > product.price;
  const categoryName = product.category?.name || product.category;
  const { settings } = useSiteSettings();
  const enquiryLink = whatsappLink(settings.whatsappNumber, `Hi, I would like to enquire about the ${product.name} (${formatPrice(product.price)}).`);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5">
      <Link to={`/products/${product.id}`} className="relative block">
        <ProductVisual src={product.image || product.imageUrl || product.images?.[0]} alt={product.name} productName={product.name} category={product.category || categoryName} className="aspect-[4/3]" />
        {product.badge && <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">{product.badge}</span>}
        {hasDiscount && <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">Save {Math.round((1 - product.price / product.oldPrice) * 100)}%</span>}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span className="font-medium uppercase tracking-wider">{product.brand || categoryName || "Product"}</span>
          <span>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
        </div>
        <Link to={`/products/${product.id}`} className="mt-2 block font-semibold text-[var(--ink)] transition hover:text-blue-700">{product.name}</Link>
        {product.specifications && <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{product.specifications}</p>}

        <div className="mt-4 flex items-baseline gap-2">
          <span className="display-heading text-xl font-semibold text-[var(--ink)]">{formatPrice(product.price)}</span>
          {hasDiscount && <span className="text-sm text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>}
        </div>

        <div className="mt-5 flex gap-2 pt-1">
          {enquiryLink ? (
            <a href={enquiryLink} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--whatsapp)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"><MessageCircle size={16} /> Enquire</a>
          ) : <Link to="/contact" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white"><MessageCircle size={16} /> Enquire</Link>}
          {onAddToCart && (
            <button type="button" disabled={product.stock <= 0} onClick={() => onAddToCart(product)} aria-label={`Add ${product.name} to cart`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] transition hover:border-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
              <ShoppingBag size={17} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default StoreProductCard;
