import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/logos/logo.jpeg";
import { request } from "../services/api";
import "../styles/Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (result.user.role !== "ADMIN") throw new Error("This account does not have administrator access.");
      onLogin(result);
    } catch (issue) {
      setError(issue.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <img className="admin-login__logo" src={logo} alt="Hello Computers logo" />
        <p className="admin-login__eyebrow">HELLO COMPUTERS</p>
        <h1 className="admin-login__title">Welcome Back</h1>
        <p className="admin-login__copy">Sign in to your administrator account to continue.</p>

        {error && <div className="admin-login__error" role="alert">{error}</div>}

        <label className="admin-login__field">
          Username
          <input
            type="email"
            autoComplete="username"
            placeholder="Enter your email address"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="admin-login__field">
          Password
          <span className="admin-login__password">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className="admin-login__visibility"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </span>
        </label>

        <button className="admin-login__submit" type="submit" disabled={busy}>
          {busy ? "Signing in..." : "Login"}
        </button>
        <p className="admin-login__foot">Administrator access only</p>
      </form>
    </main>
  );
}
