
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/login", {
                email: formData.email.trim(),
                password: formData.password,
            });

            const data = response.data;

            // Support common backend response structures
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
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Welcome Back</h2>

                <p className="login-subtitle">
                    Login to your PrepFlow account
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="email">Email</label>

                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>

                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="register-link">
                    Don't have an account?{" "}
                    <Link to="/register">
                        Create an account
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default LoginForm;
