export function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function date(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export function dateTime(value) {
  return value ? new Date(value).toLocaleString() : "—";
}
