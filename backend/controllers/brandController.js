// ================= BRAND CONTROLLER =================
// All the logic for brand lives here.

const Brand = require("../models/brand");
const { makeSlug } = require("./categoryController");


// ---------- CREATE ----------
const createBrand = async (req, res) => {
    try {

        let { name, slug, logo, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        slug = makeSlug(slug || name);

        let existingBrand = await Brand.findOne({ slug });

        if (existingBrand) {
            return res.status(409).json({
                message: "Brand already exists"
            });
        }

        // new brand is always active
        let brand = await Brand.create({
            name,
            slug,
            logo,
            description,
            status: "active"
        });

        return res.status(201).json({
            message: "Brand created successfully",
            brand: brand
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Brand creation failed"
        });
    }
};


// ---------- GET ALL ----------
const getAllBrands = async (req, res) => {
    try {

        let brands = await Brand.find().sort({ createdAt: -1 });

        return res.status(200).json({
            brands: brands
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Brands not found"
        });
    }
};


// ---------- GET ONE ----------
const getBrandById = async (req, res) => {
    try {

        let brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found"
            });
        }

        return res.status(200).json({
            brand: brand
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Brand not found"
        });
    }
};


// ---------- UPDATE (also used to make a brand inactive / active) ----------
const updateBrand = async (req, res) => {
    try {

        let { name, slug, logo, description, status } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        slug = makeSlug(slug || name);

        // another brand must not already use this slug
        let existingBrand = await Brand.findOne({
            slug,
            _id: { $ne: req.params.id }
        });

        if (existingBrand) {
            return res.status(409).json({
                message: "Brand already exists"
            });
        }

        let brand = await Brand.findByIdAndUpdate(
            req.params.id,
            {
                name,
                slug,
                logo,
                description,
                status
            },
            { new: true }
        );

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found"
            });
        }

        return res.status(200).json({
            message: "Brand updated successfully",
            brand: brand
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Brand update failed"
        });
    }
};


// ---------- DELETE (your brand model has no isDeleted, so this removes it for good) ----------
const deleteBrand = async (req, res) => {
    try {

        let brand = await Brand.findByIdAndDelete(req.params.id);

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found"
            });
        }

        return res.status(200).json({
            message: "Brand deleted successfully"
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Brand deletion failed"
        });
    }
};


module.exports = {
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand
};