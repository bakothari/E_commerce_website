const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        code: {
            type: String
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        phone: {
            type: String
        },
        address: {
            type: String
        },
        location: {
            type: String
        },
        serviceRadius: {
            type: Number
        },
        status: {
            type: String,
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Store", storeSchema);