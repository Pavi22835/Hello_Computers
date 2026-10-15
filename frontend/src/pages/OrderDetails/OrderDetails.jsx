import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function OrderDetails() {
  const { id } = useParams();

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-blue-700"
      >
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      <div className="mt-8">
        <h1 className="text-3xl font-semibold">
          Order Details
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Order ID: {id}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border p-8">
        <p className="text-[var(--muted)]">
          Order details will be loaded from the backend.
        </p>
      </div>
    </section>
  );
}

export default OrderDetails;