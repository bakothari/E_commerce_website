const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },
        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory"
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand"
        },
        name: {
            type: String
        },
        slug: {
            type: String
        },
        description: {
            type: String
        },
        images: {
            type: [String],
            default: []
        },
        unit: {
            type: String
        },
        tags: {
            type: [String],
            default: []
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        rating: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
productSchema.virtual("variants", {
    ref: "ProductVariant",
    localField: "_id",
    foreignField: "product"
});

module.exports = mongoose.model("Product", productSchema);