import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { navigationGroups } from "../../routes/adminNavigation";

function AdminLayout({ sections, section, stats, user, onNavigate, onLogout, notice, noticeError, api, children }) {
  const activeSection = sections.find((item) => item.id === section);
  const activeGroup = navigationGroups.find((group) => group.sectionIds.includes(section));

  return (
    <div className="admin-shell">
      <Sidebar sections={sections} navigationGroups={navigationGroups} section={section} stats={stats} user={user} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="main-panel">
        <Topbar section={activeSection} group={activeGroup} user={user} onNavigate={onNavigate} onLogout={onLogout} api={api} />
        {notice && <div className={`toast ${noticeError ? "toast-error" : ""}`} role="status">{notice}</div>}
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
