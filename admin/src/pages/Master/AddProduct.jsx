import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Box,
  CircleDollarSign,
  FileText,
  ImagePlus,
  Images,
  Package,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

function AddProduct({ config, form, editing, saving, categories, onClose, onChange, onSubmit }) {
  const isProduct = config?.singular === "product";
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [draggingGallery, setDraggingGallery] = useState(null);

  const mainInputRef = useRef(null);
  const galleryInputRefs = useRef([]);
  const previewsRef = useRef([]);

  // Main Image preview: file blob URL takes precedence, fallback to existing imageUrl
  const [mainPreview, setMainPreview] = useState(() => form?.imageUrl || "");

  // Gallery previews: exactly 3 slots
  const [galleryPreviews, setGalleryPreviews] = useState(() => {
    const existing = Array.isArray(form?.images) ? form.images : [];
    return [existing[0] || "", existing[1] || "", existing[2] || ""];
  });

  // Keep in sync with form props when switching records
  useEffect(() => {
    if (!form?.mainImageFile) {
      setMainPreview(form?.imageUrl || "");
    }
    if (!form?.galleryFiles || form.galleryFiles.every((f) => !f)) {
      const existing = Array.isArray(form?.images) ? form.images : [];
      setGalleryPreviews([existing[0] || "", existing[1] || "", existing[2] || ""]);
    }
  }, [form?.imageUrl, form?.images, form?.mainImageFile, form?.galleryFiles]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  if (!form) return null;

  const fields = (config?.fields || []).filter(
    (field) => !(editing && field.createOnly) && !(!editing && field.editOnly)
  );
  const fieldsByName = new Map(fields.map((field) => [field.name, field]));

  function handleMainFile(file) {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    previewsRef.current.push(objectUrl);
    setMainPreview(objectUrl);
    onChange("mainImageFile", file);
  }

  function removeMainImage() {
    setMainPreview("");
    onChange("mainImageFile", null);
    onChange("imageUrl", "");
  }

  function handleGalleryFile(index, file) {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    previewsRef.current.push(objectUrl);
    setGalleryPreviews((prev) => {
      const next = [...prev];
      next[index] = objectUrl;
      return next;
    });

    const currentFiles = Array.isArray(form.galleryFiles) ? [...form.galleryFiles] : [null, null, null];
    currentFiles[index] = file;
    onChange("galleryFiles", currentFiles);
  }

  function removeGalleryImage(index) {
    setGalleryPreviews((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });

    const currentFiles = Array.isArray(form.galleryFiles) ? [...form.galleryFiles] : [null, null, null];
    currentFiles[index] = null;
    onChange("galleryFiles", currentFiles);

    if (Array.isArray(form.images)) {
      const nextImages = [...form.images];
      nextImages[index] = "";
      onChange("images", nextImages.filter(Boolean));
    }
  }

  function renderField(field) {
    if (isProduct && field.type === "checkbox") {
      const description =
        field.name === "isActive"
          ? "Inactive products won't be visible in the store."
          : "Featured products are highlighted on the storefront.";
      return (
        <label key={field.name} className="product-toggle">
          <input
            type="checkbox"
            checked={Boolean(form[field.name])}
            onChange={(event) => onChange(field.name, event.target.checked)}
          />
          <span className="product-toggle-copy">
            <strong>{field.label}</strong>
            <small>{description}</small>
          </span>
          <span className="product-toggle-switch" aria-hidden="true" />
        </label>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label key={field.name} className={`${field.wide ? "field-wide " : ""}checkbox-field`}>
          <input
            type="checkbox"
            checked={Boolean(form[field.name])}
            onChange={(event) => onChange(field.name, event.target.checked)}
          />
          {field.label}
        </label>
      );
    }

    const control =
      field.type === "textarea" ? (
        <textarea
          rows={4}
          required={field.required}
          value={form[field.name] ?? ""}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      ) : field.type === "category" ? (
        <select
          value={form[field.name] ?? ""}
          onChange={(event) => onChange(field.name, event.target.value)}
        >
          <option value="">Uncategorized</option>
          {(categories || []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.isActive ? "" : " (Inactive)"}
            </option>
          ))}
        </select>
      ) : field.type === "select" ? (
        <select
          required={field.required}
          value={form[field.name] ?? ""}
          onChange={(event) => onChange(field.name, event.target.value)}
        >
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type || "text"}
          min={field.min}
          max={field.max}
          step={field.step}
          required={field.required}
          value={form[field.name] ?? ""}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      );

    if (isProduct) {
      return (
        <label
          key={field.name}
          className={`product-form-field ${field.wide || field.name === "name" || field.name === "categoryId" ? "product-form-field-wide" : ""
            } product-form-field-${field.name}`}
        >
          <span className="product-form-label">
            {field.label}
            {field.required && <i aria-hidden="true">*</i>}
          </span>
          {control}
          {field.help && <small className="product-field-help">{field.help}</small>}
        </label>
      );
    }

    return (
      <label key={field.name} className={field.wide ? "field-wide" : ""}>
        {field.label}
        {control}
        {field.help && <small className="field-help">{field.help}</small>}
      </label>
    );
  }

  function renderProductFields(names) {
    return names.map((name) => {
      const field = fieldsByName.get(name);
      return field ? renderField(field) : null;
    });
  }

  if (isProduct) {
    return (
      <form className="product-editor-page" onSubmit={onSubmit}>
        <nav className="product-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" onClick={onClose}>
            <ArrowLeft size={15} aria-hidden="true" /> Products
          </button>
          <span aria-hidden="true">/</span>
          <span>{editing ? "Edit product" : "Add product"}</span>
        </nav>

        <header className="product-editor-header">
          <div className="product-editor-title">
            <span className="product-editor-mark">
              <Package size={22} aria-hidden="true" />
            </span>
            <div>
              {/* <p className="eyebrow">PRODUCT CATALOG</p> */}
              <h1>{editing ? "Edit Product" : "Add Product"}</h1>
              <p>
                {editing
                  ? "Update product details and inventory."
                  : "Create a new product for your store."}
              </p>
            </div>
          </div>
          <div className="product-editor-header-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update Product" : "Save Product"}
            </button>
          </div>
        </header>

        <div className="product-editor-layout">
          {/* LEFT COLUMN: General Information & Description/Specifications */}
          <div className="product-details-column">
            {/* General Information (Basic Details) */}
            <section className="product-details-card">
              <div className="product-section-heading">
                <span className="product-section-icon">
                  <Box size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2>Basic details</h2>
                  <p>Product identity, category and visibility.</p>
                </div>
              </div>
              <div className="product-form-grid">
                {renderProductFields(["name", "model", "brand", "categoryId"])}
                {/* Badge Field - Commented out
                <label className="product-form-field product-form-field-badge">
                  <span className="product-form-label">
                    Badge
                    {fieldsByName.get("badge")?.required && <i aria-hidden="true">*</i>}
                  </span>
                  <input
                    type="text"
                    value={form.badge ?? ""}
                    onChange={(event) => onChange("badge", event.target.value)}
                    placeholder="e.g. New, Sale, Popular"
                  />
                  {fieldsByName.get("badge")?.help && (
                    <small className="product-field-help">{fieldsByName.get("badge").help}</small>
                  )}
                </label>
                */}
              </div>
              <div className="product-toggle-grid">
                {renderProductFields(["isActive", "isFeatured"])}
              </div>
            </section>

            {/* Description & Specifications */}
            <section className="product-details-card">
              <div className="product-section-heading">
                <span className="product-section-icon">
                  <FileText size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2>Description & specifications</h2>
                  <p>Help customers understand the product.</p>
                </div>
              </div>
              <div className="product-form-grid">
                {renderProductFields(["description", "specifications"])}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Upload Images & Pricing/Stock */}
          <div className="product-details-column">
            {/* Upload Images (4 Slots: 1 Main + 3 Gallery) */}
            <aside className="product-media-card">
              <div className="product-section-heading">
                <span className="product-section-icon">
                  <Images size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2>Upload Images</h2>
                  <p>Upload a main image and up to 3 gallery photos.</p>
                </div>
              </div>

              {/* Main Image Slot - Required */}
              <div className="product-image-slot-container">
                <div className="product-image-slot-header">
                  <span className="product-image-slot-title">
                    Main Image <i className="required-asterisk" aria-hidden="true" style={{ color: "#EF4444", fontStyle: "normal", marginLeft: "3px" }}>*</i>
                  </span>
                  <span className="product-image-slot-badge is-required">Required</span>
                </div>
                <input
                  ref={mainInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMainFile(file);
                    e.target.value = "";
                  }}
                />
                <div
                  className={`product-upload-slot product-upload-slot-main ${mainPreview ? "has-image" : ""
                    } ${isDraggingMain ? "is-dragging" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingMain(true);
                  }}
                  onDragLeave={() => setIsDraggingMain(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingMain(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleMainFile(file);
                  }}
                  onClick={() => {
                    if (!mainPreview) mainInputRef.current?.click();
                  }}
                >
                  {mainPreview ? (
                    <div className="product-slot-preview-wrapper">
                      <img
                        src={mainPreview}
                        alt="Main product"
                        className="product-slot-preview-img"
                      />
                      <span className="product-main-image-tag">Main Image</span>
                      <div className="product-slot-actions">
                        <button
                          type="button"
                          className="product-slot-action-btn"
                          title="Replace image"
                          onClick={(e) => {
                            e.stopPropagation();
                            mainInputRef.current?.click();
                          }}
                        >
                          <RefreshCw size={13} /> Replace
                        </button>
                        <button
                          type="button"
                          className="product-slot-action-btn product-slot-remove-btn"
                          title="Remove image"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMainImage();
                          }}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="product-slot-empty">
                      <div className="product-slot-icon-circle">
                        <UploadCloud size={22} aria-hidden="true" />
                      </div>
                      <div className="product-slot-text">
                        <strong>Drag and drop main image here</strong>
                        <span>
                          or <span className="product-slot-browse">Browse Files</span>
                        </span>
                      </div>
                      <small>Supports JPG, PNG, WEBP · Max 8MB</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images Slots - Optional */}
              <div className="product-image-slot-container product-gallery-slots-container">
                <div className="product-image-slot-header">
                  <span className="product-image-slot-title">Gallery Images</span>
                  <span className="product-image-slot-hint">Up to 3 images · Optional</span>
                </div>
                <div className="product-gallery-grid">
                  {[0, 1, 2].map((index) => {
                    const preview = galleryPreviews[index];
                    return (
                      <div key={index} className="product-gallery-slot-item">
                        <span className="product-gallery-slot-label">
                          Image {index + 1}
                        </span>
                        <input
                          ref={(el) => {
                            galleryInputRefs.current[index] = el;
                          }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleGalleryFile(index, file);
                            e.target.value = "";
                          }}
                        />
                        <div
                          className={`product-upload-slot product-upload-slot-gallery ${preview ? "has-image" : ""
                            } ${draggingGallery === index ? "is-dragging" : ""}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDraggingGallery(index);
                          }}
                          onDragLeave={() => setDraggingGallery(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDraggingGallery(null);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleGalleryFile(index, file);
                          }}
                          onClick={() => {
                            if (!preview) galleryInputRefs.current[index]?.click();
                          }}
                        >
                          {preview ? (
                            <div className="product-slot-preview-wrapper">
                              <img
                                src={preview}
                                alt={`Gallery ${index + 1}`}
                                className="product-slot-preview-img"
                              />
                              <div className="product-slot-actions product-slot-actions-gallery">
                                <button
                                  type="button"
                                  className="product-slot-action-btn"
                                  title="Replace"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    galleryInputRefs.current[index]?.click();
                                  }}
                                >
                                  <RefreshCw size={12} />
                                </button>
                                <button
                                  type="button"
                                  className="product-slot-action-btn product-slot-remove-btn"
                                  title="Remove"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeGalleryImage(index);
                                  }}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="product-slot-empty product-slot-empty-gallery">
                              <ImagePlus size={20} aria-hidden="true" />
                              <span>Upload</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Pricing & Stock Card - Directly below Upload Images */}
            <section className="product-details-card">
              <div className="product-section-heading">
                <span className="product-section-icon">
                  <CircleDollarSign size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2>Pricing & stock</h2>
                  <p>Set the selling price and available inventory.</p>
                </div>
                <span className="product-required-chip">Required</span>
              </div>
              <div className="product-form-grid product-pricing-grid">
                {renderProductFields(["price", "discountPrice", "stock"])}
              </div>
            </section>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form className="editor-card" onSubmit={onSubmit}>
      <header className="product-editor-header" style={{ borderBottom: "1px solid var(--crm-border)", paddingBottom: "20px", marginBottom: "24px" }}>
        <div className="product-editor-title">
          <div>
            <p className="eyebrow">{editing ? "EDIT RECORD" : "NEW RECORD"}</p>
            <h1>{editing ? `Edit ${config?.singular}` : `Add ${config?.singular}`}</h1>
          </div>
        </div>
        <div className="product-editor-header-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : `Create ${config?.singular}`}
          </button>
        </div>
      </header>
      <div className="form-grid">
        {fields.map((field) =>
          field.type === "image-upload" ? (
            <label key={field.name} className={field.wide ? "field-wide" : ""}>
              {field.label}
              <span className="image-upload-control">
                <ImagePlus size={17} /> Select {field.multiple === false ? "image" : "images"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple={field.multiple !== false}
                  onChange={(event) => onChange(field.name, Array.from(event.target.files || []))}
                />
              </span>
              {form[field.name]?.length > 0 && (
                <small className="field-help">
                  {form[field.name].map((file) => file.name).join(", ")}
                </small>
              )}
              {field.help && <small className="field-help">{field.help}</small>}
            </label>
          ) : (
            renderField(field)
          )
        )}
      </div>
    </form>
  );
}

export default AddProduct;
