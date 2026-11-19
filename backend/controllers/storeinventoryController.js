const StoreInventory = require("../models/StoreInventory");


const Store = require("../models/Store");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");


// "" / undefined / null -> 0, otherwise a number (can be NaN if text was sent)
const toNumber = (value) =>
    value === "" || value === undefined || value === null ? 0 : Number(value);

const isInvalid = (n) => !Number.isFinite(n) || n < 0;

// returns an error text, or null when everything is fine
const checkNumbers = ({ quantity, reservedQuantity, reorderLevel, maxStockLevel }) => {
    if (
        isInvalid(quantity) ||
        isInvalid(reservedQuantity) ||
        isInvalid(reorderLevel) ||
        isInvalid(maxStockLevel)
    ) {
        return "Quantity values must be numbers that are 0 or more";
    }

    if (reservedQuantity > quantity) {
        return "Reserved quantity cannot be more than quantity";
    }

    if (maxStockLevel > 0 && quantity > maxStockLevel) {
        return "Quantity cannot be more than the max stock level";
    }

    return null;
};


const createInventory = async (req, res) => {
    try {

        let { store, product, variant, status } = req.body;

        if (!store || !product) {
            return res.status(400).json({
                message: "Store and product are required"
            });
        }

        variant = variant || null;

        const quantity = toNumber(req.body.quantity);
        const reservedQuantity = toNumber(req.body.reservedQuantity);
        const reorderLevel = toNumber(req.body.reorderLevel);
        const maxStockLevel = toNumber(req.body.maxStockLevel);

        const numberError = checkNumbers({ quantity, reservedQuantity, reorderLevel, maxStockLevel });

        if (numberError) {
            return res.status(400).json({ message: numberError });
        }

        // one record per store + product + variant
        let existing = await StoreInventory.findOne({ store, product, variant });

        if (existing) {
            return res.status(409).json({
                message: "Inventory already exists for this store, product and variant"
            });
        }

        let inventory = await StoreInventory.create({
            store,
            product,
            variant,
            quantity,
            reservedQuantity,
            availableQuantity: quantity - reservedQuantity,
            reorderLevel,
            maxStockLevel,
            status: status || "active",
            lastRestockedAt: quantity > 0 ? new Date() : undefined
        });

        return res.status(201).json({
            message: "Inventory created successfully",
            inventory: inventory
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Inventory creation failed"
        });
    }
};


const getAllInventory = async (req, res) => {
    try {

        let inventories = await StoreInventory.find()
            .sort({ _id: -1 })
            .populate("store")
            .populate("product")
            .populate("variant");

        return res.status(200).json({
            inventories: inventories
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Inventory not found"
        });
    }
};


const getInventoryById = async (req, res) => {
    try {

        let inventory = await StoreInventory.findById(req.params.id)
            .populate("store")
            .populate("product")
            .populate("variant");

        if (!inventory) {
            return res.status(404).json({
                message: "Inventory not found"
            });
        }

        return res.status(200).json({
            inventory: inventory
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Inventory not found"
        });
    }
};


const updateInventory = async (req, res) => {
    try {

        let inventory = await StoreInventory.findById(req.params.id);

        if (!inventory) {
            return res.status(404).json({
                message: "Inventory not found"
            });
        }

        // use the new value if it was sent, otherwise keep the old one
        const pick = (key, oldValue) =>
            req.body[key] !== undefined ? req.body[key] : oldValue;

        const store = pick("store", inventory.store);
        const product = pick("product", inventory.product);
        const variant = pick("variant", inventory.variant) || null;
        const status = pick("status", inventory.status);

        if (!store || !product) {
            return res.status(400).json({
                message: "Store and product are required"
            });
        }

        const quantity = toNumber(pick("quantity", inventory.quantity));
        const reservedQuantity = toNumber(pick("reservedQuantity", inventory.reservedQuantity));
        const reorderLevel = toNumber(pick("reorderLevel", inventory.reorderLevel));
        const maxStockLevel = toNumber(pick("maxStockLevel", inventory.maxStockLevel));

        const numberError = checkNumbers({ quantity, reservedQuantity, reorderLevel, maxStockLevel });

        if (numberError) {
            return res.status(400).json({ message: numberError });
        }

        // same store + product + variant must not exist in another record
        let duplicate = await StoreInventory.findOne({
            store,
            product,
            variant,
            _id: { $ne: req.params.id }
        });

        if (duplicate) {
            return res.status(409).json({
                message: "Inventory already exists for this store, product and variant"
            });
        }

        // stock went up -> it was restocked
        if (quantity > inventory.quantity) {
            inventory.lastRestockedAt = new Date();
        }

        inventory.store = store;
        inventory.product = product;
        inventory.variant = variant;
        inventory.quantity = quantity;
        inventory.reservedQuantity = reservedQuantity;
        inventory.availableQuantity = quantity - reservedQuantity;
        inventory.reorderLevel = reorderLevel;
        inventory.maxStockLevel = maxStockLevel;
        inventory.status = status;

        await inventory.save();

        return res.status(200).json({
            message: "Inventory updated successfully",
            inventory: inventory
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Inventory update failed"
        });
    }
};


// the model has no isDeleted field, so this removes the record for real
const deleteInventory = async (req, res) => {
    try {

        let inventory = await StoreInventory.findByIdAndDelete(req.params.id);

        if (!inventory) {
            return res.status(404).json({
                message: "Inventory not found"
            });
        }

        return res.status(200).json({
            message: "Inventory deleted successfully"
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Inventory deletion failed"
        });
    }
};


// data for the Store / Product / Variant dropdowns in the form
const getOptions = async (req, res) => {
    try {

        const [stores, products, variants] = await Promise.all([
            Store.find().lean(),
            Product.find().lean(),
            ProductVariant.find().lean()
        ]);

        return res.status(200).json({
            stores,
            products,
            variants
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Could not load stores and products"
        });
    }
};


module.exports = {
    createInventory,
    getAllInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
    getOptions
};