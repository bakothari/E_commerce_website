const mongoose = require("mongoose");

const roleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    permissions: [String],          // ["user.create", "user.read", ...]   "*" = everything
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
}, { timestamps: true });

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;