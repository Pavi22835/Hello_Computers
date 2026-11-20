import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Eye, ImagePlus, Layers3, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { date, dateTime } from "../../utils/formatters";
import "../../styles/Categories.css";

function CategoryImageField({ form, onChange }) {
  const [uploadedPreview, setUploadedPreview] = useState("");
  const selectedFile = form.imageFiles?.[0];

  useEffect(() => () => {
    if (uploadedPreview) URL.revokeObjectURL(uploadedPreview);
  }, [uploadedPreview]);

  function selectImage(event) {
    const file = event.target.files?.[0];
    setUploadedPreview(file ? URL.createObjectURL(file) : "");
    onChange("imageFiles", file ? [file] : []);
  }

  function removeImage() {
    setUploadedPreview("");
    onChange("imageFiles", []);
    onChange("imageUrl", "");
  }

  const imageSource = uploadedPreview || form.imageUrl;

  return (
    <div className="category-image-content">
      <div className={`category-image-preview ${imageSource ? "has-image" : ""}`}>
        {imageSource ? <img src={imageSource} alt="Category preview" /> : <div><ImagePlus size={28} /><span>Image preview</span></div>}
      </div>
      {selectedFile && <p className="category-image-filename" title={selectedFile.name}>{selectedFile.name}</p>}
      <div className="category-image-actions">
        <label className="category-upload-control">
          <ImagePlus size={16} />
          <span>{imageSource ? "Replace image" : "Upload image"}</span>
          <input aria-label={imageSource ? "Replace category image" : "Upload category image"} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={selectImage} />
        </label>
        {imageSource && <button type="button" className="category-remove-image" onClick={removeImage}><Trash2 size={15} />Remove</button>}
      </div>
      <label className="category-field category-image-url">
        Or use an image URL
        <input value={form.imageUrl ?? ""} onChange={(event) => onChange("imageUrl", event.target.value)} placeholder="https://example.com/category.jpg" />
      </label>
      <small className="category-image-help">JPEG, PNG, WebP or AVIF. Uploading a file replaces the current image.</small>
    </div>
  );
}

