const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobile: String,
    address: String,
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },
    otp: String
});

const User = mongoose.model("User", userSchema);

module.exports = User;