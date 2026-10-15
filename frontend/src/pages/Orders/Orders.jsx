import { Link } from "react-router-dom";
import { Package } from "lucide-react";

function Orders() {
  const orders = [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-semibold">
        My Orders
      </h1>

      <p className="mt-2 text-[var(--muted)]">
        View and track your orders.
      </p>

      {orders.length === 0 ? (
        <div className="mt-12 rounded-2xl border p-12 text-center">
          <Package
            size={48}
            className="mx-auto text-slate-300"
            strokeWidth={1.5}
          />

          <h2 className="mt-5 text-xl font-semibold">
            No orders yet
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Your orders will appear here after you make a purchase.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div>
          {/* Orders will come from API */}
        </div>
      )}
    </section>
  );
}

export default Orders;