function Categories({ items, loading, form, editing, saving, onCreate, onEdit, onDelete, pagination, onPageChange, filters, onFilterChange, onClose, onChange, onSubmit }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (form) {
    return (
      <section className="categories-page">
        <nav className="categories-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" onClick={onClose}><ArrowLeft size={15} /> Categories</button>
          <span aria-hidden="true">/</span>
          <span>{editing ? "Edit category" : "Add category"}</span>
        </nav>

        <header className="categories-heading">
          <div>
            <p className="eyebrow">STORE MANAGEMENT</p>
            <h1>{editing ? "Edit Category" : "Add Category"}</h1>
            <p>{editing ? "Update the category details below." : "Create a category to organize your products."}</p>
          </div>
        </header>

        <form className="category-editor-form" onSubmit={onSubmit}>
          <div className="category-form-grid">
            <section className="category-form-card">
              <div className="category-section-heading">
                <span className="category-section-icon"><Layers3 size={18} /></span>
                <div><h2>Category information</h2><p>Set the name and details customers will see.</p></div>
              </div>

              <div className="category-fields-stack">
                <label className="category-field">
                  Category name
                  <input autoFocus required value={form.name ?? ""} onChange={(event) => onChange("name", event.target.value)} placeholder="e.g. Laptops" />
                </label>

                <label className="category-field">
                  Slug
                  <input value={form.slug ?? ""} onChange={(event) => onChange("slug", event.target.value)} placeholder="e.g. laptops" />
                  <small>Leave blank to generate it from the category name.</small>
                </label>

                <label className="category-field category-field-wide">
                  Parent category
                  <select value="" disabled aria-describedby="category-parent-help">
                    <option value="">No parent categories available</option>
                  </select>
                  <small id="category-parent-help">Parent categories are not supported by the current category API.</small>
                </label>

                <label className="category-field">
                  Description
                  <textarea rows="4" value={form.description ?? ""} onChange={(event) => onChange("description", event.target.value)} placeholder="Describe this category for your store." />
                </label>
              </div>
            </section>

            <section className="category-form-card category-settings-card">
              <div className="category-section-heading">
                <span className="category-section-icon"><ImagePlus size={18} /></span>
                <div><h2>Category image & settings</h2><p>Set an image and control store visibility.</p></div>
              </div>
              <CategoryImageField form={form} onChange={onChange} />
              <div className="category-status-setting">
                <div>
                  <h3><Check size={16} />Status</h3>
                  <p>Choose whether this category is available in your store.</p>
                </div>
                <div className="category-status-control" role="group" aria-label="Category status">
                  <button type="button" className={form.isActive ? "is-selected" : ""} aria-pressed={Boolean(form.isActive)} onClick={() => onChange("isActive", true)}>
                    <span className="category-status-dot category-status-dot-active" />Active
                  </button>
                  <button type="button" className={!form.isActive ? "is-selected" : ""} aria-pressed={!form.isActive} onClick={() => onChange("isActive", false)}>
                    <span className="category-status-dot category-status-dot-inactive" />Inactive
                  </button>
                </div>
              </div>
            </section>
          </div>

          <footer className="category-form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving…" : editing ? "Update Category" : "Save Category"}</button>
          </footer>
        </form>
      </section>
    );
  }

  return (
    <section className="categories-page">
      <header className="categories-heading categories-list-heading">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h1>Categories</h1>
          <p>Manage your product categories.</p>
        </div>
        <button type="button" className="primary-button" onClick={onCreate}><Plus size={17} /> Add Category</button>
      </header>

      <div className="category-list-card">
        <div className="category-list-toolbar">
          <div>
            <h2>All categories</h2>
            <p>{pagination?.total ?? items.length} {((pagination?.total ?? items.length) === 1) ? "category" : "categories"} in your store</p>
          </div>
          <span className="category-total-count">{pagination?.total ?? items.length}<small>Total categories</small></span>
        </div>

        <div className="category-filters">
          <label className="category-search">
            <Search size={17} aria-hidden="true" />
            <input type="search" value={filters?.search ?? ""} onChange={(event) => onFilterChange("search", event.target.value)} placeholder="Search by name, slug or description" aria-label="Search categories" />
          </label>
          <label className="category-status-filter">
            <span>Status</span>
            <select value={filters?.status ?? "all"} onChange={(event) => onFilterChange("status", event.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="category-empty-state">Loading categories…</div>
        ) : items.length === 0 ? (
          <div className="category-empty-state">
            <span className="category-empty-icon"><Layers3 size={23} /></span>
            <h3>{filters?.search || filters?.status !== "all" ? "No matching categories" : "No categories yet"}</h3>
            <p>{filters?.search || filters?.status !== "all" ? "Try another search or status filter." : "Create your first category to organize products."}</p>
            {!filters?.search && filters?.status === "all" && <button type="button" className="secondary-button" onClick={onCreate}><Plus size={16} /> Add Category</button>}
          </div>
        ) : (
          <div className="category-table-scroll">
            <table className="category-table">
              <thead>
                <tr><th>Category image</th><th>Category name</th><th>Slug</th><th>Parent category</th><th>Status</th><th>Created date</th><th className="category-actions-heading">Actions</th></tr>
              </thead>
              <tbody>
                {items.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="category-table-image">
                        {category.imageUrl ? <img src={category.imageUrl} alt="" loading="lazy" /> : <Layers3 size={19} aria-label="No image" />}
                      </div>
                    </td>
                    <td><strong className="category-name">{category.name}</strong></td>
                    <td><code className="category-slug">/{category.slug}</code></td>
                    <td>{category.parentCategory?.name || category.parent?.name || "—"}</td>
                    <td><span className={`category-badge ${category.isActive ? "category-badge-active" : "category-badge-inactive"}`}><span />{category.isActive ? "Active" : "Inactive"}</span></td>
                    <td><span className="category-created"><CalendarDays size={15} />{date(category.createdAt)}</span></td>
                    <td>
                      <div className="category-row-actions">
                        <button type="button" aria-label={`View ${category.name}`} title="View" onClick={() => setSelectedCategory(category)}><Eye size={16} /></button>
                        <button type="button" aria-label={`Edit ${category.name}`} title="Edit" onClick={() => onEdit(category)}><Pencil size={16} /></button>
                        <button type="button" aria-label={`Delete ${category.name}`} title="Delete" onClick={() => onDelete(category)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="category-pagination">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <div>
              <button type="button" className="secondary-button" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>Previous</button>
              <button type="button" className="secondary-button" disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedCategory && (
        <div className="category-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCategory(null); }}>
          <section className="category-details-modal" role="dialog" aria-modal="true" aria-labelledby="category-details-title">
            <header className="category-details-header">
              <div><p className="eyebrow">CATEGORY DETAILS</p><h2 id="category-details-title">Category overview</h2></div>
              <button type="button" aria-label="Close category details" onClick={() => setSelectedCategory(null)}><X size={19} /></button>
            </header>
            <div className="category-details-image">
              {selectedCategory.imageUrl ? <img src={selectedCategory.imageUrl} alt={selectedCategory.name} /> : <Layers3 size={38} />}
            </div>
            <h3 className="category-details-name">{selectedCategory.name}</h3>
            <p className="category-details-slug">/{selectedCategory.slug}</p>
            <dl className="category-details-grid">
              <div><dt>Parent category</dt><dd>{selectedCategory.parentCategory?.name || selectedCategory.parent?.name || "—"}</dd></div>
              <div><dt>Status</dt><dd><span className={`category-badge ${selectedCategory.isActive ? "category-badge-active" : "category-badge-inactive"}`}><span />{selectedCategory.isActive ? "Active" : "Inactive"}</span></dd></div>
              <div><dt>Created date</dt><dd>{dateTime(selectedCategory.createdAt)}</dd></div>
              <div><dt>Updated date</dt><dd>{dateTime(selectedCategory.updatedAt)}</dd></div>
            </dl>
            <div className="category-details-description"><h4>Description</h4><p>{selectedCategory.description || "No description provided."}</p></div>
            <footer className="category-details-actions"><button type="button" className="secondary-button" onClick={() => setSelectedCategory(null)}>Close</button><button type="button" className="primary-button" onClick={() => { const category = selectedCategory; setSelectedCategory(null); onEdit(category); }}><Pencil size={15} /> Edit Category</button></footer>
          </section>
        </div>
      )}
    </section>
  );
}

export default Categories;
