
import { useState } from "react";
import "./SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import api from "./api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    Mail,
    CircleAlert,
    Sprout,
    ArrowLeft,
    KeyRound,
    ShieldCheck,
} from "lucide-react";

function ForPass() {
    let navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!email) {
            return setError("Email is required");
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            return setError("Enter a valid email");
        }

        try {
            setLoading(true);

            let response = await api.post(
                "/auth/forgot-password",
                { email }
            );

            localStorage.setItem("email", email);

            toast.success(response.data.message || "OTP sent successfully");

            navigate("/otp", {
                state: {
                    email: email
                }
            });

        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Server error. Please try again."
            );
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

                        <h2>Forgot your password?</h2>

                        <p>
                            Enter your registered email and we'll send you
                            an OTP to reset your password.
                        </p>

                        <ul>
                            <li>
                                <KeyRound size={18} />
                                Reset your password easily
                            </li>

                            <li>
                                <ShieldCheck size={18} />
                                Secure OTP verification
                            </li>
                        </ul>

                    </div>

                    <span className="ring ring-1" />
                    <span className="ring ring-2" />

                </aside>

                <main className="form-panel">

                    <div className="form-inner">

                        <Link to="/login" className="back-link">
                            <ArrowLeft size={16} />
                            Back to login
                        </Link>

                        <h1>Reset your password</h1>

                        <p className="subtitle">
                            Enter the email you registered with.
                            We'll send you an OTP.
                        </p>

                        <form onSubmit={handleSubmit} noValidate>

                            <div className={`field ${ error ? "has-error" : "" } `}>

                                <label htmlFor="email">
                                    Email
                                </label>

                                <div className="input-wrap">

                                    <Mail
                                        className="field-icon"
                                        size={18}
                                    />

                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError("");
                                        }}
                                    />

                                </div>

                                {error && (
                                    <span className="error-text">
                                        <CircleAlert size={14} />
                                        {error}
                                    </span>
                                )}

                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? "Sending OTP..." : "Send OTP"}
                            </button>

                        </form>

                    </div>

                </main>

            </div>
        </>
    );
}

export default ForPass;
