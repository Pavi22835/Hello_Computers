/**
 * Safely extracts an array of items from any backend response structure.
 * Supports:
 * - Direct Array: [ ... ]
 * - Object with items: { items: [ ... ] }
 * - Object with products: { products: [ ... ] }
 * - Object with data: { data: [ ... ] } or { data: { items: [ ... ] } }
 * - Object with results: { results: [ ... ] }
 * - Object with rows: { rows: [ ... ] }
 */
export function normalizeProductList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  if (typeof data === "object") {
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.rows)) return data.rows;

    if (data.data && typeof data.data === "object") {
      if (Array.isArray(data.data.items)) return data.data.items;
      if (Array.isArray(data.data.products)) return data.data.products;
      if (Array.isArray(data.data.results)) return data.data.results;
      if (Array.isArray(data.data.rows)) return data.data.rows;
    }
  }

  return [];
}

/**
 * Safely extracts pagination metadata from a response object.
 */
export function normalizePagination(response) {
  if (!response || typeof response !== "object" || Array.isArray(response)) return null;

  if (response.pagination && typeof response.pagination === "object") {
    return response.pagination;
  }
  if (response.data?.pagination && typeof response.data.pagination === "object") {
    return response.data.pagination;
  }
  if (typeof response.total === "number" || typeof response.totalPages === "number") {
    const limit = response.limit || 20;
    const total = response.total ?? 0;
    return {
      page: response.page || 1,
      limit,
      total,
      totalPages: response.totalPages || Math.ceil(total / limit) || 1,
    };
  }
  return null;
}
