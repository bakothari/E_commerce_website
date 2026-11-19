const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const authorize = require("../middleware/authorize");
const {
    createVariant,
    getallVariant,
    getVariantById,
    updateVariant,
    deleteVariant,
    viewVariant,
    variantStatus
} = require("../controllers/productvarientController");

// variants use the same permissions as products
router.post("/create", auth, authorize("product.create"), createVariant);
router.get("/getall", auth, authorize("product.read"), getallVariant);
router.get("/get/:id", auth, authorize("product.read"), getVariantById);
router.put("/update/:id", auth, authorize("product.update"), updateVariant);
router.delete("/delete/:id", auth, authorize("product.delete"), deleteVariant);
router.get("/view/:id", auth, authorize("product.read"), viewVariant);
router.put("/status/:id", auth, authorize("product.update"), variantStatus);

module.exports = router;