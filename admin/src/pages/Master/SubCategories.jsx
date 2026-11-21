import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Eye,
  ImagePlus,
  Layers3,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { date, dateTime } from "../../utils/formatters";
import "../../styles/SubCategories.css";

const parentCategories = [
  { id: "parent-computers", name: "Computers" },
  { id: "parent-accessories", name: "Accessories" },
  { id: "parent-networking", name: "Networking" },
];

const initialSubcategoryPreviewData = [
  {
    id: "preview-subcategory-1",
    name: "Gaming Laptops",
    slug: "gaming-laptops",
    parentCategoryId: "parent-computers",
    imageUrl: "",
    description: "High-performance laptops for gaming and creative work.",
    isActive: true,
    createdAt: "2026-01-18T10:00:00.000Z",
  },
  {
    id: "preview-subcategory-2",
    name: "Keyboards",
    slug: "keyboards",
    parentCategoryId: "parent-accessories",
    imageUrl: "",
    description: "Mechanical and everyday keyboards.",
    isActive: true,
    createdAt: "2026-02-02T10:00:00.000Z",
  },
  {
    id: "preview-subcategory-3",
    name: "Wi-Fi Routers",
    slug: "wi-fi-routers",
    parentCategoryId: "parent-networking",
    imageUrl: "",
    description: "Reliable home and office networking.",
    isActive: false,
    createdAt: "2026-02-16T10:00:00.000Z",
  },
];

