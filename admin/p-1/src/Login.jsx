import { useState } from "react";
import "./SignUp.css"; // reuses the same styles as the signup page
import { Link, useNavigate } from "react-router-dom";
import api from "./api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    CircleAlert,
    Sprout,
    LayoutDashboard,
    ShieldCheck,
    Clock,
} from "lucide-react";



// defined outside Login so inputs don't lose focus on every re-render
const Field = ({ label, icon: Icon, name, error, action, children }) => (
    <div className={`field ${error ? "has-error" : ""}`}>
        <div className="label-row">
            <label htmlFor={name}>{label}</label>
            {action}
        </div>
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

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
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

        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "Enter a valid email";

        if (!formData.password) newErrors.password = "Password is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    async function handleLogin(e) {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please fix the highlighted fields");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/login",
                formData
            );

            const { token, user } = response.data;

            if (!token) {
                toast.error(response.data.message || "Login failed");
                return;
            }

            // The role name and the permissions can come at the top of the response
            //     { token, role: "ADMIN", permissions: [...] }
            // or inside user.role
            //     { token, user: { role: { name: "ADMIN", permissions: [...] } } }
            const roleName =
                response.data.role?.name ?? response.data.role ??
                user?.role?.name ?? user?.role;

            const permissions =
                response.data.permissions ??
                user?.role?.permissions ??
                [];

            if (!roleName) {
                toast.error("Role is missing from the response");
                return;
            }

            toast.success("Welcome back!");

            if (roleName === "CUSTOMER") {
                // customers use the Next.js app (different origin, so localStorage
                // isn't shared) - hand the token and user over via the URL
                const params = new URLSearchParams({
                    token,
                    user: JSON.stringify(user || { role: roleName }),
                });
                window.location.href = `https://ecommercewebsite-frontend.vercel.app/auth/callback?${params}`;
            } else {
                // staff/admin stay in this app, so save to this origin's localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("role", roleName);
                localStorage.setItem("permissions", JSON.stringify(permissions));   // used by can()
                if (user) localStorage.setItem("user", JSON.stringify(user));

                navigate("/dashboard");
            }
        } catch (err) {
            console.error(err);
            toast.error(
                err.response?.data?.message || "Server error. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }


    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="signup-page">
                {/* ---------- left: brand panel ---------- */}
                <aside className="brand-panel">
                    <div className="brand-logo">
                        <Sprout size={26} />
                        <span>YourApp</span>
                    </div>

                    <div className="brand-copy">
                        <h2>Good to see you again.</h2>
                        <p>Log in to pick up right where you left off.</p>

                        <ul>
                            <li>
                                <LayoutDashboard size={18} /> Your dashboard, ready to go
                            </li>
                            <li>
                                <ShieldCheck size={18} /> Your details stay private
                            </li>
                            <li>
                                <Clock size={18} /> Takes a few seconds
                            </li>
                        </ul>
                    </div>

                    <span className="ring ring-1" />
                    <span className="ring ring-2" />
                </aside>

                {/* ---------- right: form ---------- */}
                <main className="form-panel">
                    <div className="form-inner">
                        <h1>Log in to your account</h1>
                        <p className="subtitle">
                            New here? <Link to="/">Create an account</Link>
                        </p>

                        <form onSubmit={handleLogin} noValidate>
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

                            <Field
                                label="Password"
                                icon={Lock}
                                name="password"
                                error={errors.password}
                                action={
                                    <Link to="/forgot-password" className="forgot-link">
                                        Forgot password?
                                    </Link>
                                }
                            >
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
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

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="spin" /> Logging in...
                                    </>
                                ) : (
                                    "Log in"
                                )}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}

export default Login;