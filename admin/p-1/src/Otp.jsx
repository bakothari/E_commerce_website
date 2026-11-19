import { useState } from "react";
import "./SignUp.css"; // shared green theme
import { useNavigate } from "react-router-dom";
import api from "./api/axios";
import { KeyRound, Sprout, CircleAlert } from "lucide-react";

function Otp() {

    let navigate = useNavigate();

    const [formData, setFormData] = useState({
        otp: ""
    });

    const [errors, setErrors] = useState({});

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setErrors({});
    }

    async function handleSubmit(e) {
        e.preventDefault();

        let newErrors = {};

        if (formData.otp === "") {
            newErrors.otp = "OTP is required";
        }
        else if (formData.otp.length !== 6) {
            newErrors.otp = "OTP must be 6 digits";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            let email = localStorage.getItem("email");
            try {

                let response = await api.post(
                    "/auth/check-otp",
                    {
                        email: email,
                        otp: formData.otp
                    }
                );

                console.log(response.data);

                navigate("/reset");

            }
            catch (error) {
                console.log("Email:", email);
                console.log("OTP:", formData.otp);
                console.log(error);

                if (error.response) {

                    setErrors({
                        otp: error.response.data.message
                    });

                }
            }
        }
    }

    return (
        <div className="signup-page">

            {/* left green panel */}
            <aside className="brand-panel">
                <div className="brand-logo">
                    <Sprout size={26} />
                    <span>YourApp</span>
                </div>

                <div className="brand-copy">
                    <h2>Check your email.</h2>
                    <p>We sent a 6-digit code to verify it's you.</p>
                </div>

                <span className="ring ring-1" />
                <span className="ring ring-2" />
            </aside>

            {/* right form */}
            <main className="form-panel">
                <div className="form-inner">

                    <h1>Verify OTP</h1>

                    <p className="subtitle">
                        Enter the 6-digit OTP sent to your email
                    </p>

                    <form onSubmit={handleSubmit}>

                        <div className={`field ${errors.otp ? "has-error" : ""}`}>
                            <label htmlFor="otp">OTP</label>

                            <div className="input-wrap">
                                <KeyRound className="field-icon" size={18} />
                                <input
                                    id="otp"
                                    type="text"
                                    name="otp"
                                    placeholder="Enter 6-digit OTP"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    maxLength="6"
                                />
                            </div>

                            {errors.otp && (
                                <span className="error-text">
                                    <CircleAlert size={14} /> {errors.otp}
                                </span>
                            )}
                        </div>

                        <button type="submit" className="submit-btn">
                            Verify OTP
                        </button>

                    </form>

                    <p className="resend-row">
                        Didn't receive OTP? <a href="#">Resend OTP</a>
                    </p>

                </div>
            </main>

        </div>
    );
}

export default Otp;