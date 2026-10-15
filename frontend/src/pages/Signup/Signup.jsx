import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Backend registration will be connected here.
    navigate("/login");
  };

  return (
    <section className="flex min-h-[calc(100vh-76px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Create your Hello Computers account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-700 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Signup;