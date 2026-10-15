import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/formatPrice";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

function Checkout() {
  const navigate = useNavigate();
  const { items, getCartTotal } = useCart();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const subtotal = getCartTotal();
  const shipping = subtotal >= 5000 ? 0 : 100;
  const total = subtotal + shipping;

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (items.length === 0) {
      return;
    }

    navigate("/order-success");
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold">
          Your cart is empty
        </h1>

        <p className="mt-3 text-[var(--muted)]">
          Add products before proceeding to checkout.
        </p>

        <Link
          to="/products"
          className="mt-7 inline-block rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white"
        >
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-semibold">
        Checkout
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">
              Contact Information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Input
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />

              <Input
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />

              <Input
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">
              Delivery Address
            </h2>

            <div className="mt-6 space-y-5">
              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />

              <div className="grid gap-5 sm:grid-cols-3">
                <Input
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Continue to Payment
          </Button>
        </form>

        <div className="h-fit rounded-2xl border p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="text-[var(--muted)]">
                  {item.product.name} × {item.quantity}
                </span>

                <span className="font-medium">
                  {formatPrice(
                    (item.product.discountPrice ??
                      item.product.price) *
                      item.quantity
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">
                Subtotal
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[var(--muted)]">
                Shipping
              </span>
              <span>
                {shipping === 0
                  ? "Free"
                  : formatPrice(shipping)}
              </span>
            </div>

            <div className="flex justify-between border-t pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;