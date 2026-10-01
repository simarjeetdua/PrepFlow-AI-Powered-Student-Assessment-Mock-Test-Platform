import { Menu, UserCircle } from "lucide-react";

const Navbar = ({ onMenuClick }) => {
    const studentData = localStorage.getItem("student");

    let student = null;

    try {
        student = studentData ? JSON.parse(studentData) : null;
    } catch (error) {
        console.error("Failed to parse student data:", error);
    }

    return (
        <header className="dashboard-navbar">

            {/* Mobile Menu */}
            <button
                type="button"
                className="menu-button"
                onClick={onMenuClick}
                aria-label="Open menu"
            >
                <Menu size={22} />
            </button>

            {/* Page Title */}
            <div className="navbar-title">
                Student Dashboard
            </div>

            {/* Student Info */}
            <div className="navbar-user">
                <div className="navbar-user-info">
                    <span className="navbar-user-name">
                        {student?.name || "Student"}
                    </span>

                    <span className="navbar-user-role">
                        Student
                    </span>
                </div>

                <UserCircle size={26} />
            </div>

        </header>
    );
};

export default Navbar;