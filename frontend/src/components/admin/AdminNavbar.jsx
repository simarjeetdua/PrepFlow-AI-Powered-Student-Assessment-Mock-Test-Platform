
import { Menu, Bell, ChevronRight, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import "./AdminNavbar.css";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/notes": "Notes & PDFs",
  "/admin/videos": "Video Lessons",
  "/admin/tests": "Mock Tests",
  "/admin/users": "Manage Users",
  "/admin/performance": "Student Performance",
};

const AdminNavbar = ({ onMenuClick = () => {} }) => {
  const location = useLocation();

  const currentTitle =
    pageTitles[location.pathname] || "Admin Panel";

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <button
          type="button"
          className="admin-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="admin-breadcrumb">
          <span className="admin-breadcrumb-root">PrepFlow</span>
          <ChevronRight size={15} />
          <span className="admin-breadcrumb-current">
            {currentTitle}
          </span>
        </div>
      </div>

      <div className="admin-navbar-right">
        <button
          type="button"
          className="admin-navbar-icon-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
        </button>

        <div className="admin-navbar-divider" />

        <div className="admin-navbar-user">
          <div className="admin-navbar-avatar">
            <ShieldCheck size={19} />
          </div>

          <div className="admin-navbar-user-info">
            <strong>Administrator</strong>
            <span>Admin account</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
