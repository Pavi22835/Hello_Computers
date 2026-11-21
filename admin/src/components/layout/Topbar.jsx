import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, LogOut, Settings, UserRound } from "lucide-react";
import GlobalSearch from "../common/GlobalSearch";

function Topbar({ section, group, user, onNavigate, onLogout, api }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleProfileClick = () => {
    setDropdownOpen(false);
    onNavigate("admin-profile");
  };

  const handleSettingsClick = () => {
    setDropdownOpen(false);
    onNavigate("settings");
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

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
      <GlobalSearch onNavigate={onNavigate} api={api} />
      <div className="topbar-right">
        <div className="topbar-user-menu" ref={menuRef}>
          <button
            type="button"
            className={`topbar-user ${dropdownOpen ? "topbar-user-active" : ""}`}
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <span className="avatar avatar-small">{user?.name?.slice(0, 1).toUpperCase()}</span>
            <span className="topbar-user-copy">{user?.name}<small>Administrator</small></span>
            <ChevronDown size={14} className={`topbar-user-chevron ${dropdownOpen ? "is-open" : ""}`} aria-hidden="true" />
          </button>

          {dropdownOpen && (
            <div className="topbar-dropdown" role="menu">
              {/* 
              <button
                type="button"
                className="topbar-dropdown-item"
                role="menuitem"
                onClick={handleProfileClick}
              >
                <UserRound size={16} aria-hidden="true" />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                className="topbar-dropdown-item"
                role="menuitem"
                onClick={handleSettingsClick}
              >
                <Settings size={16} aria-hidden="true" />
                <span>Account Settings</span>
              </button>
              <div className="topbar-dropdown-divider" role="separator" /> 
              */}
              <button
                type="button"
                className="topbar-dropdown-item topbar-dropdown-item-danger"
                role="menuitem"
                onClick={handleLogoutClick}
              >
                <LogOut size={16} aria-hidden="true" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
