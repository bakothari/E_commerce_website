// ================= EMAIL TEMPLATE ROUTES =================
// Only the URLs live here. The logic is in controllers/emailTemplateController.js

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
    createTemplate,
    getAllTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate
} = require("../controllers/emailTemplateController");


router.get("/getall", auth, authorize("emailtemplate.read"), getAllTemplates);

router.get("/get/:id", auth, authorize("emailtemplate.read"), getTemplateById);

router.post("/create", auth, authorize("emailtemplate.create"), createTemplate);

router.put("/update/:id", auth, authorize("emailtemplate.update"), updateTemplate);

router.delete("/delete/:id", auth, authorize("emailtemplate.delete"), deleteTemplate);


module.exports = router;