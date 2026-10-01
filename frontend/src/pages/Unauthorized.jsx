import { useNavigate } from "react-router-dom";
import {
    ShieldAlert,
    ArrowLeft,
    Home,
    LogIn,
} from "lucide-react";

const Unauthorized = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const handlePrimaryAction = () => {
        if (token) {
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="unauthorized-page">

            <div className="unauthorized-card">

                {/* Icon */}
                <div className="unauthorized-icon">
                    <ShieldAlert size={36} />
                </div>

                {/* Error Code */}
                <span className="unauthorized-code">
                    401
                </span>

                {/* Message */}
                <h1>
                    Unauthorized Access
                </h1>

                <p>
                    You don't have permission to access this page.
                    Please log in with an authorized account.
                </p>

                {/* Actions */}
                <div className="unauthorized-actions">

                    <button
                        type="button"
                        className="unauthorized-button primary"
                        onClick={handlePrimaryAction}
                    >
                        {token ? (
                            <>
                                <Home size={18} />
                                Go to Dashboard
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Go to Login
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        className="unauthorized-button secondary"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Unauthorized;