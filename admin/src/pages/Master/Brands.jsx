import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  Eye,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { date, dateTime } from "../../utils/formatters";
import "../../styles/Brands.css";

const initialBrandPreviewData = [
  {
    id: "preview-brand-1",
    name: "Northstar",
    slug: "northstar",
    imageUrl: "",
    description: "Reliable devices and accessories for everyday work.",
    isActive: true,
    createdAt: "2026-01-12T10:00:00.000Z",
  },
  {
    id: "preview-brand-2",
    name: "NovaTech",
    slug: "novatech",
    imageUrl: "",
    description: "Modern technology designed for the next generation.",
    isActive: true,
    createdAt: "2026-02-04T10:00:00.000Z",
  },
  {
    id: "preview-brand-3",
    name: "Orbit Systems",
    slug: "orbit-systems",
    imageUrl: "",
    description: "Performance-focused computing products.",
    isActive: false,
    createdAt: "2026-02-19T10:00:00.000Z",
  },
];

const emptyBrand = {
  name: "",
  slug: "",
  imageUrl: "",
  logoFileName: "",
  description: "",
  isActive: true,
};

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function BrandMark({ brand, className = "" }) {
  const initials = brand.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <span className={`brand-mark ${className}`}>
      {brand.imageUrl ? <img src={brand.imageUrl} alt="" /> : <span>{initials || <Tag size={20} aria-hidden="true" />}</span>}
    </span>
  );
}

function BrandLogoField({ brand, onLogoChange, onRemoveLogo }) {
  const hasLogo = Boolean(brand.imageUrl);
  return (
    <div className="brand-logo-field">
      <div className={`brand-logo-preview ${hasLogo ? "has-logo" : ""}`}>
        {hasLogo ? <img src={brand.imageUrl} alt="Brand logo preview" /> : <div><ImagePlus size={27} aria-hidden="true" /><span>Logo preview</span></div>}
      </div>
      {brand.logoFileName && <p className="brand-logo-filename" title={brand.logoFileName}>{brand.logoFileName}</p>}
      <div className="brand-logo-actions">
        <label className="brand-upload-control">
          <ImagePlus size={16} aria-hidden="true" />
          <span>{hasLogo ? "Replace logo" : "Upload logo"}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" aria-label={hasLogo ? "Replace brand logo" : "Upload brand logo"} onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onLogoChange(file);
            event.target.value = "";
          }} />
        </label>
        {hasLogo && <button type="button" className="brand-remove-logo" onClick={onRemoveLogo}><Trash2 size={15} aria-hidden="true" />Remove</button>}
      </div>
      <small className="brand-logo-help">JPEG, PNG, WebP or AVIF.</small>
    </div>
  );
}

function BrandPreviewNotice() {
  return (
    <div className="brand-preview-notice">
      <span><Building2 size={16} aria-hidden="true" /></span>
      <p><strong>UI preview only.</strong> Brand changes are temporary and reset when this page reloads.</p>
    </div>
  );
}

