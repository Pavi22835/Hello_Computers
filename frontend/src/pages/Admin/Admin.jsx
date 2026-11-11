import { useCallback, useEffect, useMemo, useState } from "react";
import "./Admin.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const emptyStats = { products: 0, categories: 0, offers: 0, services: 0, enquiries: 0, newEnquiries: 0, lowStock: 0, orders: 0, customers: 0 };
const sections = [
  { id: "dashboard", label: "Overview", icon: "⌂" },
  { id: "products", label: "Products", icon: "▣" },
  { id: "categories", label: "Categories", icon: "◫" },
  { id: "offers", label: "Offers", icon: "％" },
  { id: "services", label: "Services", icon: "⚙" },
  { id: "orders", label: "Orders", icon: "▤" },
  { id: "customers", label: "Customers", icon: "♙" },
  { id: "settings", label: "Store settings", icon: "⚙" },
  { id: "enquiries", label: "Enquiries", icon: "✉" },
];

const configs = {
  products: {
    title: "Products",
    singular: "product",
    endpoint: "/products",
    fields: [
      { name: "name", label: "Product name", required: true },
      { name: "brand", label: "Brand" },
      { name: "price", label: "Price (₹)", type: "number", min: 0.01, step: "0.01", required: true },
      { name: "oldPrice", label: "Original price (₹)", type: "number", min: 0.01, step: "0.01" },
      { name: "stock", label: "Stock", type: "number", min: 0, step: "1" },
      { name: "categoryId", label: "Category", type: "category" },
      { name: "imageUrl", label: "Image URL" },
      { name: "images", label: "Additional image URLs", type: "textarea", help: "One image URL per line.", wide: true },
      { name: "badge", label: "Badge" },
      { name: "specifications", label: "Specifications", type: "textarea", wide: true },
      { name: "description", label: "Description", type: "textarea", wide: true },
    ],
    columns: [
      { label: "Product", render: (item) => <><strong>{item.name}</strong><small>{item.brand || "No brand"}</small></> },
      { label: "Category", render: (item) => item.category?.name || "Uncategorized" },
      { label: "Price", render: (item) => money(item.price) },
      { label: "Stock", render: (item) => <span className={item.stock <= 5 ? "stock-low" : ""}>{item.stock} units</span> },
    ],
    defaults: { name: "", brand: "", price: "", oldPrice: "", stock: 0, categoryId: "", imageUrl: "", images: "", badge: "", specifications: "", description: "" },
  },
  categories: {
    title: "Categories",
    singular: "category",
    endpoint: "/categories",
    fields: [
      { name: "name", label: "Category name", required: true },
      { name: "slug", label: "URL slug", help: "Leave blank to generate from the category name." },
      { name: "imageUrl", label: "Image URL" },
      { name: "description", label: "Description", type: "textarea", wide: true },
    ],
    columns: [
      { label: "Category", render: (item) => <><strong>{item.name}</strong><small>/{item.slug}</small></> },
      { label: "Products", render: (item) => item._count?.products ?? "—" },
    ],
    defaults: { name: "", slug: "", imageUrl: "", description: "" },
  },
  offers: {
    title: "Offers",
    singular: "offer",
    endpoint: "/offers",
    fields: [
      { name: "title", label: "Offer title", required: true },
      { name: "discount", label: "Discount (%)", type: "number", min: 0, max: 100, step: "0.01" },
      { name: "startsAt", label: "Starts at", type: "datetime-local" },
      { name: "endsAt", label: "Ends at", type: "datetime-local" },
      { name: "imageUrl", label: "Image URL" },
      { name: "description", label: "Description", type: "textarea", wide: true, required: true },
      { name: "isActive", label: "Offer is active", type: "checkbox", wide: true },
    ],
    columns: [
      { label: "Offer", render: (item) => <><strong>{item.title}</strong><small>{item.description}</small></> },
      { label: "Discount", render: (item) => item.discount == null ? "—" : `${item.discount}%` },
      { label: "Status", render: (item) => <Status active={item.isActive} /> },
      { label: "Ends", render: (item) => date(item.endsAt) },
    ],
    defaults: { title: "", discount: "", startsAt: "", endsAt: "", imageUrl: "", description: "", isActive: true },
  },
  services: {
    title: "Services",
    singular: "service",
    endpoint: "/services",
    fields: [
      { name: "title", label: "Service title", required: true },
      { name: "imageUrl", label: "Image URL" },
      { name: "description", label: "Description", type: "textarea", wide: true, required: true },
      { name: "isActive", label: "Service is active", type: "checkbox", wide: true },
    ],
    columns: [
      { label: "Service", render: (item) => <><strong>{item.title}</strong><small>{item.description}</small></> },
      { label: "Status", render: (item) => <Status active={item.isActive} /> },
      { label: "Created", render: (item) => date(item.createdAt) },
    ],
    defaults: { title: "", description: "", imageUrl: "", isActive: true },
  },
  orders: {
    title: "Orders",
    singular: "order",
    endpoint: "/admin/orders",
    fields: [
      { name: "userId", label: "Customer ID", required: true, createOnly: true },
      { name: "customerName", label: "Customer name", required: true, createOnly: true },
      { name: "email", label: "Email", type: "email", required: true, createOnly: true },
      { name: "phone", label: "Phone", required: true, createOnly: true },
      { name: "address", label: "Address", required: true, createOnly: true },
      { name: "city", label: "City", required: true, createOnly: true },
      { name: "state", label: "State", required: true, createOnly: true },
      { name: "postalCode", label: "Postal code", required: true, createOnly: true },
      { name: "items", label: "Order items (JSON)", type: "textarea", required: true, createOnly: true, wide: true, help: 'Format: [{"productId":"...","quantity":1}]' },
      { name: "status", label: "Status", type: "select", options: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"], editOnly: true },
    ],
    columns: [
      { label: "Order", render: (item) => <><strong>{item.orderNumber}</strong><small>{date(item.createdAt)}</small></> },
      { label: "Customer", render: (item) => <><strong>{item.customerName}</strong><small>{item.email}</small></> },
      { label: "Total", render: (item) => money(item.total) },
      { label: "Status", render: (item) => <Status active={item.status !== "CANCELLED"}>{item.status}</Status> },
    ],
    defaults: { userId: "", customerName: "", email: "", phone: "", address: "", city: "", state: "", postalCode: "", items: "[]", status: "PENDING" },
  },
  customers: {
    title: "Customers",
    singular: "customer",
    endpoint: "/admin/customers",
    fields: [
      { name: "name", label: "Full name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone" },
      { name: "password", label: "Temporary password", type: "password", required: true, createOnly: true, help: "At least 8 characters. Only needed for new accounts." },
    ],
    columns: [
      { label: "Customer", render: (item) => <><strong>{item.name}</strong><small>{item.email}</small></> },
      { label: "Phone", render: (item) => item.phone || "—" },
      { label: "Orders", render: (item) => item._count?.orders ?? 0 },
      { label: "Joined", render: (item) => date(item.createdAt) },
    ],
    defaults: { name: "", email: "", phone: "", password: "" },
  },
  settings: {
    title: "Store settings",
    singular: "settings",
    createLabel: "Edit store settings",
    deletable: false,
    endpoint: "/admin/settings",
    fields: [
      { name: "phone", label: "Phone" },
      { name: "whatsappNumber", label: "WhatsApp number" },
      { name: "email", label: "Store email", type: "email" },
      { name: "address", label: "Address", type: "textarea", wide: true },
      { name: "hours", label: "Opening hours", type: "textarea", wide: true },
      { name: "shippingFee", label: "Shipping fee", type: "number", min: 0, step: "0.01" },
      { name: "freeShippingThreshold", label: "Free shipping threshold", type: "number", min: 0, step: "0.01", help: "Leave blank to always charge the configured shipping fee." },
    ],
    columns: [
      { label: "Phone", render: (item) => item.phone || "Not set" },
      { label: "Email", render: (item) => item.email || "Not set" },
      { label: "Shipping", render: (item) => money(item.shippingFee || 0) },
      { label: "Free shipping at", render: (item) => item.freeShippingThreshold == null ? "Not set" : money(item.freeShippingThreshold) },
    ],
    defaults: { phone: "", whatsappNumber: "", email: "", address: "", hours: "", shippingFee: "", freeShippingThreshold: "" },
  },
};

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function date(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function Status({ active, children }) {
  return <span className={`pill ${active ? "pill-green" : "pill-gray"}`}>{children || (active ? "Active" : "Inactive")}</span>;
}

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${response.status}).`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="login-shell">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark">HC</div>
        <p className="eyebrow">HELLO COMPUTERS</p>
        <h1>Welcome back</h1>
        <p className="login-copy">Sign in with your administrator account to manage your store.</p>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        <label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <button className="primary-button login-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="login-foot">Administrator access only</p>
      </form>
    </main>
  );
}

function App() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("hello-admin-token");
    const user = localStorage.getItem("hello-admin-user");
    if (!token || !user) return null;
    try {
      return { token, user: JSON.parse(user) };
    } catch {
      localStorage.removeItem("hello-admin-token");
      localStorage.removeItem("hello-admin-user");
      return null;
    }
  });
  const [section, setSection] = useState("dashboard");
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [stats, setStats] = useState(emptyStats);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const toast = useCallback((message, isError = false) => {
    setNotice(message);
    setNoticeError(isError);
    window.setTimeout(() => setNotice(""), 3800);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hello-admin-token");
    localStorage.removeItem("hello-admin-user");
    setSession(null);
  }, []);

  const api = useCallback((path, options = {}) => request(path, { ...options, token: session?.token }), [session?.token]);

  useEffect(() => {
    if (!session) return;
    api("/auth/me").then(({ user }) => {
      if (user.role !== "ADMIN") logout();
    }).catch(logout);
  }, [api, logout, session]);

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      if (section === "dashboard") {
        setStats(await api("/admin/dashboard"));
      } else {
        const path = section === "offers" || section === "services"
          ? `${configs[section].endpoint}?includeInactive=true`
          : configs[section].endpoint;
        const [result, categoryRows] = await Promise.all([
          api(path),
          section === "products" ? api("/categories") : Promise.resolve([]),
        ]);
        const rows = section === "settings" ? [result] : result;
        setItems(rows);
        if (section === "products") setCategories(categoryRows);
      }
    } catch (issue) {
      if (issue.message.includes("session") || issue.message.includes("Authentication")) logout();
      else toast(issue.message, true);
    } finally {
      setLoading(false);
    }
  }, [api, logout, section, session, toast]);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const activeSection = sections.find((item) => item.id === section);
  const config = configs[section];

  function login(result) {
    const nextSession = { token: result.token, user: result.user };
    localStorage.setItem("hello-admin-token", result.token);
    localStorage.setItem("hello-admin-user", JSON.stringify(result.user));
    setSession(nextSession);
    toast(`Welcome, ${result.user.name}.`);
  }

  function startCreate() {
    if (section === "settings" && items[0]) {
      setEditing(items[0].id);
      setForm({ ...config.defaults, ...items[0] });
      return;
    }
    setEditing(null);
    setForm({ ...config.defaults });
  }

  function startEdit(item) {
    setEditing(item.id);
    setForm({
      ...config.defaults,
      ...item,
      categoryId: item.categoryId || "",
      images: Array.isArray(item.images) ? item.images.map((image) => image.url || image).join("\n") : "",
      items: "[]",
      startsAt: item.startsAt ? new Date(item.startsAt).toISOString().slice(0, 16) : "",
      endsAt: item.endsAt ? new Date(item.endsAt).toISOString().slice(0, 16) : "",
    });
  }

  function payloadForSave() {
    const body = { ...form };
    if (section === "orders") {
      if (editing) return { status: body.status };
      body.userId = body.userId.trim();
      try {
        body.items = JSON.parse(body.items);
      } catch {
        throw new Error("Order items must be valid JSON.");
      }
    }
    if (section === "customers" && editing) delete body.password;
    for (const field of config.fields) {
      if (field.type === "number") body[field.name] = body[field.name] === "" ? null : Number(body[field.name]);
    }
    if (section === "categories" && !body.slug) delete body.slug;
    if (section === "products" && !body.categoryId) body.categoryId = null;
    if (section === "products") {
      body.images = body.images.split(/\r?\n/).map((image) => image.trim()).filter(Boolean);
    }
    if (section === "offers") {
      body.startsAt = body.startsAt ? new Date(body.startsAt).toISOString() : null;
      body.endsAt = body.endsAt ? new Date(body.endsAt).toISOString() : null;
    }
    return body;
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const method = editing || section === "settings" ? "PATCH" : "POST";
      const suffix = editing ? `/${editing}` : "";
      await api(`${config.endpoint}${suffix}`, { method, body: JSON.stringify(payloadForSave()) });
      setForm(null);
      await loadData();
      toast(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} ${editing ? "updated" : "created"}.`);
    } catch (issue) {
      toast(issue.message, true);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete "${item.orderNumber || item.name || item.title}"? This cannot be undone.`)) return;
    try {
      await api(`${config.endpoint}/${item.id}`, { method: "DELETE" });
      await loadData();
      toast(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} deleted.`);
    } catch (issue) {
      toast(issue.message, true);
    }
  }

  async function setEnquiryStatus(item, status) {
    try {
      await api(`/enquiries/${item.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await loadData();
      toast("Enquiry status updated.");
    } catch (issue) {
      toast(issue.message, true);
    }
  }

  async function removeEnquiry(item) {
    if (!window.confirm(`Delete the enquiry from ${item.name}? This cannot be undone.`)) return;
    try {
      await api(`/enquiries/${item.id}`, { method: "DELETE" });
      await loadData();
      toast("Enquiry deleted.");
    } catch (issue) {
      toast(issue.message, true);
    }
  }

  if (!session) return <Login onLogin={login} />;

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setSection("dashboard"); }}>
          <span className="brand-mark">HC</span><span>Hello Computers<small>Store administration</small></span>
        </a>
        <p className="nav-caption">WORKSPACE</p>
        <nav aria-label="Admin sections">
          {sections.map((item) => (
            <button key={item.id} className={`nav-link ${section === item.id ? "nav-active" : ""}`} onClick={() => { setSection(item.id); setForm(null); }}>
              <span className="nav-icon">{item.icon}</span>{item.label}
              {item.id === "enquiries" && stats.newEnquiries > 0 && <span className="nav-count">{stats.newEnquiries}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-chip"><span className="avatar">{session.user.name?.slice(0, 1).toUpperCase()}</span><span>{session.user.name}<small>Administrator</small></span></div>
          <button className="logout-button" onClick={logout}>Sign out <span>↗</span></button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs">Hello Computers <span>/</span> <strong>{activeSection?.label}</strong></div>
          <div className="topbar-right"><span className="live-dot" /> Store admin <span className="avatar avatar-small">{session.user.name?.slice(0, 1).toUpperCase()}</span></div>
        </header>
        {notice && <div className={`toast ${noticeError ? "toast-error" : ""}`} role="status">{notice}</div>}
        <div className="page-content">
          {section === "dashboard" ? (
            <Dashboard stats={stats} onNavigate={setSection} />
          ) : section === "enquiries" ? (
            <Enquiries items={items} loading={loading} onStatus={setEnquiryStatus} onDelete={removeEnquiry} />
          ) : (
            <ResourcePage
              config={config}
              items={items}
              categories={categories}
              loading={loading}
              form={form}
              editing={editing}
              saving={saving}
              onCreate={startCreate}
              onEdit={startEdit}
              onDelete={remove}
              onClose={() => setForm(null)}
              onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))}
              onSubmit={save}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ stats, onNavigate }) {
  const cards = [
    { label: "Products", value: stats.products, icon: "▣", view: "products", color: "blue" },
    { label: "Categories", value: stats.categories, icon: "◫", view: "categories", color: "violet" },
    { label: "Active offers", value: stats.offers, icon: "％", view: "offers", color: "orange" },
    { label: "Services", value: stats.services, icon: "⚙", view: "services", color: "green" },
    { label: "Orders", value: stats.orders, icon: "▤", view: "orders", color: "blue" },
    { label: "Customers", value: stats.customers, icon: "♙", view: "customers", color: "violet" },
  ];
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">STORE SNAPSHOT</p><h1>Good to see you</h1><p>Here’s what’s happening with your store today.</p></div><span className="date-chip">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span></div>
      <section className="stat-grid" aria-label="Store totals">
        {cards.map((card) => <button className="stat-card" key={card.label} onClick={() => onNavigate(card.view)}><span className={`stat-icon ${card.color}`}>{card.icon}</span><span className="stat-label">{card.label}</span><strong>{card.value}</strong><span className="stat-hint">Manage {card.label.toLowerCase()} <b>→</b></span></button>)}
      </section>
      <section className="dashboard-lower">
        <div className="panel-card welcome-card">
          <div><p className="eyebrow">YOUR CONTROL ROOM</p><h2>Everything in one place.</h2><p>Keep your catalog fresh, publish offers and respond to customer questions from your dashboard.</p></div>
          <div className="welcome-graphic" aria-hidden="true"><span>HC</span><i /><i /><i /></div>
        </div>
        <div className="panel-card inbox-card">
          <div className="panel-title"><div><h2>Customer inbox</h2><p>Keep up with new enquiries</p></div><button className="text-button" onClick={() => onNavigate("enquiries")}>View inbox →</button></div>
          <div className="inbox-metrics"><div><span>All enquiries</span><strong>{stats.enquiries}</strong></div><div><span>Need a reply</span><strong className={stats.newEnquiries ? "text-orange" : ""}>{stats.newEnquiries}</strong></div><div><span>Low-stock products</span><strong className={stats.lowStock ? "text-orange" : ""}>{stats.lowStock}</strong></div></div>
          <button className="inbox-link" onClick={() => onNavigate("enquiries")}><span className="inbox-icon">✉</span><span><strong>{stats.newEnquiries ? `${stats.newEnquiries} new ${stats.newEnquiries === 1 ? "message" : "messages"}` : "You’re all caught up"}</strong><small>{stats.newEnquiries ? "Open enquiries to update their status." : "New customer messages will appear here."}</small></span><b>→</b></button>
        </div>
      </section>
    </>
  );
}

function ResourcePage({ config, items, categories, loading, form, editing, saving, onCreate, onEdit, onDelete, onClose, onChange, onSubmit }) {
  const itemCount = items.length;
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">STORE MANAGEMENT</p><h1>{config.title}</h1><p>Create, update and organize your store {config.title.toLowerCase()}.</p></div><button className="primary-button" onClick={onCreate}><span>＋</span> {config.createLabel || `Add ${config.singular}`}</button></div>
      {form && <form className="editor-card" onSubmit={onSubmit}>
        <div className="editor-heading"><div><p className="eyebrow">{editing ? "EDIT RECORD" : "NEW RECORD"}</p><h2>{editing ? `Edit ${config.singular}` : `Add ${config.singular}`}</h2></div><button type="button" className="icon-button" aria-label="Close form" onClick={onClose}>×</button></div>
        <div className="form-grid">
          {config.fields.filter((field) => !(editing && field.createOnly) && !(!editing && field.editOnly)).map((field) => <label key={field.name} className={`${field.wide ? "field-wide" : ""} ${field.type === "checkbox" ? "checkbox-field" : ""}`}>
            {field.type === "checkbox" ? <><input type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => onChange(field.name, event.target.checked)} />{field.label}</> : <>{field.label}
              {field.type === "textarea" ? <textarea rows="3" required={field.required} value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)} /> : field.type === "category" ? <select value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select> : field.type === "select" ? <select required={field.required} value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)}>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input type={field.type || "text"} min={field.min} max={field.max} step={field.step} required={field.required} value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)} />}
              {field.help && <small className="field-help">{field.help}</small>}
            </>}
          </label>)}
        </div>
        <div className="editor-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : `Create ${config.singular}`}</button></div>
      </form>}
      <div className="table-card">
        <div className="table-toolbar"><div><h2>All {config.title.toLowerCase()}</h2><p>{itemCount} {itemCount === 1 ? config.singular : `${config.singular}s`}</p></div><span className="table-total">{itemCount} total</span></div>
        {loading ? <div className="table-message">Loading {config.title.toLowerCase()}…</div> : itemCount === 0 ? <div className="empty-state"><span>▤</span><h3>No {config.title.toLowerCase()} yet</h3><p>Create your first {config.singular} to get started.</p><button className="secondary-button" onClick={onCreate}>Add {config.singular}</button></div> : (
          <div className="table-scroll"><table><thead><tr>{config.columns.map((column) => <th key={column.label}>{column.label}</th>)}<th className="actions-heading">Actions</th></tr></thead><tbody>
            {items.map((item) => <tr key={item.id}>{config.columns.map((column) => <td key={column.label}>{column.render(item)}</td>)}<td><div className="row-actions"><button className="row-edit" onClick={() => onEdit(item)}>Edit</button>{config.deletable !== false && <button className="row-delete" onClick={() => onDelete(item)}>Delete</button>}</div></td></tr>)}
          </tbody></table></div>
        )}
      </div>
    </>
  );
}

function Enquiries({ items, loading, onStatus, onDelete }) {
  const [filter, setFilter] = useState("ALL");
  const filtered = useMemo(() => filter === "ALL" ? items : items.filter((item) => item.status === filter), [filter, items]);
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">CUSTOMER SUPPORT</p><h1>Enquiries</h1><p>Read customer messages and keep their status up to date.</p></div><span className="date-chip">{items.filter((item) => item.status === "NEW").length} awaiting reply</span></div>
      <div className="table-card">
        <div className="table-toolbar"><div><h2>Customer messages</h2><p>{filtered.length} shown · {items.length} total</p></div><select className="filter-select" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">All statuses</option><option value="NEW">New</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option></select></div>
        {loading ? <div className="table-message">Loading enquiries…</div> : filtered.length === 0 ? <div className="empty-state"><span>✉</span><h3>No enquiries here</h3><p>Customer contact form submissions will appear here.</p></div> : (
          <div className="table-scroll"><table><thead><tr><th>Customer</th><th>Message</th><th>Received</th><th>Status</th><th className="actions-heading">Actions</th></tr></thead><tbody>
            {filtered.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <span>{item.phone}</span>}</small></td><td className="message-cell">{item.message}</td><td>{date(item.createdAt)}</td><td><select className={`status-select status-${item.status.toLowerCase()}`} aria-label={`Status for ${item.name}`} value={item.status} onChange={(event) => onStatus(item, event.target.value)}><option value="NEW">New</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option></select></td><td><button className="row-delete" onClick={() => onDelete(item)}>Delete</button></td></tr>)}
          </tbody></table></div>
        )}
      </div>
    </>
  );
}

export default App;
