import { ArrowRight, Sparkles, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WelcomeCard = ({ name = "Student" }) => {
    const navigate = useNavigate();

    const handleStartTest = () => {
        navigate("/mock-tests");
    };

    return (
        <div className="welcome-card">
            <div className="welcome-content">
                <div className="welcome-badge">
                    <Sparkles size={14} className="welcome-sparkle" />
                    <span>Academic Preparation</span>
                </div>

                <div className="welcome-text">
                    <h1>Welcome back, {name}!</h1>
                    <p className="welcome-description">
                        Track your progress, explore curated study materials, and take timed assessments to test your readiness.
                    </p>
                </div>

                <div className="welcome-actions">
                    <button
                        type="button"
                        className="welcome-button"
                        onClick={handleStartTest}
                    >
                        <span>Take a Mock Test</span>
                        <ArrowRight size={17} className="welcome-arrow-icon" />
                    </button>
                    
                    <button
                        type="button"
                        className="welcome-secondary-button"
                        onClick={() => navigate("/notes")}
                    >
                        <Compass size={16} />
                        <span>Browse Materials</span>
                    </button>
                </div>
            </div>

            <div className="welcome-graphic" aria-hidden="true">
                <div className="welcome-graphic-glow" />
                <div className="welcome-graphic-circle" />
            </div>
        </div>
    );
};

export default WelcomeCard;
