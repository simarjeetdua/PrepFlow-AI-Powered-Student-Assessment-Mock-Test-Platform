
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Video,
  ClipboardList,
  Users,
  ChartNoAxesColumn,
  GraduationCap,
  X,
  LogOut,
} from "lucide-react";

import "./AdminSidebar.css";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Notes & PDFs",
    path: "/admin/notes",
    icon: FileText,
  },
  {
    label: "Video Lessons",
    path: "/admin/videos",
    icon: Video,
  },
  {
    label: "Mock Tests",
    path: "/admin/tests",
    icon: ClipboardList,
  },
  {
    label: "Manage Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Student Performance",
    path: "/admin/performance",
    icon: ChartNoAxesColumn,
  },
];

const AdminSidebar = ({ isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`admin-sidebar ${isOpen ? "admin-sidebar-open" : ""}`}
      aria-label="Admin navigation"
    >
      <div className="admin-sidebar-header">
        <NavLink
          to="/admin"
          end
          className="admin-brand"
          onClick={onClose}
        >
          <span className="admin-brand-icon">
            <GraduationCap size={25} />
          </span>

          <span className="admin-brand-text">
            <strong>PrepFlow</strong>
            <small>Admin Panel</small>
          </span>
        </NavLink>

        <button
          type="button"
          className="admin-sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="admin-sidebar-section">
        <span className="admin-sidebar-label">WORKSPACE</span>

        <nav className="admin-sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-profile">
          <div className="admin-profile-avatar">
            <GraduationCap size={20} />
          </div>

          <div className="admin-profile-info">
            <strong>Administrator</strong>
            <span>PrepFlow Admin</span>
          </div>
        </div>

        <button
          type="button"
          className="admin-logout-button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
