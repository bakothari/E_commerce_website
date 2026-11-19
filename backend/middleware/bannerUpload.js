const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dir = path.join(__dirname, "..", "uploads", "banners");
fs.mkdirSync(dir, { recursive: true });

module.exports = multer({
    storage: multer.diskStorage({
        destination: dir,
        filename: (req, file, cb) =>
            cb(null, Date.now() + "-" + Math.round(Math.random() * 1e6) + path.extname(file.originalname).toLowerCase())
    }),
    limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB
    fileFilter: (req, file, cb) =>
        /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)
            ? cb(null, true)
            : cb(new Error("Only png, jpg, webp or gif images are allowed"))
});