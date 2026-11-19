// ================= ROLE CONTROLLER =================
// Roles are created from the Roles page. Each role has a list of permissions.

const Role = require("../models/Role");
const User = require("../models/User");
const PERMISSIONS = require("../permissions");

// every permission written in permissions.js
const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// the 7 starting roles: they cannot be renamed or deleted (the code looks for them by name)
const DEFAULT_ROLES = [
    "SUPER_ADMIN",
    "ADMIN",
    "STORE_MANAGER",
    "INVENTORY_MANAGER",
    "DELIVERY_PARTNER",
    "SUPPORT_AGENT",
    "CUSTOMER"
];

const validPermissions = (list) =>
    Array.isArray(list) && list.every((p) => ALL_PERMISSIONS.includes(p));

// "warehouse staff" -> "WAREHOUSE_STAFF"
const cleanName = (name) => name.trim().toUpperCase().replace(/\s+/g, "_");

// adds the number of users and "isDefault" to a role
const withDetails = async (role) => ({
    ...role.toObject(),
    userCount: await User.countDocuments({ role: role._id }),
    isDefault: DEFAULT_ROLES.includes(role.name)
});


// ---------- ALL ROLES ----------
const getAllRoles = async (req, res) => {
    try {

        let roles = await Role.find().sort({ _id: 1 });

        let list = await Promise.all(roles.map(withDetails));

        return res.status(200).json({
            roles: list
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Roles not found"
        });
    }
};


// ---------- ONE ROLE ----------
const getRoleById = async (req, res) => {
    try {

        let role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        return res.status(200).json({
            role: await withDetails(role)
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Role not found"
        });
    }
};


// ---------- LIST OF ALL PERMISSIONS (for the tick boxes) ----------
const getPermissionList = async (req, res) => {
    return res.status(200).json({
        permissions: ALL_PERMISSIONS
    });
};


// ---------- CREATE ----------
const createRole = async (req, res) => {
    try {

        let { name, permissions } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        name = cleanName(name);

        if (!/^[A-Z0-9_]+$/.test(name)) {
            return res.status(400).json({
                message: "Name can have only letters, numbers and spaces"
            });
        }

        permissions = permissions || [];

        if (!validPermissions(permissions)) {
            return res.status(400).json({
                message: "Invalid permission in the list"
            });
        }

        let existingRole = await Role.findOne({ name });

        if (existingRole) {
            return res.status(409).json({
                message: "Role already exists"
            });
        }

        // a new role is always active
        let role = await Role.create({
            name,
            permissions,
            status: "active"
        });

        return res.status(201).json({
            message: "Role created successfully",
            role: role
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Role creation failed"
        });
    }
};


// ---------- UPDATE (name, permissions, status) ----------
const updateRole = async (req, res) => {
    try {

        let { name, permissions, status } = req.body;

        let role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        if (role.name === "SUPER_ADMIN") {
            return res.status(403).json({
                message: "SUPER_ADMIN role cannot be changed"
            });
        }

        if (name !== undefined) {
            let newName = cleanName(name);

            if (newName !== role.name) {
                if (DEFAULT_ROLES.includes(role.name)) {
                    return res.status(403).json({
                        message: "The name of a default role cannot be changed"
                    });
                }

                if (!newName || !/^[A-Z0-9_]+$/.test(newName)) {
                    return res.status(400).json({
                        message: "Name can have only letters, numbers and spaces"
                    });
                }

                let existingRole = await Role.findOne({ name: newName, _id: { $ne: role._id } });

                if (existingRole) {
                    return res.status(409).json({
                        message: "Role already exists"
                    });
                }

                role.name = newName;
            }
        }

        if (permissions !== undefined) {
            if (!validPermissions(permissions)) {
                return res.status(400).json({
                    message: "Invalid permission in the list"
                });
            }
            role.permissions = permissions;
        }

        if (status !== undefined) {
            if (!["active", "inactive"].includes(status)) {
                return res.status(400).json({
                    message: "Status must be active or inactive"
                });
            }
            role.status = status;
        }

        await role.save();

        return res.status(200).json({
            message: "Role updated successfully",
            role: role
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Role update failed"
        });
    }
};


// ---------- DELETE (only your own roles, and only when no user has them) ----------
const deleteRole = async (req, res) => {
    try {

        let role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        if (DEFAULT_ROLES.includes(role.name)) {
            return res.status(403).json({
                message: "Default roles cannot be deleted"
            });
        }

        let userCount = await User.countDocuments({ role: role._id });

        if (userCount > 0) {
            return res.status(409).json({
                message: `${userCount} user(s) still have this role. Change their role first.`
            });
        }

        await Role.findByIdAndDelete(role._id);

        return res.status(200).json({
            message: "Role deleted successfully"
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Role deletion failed"
        });
    }
};


module.exports = {
    getAllRoles,
    getRoleById,
    getPermissionList,
    createRole,
    updateRole,
    deleteRole
};