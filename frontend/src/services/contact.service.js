import api from "./api";

export async function submitEnquiry(enquiry) {
  const { data } = await api.post("/enquiries", enquiry);
  return data;
}