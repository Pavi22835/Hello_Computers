import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/formatPrice";
import ProductVisual from "./ProductVisual";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const price = product.discountPrice ?? product.price;

  return (
    <div className="group overflow-hidden rounded-3xl border border-[var(--line)] bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5">
      <Link to={`/products/${product.id}`} className="block">
        <ProductVisual src={product.image} alt={product.name} category={product.category} className="h-60" />
      </Link>

      <div className="p-5">
        {product.brand && (
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{product.brand}</p>
        )}

        <Link to={`/products/${product.id}`} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-12 font-semibold text-[var(--ink)] transition hover:text-blue-700">{product.name}</h3>
        </Link>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="display-heading text-lg font-semibold">{formatPrice(price)}</p>

            {product.discountPrice && (
              <p className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</p>
            )}
          </div>

          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => addToCart(product)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Add to cart"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
