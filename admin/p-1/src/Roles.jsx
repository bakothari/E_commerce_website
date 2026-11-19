import React, { useEffect, useState } from "react";
import "./User.css"; // same styles as the other pages
import api from "./api/axios";
import { can } from "./access";
import {
    Search,
    Plus,
    Eye,
    Pencil,
    Trash2,
    X,
    KeyRound,
    CircleCheck,
    CircleX,
    Tag,
    CircleAlert,
    Lock,
    ShieldCheck,
    ShieldAlert,
} from "lucide-react";

const API = "/role";

// token saved at login; sent with every request
const getAuth = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

// 401 = token missing / expired -> login.   403 = this role is not allowed -> message
const handleAuthError = (err) => {
    if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
    }
    else if (err.response?.status === 403) {
        alert(err.response?.data?.message || "Access denied");
    }
};

const emptyForm = {
    name: "",
    permissions: []     // permission names, like "user.read"
};

// "STORE_MANAGER" -> "STORE MANAGER"
const prettyName = (name) => name.replace(/_/g, " ");

// "delivery.read_assigned" -> "read assigned"
const actionName = (p) => p.split(".").slice(1).join(" ").replace(/_/g, " ");

// { user: ["user.read", ...], category: [...] }
const groupByModule = (list) =>
    list.reduce((groups, p) => {
        const module = p.split(".")[0];
        if (!groups[module]) groups[module] = [];
        groups[module].push(p);
        return groups;
    }, {});

// defined outside so inputs don't lose focus on every re-render
const Field = ({ label, icon: Icon, name, error, children }) => (
    <div className={`field ${error ? "has-error" : ""}`}>
        <label htmlFor={name}>{label}</label>
        <div className="input-wrap">
            <Icon className="field-icon" size={18} />
            {children}
        </div>
        {error && (
            <span className="error-text">
                <CircleAlert size={14} /> {error}
            </span>
        )}
    </div>
);

