import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, CircleCheck, CircleX, Clock, Eye, LoaderCircle, Phone, RefreshCw, Search, Send, X } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import "../../styles/Admin.css";

const serviceTypes = [
  ["LAPTOP_REPAIR", "Laptop Repair"],
  ["HARDWARE_ISSUES", "Hardware Issues"],
  ["SOFTWARE_ISSUES", "Software Issues"],
  ["LAPTOP_MAINTENANCE", "Laptop Maintenance"],
  ["OTHER_SERVICES", "Other Services"],
];
const statuses = ["PENDING", "CONTACTED", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED"];
const statusIcons = {
  PENDING: Clock,
  CONTACTED: Phone,
  APPROVED: CircleCheck,
  IN_PROGRESS: LoaderCircle,
  COMPLETED: BadgeCheck,
  REJECTED: CircleX,
};

function dateTime(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

function ServiceEnquiryStatus({ value }) {
  const active = !["COMPLETED", "REJECTED"].includes(value);
  return <span className={`orders-pill ${active ? "orders-pill-active" : "orders-pill-muted"}`}>{value?.replace(/_/g, " ") || "—"}</span>;
}

function ServiceEnquiriesManagement({ api, toast }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = useState("all");
  const [serviceType, setServiceType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState({ items: [], pagination: { page: 1, total: 0, totalPages: 0 }, summary: { total: 0, byStatus: {} } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const listSequence = useRef(0);
  const detailSequence = useRef(0);

  const loadRequests = useCallback(async () => {
    const sequence = ++listSequence.current;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
      sortBy,
      sortOrder,
      status,
      serviceType,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (dateFrom) params.set("dateFrom", new Date(`${dateFrom}T00:00:00`).toISOString());
    if (dateTo) params.set("dateTo", new Date(`${dateTo}T23:59:59.999`).toISOString());
    try {
      const result = await api(`/admin/service-enquiries?${params.toString()}`);
      if (sequence === listSequence.current) setData(result);
    } catch (issue) {
      if (sequence === listSequence.current) setError(issue.message || "Service enquiries could not be loaded.");
    } finally {
      if (sequence === listSequence.current) setLoading(false);
    }
  }, [api, dateFrom, dateTo, debouncedSearch, page, pageSize, serviceType, sortBy, sortOrder, status]);

  useEffect(() => {
    const timer = window.setTimeout(loadRequests, 0);
    return () => {
      window.clearTimeout(timer);
      listSequence.current += 1;
    };
  }, [loadRequests]);

  useEffect(() => {
    const lastPage = Math.max(1, data.pagination?.totalPages || 0);
    const timer = window.setTimeout(() => {
      if (page > lastPage) setPage(lastPage);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data.pagination?.totalPages, page]);

  const loadDetails = useCallback(async (id) => {
    const sequence = ++detailSequence.current;
    setSelectedRequest({ id });
    setDetailLoading(true);
    setNextStatus("");
    setInternalNote("");
    try {
      const result = await api(`/admin/service-enquiries/${encodeURIComponent(id)}`);
      if (sequence === detailSequence.current) setSelectedRequest(result);
    } catch (issue) {
      if (sequence === detailSequence.current) {
        setSelectedRequest(null);
        toast(issue.message || "Service enquiry details could not be loaded.", true);
      }
    } finally {
      if (sequence === detailSequence.current) setDetailLoading(false);
    }
  }, [api, toast]);

  function closeDetails() {
    if (actionBusy) return;
    detailSequence.current += 1;
    setSelectedRequest(null);
    setDetailLoading(false);
  }

  async function changeStatus() {
    if (!selectedRequest || !nextStatus || actionBusy) return;
    setActionBusy(true);
    try {
      const updated = await api(`/admin/service-enquiries/${encodeURIComponent(selectedRequest.id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setSelectedRequest(updated);
      setNextStatus("");
      await loadRequests();
      toast("Service enquiry status updated.");
    } catch (issue) {
      toast(issue.message || "Service enquiry status could not be updated.", true);
    } finally {
      setActionBusy(false);
    }
  }

  async function addNote(event) {
    event.preventDefault();
    if (!selectedRequest || !internalNote.trim() || actionBusy) return;
    setActionBusy(true);
    try {
      const updated = await api(`/admin/service-enquiries/${encodeURIComponent(selectedRequest.id)}/notes`, {
        method: "POST",
        body: JSON.stringify({ note: internalNote }),
      });
      setSelectedRequest(updated);
      setInternalNote("");
      toast("Internal note added.");
    } catch (issue) {
      toast(issue.message || "Internal note could not be added.", true);
    } finally {
      setActionBusy(false);
    }
  }

  const summary = data.summary?.byStatus || {};

  return (
    <section className="service-enquiries-manager">
      <div className="page-heading">
        <div><p className="eyebrow">CUSTOMER SUPPORT</p><h1>Service enquiries</h1><p>Review repair requests, update progress, and keep internal notes.</p></div>
        <button type="button" className="secondary-button" onClick={loadRequests} disabled={loading}><RefreshCw size={15} /> Refresh</button>
      </div>

      <div className="orders-summary-grid service-enquiry-summary" aria-label="Service enquiry status summary">
        {statuses.map((item) => {
          const Icon = statusIcons[item];
          return (
            <article key={item}>
              <span className="summary-card-icon"><Icon size={20} strokeWidth={2.2} aria-hidden="true" /></span>
              <span className="summary-card-label">{item.replace(/_/g, " ")}</span>
              <strong>{summary[item] || 0}</strong>
            </article>
          );
        })}
      </div>

      <div className="orders-panel">
        <div className="orders-filter-grid service-enquiry-filters">
          <label className="orders-search"><span>Search</span><div><Search size={16} /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="ID, customer, phone, model, issue" /></div></label>
          <label>Status<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replace(/_/g, " ")}</option>)}</select></label>
          <label>Service type<select value={serviceType} onChange={(event) => { setServiceType(event.target.value); setPage(1); }}><option value="all">All service types</option>{serviceTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>From date<input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} /></label>
          <label>To date<input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} /></label>
          <label>Sort by<select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1); }}><option value="date">Submission date</option><option value="updated">Last updated</option><option value="customer">Customer</option><option value="serviceType">Service type</option><option value="status">Status</option></select></label>
          <label>Direction<select value={sortOrder} onChange={(event) => { setSortOrder(event.target.value); setPage(1); }}><option value="desc">Descending</option><option value="asc">Ascending</option></select></label>
          <label>Rows<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></label>
        </div>

        {error && <div className="notice notice-error orders-error" role="alert">{error}</div>}
        {loading ? <div className="table-message">Loading service enquiries…</div> : data.items.length === 0 ? (
          <div className="empty-state"><Search size={25} aria-hidden="true" /><h3>No matching service enquiries</h3><p>Change your search or filters to see other requests.</p></div>
        ) : (
          <div className="table-scroll">
            <table className="orders-table service-enquiry-table">
              <thead><tr><th>Enquiry ID</th><th>Customer</th><th>Service type</th><th>Laptop model</th><th>Issue</th><th>Submitted</th><th>Status</th><th>Details</th></tr></thead>
              <tbody>{data.items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.id}</strong></td>
                  <td><strong>{item.customerName}</strong><small>{item.phone}</small><small>{item.email}</small></td>
                  <td>{serviceTypes.find(([value]) => value === item.serviceType)?.[1] || item.serviceTitle}</td>
                  <td>{item.laptopModel || "—"}</td>
                  <td className="service-enquiry-issue">{item.issueDescription}</td>
                  <td>{dateTime(item.createdAt)}</td>
                  <td><ServiceEnquiryStatus value={item.status} /></td>
                  <td><button type="button" className="row-view" onClick={() => loadDetails(item.id)} aria-label={`View service enquiry ${item.id}`} title="View enquiry"><Eye size={16} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {data.pagination?.totalPages > 1 && <div className="admin-pagination"><span>Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} enquiries</span><div><button type="button" className="secondary-button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={15} /> Previous</button><button type="button" className="secondary-button" disabled={page >= data.pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Next <ChevronRight size={15} /></button></div></div>}
      </div>

      {selectedRequest && <div className="orders-modal-backdrop" role="presentation" onClick={closeDetails}>
        <section className="orders-modal service-enquiry-modal" role="dialog" aria-modal="true" aria-labelledby="service-enquiry-title" onClick={(event) => event.stopPropagation()}>
          <div className="orders-modal-heading"><div><p className="eyebrow">SERVICE ENQUIRY</p><h2 id="service-enquiry-title">{selectedRequest.id}</h2><small>Submitted {dateTime(selectedRequest.createdAt)}</small></div><button type="button" className="icon-button" aria-label="Close enquiry details" onClick={closeDetails}><X size={20} /></button></div>
          {detailLoading ? <div className="table-message">Loading enquiry details…</div> : <>
            <div className="orders-detail-grid">
              <section><h3>Customer</h3><p><strong>{selectedRequest.customerName}</strong><br />{selectedRequest.email}<br />{selectedRequest.phone}</p><p className="orders-muted">{selectedRequest.user ? "Linked customer account" : "Guest enquiry"}</p></section>
              <section><h3>Request</h3><p><strong>{serviceTypes.find(([value]) => value === selectedRequest.serviceType)?.[1] || selectedRequest.serviceTitle}</strong><br />Laptop model: {selectedRequest.laptopModel || "Not provided"}</p><ServiceEnquiryStatus value={selectedRequest.status} /></section>
            </div>
            <section className="service-enquiry-description"><h3>Issue description</h3><p>{selectedRequest.issueDescription}</p></section>
            <section className="service-enquiry-history"><h3>Status and internal history</h3>{selectedRequest.statusHistory.map((entry) => (
              <article key={entry.id}><div className="customer-history-heading"><strong>{entry.status ? `Status: ${entry.status.replace(/_/g, " ")}` : "Internal note"}</strong><span>{dateTime(entry.createdAt)}</span></div>{entry.note && <p>{entry.note}</p>}<small>{entry.actor?.name || (entry.isInternal ? "Administrator" : "Customer")}</small></article>
            ))}</section>
            <section className="orders-action-panel">
              <h3>Update status</h3>
              <div className="orders-action-row"><select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}><option value="">Choose status</option>{statuses.map((item) => <option key={item} value={item}>{item.replace(/_/g, " ")}</option>)}</select><button type="button" className="primary-button" disabled={!nextStatus || nextStatus === selectedRequest.status || actionBusy} onClick={changeStatus}>{actionBusy ? "Saving…" : "Update status"}</button></div>
            </section>
            <form className="orders-action-panel service-enquiry-note-form" onSubmit={addNote}>
              <h3>Internal note</h3><p>Only administrators can view these notes.</p>
              <textarea required maxLength={4000} rows={3} value={internalNote} onChange={(event) => setInternalNote(event.target.value)} placeholder="Add a private note about this enquiry." />
              <button type="submit" className="secondary-button" disabled={!internalNote.trim() || actionBusy}><Send size={14} /> Add note</button>
            </form>
          </>}
        </section>
      </div>}
    </section>
  );
}

export default ServiceEnquiriesManagement;
