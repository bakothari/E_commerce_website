// ALL permissions of the project are written here.
// Every permission is  "module.action"  (example: "user.create").
//
// To add a new permission, add one line here.
// Then give it to a role in seedRoles.js and use it on a route:
//     checkPermission("user.create")

const PERMISSIONS = {
    // ---------- dashboard ----------
    DASHBOARD_READ: "dashboard.read",

    // ---------- user ----------
    USER_CREATE: "user.create",
    USER_READ: "user.read",
    USER_UPDATE: "user.update",
    USER_DELETE: "user.delete",

    // ---------- role ----------
    ROLE_CREATE: "role.create",
    ROLE_READ: "role.read",
    ROLE_UPDATE: "role.update",
    ROLE_DELETE: "role.delete",

    // ---------- store ----------
    STORE_CREATE: "store.create",
    STORE_READ: "store.read",
    STORE_UPDATE: "store.update",
    STORE_DELETE: "store.delete",

    // ---------- inventory ----------
    INVENTORY_CREATE: "inventory.create",
    INVENTORY_READ: "inventory.read",
    INVENTORY_UPDATE: "inventory.update",
    INVENTORY_DELETE: "inventory.delete",

    // ---------- category ----------
    CATEGORY_CREATE: "category.create",
    CATEGORY_READ: "category.read",
    CATEGORY_UPDATE: "category.update",
    CATEGORY_DELETE: "category.delete",

    // ---------- subcategory ----------
    SUBCATEGORY_CREATE: "subcategory.create",
    SUBCATEGORY_READ: "subcategory.read",
    SUBCATEGORY_UPDATE: "subcategory.update",
    SUBCATEGORY_DELETE: "subcategory.delete",

    // ---------- brand ----------
    BRAND_CREATE: "brand.create",
    BRAND_READ: "brand.read",
    BRAND_UPDATE: "brand.update",
    BRAND_DELETE: "brand.delete",

    // ---------- product ----------
    PRODUCT_CREATE: "product.create",
    PRODUCT_READ: "product.read",
    PRODUCT_UPDATE: "product.update",
    PRODUCT_DELETE: "product.delete",

    // ---------- order ----------
    ORDER_CREATE: "order.create",
    ORDER_READ: "order.read",
    ORDER_UPDATE: "order.update",
    ORDER_DELETE: "order.delete",

    // ---------- delivery ----------
    DELIVERY_READ_ASSIGNED: "delivery.read_assigned",
    DELIVERY_UPDATE_STATUS: "delivery.update_status",

    // ---------- support ----------
    SUPPORT_READ: "support.read",

    // ---------- profile ----------
    PROFILE_READ_OWN: "profile.read_own",
    PROFILE_UPDATE_OWN: "profile.update_own",

    EMAILTEMPLATE_CREATE: "emailtemplate.create",
    EMAILTEMPLATE_READ: "emailtemplate.read",
    EMAILTEMPLATE_UPDATE: "emailtemplate.update",
    EMAILTEMPLATE_DELETE: "emailtemplate.delete",
};

module.exports = PERMISSIONS;