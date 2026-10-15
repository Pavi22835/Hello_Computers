// Display-only constants used by the UI. Replace the placeholders with real details.
export const SITE = {
  name: "Hello Computers",
  phone: "+91 99999 99999",
  phoneHref: "tel:+919999999999",
  whatsappNumber: "919999999999",
  email: "hello@hellocomputers.com",
  address: "Your Street, Your City, India",
  hours: "Mon – Sat · 10:00 AM – 8:00 PM",
};

export function whatsappLink(message = "Hi Hello Computers, I would like to enquire about your products.") {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
