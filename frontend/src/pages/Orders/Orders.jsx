import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getOrders } from "../../services/order.service";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";

function Orders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    getOrders()
      .then((result) => { if (active) setOrders(result); })
      .catch((issue) => { if (active) setError(issue.response?.data?.message || "Orders could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <section className="mx-auto max-w-3xl px-6 py-20 text-center"><h1 className="text-3xl font-semibold">Sign in to view your orders</h1><Link to="/login" className="mt-7 inline-block rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white">Sign In</Link></section>;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-semibold">My Orders</h1>
      <p className="mt-2 text-[var(--muted)]">View your order history and status.</p>
      {loading ? <Loader /> : error ? (
        <p role="alert" className="mt-8 rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p>
      ) : orders.length === 0 ? (
        <div className="mt-12 rounded-2xl border p-12 text-center">
          <Package size={48} className="mx-auto text-slate-300" strokeWidth={1.5} />
          <h2 className="mt-5 text-xl font-semibold">No orders yet</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Your orders will appear here after checkout.</p>
          <Link to="/products" className="mt-6 inline-block rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white">Start Shopping</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-5 transition hover:border-blue-300">
              <span><strong className="block">{order.orderNumber}</strong><small className="text-[var(--muted)]">{new Date(order.createdAt).toLocaleString()}</small></span>
              <span className="text-sm">{order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
              <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold">{order.status}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default Orders;
