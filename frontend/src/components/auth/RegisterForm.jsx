import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    GraduationCap, 
    User, 
    Mail, 
    Lock, 
    ArrowRight, 
    LoaderCircle, 
    AlertCircle, 
    CheckCircle2, 
    ShieldCheck,
    Eye,
    EyeOff
} from "lucide-react";
import api from "../../services/api";

const RegisterForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Basic frontend validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/register", {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            console.log("Register response:", response.data);

            setSuccess(
                response.data.message || "Registration successful! Redirecting to login..."
            );

            // Clear form
            setFormData({
                name: "",
                email: "",
                password: "",
            });

            // Go to login after successful registration
            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (error) {
            console.error("Registration error:", error);

            const message =
                error.response?.data?.message ||
                "Registration failed. Please try again.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-form-container">
            {/* Ambient Background Glow */}
            <div className="auth-ambient-glow" aria-hidden="true" />

            <div className="register-form-wrapper">
                <form className="register-form" onSubmit={handleSubmit} noValidate>
                    {/* Brand Header */}
                    <div className="auth-brand-header">
                        <div className="auth-logo-badge">
                            <GraduationCap size={26} strokeWidth={2.2} />
                        </div>
                        <h2>Create your account</h2>
                        <p className="register-subtitle">
                            Join PrepFlow to access practice tests, study materials, and AI tutoring
                        </p>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <div className="error-message" role="alert">
                            <AlertCircle size={18} className="error-icon" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="success-message" role="status">
                            <CheckCircle2 size={18} className="success-icon" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Name Input */}
                    <div className="form-group">
                        <label htmlFor="name">Full name</label>
                        <div className="input-with-icon">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Jane Doe"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="form-group">
                        <div className="password-label-row">
                            <label htmlFor="password">Password</label>
                            <span className="password-hint">Min 6 characters</span>
                        </div>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                minLength={6}
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle size={18} className="animate-spin" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <span>Get Started</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    {/* Login Link */}
                    <p className="login-link">
                        Already have an account?{" "}
                        <Link to="/login">
                            Sign in instead
                        </Link>
                    </p>

                    {/* Security Footer */}
                    <div className="auth-security-footer">
                        <ShieldCheck size={14} />
                        <span>Secure SSL enterprise authentication</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
