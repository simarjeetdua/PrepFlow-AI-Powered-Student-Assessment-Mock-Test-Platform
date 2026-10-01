import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
        if (!formData.name || !formData.email || !formData.password) {
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
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            console.log("Register response:", response.data);

            setSuccess(
                response.data.message || "Registration successful!"
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
            }, 1000);

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

            <form
                className="register-form"
                onSubmit={handleSubmit}
            >

                <h2>Create Account</h2>

                <p className="register-subtitle">
                    Register as a student
                </p>

                {/* Error */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                {/* Name */}
                <div className="form-group">

                    <label htmlFor="name">
                        Full Name
                    </label>

                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                    />

                </div>

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
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        minLength={6}
                        required
                    />

                </div>

                {/* Register button */}
                <button
                    type="submit"
                    className="register-button"
                    disabled={loading}
                >
                    {loading ? "Creating Account..." : "Register"}
                </button>

                {/* Login link */}
                <p className="login-link">
                    Already have an account?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>

            </form>

        </div>
    );
};

export default RegisterForm;