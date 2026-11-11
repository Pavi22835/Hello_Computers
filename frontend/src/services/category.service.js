import api from "./api";

export async function getCategories() {
  const { data } = await api.get("/categories");
  return data;
}

export async function getCategoryBySlug(slug) {
  const { data } = await api.get(`/categories/${encodeURIComponent(slug)}`);
  return data;
}