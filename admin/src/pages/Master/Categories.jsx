import { useState } from "react";
import { CalendarDays, Eye, Layers3, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { date, dateTime } from "../../utils/formatters";
import AddCategory, { CategoryImageField } from "./AddCategory";
import "../../styles/Categories.css";

function Categories({ items, loading, form, editing, saving, onCreate, onEdit, onDelete, pagination, onPageChange, filters, onFilterChange, onClose, onChange, onSubmit }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (form) {
    return (
      <AddCategory
        form={form}
        editing={editing}
        saving={saving}
        onClose={onClose}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <section className="categories-page">
      <header className="categories-heading categories-list-heading">
        <div>
          {/* <p className="eyebrow">STORE MANAGEMENT</p> */}
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
                        <button type="button" aria-label={`View ${category.name}`} title="View" onClick={() => setSelectedCategory(category)}><Eye size={22} /></button>
                        <button type="button" aria-label={`Edit ${category.name}`} title="Edit" onClick={() => onEdit(category)}><Pencil size={22} /></button>
                        <button type="button" aria-label={`Delete ${category.name}`} title="Delete" onClick={() => onDelete(category)}><Trash2 size={22} /></button>
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
