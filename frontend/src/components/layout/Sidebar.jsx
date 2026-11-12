import {
    LayoutDashboard,
    ClipboardList,
    UserCircle,
    LogOut,
    X,
    BookOpen,
    PlayCircle,
    GraduationCap,
    Sparkles,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const studentData = localStorage.getItem("student");
    let student = null;
    try {
        student = studentData ? JSON.parse(studentData) : null;
    } catch (e) {
        student = null;
    }

    const userName = student?.name || student?.username || "Student User";
    const userEmail = student?.email || "student@prepflow.com";
    const studentInitial = (userName || userEmail).charAt(0).toUpperCase();

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
            aria-label="Student Navigation"
        >
            {/* Top Container */}
            <div className="sidebar-top-section">
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="sidebar-brand-icon">
                            <GraduationCap size={22} strokeWidth={2.2} />
                        </div>

                        <div className="sidebar-brand-text">
                            <div className="sidebar-brand-name-row">
                                <h2>PrepFlow</h2>
                                <span className="sidebar-badge">Student</span>
                            </div>
                            <span className="sidebar-brand-sub">Assessment Platform</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="sidebar-close-button"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation Label */}
                <div className="sidebar-nav-section-label">WORKSPACE</div>

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
                                <span className="sidebar-link-icon-wrap">
                                    <Icon size={18} strokeWidth={2} />
                                </span>
                                <span className="sidebar-link-label">{item.label}</span>
                                <span className="sidebar-active-indicator" />
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Group: AI Callout + Dedicated Account Profile */}
            <div className="sidebar-bottom-group">
                {/* Refined AI Assistant Card */}
                <div className="sidebar-ai-callout">
                    <div className="sidebar-ai-callout-icon-wrap" aria-hidden="true">
                        <Sparkles size={16} strokeWidth={2.2} />
                    </div>
                    <div className="sidebar-ai-callout-body">
                        <h4 className="sidebar-ai-callout-title">Need help with a question?</h4>
                        <p className="sidebar-ai-callout-text">
                            Your AI Tutor is always available to explain concepts, solve doubts, and support your preparation.
                        </p>
                    </div>
                </div>

                {/* Dedicated Non-Overlapping Account Section */}
                <div className="sidebar-account-section">
                    <div className="sidebar-account-user">
                        <div className="sidebar-account-avatar" aria-hidden="true">
                            {studentInitial}
                        </div>

                        <div className="sidebar-account-details">
                            <span className="sidebar-account-name" title={userName}>
                                {userName}
                            </span>
                            <span className="sidebar-account-email" title={userEmail}>
                                {userEmail}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="sidebar-account-signout-btn"
                        title="Sign out of PrepFlow"
                        aria-label="Sign Out"
                    >
                        <LogOut size={16} strokeWidth={2} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
