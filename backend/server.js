
const express = require("express");
require("dotenv").config();

const cors = require("cors");
const path = require("path");
const db = require("./db/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoute");
const subcategoryRoutes = require("./routes/subCategoryRoute");
const brandController = require("./routes/brandroutes");
const storeroutes = require("./routes/storeRoutes");
const productroutes = require("./routes/productRoutes");
const productvarientsRoutes = require("./routes/productvarientRoutes");
const storeInventoryRoutes = require("./routes/storeInventoryRoutes");
const dashboardroutes = require("./routes/DashboardRoute");
const roleRoutes = require("./routes/roleRoutes");
const emailTemplateRoutes = require("./routes/emailRoutes");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

const allowedOrigins = [
    "https://e-commerce-website-e852.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is running successfully"
    });
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/subcategory", subcategoryRoutes);
app.use("/brand", brandController);
app.use("/store", storeroutes);
app.use("/product", productroutes);
app.use("/productvariant", productvarientsRoutes);
app.use("/storeinventory", storeInventoryRoutes);
app.use("/dashboard", dashboardroutes);
app.use("/public", require("./routes/publicroutes"));
app.use("/cart", require("./routes/cartroutes"));
app.use("/admin/banners", require("./routes/bannerRoutes"));
app.use("/role", roleRoutes);
app.use("/email-template", emailTemplateRoutes);
app.use("/user", require("./routes/profileRoutes"));

db()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("Database connection failed:", error);
    });
