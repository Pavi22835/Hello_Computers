function customerPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10) return `${process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "91"}${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return digits;
  throw new Error("Customer phone number is not valid for WhatsApp delivery.");
}

function messageParameters(order, type) {
  const total = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(order.total);
  return type === "confirmation"
    ? [order.orderNumber, order.customerName, total, order.paymentMethod]
    : [order.orderNumber, order.status, order.paymentStatus, total];
}

async function sendTemplate(phone, template, parameters, notificationType) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!accessToken && !phoneNumberId && !template) return;
  if (!accessToken || !phoneNumberId || !template) {
    throw new Error(`WhatsApp ${notificationType} notifications require an access token, phone number ID, and matching approved template.`);
  }

  const version = process.env.WHATSAPP_API_VERSION;
  if (!version) throw new Error(`WHATSAPP_API_VERSION is required for WhatsApp ${notificationType} notifications.`);
  if (!/^v\d+\.\d+$/.test(version)) throw new Error("WHATSAPP_API_VERSION must use the format vNN.N.");
  const response = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(phoneNumberId)}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: customerPhone(phone),
      type: "template",
      template: {
        name: template,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en" },
        components: [{
          type: "body",
          parameters: parameters.map((text) => ({ type: "text", text: String(text) })),
        }],
      },
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`WhatsApp notification failed with HTTP ${response.status}.`);
}

async function sendOrderNotification(order, type) {
  const template = type === "confirmation"
    ? process.env.WHATSAPP_ORDER_CONFIRMATION_TEMPLATE
    : process.env.WHATSAPP_ORDER_STATUS_TEMPLATE;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!accessToken && !phoneNumberId && !template) return;
  await sendTemplate(order.phone, template, messageParameters(order, type), "order");
}

async function sendServiceRequestNotification(serviceRequest, type) {
  const template = type === "confirmation"
    ? process.env.WHATSAPP_SERVICE_ENQUIRY_CONFIRMATION_TEMPLATE
    : process.env.WHATSAPP_SERVICE_ENQUIRY_STATUS_TEMPLATE;
  if (!template) return;
  const parameters = type === "confirmation"
    ? [serviceRequest.id, serviceRequest.customerName, serviceRequest.serviceType, serviceRequest.status]
    : [serviceRequest.id, serviceRequest.status, serviceRequest.serviceType, serviceRequest.customerName];
  await sendTemplate(serviceRequest.phone, template, parameters, "service enquiry");
}

module.exports = { sendOrderNotification, sendServiceRequestNotification };
