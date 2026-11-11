export function whatsappLink(number, message = "Hi Hello Computers, I would like to enquire about your products.") {
  const digits = String(number || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}
