// models/WishlistItem.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistItemSchema = new Schema(
    {
        wishlist: { type: Schema.Types.ObjectId, ref: "Wishlist", required: true, index: true },
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        variant: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// the same product (and variant) appears only once per wishlist
wishlistItemSchema.index({ wishlist: 1, product: 1, variant: 1 }, { unique: true });

module.exports = mongoose.model("WishlistItem", wishlistItemSchema);