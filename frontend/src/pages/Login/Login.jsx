import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { loginUser } from "../../services/auth.service";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await loginUser(form);
      if (result.user.role !== "CUSTOMER") throw new Error("Please sign in with a customer account.");
      login(result.token, result.user);
      navigate("/");
    } catch (issue) {
      setError(issue.response?.data?.message || issue.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-76px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Sign in to your Hello Computers account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            required
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-700 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;