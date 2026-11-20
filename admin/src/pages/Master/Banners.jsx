import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Eye,
  ImagePlus,
  Layers3,
  Link2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import "../../styles/Banners.css";

const bannerTypes = ["Hero", "Promotional", "Category Feature"];
const bannerPlacements = ["Home Page", "Category Page", "Product Page", "Offers Page", "Landing Page"];

const initialBannerPreviewData = [
  {
    id: "preview-banner-1",
    title: "Make room for more",
    type: "Hero",
    placement: "Home Page",
    imageUrl: "",
    imageFileName: "",
    link: "/products",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    isActive: true,
    theme: "blue",
  },
  {
    id: "preview-banner-2",
    title: "Upgrade your workspace",
    type: "Promotional",
    placement: "Category Page",
    imageUrl: "",
    imageFileName: "",
    link: "/categories/accessories",
    startDate: "2026-10-15",
    endDate: "2026-11-30",
    isActive: true,
    theme: "violet",
  },
  {
    id: "preview-banner-3",
    title: "Find your next essential",
    type: "Category Feature",
    placement: "Offers Page",
    imageUrl: "",
    imageFileName: "",
    link: "/offers",
    startDate: "2026-09-01",
    endDate: "2026-10-31",
    isActive: false,
    theme: "amber",
  },
];

const emptyBanner = {
  title: "",
  type: "Promotional",
  placement: "Home Page",
  imageUrl: "",
  imageFileName: "",
  link: "",
  startDate: "",
  endDate: "",
  isActive: true,
  theme: "blue",
};

function formatBannerDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
}

function BannerPreview({ banner, className = "" }) {
  return (
    <span className={`banner-preview ${banner.imageUrl ? "has-image" : `banner-preview-${banner.theme}`} ${className}`}>
      {banner.imageUrl
        ? <img src={banner.imageUrl} alt="" />
        : <span className="banner-preview-copy"><small>{banner.type}</small><strong>{banner.title}</strong></span>}
    </span>
  );
}

function BannerImageField({ banner, onImageChange, onRemoveImage }) {
  const hasImage = Boolean(banner.imageUrl);
  return (
    <div className="banner-image-field">
      <BannerPreview banner={banner} className="banner-form-preview" />
      {banner.imageFileName && <p className="banner-image-filename" title={banner.imageFileName}>{banner.imageFileName}</p>}
      <div className="banner-image-actions">
        <label className="banner-upload-control">
          <ImagePlus size={16} aria-hidden="true" />
          <span>{hasImage ? "Replace image" : "Upload image"}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" aria-label={hasImage ? "Replace banner image" : "Upload banner image"} onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImageChange(file);
            event.target.value = "";
          }} />
        </label>
        {hasImage && <button type="button" className="banner-remove-image" onClick={onRemoveImage}><Trash2 size={15} aria-hidden="true" />Remove</button>}
      </div>
      <small className="banner-image-help">Use a wide image for the best result. JPEG, PNG, WebP or AVIF.</small>
    </div>
  );
}

function BannerPreviewNotice() {
  return (
    <div className="banner-preview-notice">
      <span><Layers3 size={16} aria-hidden="true" /></span>
      <p><strong>UI preview only.</strong> Banner changes are temporary and reset when this page reloads.</p>
    </div>
  );
}

