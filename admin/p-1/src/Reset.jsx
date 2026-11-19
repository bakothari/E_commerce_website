import { useState } from "react";
import "./SignUp.css"; // shared styles
import { useNavigate } from "react-router-dom";
import api from "./api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Lock,
    Eye,
    EyeOff,
    Loader2,
    CircleAlert,
    Sprout,
    ShieldCheck,
    KeyRound,
    CheckCircle2,
} from "lucide-react";

// defined outside Reset so inputs don't lose focus on every re-render
const Field = ({ label, icon: Icon, name, error, children }) => (
    <div className={`field ${error ? "has-error" : ""}`}>
        <label htmlFor={name}>{label}</label>
        <div className="input-wrap">
            <Icon className="field-icon" size={18} />
            {children}
        </div>
        {error && (
            <span className="error-text">
                <CircleAlert size={14} /> {error}
            </span>
        )}
    </div>
);

function Reset() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: "" });
    }

    const validate = () => {
        const newErrors = {};

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6)
            newErrors.password = "Password must be at least 6 characters";

        if (!formData.confirmPassword)
            newErrors.confirmPassword = "Please confirm your password";
        else if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please fix the highlighted fields");
            return;
        }

        const email = localStorage.getItem("email");

        try {
            setLoading(true);
            await api.post("/auth/reset-password", {
                email,
                password: formData.password,
            });

            localStorage.removeItem("email");
            toast.success("Password updated! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
            toast.error(err.response?.data?.message || "Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="signup-page">
                <aside className="brand-panel">
                    <div className="brand-logo">
                        <Sprout size={26} />
                        <span>YourApp</span>
                    </div>

                    <div className="brand-copy">
                        <h2>Almost done. Choose a new password.</h2>
                        <p>Your code is verified. Set a new password to get back in.</p>

                        <ul>
                            <li>
                                <CheckCircle2 size={18} /> Email verified
                            </li>
                            <li>
                                <KeyRound size={18} /> Use at least 6 characters
                            </li>
                            <li>
                                <ShieldCheck size={18} /> Don't reuse an old password
                            </li>
                        </ul>
                    </div>

                    <span className="ring ring-1" />
                    <span className="ring ring-2" />
                </aside>

                <main className="form-panel">
                    <div className="form-inner">
                        <h1>Set a new password</h1>
                        <p className="subtitle">You'll log in with this password from now on.</p>

                        <form onSubmit={handleSubmit} noValidate>
                            <Field
                                label="New password"
                                icon={Lock}
                                name="password"
                                error={errors.password}
                            >
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="At least 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </Field>

                            <Field
                                label="Confirm password"
                                icon={Lock}
                                name="confirmPassword"
                                error={errors.confirmPassword}
                            >
                                <input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="toggle-btn"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </Field>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="spin" /> Updating...
                                    </>
                                ) : (
                                    "Update password"
                                )}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}

export default Reset;