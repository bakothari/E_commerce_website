const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const authorize = require("../middleware/authorize");
const {
    createStore,
    getallStore,
    getStoreById,
    updateStore,
    deleteStore,
    viewStore,
    storeStatus
} = require("../controllers/storeController");

router.post("/create", auth, authorize("store.create"), createStore);
router.get("/getall", auth, authorize("store.read"), getallStore);
router.get("/get/:id", auth, authorize("store.read"), getStoreById);
router.put("/update/:id", auth, authorize("store.update"), updateStore);
router.delete("/delete/:id", auth, authorize("store.delete"), deleteStore);
router.get("/view/:id", auth, authorize("store.read"), viewStore);
router.put("/status/:id", auth, authorize("store.update"), storeStatus);

module.exports = router;