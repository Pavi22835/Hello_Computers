import api from "./api";

export async function getStoreSettings() {
  const { data } = await api.get("/settings");
  return data;
}
