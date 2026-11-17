import api from "./api";

export async function placeOrder(details) {
  const { data } = await api.post("/orders", details);
  return data;
}

export async function createRazorpayOrder(details) {
  const { data } = await api.post("/orders/razorpay/order", details);
  return data;
}

export async function verifyRazorpayPayment(details) {
  const { data, status } = await api.post("/orders/razorpay/verify", details, { validateStatus: (code) => code < 400 });
  return { data, status };
}

export async function failRazorpayPayment(details) {
  const { data } = await api.post("/orders/razorpay/failure", details);
  return data;
}

export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function getOrders() {
  const { data } = await api.get("/orders");
  return data;
}

export async function getOrderById(id) {
  const { data } = await api.get(`/orders/${encodeURIComponent(id)}`);
  return data;
}