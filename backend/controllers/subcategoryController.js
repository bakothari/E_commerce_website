
const SubCategory = require("../models/Subcategory");  
const Category = require("../models/Category");
const { makeSlug } = require("../controllers/categoryController");

const createSubCategory = async (req, res) => {
    try {

        let { category, name, slug, description, image } = req.body;

        if (!category) {
            return res.status(400).json({
                message: "Category is required"
            });
        }

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }
        let parentCategory = await Category.findById(category);

        if (!parentCategory || parentCategory.isDeleted) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        slug = makeSlug(slug || name);
        let existingSubCategory = await SubCategory.findOne({
            slug,
            category,
            isDeleted: false
        });

        if (existingSubCategory) {
            return res.status(409).json({
                message: "Sub category already exists"
            });
        }

        let subcategory = await SubCategory.create({
            category,
            name,
            slug,
            description,
            image,
            status: "active",
            isDeleted: false
        });

        return res.status(201).json({
            message: "Sub category created successfully",
            subcategory: subcategory
        });

    }
    catch (err) {
        console.log(err);

        if (err.name === "CastError" || err.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid category or data"
            });
        }

        return res.status(500).json({
            message: "Sub category creation failed"
        });
    }
};


const getAllSubCategories = async (req, res) => {
    try {

        let subcategories = await SubCategory.find({ isDeleted: false })
            .populate("category", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            subcategories: subcategories
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Sub categories not found"
        });
    }
};


const getSubCategoryById = async (req, res) => {
    try {

        let subcategory = await SubCategory.findById(req.params.id)
            .populate("category", "name");

        if (!subcategory || subcategory.isDeleted) {
            return res.status(404).json({
                message: "Sub category not found"
            });
        }

        return res.status(200).json({
            subcategory: subcategory
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Sub category not found"
        });
    }
};


const updateSubCategory = async (req, res) => {
    try {

        let { category, name, slug, description, image, status } = req.body;

        if (!category) {
            return res.status(400).json({
                message: "Category is required"
            });
        }

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        let parentCategory = await Category.findById(category);

        if (!parentCategory || parentCategory.isDeleted) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        slug = makeSlug(slug || name);

        // another sub category in this category must not already use this slug
        let existingSubCategory = await SubCategory.findOne({
            slug,
            category,
            isDeleted: false,
            _id: { $ne: req.params.id }
        });

        if (existingSubCategory) {
            return res.status(409).json({
                message: "Sub category already exists"
            });
        }

        let subcategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            {
                category,
                name,
                slug,
                description,
                image,
                status
            },
            { new: true, runValidators: true }
        ).populate("category", "name");

        if (!subcategory) {
            return res.status(404).json({
                message: "Sub category not found"
            });
        }

        return res.status(200).json({
            message: "Sub category updated successfully",
            subcategory: subcategory
        });

    }
    catch (err) {
        console.log(err);

        if (err.name === "CastError" || err.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid category or data"
            });
        }

        return res.status(500).json({
            message: "Sub category update failed"
        });
    }
};

const deleteSubCategory = async (req, res) => {
    try {

        let subcategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );

        if (!subcategory) {
            return res.status(404).json({
                message: "Sub category not found"
            });
        }

        return res.status(200).json({
            message: "Sub category deleted successfully"
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Sub category deletion failed"
        });
    }
};


module.exports = {
    createSubCategory,
    getAllSubCategories,
    getSubCategoryById,
    updateSubCategory,
    deleteSubCategory
};