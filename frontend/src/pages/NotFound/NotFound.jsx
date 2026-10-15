import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="text-center">
        <p className="text-7xl font-semibold tracking-tight">
          404
        </p>

        <h1 className="mt-4 text-2xl font-semibold">
          Page Not Found
        </h1>

        <p className="mt-2 text-[var(--muted)]">
          The page you're looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </section>
  );
}

export default NotFound;