// ================= DASHBOARD ROUTES =================
// In your main server file (app.js / index.js) add:
//   app.use("/dashboard", require("./routes/dashboardRoutes"));

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { getDashboard } = require("../controllers/DashboardController");

router.get("/", auth, authorize("dashboard.read"), getDashboard);

module.exports = router;