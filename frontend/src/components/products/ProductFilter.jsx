function ProductFilter({
  categories = [],
  selectedCategory = "",
  onCategoryChange,
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5">
      <label className="mb-2 block text-sm font-medium">
        Category
      </label>

      <select
        value={selectedCategory}
        onChange={(e) =>
          onCategoryChange(e.target.value)
        }
        className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm outline-none focus:border-cyan-500"
      >
        <option value="">All Categories</option>

        {categories.map((category) => (
          <option
            key={category.id || category.slug}
            value={category.slug}
          >
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProductFilter;