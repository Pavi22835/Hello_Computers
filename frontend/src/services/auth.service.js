import api from "./api";

export async function loginUser(credentials) {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

export async function registerUser(details) {
  const { data } = await api.post("/auth/register", details);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

export async function updateCurrentUser(details) {
  const { data } = await api.patch("/auth/me", details);
  return data.user;
}