import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const LoginForm = () => {
    const navigate = useNavigate();

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

        if (!formData.email || !formData.password) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/login", {
                email: formData.email,
                password: formData.password,
            });

            console.log("Login response:", response.data);

            /*
             * Your backend should return the JWT token.
             * We support both:
             *
             * response.data.token
             *
             * and
             *
             * response.data.data.token
             */
            const token =
                response.data.token ||
                response.data.data?.token;

            if (!token) {
                setError("Login successful, but token was not received.");
                return;
            }

            // Store JWT
            localStorage.setItem("token", token);

            // Store student information if backend returns it
            if (response.data.student) {
                localStorage.setItem(
                    "student",
                    JSON.stringify(response.data.student)
                );
            }

            // Redirect to dashboard
            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);

            const message =
                error.response?.data?.message ||
                "Login failed. Please check your credentials.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-form-container">

            <form
                className="login-form"
                onSubmit={handleSubmit}
            >

                <h2>Welcome Back</h2>

                <p className="login-subtitle">
                    Login to your student account
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Email */}
                <div className="form-group">

                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                    />

                </div>

                {/* Password */}
                <div className="form-group">

                    <label htmlFor="password">
                        Password
                    </label>

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

                {/* Login Button */}
                <button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {/* Register Link */}
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