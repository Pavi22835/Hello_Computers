import { Eye, Pencil, Trash2 } from "lucide-react";

function ResourceTable({ config, items, onView, onEdit, onDelete }) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="table-scroll">
      <table>
        <thead><tr>{config.columns.map((column) => <th key={column.label}>{column.label}</th>)}<th className="actions-heading">Actions</th></tr></thead>
        <tbody>
          {safeItems.map((item) => (
            <tr key={item.id}>
              {config.columns.map((column) => <td key={column.label}>{column.render(item)}</td>)}
              <td><div className="row-actions">
                {config.viewable && <button className="row-view" onClick={() => onView(item)} aria-label={`View ${item.name}`} title="View"><Eye size={22} /></button>}
                <button className="row-edit" onClick={() => onEdit(item)} aria-label={`Edit ${item.name || item.title}`} title="Edit"><Pencil size={22} /></button>
                {config.deletable !== false && <button className="row-delete" onClick={() => onDelete(item)} aria-label={`Delete ${item.name || item.title}`} title="Delete"><Trash2 size={22} /></button>}
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResourceTable;
