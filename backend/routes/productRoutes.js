const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const authorize = require("../middleware/authorize");
const {
    createProduct,
    getallProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    viewProduct,
    productStatus
} = require("../controllers/productController");

router.post("/create", auth, authorize("product.create"), createProduct);
router.get("/getall", auth, authorize("product.read"), getallProduct);
router.get("/get/:id", auth, authorize("product.read"), getProductById);
router.put("/update/:id", auth, authorize("product.update"), updateProduct);
router.delete("/delete/:id", auth, authorize("product.delete"), deleteProduct);
router.get("/view/:id", auth, authorize("product.read"), viewProduct);
router.put("/status/:id", auth, authorize("product.update"), productStatus);

module.exports = router;