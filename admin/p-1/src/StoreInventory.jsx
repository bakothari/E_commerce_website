import React, { useEffect, useState } from "react";
import "./User.css"; // same styles as the User page
import api from "./api/axios";
import {
    Search,
    Plus,
    Eye,
    Pencil,
    Trash2,
    X,
    Boxes,
    TriangleAlert,
    CircleX,
    CircleAlert,
    Store as StoreIcon,
    Package,
    Layers,
    Hash,
    ShieldCheck,
    ShieldAlert,
} from "lucide-react";

const API = "/storeinventory";

// token saved at login; sent with every request
const getAuth = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

const emptyForm = {
    store: "",
    product: "",
    variant: "",
    quantity: 0,
    reservedQuantity: 0,
    reorderLevel: 0,
    maxStockLevel: 0,
    status: "active"
};

// populated field ({ _id, name }) or plain id -> id
const idOf = (value) =>
    value && typeof value === "object" ? value._id : value || "";

// populated field -> a readable name (we don't know which field your models use)
const nameOf = (value) => {
    if (!value) return "-";
    if (typeof value !== "object") return "-";
    return value.name || value.title || value.sku || value.variantName || value._id;
};

// ok / low / out  -> based on available quantity and reorder level
const getStockState = (item) => {
    const available = Number(item.availableQuantity) || 0;
    const reorder = Number(item.reorderLevel) || 0;

    if (available <= 0) return "out";
    if (available <= reorder) return "low";
    return "ok";
};

const stockStyles = {
    ok: { label: "In stock", background: "#dcfce7", color: "#166534" },
    low: { label: "Low stock", background: "#fef3c7", color: "#92400e" },
    out: { label: "Out of stock", background: "#fee2e2", color: "#991b1b" }
};

const StockBadge = ({ state }) => {
    const s = stockStyles[state];

    return (
        <span
            style={{
                background: s.background,
                color: s.color,
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap"
            }}
        >
            {s.label}
        </span>
    );
};

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

