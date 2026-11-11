import api from "./api";

export async function placeOrder(details) {
  const { data } = await api.post("/orders", details);
  return data;
}

export async function getOrders() {
  const { data } = await api.get("/orders");
  return data;
}

export async function getOrderById(id) {
  const { data } = await api.get(`/orders/${encodeURIComponent(id)}`);
  return data;
}