import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Search,
  X,
  Loader2,
  Package,
  Layers,
  ClipboardList,
  Users,
  Wrench,
  Mail,
  Percent,
  Settings,
  Tag,
  ArrowRight,
  CornerDownLeft,
} from "lucide-react";
import { sections } from "../../routes/adminNavigation";
import { money } from "../../utils/formatters";

// Helper component to highlight matching search characters
function HighlightMatch({ text, query }) {
  if (!text) return null;
  const str = String(text);
  if (!query || !query.trim()) return <span>{str}</span>;

  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = str.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

function GlobalSearch({ onNavigate, api }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const cacheRef = useRef(new Map());
  const requestSeqRef = useRef(0);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search logic across modules
  const performSearch = useCallback(
    async (searchTerm) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) {
        setResults([]);
        setLoading(false);
        return;
      }

      // 1. Navigation / Admin Sections matching
      const matchingSections = sections
        .filter(
          (s) =>
            s.label.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q)
        )
        .slice(0, 5)
        .map((s) => ({
          id: `section-${s.id}`,
          module: "Pages & Modules",
          title: s.label,
          subtitle: `Navigate to ${s.label} workspace`,
          icon: s.icon || Settings,
          badge: "Page",
          targetSection: s.id,
        }));

      // If no API provided or query is very short, display matching modules
      if (!api || q.length < 2) {
        setResults(matchingSections.length ? [{ module: "Pages & Modules", items: matchingSections }] : []);
        setLoading(false);
        return;
      }

      // Check Cache
      if (cacheRef.current.has(q)) {
        setResults(cacheRef.current.get(q));
        setLoading(false);
        return;
      }

      setLoading(true);
      const currentSeq = ++requestSeqRef.current;

      try {
        const [
          productRes,
          categoryRes,
          orderRes,
          customerRes,
          serviceEnquiryRes,
          enquiryRes,
          offerRes,
          serviceRes,
        ] = await Promise.all([
          api(`/products/admin?page=1&limit=5&search=${encodeURIComponent(q)}`).catch(() => null),
          api(`/categories/admin?page=1&limit=5&search=${encodeURIComponent(q)}`).catch(() => null),
          api(`/admin/orders?page=1&limit=5&search=${encodeURIComponent(q)}`).catch(() => null),
          api(`/admin/customers?page=1&limit=5&search=${encodeURIComponent(q)}`).catch(() => null),
          api(`/admin/service-enquiries?page=1&limit=5&search=${encodeURIComponent(q)}`).catch(() => null),
          api("/enquiries").catch(() => null),
          api("/offers?includeInactive=true").catch(() => null),
          api("/services?includeInactive=true").catch(() => null),
        ]);

        // Discard stale responses
        if (currentSeq !== requestSeqRef.current) return;

        const groups = [];

        // Add Pages group if any matched
        if (matchingSections.length > 0) {
          groups.push({
            module: "Pages & Modules",
            items: matchingSections,
          });
        }

        // Products
        const products = (productRes?.items || []).slice(0, 4).map((p) => ({
          id: `product-${p.id}`,
          module: "Products",
          title: p.name,
          subtitle: [p.brand, p.model, p.price ? money(p.discountPrice || p.price) : null]
            .filter(Boolean)
            .join(" · "),
          icon: Package,
          badge: p.stock <= 5 ? "Low Stock" : "Product",
          targetSection: "products",
        }));
        if (products.length) groups.push({ module: "Products", items: products });

        // Categories
        const categories = (categoryRes?.items || []).slice(0, 4).map((c) => ({
          id: `category-${c.id}`,
          module: "Categories",
          title: c.name,
          subtitle: `/${c.slug}${c.description ? ` · ${c.description}` : ""}`,
          icon: Layers,
          badge: "Category",
          targetSection: "categories",
        }));
        if (categories.length) groups.push({ module: "Categories", items: categories });

        // Orders
        const orders = (orderRes?.items || []).slice(0, 4).map((o) => ({
          id: `order-${o.id}`,
          module: "Orders",
          title: `Order #${o.orderNumber || o.id?.slice(0, 8)}`,
          subtitle: `${o.customerName || o.user?.name || o.email || "Customer"} · ${money(o.total)} · ${o.status}`,
          icon: ClipboardList,
          badge: o.status,
          targetSection: "orders",
        }));
        if (orders.length) groups.push({ module: "Orders", items: orders });

        // Customers
        const customers = (customerRes?.items || []).slice(0, 4).map((cu) => ({
          id: `customer-${cu.id}`,
          module: "Customers",
          title: cu.name,
          subtitle: `${cu.email}${cu.phone ? ` · ${cu.phone}` : ""}`,
          icon: Users,
          badge: cu.isActive ? "Active" : "Inactive",
          targetSection: "customers",
        }));
        if (customers.length) groups.push({ module: "Customers", items: customers });

        // Service Enquiries
        const serviceEnquiries = (serviceEnquiryRes?.items || []).slice(0, 4).map((se) => ({
          id: `service-enquiry-${se.id}`,
          module: "Service Enquiries",
          title: `${se.customerName} (${se.laptopModel || "Device"})`,
          subtitle: `${se.serviceType?.replace(/_/g, " ")} · ${se.status}`,
          icon: Wrench,
          badge: se.status,
          targetSection: "service-enquiries",
        }));
        if (serviceEnquiries.length) groups.push({ module: "Service Enquiries", items: serviceEnquiries });

        // Customer Enquiries
        if (Array.isArray(enquiryRes)) {
          const enquiries = enquiryRes
            .filter((e) =>
              [e.name, e.email, e.phone, e.message]
                .filter(Boolean)
                .some((val) => val.toLowerCase().includes(q))
            )
            .slice(0, 4)
            .map((e) => ({
              id: `enquiry-${e.id}`,
              module: "Enquiries",
              title: `Enquiry from ${e.name}`,
              subtitle: `${e.email} · ${e.status}`,
              icon: Mail,
              badge: e.status,
              targetSection: "enquiries",
            }));
          if (enquiries.length) groups.push({ module: "Enquiries", items: enquiries });
        }

        // Offers
        if (Array.isArray(offerRes)) {
          const offers = offerRes
            .filter((o) =>
              [o.title, o.description]
                .filter(Boolean)
                .some((val) => val.toLowerCase().includes(q))
            )
            .slice(0, 4)
            .map((o) => ({
              id: `offer-${o.id}`,
              module: "Offers",
              title: o.title,
              subtitle: `${o.discount ? `${o.discount}% off` : "Special Offer"} · ${o.description || ""}`,
              icon: Percent,
              badge: o.isActive ? "Active" : "Inactive",
              targetSection: "offers",
            }));
          if (offers.length) groups.push({ module: "Offers", items: offers });
        }

        // Services
        if (Array.isArray(serviceRes)) {
          const servicesList = serviceRes
            .filter((s) =>
              [s.title, s.description]
                .filter(Boolean)
                .some((val) => val.toLowerCase().includes(q))
            )
            .slice(0, 4)
            .map((s) => ({
              id: `service-${s.id}`,
              module: "Services",
              title: s.title,
              subtitle: s.description || "Store Service",
              icon: Wrench,
              badge: "Service",
              targetSection: "services",
            }));
          if (servicesList.length) groups.push({ module: "Services", items: servicesList });
        }

        cacheRef.current.set(q, groups);
        setResults(groups);
        setSelectedIndex(0);
      } catch (err) {
        if (currentSeq === requestSeqRef.current) {
          setResults(matchingSections.length ? [{ module: "Pages & Modules", items: matchingSections }] : []);
        }
      } finally {
        if (currentSeq === requestSeqRef.current) {
          setLoading(false);
        }
      }
    },
    [api]
  );

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Flattened results for keyboard navigation
  const flatItems = useMemo(() => {
    return results.flatMap((group) => group.items);
  }, [results]);

  const handleSelect = useCallback(
    (item) => {
      if (!item) return;
      setIsOpen(false);
      if (onNavigate && item.targetSection) {
        onNavigate(item.targetSection);
      }
    },
    [onNavigate]
  );

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || flatItems.length === 0) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(flatItems[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="global-search-container" ref={containerRef}>
      <div className="global-search-input-wrap">
        <Search size={16} className="global-search-icon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          className="global-search-input"
          placeholder="Search products, orders, categories, customers..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          aria-label="Global Admin Search"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="global-search-dropdown-list"
        />

        <div className="global-search-actions">
          {loading ? (
            <Loader2 size={15} className="global-search-spinner" aria-hidden="true" />
          ) : query ? (
            <button
              type="button"
              className="global-search-clear-btn"
              onClick={handleClear}
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div
          id="global-search-dropdown-list"
          className="global-search-dropdown"
          role="listbox"
        >
          {loading && results.length === 0 ? (
            <div className="global-search-status">
              <Loader2 size={18} className="global-search-spinner" />
              <span>Searching workspace across all modules…</span>
            </div>
          ) : results.length === 0 ? (
            <div className="global-search-empty">
              <p>No results found for &ldquo;<strong>{query}</strong>&rdquo;</p>
              <small>Try searching by product name, category, order #, customer email, or service type.</small>
            </div>
          ) : (
            <div className="global-search-results-list">
              {(() => {
                let currentFlatIndex = 0;
                return results.map((group) => (
                  <div key={group.module} className="global-search-group">
                    <div className="global-search-group-header">
                      <span>{group.module}</span>
                      <span className="global-search-group-count">{group.items.length}</span>
                    </div>

                    <div className="global-search-group-items">
                      {group.items.map((item) => {
                        const itemIndex = currentFlatIndex++;
                        const isSelected = itemIndex === selectedIndex;
                        const ItemIcon = item.icon || Tag;

                        return (
                          <div
                            key={item.id}
                            className={`global-search-item ${isSelected ? "selected" : ""}`}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                          >
                            <span className="global-search-item-icon">
                              <ItemIcon size={16} aria-hidden="true" />
                            </span>

                            <div className="global-search-item-info">
                              <div className="global-search-item-title">
                                <HighlightMatch text={item.title} query={query} />
                              </div>
                              {item.subtitle && (
                                <div className="global-search-item-subtitle">
                                  <HighlightMatch text={item.subtitle} query={query} />
                                </div>
                              )}
                            </div>

                            <span className="global-search-item-badge">{item.badge}</span>

                            <span className="global-search-item-enter" aria-hidden="true">
                              <CornerDownLeft size={13} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
