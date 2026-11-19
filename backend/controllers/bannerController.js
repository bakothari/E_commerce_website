const mongoose = require("mongoose");
const sanitizeHtml = require("sanitize-html");
const Banner = require("../models/Banner");

const clean = (html) =>
    sanitizeHtml(html || "", {
        allowedAttributes: { a: ["href", "target", "rel"], "*": ["style"] },
        allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } }
    });

const isEmpty = (html) => !sanitizeHtml(html || "", { allowedTags: [] }).trim();

// only http(s) and /relative links, blocks javascript: links
const safeLink = (l) => (/^(https?:\/\/|\/)/.test(l || "") ? l : "");

const pick = (b) => ({
    name: b.name?.trim(),
    type: b.type === "image" ? "image" : "text",
    content: clean(b.content),
    image: b.image || "",
    link: safeLink(b.link),
    size: ["small", "medium", "big", "hero"].includes(b.size) ? b.size : "medium",
    backgroundColor: b.backgroundColor,
    textColor: b.textColor,
    textAlign: b.textAlign,
    startDate: b.startDate || null,
    endDate: b.endDate || null,
    status: b.status
});

// returns an error message, or null when valid
const validate = (d) => {
    if (!d.name) return "Banner name is required";
    if (d.type === "text" && isEmpty(d.content)) return "Banner text is required";
    if (d.type === "image" && !d.image) return "Please upload or paste an image";
    return null;
};

// ---------- admin ----------
const createBanner = async (req, res) => {
    try {
        const data = pick(req.body);
        const error = validate(data);
        if (error) return res.status(400).json({ message: error });

        const banner = await Banner.create(data);
        res.status(201).json({ message: "Banner created", banner });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Banner could not be created" });
    }
};

const getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
        res.status(200).json({ banners });
    } catch (err) {
        res.status(500).json({ message: "Banners could not be loaded" });
    }
};

const updateBanner = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid banner id" });
        }
        const data = pick(req.body);
        const error = validate(data);
        if (error) return res.status(400).json({ message: error });

        const banner = await Banner.findOneAndUpdate(
            { _id: req.params.id, isDeleted: { $ne: true } },
            data,
            { new: true }
        );
        if (!banner) return res.status(404).json({ message: "Banner not found" });
        res.status(200).json({ message: "Banner updated", banner });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Banner could not be updated" });
    }
};

const deleteBanner = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid banner id" });
        }
        const banner = await Banner.findByIdAndUpdate(req.params.id, { isDeleted: true });
        if (!banner) return res.status(404).json({ message: "Banner not found" });
        res.status(200).json({ message: "Banner deleted" });
    } catch (err) {
        res.status(500).json({ message: "Banner could not be deleted" });
    }
};

const uploadImage = (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No image received" });
    res.status(201).json({
        url: `${req.protocol}://${req.get("host")}/uploads/banners/${req.file.filename}`
    });
};

// ---------- public (customer website) ----------
const getBanners = async (req, res) => {
    try {
        const now = new Date();
        const banners = await Banner.find({
            isDeleted: { $ne: true },
            status: "active",
            $and: [
                { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
                { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
            ]
        })
            .select("name type content image link size backgroundColor textColor textAlign")
            .sort({ createdAt: -1 });

        res.status(200).json({ banners });
    } catch (err) {
        res.status(500).json({ message: "Banners could not be loaded" });
    }
};

module.exports = {
    createBanner,
    getAllBanners,
    updateBanner,
    deleteBanner,
    uploadImage,
    getBanners
};