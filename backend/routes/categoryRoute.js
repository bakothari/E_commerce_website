const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize")
const express = require("express");
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");


router.post("/create", auth,authorize("category.create"), createCategory);

router.get("/getall", auth, authorize("category.read"), getAllCategories);

router.get("/get/:id", auth, authorize("category.read"), getCategoryById);

router.put("/update/:id", auth, authorize("category.update"), updateCategory);

router.delete("/delete/:id", auth, authorize("category.delete"), deleteCategory);


module.exports = router;