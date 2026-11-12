import { useEffect, useState } from "react";
import {
    User,
    Mail,
    Save,
    LoaderCircle,
    CheckCircle2,
    AlertCircle,
    Shield,
    Calendar,
    GraduationCap,
} from "lucide-react";

import api from "../services/api";

const Profile = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/students/profile");

                const student = response.data.student;

                if (student) {
                    setFormData({
                        name: student.name || "",
                        email: student.email || "",
                    });

                    localStorage.setItem(
                        "student",
                        JSON.stringify(student)
                    );
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load your profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        setSuccess("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name.trim() || !formData.email.trim()) {
            setError("Name and email are required.");
            return;
        }

        try {
            setSaving(true);

            const response = await api.put(
                "/students/profile",
                {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                }
            );

            const updatedStudent = response.data.student;

            if (updatedStudent) {
                setFormData({
                    name: updatedStudent.name || "",
                    email: updatedStudent.email || "",
                });

                localStorage.setItem(
                    "student",
                    JSON.stringify(updatedStudent)
                );
            }

            setSuccess(
                response.data.message ||
                "Profile updated successfully."
            );
        } catch (error) {
            console.error("Failed to update profile:", error);

            setError(
                error.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const userInitial = (formData.name || formData.email || "S")
        .charAt(0)
        .toUpperCase();

    if (loading) {
        return (
            <div className="profile-page">
                <div className="page-loading-skeleton">
                    <LoaderCircle size={24} className="animate-spin" />
                    <span>Loading student profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Page Header */}
            <div className="profile-page-header">
                <div>
                    <h1>Account Settings</h1>
                    <p>
                        Manage your student profile details, display identity, and email preferences.
                    </p>
                </div>
            </div>

            {/* Main Profile Card */}
            <div className="profile-card">
                {/* Profile Header with Avatar */}
                <div className="profile-card-header">
                    <div className="profile-avatar-large">
                        <span>{userInitial}</span>
                    </div>

                    <div className="profile-header-info">
                        <h2>{formData.name || "Student User"}</h2>
                        <div className="profile-badges-row">
                            <span className="profile-badge-role">
                                <GraduationCap size={13} />
                                Student Member
                            </span>
                            <span className="profile-badge-verified">
                                <Shield size={13} />
                                Verified Account
                            </span>
                        </div>
                    </div>
                </div>

                {/* Feedback Alerts */}
                {error && (
                    <div className="profile-message error" role="alert">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="profile-message success" role="status">
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                    </div>
                )}

                {/* Form */}
                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="profile-form-grid">
                        {/* Name */}
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="profile-input-wrapper">
                                <User size={17} className="input-icon" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="profile-input-wrapper">
                                <Mail size={17} className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    required
                                    disabled={saving}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Notice Box */}
                    <div className="profile-security-notice">
                        <Shield size={16} className="security-icon" />
                        <div>
                            <strong>Account Protection</strong>
                            <p>
                                Your details are strictly used for test credentials, result tracking, and platform authentication.
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="profile-form-actions">
                        <button
                            type="submit"
                            className="save-profile-button"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <LoaderCircle
                                        size={17}
                                        className="animate-spin"
                                    />
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Save Profile</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
