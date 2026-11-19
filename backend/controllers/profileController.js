
const User = require("../models/User");

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -otp");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, mobile, address } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name,
                mobile,
                address
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password -otp");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
