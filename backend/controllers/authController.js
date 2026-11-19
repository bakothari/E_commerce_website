const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../utills/transporter");
const Role = require("../models/Role");


const signup = async (req, res) => {
    try {
      
        let { name, email, password, mobile, address } = req.body;

        let hashedPassword = await bcrypt.hash(password, 10);

        // the user stores the role's id, so find the CUSTOMER role first
        let customerRole = await Role.findOne({ name: "CUSTOMER" });

        if (!customerRole) {
            return res.status(500).json({
                message: "CUSTOMER role not found. Run the seed first."
            });
        }

        let user = await User.create({
            name,
            email,
            password: hashedPassword,
            mobile,
            address,
            role: customerRole._id
        });

        res.status(201).json({
            message: "signup succesful"
        });
    }
    catch (err) {
        console.log(err);

        res.status(500).json({
            message: "signup falied"
        });
    }
};


const login = async (req, res) => {
    try {
        let { email, password} = req.body;

        let user = await User.findOne({ email }).populate("role");

        // 1. the user must exist (this check has to come before using user.role)
        if (!user) {
            return res.status(404).json({
                message: "Email not found"
            });
        }
        if ( user.status=="inactive") {
            return res.status(403).json({
                message: "Your account is inactive. Please contact support."
            });
        }
        // 2. password
        let verifypassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!verifypassword) {
            return res.status(401).json({
                message: "Wrong password"
            });
        }

        // 3. role
        if (!user.role) {
            return res.status(403).json({
                message: "This user has no role assigned"
            });
        }

        if (user.role.status === "inactive") {
            return res.status(403).json({
                message: "Your role is not active"
            });
        }

        let token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            permissions: user.role.permissions      // ["user.read", ...] or ["*"]
        });
    }
    catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;

        console.log("Email:", email);

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "Email not found"
            });
        }

        let otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        console.log("Generated OTP:", otp);

        user.otp = otp;

        await user.save();

        console.log("Saved OTP:", user.otp);

        await transporter.sendMail({
            from: "bhkothari03@gmail.com",
            to: email,
            subject: "Your OTP",
            text: `Your OTP is ${otp} `
        });

        console.log("Mail sent successfully");

        return res.status(200).json({
            message: "OTP sent successfully"
        });
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "OTP sending failed"
        });
    }
};


const checkOtp = async (req, res) => {
    try {
        let { email, otp } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "Email not found"
            });
        }

        console.log("OTP from database:", user.otp);

        if (user.otp !== otp) {
            return res.status(400).json({
                message: "Wrong OTP"
            });
        }

        return res.status(200).json({
            message: "OTP verified successfully"
        });
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


const resetPassword = async (req, res) => {
    try {
        let { email, password } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "Email not found"
            });
        }

        let hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({
            message: "Password reset successfully"
        });
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    signup,
    login,
    forgotPassword,
    checkOtp,
    resetPassword
};