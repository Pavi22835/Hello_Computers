import { ArrowRight, ClipboardList, Layers, Mail, Package, Percent, Users, Wrench } from "lucide-react";

function Dashboard({ stats, onNavigate }) {
  const cards = [
    { label: "Products", value: stats.products, icon: Package, view: "products", color: "blue" },
    { label: "Categories", value: stats.categories, icon: Layers, view: "categories", color: "violet" },
    { label: "Active offers", value: stats.offers, icon: Percent, view: "offers", color: "orange" },
    { label: "Services", value: stats.services, icon: Wrench, view: "services", color: "green" },
    { label: "Orders", value: stats.orders, icon: ClipboardList, view: "orders", color: "blue" },
    { label: "Customers", value: stats.customers, icon: Users, view: "customers", color: "violet" },
  ];

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">STORE SNAPSHOT</p><h1>Good to see you</h1><p>Here’s what’s happening with your store today.</p></div><span className="date-chip">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span></div>
      <section className="stat-grid" aria-label="Store totals">
        {cards.map((card) => <button className="stat-card" key={card.label} onClick={() => onNavigate(card.view)}><span className={`stat-icon ${card.color}`}><card.icon size={19} aria-hidden="true" /></span><span className="stat-label">{card.label}</span><strong>{card.value}</strong><span className="stat-hint">Manage {card.label.toLowerCase()} <ArrowRight size={13} aria-hidden="true" /></span></button>)}
      </section>
      <section className="dashboard-lower">
        <div className="panel-card welcome-card">
          <div><p className="eyebrow">YOUR CONTROL ROOM</p><h2>Everything in one place.</h2><p>Keep your catalog fresh, publish offers and respond to customer questions from your dashboard.</p></div>
          <div className="welcome-graphic" aria-hidden="true"><span>HC</span><i /><i /><i /></div>
        </div>
        <div className="panel-card inbox-card">
          <div className="panel-title"><div><h2>Customer inbox</h2><p>Keep up with new enquiries</p></div><button className="text-button" onClick={() => onNavigate("enquiries")}>View inbox <ArrowRight size={14} aria-hidden="true" /></button></div>
          <div className="inbox-metrics"><div><span>All enquiries</span><strong>{stats.enquiries}</strong></div><div><span>Need a reply</span><strong className={stats.newEnquiries ? "text-orange" : ""}>{stats.newEnquiries}</strong></div><div><span>Low-stock products</span><strong className={stats.lowStock ? "text-orange" : ""}>{stats.lowStock}</strong></div></div>
          <button className="inbox-link" onClick={() => onNavigate("enquiries")}><span className="inbox-icon"><Mail size={17} aria-hidden="true" /></span><span><strong>{stats.newEnquiries ? `${stats.newEnquiries} new ${stats.newEnquiries === 1 ? "message" : "messages"}` : "You’re all caught up"}</strong><small>{stats.newEnquiries ? "Open enquiries to update their status." : "New customer messages will appear here."}</small></span><ArrowRight size={16} aria-hidden="true" /></button>
        </div>
      </section>
    </>
  );
}

export default Dashboard;
