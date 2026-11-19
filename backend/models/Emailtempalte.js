const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema({
    name: String,
    key: String,
    subject: String,
    body: String,
    status: String,
    isDeleted: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);