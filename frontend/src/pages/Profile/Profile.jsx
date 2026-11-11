import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { updateCurrentUser } from "../../services/auth.service";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

function Profile() {
  const { user, isAuthenticated, loading, logout, updateUser } = useAuth();

  if (loading) return <section className="mx-auto max-w-3xl px-6 py-20 text-center">Loading profile...</section>;
  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <User size={60} className="mx-auto text-slate-300" strokeWidth={1.5} />
        <h1 className="mt-6 text-2xl font-semibold">Sign in to view your profile</h1>
        <Link to="/login" className="mt-6 inline-block rounded-xl bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white">Sign In</Link>
      </section>
    );
  }

  return <ProfileEditor key={user.id} user={user} logout={logout} updateUser={updateUser} />;
}

function ProfileEditor({ user, logout, updateUser }) {
  const [form, setForm] = useState({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveProfile(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    try {
      const updated = await updateCurrentUser(form);
      updateUser(updated);
      setMessage("Profile updated.");
    } catch (issue) {
      setError(issue.response?.data?.message || "Profile could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">My Profile</h1>
      <div className="mt-8 rounded-2xl border p-8">
        <form onSubmit={saveProfile} className="space-y-5">
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
          <Input label="Name" name="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          <Input label="Email" type="email" name="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
          <Input label="Phone" name="phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button>
            <Button variant="outline" type="button" onClick={logout} className="inline-flex items-center gap-2"><LogOut size={16} />Sign Out</Button>
            <Link to="/orders" className="inline-flex items-center rounded-xl border px-5 py-3 text-sm font-medium">My Orders</Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Profile;
