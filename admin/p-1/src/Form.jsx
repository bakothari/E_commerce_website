import { useState } from "react";
import "./SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import api from "./api/axios"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Phone,
    MapPin,
    Loader2,
    CircleAlert,
    Sprout,
    ShieldCheck,
    Zap,
    Clock,
} from "lucide-react";

// defined outside Signup so inputs don't lose focus on every re-render
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

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        password: "",
        address: "",
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: "" });
    }

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";

        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "Enter a valid email";

        if (!formData.mobile) newErrors.mobile = "Mobile number is required";
        else if (!/^[0-9]{10}$/.test(formData.mobile))
            newErrors.mobile = "Mobile number must be 10 digits";

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6)
            newErrors.password = "Password must be at least 6 characters";

        if (!formData.address.trim()) newErrors.address = "Address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    async function handleSignup(e) {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please fix the highlighted fields");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post("/auth/signup", formData);

            if (response.data.message === "signup succesful") {
                toast.success("Account created! Redirecting...");
                setTimeout(() => window.location.href = "https://ecommercewebsite-frontend.vercel.app/");
            } else {
                toast.error(response.data.message || "Signup failed");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <ToastContainer position="bottom-right" autoClose={3000} />
            <div className="signup-page">

                {/* ---------- left: brand panel ---------- */}
                <aside className="brand-panel">
                    <div className="brand-logo">
                        <Sprout size={26} />
                        <span>YourApp</span>
                    </div>

                    <div className="brand-copy">
                        <h2>Set up your account in under a minute.</h2>
                        <p>One profile gives you access to everything in your dashboard.</p>

                        <ul>
                            <li>
                                <Zap size={18} /> Instant access after signup
                            </li>
                            <li>
                                <ShieldCheck size={18} /> Your details stay private
                            </li>
                            <li>
                                <Clock size={18} /> Edit your profile any time
                            </li>
                        </ul>
                    </div>

                    <span className="ring ring-1" />
                    <span className="ring ring-2" />
                </aside>

                {/* ---------- right: form ---------- */}
                <main className="form-panel">
                    <div className="form-inner">
                        <h1>Create your account</h1>
                        <p className="subtitle">
                            Already registered? <Link to="/login">Log in</Link>
                        </p>

                        <form onSubmit={handleSignup} noValidate>
                            <Field label="Full name" icon={User} name="name" error={errors.name}>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Email" icon={Mail} name="email" error={errors.email}>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Mobile number" icon={Phone} name="mobile" error={errors.mobile}>
                                <input
                                    id="mobile"
                                    type="tel"
                                    name="mobile"
                                    maxLength={10}
                                    placeholder="10-digit number"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Password" icon={Lock} name="password" error={errors.password}>
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

                            <Field label="Address" icon={MapPin} name="address" error={errors.address}>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    placeholder="House no, street, city"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </Field>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="spin" /> Creating account...
                                    </>
                                ) : (
                                    "Create account"
                                )}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}

export default Signup;