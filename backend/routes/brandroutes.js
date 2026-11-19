// ================= BRAND ROUTES =================
// Only the URLs live here. The logic is in controllers/brandController.js

const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize")
const auth = require("../middleware/auth");

const {
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand
} = require("../controllers/brandController");


router.post("/create", auth,authorize("brand.create"), createBrand);

router.get("/getall", auth, authorize("brand.read"), getAllBrands);

router.get("/get/:id", auth, authorize("brand.read"), getBrandById);

router.put("/update/:id", auth, authorize("brand.update"), updateBrand);

router.delete("/delete/:id", auth, authorize("brand.delete"), deleteBrand);


module.exports = router;