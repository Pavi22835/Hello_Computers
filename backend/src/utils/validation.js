function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function requiredString(value, label, maxLength = 500) {
  if (typeof value !== "string" || !value.trim()) {
    throw badRequest(`${label} is required.`);
  }
  const result = value.trim();
  if (result.length > maxLength) {
    throw badRequest(`${label} must be ${maxLength} characters or fewer.`);
  }
  return result;
}

function optionalString(value, label, maxLength = 2000) {
  if (value === undefined || value === null || value === "") return null;
  return requiredString(value, label, maxLength);
}

function optionalNumber(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (value === undefined || value === null || value === "") return null;
  const result = Number(value);
  if (!Number.isFinite(result) || result < min || result > max) {
    throw badRequest(`${label} must be a number between ${min} and ${max}.`);
  }
  return result;
}

function integer(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const result = Number(value);
  if (!Number.isInteger(result) || result < min || result > max) {
    throw badRequest(`${label} must be a whole number between ${min} and ${max}.`);
  }
  return result;
}

function boolean(value, label, defaultValue = true) {
  if (value === undefined) return defaultValue;
  if (typeof value !== "boolean") throw badRequest(`${label} must be true or false.`);
  return value;
}

function optionalDate(value, label) {
  if (value === undefined || value === null || value === "") return null;
  const result = new Date(value);
  if (Number.isNaN(result.getTime())) throw badRequest(`${label} must be a valid date.`);
  return result;
}

function email(value) {
  const result = requiredString(value, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) {
    throw badRequest("Enter a valid email address.");
  }
  return result;
}

function optionalUrl(value, label) {
  const result = optionalString(value, label, 2000);
  if (result === null) return null;
  try {
    const url = new URL(result, "http://localhost");
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Unsupported protocol");
    if (/^[a-z][a-z0-9+.-]*:/i.test(result) && !/^https?:/i.test(result)) throw new Error("Unsupported protocol");
    return result;
  } catch {
    throw badRequest(`${label} must be an HTTP, HTTPS, or relative URL.`);
  }
}

module.exports = { badRequest, requiredString, optionalString, optionalUrl, optionalNumber, integer, boolean, optionalDate, email };
