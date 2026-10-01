import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">

            <div className="not-found-card">

                {/* Icon */}
                <div className="not-found-icon">
                    <AlertTriangle size={36} />
                </div>

                {/* Error Code */}
                <span className="not-found-code">
                    404
                </span>

                {/* Message */}
                <h1>
                    Page Not Found
                </h1>

                <p>
                    The page you're looking for doesn't exist
                    or may have been moved.
                </p>

                {/* Actions */}
                <div className="not-found-actions">

                    <button
                        type="button"
                        className="not-found-button primary"
                        onClick={() => navigate("/dashboard")}
                    >
                        <Home size={18} />
                        Go to Dashboard
                    </button>

                    <button
                        type="button"
                        className="not-found-button secondary"
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

export default NotFound;