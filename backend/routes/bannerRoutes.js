const express = require("express");
const router = express.Router();

const upload = require("../middleware/bannerUpload");
const auth = require("../middleware/auth")
const {
  createBanner, getAllBanners, updateBanner, deleteBanner, uploadImage, getBanners
} = require("../controllers/bannerController");



router.get("/",auth, getAllBanners);
router.post("/",auth, createBanner);
router.put("/:id",auth, updateBanner);
router.delete("/:id",auth, deleteBanner);
router.post("/upload", upload.single("image"), uploadImage);
router.get("/:id",auth,getBanners)
module.exports = router;