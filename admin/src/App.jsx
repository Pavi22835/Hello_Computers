import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail } from "lucide-react";
import AdminLayout from "./components/layout/AdminLayout";
import FeaturePlaceholder from "./components/common/FeaturePlaceholder";
import { useDebounce } from "./hooks/useDebounce";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Categories from "./pages/Master/Categories";
import ProductList from "./pages/Master/ProductList";
import OffersCoupons from "./pages/Marketing/OffersCoupons";
import GeneralSettings from "./pages/Settings/GeneralSettings";
import CustomerList from "./pages/Customers/CustomerList";
import OrderList from "./pages/Orders/OrderList";
import ServiceEnquiries from "./pages/ServiceEnquiries/ServiceEnquiries";
import { CategoryPreview, ProductPreview } from "./pages/Master/ProductList";
import { request } from "./services/api";
import { date, money } from "./utils/formatters";
import { placeholderPages, sections } from "./routes/adminNavigation";
import "./styles/Admin.css";

const emptyStats = { products: 0, categories: 0, offers: 0, services: 0, enquiries: 0, newEnquiries: 0, lowStock: 0, orders: 0, customers: 0 };
const placeholderPagesWithCoupons = {
  ...placeholderPages,
  coupons: <FeaturePlaceholder title="Coupons" />,
};

const configs = {
  products: {
    title: "Products",
    singular: "product",
    endpoint: "/products",
    listEndpoint: "/products/admin",
    viewable: true,
    fields: [
      { name: "name", label: "Product name", required: true },
      { name: "model", label: "Model" },
      { name: "brand", label: "Brand" },
      { name: "price", label: "Price (₹)", type: "number", min: 0.01, step: "0.01", required: true },
      { name: "discountPrice", label: "Discount price (₹)", type: "number", min: 0.01, step: "0.01", help: "Leave blank when the product has no discount." },
      { name: "stock", label: "Stock", type: "number", min: 0, step: "1" },
      { name: "categoryId", label: "Category", type: "category" },
      { name: "imageUrl", label: "Primary image URL" },
      { name: "imageFiles", label: "Upload product images", type: "image-upload", wide: true, help: "Choose up to 10 JPEG, PNG, WebP, or AVIF images (8 MB each)." },
      { name: "images", label: "Product image URLs", type: "textarea", help: "One image URL per line. Uploaded images will be added when you save.", wide: true },
      { name: "badge", label: "Badge" },
      { name: "specifications", label: "Specifications", type: "textarea", wide: true },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "isFeatured", label: "Featured product", type: "checkbox", wide: true },
      { name: "isActive", label: "Active on storefront", type: "checkbox", wide: true },
    ],
    columns: [
      { label: "Product", render: (item) => <><strong>{item.name}</strong><small>{[item.model, item.brand].filter(Boolean).join(" · ") || "No model or brand"}</small></> },
      { label: "Category", render: (item) => item.category?.name || "Uncategorized" },
      { label: "Price", render: (item) => item.discountPrice != null ? <><strong>{money(item.discountPrice)}</strong><small className="price-original">{money(item.price)}</small></> : money(item.price) },
      { label: "Stock", render: (item) => <span className={item.stock <= 5 ? "stock-low" : ""}>{item.stock} units</span> },
      { label: "Featured", render: (item) => item.isFeatured ? <Status active>Featured</Status> : "—" },
      { label: "Status", render: (item) => <Status active={item.isActive} /> },
    ],
    defaults: { name: "", model: "", brand: "", price: "", discountPrice: "", stock: 0, categoryId: "", imageUrl: "", imageFiles: [], images: "", badge: "", specifications: "", description: "", isFeatured: false, isActive: true },
  },
  categories: {
    title: "Categories",
    singular: "category",
    endpoint: "/categories",
    listEndpoint: "/categories/admin",
    viewable: true,
    fields: [
      { name: "name", label: "Category name", required: true },
      { name: "slug", label: "URL slug", help: "Leave blank to generate from the category name." },
      { name: "imageUrl", label: "Image URL" },
      { name: "imageFiles", label: "Upload category image", type: "image-upload", multiple: false, wide: true, help: "Choose one JPEG, PNG, WebP, or AVIF image (8 MB max)." },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "isActive", label: "Active on storefront", type: "checkbox", wide: true },
    ],
    columns: [
      { label: "Image", render: (item) => item.imageUrl ? <img className="category-thumbnail" src={item.imageUrl} alt="" /> : "—" },
      { label: "Category", render: (item) => <><strong>{item.name}</strong><small>/{item.slug}</small></> },
      { label: "Products", render: (item) => item._count?.products ?? "—" },
      { label: "Status", render: (item) => <Status active={item.isActive} /> },
    ],
    defaults: { name: "", slug: "", imageUrl: "", imageFiles: [], description: "", isActive: true },
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

