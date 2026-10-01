import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WelcomeCard = ({ name = "Student" }) => {
    const navigate = useNavigate();

    const handleStartTest = () => {
        navigate("/mock-tests");
    };

    return (
        <div className="welcome-card">
            <div className="welcome-content">
                <div className="welcome-icon">
                    <Sparkles size={24} />
                </div>

                <div className="welcome-text">
                    <p className="welcome-label">
                        Welcome back 👋
                    </p>

                    <h1>Hello, {name}!</h1>

                    <p className="welcome-description">
                        Ready to test your knowledge and improve your
                        performance today?
                    </p>
                </div>
            </div>

            <button
                type="button"
                className="welcome-button"
                onClick={handleStartTest}
            >
                Start a Test
                <ArrowRight size={18} />
            </button>
        </div>
    );
};

export default WelcomeCard;