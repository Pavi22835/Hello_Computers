function Input({
  label,
  error,
  type = "text",
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
          {label}
        </label>
      )}

      <input
        type={type}
        className={`w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200 ${className}`}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;