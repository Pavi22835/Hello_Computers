import api from "./api";

export async function getCustomerAddresses() {
  const { data } = await api.get("/auth/me/addresses");
  return data;
}

export async function createCustomerAddress(address) {
  const { data } = await api.post("/auth/me/addresses", address);
  return data;
}

export async function updateCustomerAddress(id, address) {
  const { data } = await api.patch(`/auth/me/addresses/${encodeURIComponent(id)}`, address);
  return data;
}

export async function deleteCustomerAddress(id) {
  await api.delete(`/auth/me/addresses/${encodeURIComponent(id)}`);
}

export async function getCustomerServiceRequests() {
  const { data } = await api.get("/services/requests");
  return data;
}

export async function createCustomerServiceRequest(request) {
  const { data } = await api.post("/services/requests", request);
  return data;
}

export async function getServiceRequestByTrackingCode(trackingCode) {
  const { data } = await api.get(`/services/requests/track/${encodeURIComponent(trackingCode)}`);
  return data;
}
