const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth") // change to your real auth middleware
const {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart
} = require("../controllers/cartController");



router.use(auth)
router.get("/", getCart);
router.delete("/", clearCart);

router.post("/items", addItem);
router.patch("/items/:itemId", updateItem);
router.delete("/items/:itemId", removeItem);

module.exports = router;