function BannerForm({ banner, editing, onChange, onImageChange, onRemoveImage, onClose, onSubmit }) {
  return (
    <section className="banners-page">
      <nav className="banner-breadcrumbs" aria-label="Breadcrumb">
        <button type="button" onClick={onClose}><ArrowLeft size={15} aria-hidden="true" /> Banners</button>
        <span aria-hidden="true">/</span>
        <span>{editing ? "Edit banner" : "Add banner"}</span>
      </nav>

      <header className="banners-heading">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h1>{editing ? "Edit Banner" : "Add Banner"}</h1>
          <p>{editing ? "Update the banner content and schedule." : "Create a promotional banner for your storefront."}</p>
        </div>
      </header>

      <BannerPreviewNotice />

      <form className="banner-editor-form" onSubmit={onSubmit}>
        <div className="banner-form-grid">
          <section className="banner-form-card">
            <div className="banner-section-heading">
              <span className="banner-section-icon"><Layers3 size={18} aria-hidden="true" /></span>
              <div><h2>Banner details</h2><p>Set the message, placement and scheduling.</p></div>
            </div>

            <div className="banner-fields-stack">
              <label className="banner-field">
                Banner Title
                <input autoFocus required value={banner.title} onChange={(event) => onChange("title", event.target.value)} placeholder="e.g. Upgrade your workspace" />
              </label>

              <label className="banner-field">
                Banner Link / URL
                <span className="banner-link-input"><Link2 size={16} aria-hidden="true" /><input value={banner.link} onChange={(event) => onChange("link", event.target.value)} placeholder="/products or https://example.com" /></span>
                <small>Where customers go when they select this banner.</small>
              </label>

              <div className="banner-field-row">
                <label className="banner-field">
                  Banner Type
                  <select required value={banner.type} onChange={(event) => onChange("type", event.target.value)}>
                    {bannerTypes.map((type) => <option value={type} key={type}>{type}</option>)}
                  </select>
                </label>
                <label className="banner-field">
                  Placement
                  <select required value={banner.placement} onChange={(event) => onChange("placement", event.target.value)}>
                    {bannerPlacements.map((placement) => <option value={placement} key={placement}>{placement}</option>)}
                  </select>
                </label>
              </div>

              <div className="banner-field-row">
                <label className="banner-field">
                  Start Date
                  <span className="banner-date-input"><CalendarDays size={15} aria-hidden="true" /><input type="date" value={banner.startDate} max={banner.endDate || undefined} onChange={(event) => onChange("startDate", event.target.value)} /></span>
                </label>
                <label className="banner-field">
                  End Date
                  <span className="banner-date-input"><CalendarDays size={15} aria-hidden="true" /><input type="date" value={banner.endDate} min={banner.startDate || undefined} onChange={(event) => onChange("endDate", event.target.value)} /></span>
                </label>
              </div>
              <p className="banner-schedule-help">Dates are optional. If set, the end date must be on or after the start date.</p>
            </div>
          </section>

          <section className="banner-form-card banner-settings-card">
            <div className="banner-section-heading">
              <span className="banner-section-icon"><ImagePlus size={18} aria-hidden="true" /></span>
              <div><h2>Banner image & settings</h2><p>Choose the image and visibility for this banner.</p></div>
            </div>

            <BannerImageField banner={banner} onImageChange={onImageChange} onRemoveImage={onRemoveImage} />

            <div className="banner-status-setting">
              <div>
                <h3><Check size={16} aria-hidden="true" />Status</h3>
                <p>Choose whether this banner is currently active.</p>
              </div>
              <div className="banner-status-control" role="group" aria-label="Banner status">
                <button type="button" className={banner.isActive ? "is-selected" : ""} aria-pressed={Boolean(banner.isActive)} onClick={() => onChange("isActive", true)}>
                  <span className="banner-status-dot banner-status-dot-active" />Active
                </button>
                <button type="button" className={!banner.isActive ? "is-selected" : ""} aria-pressed={!banner.isActive} onClick={() => onChange("isActive", false)}>
                  <span className="banner-status-dot banner-status-dot-inactive" />Inactive
                </button>
              </div>
            </div>
          </section>
        </div>

        <footer className="banner-form-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">{editing ? "Update Banner" : "Save Banner"}</button>
        </footer>
      </form>
    </section>
  );
}

