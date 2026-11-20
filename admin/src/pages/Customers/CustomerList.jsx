import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Eye,
  FilterX,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  Users,
} from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import "../../styles/Admin.css";
import "../../styles/Customers.css";
import CustomerDetails from "./CustomerDetails";
import { dateTime, money } from "../../utils/formatters";

const unavailableCustomerTypes = {
  cancelled: ["cancelledOrderCount", "cancelledOrders"],
  abandoned: ["abandonedCartCount", "abandonedCartItemsCount", "abandonedCart"],
};

function getCustomerInitials(name = "") {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
}

function getCustomerTypeCount(customer, type) {
  const value = type === "cancelled"
    ? customer.cancelledOrderCount ?? customer.cancelledOrders
    : customer.abandonedCartCount ?? customer.abandonedCartItemsCount ?? customer.abandonedCart;
  if (Array.isArray(value)) return value.length;
  if (typeof value === "boolean") return value ? 1 : 0;
  return Number(value) || 0;
}

function CustomerAvatar({ name }) {
  const colorIndex = [...(name || "")].reduce((total, character) => total + character.charCodeAt(0), 0) % 5;
  return <span className={`customer-avatar customer-avatar-${colorIndex}`} aria-hidden="true">{getCustomerInitials(name)}</span>;
}

function CustomerStatus({ active }) {
  return <span className={`customer-account-status ${active ? "is-active" : "is-inactive"}`}><span />{active ? "Active" : "Inactive"}</span>;
}