const emptySubcategory = {
  name: "",
  slug: "",
  parentCategoryId: "",
  imageUrl: "",
  imageFileName: "",
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

function getParentName(parentCategoryId) {
  return parentCategories.find((category) => category.id === parentCategoryId)?.name || "—";
}

function SubcategoryImage({ subcategory, className = "" }) {
  return (
    <span className={`subcategory-image ${className}`}>
      {subcategory.imageUrl ? <img src={subcategory.imageUrl} alt="" /> : <Layers3 size={19} aria-hidden="true" />}
    </span>
  );
}

function SubcategoryImageField({ subcategory, onImageChange, onRemoveImage }) {
  const hasImage = Boolean(subcategory.imageUrl);
  return (
    <div className="subcategory-image-content">
      <div
        className={`subcategory-image-preview ${hasImage ? "has-image" : ""}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) onImageChange(file);
        }}
      >
        {hasImage ? (
          <img src={subcategory.imageUrl} alt="Subcategory image preview" />
        ) : (
          <div>
            <ImagePlus size={40} aria-hidden="true" />
            <span>Image preview</span>
          </div>
        )}
      </div>
      {subcategory.imageFileName && <p className="subcategory-image-filename" title={subcategory.imageFileName}>{subcategory.imageFileName}</p>}
      <div className="subcategory-image-actions">
        <label className="subcategory-upload-control">
          <ImagePlus size={16} aria-hidden="true" />
          <span>{hasImage ? "Replace image" : "Upload image"}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" aria-label={hasImage ? "Replace subcategory image" : "Upload subcategory image"} onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImageChange(file);
            event.target.value = "";
          }} />
        </label>
        {hasImage && <button type="button" className="subcategory-remove-image" onClick={onRemoveImage}><Trash2 size={15} aria-hidden="true" />Remove</button>}
      </div>
      <small className="subcategory-image-help">JPEG, PNG, WebP or AVIF.</small>
    </div>
  );
}

function SubcategoryForm({ subcategory, editing, onChange, onImageChange, onRemoveImage, onClose, onSubmit }) {
  const [slugEdited, setSlugEdited] = useState(Boolean(subcategory.slug));

  function changeName(value) {
    onChange("name", value);
    if (!slugEdited) onChange("slug", slugify(value));
  }

  return (
    <form className="subcategories-page" onSubmit={onSubmit}>
      <nav className="subcategory-breadcrumbs" aria-label="Breadcrumb">
        <button type="button" onClick={onClose}><ArrowLeft size={15} aria-hidden="true" /> Subcategories</button>
        <span aria-hidden="true">/</span>
        <span>{editing ? "Edit subcategory" : "Add subcategory"}</span>
      </nav>

      <header className="subcategories-heading">
        <div className="subcategory-editor-title">
          {/* <p className="eyebrow">STORE MANAGEMENT</p> */}
          <h1>{editing ? "Edit Subcategory" : "Add Subcategory"}</h1>
          <p>{editing ? "Update the subcategory details below." : "Create a subcategory within a parent category."}</p>
        </div>
        <div className="subcategory-editor-header-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">{editing ? "Update Subcategory" : "Save Subcategory"}</button>
        </div>
      </header>

      <div className="subcategory-form-grid">
        <section className="subcategory-form-card">
          <div className="subcategory-section-heading">
            <span className="subcategory-section-icon"><Tag size={18} aria-hidden="true" /></span>
            <div><h2>Subcategory information</h2><p>Set the name, parent and details customers will see.</p></div>
          </div>

          <div className="subcategory-fields-stack">
            <label className="subcategory-field">
              Subcategory Name
              <input autoFocus required value={subcategory.name} onChange={(event) => changeName(event.target.value)} placeholder="e.g. Gaming Laptops" />
            </label>

            <label className="subcategory-field">
              Slug
              <input required value={subcategory.slug} onChange={(event) => {
                setSlugEdited(true);
                onChange("slug", slugify(event.target.value));
              }} placeholder="e.g. gaming-laptops" />
              <small>Generated from the subcategory name. You can edit it.</small>
            </label>

            <label className="subcategory-field">
              Parent Category
              <select required value={subcategory.parentCategoryId} onChange={(event) => onChange("parentCategoryId", event.target.value)}>
                <option value="">Select a parent category</option>
                {parentCategories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
              </select>
            </label>

            <label className="subcategory-field">
              Description
              <textarea rows="4" value={subcategory.description} onChange={(event) => onChange("description", event.target.value)} placeholder="Describe this subcategory." />
            </label>
          </div>
        </section>

        <section className="subcategory-form-card subcategory-settings-card">
          <div className="subcategory-section-heading">
            <span className="subcategory-section-icon"><ImagePlus size={18} aria-hidden="true" /></span>
            <div><h2>Subcategory image & settings</h2><p>Upload an image and choose its visibility.</p></div>
          </div>

          <SubcategoryImageField subcategory={subcategory} onImageChange={onImageChange} onRemoveImage={onRemoveImage} />

          <div className="subcategory-status-setting">
            <div>
              <h3><Check size={16} aria-hidden="true" />Status</h3>
              <p>Choose whether this subcategory is available in your store.</p>
            </div>
            <div className="subcategory-status-control" role="group" aria-label="Subcategory status">
              <button type="button" className={subcategory.isActive ? "is-selected" : ""} aria-pressed={Boolean(subcategory.isActive)} onClick={() => onChange("isActive", true)}>
                <span className="subcategory-status-dot subcategory-status-dot-active" />Active
              </button>
              <button type="button" className={!subcategory.isActive ? "is-selected" : ""} aria-pressed={!subcategory.isActive} onClick={() => onChange("isActive", false)}>
                <span className="subcategory-status-dot subcategory-status-dot-inactive" />Inactive
              </button>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}

function SubCategories() {
  const [subcategories, setSubcategories] = useState(initialSubcategoryPreviewData);
  const [subcategoryForm, setSubcategoryForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [parentFilter, setParentFilter] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const previewUrls = useRef(new Set());

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const filteredSubcategories = subcategories.filter((subcategory) => {
    const parentName = getParentName(subcategory.parentCategoryId);
    const matchesSearch = `${subcategory.name} ${subcategory.slug} ${subcategory.description} ${parentName}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = status === "all" || (status === "active") === subcategory.isActive;
    const matchesParent = parentFilter === "all" || parentFilter === subcategory.parentCategoryId;
    return matchesSearch && matchesStatus && matchesParent;
  });

  function startCreate() {
    setEditingId(null);
    setSubcategoryForm({ ...emptySubcategory });
  }

  function startEdit(subcategory) {
    setEditingId(subcategory.id);
    setSubcategoryForm({ ...emptySubcategory, ...subcategory, imageFileName: "" });
  }

  function changeField(name, value) {
    setSubcategoryForm((current) => ({ ...current, [name]: value }));
  }

  function selectImage(file) {
    const url = URL.createObjectURL(file);
    previewUrls.current.add(url);
    setSubcategoryForm((current) => ({ ...current, imageUrl: url, imageFileName: file.name }));
  }

  function saveSubcategory(event) {
    event.preventDefault();
    const savedSubcategory = {
      id: editingId || `preview-subcategory-${Date.now()}`,
      name: subcategoryForm.name.trim(),
      slug: subcategoryForm.slug.trim(),
      parentCategoryId: subcategoryForm.parentCategoryId,
      imageUrl: subcategoryForm.imageUrl,
      description: subcategoryForm.description.trim(),
      isActive: subcategoryForm.isActive,
      createdAt: editingId ? subcategories.find((item) => item.id === editingId)?.createdAt : new Date().toISOString(),
    };

    setSubcategories((current) => editingId
      ? current.map((subcategory) => subcategory.id === editingId ? savedSubcategory : subcategory)
      : [savedSubcategory, ...current]);
    setSubcategoryForm(null);
    setEditingId(null);
    setSearch("");
    setStatus("all");
    setParentFilter("all");
  }

  function removeSubcategory(subcategory) {
    if (!window.confirm(`Remove "${subcategory.name}" from this preview?`)) return;
    setSubcategories((current) => current.filter((item) => item.id !== subcategory.id));
    if (selectedSubcategory?.id === subcategory.id) setSelectedSubcategory(null);
  }

  if (subcategoryForm) {
    return (
      <SubcategoryForm
        subcategory={subcategoryForm}
        editing={Boolean(editingId)}
        onChange={changeField}
        onImageChange={selectImage}
        onRemoveImage={() => setSubcategoryForm((current) => ({ ...current, imageUrl: "", imageFileName: "" }))}
        onClose={() => {
          setSubcategoryForm(null);
          setEditingId(null);
        }}
        onSubmit={saveSubcategory}
      />
    );
  }

  return (
    <section className="subcategories-page">
      <header className="subcategories-heading subcategories-list-heading">
        <div>
          {/* <p className="eyebrow">STORE MANAGEMENT</p> */}
          <h1>Subcategories</h1>
          <p>Organize your products into clear, easy-to-browse groups.</p>
        </div>
        <button type="button" className="primary-button" onClick={startCreate}><Plus size={17} aria-hidden="true" />Add Subcategory</button>
      </header>

      <div className="subcategory-list-card">
        <div className="subcategory-list-toolbar">
          <div>
            <h2>All subcategories</h2>
            <p>{filteredSubcategories.length} {filteredSubcategories.length === 1 ? "subcategory" : "subcategories"} shown · {subcategories.length} total</p>
          </div>
          <span className="subcategory-total-count">{subcategories.length}<small>Total subcategories</small></span>
        </div>

        <div className="subcategory-filters">
          <label className="subcategory-search">
            <Search size={17} aria-hidden="true" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, slug or parent" aria-label="Search subcategories" />
          </label>
          <label className="subcategory-filter">
            <span>Parent</span>
            <select value={parentFilter} onChange={(event) => setParentFilter(event.target.value)}>
              <option value="all">All parent categories</option>
              {parentCategories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="subcategory-filter">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {filteredSubcategories.length === 0 ? (
          <div className="subcategory-empty-state">
            <span className="subcategory-empty-icon"><Layers3 size={22} aria-hidden="true" /></span>
            <h3>{search || status !== "all" || parentFilter !== "all" ? "No matching subcategories" : "No subcategories yet"}</h3>
            <p>{search || status !== "all" || parentFilter !== "all" ? "Try changing the search or filters." : "Add a subcategory to preview the subcategory-management layout."}</p>
            {!search && status === "all" && parentFilter === "all" && <button type="button" className="secondary-button" onClick={startCreate}><Plus size={15} aria-hidden="true" />Add Subcategory</button>}
          </div>
        ) : (
          <div className="subcategory-table-scroll">
            <table className="subcategory-table">
              <thead>
                <tr><th>Image</th><th>Subcategory name</th><th>Slug</th><th>Parent category</th><th>Status</th><th>Created date</th><th className="subcategory-actions-heading">Actions</th></tr>
              </thead>
              <tbody>
                {filteredSubcategories.map((subcategory) => (
                  <tr key={subcategory.id}>
                    <td><SubcategoryImage subcategory={subcategory} className="subcategory-table-image" /></td>
                    <td><strong className="subcategory-name">{subcategory.name}</strong></td>
                    <td><code className="subcategory-slug">/{subcategory.slug}</code></td>
                    <td>{getParentName(subcategory.parentCategoryId)}</td>
                    <td><span className={`subcategory-status-badge ${subcategory.isActive ? "subcategory-status-active" : "subcategory-status-inactive"}`}><span />{subcategory.isActive ? "Active" : "Inactive"}</span></td>
                    <td><span className="subcategory-created"><CalendarDays size={15} aria-hidden="true" />{date(subcategory.createdAt)}</span></td>
                    <td>
                      <div className="subcategory-row-actions">
                        <button type="button" aria-label={`View ${subcategory.name}`} title="View" onClick={() => setSelectedSubcategory(subcategory)}><Eye size={22} aria-hidden="true" /></button>
                        <button type="button" aria-label={`Edit ${subcategory.name}`} title="Edit" onClick={() => startEdit(subcategory)}><Pencil size={22} aria-hidden="true" /></button>
                        <button type="button" aria-label={`Delete ${subcategory.name}`} title="Delete" onClick={() => removeSubcategory(subcategory)}><Trash2 size={22} aria-hidden="true" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSubcategory && (
        <div className="subcategory-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSubcategory(null); }}>
          <section className="subcategory-details-modal" role="dialog" aria-modal="true" aria-labelledby="subcategory-details-title">
            <header className="subcategory-details-header">
              <div><p className="eyebrow">SUBCATEGORY DETAILS</p><h2 id="subcategory-details-title">Subcategory overview</h2></div>
              <button type="button" aria-label="Close subcategory details" onClick={() => setSelectedSubcategory(null)}><X size={19} aria-hidden="true" /></button>
            </header>
            <SubcategoryImage subcategory={selectedSubcategory} className="subcategory-details-image" />
            <h3 className="subcategory-details-name">{selectedSubcategory.name}</h3>
            <p className="subcategory-details-slug">/{selectedSubcategory.slug}</p>
            <dl className="subcategory-details-grid">
              <div><dt>Parent category</dt><dd>{getParentName(selectedSubcategory.parentCategoryId)}</dd></div>
              <div><dt>Status</dt><dd><span className={`subcategory-status-badge ${selectedSubcategory.isActive ? "subcategory-status-active" : "subcategory-status-inactive"}`}><span />{selectedSubcategory.isActive ? "Active" : "Inactive"}</span></dd></div>
              <div><dt>Created date</dt><dd>{dateTime(selectedSubcategory.createdAt)}</dd></div>
            </dl>
            <div className="subcategory-details-description"><h4>Description</h4><p>{selectedSubcategory.description || "No description provided."}</p></div>
            <footer className="subcategory-details-actions">
              <button type="button" className="secondary-button" onClick={() => setSelectedSubcategory(null)}>Close</button>
              <button type="button" className="primary-button" onClick={() => { const subcategory = selectedSubcategory; setSelectedSubcategory(null); startEdit(subcategory); }}><Pencil size={15} aria-hidden="true" />Edit Subcategory</button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

export default SubCategories;