function Banners() {
  const [banners, setBanners] = useState(initialBannerPreviewData);
  const [bannerForm, setBannerForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedBanner, setSelectedBanner] = useState(null);
  const previewUrls = useRef(new Set());

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = `${banner.title} ${banner.type} ${banner.placement} ${banner.link}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = status === "all" || (status === "active") === banner.isActive;
    const matchesPlacement = placementFilter === "all" || placementFilter === banner.placement;
    const matchesType = typeFilter === "all" || typeFilter === banner.type;
    return matchesSearch && matchesStatus && matchesPlacement && matchesType;
  });

  function startCreate() {
    setEditingId(null);
    setBannerForm({ ...emptyBanner });
  }

  function startEdit(banner) {
    setEditingId(banner.id);
    setBannerForm({ ...emptyBanner, ...banner, imageFileName: "" });
  }

  function changeField(name, value) {
    setBannerForm((current) => ({ ...current, [name]: value }));
  }

  function selectImage(file) {
    const imageUrl = URL.createObjectURL(file);
    previewUrls.current.add(imageUrl);
    setBannerForm((current) => ({ ...current, imageUrl, imageFileName: file.name }));
  }

  function saveBanner(event) {
    event.preventDefault();
    const savedBanner = {
      ...bannerForm,
      id: editingId || `preview-banner-${Date.now()}`,
      title: bannerForm.title.trim(),
      link: bannerForm.link.trim(),
    };

    setBanners((current) => editingId
      ? current.map((banner) => banner.id === editingId ? savedBanner : banner)
      : [savedBanner, ...current]);
    setBannerForm(null);
    setEditingId(null);
    setSearch("");
    setStatus("all");
    setPlacementFilter("all");
    setTypeFilter("all");
  }

  function removeBanner(banner) {
    if (!window.confirm(`Remove "${banner.title}" from this preview?`)) return;
    setBanners((current) => current.filter((item) => item.id !== banner.id));
    if (selectedBanner?.id === banner.id) setSelectedBanner(null);
  }

  if (bannerForm) {
    return (
      <BannerForm
        banner={bannerForm}
        editing={Boolean(editingId)}
        onChange={changeField}
        onImageChange={selectImage}
        onRemoveImage={() => setBannerForm((current) => ({ ...current, imageUrl: "", imageFileName: "" }))}
        onClose={() => {
          setBannerForm(null);
          setEditingId(null);
        }}
        onSubmit={saveBanner}
      />
    );
  }

  return (
    <section className="banners-page">
      <header className="banners-heading banners-list-heading">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h1>Banners</h1>
          <p>Manage promotions and placements across your storefront.</p>
        </div>
        <button type="button" className="primary-button" onClick={startCreate}><Plus size={17} aria-hidden="true" />Add Banner</button>
      </header>

      <BannerPreviewNotice />

      <div className="banner-list-card">
        <div className="banner-list-toolbar">
          <div>
            <h2>All banners</h2>
            <p>{filteredBanners.length} {filteredBanners.length === 1 ? "banner" : "banners"} shown · {banners.length} total</p>
          </div>
          <span className="banner-total-count">{banners.length}<small>Total banners</small></span>
        </div>

        <div className="banner-filters">
          <label className="banner-search">
            <Search size={17} aria-hidden="true" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, type or placement" aria-label="Search banners" />
          </label>
          <label className="banner-filter">
            <span>Type</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">All types</option>
              {bannerTypes.map((type) => <option value={type} key={type}>{type}</option>)}
            </select>
          </label>
          <label className="banner-filter">
            <span>Placement</span>
            <select value={placementFilter} onChange={(event) => setPlacementFilter(event.target.value)}>
              <option value="all">All placements</option>
              {bannerPlacements.map((placement) => <option value={placement} key={placement}>{placement}</option>)}
            </select>
          </label>
          <label className="banner-filter">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {filteredBanners.length === 0 ? (
          <div className="banner-empty-state">
            <span className="banner-empty-icon"><ImagePlus size={22} aria-hidden="true" /></span>
            <h3>{search || status !== "all" || placementFilter !== "all" || typeFilter !== "all" ? "No matching banners" : "No banners yet"}</h3>
            <p>{search || status !== "all" || placementFilter !== "all" || typeFilter !== "all" ? "Try changing the search or filters." : "Add a banner to preview the banner-management layout."}</p>
            {!search && status === "all" && placementFilter === "all" && typeFilter === "all" && <button type="button" className="secondary-button" onClick={startCreate}><Plus size={15} aria-hidden="true" />Add Banner</button>}
          </div>
        ) : (
          <div className="banner-table-scroll">
            <table className="banner-table">
              <thead>
                <tr><th>Preview</th><th>Title</th><th>Type</th><th>Placement</th><th>Status</th><th>Start date</th><th>End date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredBanners.map((banner) => (
                  <tr key={banner.id}>
                    <td><BannerPreview banner={banner} className="banner-table-preview" /></td>
                    <td><strong className="banner-title">{banner.title}</strong></td>
                    <td><span className="banner-type-label">{banner.type}</span></td>
                    <td>{banner.placement}</td>
                    <td><span className={`banner-status-badge ${banner.isActive ? "banner-status-active" : "banner-status-inactive"}`}><span />{banner.isActive ? "Active" : "Inactive"}</span></td>
                    <td><span className="banner-date-value">{formatBannerDate(banner.startDate)}</span></td>
                    <td><span className="banner-date-value">{formatBannerDate(banner.endDate)}</span></td>
                    <td>
                      <div className="banner-row-actions">
                        <button type="button" aria-label={`View ${banner.title}`} title="View" onClick={() => setSelectedBanner(banner)}><Eye size={16} aria-hidden="true" /></button>
                        <button type="button" aria-label={`Edit ${banner.title}`} title="Edit" onClick={() => startEdit(banner)}><Pencil size={16} aria-hidden="true" /></button>
                        <button type="button" aria-label={`Delete ${banner.title}`} title="Delete" onClick={() => removeBanner(banner)}><Trash2 size={16} aria-hidden="true" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedBanner && (
        <div className="banner-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedBanner(null); }}>
          <section className="banner-details-modal" role="dialog" aria-modal="true" aria-labelledby="banner-details-title">
            <header className="banner-details-header">
              <div><p className="eyebrow">BANNER DETAILS</p><h2 id="banner-details-title">Banner overview</h2></div>
              <button type="button" aria-label="Close banner details" onClick={() => setSelectedBanner(null)}><X size={19} aria-hidden="true" /></button>
            </header>
            <BannerPreview banner={selectedBanner} className="banner-details-preview" />
            <h3 className="banner-details-title">{selectedBanner.title}</h3>
            <dl className="banner-details-grid">
              <div><dt>Banner type</dt><dd>{selectedBanner.type}</dd></div>
              <div><dt>Placement</dt><dd>{selectedBanner.placement}</dd></div>
              <div><dt>Status</dt><dd><span className={`banner-status-badge ${selectedBanner.isActive ? "banner-status-active" : "banner-status-inactive"}`}><span />{selectedBanner.isActive ? "Active" : "Inactive"}</span></dd></div>
              <div><dt>Start date</dt><dd>{formatBannerDate(selectedBanner.startDate)}</dd></div>
              <div><dt>End date</dt><dd>{formatBannerDate(selectedBanner.endDate)}</dd></div>
              <div className="banner-detail-link"><dt>Banner link</dt><dd>{selectedBanner.link || "—"}</dd></div>
            </dl>
            <footer className="banner-details-actions">
              <button type="button" className="secondary-button" onClick={() => setSelectedBanner(null)}>Close</button>
              <button type="button" className="primary-button" onClick={() => { const banner = selectedBanner; setSelectedBanner(null); startEdit(banner); }}><Pencil size={15} aria-hidden="true" />Edit Banner</button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

export default Banners;
