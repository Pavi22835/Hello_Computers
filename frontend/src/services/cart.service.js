import api from "./api";

export async function getCart() {
  const { data } = await api.get("/cart");
  return data;
}

export async function replaceCart(items) {
  const { data } = await api.put("/cart", {
    items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
  });
  return data;
}