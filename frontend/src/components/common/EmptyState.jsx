import { PackageOpen } from "lucide-react";

function EmptyState({
  title = "Nothing found",
  message = "There is nothing to display here.",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <PackageOpen size={24} />
      </div>

      <h3 className="text-lg font-semibold text-[var(--ink)]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
        {message}
      </p>
    </div>
  );
}

export default EmptyState;
