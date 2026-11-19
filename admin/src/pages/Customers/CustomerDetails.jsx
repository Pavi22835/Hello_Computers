import { Activity, Banknote, ShieldCheck, ShieldOff, ShoppingBag, X } from "lucide-react";
import { dateTime, money } from "../../utils/formatters";
import "../../styles/Admin.css";

function CustomerStatus({ active }) {
  return <span className={`orders-pill ${active ? "orders-pill-active" : "orders-pill-muted"}`}>{active ? "Active" : "Inactive"}</span>;
}

function HistoryEmpty({ children }) {
  return <p className="customer-history-empty">{children}</p>;
}

function CustomerDetails({ selectedCustomer, detailLoading, actionBusy, onClose, onToggleAccountStatus }) {
  if (!selectedCustomer) return null;

  return (
    <div className="orders-modal-backdrop" role="presentation" onClick={onClose}>
      <section className="orders-modal customer-detail-modal" role="dialog" aria-modal="true" aria-labelledby="customer-details-title" onClick={(event) => event.stopPropagation()}>
        <div className="orders-modal-heading">
          <div><p className="eyebrow">CUSTOMER PROFILE</p><h2 id="customer-details-title">{selectedCustomer.customer.name || "Loading customer…"}</h2><small>{selectedCustomer.customer.id}</small></div>
          <button type="button" className="icon-button" aria-label="Close customer profile" onClick={onClose}><X size={20} /></button>
        </div>
        {detailLoading ? <div className="table-message">Loading customer profile…</div> : <>
          <div className="customer-profile-toolbar">
            <CustomerStatus active={selectedCustomer.customer.isActive} />
            <button type="button" className={selectedCustomer.customer.isActive ? "danger-button" : "primary-button"} disabled={actionBusy} onClick={onToggleAccountStatus}>
              {selectedCustomer.customer.isActive ? <><ShieldOff size={15} /> Deactivate account</> : <><ShieldCheck size={15} /> Activate account</>}
            </button>
          </div>
          <div className="customer-summary-grid customer-profile-stats">
            <article><span className="summary-card-icon"><ShoppingBag size={20} strokeWidth={2.2} aria-hidden="true" /></span><span className="summary-card-label">Total orders</span><strong>{selectedCustomer.summary.totalOrders ?? 0}</strong></article>
            <article><span className="summary-card-icon"><Banknote size={20} strokeWidth={2.2} aria-hidden="true" /></span><span className="summary-card-label">Order value (excluding cancelled)</span><strong>{money(selectedCustomer.summary.totalSpent)}</strong></article>
            <article><span className="summary-card-icon"><Activity size={20} strokeWidth={2.2} aria-hidden="true" /></span><span className="summary-card-label">Last activity</span><strong>{dateTime(selectedCustomer.customer.lastActivityAt)}</strong></article>
          </div>
          <div className="orders-detail-grid customer-profile-grid">
            <section><h3>Contact details</h3><p><strong>{selectedCustomer.customer.name}</strong><br />{selectedCustomer.customer.email}<br />{selectedCustomer.customer.phone || "No phone number"}</p><p className="orders-muted">Registered {dateTime(selectedCustomer.customer.createdAt)}</p></section>
            <section><h3>Customer activity</h3><p>{selectedCustomer.summary.totalOrders ?? 0} orders · {selectedCustomer.summary.totalEnquiries ?? 0} enquiries · {selectedCustomer.summary.totalServiceRequests ?? 0} service requests</p><p className="orders-muted">Last recorded activity: {dateTime(selectedCustomer.customer.lastActivityAt)}</p></section>
          </div>

          <section className="customer-history-section">
            <h3>Saved addresses</h3>
            {selectedCustomer.addresses.length === 0 ? <HistoryEmpty>No saved addresses.</HistoryEmpty> : selectedCustomer.addresses.map((address) => (
              <article className="customer-history-card" key={address.id}>
                <div><strong>{address.label}{address.isDefault ? " · Default" : ""}</strong><p>{address.recipientName} · {address.phone}<br />{address.streetAddress}, {address.city}, {address.state} {address.postalCode}, {address.country}</p></div>
              </article>
            ))}
          </section>

          <section className="customer-history-section">
            <h3>Order history</h3>
            {selectedCustomer.orders.length === 0 ? <HistoryEmpty>No orders have been placed.</HistoryEmpty> : selectedCustomer.orders.map((order) => (
              <article className="customer-history-card" key={order.id}>
                <div className="customer-history-heading"><strong>{order.orderNumber}</strong><span>{money(order.total)}</span></div>
                <p>{dateTime(order.createdAt)} · {order.status} · {order.paymentMethod} / {order.paymentStatus}</p>
                <p>{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(" · ")}</p>
                <p>Delivery: {order.address}, {order.city}, {order.state} {order.postalCode} · {order.phone}</p>
                <p className="customer-transaction">Payment: {order.razorpayPaymentId || "—"}{order.razorpayOrderId ? ` · Razorpay order: ${order.razorpayOrderId}` : ""}{order.razorpayRefundId ? ` · Refund: ${order.razorpayRefundId}` : ""}</p>
                {order.refunds?.map((refund) => <p className="customer-transaction" key={refund.id}>Refund {refund.status.toUpperCase()} · {money(refund.amount)} · {dateTime(refund.createdAt)}</p>)}
              </article>
            ))}
          </section>

          <section className="customer-history-section">
            <h3>Enquiry history</h3>
            {selectedCustomer.enquiries.length === 0 ? <HistoryEmpty>No enquiries found for this customer.</HistoryEmpty> : selectedCustomer.enquiries.map((enquiry) => (
              <article className="customer-history-card" key={enquiry.id}>
                <div className="customer-history-heading"><strong>{enquiry.status}</strong><span>{dateTime(enquiry.createdAt)}</span></div>
                <p>{enquiry.name} · {enquiry.email}{enquiry.phone ? ` · ${enquiry.phone}` : ""}</p>
                <p>{enquiry.message}</p>
              </article>
            ))}
          </section>

          <section className="customer-history-section">
            <h3>Service request history</h3>
            {selectedCustomer.serviceRequests.length === 0 ? <HistoryEmpty>No service requests have been submitted.</HistoryEmpty> : selectedCustomer.serviceRequests.map((serviceRequest) => (
              <article className="customer-history-card" key={serviceRequest.id}>
                <div className="customer-history-heading"><strong>{serviceRequest.serviceType?.replace(/_/g, " ") || serviceRequest.serviceTitle}</strong><span>{serviceRequest.status}</span></div>
                <p>{dateTime(serviceRequest.createdAt)}{serviceRequest.laptopModel ? ` · ${serviceRequest.laptopModel}` : ""}</p><p>{serviceRequest.issueDescription || serviceRequest.message}</p>
              </article>
            ))}
          </section>
        </>}
      </section>
    </div>
  );
}

export default CustomerDetails;
