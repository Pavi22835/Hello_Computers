function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  disabled = false,
  onClick,
}) {
  const variants = {
    primary: "bg-[var(--navy)] text-white hover:bg-blue-500",
    secondary: "bg-blue-50 text-[var(--ink)] hover:bg-blue-100",
    outline:
      "border border-[var(--line)] bg-white text-[var(--ink)] hover:border-cyan-400 hover:text-blue-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
