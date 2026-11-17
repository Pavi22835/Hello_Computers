import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";

function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const paymentPending = searchParams.get("payment") === "pending";
  const cashOnDelivery = searchParams.get("payment") === "cod";
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <CheckCircle
        size={72}
        className={`mx-auto ${paymentPending ? "text-amber-500" : "text-green-600"}`}
        strokeWidth={1.5}
      />

      <h1 className="mt-6 text-3xl font-semibold">
        {paymentPending ? "Payment Processing" : "Order Placed Successfully"}
      </h1>

      <p className="mx-auto mt-4 max-w-lg text-[var(--muted)]">
        {paymentPending
          ? "Your payment is awaiting confirmation. Check your order details for the latest status."
          : cashOnDelivery
            ? "Thank you for your order. Pay for it when it is delivered."
            : "Thank you for your order. Your payment has been confirmed."}
      </p>
      {orderId && <p className="mt-2 text-sm text-[var(--muted)]">Order reference: {orderId}</p>}

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