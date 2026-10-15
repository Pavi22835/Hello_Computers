function ProductSort({
  value = "newest",
  onChange,
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-[var(--muted)]">
        Sort:
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
      >
        <option value="newest">Newest</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="name">Name</option>
      </select>
    </div>
  );
}

export default ProductSort;