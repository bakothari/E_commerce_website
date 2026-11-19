const express = require("express");
const router = express.Router();

const {
    getCategories,
    getBrands,
    getFeaturedProducts,
    getSubCategories,
    getProductBySlug,
    getProducts
} = require("../controllers/publicController");

const { getBanners } = require("../controllers/bannerController");

router.get("/categories", getCategories);
router.get("/subcategory", getSubCategories);
router.get("/brands", getBrands);
router.get("/banners", getBanners);
router.get("/products", getProducts);
// "featured" must come BEFORE ":slug"
router.get("/products/featured", getFeaturedProducts);
router.get("/products/:slug", getProductBySlug);

module.exports = router;