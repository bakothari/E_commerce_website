// ================= EMAIL TEMPLATE CONTROLLER =================

const EmailTemplate = require("../models/Emailtempalte");
const { SYSTEM_KEYS } = require("../utills/defaultTemplate");

// "Welcome Email!" -> "welcome_email"
const makeKey = (text) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

// adds isSystem (the code needs these templates, so they cannot be deleted)
const withFlags = (template) => ({
    ...template.toObject(),
    isSystem: SYSTEM_KEYS.includes(template.key)
});


// ---------- CREATE ----------
const createTemplate = async (req, res) => {
    try {

        let { name, key, subject, body } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }

        if (!subject || !subject.trim()) {
            return res.status(400).json({ message: "Subject is required" });
        }

        if (!body || !body.trim()) {
            return res.status(400).json({ message: "Body is required" });
        }

        key = makeKey(key || name);

        if (!key) {
            return res.status(400).json({ message: "Key is required" });
        }

        let existing = await EmailTemplate.findOne({ key, isDeleted: false });

        if (existing) {
            return res.status(409).json({ message: "A template with this key already exists" });
        }

        // a new template is always active
        let template = await EmailTemplate.create({
            name: name.trim(),
            key,
            subject: subject.trim(),
            body,
            status: "active",
            isDeleted: false
        });

        return res.status(201).json({
            message: "Template created successfully",
            template: template
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "Template creation failed" });
    }
};


// ---------- GET ALL ----------
const getAllTemplates = async (req, res) => {
    try {

        let templates = await EmailTemplate.find({ isDeleted: false }).sort({ createdAt: -1 });

        return res.status(200).json({
            templates: templates.map(withFlags)
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "Templates not found" });
    }
};


// ---------- GET ONE ----------
const getTemplateById = async (req, res) => {
    try {

        let template = await EmailTemplate.findById(req.params.id);

        if (!template || template.isDeleted) {
            return res.status(404).json({ message: "Template not found" });
        }

        return res.status(200).json({
            template: withFlags(template)
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "Template not found" });
    }
};


// ---------- UPDATE (the key never changes, because the code uses it) ----------
const updateTemplate = async (req, res) => {
    try {

        let { name, subject, body, status } = req.body;

        let template = await EmailTemplate.findById(req.params.id);

        if (!template || template.isDeleted) {
            return res.status(404).json({ message: "Template not found" });
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ message: "Name is required" });
            }
            template.name = name.trim();
        }

        if (subject !== undefined) {
            if (!subject.trim()) {
                return res.status(400).json({ message: "Subject is required" });
            }
            template.subject = subject.trim();
        }

        if (body !== undefined) {
            if (!body.trim()) {
                return res.status(400).json({ message: "Body is required" });
            }
            template.body = body;
        }

        if (status !== undefined) {
            if (!["active", "inactive"].includes(status)) {
                return res.status(400).json({ message: "Status must be active or inactive" });
            }
            template.status = status;
        }

        await template.save();

        return res.status(200).json({
            message: "Template updated successfully",
            template: template
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "Template update failed" });
    }
};


// ---------- DELETE (soft delete: isDeleted = true) ----------
const deleteTemplate = async (req, res) => {
    try {

        let template = await EmailTemplate.findById(req.params.id);

        if (!template || template.isDeleted) {
            return res.status(404).json({ message: "Template not found" });
        }

        if (SYSTEM_KEYS.includes(template.key)) {
            return res.status(403).json({
                message: "This template is used by the system and cannot be deleted. You can make it inactive."
            });
        }

        template.isDeleted = true;
        await template.save();

        return res.status(200).json({ message: "Template deleted successfully" });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "Template deletion failed" });
    }
};


module.exports = {
    createTemplate,
    getAllTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate
};