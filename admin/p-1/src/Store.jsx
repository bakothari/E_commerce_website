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
    Store as StoreIcon,
    CheckCircle,
    XCircle,
    ShieldCheck,
    ShieldAlert
} from "lucide-react";

// store.manager can be a populated object ({ _id, name, email }) or plain id
const getManagerName = (manager) =>
    manager && typeof manager === "object" ? manager.name : "-";

const getManagerId = (manager) =>
    manager && typeof manager === "object" ? manager._id : manager || "";

const emptyForm = {
    name: "",
    code: "",
    manager: "",
    phone: "",
    address: "",
    location: "",
    serviceRadius: ""
};

const Store = () => {
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [viewStore, setViewStore] = useState(null);
    const [stores, setStores] = useState([]);
    const [managers, setManagers] = useState([]);
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

    const getStores = async () => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.get("/store/getall", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(response.data);
            setStores(response.data.stores);
        }
        catch (err) {
            showError(err);
        }
    };

    // users with the STORE_MANAGER role fill the manager dropdown
    const getManagers = async () => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.get("/user/getall", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            let list = response.data.users.filter((u) => {
                let roleName = u.role && typeof u.role === "object" ? u.role.name : u.role;
                return roleName === "STORE_MANAGER";
            });
            setManagers(list);
        }
        catch (err) {
            // a role without user.read just gets an empty dropdown
            console.log(err);
        }
    };

    const editbutton = async (id) => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.get(`/store/get/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(response.data);

            let store = response.data.store;

            setFormData({
                name: store.name || "",
                code: store.code || "",
                manager: getManagerId(store.manager),
                phone: store.phone || "",
                address: store.address || "",
                location: store.location || "",
                serviceRadius: store.serviceRadius ?? ""
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
            let response = await api.delete(`/store/delete/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log(response.data);
            getStores();
        }
        catch (err) {
            showError(err);
        }
    };

    const viewbutton = async (id) => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.get(`/store/get/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log(response.data);
            setViewStore(response.data.store);
        }
        catch (err) {
            showError(err);
        }
    };

    useEffect(() => {
        getStores();
        getManagers();
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
                `/store/status/${id}`,
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

            getStores();

        } catch (err) {
            showError(err);
        }
    };

    const handleSubmit = async (e) => {
        let token = localStorage.getItem("token");
        e.preventDefault();

        // serviceRadius must go to the backend as a number
        let payload = {
            ...formData,
            serviceRadius: formData.serviceRadius === "" ? undefined : Number(formData.serviceRadius)
        };

        try {
            if (editId) {
                let response = await api.put(
                    `/store/update/${editId}`,
                    payload,
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
                    "/store/create",
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                console.log(response.data);
            }

            closeForm();
            getStores();
        }
        catch (err) {
            showError(err);
        }
    };

    const q = search.trim().toLowerCase();
    const filteredStores = stores.filter(
        (s) =>
            !q ||
            s.name?.toLowerCase().includes(q) ||
            s.code?.toLowerCase().includes(q) ||
            String(s.phone || "").includes(q) ||
            getManagerName(s.manager).toLowerCase().includes(q)
    );
    const activeCount = stores.filter((s) => s.status !== "inactive").length;
    const inactiveCount = stores.filter((s) => s.status === "inactive").length;

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
                    <span className="stat-icon"><StoreIcon size={20} /></span>
                    <span>Stores - {stores.length}</span>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><CheckCircle size={20} /></span>
                    <span>Active Stores - {activeCount}</span>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><XCircle size={20} /></span>
                    <span>Inactive Stores - {inactiveCount}</span>
                </div>
            </div>

            {/* ---------- search + add ---------- */}
            <div className="toolbar">
                <div className="search-wrap">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search stores..."
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
                            <th>Code</th>
                            <th>Manager</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Radius (km)</th>
                            <th>Status</th>
                            <th className="actions-col">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredStores.map((store) => (
                            <tr key={store._id}>
                                <td>
                                    <div className="name-cell">
                                        <span className="avatar">
                                            {store.name?.charAt(0).toUpperCase()}
                                        </span>
                                        {store.name}
                                    </div>
                                </td>
                                <td>{store.code}</td>
                                <td>{getManagerName(store.manager)}</td>
                                <td>{store.phone}</td>

                                <td className="address-cell" title={store.address}>
                                    {store.address}
                                </td>
                                <td>{store.serviceRadius ?? "-"}</td>
                                <td>
                                    <span className={`status ${store.status}`}>
                                        {store.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="row-actions">
                                        <button
                                            className="icon-btn view"
                                            title="View"
                                            onClick={() => viewbutton(store._id)}
                                        >
                                            <Eye size={17} />
                                        </button>
                                        <button
                                            className="icon-btn edit"
                                            title="Edit"
                                            onClick={() => editbutton(store._id)}
                                        >
                                            <Pencil size={17} />
                                        </button>
                                        <button
                                            className="icon-btn delete"
                                            title="Delete"
                                            onClick={() => deletebbutton(store._id)}
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                        {store.status === "active" ? (
                                            <button
                                                className="status-btn inactive-btn"
                                                onClick={() => changeStatus(store._id, "inactive")}
                                            >
                                                <ShieldAlert size={17} />
                                            </button>
                                        ) : (
                                            <button
                                                className="status-btn active-btn"
                                                onClick={() => changeStatus(store._id, "active")}
                                            >
                                                <ShieldCheck size={17} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredStores.length === 0 && (
                            <tr>
                                <td colSpan="8" className="empty-row">
                                    No stores found
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
                            <h2>{editId ? "Edit Store" : "Add Store"}</h2>
                            <button type="button" className="icon-btn" onClick={closeForm} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="form-group">
                                <label>Store Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter store name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Store Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    placeholder="e.g. STR001"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* ---------- MANAGER DROPDOWN ---------- */}
                            <div className="form-group">
                                <label>Manager</label>
                                <select
                                    name="manager"
                                    value={formData.manager}
                                    onChange={handleChange}
                                >
                                    <option value="">Select manager</option>
                                    {managers.map((m) => (
                                        <option key={m._id} value={m._id}>
                                            {m.name} ({m.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
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

                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Area / landmark or map link"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Service Radius (km)</label>
                                <input
                                    type="number"
                                    name="serviceRadius"
                                    min="0"
                                    placeholder="Enter delivery radius"
                                    value={formData.serviceRadius}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editId ? "Update Store" : "Add Store"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* ---------- view modal ---------- */}
            {viewStore && (
                <div className="modal-overlay">
                    <div className="modal">

                        <div className="modal-head">
                            <h2>Store Details</h2>
                            <button type="button" className="icon-btn" onClick={() => setViewStore(null)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="details">
                            <div className="detail-row">
                                <span>Name</span>
                                <strong>{viewStore.name}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Code</span>
                                <strong>{viewStore.code}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Manager</span>
                                <strong>{getManagerName(viewStore.manager)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Phone</span>
                                <strong>{viewStore.phone}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Address</span>
                                <strong>{viewStore.address}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Location</span>
                                <strong>{viewStore.location}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Service Radius</span>
                                <strong>{viewStore.serviceRadius ?? "-"} km</strong>
                            </div>
                            <div className="detail-row">
                                <span>Status</span>
                                <strong>{viewStore.status}</strong>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-primary" onClick={() => setViewStore(null)}>
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Store;