function CustomerList({ api, toast }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = useState("all");
  const [customerType, setCustomerType] = useState("all");
  const [registeredFrom, setRegisteredFrom] = useState("");
  const [registeredTo, setRegisteredTo] = useState("");
  const [sortBy, setSortBy] = useState("registered");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState({
    items: [],
    pagination: { page: 1, total: 0, totalPages: 0 },
    summary: { totalCustomers: 0, activeCustomers: 0, inactiveCustomers: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const loadSequence = useRef(0);
  const detailSequence = useRef(0);

  const loadCustomers = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
      sortBy,
      sortOrder,
      status,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (registeredFrom) params.set("registeredFrom", new Date(`${registeredFrom}T00:00:00`).toISOString());
    if (registeredTo) params.set("registeredTo", new Date(`${registeredTo}T23:59:59.999`).toISOString());
    try {
      const result = await api(`/admin/customers?${params.toString()}`);
      if (sequence === loadSequence.current) setData(result);
    } catch (issue) {
      if (sequence === loadSequence.current) setError(issue.message || "Customers could not be loaded.");
    } finally {
      if (sequence === loadSequence.current) setLoading(false);
    }
  }, [api, debouncedSearch, page, pageSize, registeredFrom, registeredTo, sortBy, sortOrder, status]);

  useEffect(() => {
    const timer = window.setTimeout(loadCustomers, 0);
    return () => {
      window.clearTimeout(timer);
      loadSequence.current += 1;
    };
  }, [loadCustomers]);

  useEffect(() => {
    const lastPage = Math.max(1, data.pagination?.totalPages || 0);
    const timer = window.setTimeout(() => {
      if (page > lastPage) setPage(lastPage);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data.pagination?.totalPages, page]);

  const loadCustomerDetails = useCallback(async (id) => {
    const sequence = ++detailSequence.current;
    setSelectedCustomer({ customer: { id }, addresses: [], orders: [], enquiries: [], serviceRequests: [], summary: {} });
    setDetailLoading(true);
    try {
      const result = await api(`/admin/customers/${encodeURIComponent(id)}`);
      if (sequence === detailSequence.current) setSelectedCustomer(result);
    } catch (issue) {
      if (sequence === detailSequence.current) {
        setSelectedCustomer(null);
        toast(issue.message || "Customer profile could not be loaded.", true);
      }
    } finally {
      if (sequence === detailSequence.current) setDetailLoading(false);
    }
  }, [api, toast]);

  function resetPage() {
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setCustomerType("all");
    setRegisteredFrom("");
    setRegisteredTo("");
    setSortBy("registered");
    setSortOrder("desc");
    setPageSize(20);
    resetPage();
  }

  function closeDetails() {
    if (actionBusy) return;
    detailSequence.current += 1;
    setSelectedCustomer(null);
    setDetailLoading(false);
  }

  async function toggleAccountStatus() {
    const customer = selectedCustomer?.customer;
    if (!customer || actionBusy) return;
    const nextStatus = !customer.isActive;
    const action = nextStatus ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${action} ${customer.name}'s account?`)) return;
    setActionBusy(true);
    try {
      const updated = await api(`/admin/customers/${encodeURIComponent(customer.id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextStatus }),
      });
      setSelectedCustomer((current) => ({ ...current, customer: updated }));
      setData((current) => ({
        ...current,
        items: current.items.map((item) => item.id === updated.id ? { ...item, ...updated } : item),
        summary: {
          ...current.summary,
          activeCustomers: current.summary.activeCustomers + (nextStatus ? 1 : -1),
          inactiveCustomers: current.summary.inactiveCustomers + (nextStatus ? -1 : 1),
        },
      }));
      await loadCustomers();
      toast(`Customer account ${nextStatus ? "activated" : "deactivated"}.`);
    } catch (issue) {
      toast(issue.message || "Customer account status could not be updated.", true);
    } finally {
      setActionBusy(false);
    }
  }

  const customers = data.items || [];
  const summary = data.summary || {};
  const hasCancelledMetrics = customers.some((customer) => unavailableCustomerTypes.cancelled.some((field) => Object.prototype.hasOwnProperty.call(customer, field)));
  const hasAbandonedCartMetrics = customers.some((customer) => unavailableCustomerTypes.abandoned.some((field) => Object.prototype.hasOwnProperty.call(customer, field)));
  const cancelledCount = hasCancelledMetrics ? customers.filter((customer) => getCustomerTypeCount(customer, "cancelled") > 0).length : "—";
  const abandonedCartCount = hasAbandonedCartMetrics ? customers.filter((customer) => getCustomerTypeCount(customer, "abandoned") > 0).length : "—";
  const orderedCount = customers.filter((customer) => Number(customer.totalOrders) > 0).length;
  const nonOrderedCount = customers.length - orderedCount;
  const summaryCards = [
    { label: "Total Customers", value: summary.totalCustomers ?? 0, caption: "Matching account and date filters", icon: Users, tone: "blue" },
    { label: "Non-Ordered Customers", value: nonOrderedCount, caption: "On this page", icon: UserRound, tone: "slate" },
    { label: "Ordered Customers", value: orderedCount, caption: "On this page", icon: ShoppingBag, tone: "green" },
    { label: "Cancelled Customers", value: cancelledCount, caption: hasCancelledMetrics ? "On this page" : "Not provided by current API", icon: CircleX, tone: "red" },
    { label: "Abandoned Cart Customers", value: abandonedCartCount, caption: hasAbandonedCartMetrics ? "On this page" : "Not provided by current API", icon: ShoppingCart, tone: "amber" },
  ];

  const unavailableType = (customerType === "cancelled" && !hasCancelledMetrics)
    || (customerType === "abandoned" && !hasAbandonedCartMetrics);
  const visibleCustomers = unavailableType ? [] : customers.filter((customer) => {
    if (customerType === "ordered") return Number(customer.totalOrders) > 0;
    if (customerType === "non-ordered") return Number(customer.totalOrders) === 0;
    if (customerType === "cancelled") return getCustomerTypeCount(customer, "cancelled") > 0;
    if (customerType === "abandoned") return getCustomerTypeCount(customer, "abandoned") > 0;
    return true;
  });
  const hasFilters = Boolean(search || status !== "all" || customerType !== "all" || registeredFrom || registeredTo);

  return (
    <section className="customers-page">
      <header className="customers-heading">
        <div>
          <p className="eyebrow">CUSTOMER RELATIONSHIPS</p>
          <h1>Customers</h1>
          <p>Understand customer activity, purchases, and account details.</p>
        </div>
        <button type="button" className="secondary-button customers-refresh" onClick={loadCustomers} disabled={loading}>
          <RefreshCw size={15} aria-hidden="true" />Refresh
        </button>
      </header>

      <div className="customer-metrics-grid" aria-label="Customer summary">
        {summaryCards.map(({ label, value, caption, icon: Icon, tone }) => (
          <article className={`customer-metric-card customer-metric-${tone}`} key={label}>
            <span className="customer-metric-icon"><Icon size={18} strokeWidth={2} aria-hidden="true" /></span>
            <span className="customer-metric-label">{label}</span>
            <strong>{value}</strong>
            <small>{caption}</small>
          </article>
        ))}
      </div>
      <p className="customer-data-note">Ordered and non-ordered totals reflect the current page. Cancelled-order and abandoned-cart totals are not included in the existing Customers API response.</p>

      <section className="customer-directory" aria-label="Customer list">
        <div className="customer-list-heading">
          <div>
            <h2>Customer directory</h2>
            <p>{visibleCustomers.length} shown · {data.pagination?.total ?? customers.length} customers match the current account and date filters</p>
          </div>
          {hasFilters && <button type="button" className="customer-clear-filters" onClick={clearFilters}><FilterX size={15} aria-hidden="true" />Clear filters</button>}
        </div>

        <div className="customer-filter-grid">
          <label className="customer-search-field">
            <span>Search customers</span>
            <span className="customer-search-input"><Search size={16} aria-hidden="true" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Name, email, or phone" /></span>
          </label>
          <label>
            <span>From date</span>
            <span className="customer-date-input"><CalendarDays size={15} aria-hidden="true" /><input type="date" value={registeredFrom} max={registeredTo || undefined} onChange={(event) => { setRegisteredFrom(event.target.value); resetPage(); }} /></span>
          </label>
          <label>
            <span>To date</span>
            <span className="customer-date-input"><CalendarDays size={15} aria-hidden="true" /><input type="date" value={registeredTo} min={registeredFrom || undefined} onChange={(event) => { setRegisteredTo(event.target.value); resetPage(); }} /></span>
          </label>
          <label>
            <span>Customer type</span>
            <select value={customerType} onChange={(event) => { setCustomerType(event.target.value); resetPage(); }}>
              <option value="all">All customers</option>
              <option value="ordered">Ordered</option>
              <option value="non-ordered">Non-Ordered</option>
              <option value="cancelled">Cancelled</option>
              <option value="abandoned">Abandoned Cart</option>
            </select>
          </label>
          <label>
            <span>Account status</span>
            <select value={status} onChange={(event) => { setStatus(event.target.value); resetPage(); }}>
              <option value="all">All accounts</option><option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </label>
          <label>
            <span>Sort by</span>
            <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); resetPage(); }}>
              <option value="registered">Registration date</option><option value="name">Name</option><option value="email">Email</option><option value="activity">Last activity</option><option value="status">Account status</option>
            </select>
          </label>
          <label>
            <span>Direction</span>
            <select value={sortOrder} onChange={(event) => { setSortOrder(event.target.value); resetPage(); }}>
              <option value="desc">Descending</option><option value="asc">Ascending</option>
            </select>
          </label>
          <label>
            <span>Rows</span>
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); resetPage(); }}>
              <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
            </select>
          </label>
        </div>

        {customerType === "cancelled" && !hasCancelledMetrics && <p className="customer-filter-notice" role="status">Cancelled-order customer classification is not available in the current Customers API.</p>}
        {customerType === "abandoned" && !hasAbandonedCartMetrics && <p className="customer-filter-notice" role="status">Abandoned-cart customer classification is not available in the current Customers API.</p>}
        {error && <div className="notice notice-error orders-error" role="alert">{error}</div>}

        {loading ? <div className="customer-table-message">Loading customers…</div> : visibleCustomers.length === 0 ? (
          <div className="customer-empty-state">
            <span><Users size={22} aria-hidden="true" /></span>
            <h3>{unavailableType ? "Customer data unavailable" : "No matching customers"}</h3>
            <p>{unavailableType ? "This filter needs fields that the current Customers API does not provide." : "Try changing your search or filters to see other customers."}</p>
            {hasFilters && <button type="button" className="secondary-button" onClick={clearFilters}>Clear filters</button>}
          </div>
        ) : (
          <div className="customer-table-scroll">
            <table className="customer-table">
              <thead>
                <tr><th>Customer</th><th>Email</th><th>Phone</th><th>Total orders</th><th>Total spent</th><th>Last order date</th><th>Customer status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {visibleCustomers.map((customer) => {
                  const lastOrderAt = customer.lastOrderAt || customer.lastOrderDate;
                  return (
                    <tr key={customer.id}>
                      <td><span className="customer-identity"><CustomerAvatar name={customer.name} /><strong>{customer.name}</strong></span></td>
                      <td className="customer-email">{customer.email}</td>
                      <td>{customer.phone || "—"}</td>
                      <td><span className="customer-order-count">{customer.totalOrders ?? 0}</span></td>
                      <td className="customer-spent">{money(customer.totalSpent)}</td>
                      <td title={lastOrderAt ? undefined : "Not provided by the current Customers API"}>{lastOrderAt ? dateTime(lastOrderAt) : "—"}</td>
                      <td><CustomerStatus active={customer.isActive} /></td>
                      <td><button type="button" className="customer-view-button" onClick={() => loadCustomerDetails(customer.id)} aria-label={`View details for ${customer.name}`} title="View details"><Eye size={16} aria-hidden="true" /><span>View</span></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data.pagination?.totalPages > 1 && <div className="customer-pagination"><span>Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} customers</span><div><button type="button" className="secondary-button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={15} aria-hidden="true" />Previous</button><button type="button" className="secondary-button" disabled={page >= data.pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Next<ChevronRight size={15} aria-hidden="true" /></button></div></div>}
      </section>

      <CustomerDetails selectedCustomer={selectedCustomer} detailLoading={detailLoading} actionBusy={actionBusy} onClose={closeDetails} onToggleAccountStatus={toggleAccountStatus} />
    </section>
  );
}

export default CustomerList;
