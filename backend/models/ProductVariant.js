const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        name: {
            type: String
        },
        sku: {
            type: String
        },
        barcode: {
            type: String
        },
        unitValue: {
            type: Number
        },
        unit: {
            type: String
        },
        mrp: {
            type: Number
        },
        sellingPrice: {
            type: Number
        },
        discountPercentage: {
            type: Number
        },
        weight: {
            type: Number
        },
        dimensions: {
            type: String
        },
        images: {
            type: [String],
            default: []
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

module.exports = mongoose.model("ProductVariant", productVariantSchema);