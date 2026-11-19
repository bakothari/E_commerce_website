// Small helper to ask "can this user do X?" in the React app.
// Login must save:  localStorage.setItem("permissions", JSON.stringify(response.data.permissions))

export const getPermissions = () => {
    try {
        return JSON.parse(localStorage.getItem("permissions")) || [];
    }
    catch {
        return [];
    }
};

export const can = (permission) => {
    const permissions = getPermissions();
    return permissions.includes("*") || permissions.includes(permission);
};