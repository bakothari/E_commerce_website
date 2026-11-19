const mongoose = require("mongoose");
const Category = require("../models/Category");
const Brand = require("../models/brand");
const Product = require("../models/Product");
const SubCategory = require("../models/Subcategory")
const StoreInventory = require("../models/StoreInventory");
const Variant = require("../models/ProductVariant")
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({
            isDeleted: { $ne: true },
            status: { $ne: "inactive" }
        }).select("name slug description image");

        res.status(200).json({ categories });
    } catch (err) {
        res.status(500).json({ message: "Categories could not be loaded" });
    }
};

const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find({
            isDeleted: { $ne: true },
            status: { $ne: "inactive" }
        }).select("name slug logo");

        res.status(200).json({ brands });
    } catch (err) {
        res.status(500).json({ message: "Brands could not be loaded" });
    }
};


const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({
            isFeatured: true,
            isActive: true,
            isDeleted: { $ne: true }
        })
            .select("name slug images unit rating totalReviews category brand")
            .populate("category", "name slug")
            .populate("brand", "name slug")
            .limit(Number(req.query.limit) || 8);

     
        const variants = await Variant.find({
            product: { $in: products.map((p) => p._id) },
            isDeleted: { $ne: true }
        }).sort({ sellingPrice: 1 });

        const firstByProduct = {};
        variants.forEach((v) => {
            const key = String(v.product);
            if (!firstByProduct[key]) firstByProduct[key] = v;
        });

        const result = products.map((p) => ({
            ...p.toObject(),
            variant: firstByProduct[String(p._id)] || null
        }));

        res.status(200).json({ products: result });
    } catch (err) {
        res.status(500).json({ message: "Products could not be loaded" });
    }
};


const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({
            slug: req.params.slug,
            isActive: true,
            isDeleted: { $ne: true }
        })
            .populate("category", "name slug")
            .populate("brand", "name slug");

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const variants = await Variant.find({
            product: product._id,
            isDeleted: { $ne: true }
        }).sort({ sellingPrice: 1 });

        res.status(200).json({ product: { ...product.toObject(), variants } });
    } catch (err) {
        console.error("Product details error:", err);
        res.status(500).json({ message: "Product could not be loaded" });
    }
};

const getSubCategories = async (req, res) => {
    try {
        const filter = {
            isDeleted: { $ne: true },
            status: { $ne: "inactive" }
        };

        if (req.query.category) {
            if (!mongoose.Types.ObjectId.isValid(req.query.category)) {
                return res.status(400).json({ message: "Invalid category id" });
            }
            filter.category = req.query.category;
        }

        const subcategories = await SubCategory.find(filter)
            .select("name slug description image category")
            .populate("category", "name slug");

        res.status(200).json({ subcategories });
    } catch (err) {
        res.status(500).json({ message: "Subcategories could not be loaded" });
    }
};
const getBanners = async (req, res) => {
    try {
        const now = new Date();
        const banners = await Banner.find({
            isDeleted: { $ne: true },
            status: "active",
            $and: [
                { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
                { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
            ]
        })
            .select("name type content image link size backgroundColor textColor textAlign")
            .sort({ createdAt: -1 });

        res.status(200).json({ banners });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Banners could not be loaded" });
    }
};
const getProducts = async (req, res) => {
    try {
        const filter = {
            isActive: true,
            isDeleted: { $ne: true }
        };

        if (req.query.category) {
            if (!mongoose.Types.ObjectId.isValid(req.query.category)) {
                return res.status(400).json({ message: "Invalid category id" });
            }
            filter.category = req.query.category;
        }
        if (req.query.brand && mongoose.Types.ObjectId.isValid(req.query.brand)) {
            filter.brand = req.query.brand;
        }
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: "i" };
        }

        const products = await Product.find(filter)
            .select("name slug images unit rating totalReviews category brand")
            .populate("category", "name slug")
            .populate("brand", "name slug")
            .limit(Number(req.query.limit) || 40);

        // attach the cheapest variant to each product (same as featured)
        const variants = await Variant.find({
            product: { $in: products.map((p) => p._id) },
            isDeleted: { $ne: true }
        }).sort({ sellingPrice: 1 });

        const firstByProduct = {};
        variants.forEach((v) => {
            const key = String(v.product);
            if (!firstByProduct[key]) firstByProduct[key] = v;
        });

        const result = products.map((p) => ({
            ...p.toObject(),
            variant: firstByProduct[String(p._id)] || null
        }));

        res.status(200).json({ products: result });
    } catch (err) {
        console.error("Products error:", err);
        res.status(500).json({ message: "Products could not be loaded" });
    }
};
module.exports = {
    getCategories,
    getBrands,
    getProducts,
    getFeaturedProducts,
    getSubCategories,
    getProductBySlug
};