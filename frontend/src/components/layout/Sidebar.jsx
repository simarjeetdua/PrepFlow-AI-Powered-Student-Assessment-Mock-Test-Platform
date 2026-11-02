
import {
    LayoutDashboard,
    ClipboardList,
    UserCircle,
    LogOut,
    X,
    BookOpen,
    PlayCircle,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("student");

        navigate("/login");
    };

    const handleNavigation = () => {
        if (onClose) {
            onClose();
        }
    };

    const navigationItems = [
        {
            path: "/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            path: "/notes",
            label: "Study Materials",
            icon: BookOpen,
        },
        {
            path: "/videos",
            label: "Video Lessons",
            icon: PlayCircle,
        },
        {
            path: "/mock-tests",
            label: "Mock Tests",
            icon: ClipboardList,
        },
        {
            path: "/profile",
            label: "Profile",
            icon: UserCircle,
        },
    ];

    return (
        <aside
            className={`dashboard-sidebar ${
                isOpen ? "sidebar-open" : ""
            }`}
        >
            {/* Sidebar Header */}
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="sidebar-logo">
                        S
                    </div>

                    <div>
                        <h2>Student Portal</h2>
                        <span>Mock Test System</span>
                    </div>
                </div>

                <button
                    type="button"
                    className="sidebar-close-button"
                    onClick={onClose}
                    aria-label="Close sidebar"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar-navigation">
                {navigationItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={handleNavigation}
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >
                            <Icon size={19} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="logout-button"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
