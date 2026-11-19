const express = require("express");
require("dotenv").config();
const cors = require("cors");
const db = require("./db/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes")
const categoryRoutes = require("./routes/categoryRoute");
const subcategoryRoutes = require("./routes/subCategoryRoute");
const brandController = require("./routes/brandroutes")
const storeroutes = require("./routes/storeRoutes")
const productroutes = require("./routes/productRoutes")
const productvarientsRoutes = require("./routes/productvarientRoutes")
const storeInventoryRoutes = require("./routes/storeInventoryRoutes")
const dashboardroutes = require("./routes/DashboardRoute")
const roleRoutes = require("./routes/roleRoutes");
const emailTemplateRoutes = require("./routes/emailRoutes");
// after const app = express()
const path = require("path");
const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL
    ],
    credentials: true
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
db();
app.use("/auth",authRoutes);
app.use("/user",userRoutes);
app.use("/category", categoryRoutes);
app.use("/subcategory",subcategoryRoutes)
app.use("/brand",brandController)
app.use("/store",storeroutes)
app.use("/product",productroutes)
app.use("/productvariant",productvarientsRoutes)
app.use("/storeinventory",storeInventoryRoutes)
app.use("/dashboard",dashboardroutes);
app.use("/public", require("./routes/publicroutes"));
app.use("/cart", require("./routes/cartroutes"));
app.use("/admin/banners", require("./routes/bannerRoutes"));
app.use("/role", roleRoutes);
app.use("/email-template", emailTemplateRoutes);
app.use("/user", require("./routes/profileRoutes"));
const PORT = process.env.PORT || 8080;
app.listen(PORT,()=>{
    console.log("server is running");
})