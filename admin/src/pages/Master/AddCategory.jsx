import { useEffect, useState } from "react";
import { ArrowLeft, Check, ImagePlus, Layers3, Trash2 } from "lucide-react";
import "../../styles/Categories.css";

function CategoryImageField({ form, onChange }) {
  const [uploadedPreview, setUploadedPreview] = useState("");
  const selectedFile = form?.imageFiles?.[0];

  useEffect(() => () => {
    if (uploadedPreview) URL.revokeObjectURL(uploadedPreview);
  }, [uploadedPreview]);

  function selectImage(event) {
    const file = event.target.files?.[0];
    setUploadedPreview(file ? URL.createObjectURL(file) : "");
    onChange("imageFiles", file ? [file] : []);
  }

  function handleFile(file) {
    if (!file) return;
    setUploadedPreview(URL.createObjectURL(file));
    onChange("imageFiles", [file]);
  }

  function removeImage() {
    setUploadedPreview("");
    onChange("imageFiles", []);
    onChange("imageUrl", "");
  }

  const imageSource = uploadedPreview || form?.imageUrl;

  return (
    <div className="category-image-content">
      <div
        className={`category-image-preview ${imageSource ? "has-image" : ""}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
      >
        {imageSource ? (
          <img src={imageSource} alt="Category preview" />
        ) : (
          <div>
            <ImagePlus size={40} />
            <span>Image preview</span>
          </div>
        )}
      </div>
      {selectedFile && <p className="category-image-filename" title={selectedFile.name}>{selectedFile.name}</p>}
      <div className="category-image-actions">
        <label className="category-upload-control">
          <ImagePlus size={16} />
          <span>{imageSource ? "Replace image" : "Upload image"}</span>
          <input
            aria-label={imageSource ? "Replace category image" : "Upload category image"}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={selectImage}
          />
        </label>
        {imageSource && (
          <button type="button" className="category-remove-image" onClick={removeImage}>
            <Trash2 size={15} />Remove
          </button>
        )}
      </div>
      <small className="category-image-help">JPEG, PNG, WebP or AVIF.</small>
    </div>
  );
}

function AddCategory({ form, editing, saving, onClose, onChange, onSubmit }) {
  const currentForm = form || { name: "", slug: "", imageUrl: "", imageFiles: [], description: "", isActive: true };

  return (
    <section className="categories-page">
      <form className="category-editor-form" onSubmit={onSubmit}>
        <nav className="categories-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" onClick={onClose}>
            <ArrowLeft size={15} /> Categories
          </button>
          <span aria-hidden="true">/</span>
          <span>{editing ? "Edit category" : "Add category"}</span>
        </nav>

        <header className="categories-heading">
          <div className="category-editor-title">
            {/* <p className="eyebrow">STORE MANAGEMENT</p> */}
            <h1>{editing ? "Edit Category" : "Add Category"}</h1>
            <p>{editing ? "Update the category details below." : "Create a category to organize your products."}</p>
          </div>
          <div className="category-editor-header-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update Category" : "Save Category"}
            </button>
          </div>
        </header>

        <div className="category-form-grid">
          <section className="category-form-card">
            <div className="category-section-heading">
              <span className="category-section-icon">
                <Layers3 size={18} />
              </span>
              <div>
                <h2>Category information</h2>
                <p>Set the name and details customers will see.</p>
              </div>
            </div>

            <div className="category-fields-stack">
              <label className="category-field">
                Category name
                <input
                  autoFocus
                  required
                  value={currentForm.name ?? ""}
                  onChange={(event) => onChange("name", event.target.value)}
                  placeholder="e.g. Laptops"
                />
              </label>

              <label className="category-field">
                Slug
                <input
                  value={currentForm.slug ?? ""}
                  onChange={(event) => onChange("slug", event.target.value)}
                  placeholder="e.g. laptops"
                />
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
                <textarea
                  rows="4"
                  value={currentForm.description ?? ""}
                  onChange={(event) => onChange("description", event.target.value)}
                  placeholder="Describe this category for your store."
                />
              </label>
            </div>
          </section>

          <section className="category-form-card category-settings-card">
            <div className="category-section-heading">
              <span className="category-section-icon">
                <ImagePlus size={18} />
              </span>
              <div>
                <h2>Category image & settings</h2>
                <p>Set an image and control store visibility.</p>
              </div>
            </div>
            <CategoryImageField form={currentForm} onChange={onChange} />
            <div className="category-status-setting">
              <div>
                <h3>
                  <Check size={16} />Status
                </h3>
                <p>Choose whether this category is available in your store.</p>
              </div>
              <div className="category-status-control" role="group" aria-label="Category status">
                <button
                  type="button"
                  className={currentForm.isActive ? "is-selected" : ""}
                  aria-pressed={Boolean(currentForm.isActive)}
                  onClick={() => onChange("isActive", true)}
                >
                  <span className="category-status-dot category-status-dot-active" />Active
                </button>
                <button
                  type="button"
                  className={!currentForm.isActive ? "is-selected" : ""}
                  aria-pressed={!currentForm.isActive}
                  onClick={() => onChange("isActive", false)}
                >
                  <span className="category-status-dot category-status-dot-inactive" />Inactive
                </button>
              </div>
            </div>
          </section>
        </div>
      </form>
    </section>
  );
}

export { CategoryImageField, AddCategory };
export default AddCategory;
