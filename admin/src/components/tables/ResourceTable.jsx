import { Eye, Pencil, Trash2 } from "lucide-react";

function ResourceTable({ config, items, onView, onEdit, onDelete }) {
  return (
    <div className="table-scroll">
      <table>
        <thead><tr>{config.columns.map((column) => <th key={column.label}>{column.label}</th>)}<th className="actions-heading">Actions</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {config.columns.map((column) => <td key={column.label}>{column.render(item)}</td>)}
              <td><div className="row-actions">
                {config.viewable && <button className="row-view" onClick={() => onView(item)} aria-label={`View ${item.name}`} title="View"><Eye size={15} /></button>}
                <button className="row-edit" onClick={() => onEdit(item)} aria-label={`Edit ${item.name || item.title}`} title="Edit"><Pencil size={15} /></button>
                {config.deletable !== false && <button className="row-delete" onClick={() => onDelete(item)} aria-label={`Delete ${item.name || item.title}`} title="Delete"><Trash2 size={15} /></button>}
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResourceTable;
