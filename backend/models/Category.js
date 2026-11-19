const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    name: String,
    slug: String,
    description: String,
    image: String,
    status: String,
    isDeleted: Boolean,
},
     { timestamps: true 

     });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;