function BrandForm({ brand, editing, onChange, onLogoChange, onRemoveLogo, onClose, onSubmit }) {
  const [slugEdited, setSlugEdited] = useState(Boolean(brand.slug));

  function changeName(value) {
    onChange("name", value);
    if (!slugEdited) onChange("slug", slugify(value));
  }

  return (
    <section className="brands-page">
      <nav className="brands-breadcrumbs" aria-label="Breadcrumb">
        <button type="button" onClick={onClose}><ArrowLeft size={15} aria-hidden="true" /> Brands</button>
        <span aria-hidden="true">/</span>
        <span>{editing ? "Edit brand" : "Add brand"}</span>
      </nav>

      <header className="brands-heading">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h1>{editing ? "Edit Brand" : "Add Brand"}</h1>
          <p>{editing ? "Update the brand details below." : "Create a brand for your product catalog."}</p>
        </div>
      </header>

      <BrandPreviewNotice />

      <form className="brand-editor-form" onSubmit={onSubmit}>
        <div className="brand-form-grid">
          <section className="brand-form-card">
            <div className="brand-section-heading">
              <span className="brand-section-icon"><Tag size={18} aria-hidden="true" /></span>
              <div><h2>Brand information</h2><p>Set the name and details customers will see.</p></div>
            </div>

            <div className="brand-fields-stack">
              <label className="brand-field">
                Brand Name
                <input autoFocus required value={brand.name} onChange={(event) => changeName(event.target.value)} placeholder="e.g. Northstar" />
              </label>

              <label className="brand-field">
                Slug
                <input required value={brand.slug} onChange={(event) => {
                  setSlugEdited(true);
                  onChange("slug", slugify(event.target.value));
                }} placeholder="e.g. northstar" />
                <small>Generated from the brand name. You can edit it.</small>
              </label>

              <label className="brand-field">
                Description
                <textarea rows="5" value={brand.description} onChange={(event) => onChange("description", event.target.value)} placeholder="Describe this brand." />
              </label>
            </div>
          </section>

          <section className="brand-form-card brand-settings-card">
            <div className="brand-section-heading">
              <span className="brand-section-icon"><Building2 size={18} aria-hidden="true" /></span>
              <div><h2>Brand logo & settings</h2><p>Upload a logo and choose its visibility.</p></div>
            </div>

            <BrandLogoField brand={brand} onLogoChange={onLogoChange} onRemoveLogo={onRemoveLogo} />

            <div className="brand-status-setting">
              <div>
                <h3><Check size={16} aria-hidden="true" />Status</h3>
                <p>Choose whether this brand is available in your store.</p>
              </div>
              <div className="brand-status-control" role="group" aria-label="Brand status">
                <button type="button" className={brand.isActive ? "is-selected" : ""} aria-pressed={Boolean(brand.isActive)} onClick={() => onChange("isActive", true)}>
                  <span className="brand-status-dot brand-status-dot-active" />Active
                </button>
                <button type="button" className={!brand.isActive ? "is-selected" : ""} aria-pressed={!brand.isActive} onClick={() => onChange("isActive", false)}>
                  <span className="brand-status-dot brand-status-dot-inactive" />Inactive
                </button>
              </div>
            </div>
          </section>
        </div>

        <footer className="brand-form-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">{editing ? "Update Brand" : "Save Brand"}</button>
        </footer>
      </form>
    </section>
  );
}

