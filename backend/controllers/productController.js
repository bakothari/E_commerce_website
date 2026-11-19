const crypto = require("crypto");
const Product = require("../models/Product");

// populate(..., "name") -> sends { _id, name } instead of only an id
const populateFields = [
    { path: "category", select: "name" },
    { path: "subcategory", select: "name" },
    { path: "brand", select: "name" }
];

// "Fresh Milk 1L" -> "fresh-milk-1l"
const makeSlug = (text) =>
    String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

// slug must be unique: if it is already used, add a short random ending
const uniqueSlug = async (text, ignoreId) => {
    let base = makeSlug(text) || "product";
    let slug = base;

    while (await Product.findOne({ slug, _id: { $ne: ignoreId } })) {
        slug = `${base}-${crypto.randomBytes(2).toString("hex")}`;
    }

    return slug;
};

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

const createProduct = async (req, res) => {
    try {
        let {
            category, subcategory, brand, name, description,
            images, unit, tags, isFeatured, isActive
        } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                message: "Name and category are required"
            });
        }

        let product = await Product.create({
            category,
            subcategory: subcategory || undefined,
            brand: brand || undefined,
            name,
            slug: await uniqueSlug(name),
            description,
            images: toList(images),
            unit,
            tags: toList(tags),
            isFeatured: !!isFeatured,
            isActive: isActive === undefined ? true : !!isActive
        });

        product = await product.populate(populateFields);

        return res.status(201).json({
            message: "Product created successfully",
            product: product
        });

    } catch (err) {
        console.log("Product creation error:", err);

        return res.status(500).json({
            message: err.message || "Product creation failed"
        });
    }
};

const getallProduct = async (req, res) => {
    try {

        // optional filters: /product/getall?category=ID&subcategory=ID&brand=ID
        let filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.subcategory) filter.subcategory = req.query.subcategory;
        if (req.query.brand) filter.brand = req.query.brand;

        let products = await Product.find(filter)
            .populate(populateFields)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            products: products
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Products not found"
        });
    }
};

const getProductById = async (req, res) => {
    try {

        let product = await Product.findById(req.params.id)
            .populate(populateFields);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            product: product
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Product not found"
        });
    }
};

const updateProduct = async (req, res) => {
    try {

        let {
            category, subcategory, brand, name, slug, description,
            images, unit, tags, isFeatured, isActive
        } = req.body;

        let updateData = {
            name,
            description,
            unit
        };

        if (category) updateData.category = category;

        // empty string = remove, id = change
        if (subcategory !== undefined) updateData.subcategory = subcategory || null;
        if (brand !== undefined) updateData.brand = brand || null;

        if (images !== undefined) updateData.images = toList(images);
        if (tags !== undefined) updateData.tags = toList(tags);
        if (isFeatured !== undefined) updateData.isFeatured = !!isFeatured;
        if (isActive !== undefined) updateData.isActive = !!isActive;

        // slug stays the same unless a new one is sent
        if (slug) {
            updateData.slug = await uniqueSlug(slug, req.params.id);
        }

        let product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate(populateFields);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product updated successfully",
            product: product
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Product update failed"
        });
    }
};

const deleteProduct = async (req, res) => {
    try {

        let product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product deleted successfully"
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Product deletion failed"
        });
    }
};

const viewProduct = async (req, res) => {
    let { id } = req.params;

    try {

        let product = await Product.findById(id).populate(populateFields);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product found successfully",
            product: product
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// body: { status: "active" | "inactive" }  (same as user and store)
const productStatus = async (req, res) => {
    try {

        let { status } = req.body;

        let product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: status === "active" },
            { new: true }
        ).populate(populateFields);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Status updated successfully",
            product: product
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createProduct,
    getallProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    viewProduct,
    productStatus
};