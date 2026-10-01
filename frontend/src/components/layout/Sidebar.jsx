import {
    LayoutDashboard,
    ClipboardList,
    UserCircle,
    LogOut,
    X,
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
        // Close sidebar on mobile after selecting a page
        if (onClose) {
            onClose();
        }
    };

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

                {/* Mobile close button */}
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

                <NavLink
                    to="/dashboard"
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <LayoutDashboard size={19} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/mock-tests"
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <ClipboardList size={19} />
                    <span>Mock Tests</span>
                </NavLink>

                <NavLink
                    to="/profile"
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <UserCircle size={19} />
                    <span>Profile</span>
                </NavLink>

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