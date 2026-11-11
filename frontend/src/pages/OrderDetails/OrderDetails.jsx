import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Loader from "../../components/common/Loader";
import { getOrderById } from "../../services/order.service";
import { formatPrice } from "../../utils/formatPrice";

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getOrderById(id)
      .then((result) => { if (active) setOrder(result); })
      .catch((issue) => { if (active) setError(issue.response?.data?.message || "Order could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-blue-700"><ArrowLeft size={16} />Back to Orders</Link>
      {loading ? <Loader /> : error ? <p role="alert" className="mt-8 rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p> : order && (
        <>
          <div className="mt-8">
            <h1 className="text-3xl font-semibold">Order {order.orderNumber}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{new Date(order.createdAt).toLocaleString()} · {order.status}</p>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {order.items.map((item) => (
                <article key={item.id} className="flex items-center justify-between gap-5 rounded-2xl border p-5">
                  <div className="flex items-center gap-4">
                    {item.imageUrl && <img src={item.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />}
                    <span><strong className="block">{item.productName}</strong><small className="text-[var(--muted)]">Qty {item.quantity} × {formatPrice(item.unitPrice)}</small></span>
                  </div>
                  <strong>{formatPrice(item.lineTotal)}</strong>
                </article>
              ))}
            </div>
            <aside className="h-fit rounded-2xl border p-6">
              <h2 className="font-semibold">Delivery details</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{order.customerName}<br />{order.address}<br />{order.city}, {order.state} {order.postalCode}<br />{order.phone}</p>
              <div className="mt-5 space-y-3 border-t pt-4 text-sm">
                <p className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></p>
                <p className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shippingCost)}</span></p>
                <p className="flex justify-between border-t pt-3 font-semibold"><span>Total</span><span>{formatPrice(order.total)}</span></p>
              </div>
              <p className="mt-4 text-xs text-[var(--muted)]">Payment is due on delivery.</p>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}

export default OrderDetails;