const Roles = () => {
    const [editId, setEditId] = useState(null);
    const [editingDefault, setEditingDefault] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [items, setItems] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [search, setSearch] = useState("");
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState(emptyForm);

    const getItems = async () => {
        try {
            let response = await api.get(`${API}/getall`, getAuth());
            console.log(response.data);
            setItems(response.data.roles || []);
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    const getPermissions = async () => {
        try {
            let response = await api.get(`${API}/permissions`, getAuth());
            setAllPermissions(response.data.permissions || []);
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    useEffect(() => {
        getItems();
        getPermissions();
    }, []);

    const grouped = groupByModule(allPermissions);

    const togglePermission = (name) => {
        const has = formData.permissions.includes(name);
        setFormData({
            ...formData,
            permissions: has
                ? formData.permissions.filter((x) => x !== name)
                : [...formData.permissions, name]
        });
    };

    // tick / untick a whole module (user.read, user.create, ...)
    const toggleModule = (list) => {
        const allOn = list.every((name) => formData.permissions.includes(name));

        setFormData({
            ...formData,
            permissions: allOn
                ? formData.permissions.filter((name) => !list.includes(name))
                : [...new Set([...formData.permissions, ...list])]
        });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Role name is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const openAddForm = () => {
        setFormData(emptyForm);
        setErrors({});
        setEditingDefault(false);
        setEditId(null);
        setShowForm(true);
    };

    const openEditForm = (role) => {
        setFormData({
            name: role.name,
            permissions: role.permissions.filter((p) => p !== "*")
        });
        setErrors({});
        setEditingDefault(role.isDefault);
        setEditId(role._id);
        setShowForm(true);
    };

    const closeForm = () => {
        setFormData(emptyForm);
        setErrors({});
        setEditingDefault(false);
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (editId) {
                // the name of a default role never changes
                const body = editingDefault
                    ? { permissions: formData.permissions }
                    : formData;

                await api.put(`${API}/update/${editId}`, body, getAuth());
            }
            else {
                await api.post(`${API}/create`, formData, getAuth());
            }

            closeForm();
            getItems();
        }
        catch (err) {
            console.log(err);
            setErrors({ form: err.response?.data?.message || "Something went wrong" });
            handleAuthError(err);
        }
    };

    // action button: Active <-> Inactive
    const toggleStatus = async (role) => {
        const newStatus = role.status === "active" ? "inactive" : "active";

        try {
            await api.put(`${API}/update/${role._id}`, { status: newStatus }, getAuth());
            getItems();
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    const deletebutton = async (role) => {
        if (!window.confirm(`Delete the role ${prettyName(role.name)}?`)) return;

        try {
            await api.delete(`${API}/delete/${role._id}`, getAuth());
            getItems();
        }
        catch (err) {
            console.log(err);

            // for example "2 user(s) still have this role"
            if (err.response?.status === 409) {
                alert(err.response.data.message);
            }
            handleAuthError(err);
        }
    };

    const activeCount = items.filter((r) => r.status === "active").length;
    const inactiveCount = items.length - activeCount;

    const q = search.trim().toLowerCase();
    const filteredItems = items.filter(
        (r) => !q || r.name.toLowerCase().includes(q) || prettyName(r.name).toLowerCase().includes(q)
    );

    return (
        <div className="user-page">

            {/* ---------- top cards ---------- */}
            <div className="stats">
                <div className="stat-card">
                    <span className="stat-icon"><KeyRound size={20} /></span>
                    <span>Roles - {items.length}</span>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><CircleCheck size={20} /></span>
                    <span>Active - {activeCount}</span>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><CircleX size={20} /></span>
                    <span>Inactive - {inactiveCount}</span>
                </div>
            </div>

            {/* ---------- search + add ---------- */}
            <div className="toolbar">
                <div className="search-wrap">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search roles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {can("role.create") && (
                    <button className="add-btn" onClick={openAddForm}>
                        <Plus size={18} /> Add
                    </button>
                )}
            </div>

            {/* ---------- table ---------- */}
            <div className="table-wrap">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Permissions</th>
                            <th>Users</th>
                            <th>Status</th>
                            <th className="actions-col">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredItems.map((role) => (
                            <tr key={role._id}>
                                <td className="name-cell">{prettyName(role.name)}</td>
                                <td>
                                    {role.permissions.includes("*")
                                        ? "Everything"
                                        : `${role.permissions.length} permissions`}
                                </td>
                                <td>{role.userCount}</td>
                                <td>
                                    <span className={`badge ${role.status === "active" ? "badge-active" : "badge-inactive"}`}>
                                        {role.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="row-actions">
                                        <button className="icon-btn view" title="View" onClick={() => setViewItem(role)}>
                                            <Eye size={17} />
                                        </button>

                                        {role.name === "SUPER_ADMIN" ? (
                                            <span className="icon-btn" title="SUPER_ADMIN cannot be changed">
                                                <Lock size={17} />
                                            </span>
                                        ) : (
                                            <>
                                                {can("role.update") && (
                                                    <button className="icon-btn edit" title="Edit" onClick={() => openEditForm(role)}>
                                                        <Pencil size={17} />
                                                    </button>
                                                )}

                                                {can("role.delete") && !role.isDefault && (
                                                    <button className="icon-btn delete" title="Delete" onClick={() => deletebutton(role)}>
                                                        <Trash2 size={17} />
                                                    </button>
                                                )}

                                                {can("role.update") && (role.status === "active" ? (
                                                    <button
                                                        className="status-btn inactive-btn"
                                                        title="Make inactive"
                                                        onClick={() => toggleStatus(role)}
                                                    >
                                                        <ShieldAlert size={17} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="status-btn active-btn"
                                                        title="Make active"
                                                        onClick={() => toggleStatus(role)}
                                                    >
                                                        <ShieldCheck size={17} />
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredItems.length === 0 && (
                            <tr>
                                <td colSpan="5" className="empty-row">
                                    No roles found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ---------- add / edit modal ---------- */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal wide">

                        <div className="modal-head">
                            <h2>{editId ? "Edit Role" : "Add Role"}</h2>
                            <button type="button" className="icon-btn" onClick={closeForm} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>

                            <Field label="Role name" icon={Tag} name="name" error={errors.name}>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="e.g. WAREHOUSE STAFF"
                                    value={formData.name}
                                    disabled={editingDefault}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        setErrors({ ...errors, name: "", form: "" });
                                    }}
                                />
                            </Field>

                            {editingDefault && (
                                <span className="hint">The name of a default role cannot be changed.</span>
                            )}

                            <div className="field">
                                <label>Permissions ({formData.permissions.length} selected)</label>

                                <div className="perm-groups">
                                    {Object.keys(grouped).map((module) => {
                                        const list = grouped[module];
                                        const allOn = list.every((p) => formData.permissions.includes(p));

                                        return (
                                            <div className="perm-group" key={module}>
                                                <div className="perm-group-head">
                                                    <span>{module}</span>
                                                    <button
                                                        type="button"
                                                        className="perm-select-all"
                                                        onClick={() => toggleModule(list)}
                                                    >
                                                        {allOn ? "Clear all" : "Select all"}
                                                    </button>
                                                </div>

                                                <div className="perm-list">
                                                    {list.map((p) => (
                                                        <label className="check" key={p}>
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.permissions.includes(p)}
                                                                onChange={() => togglePermission(p)}
                                                            />
                                                            {actionName(p)}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {errors.form && (
                                <span className="error-text">
                                    <CircleAlert size={14} /> {errors.form}
                                </span>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editId ? "Update Role" : "Add Role"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* ---------- view modal ---------- */}
            {viewItem && (
                <div className="modal-overlay">
                    <div className="modal wide">

                        <div className="modal-head">
                            <h2>Role Details</h2>
                            <button type="button" className="icon-btn" onClick={() => setViewItem(null)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="details">
                            <div className="detail-row">
                                <span>Name</span>
                                <strong>{prettyName(viewItem.name)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Type</span>
                                <strong>{viewItem.isDefault ? "Default role" : "Custom role"}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Status</span>
                                <strong>
                                    <span className={`badge ${viewItem.status === "active" ? "badge-active" : "badge-inactive"}`}>
                                        {viewItem.status}
                                    </span>
                                </strong>
                            </div>
                            <div className="detail-row">
                                <span>Users</span>
                                <strong>{viewItem.userCount}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Permissions</span>
                                <strong>
                                    {viewItem.permissions.includes("*") ? (
                                        "Everything"
                                    ) : viewItem.permissions.length === 0 ? (
                                        "None"
                                    ) : (
                                        <span className="perm-chips">
                                            {viewItem.permissions.map((p) => (
                                                <span className="perm-chip" key={p}>{p}</span>
                                            ))}
                                        </span>
                                    )}
                                </strong>
                            </div>
                            <div className="detail-row">
                                <span>Created</span>
                                <strong>{viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString() : "-"}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Updated</span>
                                <strong>{viewItem.updatedAt ? new Date(viewItem.updatedAt).toLocaleString() : "-"}</strong>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-primary" onClick={() => setViewItem(null)}>
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;