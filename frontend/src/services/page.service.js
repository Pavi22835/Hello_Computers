import api from "./api";

export async function getPageContent(page) {
  const { data } = await api.get(`/pages/${encodeURIComponent(page)}`);
  return data;
}
