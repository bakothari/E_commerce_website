
import React, { useEffect, useState } from "react";
import api from "./api/axios";
import "./profile.css";

const Profile = () => {
    const [user, setUser] = useState({
        name: "",
        email: "",
        mobile: "",
        address: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await api.get(
                "/user/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUser(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });

        setMessage("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const token = localStorage.getItem("token");

            const res = await api.put(
                "/user/profile",
                {
                    name: user.name,
                    mobile: user.mobile,
                    address: user.address
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUser(res.data.user);
            setMessage("Your profile has been updated successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Profile update failed");
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";

        const words = name.trim().split(" ");

        if (words.length > 1) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }

        return name.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loader"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">

            <div className="profile-header">
                <div>
                    <span className="profile-subtitle">ACCOUNT SETTINGS</span>
                    <h1>My Profile</h1>
                    <p>Manage your personal information and account details.</p>
                </div>

                <div className="profile-header-icon">
                    <i className="fa-regular fa-user"></i>
                </div>
            </div>

            <div className="profile-layout">

                <div className="profile-sidebar">

                    <div className="profile-avatar">
                        {getInitials(user.name)}
                    </div>

                    <h2>{user.name || "Your Name"}</h2>
                    <p className="profile-email">{user.email}</p>

                    <div className="profile-status">
                        <span></span>
                        Account Profile
                    </div>

                    <div className="sidebar-divider"></div>

                    <div className="profile-side-info">
                        <div>
                            <span>Full Name</span>
                            <strong>{user.name || "Not provided"}</strong>
                        </div>

                        <div>
                            <span>Mobile Number</span>
                            <strong>{user.mobile || "Not provided"}</strong>
                        </div>
                    </div>

                </div>

                <div className="profile-form-card">

                    <div className="form-heading">
                        <div>
                            <h2>Personal Information</h2>
                            <p>Update your personal details below.</p>
                        </div>

                        <span className="edit-label">
                            <i className="fa-regular fa-pen-to-square"></i>
                            Editable
                        </span>
                    </div>

                    {message && (
                        <div className="success-message">
                            <i className="fa-regular fa-circle-check"></i>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="profile-input-grid">

                            <div className="profile-field">
                                <label>Full Name</label>

                                <div className="input-wrapper">
                                    <i className="fa-regular fa-user"></i>

                                    <input
                                        type="text"
                                        name="name"
                                        value={user.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="profile-field">
                                <label>Email Address</label>

                                <div className="input-wrapper">
                                    <i className="fa-regular fa-envelope"></i>

                                    <input
                                        type="email"
                                        name="email"
                                        value={user.email}
                                        
                                    />
                                    <span className="verified-label">Verified</span>
                                </div>
                            </div>

                            <div className="profile-field">
                                <label>Mobile Number</label>

                                <div className="input-wrapper">
                                    <i className="fa-solid fa-phone"></i>

                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={user.mobile || ""}
                                        onChange={handleChange}
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                            </div>

                            <div className="profile-field full-width">
                                <label>Address</label>

                                <div className="input-wrapper textarea-wrapper">
                                    <i className="fa-solid fa-location-dot"></i>

                                    <textarea
                                        name="address"
                                        value={user.address || ""}
                                        onChange={handleChange}
                                        placeholder="Enter your complete address"
                                        rows="4"
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="profile-form-footer">
                            <p>
                                <i className="fa-solid fa-lock"></i>
                                Your information is kept secure.
                            </p>

                            <button
                                type="submit"
                                disabled={saving}
                                className="save-profile-btn"
                            >
                                {saving ? (
                                    <>
                                        <span className="button-loader"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-regular fa-floppy-disk"></i>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>

                    </form>

                </div>

            </div>
        </div>
    );
};

export default Profile;