function Brands() {
  const [brands, setBrands] = useState(initialBrandPreviewData);
  const [brandForm, setBrandForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const previewUrls = useRef(new Set());

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = `${brand.name} ${brand.slug} ${brand.description}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = status === "all" || (status === "active") === brand.isActive;
    return matchesSearch && matchesStatus;
  });

  function startCreate() {
    setEditingId(null);
    setBrandForm({ ...emptyBrand });
  }

  function startEdit(brand) {
    setEditingId(brand.id);
    setBrandForm({ ...emptyBrand, ...brand, logoFileName: "" });
  }

  function changeField(name, value) {
    setBrandForm((current) => ({ ...current, [name]: value }));
  }

  function selectLogo(file) {
    const url = URL.createObjectURL(file);
    previewUrls.current.add(url);
    setBrandForm((current) => ({ ...current, imageUrl: url, logoFileName: file.name }));
  }

  function saveBrand(event) {
    event.preventDefault();
    const savedBrand = {
      id: editingId || `preview-brand-${Date.now()}`,
      name: brandForm.name.trim(),
      slug: brandForm.slug.trim(),
      imageUrl: brandForm.imageUrl,
      description: brandForm.description.trim(),
      isActive: brandForm.isActive,
      createdAt: editingId ? brands.find((brand) => brand.id === editingId)?.createdAt : new Date().toISOString(),
    };

    setBrands((current) => editingId
      ? current.map((brand) => brand.id === editingId ? savedBrand : brand)
      : [savedBrand, ...current]);
    setBrandForm(null);
    setEditingId(null);
    setSearch("");
    setStatus("all");
  }

  function removeBrand(brand) {
    if (!window.confirm(`Remove "${brand.name}" from this preview?`)) return;
    setBrands((current) => current.filter((item) => item.id !== brand.id));
    if (selectedBrand?.id === brand.id) setSelectedBrand(null);
  }

  if (brandForm) {
    return (
      <BrandForm
        brand={brandForm}
        editing={Boolean(editingId)}
        onChange={changeField}
        onLogoChange={selectLogo}
        onRemoveLogo={() => setBrandForm((current) => ({ ...current, imageUrl: "", logoFileName: "" }))}
        onClose={() => {
          setBrandForm(null);
          setEditingId(null);
        }}
        onSubmit={saveBrand}
      />
    );
  }

  return (
    <section className="brands-page">
      <header className="brands-heading brands-list-heading">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h1>Brands</h1>
          <p>Manage the brands in your product catalog.</p>
        </div>
        <button type="button" className="primary-button" onClick={startCreate}><Plus size={17} aria-hidden="true" />Add Brand</button>
      </header>

      <BrandPreviewNotice />

      <div className="brand-list-card">
        <div className="brand-list-toolbar">
          <div>
            <h2>All brands</h2>
            <p>{filteredBrands.length} {filteredBrands.length === 1 ? "brand" : "brands"} shown · {brands.length} total</p>
          </div>
          <span className="brand-total-count">{brands.length}<small>Total brands</small></span>
        </div>

        <div className="brand-filters">
          <label className="brand-search">
            <Search size={17} aria-hidden="true" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or slug" aria-label="Search brands" />
          </label>
          <label className="brand-status-filter">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {filteredBrands.length === 0 ? (
          <div className="brand-empty-state">
            <span className="brand-empty-icon"><Tag size={22} aria-hidden="true" /></span>
            <h3>{search || status !== "all" ? "No matching brands" : "No brands yet"}</h3>
            <p>{search || status !== "all" ? "Try changing the search or status filter." : "Add a brand to preview the brand-management layout."}</p>
            {!search && status === "all" && <button type="button" className="secondary-button" onClick={startCreate}><Plus size={15} aria-hidden="true" />Add Brand</button>}
          </div>
        ) : (
          <div className="brand-table-scroll">
            <table className="brand-table">
              <thead>
                <tr><th>Brand image</th><th>Brand name</th><th>Slug</th><th>Status</th><th>Created date</th><th className="brand-actions-heading">Actions</th></tr>
              </thead>
              <tbody>
                {filteredBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td><BrandMark brand={brand} className="brand-table-image" /></td>
                    <td><strong className="brand-name">{brand.name}</strong></td>
                    <td><code className="brand-slug">/{brand.slug}</code></td>
                    <td><span className={`brand-status-badge ${brand.isActive ? "brand-status-active" : "brand-status-inactive"}`}><span />{brand.isActive ? "Active" : "Inactive"}</span></td>
                    <td><span className="brand-created"><CalendarDays size={15} aria-hidden="true" />{date(brand.createdAt)}</span></td>
                    <td>
                      <div className="brand-row-actions">
                        <button type="button" aria-label={`View ${brand.name}`} title="View" onClick={() => setSelectedBrand(brand)}><Eye size={16} aria-hidden="true" /></button>
                        <button type="button" aria-label={`Edit ${brand.name}`} title="Edit" onClick={() => startEdit(brand)}><Pencil size={16} aria-hidden="true" /></button>
                        <button type="button" aria-label={`Delete ${brand.name}`} title="Delete" onClick={() => removeBrand(brand)}><Trash2 size={16} aria-hidden="true" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedBrand && (
        <div className="brand-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedBrand(null); }}>
          <section className="brand-details-modal" role="dialog" aria-modal="true" aria-labelledby="brand-details-title">
            <header className="brand-details-header">
              <div><p className="eyebrow">BRAND DETAILS</p><h2 id="brand-details-title">Brand overview</h2></div>
              <button type="button" aria-label="Close brand details" onClick={() => setSelectedBrand(null)}><X size={19} aria-hidden="true" /></button>
            </header>
            <BrandMark brand={selectedBrand} className="brand-details-image" />
            <h3 className="brand-details-name">{selectedBrand.name}</h3>
            <p className="brand-details-slug">/{selectedBrand.slug}</p>
            <dl className="brand-details-grid">
              <div><dt>Status</dt><dd><span className={`brand-status-badge ${selectedBrand.isActive ? "brand-status-active" : "brand-status-inactive"}`}><span />{selectedBrand.isActive ? "Active" : "Inactive"}</span></dd></div>
              <div><dt>Created date</dt><dd>{dateTime(selectedBrand.createdAt)}</dd></div>
            </dl>
            <div className="brand-details-description"><h4>Description</h4><p>{selectedBrand.description || "No description provided."}</p></div>
            <footer className="brand-details-actions">
              <button type="button" className="secondary-button" onClick={() => setSelectedBrand(null)}>Close</button>
              <button type="button" className="primary-button" onClick={() => { const brand = selectedBrand; setSelectedBrand(null); startEdit(brand); }}><Pencil size={15} aria-hidden="true" />Edit Brand</button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

export default Brands;
