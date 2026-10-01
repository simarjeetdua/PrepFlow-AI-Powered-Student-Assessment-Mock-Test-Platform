import { useEffect, useState } from "react";
import {
    UserCircle,
    Mail,
    Save,
    LoaderCircle,
    CheckCircle,
    AlertCircle,
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
                console.error(
                    "Failed to fetch profile:",
                    error
                );

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
                    name: formData.name,
                    email: formData.email,
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
            console.error(
                "Failed to update profile:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="page-loading">
                    <LoaderCircle
                        size={24}
                        className="loading-icon"
                    />
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">

            {/* Page Header */}
            <div className="profile-page-header">
                <div>
                    <h1>My Profile</h1>

                    <p>
                        View and update your student information.
                    </p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="profile-card">

                {/* Profile Header */}
                <div className="profile-card-header">

                    <div className="profile-avatar">
                        <UserCircle size={54} />
                    </div>

                    <div>
                        <h2>
                            {formData.name || "Student"}
                        </h2>

                        <p>
                            Student Account
                        </p>
                    </div>

                </div>

                {/* Messages */}
                {error && (
                    <div className="profile-message error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="profile-message success">
                        <CheckCircle size={18} />
                        <span>{success}</span>
                    </div>
                )}

                {/* Form */}
                <form
                    className="profile-form"
                    onSubmit={handleSubmit}
                >

                    {/* Name */}
                    <div className="form-group">

                        <label htmlFor="name">
                            Full Name
                        </label>

                        <div className="profile-input-wrapper">

                            <UserCircle size={18} />

                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                autoComplete="name"
                                required
                            />

                        </div>

                    </div>

                    {/* Email */}
                    <div className="form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <div className="profile-input-wrapper">

                            <Mail size={18} />

                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                            />

                        </div>

                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        className="save-profile-button"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <LoaderCircle
                                    size={18}
                                    className="loading-icon"
                                />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>

                </form>

            </div>

        </div>
    );
};

export default Profile;