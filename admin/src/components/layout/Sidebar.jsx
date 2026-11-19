import { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

function Sidebar({ sections, navigationGroups, section, stats, user, onNavigate, onLogout }) {
  const activeGroupId = navigationGroups.find((group) => group.sectionIds.includes(section))?.id ?? "";
  const [expansion, setExpansion] = useState({ sectionGroup: "", groupId: "" });
  const hasExpansionOverride = expansion.sectionGroup === activeGroupId;

  const sectionById = new Map(sections.map((item) => [item.id, item]));

  return (
    <aside className="sidebar">
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); onNavigate("dashboard"); }}>
        <span className="brand-mark">HC</span><span>Hello Computers<small>Store administration</small></span>
      </a>
      <p className="nav-caption">WORKSPACE</p>
      <nav className="sidebar-nav" aria-label="Admin sections">
        {navigationGroups.map((group) => {
          const Icon = group.icon;
          const isActive = group.sectionIds.includes(section);
          const isExpanded = hasExpansionOverride
            ? expansion.groupId === group.id
            : group.id === activeGroupId;
          const submenuId = `sidebar-submenu-${group.id}`;

          return (
            <section key={group.id} className={`nav-group ${isActive ? "nav-group-active" : ""} ${isExpanded ? "nav-group-expanded" : ""}`}>
              <button
                type="button"
                className="nav-module"
                aria-expanded={isExpanded}
                aria-controls={submenuId}
                onClick={() => setExpansion({
                  sectionGroup: activeGroupId,
                  groupId: isExpanded ? "" : group.id,
                })}
              >
                <span className="nav-module-icon"><Icon size={18} aria-hidden="true" /></span>
                <span className="nav-module-label">{group.label}</span>
                <ChevronDown className="nav-module-chevron" size={16} aria-hidden="true" />
              </button>
              <div id={submenuId} className={`nav-submenu ${isExpanded ? "nav-submenu-open" : ""}`} aria-hidden={!isExpanded}>
                <div className="nav-submenu-inner">
                  {group.sectionIds.map((sectionId) => {
                    const item = sectionById.get(sectionId);
                    if (!item) return null;
                    const ItemIcon = item.icon;
                    const itemIsActive = section === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`nav-sub-link ${itemIsActive ? "nav-sub-link-active" : ""}`}
                        aria-current={itemIsActive ? "page" : undefined}
                        tabIndex={isExpanded ? 0 : -1}
                        onClick={() => onNavigate(item.id)}
                      >
                        <ItemIcon size={16} aria-hidden="true" />
                        <span>{item.label}</span>
                        {item.id === "enquiries" && stats.newEnquiries > 0 && <span className="nav-count">{stats.newEnquiries}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="profile-chip"><span className="avatar">{user.name?.slice(0, 1).toUpperCase()}</span><span>{user.name}<small>Administrator</small></span></div>
        <button className="logout-button" onClick={onLogout}>Sign out <ArrowUpRight size={16} aria-hidden="true" /></button>
      </div>
    </aside>
  );
}

export default Sidebar;
