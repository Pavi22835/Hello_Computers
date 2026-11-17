import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { formatPrice } from "../../utils/formatPrice";
import {
  createRazorpayOrder,
  failRazorpayPayment,
  loadRazorpay,
  placeOrder,
  verifyRazorpayPayment,
} from "../../services/order.service";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

function Checkout() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart, loading: cartLoading, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    customerName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const subtotal = getCartTotal();

  useEffect(() => {
    if (cartLoading) return;
    refreshCart().catch(() => {});
  }, [cartLoading, refreshCart]);

  if (cartLoading) {
    return <section className="mx-auto max-w-7xl px-6 py-20 text-center">Loading your saved cart...</section>;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  async function submitCashOrder(cartItems) {
    const order = await placeOrder({
      ...form,
      items: cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity })),
    });
    clearCart();
    navigate(`/order-success?order=${encodeURIComponent(order.id)}&payment=cod`);
  }

  async function submitRazorpayOrder(cartItems) {
    const { order, payment } = await createRazorpayOrder({
      ...form,
      items: cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity })),
    });
    const loaded = await loadRazorpay();
    if (!loaded) {
      await failRazorpayPayment({ orderId: order.id, reason: "Razorpay Checkout could not be loaded." });
      throw new Error("Payment checkout could not be loaded. Your cart is unchanged; please try again.");
    }

    const checkout = new window.Razorpay({
      key: payment.keyId,
      amount: payment.amount,
      currency: payment.currency,
      name: "Hello Computers",
      description: `Order ${order.orderNumber}`,
      order_id: payment.razorpayOrderId,
      prefill: { name: form.customerName, email: form.email, contact: form.phone },
      notes: { orderId: order.id },
      theme: { color: "#14213d" },
      handler: async (result) => {
        try {
          const verified = await verifyRazorpayPayment({ orderId: order.id, ...result });
          if (verified.data.paymentStatus === "FAILED") {
            setError("Payment failed. Your cart is still available; please try again.");
            setSubmitting(false);
            return;
          }
          clearCart();
          navigate(`/order-success?order=${encodeURIComponent(order.id)}&payment=${verified.status === 202 ? "pending" : "paid"}`);
        } catch (issue) {
          setError(issue.response?.data?.message || "Payment verification is still pending. Check My Orders before retrying payment.");
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: async () => {
          try {
            const result = await failRazorpayPayment({ orderId: order.id, reason: "Checkout was closed before payment confirmation." });
            setError(result.paymentStatus === "PENDING"
              ? "Payment is still processing. Check My Orders before trying again."
              : "Checkout closed before payment. Your cart is still available.");
          } catch {
            setError("Checkout closed, but payment status could not be updated. Check My Orders before retrying.");
          }
          setSubmitting(false);
        },
      },
    });
    checkout.on("payment.failed", async (result) => {
      try {
        const status = await failRazorpayPayment({
          orderId: order.id,
          reason: result.error?.description || "Payment failed.",
        });
        if (status.paymentStatus === "PENDING") {
          setError("Payment status is pending confirmation. Check My Orders before retrying.");
          setSubmitting(false);
          return;
        }
      } catch {
        setError("Payment failed, but the order status could not be updated. Please check My Orders.");
      }
      setError(result.error?.description || "Payment failed. Your cart is still available; please try again.");
      setSubmitting(false);
    });
    checkout.open();
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const currentItems = await refreshCart();
      if (!currentItems?.length) throw new Error("Your cart is empty. Add products before checking out.");
      if (paymentMethod === "COD") await submitCashOrder(currentItems);
      else await submitRazorpayOrder(currentItems);
    } catch (issue) {
      setError(issue.response?.data?.message || issue.message || "We could not start checkout. Please try again.");
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold">Sign in to complete your order</h1>
        <p className="mt-3 text-[var(--muted)]">Your cart will remain saved in this browser.</p>
        <Link to="/login" className="mt-7 inline-block rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white">Sign In</Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-3 text-[var(--muted)]">Add products before proceeding to checkout.</p>
        <Link to="/products" className="mt-7 inline-block rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white">Browse Products</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Prices, payment and stock are verified securely by the server.</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Input label="Full Name" name="customerName" value={form.customerName} onChange={handleChange} autoComplete="name" required />
              <Input label="Phone" type="tel" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" required />
              <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
            </div>
          </div>
          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">Delivery Address</h2>
            <div className="mt-6 space-y-5">
              <Input label="Address" name="address" value={form.address} onChange={handleChange} autoComplete="street-address" required />
              <div className="grid gap-5 sm:grid-cols-3">
                <Input label="City" name="city" value={form.city} onChange={handleChange} autoComplete="address-level2" required />
                <Input label="State" name="state" value={form.state} onChange={handleChange} autoComplete="address-level1" required />
                <Input label="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} autoComplete="postal-code" required />
              </div>
            </div>
          </div>
          <fieldset className="rounded-2xl border p-6">
            <legend className="px-2 text-lg font-semibold">Payment Method</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                <input type="radio" name="paymentMethod" value="RAZORPAY" checked={paymentMethod === "RAZORPAY"} onChange={() => setPaymentMethod("RAZORPAY")} />
                <span><strong className="block text-sm">Pay online</strong><small className="mt-1 block text-xs text-[var(--muted)]">Secure checkout with Razorpay</small></span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                <span><strong className="block text-sm">Cash on delivery</strong><small className="mt-1 block text-xs text-[var(--muted)]">Pay when your order arrives</small></span>
              </label>
            </div>
          </fieldset>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Preparing checkout..." : paymentMethod === "COD" ? "Place order (cash on delivery)" : "Continue to secure payment"}</Button>
        </form>

        <div className="h-fit rounded-2xl border p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 text-sm">
                {item.product.image && <img src={item.product.image} alt="" className="h-14 w-14 rounded-lg bg-slate-50 object-contain" />}
                <span className="min-w-0 flex-1 text-[var(--muted)]">
                  <strong className="block truncate text-[var(--ink)]">{item.product.name}</strong>
                  {item.product.model && <small className="block">Model: {item.product.model}</small>}
                  Qty {item.quantity} × {formatPrice(item.product.discountPrice ?? item.product.price)}
                </span>
                <span className="shrink-0 font-medium">{formatPrice((item.product.discountPrice ?? item.product.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t pt-5 text-sm">
            <div className="flex justify-between"><span className="text-[var(--muted)]">Estimated subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <p className="text-xs leading-5 text-[var(--muted)]">Final shipping and total are calculated by the server using current prices and store shipping rules.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
