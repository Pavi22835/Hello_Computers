import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { formatPrice } from "../../utils/formatPrice";
import { placeOrder } from "../../services/order.service";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

function Checkout() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart, loading: cartLoading } = useCart();
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
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const subtotal = getCartTotal();

  if (cartLoading) {
    return <section className="mx-auto max-w-7xl px-6 py-20 text-center">Loading your saved cart...</section>;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const order = await placeOrder({
        ...form,
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      });
      clearCart();
      navigate(`/order-success?order=${encodeURIComponent(order.id)}`);
    } catch (issue) {
      setError(issue.response?.data?.message || "We could not place your order. Please try again.");
    } finally {
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
      <p className="mt-2 text-sm text-[var(--muted)]">Prices and stock are verified securely when you place the order.</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Input label="Full Name" name="customerName" value={form.customerName} onChange={handleChange} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
              <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">Delivery Address</h2>
            <div className="mt-6 space-y-5">
              <Input label="Address" name="address" value={form.address} onChange={handleChange} required />
              <div className="grid gap-5 sm:grid-cols-3">
                <Input label="City" name="city" value={form.city} onChange={handleChange} required />
                <Input label="State" name="state" value={form.state} onChange={handleChange} required />
                <Input label="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} required />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Placing order..." : "Place order (pay on delivery)"}</Button>
        </form>

        <div className="h-fit rounded-2xl border p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between gap-4 text-sm">
                <span className="text-[var(--muted)]">{item.product.name} × {item.quantity}</span>
                <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t pt-5 text-sm">
            <div className="flex justify-between"><span className="text-[var(--muted)]">Estimated subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <p className="text-xs leading-5 text-[var(--muted)]">Final shipping and total are calculated by the server based on current prices and configured shipping rules.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
