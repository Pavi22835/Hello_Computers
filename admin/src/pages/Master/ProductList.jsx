import { ChevronLeft, ChevronRight, Eye, ImagePlus, Package, Pencil, Plus, Trash2, X } from "lucide-react";
import AddProduct from "./AddProduct";
import ResourceTable from "../../components/tables/ResourceTable";
import { money } from "../../utils/formatters";
import "../../styles/Product.css";

function ProductInventoryTable({ items, onView, onEdit, onDelete }) {
  return (
    <div className="product-table-scroll">
      <table className="product-inventory-table">
        <thead>
          <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Status</th><th className="actions-heading">Actions</th></tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const imageUrl = item.imageUrl || (Array.isArray(item.images) && (item.images[0]?.url || item.images[0]));
            return (
              <tr key={item.id}>
                <td>
                  <div className="product-list-identity">
                    <span className="product-list-image">{imageUrl ? <img src={imageUrl} alt="" loading="lazy" /> : <ImagePlus size={19} aria-hidden="true" />}</span>
                    <span className="product-list-copy"><strong>{item.name}</strong><small>{[item.model, item.brand].filter(Boolean).join(" · ") || "No model or brand"}</small></span>
                  </div>
                </td>
                <td>{item.category?.name || "Uncategorized"}</td>
                <td>{item.discountPrice != null ? <span className="product-list-price"><strong>{money(item.discountPrice)}</strong><small className="price-original">{money(item.price)}</small></span> : <strong>{money(item.price)}</strong>}</td>
                <td><span className={`product-stock ${item.stock <= 5 ? "is-low" : ""}`}><strong>{item.stock ?? 0}</strong><small>units</small></span></td>
                <td>{item.isFeatured ? <span className="product-list-badge is-featured">Featured</span> : "—"}</td>
                <td><span className={`product-list-badge ${item.isActive ? "is-active" : "is-inactive"}`}>{item.isActive ? "Active" : "Inactive"}</span></td>
                <td>
                  <div className="product-list-actions">
                    <button type="button" aria-label={`View ${item.name}`} title="View" onClick={() => onView(item)}><Eye size={16} aria-hidden="true" /></button>
                    <button type="button" aria-label={`Edit ${item.name}`} title="Edit" onClick={() => onEdit(item)}><Pencil size={16} aria-hidden="true" /></button>
                    <button type="button" aria-label={`Delete ${item.name}`} title="Delete" onClick={() => onDelete(item)}><Trash2 size={16} aria-hidden="true" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProductList({ config, items, categories, loading, form, editing, saving, onCreate, onEdit, onDelete, onView, pagination, onPageChange, filters, onFilterChange, onClose, onChange, onSubmit }) {
  const isProduct = config.singular === "product";
  const itemCount = items.length;

  if (isProduct && form) {
    return <AddProduct config={config} form={form} editing={editing} saving={saving} categories={categories} onClose={onClose} onChange={onChange} onSubmit={onSubmit} />;
  }

  return (
    <div className={isProduct ? "product-module" : undefined}>
      <div className={`page-heading ${isProduct ? "product-list-heading" : ""}`}><div><p className="eyebrow">STORE MANAGEMENT</p><h1>{config.title}</h1><p>Create, update and organize your store {config.title.toLowerCase()}.</p></div><button type="button" className="primary-button" onClick={onCreate}><Plus size={17} /> {config.createLabel || `Add ${config.singular}`}</button></div>
      <AddProduct config={config} form={form} editing={editing} saving={saving} categories={categories} onClose={onClose} onChange={onChange} onSubmit={onSubmit} />
      <div className={`table-card ${isProduct ? "product-table-card" : ""}`}>
        <div className="table-toolbar"><div><h2>All {config.title.toLowerCase()}</h2><p>{pagination?.total ?? itemCount} {config.singular}{(pagination?.total ?? itemCount) === 1 ? "" : "s"} in your store</p></div><span className="table-total">{pagination?.total ?? itemCount}<small>Total {config.title.toLowerCase()}</small></span></div>
        {filters && <div className="resource-filters">
          <label>Search categories<input type="search" value={filters.search} onChange={(event) => onFilterChange("search", event.target.value)} placeholder="Name, slug, or description" /></label>
          <label>Status<select value={filters.status} onChange={(event) => onFilterChange("status", event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        </div>}
        {loading ? <div className="table-message">Loading {config.title.toLowerCase()}…</div> : itemCount === 0 ? <div className="empty-state"><Package size={25} aria-hidden="true" /><h3>{filters && (filters.search || filters.status !== "all") ? "No matching categories" : `No ${config.title.toLowerCase()} yet`}</h3><p>{filters && (filters.search || filters.status !== "all") ? "Try changing the search or status filter." : `Create your first ${config.singular} to get started.`}</p><button className="secondary-button" onClick={onCreate}>Add {config.singular}</button></div> : (
          isProduct
            ? <ProductInventoryTable items={items} onView={onView} onEdit={onEdit} onDelete={onDelete} />
            : <ResourceTable config={config} items={items} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        )}
        {pagination && pagination.totalPages > 1 && <div className="admin-pagination"><span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} {config.title.toLowerCase()}</span><div><button type="button" className="secondary-button" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}><ChevronLeft size={15} /> Previous</button><button type="button" className="secondary-button" disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)}>Next <ChevronRight size={15} /></button></div></div>}
      </div>
    </div>
  );
}

export function ProductPreview({ product, onClose }) {
  const imageUrls = [product.imageUrl, ...(product.images || []).map((image) => image.url || image)]
    .filter((image, index, list) => image && list.indexOf(image) === index);
  return (
    <div className="product-preview-backdrop" role="presentation" onClick={onClose}>
      <section className="product-preview" role="dialog" aria-modal="true" aria-labelledby="product-preview-title" onClick={(event) => event.stopPropagation()}>
        <div className="product-preview-heading"><div><p className="eyebrow">PRODUCT DETAILS</p><h2 id="product-preview-title">{product.name}</h2></div><button type="button" className="icon-button" aria-label="Close preview" onClick={onClose}><X size={18} aria-hidden="true" /></button></div>
        <div className="product-preview-images">{imageUrls.length ? imageUrls.map((url) => <img src={url} alt={product.name} key={url} />) : <Package size={56} strokeWidth={1} />}</div>
        <dl className="product-preview-details">
          <div><dt>Model</dt><dd>{product.model || "—"}</dd></div>
          <div><dt>Brand</dt><dd>{product.brand || "—"}</dd></div>
          <div><dt>Category</dt><dd>{product.category?.name || "Uncategorized"}</dd></div>
          <div><dt>Price</dt><dd>{product.discountPrice != null ? <><span className="price-original">{money(product.price)}</span> {money(product.discountPrice)}</> : money(product.price)}</dd></div>
          <div><dt>Stock</dt><dd>{product.stock}</dd></div>
          <div><dt>Status</dt><dd>{product.isActive ? "Active" : "Inactive"}{product.isFeatured ? " · Featured" : ""}</dd></div>
        </dl>
        {product.description && <div className="product-preview-copy"><h3>Description</h3><p>{product.description}</p></div>}
        {product.specifications && <div className="product-preview-copy"><h3>Specifications</h3><p>{product.specifications}</p></div>}
      </section>
    </div>
  );
}

export function CategoryPreview({ category, onClose }) {
  return (
    <div className="product-preview-backdrop" role="presentation" onClick={onClose}>
      <section className="product-preview" role="dialog" aria-modal="true" aria-labelledby="category-preview-title" onClick={(event) => event.stopPropagation()}>
        <div className="product-preview-heading"><div><p className="eyebrow">CATEGORY DETAILS</p><h2 id="category-preview-title">{category.name}</h2></div><button type="button" className="icon-button" aria-label="Close preview" onClick={onClose}><X size={18} aria-hidden="true" /></button></div>
        {category.imageUrl && <div className="category-preview-image"><img src={category.imageUrl} alt={category.name} /></div>}
        <dl className="product-preview-details">
          <div><dt>Slug</dt><dd>/{category.slug}</dd></div>
          <div><dt>Status</dt><dd>{category.isActive ? "Active" : "Inactive"}</dd></div>
          <div><dt>Products</dt><dd>{category._count?.products ?? 0}</dd></div>
        </dl>
        {category.description && <div className="product-preview-copy"><h3>Description</h3><p>{category.description}</p></div>}
      </section>
    </div>
  );
}

export default ProductList;
