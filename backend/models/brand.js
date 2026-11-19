const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
    name: String,
    slug: String,
    logo: String,
    description: String,
    status: String
}, {
    timestamps: true
});

module.exports = mongoose.model("Brand", brandSchema);