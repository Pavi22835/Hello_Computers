const Razorpay = require("razorpay");

let client;

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const error = new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    error.status = 503;
    throw error;
  }
  if (!client) client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}

function getPublicKeyId() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    const error = new Error("Razorpay is not configured.");
    error.status = 503;
    throw error;
  }
  return keyId;
}

module.exports = { getRazorpay, getPublicKeyId };
