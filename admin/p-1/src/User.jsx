import React, { useEffect, useState } from "react";
import "./User.css";
import api from "./api/axios";
import {
    Search,
    Plus,
    Eye,
    Pencil,
    Trash2,
    X,
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    ShieldAlert
} from "lucide-react";

// Same role names as your seedRoles.js (value = role name, label = shown on screen)
const ROLES = [
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "ADMIN", label: "Admin" },
    { value: "STORE_MANAGER", label: "Store Manager" },
    { value: "INVENTORY_MANAGER", label: "Inventory Manager" },
    { value: "DELIVERY_PARTNER", label: "Delivery Partner" },
    { value: "SUPPORT_AGENT", label: "Support Agent" },
    { value: "CUSTOMER", label: "Customer" }
];

// user.role can be a populated object ({ _id, name }) or plain text
const getRoleName = (role) =>
    role && typeof role === "object" ? role.name : role;

const getRoleLabel = (role) => {
    const name = getRoleName(role);
    return ROLES.find((r) => r.value === name)?.label || name || "-";
};

const emptyForm = {
    name: "",
    email: "",
    mobile: "",
    gender: "",
    address: "",
    role: ""
};

const User = () => {
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [viewUser, setViewUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState(emptyForm);
    const [errorMsg, setErrorMsg] = useState("");

    // shows the message sent by the backend (e.g. "You are not allowed to do this")
    const showError = (err) => {
        console.log(err);
        setErrorMsg(err.response?.data?.message || "Something went wrong");
        setTimeout(() => setErrorMsg(""), 4000);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getUsers = async () => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.get("/user/getall", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(response.data);
            setUsers(response.data.users);
        }
        catch (err) {
            showError(err);
        }
    };

    const editbutton = async (id) => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.get(`/user/get/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(response.data);

            let user = response.data.user;

            setFormData({
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                gender: user.gender,
                address: user.address,
                role: getRoleName(user.role) || ""
            });

            setEditId(id);
            setShowForm(true);
        }
        catch (err) {
            showError(err);
        }
    };

    const deletebbutton = async (id) => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.delete(`/user/delete/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log(response.data);
            getUsers();
        }
        catch (err) {
            showError(err);
        }
    };

    const viewbutton = async (id) => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.get(`/user/get/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }

            );
            console.log(response.data);
            setViewUser(response.data.user);
        }
        catch (err) {
            showError(err);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    const openAddForm = () => {
        setFormData(emptyForm);
        setEditId(null);
        setShowForm(true);
    };

    const closeForm = () => {
        setFormData(emptyForm);
        setEditId(null);
        setShowForm(false);
    };
    const changeStatus = async (id, status) => {
        let token = localStorage.getItem("token");
        try {

            let response = await api.put(
                `/user/status/${id}`,
                {
                    status: status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(response.data);

            getUsers();

        } catch (err) {
            showError(err);
        }
    };
    const handleSubmit = async (e) => {
        let token = localStorage.getItem("token");
        e.preventDefault();

        try {
            if (editId) {
                let response = await api.put(
                    `/user/update/${editId}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                console.log(response.data);
            }
            else {
                let response = await api.post(
                    "/user/create",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                console.log(response.data);
            }

            closeForm();
            getUsers();
        }
        catch (err) {
            showError(err);
        }
    };

    const q = search.trim().toLowerCase();
    const filteredUsers = users.filter(
        (u) =>
            !q ||
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            String(u.mobile || "").includes(q)
    );
    const activeCount = users.filter((u) => u.status !== "inactive").length;
    const inactiveCount = users.filter((u) => u.status === "inactive").length;

    return (
        <div className="user-page">

            {/* ---------- error message ---------- */}
            {errorMsg && (
                <div
                    style={{
                        position: "fixed",
                        top: 16,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 9999,
                        background: "#dc2626",
                        color: "#fff",
                        padding: "10px 18px",
                        borderRadius: 8,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                    }}
                >
                    {errorMsg}
                </div>
            )}

            {/* ---------- top cards ---------- */}
            <div className="stats">
                <div className="stat-card">
                    <span className="stat-icon"><Users size={20} /></span>
                    <span>Users - {users.length}</span>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><UserCheck size={20} /></span>
                    <span>Active User - {activeCount}</span>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><UserX size={20} /></span>
                    <span>InActive User - {inactiveCount}</span>
                </div>
            </div>

            {/* ---------- search + add ---------- */}
            <div className="toolbar">
                <div className="search-wrap">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <button className="add-btn" onClick={openAddForm}>
                    <Plus size={18} /> Add
                </button>
            </div>

            {/* ---------- table ---------- */}
            <div className="table-wrap">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Mobile-No</th>
                            <th>Role</th>
                            <th>Address</th>
                            <th>Status</th>
                            <th className="actions-col">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <div className="name-cell">
                                        <span className="avatar">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                        {user.name}
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>{user.mobile}</td>
                                <td>{getRoleLabel(user.role)}</td>

                                <td className="address-cell" title={user.address}>
                                    {user.address}
                                </td>
                                <td>
                                    <span className={`status ${user.status}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="row-actions">
                                        <button
                                            className="icon-btn view"
                                            title="View"
                                            onClick={() => viewbutton(user._id)}
                                        >
                                            <Eye size={17} />
                                        </button>
                                        <button
                                            className="icon-btn edit"
                                            title="Edit"
                                            onClick={() => editbutton(user._id)}
                                        >
                                            <Pencil size={17} />
                                        </button>
                                        <button
                                            className="icon-btn delete"
                                            title="Delete"
                                            onClick={() => deletebbutton(user._id)}
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                        {user.status === "active" ? (
                                            <button
                                                className="status-btn inactive-btn"
                                                onClick={() => changeStatus(user._id, "inactive")}
                                            >
                                                <ShieldAlert size={17} />
                                            </button>
                                        ) : (
                                            <button
                                                className="status-btn active-btn"
                                                onClick={() => changeStatus(user._id, "active")}
                                            >
                                                <ShieldCheck size={17} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="7" className="empty-row">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ---------- add / edit modal ---------- */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">

                        <div className="modal-head">
                            <h2>{editId ? "Edit User" : "Add User"}</h2>
                            <button type="button" className="icon-btn" onClick={closeForm} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    placeholder="Enter mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* ---------- ROLE DROPDOWN ---------- */}
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select role</option>
                                    {ROLES.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    placeholder="House no, street, city"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editId ? "Update User" : "Add User"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* ---------- view modal ---------- */}
            {viewUser && (
                <div className="modal-overlay">
                    <div className="modal">

                        <div className="modal-head">
                            <h2>User Details</h2>
                            <button type="button" className="icon-btn" onClick={() => setViewUser(null)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="details">
                            <div className="detail-row">
                                <span>Name</span>
                                <strong>{viewUser.name}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Email</span>
                                <strong>{viewUser.email}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Mobile</span>
                                <strong>{viewUser.mobile}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Role</span>
                                <strong>{getRoleLabel(viewUser.role)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Address</span>
                                <strong>{viewUser.address}</strong>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-primary" onClick={() => setViewUser(null)}>
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default User;