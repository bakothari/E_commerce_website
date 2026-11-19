const Category = require("../models/Category");



const makeSlug = (text) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const createCategory = async (req, res) => {
    try {

        let { name, slug, description, image } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        slug = makeSlug(slug || name);

        let existingCategory = await Category.findOne({ slug, isDeleted: false });

        if (existingCategory) {
            return res.status(409).json({
                message: "Category already exists"
            });
        }
        let category = await Category.create({
            name,
            slug,
            description,
            image,
            status: "active",
            isDeleted: false
        });

        return res.status(201).json({
            message: "Category created successfully",
            category: category
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Category creation failed"
        });
    }
};



const getAllCategories = async (req, res) => {
    try {

        let categories = await Category.find({ isDeleted: false }).sort({ _id: -1 });

        return res.status(200).json({
            categories: categories
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Categories not found"
        });
    }
};


const getCategoryById = async (req, res) => {
    try {

        let category = await Category.findById(req.params.id);

        if (!category || category.isDeleted) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        return res.status(200).json({
            category: category
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Category not found"
        });
    }
};


const updateCategory = async (req, res) => {
    try {

        let { name, slug, description, image, status } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        slug = makeSlug(slug || name);

       
        let existingCategory = await Category.findOne({
            slug,
            isDeleted: false,
            _id: { $ne: req.params.id }
        });

        if (existingCategory) {
            return res.status(409).json({
                message: "Category already exists"
            });
        }

        let category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name,
                slug,
                description,
                image,
                status
            },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        return res.status(200).json({
            message: "Category updated successfully",
            category: category
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Category update failed"
        });
    }
};


const deleteCategory = async (req, res) => {
    try {

        let category = await Category.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        return res.status(200).json({
            message: "Category deleted successfully"
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Category deletion failed"
        });
    }
};


module.exports = {
    makeSlug,
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};