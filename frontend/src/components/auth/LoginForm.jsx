import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    GraduationCap, 
    Mail, 
    Lock, 
    ArrowRight, 
    LoaderCircle, 
    AlertCircle, 
    ShieldCheck,
    Eye,
    EyeOff
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const LoginForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
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

        if (!formData.email.trim() || !formData.password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/login", {
                email: formData.email.trim(),
                password: formData.password,
            });

            const data = response.data;
            const payload = data.data || data;

            const token =
                payload.token ||
                payload.accessToken ||
                data.token ||
                data.accessToken;

            const user =
                payload.student ||
                payload.user ||
                payload.admin ||
                data.student ||
                data.user ||
                data.admin ||
                null;

            if (!token) {
                console.error("Login response:", data);
                setError("Authentication token was not received.");
                return;
            }

            // Store authenticated user and token
            login(token, user);

            // Redirect according to role
            const role = user?.role?.toLowerCase();

            if (role === "admin") {
                navigate("/admin", { replace: true });
            } else if (role === "teacher") {
                navigate("/teacher", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }

        } catch (error) {
            console.error("Login error:", {
                status: error.response?.status,
                message: error.response?.data?.message,
                response: error.response?.data,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
            });

            setError(
                error.response?.data?.message ||
                "Login failed. Please check your credentials."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-form-container">
            {/* Ambient Background Glow */}
            <div className="auth-ambient-glow" aria-hidden="true" />

            <div className="login-form-wrapper">
                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    {/* Brand Header */}
                    <div className="auth-brand-header">
                        <div className="auth-logo-badge">
                            <GraduationCap size={26} strokeWidth={2.2} />
                        </div>
                        <h2>Welcome back</h2>
                        <p className="login-subtitle">
                            Enter your credentials to access your PrepFlow account
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="error-message" role="alert">
                            <AlertCircle size={18} className="error-icon" />
                            <span>{error}</span>
                        </div>
                    )}

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
                                autoComplete="username"
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="form-group">
                        <div className="password-label-row">
                            <label htmlFor="password">Password</label>
                        </div>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
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
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle size={18} className="animate-spin" />
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign in</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    {/* Register Link */}
                    <p className="register-link">
                        Don't have an account?{" "}
                        <Link to="/register">
                            Create an account
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

export default LoginForm;
