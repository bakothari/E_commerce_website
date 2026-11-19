const mongoose = require("mongoose");

const storeInventorySchema = new mongoose.Schema(
    {
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store"
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductVariant"
        },
        quantity: {
            type: Number,
            default: 0
        },
        reservedQuantity: {
            type: Number,
            default: 0
        },
        availableQuantity: {
            type: Number,
            default: 0
        },
        reorderLevel: {
            type: Number,
            default: 0
        },
        maxStockLevel: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            default: "active"
        },
        lastRestockedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("StoreInventory", storeInventorySchema);