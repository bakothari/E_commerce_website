const mongoose = require("mongoose");

const subCategorySchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    }, 
    name: String,
    slug: String,
    description: String,
    image: String,
    status: String,
    isDeleted: Boolean
}, { timestamps: true });  

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategory;