const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const authorize = require("../middleware/authorize")
const {
        createUser,
        getallUser,
        getbyid,
        updateUser,
        deleteUser,
        viewUser,
        userStatus,
        getMe
} = require("../controllers/userController");

router.post("/create", auth, authorize("user.create"), createUser);
router.get("/getall", auth, authorize("user.read"), getallUser);
router.get("/get/:id", auth, authorize("user.read"), getbyid);
router.put("/update/:id", auth, authorize("user.update"), updateUser);
router.delete("/delete/:id", auth, authorize("user.delete"), deleteUser);
router.get("/view/:id", auth, authorize("user.read"), viewUser);
router.put("/status/:id", auth, authorize("user.update"), userStatus);
router.get("/me",auth,getMe)
module.exports = router;