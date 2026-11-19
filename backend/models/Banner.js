const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ["text", "image"], default: "text" },
        content: { type: String, default: "" },   // HTML from CKEditor (required for text, optional text on top of an image)
        image: { type: String, default: "" },     // image URL (required for image type)
        link: { type: String, default: "" },      // where the banner goes when clicked
        size: { type: String, enum: ["small", "medium", "big", "hero"], default: "medium" },
        backgroundColor: { type: String, default: "#16a34a" },
        textColor: { type: String, default: "#ffffff" },
        textAlign: { type: String, enum: ["left", "center", "right"], default: "center" },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);