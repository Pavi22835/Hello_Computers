import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

function OrderSuccess() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <CheckCircle
        size={72}
        className="mx-auto text-green-600"
        strokeWidth={1.5}
      />

      <h1 className="mt-6 text-3xl font-semibold">
        Order Placed Successfully
      </h1>

      <p className="mx-auto mt-4 max-w-lg text-[var(--muted)]">
        Thank you for your order. Your order has been
        received successfully.
      </p>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          to="/orders"
          className="rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white"
        >
          View Orders
        </Link>

        <Link
          to="/products"
          className="rounded-xl border px-6 py-3 text-sm font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}

export default OrderSuccess;