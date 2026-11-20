import { useEffect, useRef, useState } from "react";
import {
  Box,
  CircleDollarSign,
  FileText,
  Image,
  ImagePlus,
  Images,
  Package,
  X,
} from "lucide-react";

function AddProduct({ config, form, editing, saving, categories, onClose, onChange, onSubmit }) {
  const [filePreviewUrls, setFilePreviewUrls] = useState([]);
  const [activeImageUrl, setActiveImageUrl] = useState("");
  const previewObjectUrls = useRef([]);
  const isProduct = config.singular === "product";
  const imageFiles = Array.isArray(form?.imageFiles) ? form.imageFiles : [];

  useEffect(() => () => {
    previewObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  if (!form) return null;

  const fields = config.fields.filter((field) => !(editing && field.createOnly) && !(!editing && field.editOnly));
  const fieldsByName = new Map(fields.map((field) => [field.name, field]));
  const previewImages = [];
  const seenImageUrls = new Set();
  const addPreview = (image) => {
    if (!image.url || seenImageUrls.has(image.url)) return;
    seenImageUrls.add(image.url);
    previewImages.push(image);
  };

  if (isProduct) {
    addPreview({ url: form.imageUrl, label: "Primary image", isPrimary: true });
    const manualImageUrls = String(form.images ?? "").split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
    filePreviewUrls.forEach((url, index) => {
      addPreview({
        url,
        label: imageFiles[index]?.name || `New image ${index + 1}`,
        fileIndex: index,
        isPrimary: !form.imageUrl && index === 0,
      });
    });
    manualImageUrls.forEach((url, index) => {
      addPreview({ url, label: "Product image", isPrimary: !form.imageUrl && filePreviewUrls.length === 0 && index === 0 });
    });
  }

  const activeImage = previewImages.find((image) => image.url === activeImageUrl) || previewImages[0];

  function renderField(field) {
    if (isProduct && field.type === "checkbox") {
      const description = field.name === "isActive"
        ? "Inactive products won't be visible in the store."
        : "Featured products are highlighted on the storefront.";
      return (
        <label key={field.name} className="product-toggle">
          <input type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => onChange(field.name, event.target.checked)} />
          <span className="product-toggle-copy"><strong>{field.label}</strong><small>{description}</small></span>
          <span className="product-toggle-switch" aria-hidden="true" />
        </label>
      );
    }

    if (field.type === "checkbox") {
      return <label key={field.name} className={`${field.wide ? "field-wide " : ""}checkbox-field`}><input type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => onChange(field.name, event.target.checked)} />{field.label}</label>;
    }

    const control = field.type === "textarea"
      ? <textarea rows={isProduct ? field.name === "images" ? 3 : 4 : 3} required={field.required} value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)} />
      : field.type === "category"
        ? <select value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.isActive ? "" : " (Inactive)"}</option>)}</select>
        : field.type === "select"
          ? <select required={field.required} value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)}>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
          : <input type={field.type || "text"} min={field.min} max={field.max} step={field.step} required={field.required} value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)} />;

    if (isProduct) {
      return (
        <label key={field.name} className={`product-form-field ${field.wide ? "product-form-field-wide" : ""}`}>
          <span className="product-form-label">{field.label}{field.required && <i aria-hidden="true">*</i>}</span>
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

  function replaceSelectedFiles(files) {
    previewObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    const urls = files.map((file) => URL.createObjectURL(file));
    previewObjectUrls.current = urls;
    setFilePreviewUrls(urls);
    setActiveImageUrl(urls[0] || "");
    onChange("imageFiles", files);
  }

  function removeSelectedFile(fileIndex) {
    const removedUrl = previewObjectUrls.current[fileIndex];
    if (removedUrl) URL.revokeObjectURL(removedUrl);
    const urls = previewObjectUrls.current.filter((_, index) => index !== fileIndex);
    previewObjectUrls.current = urls;
    setFilePreviewUrls(urls);
    onChange("imageFiles", imageFiles.filter((_, index) => index !== fileIndex));
    if (activeImageUrl === removedUrl) setActiveImageUrl(urls[0] || "");
  }

  if (isProduct) {
    const uploadField = fieldsByName.get("imageFiles");
    const imageAlt = form.name ? `${form.name} preview` : "Product image preview";

    return (
      <form className="product-editor-page" onSubmit={onSubmit}>
        <header className="product-editor-header">
          <div className="product-editor-title">
            <span className="product-editor-mark"><Package size={20} aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">PRODUCT CATALOG</p>
              <h1>{editing ? "Edit Product" : "Add Product"}</h1>
              <p>{editing ? "Update product details and inventory." : "Create a new product for your store."}</p>
            </div>
          </div>
          <button type="button" className="icon-button" aria-label="Close form" onClick={onClose}><X size={18} aria-hidden="true" /></button>
        </header>

        <div className="product-editor-layout">
          <div className="product-details-column">
            <section className="product-details-card">
              <div className="product-section-heading">
                <span className="product-section-icon"><Box size={17} aria-hidden="true" /></span>
                <div><h2>Basic details</h2><p>Product identity, category and visibility.</p></div>
              </div>
              <div className="product-form-grid">
                {renderProductFields(["name", "model", "brand", "categoryId", "badge"])}
              </div>
              <div className="product-toggle-grid">
                {renderProductFields(["isActive", "isFeatured"])}
              </div>
            </section>

            <section className="product-details-card">
              <div className="product-section-heading">
                <span className="product-section-icon"><FileText size={17} aria-hidden="true" /></span>
                <div><h2>Description & specifications</h2><p>Help customers understand the product.</p></div>
              </div>
              <div className="product-form-grid">
                {renderProductFields(["description", "specifications"])}
              </div>
            </section>

            <section className="product-details-card">
              <div className="product-section-heading">
                <span className="product-section-icon"><CircleDollarSign size={17} aria-hidden="true" /></span>
                <div><h2>Pricing & stock</h2><p>Set the selling price and available inventory.</p></div>
                <span className="product-required-chip">Required</span>
              </div>
              <div className="product-form-grid">
                {renderProductFields(["price", "discountPrice", "stock"])}
              </div>
            </section>
          </div>

          <aside className="product-media-card">
            <div className="product-section-heading">
              <span className="product-section-icon"><Images size={17} aria-hidden="true" /></span>
              <div><h2>Product images</h2><p>Upload a main image and gallery photos.</p></div>
            </div>

            <label
              className="product-upload-zone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                replaceSelectedFiles(Array.from(event.dataTransfer.files || []));
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple={uploadField?.multiple !== false}
                onChange={(event) => {
                  replaceSelectedFiles(Array.from(event.currentTarget.files || []));
                  event.currentTarget.value = "";
                }}
              />
              <ImagePlus size={27} aria-hidden="true" />
              <strong>Drag and drop images here</strong>
              <span className="product-upload-or">or</span>
              <span className="product-upload-button">Choose Files</span>
              <small>Supports JPG, PNG, WebP or AVIF · Max 10 images</small>
            </label>

            <div className="product-image-gallery">
              <div className="product-image-preview-heading">
                <h3>Image Preview</h3>
                <span>Select a thumbnail to preview it larger.</span>
              </div>
              <div className="product-image-main">
                {activeImage
                  ? <img src={activeImage.url} alt={imageAlt} />
                  : <div className="product-image-empty"><Image size={34} aria-hidden="true" /><strong>No images selected</strong><span>Upload product images to see a preview.</span></div>}
                {activeImage?.isPrimary && <span className="product-main-image-badge">Main image</span>}
              </div>
              {previewImages.length > 0 && (
                <div className="product-image-thumbnails" aria-label="Product image previews">
                  {previewImages.map((image) => (
                    <div className={`product-image-thumbnail ${activeImage?.url === image.url ? "is-selected" : ""}`} key={image.url}>
                      <button type="button" aria-label={`Preview ${image.label}`} onClick={() => setActiveImageUrl(image.url)}>
                        <img src={image.url} alt="" />
                      </button>
                      {image.fileIndex != null && <button type="button" className="product-image-remove" aria-label={`Remove ${image.label}`} onClick={() => removeSelectedFile(image.fileIndex)}><X size={13} aria-hidden="true" /></button>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {imageFiles.length > 0 && <p className="product-upload-count">{imageFiles.length} new {imageFiles.length === 1 ? "image" : "images"} selected</p>}
            <details className="product-manual-image-fields">
              <summary>Enter image URLs manually</summary>
              {renderProductFields(["imageUrl", "images"])}
            </details>
          </aside>
        </div>

        <footer className="product-editor-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving…" : editing ? "Update Product" : "Save Product"}</button>
        </footer>
      </form>
    );
  }

  return (
    <form className="editor-card" onSubmit={onSubmit}>
      <div className="editor-heading"><div><p className="eyebrow">{editing ? "EDIT RECORD" : "NEW RECORD"}</p><h2>{editing ? `Edit ${config.singular}` : `Add ${config.singular}`}</h2></div><button type="button" className="icon-button" aria-label="Close form" onClick={onClose}><X size={18} aria-hidden="true" /></button></div>
      <div className="form-grid">
        {fields.map((field) => field.type === "image-upload"
          ? <label key={field.name} className={field.wide ? "field-wide" : ""}>
            {field.label}<span className="image-upload-control"><ImagePlus size={17} /> Select {field.multiple === false ? "image" : "images"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={field.multiple !== false} onChange={(event) => onChange(field.name, Array.from(event.target.files || []))} /></span>{form[field.name]?.length > 0 && <small className="field-help">{form[field.name].map((file) => file.name).join(", ")}</small>}{field.help && <small className="field-help">{field.help}</small>}
          </label>
          : renderField(field))}
      </div>
      <div className="editor-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : `Create ${config.singular}`}</button></div>
    </form>
  );
}

export default AddProduct;
