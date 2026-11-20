import { ImagePlus, X } from "lucide-react";

function AddProduct({ config, form, editing, saving, categories, onClose, onChange, onSubmit }) {
  if (!form) return null;

  return (
    <form className="editor-card" onSubmit={onSubmit}>
      <div className="editor-heading"><div><p className="eyebrow">{editing ? "EDIT RECORD" : "NEW RECORD"}</p><h2>{editing ? `Edit ${config.singular}` : `Add ${config.singular}`}</h2></div><button type="button" className="icon-button" aria-label="Close form" onClick={onClose}><X size={18} aria-hidden="true" /></button></div>
      <div className="form-grid">
        {config.fields.filter((field) => !(editing && field.createOnly) && !(!editing && field.editOnly)).map((field) => <label key={field.name} className={`${field.wide ? "field-wide" : ""} ${field.type === "checkbox" ? "checkbox-field" : ""}`}>
          {field.type === "checkbox" ? <><input type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => onChange(field.name, event.target.checked)} />{field.label}</> : <>{field.label}
            {field.type === "textarea" ? <textarea rows="3" required={field.required} value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)} /> : field.type === "image-upload" ? <><span className="image-upload-control"><ImagePlus size={17} /> Select {field.multiple === false ? "image" : "images"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={field.multiple !== false} onChange={(event) => onChange(field.name, Array.from(event.target.files || []))} /></span>{form[field.name]?.length > 0 && <small className="field-help">{form[field.name].map((file) => file.name).join(", ")}</small>}</> : field.type === "category" ? <select value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.isActive ? "" : " (Inactive)"}</option>)}</select> : field.type === "select" ? <select required={field.required} value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)}>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input type={field.type || "text"} min={field.min} max={field.max} step={field.step} required={field.required} value={form[field.name] ?? ""} onChange={(event) => onChange(field.name, event.target.value)} />}
            {field.help && <small className="field-help">{field.help}</small>}
          </>}
        </label>)}
      </div>
      <div className="editor-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : `Create ${config.singular}`}</button></div>
    </form>
  );
}

export default AddProduct;
