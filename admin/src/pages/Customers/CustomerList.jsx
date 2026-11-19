import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, RefreshCw, Search, UserCheck, Users, UserX } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import "../../styles/Admin.css";
import CustomerDetails from "./CustomerDetails";
import { dateTime, money } from "../../utils/formatters";

function CustomerStatus({ active }) {
  return <span className={`orders-pill ${active ? "orders-pill-active" : "orders-pill-muted"}`}>{active ? "Active" : "Inactive"}</span>;
}

function CustomersManagement({ api, toast }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = useState("all");
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
  const summaryCards = [
    { label: "Customers", value: summary.totalCustomers ?? 0, icon: Users },
    { label: "Active accounts", value: summary.activeCustomers ?? 0, icon: UserCheck },
    { label: "Inactive accounts", value: summary.inactiveCustomers ?? 0, icon: UserX },
  ];

  return (
    <section className="customers-manager">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CUSTOMER RELATIONSHIPS</p>
          <h1>Customers</h1>
          <p>Review customer profiles, account activity, purchases, and requests.</p>
        </div>
        <button type="button" className="secondary-button" onClick={loadCustomers} disabled={loading}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="orders-summary-grid customer-summary-grid" aria-label="Customer summary">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <article key={label}>
            <span className="summary-card-icon"><Icon size={20} strokeWidth={2.2} aria-hidden="true" /></span>
            <span className="summary-card-label">{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="orders-panel">
        <div className="orders-filter-grid customer-filter-grid">
          <label className="orders-search"><span>Search</span><div><Search size={16} /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Name, email, or phone" /></div></label>
          <label>Status<select value={status} onChange={(event) => { setStatus(event.target.value); resetPage(); }}><option value="all">All accounts</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          <label>Registered from<input type="date" value={registeredFrom} onChange={(event) => { setRegisteredFrom(event.target.value); resetPage(); }} /></label>
          <label>Registered to<input type="date" value={registeredTo} onChange={(event) => { setRegisteredTo(event.target.value); resetPage(); }} /></label>
          <label>Sort by<select value={sortBy} onChange={(event) => { setSortBy(event.target.value); resetPage(); }}><option value="registered">Registration date</option><option value="name">Name</option><option value="email">Email</option><option value="activity">Last activity</option><option value="status">Account status</option></select></label>
          <label>Direction<select value={sortOrder} onChange={(event) => { setSortOrder(event.target.value); resetPage(); }}><option value="desc">Descending</option><option value="asc">Ascending</option></select></label>
          <label>Rows<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); resetPage(); }}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></label>
        </div>

        {error && <div className="notice notice-error orders-error" role="alert">{error}</div>}
        {loading ? <div className="table-message">Loading customers…</div> : customers.length === 0 ? (
          <div className="empty-state"><Users size={25} aria-hidden="true" /><h3>No matching customers</h3><p>Change your search or filters to see other customers.</p></div>
        ) : (
          <div className="table-scroll">
            <table className="orders-table customers-table">
              <thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Purchase amount</th><th>Registered</th><th>Last activity</th><th>Account</th><th>Profile</th></tr></thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td><strong>{customer.name}</strong><small>{customer.email}</small></td>
                    <td>{customer.phone || "—"}</td>
                    <td>{customer.totalOrders}</td>
                    <td className="orders-amount">{money(customer.totalSpent)}</td>
                    <td>{dateTime(customer.createdAt)}</td>
                    <td>{dateTime(customer.lastActivityAt)}</td>
                    <td><CustomerStatus active={customer.isActive} /></td>
                    <td><button type="button" className="row-view" onClick={() => loadCustomerDetails(customer.id)} aria-label={`View ${customer.name}`} title="View customer profile"><Eye size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data.pagination?.totalPages > 1 && <div className="admin-pagination"><span>Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} customers</span><div><button type="button" className="secondary-button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={15} /> Previous</button><button type="button" className="secondary-button" disabled={page >= data.pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Next <ChevronRight size={15} /></button></div></div>}
      </div>

      <CustomerDetails selectedCustomer={selectedCustomer} detailLoading={detailLoading} actionBusy={actionBusy} onClose={closeDetails} onToggleAccountStatus={toggleAccountStatus} />
    </section>
  );
}

export default CustomersManagement;
