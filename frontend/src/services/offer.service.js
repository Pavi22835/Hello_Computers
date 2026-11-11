import api from "./api";

export async function getOffers() {
  const { data } = await api.get("/offers");
  return data;
}
