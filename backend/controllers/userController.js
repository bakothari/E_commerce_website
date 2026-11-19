const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");
const transporter = require("../utills/transporter");
const crypto = require("crypto")


const createUser = async (req, res) => {
    try {
        let { name, email, mobile, address, role } = req.body;

        let existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        // frontend sends the role NAME (e.g. "STORE_MANAGER"); the database stores the role _id
        let roleDoc = await Role.findOne({ name: role || "CUSTOMER" });

        if (!roleDoc) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        let password = crypto.randomBytes(6).toString("hex");
        let hashedPassword = await bcrypt.hash(password, 10);

        let user = await User.create({
            name,
            email,
            password: hashedPassword,
            mobile,
            address,
            role: roleDoc._id
        });

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Your Platform Account",
                html: `
                    <h2>Welcome ${name}</h2>
                    <p>Your account has been created successfully.</p>
                    <p><b>Email:</b> ${email}</p>
                    <p><b>Role:</b> ${roleDoc.name}</p>
                    <p><b>Temporary Password:</b> ${password}</p>
                    <p>Please change your password after logging in.</p>
`
            });
        } catch (emailError) {
            console.log("Email error:", emailError);

            return res.status(201).json({
                message: "User created, but email could not be sent",
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: roleDoc.name
                }
            });
        }

        return res.status(201).json({
            message: "User created and password sent successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: roleDoc.name
            }
        });

    } catch (err) {
        console.log("User creation error:", err);

        return res.status(500).json({
            message: err.message || "User creation failed"
        });
    }
};



const getallUser = async (req, res) => {
    try {

        // populate("role", "name") -> sends { _id, name } instead of only an id
        // select("-password") -> never send the password hash to the frontend
        let users = await User.find()
            .select("-password")
            .populate("role", "name");

        return res.status(200).json({
            users: users
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Users not found"
        });
    }
}

const getbyid = async (req, res) => {
    try {

        let user = await User.findById(req.params.id)
            .select("-password")
            .populate("role", "name");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user: user
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "User not found"
        });
    }
}

const updateUser = async (req, res) => {
    try {

        let { name, email, mobile, address, role } = req.body;

        let updateData = {
            name,
            email,
            mobile,
            address
        };

        // only change the role if the form sent one
        if (role) {
            let roleDoc = await Role.findOne({ name: role });

            if (!roleDoc) {
                return res.status(400).json({
                    message: "Invalid role"
                });
            }

            updateData.role = roleDoc._id;
        }

        let user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
            .select("-password")
            .populate("role", "name");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User updated successfully",
            user: user
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "User update failed"
        });
    }
}


const deleteUser = async (req, res) => {
    try {

        let user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User deleted successfully"
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "User deletion failed"
        });
    }
}

let viewUser = async (req, res) => {
    let { id } = req.params;

    try {

        let user = await User.findById(id)
            .select("-password")
            .populate("role", "name");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User found successfully",
            user: user
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
}

let userStatus = async (req, res) => {
    try {

        let { status } = req.body;

        let user = await User.findByIdAndUpdate(
            req.params.id,
            {
                status: status
            },
            {
                new: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Status updated successfully",
            user: user
        });

    } catch (err) {

        res.status(500).json({
            message: "Server error"
        });

    }
}
// the logged-in user (found from the token); any logged-in person can read their own data
const getMe = async (req, res) => {
    try {

        let user = await User.findById(req.user.id)
            .select("-password")
            .populate("role", "name");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user: user
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
}



module.exports = {
    createUser,
    getallUser,
    getbyid,
    updateUser,
    deleteUser,
    viewUser,
    userStatus,
    getMe
}