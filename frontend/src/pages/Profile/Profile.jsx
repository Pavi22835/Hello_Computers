import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, MapPin, Pencil, Plus, Star, Trash2, User, Wrench } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { updateCurrentUser } from "../../services/auth.service";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddresses,
  getCustomerServiceRequests,
  updateCustomerAddress,
} from "../../services/customer.service";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const emptyAddress = {
  label: "",
  recipientName: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

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
  const [addresses, setAddresses] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [addressForm, setAddressForm] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getCustomerAddresses(), getCustomerServiceRequests()])
      .then(([savedAddresses, requests]) => {
        if (!active) return;
        setAddresses(savedAddresses);
        setServiceRequests(requests);
      })
      .catch((issue) => {
        if (active) setHistoryError(issue.response?.data?.message || "Customer details could not be loaded.");
      })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, []);

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

  async function saveAddress(event) {
    event.preventDefault();
    setAddressSaving(true);
    setHistoryError("");
    try {
      const saved = addressForm.id
        ? await updateCustomerAddress(addressForm.id, addressForm)
        : await createCustomerAddress(addressForm);
      setAddresses((current) => addressForm.id
        ? current.map((address) => address.id === saved.id ? saved : (saved.isDefault ? { ...address, isDefault: false } : address))
        : [saved, ...current.map((address) => saved.isDefault ? { ...address, isDefault: false } : address)]);
      setAddressForm(null);
    } catch (issue) {
      setHistoryError(issue.response?.data?.message || "Address could not be saved.");
    } finally {
      setAddressSaving(false);
    }
  }

  async function removeAddress(address) {
    if (!window.confirm(`Remove the ${address.label} address?`)) return;
    setHistoryError("");
    try {
      await deleteCustomerAddress(address.id);
      setAddresses((current) => current.filter((item) => item.id !== address.id));
    } catch (issue) {
      setHistoryError(issue.response?.data?.message || "Address could not be removed.");
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
      <section className="mt-8 rounded-2xl border p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-xl font-semibold">Saved addresses</h2><p className="mt-1 text-sm text-slate-500">Manage delivery addresses for your account.</p></div>
          <Button type="button" onClick={() => setAddressForm({ ...emptyAddress })} className="inline-flex items-center gap-2"><Plus size={16} />Add address</Button>
        </div>
        {historyError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{historyError}</p>}
        {historyLoading ? <p className="mt-5 text-sm text-slate-500">Loading account details…</p> : addresses.length === 0 ? <p className="mt-5 text-sm text-slate-500">No saved addresses yet.</p> : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {addresses.map((address) => (
              <article key={address.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-blue-700" />
                    <div><h3 className="flex flex-wrap items-center gap-2 font-semibold">{address.label}{address.isDefault && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"><Star size={12} />Default</span>}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{address.recipientName} · {address.phone}<br />{address.streetAddress}, {address.city}, {address.state} {address.postalCode}, {address.country}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" aria-label={`Edit ${address.label} address`} onClick={() => setAddressForm({ ...address })} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
                    <button type="button" aria-label={`Remove ${address.label} address`} onClick={() => removeAddress(address)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {addressForm && <form onSubmit={saveAddress} className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
          <h3 className="sm:col-span-2 text-lg font-semibold">{addressForm.id ? "Edit address" : "Add address"}</h3>
          <Input label="Address label" value={addressForm.label} onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))} required />
          <Input label="Recipient name" value={addressForm.recipientName} onChange={(event) => setAddressForm((current) => ({ ...current, recipientName: event.target.value }))} required />
          <Input label="Phone" value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} required />
          <Input label="Street address" value={addressForm.streetAddress} onChange={(event) => setAddressForm((current) => ({ ...current, streetAddress: event.target.value }))} required />
          <Input label="City" value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} required />
          <Input label="State" value={addressForm.state} onChange={(event) => setAddressForm((current) => ({ ...current, state: event.target.value }))} required />
          <Input label="Postal code" value={addressForm.postalCode} onChange={(event) => setAddressForm((current) => ({ ...current, postalCode: event.target.value }))} required />
          <Input label="Country" value={addressForm.country} onChange={(event) => setAddressForm((current) => ({ ...current, country: event.target.value }))} required />
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2"><input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))} />Set as default address</label>
          <div className="flex gap-3 sm:col-span-2"><Button type="submit" disabled={addressSaving}>{addressSaving ? "Saving…" : "Save address"}</Button><Button variant="outline" type="button" onClick={() => setAddressForm(null)}>Cancel</Button></div>
        </form>}
      </section>
      <section className="mt-8 rounded-2xl border p-8">
        <div className="flex items-center gap-3"><Wrench size={19} className="text-blue-700" /><div><h2 className="text-xl font-semibold">Service requests</h2><p className="mt-1 text-sm text-slate-500">Your service request updates appear here.</p></div></div>
        {historyLoading ? <p className="mt-5 text-sm text-slate-500">Loading service history…</p> : serviceRequests.length === 0 ? <p className="mt-5 text-sm text-slate-500">No service requests yet. <Link className="font-medium text-blue-700" to="/services">Browse our services</Link>.</p> : (
          <div className="mt-5 grid gap-3">
            {serviceRequests.map((request) => <article key={request.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{request.serviceType?.replace(/_/g, " ") || request.serviceTitle}</h3><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{request.status.replace(/_/g, " ")}</span></div>
              {request.laptopModel && <p className="mt-2 text-xs text-slate-500">Laptop model: {request.laptopModel}</p>}
              <p className="mt-2 text-sm leading-6 text-slate-600">{request.issueDescription || request.message}</p>
              <p className="mt-2 text-xs text-slate-500">Requested {new Date(request.createdAt).toLocaleString()}</p>
              {request.statusHistory?.length > 0 && <ol className="mt-3 grid gap-2 border-l-2 border-blue-100 pl-4">{request.statusHistory.map((entry) => <li key={`${entry.status}-${entry.createdAt}`} className="text-xs text-slate-600"><strong>{entry.status.replace(/_/g, " ")}</strong> · {new Date(entry.createdAt).toLocaleString()}</li>)}</ol>}
            </article>)}
          </div>
        )}
      </section>
    </section>
  );
}

export default Profile;
