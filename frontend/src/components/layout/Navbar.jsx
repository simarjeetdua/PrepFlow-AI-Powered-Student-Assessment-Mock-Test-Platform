import { Menu, ChevronRight, GraduationCap, CheckCircle2 } from "lucide-react";
import { useLocation } from "react-router-dom";

const pageTitleMap = {
    "/dashboard": "Dashboard",
    "/notes": "Study Materials",
    "/videos": "Video Lessons",
    "/mock-tests": "Mock Tests",
    "/profile": "Student Profile",
};

const Navbar = ({ onMenuClick }) => {
    const location = useLocation();
    const studentData = localStorage.getItem("student");

    let student = null;
    try {
        student = studentData ? JSON.parse(studentData) : null;
    } catch (error) {
        console.error("Failed to parse student data:", error);
    }

    const currentTitle =
        pageTitleMap[location.pathname] ||
        (location.pathname.startsWith("/mock-tests/")
            ? "Assessment"
            : "Student Portal");

    const userName = student?.name || student?.username || (student?.email ? student.email.split("@")[0] : "Student User");
    const userRole = student?.role
        ? student.role.charAt(0).toUpperCase() + student.role.slice(1).toLowerCase()
        : "Student";
    const isVerified = Boolean(student?.isVerified || student?.verified);
    const initials = (userName || "S").charAt(0).toUpperCase();

    return (
        <header className="dashboard-navbar">
            <div className="navbar-left">
                {/* Mobile Menu Trigger */}
                <button
                    type="button"
                    className="menu-button"
                    onClick={onMenuClick}
                    aria-label="Toggle navigation drawer"
                >
                    <Menu size={20} strokeWidth={2.2} />
                </button>

                {/* Breadcrumbs */}
                <div className="navbar-breadcrumb">
                    <span className="navbar-breadcrumb-root">
                        <GraduationCap size={16} className="navbar-breadcrumb-icon" />
                        PrepFlow
                    </span>
                    <ChevronRight size={14} className="navbar-breadcrumb-separator" />
                    <span className="navbar-breadcrumb-current">{currentTitle}</span>
                </div>
            </div>

            {/* Clerk-Inspired Active Session & Account Profile */}
            <div className="navbar-right">
                {/* Small, Muted Active Session Indicator */}
                <div className="navbar-session-badge" title="Session Active">
                    <span className="navbar-session-dot" />
                    <span className="navbar-session-label">Active Session</span>
                </div>

                <div className="navbar-divider" aria-hidden="true" />

                {/* Vertical-Aligned User Account Profile */}
                <div className="navbar-profile-pill">
                    <div className="navbar-profile-avatar" aria-hidden="true">
                        {initials}
                    </div>

                    <div className="navbar-profile-info">
                        <div className="navbar-profile-name-row">
                            <span className="navbar-profile-name" title={userName}>
                                {userName}
                            </span>
                            {isVerified && (
                                <span className="navbar-verified-badge" title="Verified Account">
                                    <CheckCircle2 size={12} strokeWidth={2.5} />
                                </span>
                            )}
                        </div>
                        <span className="navbar-profile-role-badge">
                            {userRole}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
