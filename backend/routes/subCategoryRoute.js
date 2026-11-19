// ================= SUB CATEGORY ROUTES =================
// Only the URLs live here. The logic is in subCategoryController.js

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize")
const {
    createSubCategory,
    getAllSubCategories,
    getSubCategoryById,
    updateSubCategory,
    deleteSubCategory
} = require("../controllers/subcategoryController");


router.post("/create", auth, authorize("subcategory.create") ,createSubCategory);

router.get("/getall", auth, authorize("subcategory.read"), getAllSubCategories);

router.get("/get/:id", auth, authorize("subcategory.read"), getSubCategoryById);

router.put("/update/:id", auth, authorize("subcategory.update"),updateSubCategory);

router.delete("/delete/:id", auth, authorize("subcategory.delete"), deleteSubCategory);


module.exports = router;