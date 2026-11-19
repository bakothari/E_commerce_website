const ProductVariant = require("../models/ProductVariant");
const Product = require("../models/Product");

// populate("product", "name") -> sends { _id, name } instead of only an id
const populateFields = [{ path: "product", select: "name" }];

// "" / undefined -> undefined, otherwise a real number
const toNum = (value) =>
    value === "" || value === undefined || value === null ? undefined : Number(value);

// frontend may send a list or a comma / new line separated text
const toList = (value) => {
    if (Array.isArray(value)) {
        return value.map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
        return value.split(/[,\n]/).map((v) => v.trim()).filter(Boolean);
    }
    return [];
};

// discount % is always worked out here, never trusted from the frontend
const calcDiscount = (mrp, sellingPrice) => {
    if (!mrp || mrp <= 0 || sellingPrice === undefined) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 10000) / 100;
};

const createVariant = async (req, res) => {
    try {
        let {
            product, name, sku, barcode, unitValue, unit,
            mrp, sellingPrice, weight, dimensions, images
        } = req.body;

        mrp = toNum(mrp);
        sellingPrice = toNum(sellingPrice);

        if (!product || !name || !sku || mrp === undefined || sellingPrice === undefined) {
            return res.status(400).json({
                message: "Product, name, SKU, MRP and selling price are required"
            });
        }

        if (sellingPrice > mrp) {
            return res.status(400).json({
                message: "Selling price cannot be more than MRP"
            });
        }

        let productDoc = await Product.findById(product);

        if (!productDoc) {
            return res.status(400).json({
                message: "Invalid product"
            });
        }

        sku = String(sku).trim().toUpperCase();

        let existingSku = await ProductVariant.findOne({ sku });

        if (existingSku) {
            return res.status(409).json({
                message: "SKU already exists"
            });
        }

        let variant = await ProductVariant.create({
            product,
            name,
            sku,
            barcode,
            unitValue: toNum(unitValue),
            unit,
            mrp,
            sellingPrice,
            discountPercentage: calcDiscount(mrp, sellingPrice),
            weight: toNum(weight),
            dimensions,
            images: toList(images)
        });

        variant = await variant.populate(populateFields);

        return res.status(201).json({
            message: "Variant created successfully",
            variant: variant
        });

    } catch (err) {
        console.log("Variant creation error:", err);

        return res.status(500).json({
            message: err.message || "Variant creation failed"
        });
    }
};

const getallVariant = async (req, res) => {
    try {

        // optional filter: /productvariant/getall?product=ID
        let filter = {};
        if (req.query.product) filter.product = req.query.product;

        let variants = await ProductVariant.find(filter)
            .populate(populateFields)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            variants: variants
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Variants not found"
        });
    }
};

const getVariantById = async (req, res) => {
    try {

        let variant = await ProductVariant.findById(req.params.id)
            .populate(populateFields);

        if (!variant) {
            return res.status(404).json({
                message: "Variant not found"
            });
        }

        return res.status(200).json({
            variant: variant
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Variant not found"
        });
    }
};

const updateVariant = async (req, res) => {
    try {

        let existing = await ProductVariant.findById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                message: "Variant not found"
            });
        }

        let {
            product, name, sku, barcode, unitValue, unit,
            mrp, sellingPrice, weight, dimensions, images
        } = req.body;

        // use the old price if the form did not send a new one
        let newMrp = toNum(mrp) ?? existing.mrp;
        let newSelling = toNum(sellingPrice) ?? existing.sellingPrice;

        if (newSelling > newMrp) {
            return res.status(400).json({
                message: "Selling price cannot be more than MRP"
            });
        }

        let updateData = {
            name,
            barcode,
            unit,
            dimensions,
            unitValue: toNum(unitValue),
            weight: toNum(weight),
            mrp: newMrp,
            sellingPrice: newSelling,
            discountPercentage: calcDiscount(newMrp, newSelling)
        };

        if (product) {
            let productDoc = await Product.findById(product);

            if (!productDoc) {
                return res.status(400).json({
                    message: "Invalid product"
                });
            }

            updateData.product = product;
        }

        // sku must stay unique (ignore this same variant)
        if (sku) {
            sku = String(sku).trim().toUpperCase();

            let duplicate = await ProductVariant.findOne({ sku, _id: { $ne: req.params.id } });

            if (duplicate) {
                return res.status(409).json({
                    message: "SKU already exists"
                });
            }

            updateData.sku = sku;
        }

        if (images !== undefined) updateData.images = toList(images);

        let variant = await ProductVariant.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate(populateFields);

        return res.status(200).json({
            message: "Variant updated successfully",
            variant: variant
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Variant update failed"
        });
    }
};

const deleteVariant = async (req, res) => {
    try {

        let variant = await ProductVariant.findByIdAndDelete(req.params.id);

        if (!variant) {
            return res.status(404).json({
                message: "Variant not found"
            });
        }

        return res.status(200).json({
            message: "Variant deleted successfully"
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Variant deletion failed"
        });
    }
};

const viewVariant = async (req, res) => {
    let { id } = req.params;

    try {

        let variant = await ProductVariant.findById(id).populate(populateFields);

        if (!variant) {
            return res.status(404).json({
                message: "Variant not found"
            });
        }

        return res.status(200).json({
            message: "Variant found successfully",
            variant: variant
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const variantStatus = async (req, res) => {
    try {

        let { status } = req.body;

        let variant = await ProductVariant.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        ).populate(populateFields);

        if (!variant) {
            return res.status(404).json({
                message: "Variant not found"
            });
        }

        return res.status(200).json({
            message: "Status updated successfully",
            variant: variant
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createVariant,
    getallVariant,
    getVariantById,
    updateVariant,
    deleteVariant,
    viewVariant,
    variantStatus
};