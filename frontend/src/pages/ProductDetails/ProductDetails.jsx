import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
} from "lucide-react";

import Loader from "../../components/common/Loader";
import { getProductById } from "../../services/product.service";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/formatPrice";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    try {
      setLoading(true);

      const response = await getProductById(id);

      setProduct(response?.data || response);
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">
          Product not found
        </h1>

        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium underline"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </section>
    );
  }

  const price = product.discountPrice ?? product.price;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <Link
        to="/products"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-blue-700"
      >
        <ArrowLeft size={16} />
        Back to Products
      </Link>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="flex min-h-[450px] items-center justify-center rounded-2xl bg-[var(--surface)] p-10">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[420px] w-full object-contain"
            />
          ) : (
            <Package
              size={100}
              strokeWidth={1}
              className="text-slate-300"
            />
          )}
        </div>

        <div className="py-4">
          {product.brand && (
            <p className="text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
              {product.brand}
            </p>
          )}

          <h1 className="mt-3 text-3xl font-semibold lg:text-4xl">
            {product.name}
          </h1>

          <p className="mt-6 text-3xl font-semibold">
            {formatPrice(price)}
          </p>

          {product.discountPrice && (
            <p className="mt-1 text-sm text-slate-400 line-through">
              {formatPrice(product.price)}
            </p>
          )}

          <div className="mt-6 border-y py-5">
            <p className="text-sm text-[var(--muted)]">
              {product.stock > 0
                ? `${product.stock} items available`
                : "Currently out of stock"}
            </p>
          </div>

          {product.description && (
            <div className="mt-6">
              <h2 className="font-semibold">
                Description
              </h2>

              <p className="mt-3 leading-7 text-[var(--muted)]">
                {product.description}
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => addToCart(product)}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--navy)] px-6 py-3.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ShoppingCart size={18} />

            {product.stock > 0
              ? "Add to Cart"
              : "Out of Stock"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;