const StoreInventory = () => {
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [items, setItems] = useState([]);
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [search, setSearch] = useState("");
    const [errors, setErrors] = useState({});
    const [errorMsg, setErrorMsg] = useState("");

    const [formData, setFormData] = useState(emptyForm);

    // 401 = token missing / expired  -> go back to login
    // anything else (403 = not allowed, 409, 500...) -> only show the message
    const handleAuthError = (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }

        setErrorMsg(err.response?.data?.message || "Something went wrong");
        setTimeout(() => setErrorMsg(""), 4000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "product") {
            // a variant belongs to one product, so clear it when the product changes
            setFormData({ ...formData, product: value, variant: "" });
        }
        else {
            setFormData({ ...formData, [name]: value });
        }

        if (errors[name]) setErrors({ ...errors, [name]: "" });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.store) newErrors.store = "Please select a store";
        if (!formData.product) newErrors.product = "Please select a product";

        const numberFields = ["quantity", "reservedQuantity", "reorderLevel", "maxStockLevel"];

        numberFields.forEach((key) => {
            const n = Number(formData[key]);
            if (formData[key] === "" || !Number.isFinite(n) || n < 0) {
                newErrors[key] = "Enter a number that is 0 or more";
            }
        });

        if (!newErrors.quantity && !newErrors.reservedQuantity) {
            if (Number(formData.reservedQuantity) > Number(formData.quantity)) {
                newErrors.reservedQuantity = "Cannot be more than quantity";
            }
        }

        if (
            !newErrors.quantity &&
            !newErrors.maxStockLevel &&
            Number(formData.maxStockLevel) > 0 &&
            Number(formData.quantity) > Number(formData.maxStockLevel)
        ) {
            newErrors.maxStockLevel = "Must be at least the quantity (or 0 for no limit)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getItems = async () => {
        try {
            let response = await api.get(`${API}/getall`, getAuth());
            console.log(response.data);
            setItems(response.data.inventories || response.data.data || []);
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    // stores, products and variants for the dropdowns
    const getOptions = async () => {
        try {
            let response = await api.get(`${API}/options`, getAuth());
            setStores((response.data.stores || []).filter((x) => !x.isDeleted));
            setProducts((response.data.products || []).filter((x) => !x.isDeleted));
            setVariants((response.data.variants || []).filter((x) => !x.isDeleted));
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    const editbutton = async (id) => {
        try {
            let response = await api.get(`${API}/get/${id}`, getAuth());
            console.log(response.data);

            let item = response.data.inventory || response.data.data;

            setFormData({
                store: idOf(item.store),
                product: idOf(item.product),
                variant: idOf(item.variant),
                quantity: item.quantity ?? 0,
                reservedQuantity: item.reservedQuantity ?? 0,
                reorderLevel: item.reorderLevel ?? 0,
                maxStockLevel: item.maxStockLevel ?? 0,
                status: item.status || "active"
            });

            setErrors({});
            setEditId(id);
            setShowForm(true);
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    const deletebutton = async (id) => {
        try {
            let response = await api.delete(`${API}/delete/${id}`, getAuth());
            console.log(response.data);
            getItems();
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    // action button in the table: Active <-> Inactive
    const toggleStatus = async (item) => {
        const newStatus = item.status === "active" ? "inactive" : "active";

        try {
            await api.put(`${API}/update/${item._id}`, {
                store: idOf(item.store),
                product: idOf(item.product),
                variant: idOf(item.variant),
                quantity: item.quantity,
                reservedQuantity: item.reservedQuantity,
                reorderLevel: item.reorderLevel,
                maxStockLevel: item.maxStockLevel,
                status: newStatus
            }, getAuth());
            getItems();
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    const viewbutton = async (id) => {
        try {
            let response = await api.get(`${API}/get/${id}`, getAuth());
            console.log(response.data);
            setViewItem(response.data.inventory || response.data.data);
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    useEffect(() => {
        getItems();
        getOptions();
    }, []);

    const openAddForm = () => {
        setFormData(emptyForm);
        setErrors({});
        setEditId(null);
        setShowForm(true);
    };

    const closeForm = () => {
        setFormData(emptyForm);
        setErrors({});
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (editId) {
                let response = await api.put(`${API}/update/${editId}`, formData, getAuth());
                console.log(response.data);
            }
            else {
                let response = await api.post(`${API}/create`, formData, getAuth());
                console.log(response.data);
            }

            closeForm();
            getItems();
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    // variants of the selected product (if your variants have a "product" field)
    const variantOptions = variants.filter(
        (v) => !formData.product || !v.product || idOf(v.product) === formData.product
    );

    // read-only value shown in the form
    const availablePreview = Math.max(
        (Number(formData.quantity) || 0) - (Number(formData.reservedQuantity) || 0),
        0
    );

    const lowCount = items.filter((i) => getStockState(i) === "low").length;
    const outCount = items.filter((i) => getStockState(i) === "out").length;

    const q = search.trim().toLowerCase();
    const filteredItems = items.filter(
        (i) =>
            !q ||
            nameOf(i.store).toLowerCase().includes(q) ||
            nameOf(i.product).toLowerCase().includes(q) ||
            nameOf(i.variant).toLowerCase().includes(q)
    );

    return (
        <div className="user-page">

            {/* ---------- error message (e.g. "You are not allowed to do this") ---------- */}
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
                    <span className="stat-icon"><Boxes size={20} /></span>
                    <span>Inventory Records - {items.length}</span>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><TriangleAlert size={20} /></span>
                    <span>Low Stock - {lowCount}</span>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><CircleX size={20} /></span>
                    <span>Out of Stock - {outCount}</span>
                </div>
            </div>

            {/* ---------- search + add ---------- */}
            <div className="toolbar">
                <div className="search-wrap">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by store, product or variant..."
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
                            <th>Store</th>
                            <th>Product</th>
                            <th>Variant</th>
                            <th>Quantity</th>
                            <th>Reserved</th>
                            <th>Available</th>
                            <th>Reorder Level</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th className="actions-col">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item._id}>
                                <td className="name-cell">{nameOf(item.store)}</td>
                                <td>{nameOf(item.product)}</td>
                                <td>{nameOf(item.variant)}</td>
                                <td>{item.quantity}</td>
                                <td>{item.reservedQuantity}</td>
                                <td>{item.availableQuantity}</td>
                                <td>{item.reorderLevel}</td>
                                <td><StockBadge state={getStockState(item)} /></td>
                                <td>
                                    <span className={`badge ${item.status === "active" ? "badge-active" : "badge-inactive"}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="row-actions">
                                        <button className="icon-btn view" title="View" onClick={() => viewbutton(item._id)}>
                                            <Eye size={17} />
                                        </button>
                                        <button className="icon-btn edit" title="Edit" onClick={() => editbutton(item._id)}>
                                            <Pencil size={17} />
                                        </button>
                                        <button className="icon-btn delete" title="Delete" onClick={() => deletebutton(item._id)}>
                                            <Trash2 size={17} />
                                        </button>
                                        {item.status === "active" ? (
                                            <button
                                                className="status-btn inactive-btn"
                                                title="Make inactive"
                                                onClick={() => toggleStatus(item)}
                                            >
                                                <ShieldAlert size={17} />
                                            </button>
                                        ) : (
                                            <button
                                                className="status-btn active-btn"
                                                title="Make active"
                                                onClick={() => toggleStatus(item)}
                                            >
                                                <ShieldCheck size={17} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredItems.length === 0 && (
                            <tr>
                                <td colSpan="10" className="empty-row">
                                    No inventory found
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
                            <h2>{editId ? "Edit Inventory" : "Add Inventory"}</h2>
                            <button type="button" className="icon-btn" onClick={closeForm} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>

                            <Field label="Store" icon={StoreIcon} name="store" error={errors.store}>
                                <select
                                    id="store"
                                    name="store"
                                    value={formData.store}
                                    onChange={handleChange}
                                >
                                    <option value="">Select store</option>
                                    {stores.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {nameOf(s)}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Product" icon={Package} name="product" error={errors.product}>
                                <select
                                    id="product"
                                    name="product"
                                    value={formData.product}
                                    onChange={handleChange}
                                >
                                    <option value="">Select product</option>
                                    {products.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {nameOf(p)}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Variant (optional)" icon={Layers} name="variant" error={errors.variant}>
                                <select
                                    id="variant"
                                    name="variant"
                                    value={formData.variant}
                                    onChange={handleChange}
                                >
                                    <option value="">No variant</option>
                                    {variantOptions.map((v) => (
                                        <option key={v._id} value={v._id}>
                                            {nameOf(v)}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Quantity" icon={Hash} name="quantity" error={errors.quantity}>
                                <input
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Reserved Quantity" icon={Hash} name="reservedQuantity" error={errors.reservedQuantity}>
                                <input
                                    id="reservedQuantity"
                                    type="number"
                                    min="0"
                                    name="reservedQuantity"
                                    value={formData.reservedQuantity}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Available Quantity (auto)" icon={Hash} name="availableQuantity">
                                <input
                                    id="availableQuantity"
                                    type="number"
                                    value={availablePreview}
                                    readOnly
                                />
                            </Field>

                            <Field label="Reorder Level" icon={Hash} name="reorderLevel" error={errors.reorderLevel}>
                                <input
                                    id="reorderLevel"
                                    type="number"
                                    min="0"
                                    name="reorderLevel"
                                    value={formData.reorderLevel}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Max Stock Level (0 = no limit)" icon={Hash} name="maxStockLevel" error={errors.maxStockLevel}>
                                <input
                                    id="maxStockLevel"
                                    type="number"
                                    min="0"
                                    name="maxStockLevel"
                                    value={formData.maxStockLevel}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Status" icon={ShieldCheck} name="status" error={errors.status}>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </Field>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editId ? "Update Inventory" : "Add Inventory"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* ---------- view modal ---------- */}
            {viewItem && (
                <div className="modal-overlay">
                    <div className="modal">

                        <div className="modal-head">
                            <h2>Inventory Details</h2>
                            <button type="button" className="icon-btn" onClick={() => setViewItem(null)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="details">
                            <div className="detail-row">
                                <span>Store</span>
                                <strong>{nameOf(viewItem.store)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Product</span>
                                <strong>{nameOf(viewItem.product)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Variant</span>
                                <strong>{nameOf(viewItem.variant)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Quantity</span>
                                <strong>{viewItem.quantity}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Reserved</span>
                                <strong>{viewItem.reservedQuantity}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Available</span>
                                <strong>{viewItem.availableQuantity}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Reorder Level</span>
                                <strong>{viewItem.reorderLevel}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Max Stock Level</span>
                                <strong>{viewItem.maxStockLevel || "No limit"}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Stock</span>
                                <strong><StockBadge state={getStockState(viewItem)} /></strong>
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
                                <span>Last Restocked</span>
                                <strong>{viewItem.lastRestockedAt ? new Date(viewItem.lastRestockedAt).toLocaleString() : "-"}</strong>
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

export default StoreInventory;