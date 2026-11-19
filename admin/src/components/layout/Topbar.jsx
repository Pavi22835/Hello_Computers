import { ChevronRight, ShieldCheck } from "lucide-react";

function Topbar({ section, group, user }) {
  return (
    <header className="topbar">
      <div className="topbar-context">
        <span className="topbar-kicker">ADMIN WORKSPACE</span>
        <div className="breadcrumbs">
          <span>{group?.label ?? "Workspace"}</span>
          {section && group?.label !== section.label && (
            <><ChevronRight size={15} aria-hidden="true" /><strong>{section.label}</strong></>
          )}
        </div>
      </div>
      <div className="topbar-right">
        <span className="topbar-status"><span className="live-dot" /><ShieldCheck size={16} aria-hidden="true" /> Secure admin session</span>
        <div className="topbar-user">
          <span className="avatar avatar-small">{user.name?.slice(0, 1).toUpperCase()}</span>
          <span className="topbar-user-copy">{user.name}<small>Administrator</small></span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
