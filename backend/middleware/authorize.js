// Checks that the logged in user's ROLE has the permission.
// Use it AFTER auth:   router.post("/create", auth, authorize("user.create"), createUser);

const User = require("../models/User");
require("../models/Role");                 // needed so populate("role") works
const PERMISSIONS = require("../permissions");

const allPermissions = Object.values(PERMISSIONS);

const authorize = (permission) => {

   
    if (!allPermissions.includes(permission)) {
        throw new Error(`authorize: "${permission}" is not written in permissions.js`);
    }

    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id)
                .populate("role");

            if (!user) {
                return res.status(403).json({
                    message: "User not found"
                });
            }

            // user.role is empty when the user has no role saved in the database
            // (run seeders/seedRoles.js), or when the User model has no role field
            if (!user.role) {
                return res.status(403).json({
                    message: "This user has no role assigned"
                });
            }

            // CHANGED: a role with no status field is treated as active.
            // Only block the role when it HAS a status and it is not "active".
            if (user.role.status && user.role.status !== "active") {
                return res.status(403).json({
                    message: "Role is inactive"
                });
            }

            const permissions = user.role.permissions || [];

            if (
                permissions.includes("*") ||
                permissions.includes(permission)
            ) {
                req.role = user.role;      // controllers can use req.role.name
                return next();
            }

            // CHANGED: friendlier message
            return res.status(403).json({
                message: "You are not allowed to do this"
            });
        }
        catch (error) {
            console.log(error);

            return res.status(500).json({
                message: "Authorization failed"
            });
        }
    };
};

module.exports = authorize;