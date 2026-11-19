const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },      
        totalPrice: { type: Number, required: true }  
    },
    { timestamps: true }
);

// the same variant appears once per cart
cartItemSchema.index({ cart: 1, variant: 1 }, { unique: true });

module.exports = mongoose.model("CartItem", cartItemSchema);