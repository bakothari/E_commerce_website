const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const Variant = require("../models/ProductVariant"); // change to your real file name

// ---- pricing rules: change these to your business rules ----
const TAX_RATE = 0;               // e.g. 0.05 for 5%
const DELIVERY_FEE = 40;
const FREE_DELIVERY_ABOVE = 500;
const MAX_QTY = 99;
// -------------------------------------------------------------

const isId = (id) => mongoose.Types.ObjectId.isValid(id);

// recalculates and saves all the totals of a cart from its items
async function recalculate(cart) {
    const items = await CartItem.find({ cart: cart._id }).select("totalPrice");
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

    cart.subtotal = subtotal;
    cart.discount = Math.min(cart.discount || 0, subtotal);
    cart.deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    cart.tax = Math.round((subtotal - cart.discount) * TAX_RATE * 100) / 100;
    cart.totalAmount = subtotal - cart.discount + cart.deliveryFee + cart.tax;

    await cart.save();
    return cart;
}

// cart + its populated items, in the shape the frontend needs
async function buildResponse(cart) {
    const items = await CartItem.find({ cart: cart._id })
        .populate("product", "name slug images unit")
        .populate("variant");
    return { cart, items };
}

// GET /cart?store=<storeId>
const getCart = async (req, res) => {
    try {
        const filter = { user: req.user._id };
        if (req.query.store) {
            if (!isId(req.query.store)) return res.status(400).json({ message: "Invalid store id" });
            filter.store = req.query.store;
        }

        const cart = await Cart.findOne(filter).sort({ updatedAt: -1 });
        if (!cart) {
            return res.status(200).json({ cart: null, items: [] });
        }
        res.status(200).json(await buildResponse(cart));
    } catch (err) {
        res.status(500).json({ message: "Cart could not be loaded" });
    }
};

// POST /cart/items   body: { productId, variantId, quantity, store? }
const addItem = async (req, res) => {
    try {
        const { productId, variantId } = req.body;
        const quantity = Number(req.body.quantity) || 1;

        if (!isId(productId) || !isId(variantId)) {
            return res.status(400).json({ message: "Invalid product or variant id" });
        }
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
            return res.status(400).json({ message: `Quantity must be between 1 and ${MAX_QTY}` });
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true,
            isDeleted: { $ne: true }
        });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const variant = await Variant.findOne({
            _id: variantId,
            product: productId,
            isDeleted: { $ne: true }
        });
        if (!variant) return res.status(404).json({ message: "Variant not found" });

        const store = req.body.store || product.store;
        if (!isId(store)) return res.status(400).json({ message: "Store is required" });

        const cart = await Cart.findOneAndUpdate(
            { user: req.user._id, store },
            { $setOnInsert: { user: req.user._id, store } },
            { new: true, upsert: true }
        );

        let item = await CartItem.findOne({ cart: cart._id, variant: variantId });
        const newQty = (item ? item.quantity : 0) + quantity;

        if (newQty > MAX_QTY) {
            return res.status(400).json({ message: `You can add at most ${MAX_QTY} of one item` });
        }
        if (variant.stock !== undefined && newQty > variant.stock) {
            return res.status(400).json({ message: `Only ${variant.stock} in stock` });
        }

        if (item) {
            item.quantity = newQty;
            item.price = variant.price; // refresh to the current price
            item.totalPrice = variant.price * newQty;
            await item.save();
        } else {
            await CartItem.create({
                cart: cart._id,
                product: productId,
                variant: variantId,
                quantity: newQty,
                price: variant.price,
                totalPrice: variant.price * newQty
            });
        }

        await recalculate(cart);
        res.status(201).json(await buildResponse(cart));
    } catch (err) {
        res.status(500).json({ message: "Item could not be added to the cart" });
    }
};

// finds an item and makes sure it belongs to the logged-in user's cart
async function findOwnItem(itemId, userId) {
    if (!isId(itemId)) return {};
    const item = await CartItem.findById(itemId);
    if (!item) return {};
    const cart = await Cart.findOne({ _id: item.cart, user: userId });
    if (!cart) return {};
    return { item, cart };
}

// PATCH /cart/items/:itemId   body: { quantity }
const updateItem = async (req, res) => {
    try {
        const quantity = Number(req.body.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
            return res.status(400).json({ message: `Quantity must be between 1 and ${MAX_QTY}` });
        }

        const { item, cart } = await findOwnItem(req.params.itemId, req.user._id);
        if (!item) return res.status(404).json({ message: "Cart item not found" });

        const variant = await Variant.findById(item.variant);
        if (!variant) return res.status(404).json({ message: "Variant is no longer available" });
        if (variant.stock !== undefined && quantity > variant.stock) {
            return res.status(400).json({ message: `Only ${variant.stock} in stock` });
        }

        item.quantity = quantity;
        item.price = variant.price;
        item.totalPrice = variant.price * quantity;
        await item.save();

        await recalculate(cart);
        res.status(200).json(await buildResponse(cart));
    } catch (err) {
        res.status(500).json({ message: "Cart item could not be updated" });
    }
};

// DELETE /cart/items/:itemId
const removeItem = async (req, res) => {
    try {
        const { item, cart } = await findOwnItem(req.params.itemId, req.user._id);
        if (!item) return res.status(404).json({ message: "Cart item not found" });

        await item.deleteOne();
        await recalculate(cart);
        res.status(200).json(await buildResponse(cart));
    } catch (err) {
        res.status(500).json({ message: "Cart item could not be removed" });
    }
};

// DELETE /cart?store=<storeId>   (empties the cart)
const clearCart = async (req, res) => {
    try {
        const filter = { user: req.user._id };
        if (req.query.store) {
            if (!isId(req.query.store)) return res.status(400).json({ message: "Invalid store id" });
            filter.store = req.query.store;
        }

        const cart = await Cart.findOne(filter);
        if (!cart) return res.status(200).json({ cart: null, items: [] });

        await CartItem.deleteMany({ cart: cart._id });
        cart.coupon = null;
        cart.discount = 0;
        await recalculate(cart);

        res.status(200).json({ cart, items: [] });
    } catch (err) {
        res.status(500).json({ message: "Cart could not be cleared" });
    }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };