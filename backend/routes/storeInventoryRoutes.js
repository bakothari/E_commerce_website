// ================= STORE INVENTORY ROUTES =================
// Only the URLs live here. The logic is in storeInventoryController.js
//
// In your main server file (app.js / index.js) add:
//   app.use("/storeinventory", require("./routes/storeInventoryRoutes"));

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
    createInventory,
    getAllInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
    getOptions
} = require("../controllers/storeinventoryController");

// NOTE: authorize() stops the server at startup if a permission below is not
// written in permissions.js. "inventory.read" and "inventory.update" already
// exist in your seeder. If you want separate create / delete permissions, add
// "inventory.create" and "inventory.delete" to permissions.js (and to the roles)
// and use them on the create and delete routes.

// dropdown data (stores, products, variants) for the form
router.get("/options", auth, authorize("inventory.read"), getOptions);

router.post("/create", auth, authorize("inventory.update"), createInventory);

router.get("/getall", auth, authorize("inventory.read"), getAllInventory);

router.get("/get/:id", auth, authorize("inventory.read"), getInventoryById);

router.put("/update/:id", auth, authorize("inventory.update"), updateInventory);

router.delete("/delete/:id", auth, authorize("inventory.update"), deleteInventory);


module.exports = router;