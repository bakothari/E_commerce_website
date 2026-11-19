// ================= ROLE ROUTES =================
// Only the URLs live here. The logic is in controllers/roleController.js

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
    getAllRoles,
    getRoleById,
    getPermissionList,
    createRole,
    updateRole,
    deleteRole
} = require("../controllers/rolesController");


router.get("/getall", auth, authorize("role.read"), getAllRoles);

router.get("/permissions", auth, authorize("role.read"), getPermissionList);

router.get("/get/:id", auth, authorize("role.read"), getRoleById);

router.post("/create", auth, authorize("role.create"), createRole);

router.put("/update/:id", auth, authorize("role.update"), updateRole);

router.delete("/delete/:id", auth, authorize("role.delete"), deleteRole);


module.exports = router;