// Returns the numbers shown on the dashboard cards.
// Only the modules that the logged-in role is allowed to READ are returned.

const mongoose = require("mongoose");

// We do NOT require the model files here. On Windows, "../models/Brand" and
// "../models/brand" count as two different files for Node, which makes Mongoose
// crash with "Cannot overwrite Brand model once compiled".
// Instead we take the models your other files have already registered.
// modelName = the name written in mongoose.model("Name", schema) in your model file.
const MODULES = [
    { key: "users", permission: "user.read", modelName: "User" },
    { key: "brands", permission: "brand.read", modelName: "Brand" },
    { key: "categories", permission: "category.read", modelName: "Category" },
    { key: "subcategories", permission: "subcategory.read", modelName: "SubCategory" },
    { key: "products", permission: "product.read", modelName: "Product" },
    { key: "variants", permission: "productvariant.read", modelName: "ProductVariant" },
    { key: "stores", permission: "store.read", modelName: "Store" },
    { key: "inventory", permission: "inventory.read", modelName: "StoreInventory" }
];

// a wrong name will NOT crash the server: that card is skipped and a message
// is printed in this terminal
const getModel = (modelName) => {
    try {
        return mongoose.model(modelName);
    } catch (err) {
        console.log(`Dashboard: model "${modelName}" is not registered -> ${err.message}`);
        return null;
    }
};

const hasPermission = (permissions, permission) =>
    permissions.includes("*") || permissions.includes(permission);

const buildStat = async (key, Model) => {
    // skip soft-deleted records (only if that model has an isDeleted field)
    const base = Model.schema.path("isDeleted") ? { isDeleted: { $ne: true } } : {};

    const total = await Model.countDocuments(base);
    const stat = { key, total };

    // active / inactive (only if that model has a status field)
    if (Model.schema.path("status")) {
        const inactive = await Model.countDocuments({ ...base, status: "inactive" });
        stat.inactive = inactive;
        stat.active = total - inactive;
    }

    // extra numbers for inventory
    if (key === "inventory") {
        stat.outOfStock = await Model.countDocuments({
            ...base,
            availableQuantity: { $lte: 0 }
        });

        stat.lowStock = await Model.countDocuments({
            ...base,
            $expr: {
                $and: [
                    { $gt: ["$availableQuantity", 0] },
                    { $lte: ["$availableQuantity", "$reorderLevel"] }
                ]
            }
        });
    }

    return stat;
};

const getDashboard = async (req, res) => {
    try {

        // req.role is set by authorize()
        const permissions = req.role?.permissions || [];

        const allowed = MODULES.filter((m) => hasPermission(permissions, m.permission));

        const stats = (
            await Promise.all(
                allowed.map(async (m) => {
                    const Model = getModel(m.modelName);

                    // model not found: skip this card
                    if (!Model) return null;

                    try {
                        return await buildStat(m.key, Model);
                    } catch (err) {
                        console.log(`Dashboard: ${m.key} failed ->`, err.message);
                        return { key: m.key, total: null };
                    }
                })
            )
        ).filter(Boolean);

        return res.status(200).json({
            stats: stats
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Dashboard could not be loaded"
        });
    }
};

module.exports = { getDashboard };