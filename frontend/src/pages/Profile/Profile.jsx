import { Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";

function Profile() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <User
          size={60}
          className="mx-auto text-slate-300"
          strokeWidth={1.5}
        />

        <h1 className="mt-6 text-2xl font-semibold">
          Sign in to view your profile
        </h1>

        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white"
        >
          Sign In
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">
        My Profile
      </h1>

      <div className="mt-8 rounded-2xl border p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-[var(--muted)]">
              Name
            </p>

            <p className="mt-1 font-medium">
              {user?.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-[var(--muted)]">
              Email
            </p>

            <p className="mt-1 font-medium">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <Button
            variant="outline"
            onClick={() => logout()}
            className="inline-flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Profile;