import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  BadgeCheck,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  CreditCard,
  Eye,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import "../../styles/Admin.css";

const pageSize = 20;
const transitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function dateTime(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

function OrderStatus({ value }) {
  const active = !["CANCELLED", "FAILED", "REFUNDED"].includes(value);
  return <span className={`orders-pill ${active ? "orders-pill-active" : "orders-pill-muted"}`}>{value || "—"}</span>;
}

function OrdersManagement({ api, toast }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pagination: { page: 1, total: 0, totalPages: 0 }, summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [pageSizeValue, setPageSizeValue] = useState(pageSize);
  const loadSequence = useRef(0);
  const detailSequence = useRef(0);

  const loadOrders = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSizeValue),
      sortBy,
      sortOrder,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status !== "all") params.set("status", status);
    if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);
    if (paymentMethod !== "all") params.set("paymentMethod", paymentMethod);
    if (dateFrom) params.set("dateFrom", new Date(`${dateFrom}T00:00:00`).toISOString());
    if (dateTo) params.set("dateTo", new Date(`${dateTo}T23:59:59.999`).toISOString());
    try {
      const result = await api(`/admin/orders?${params.toString()}`);
      if (sequence === loadSequence.current) setData(result);
    } catch (issue) {
      if (sequence === loadSequence.current) setError(issue.message || "Orders could not be loaded.");
    } finally {
      if (sequence === loadSequence.current) setLoading(false);
    }
  }, [api, dateFrom, dateTo, debouncedSearch, page, pageSizeValue, paymentMethod, paymentStatus, sortBy, sortOrder, status]);

  useEffect(() => {
    const timer = window.setTimeout(loadOrders, 0);
    return () => {
      window.clearTimeout(timer);
      loadSequence.current += 1;
    };
  }, [loadOrders]);

  useEffect(() => {
    const lastPage = Math.max(1, data.pagination?.totalPages || 0);
    const timer = window.setTimeout(() => {
      if (page > lastPage) setPage(lastPage);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data.pagination?.totalPages, page]);

  const loadOrderDetails = useCallback(async (id) => {
    const sequence = ++detailSequence.current;
    setDetailLoading(true);
    try {
      const order = await api(`/admin/orders/${encodeURIComponent(id)}`);
      if (sequence === detailSequence.current) {
        setSelectedOrder(order);
        setNextStatus("");
      }
    } catch (issue) {
      if (sequence === detailSequence.current) toast(issue.message || "Order details could not be loaded.", true);
    } finally {
      if (sequence === detailSequence.current) setDetailLoading(false);
    }
  }, [api, toast]);

  const summary = data.summary || {};
  const allowedTransitions = useMemo(() => {
    if (!selectedOrder) return [];
    let options = transitions[selectedOrder.status] || [];
    if (selectedOrder.paymentMethod === "RAZORPAY") {
      options = selectedOrder.paymentStatus === "PAID"
        ? options.filter((option) => option !== "CANCELLED")
        : options.filter((option) => option !== "CONFIRMED");
    }
    return options;
  }, [selectedOrder]);

  function resetPage() {
    setPage(1);
  }

  function closeOrderDetails() {
    detailSequence.current += 1;
    setSelectedOrder(null);
    setDetailLoading(false);
  }

  async function updateOrderStatus(statusValue, paymentStatusValue) {
    if (!selectedOrder) return;
    setActionBusy(true);
    try {
      const updated = await api(`/admin/orders/${encodeURIComponent(selectedOrder.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: statusValue || selectedOrder.status,
          ...(paymentStatusValue ? { paymentStatus: paymentStatusValue } : {}),
        }),
      });
      setSelectedOrder(updated);
      setNextStatus("");
      await loadOrders();
      toast("Order updated.");
    } catch (issue) {
      toast(issue.message || "Order could not be updated.", true);
      await loadOrderDetails(selectedOrder.id);
    } finally {
      setActionBusy(false);
    }
  }

  async function refundAndCancel() {
    if (!selectedOrder || !window.confirm(`Refund ${money(selectedOrder.total)} and cancel ${selectedOrder.orderNumber}?`)) return;
    setActionBusy(true);
    try {
      const result = await api(`/admin/orders/${encodeURIComponent(selectedOrder.id)}/refund`, {
        method: "POST",
        body: JSON.stringify({ reason: refundReason }),
      });
      setSelectedOrder(result.order);
      setRefundReason("");
      await loadOrders();
      toast(result.refundStatus === "processed"
        ? "Refund processed; order cancelled and stock restored."
        : result.refundStatus === "failed"
          ? "Razorpay could not process the refund. The order remains paid and can be retried."
          : "Refund submitted; order will cancel when Razorpay confirms it.");
    } catch (issue) {
      toast(issue.message || "Refund could not be confirmed. Check the order payment details.", true);
      await loadOrderDetails(selectedOrder.id);
    } finally {
      setActionBusy(false);
    }
  }

  const orderRows = data.items || [];
  const summaryCards = [
    { label: "Filtered orders", value: summary.totalOrders ?? 0, icon: ShoppingCart },
    { label: "Pending", value: summary.pendingOrders ?? 0, icon: Clock },
    { label: "Confirmed", value: summary.confirmedOrders ?? 0, icon: BadgeCheck },
    { label: "In processing", value: summary.processingOrders ?? 0, icon: LoaderCircle },
    { label: "Delivered", value: summary.deliveredOrders ?? 0, icon: PackageCheck },
    { label: "Cancelled", value: summary.cancelledOrders ?? 0, icon: CircleX },
    { label: "Payments pending", value: summary.pendingPayments ?? 0, icon: CreditCard },
    { label: "Refunds pending", value: summary.pendingRefunds ?? 0, icon: RotateCcw },
    { label: "Paid revenue", value: money(summary.paidRevenue), icon: Banknote },
  ];

  return (
    <section className="orders-manager">
      <div className="page-heading">
        <div>
          {/* <p className="eyebrow">STORE MANAGEMENT</p> */}
          <h1>Orders</h1>
          <p>Review orders, track fulfillment, and manage payments.</p>
        </div>
        <button type="button" className="secondary-button" onClick={loadOrders} disabled={loading}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="orders-summary-grid" aria-label="Order summary">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <article key={label}>
            <span className="summary-card-icon"><Icon size={20} strokeWidth={2.2} aria-hidden="true" /></span>
            <span className="summary-card-label">{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="orders-panel">
        <div className="orders-filter-grid">
          <label className="orders-search">
            <span>Search</span>
            <div>
              <Search size={16} />
              <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Order ID, customer, email, phone, product" />
            </div>
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => { setStatus(event.target.value); resetPage(); }}>
              <option value="all">All statuses</option>
              {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Payment status</span>
            <select value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value); resetPage(); }}>
              <option value="all">All payments</option>
              {["PENDING", "PAID", "FAILED", "REFUND_PENDING", "REFUNDED"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Method</span>
            <select value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); resetPage(); }}>
              <option value="all">All methods</option>
              <option value="COD">COD</option>
              <option value="RAZORPAY">Razorpay</option>
            </select>
          </label>
          <label>
            <span>From date</span>
            <input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); resetPage(); }} />
          </label>
          <label>
            <span>To date</span>
            <input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); resetPage(); }} />
          </label>
          <label>
            <span>Sort by</span>
            <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); resetPage(); }}>
              <option value="date">Order date</option>
              <option value="total">Total amount</option>
              <option value="customer">Customer</option>
              <option value="status">Order status</option>
              <option value="payment">Payment status</option>
            </select>
          </label>
          <label>
            <span>Direction</span>
            <select value={sortOrder} onChange={(event) => { setSortOrder(event.target.value); resetPage(); }}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>
          <label>
            <span>Rows</span>
            <select value={pageSizeValue} onChange={(event) => { setPageSizeValue(Number(event.target.value)); resetPage(); }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>

        {error && <div className="notice notice-error orders-error" role="alert">{error}</div>}
        {loading ? <div className="table-message">Loading orders…</div> : orderRows.length === 0 ? (
          <div className="empty-state"><ClipboardList size={25} aria-hidden="true" /><h3>No matching orders</h3><p>Change your search or filters to see other orders.</p></div>
        ) : (
          <div className="table-scroll">
            <table className="orders-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Products</th><th>Total</th><th>Payment</th><th>Status</th><th>Created</th><th>Details</th></tr></thead>
              <tbody>
                {orderRows.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.orderNumber}</strong><small>{order.id}</small></td>
                    <td><strong>{order.customerName}</strong><small>{order.email}</small><small>{order.phone}</small></td>
                    <td className="orders-products-cell">{order.items.map((item) => <span key={item.id}>{item.productName} × {item.quantity}</span>)}</td>
                    <td className="orders-amount">{money(order.total)}</td>
                    <td><strong>{order.paymentMethod}</strong><small><OrderStatus value={order.paymentStatus} /></small></td>
                    <td><OrderStatus value={order.status} /></td>
                    <td>{dateTime(order.createdAt)}</td>
                    <td><button type="button" className="row-view" onClick={() => loadOrderDetails(order.id)} aria-label={`View ${order.orderNumber}`} title="View order"><Eye size={22} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data.pagination?.totalPages > 1 && <div className="admin-pagination"><span>Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} orders</span><div><button type="button" className="secondary-button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={15} /> Previous</button><button type="button" className="secondary-button" disabled={page >= data.pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Next <ChevronRight size={15} /></button></div></div>}
      </div>

      {selectedOrder && <div className="orders-modal-backdrop" role="presentation" onClick={closeOrderDetails}>
        <section className="orders-modal" role="dialog" aria-modal="true" aria-labelledby="order-details-title" onClick={(event) => event.stopPropagation()}>
          <div className="orders-modal-heading"><div><p className="eyebrow">ORDER DETAILS</p><h2 id="order-details-title">{selectedOrder.orderNumber}</h2><small>Order ID: {selectedOrder.id}</small></div><button type="button" className="icon-button" aria-label="Close order details" onClick={closeOrderDetails}><X size={20} /></button></div>
          {detailLoading ? <div className="table-message">Loading order details…</div> : <>
            <div className="orders-detail-grid">
              <section><h3>Customer</h3><p><strong>{selectedOrder.customerName}</strong><br />{selectedOrder.email}<br />{selectedOrder.phone}</p></section>
              <section><h3>Delivery address</h3><p>{selectedOrder.address}<br />{selectedOrder.city}, {selectedOrder.state} {selectedOrder.postalCode}</p></section>
              <section><h3>Order status</h3><OrderStatus value={selectedOrder.status} /><p className="orders-muted">Placed {dateTime(selectedOrder.createdAt)}</p></section>
              <section><h3>Payment</h3><p>{selectedOrder.paymentMethod} · <OrderStatus value={selectedOrder.paymentStatus} /></p>
                {selectedOrder.razorpayOrderId && <p className="orders-transaction">Razorpay order: {selectedOrder.razorpayOrderId}</p>}
                {selectedOrder.razorpayPaymentId && <p className="orders-transaction">Payment transaction: {selectedOrder.razorpayPaymentId}</p>}
                {selectedOrder.razorpayRefundId && <p className="orders-transaction">Latest refund: {selectedOrder.razorpayRefundId}</p>}
                {selectedOrder.paymentFailureReason && <p className="orders-error-text">{selectedOrder.paymentFailureReason}</p>}
              </section>
            </div>

            <section className="orders-detail-items"><h3>Products</h3><div className="orders-item-list">
              {selectedOrder.items.map((item) => <article key={item.id}>
                {item.imageUrl && <img src={item.imageUrl} alt="" />}
                <span><strong>{item.productName}</strong>{item.productModel && <small>Model: {item.productModel}</small>}<small>{item.quantity} × {money(item.unitPrice)}</small></span>
                <strong>{money(item.lineTotal)}</strong>
              </article>)}
            </div></section>

            <div className="orders-totals"><span>Subtotal <strong>{money(selectedOrder.subtotal)}</strong></span><span>Shipping <strong>{money(selectedOrder.shippingCost)}</strong></span><span>Total <strong>{money(selectedOrder.total)}</strong></span></div>

            {selectedOrder.refunds?.length > 0 && <section className="orders-refunds"><h3>Refund transactions</h3>{selectedOrder.refunds.map((refund) => <p key={refund.id}><span>{refund.status.toUpperCase()} · {money(refund.amount)} · {dateTime(refund.createdAt)}</span><small>{refund.razorpayRefundId || "Awaiting Razorpay reference"}{refund.reason ? ` · ${refund.reason}` : ""}</small></p>)}</section>}

            {allowedTransitions.length > 0 && <section className="orders-action-panel"><h3>Update fulfillment</h3><div className="orders-action-row"><select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}><option value="">Choose next status</option>{allowedTransitions.map((item) => <option key={item} value={item}>{item}</option>)}</select><button type="button" className="primary-button" disabled={!nextStatus || actionBusy} onClick={() => updateOrderStatus(nextStatus)}>{actionBusy ? "Saving…" : "Update status"}</button></div></section>}

            {selectedOrder.paymentMethod === "COD" && selectedOrder.status === "DELIVERED" && selectedOrder.paymentStatus === "PENDING" && <section className="orders-action-panel"><h3>Cash on delivery</h3><p>Mark payment received after confirming collection.</p><button type="button" className="primary-button" disabled={actionBusy} onClick={() => updateOrderStatus("DELIVERED", "PAID")}>{actionBusy ? "Saving…" : "Mark COD payment received"}</button></section>}

            {selectedOrder.paymentMethod === "RAZORPAY" && selectedOrder.paymentStatus === "PAID" && ["CONFIRMED", "PROCESSING"].includes(selectedOrder.status) && <section className="orders-action-panel orders-refund-action"><h3>Refund and cancel</h3><p>A full Razorpay refund is issued. Stock is restored when Razorpay confirms the refund.</p><label>Reason (optional)<textarea value={refundReason} onChange={(event) => setRefundReason(event.target.value)} maxLength={500} rows={2} /></label><button type="button" className="danger-button" disabled={actionBusy} onClick={refundAndCancel}>{actionBusy ? "Submitting…" : `Refund ${money(selectedOrder.total)} & cancel`}</button></section>}
          </>}
        </section>
      </div>}
    </section>
  );
}

export default OrdersManagement;
