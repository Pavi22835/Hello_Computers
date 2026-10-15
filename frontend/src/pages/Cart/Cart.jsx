import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/formatPrice";

function Cart() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    getCartTotal,
  } = useCart();

  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 100;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <ShoppingBag size={32} className="text-[var(--muted)]" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold">
            Your cart is empty
          </h1>

          <p className="mt-3 text-[var(--muted)]">
            You haven't added any products to your cart yet.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold">
          Shopping Cart
        </h1>

        <p className="mt-2 text-[var(--muted)]">
          Review your products before checkout.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => {
            const product = item.product;

            const price =
              product.discountPrice ?? product.price;

            return (
              <div
                key={product.id}
                className="flex gap-4 rounded-xl border border-[var(--line)] bg-white p-4 sm:p-5"
              >
                {/* Product Image */}
                <Link
                  to={`/products/${product.id}`}
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] p-3 sm:h-32 sm:w-32"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      No Image
                    </span>
                  )}
                </Link>

                {/* Product Info */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      {product.brand && (
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {product.brand}
                        </p>
                      )}

                      <Link
                        to={`/products/${product.id}`}
                        className="mt-1 block font-semibold hover:underline"
                      >
                        {product.name}
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(product.id)
                      }
                      className="shrink-0 text-slate-400 transition hover:text-red-600"
                      aria-label={`Remove ${product.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                    <div className="flex items-center rounded-xl border border-[var(--line)]">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            product.id,
                            item.quantity - 1
                          )
                        }
                        className="p-2 text-[var(--muted)] hover:text-blue-700"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="min-w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            product.id,
                            item.quantity + 1
                          )
                        }
                        className="p-2 text-[var(--muted)] hover:text-blue-700"
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <p className="font-semibold">
                      {formatPrice(price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-[var(--line)] bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">
                Subtotal
              </span>

              <span className="font-medium">
                {formatPrice(subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[var(--muted)]">
                Shipping
              </span>

              <span className="font-medium">
                {shipping === 0
                  ? "Free"
                  : formatPrice(shipping)}
              </span>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-base">
                <span className="font-semibold">
                  Total
                </span>

                <span className="font-semibold">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block w-full rounded-xl bg-[var(--navy)] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Proceed to Checkout
          </Link>

          <Link
            to="/products"
            className="mt-3 block text-center text-sm font-medium text-[var(--muted)] hover:text-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Cart;