function Status({ active, children }) {
  return <span className={`pill ${active ? "pill-green" : "pill-gray"}`}>{children || (active ? "Active" : "Inactive")}</span>;
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
  const [productPagination, setProductPagination] = useState(null);
  const [productPage, setProductPage] = useState(1);
  const [categoryPagination, setCategoryPagination] = useState(null);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryStatus, setCategoryStatus] = useState("all");
  const debouncedCategorySearch = useDebounce(categorySearch, 300);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState(null);

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
    if (!session || !configs[section] || section === "orders" || section === "customers" || section === "service-enquiries") return;
    setLoading(true);
    try {
      if (section === "dashboard") {
        setStats(await api("/admin/dashboard"));
      } else {
        const path = section === "products"
          ? `${configs.products.listEndpoint}?page=${productPage}&limit=20`
          : section === "categories"
            ? `${configs.categories.listEndpoint}?page=${categoryPage}&limit=20&search=${encodeURIComponent(debouncedCategorySearch)}&status=${categoryStatus}`
          : section === "offers" || section === "services"
            ? `${configs[section].endpoint}?includeInactive=true`
            : configs[section].endpoint;
        const [result, categoryRows] = await Promise.all([
          api(path),
          section === "products" ? api("/categories/admin?page=1&limit=100&status=all") : Promise.resolve(null),
        ]);
        const rows = section === "settings"
          ? [result]
          : section === "products" || section === "categories"
            ? result.items
            : result;
        setItems(rows);
        if (section === "products") {
          setCategories(categoryRows.items);
          setProductPagination(result.pagination);
        }
        if (section === "categories") setCategoryPagination(result.pagination);
      }
    } catch (issue) {
      if (issue.message.includes("session") || issue.message.includes("Authentication")) logout();
      else toast(issue.message, true);
    } finally {
      setLoading(false);
    }
  }, [api, categoryPage, categoryStatus, debouncedCategorySearch, logout, productPage, section, session, toast]);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const config = configs[section];
  const ResourcePage = section === "categories"
    ? Categories
    : section === "offers"
      ? OffersCoupons
      : section === "settings"
        ? GeneralSettings
      : ProductList;

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
      imageFiles: [],
      items: "[]",
      startsAt: item.startsAt ? new Date(item.startsAt).toISOString().slice(0, 16) : "",
      endsAt: item.endsAt ? new Date(item.endsAt).toISOString().slice(0, 16) : "",
    });
  }

  function payloadForSave() {
    const body = { ...form };
    for (const field of config.fields) {
      if (field.type === "number") body[field.name] = body[field.name] == null || body[field.name] === "" ? null : Number(body[field.name]);
    }
    if (section === "categories") {
      if (!body.slug) delete body.slug;
      delete body.imageFiles;
    }
    if (section === "products" && !body.categoryId) body.categoryId = null;
    if (section === "products") {
      body.images = body.images.split(/\r?\n/).map((image) => image.trim()).filter(Boolean);
      delete body.imageFiles;
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
      const body = payloadForSave();
      if (section === "products" && form.imageFiles?.length) {
        const imageForm = new FormData();
        form.imageFiles.forEach((file) => imageForm.append("images", file));
        const uploaded = await api("/products/images", { method: "POST", body: imageForm });
        body.images = [...body.images, ...uploaded.images];
        if (!body.imageUrl && uploaded.images.length) body.imageUrl = uploaded.images[0];
      }
      if (section === "categories" && form.imageFiles?.length) {
        const imageForm = new FormData();
        imageForm.append("image", form.imageFiles[0]);
        const uploaded = await api("/categories/images", { method: "POST", body: imageForm });
        body.imageUrl = uploaded.imageUrl;
      }
      await api(`${config.endpoint}${suffix}`, { method, body: JSON.stringify(body) });
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

  const changeSection = (nextSection) => {
    setSection(nextSection);
    setForm(null);
  };

  const placeholder = placeholderPagesWithCoupons[section];
  return (
    <>
      <AdminLayout sections={sections} section={section} stats={stats} user={session.user} onNavigate={changeSection} onLogout={logout} notice={notice} noticeError={noticeError} api={api}>
        {section === "dashboard" ? (
          <Dashboard stats={stats} onNavigate={changeSection} />
        ) : section === "enquiries" ? (
          <Enquiries items={items} loading={loading} onStatus={setEnquiryStatus} onDelete={removeEnquiry} />
        ) : section === "orders" ? (
          <OrderList api={api} toast={toast} />
        ) : section === "customers" ? (
          <CustomerList api={api} toast={toast} />
        ) : section === "service-enquiries" ? (
          <ServiceEnquiries api={api} toast={toast} />
        ) : placeholder ? (
          placeholder
        ) : (
          <ResourcePage
            config={config}
            items={items}
            categories={categories}
            loading={loading}
            form={form}
            editing={editing}
            saving={saving}
            onView={(item) => setViewing({ section, item })}
            pagination={section === "products" ? productPagination : section === "categories" ? categoryPagination : null}
            onPageChange={section === "categories" ? setCategoryPage : setProductPage}
            filters={section === "categories" ? { search: categorySearch, status: categoryStatus } : null}
            onFilterChange={(name, value) => {
              if (name === "search") setCategorySearch(value);
              else setCategoryStatus(value);
              setCategoryPage(1);
            }}
            onCreate={startCreate}
            onEdit={startEdit}
            onDelete={remove}
            onClose={() => setForm(null)}
            onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))}
            onSubmit={save}
          />
        )}
      </AdminLayout>
      {viewing?.section === "categories"
        ? <CategoryPreview category={viewing.item} onClose={() => setViewing(null)} />
        : viewing && <ProductPreview product={viewing.item} onClose={() => setViewing(null)} />}
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
        {loading ? <div className="table-message">Loading enquiries…</div> : filtered.length === 0 ? <div className="empty-state"><Mail size={25} aria-hidden="true" /><h3>No enquiries here</h3><p>Customer contact form submissions will appear here.</p></div> : (
          <div className="table-scroll"><table><thead><tr><th>Customer</th><th>Message</th><th>Received</th><th>Status</th><th className="actions-heading">Actions</th></tr></thead><tbody>
            {filtered.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <span>{item.phone}</span>}</small></td><td className="message-cell">{item.message}</td><td>{date(item.createdAt)}</td><td><select className={`status-select status-${item.status.toLowerCase()}`} aria-label={`Status for ${item.name}`} value={item.status} onChange={(event) => onStatus(item, event.target.value)}><option value="NEW">New</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option></select></td><td><button className="row-delete" onClick={() => onDelete(item)}>Delete</button></td></tr>)}
          </tbody></table></div>
        )}
      </div>
    </>
  );
}

export default App;
