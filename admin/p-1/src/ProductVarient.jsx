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
    Layers,
    CheckCircle,
    XCircle,
    ShieldCheck,
    ShieldAlert
} from "lucide-react";

// product can be a populated object ({ _id, name }) or plain id
const getId = (v) => (v && typeof v === "object" ? v._id : v || "");
const getName = (v) => (v && typeof v === "object" ? v.name : "-");

const money = (n) => (n === undefined || n === null ? "-" : `₹${n}`);

const emptyForm = {
    product: "",
    name: "",
    sku: "",
    barcode: "",
    unitValue: "",
    unit: "",
    mrp: "",
    sellingPrice: "",
    weight: "",
    dimensions: "",
    images: ""
};

const ProductVariant = () => {
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [viewVariant, setViewVariant] = useState(null);
    const [variants, setVariants] = useState([]);
    const [products, setProducts] = useState([]);
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

    const getVariants = async () => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.get("/productvariant/getall", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(response.data);
            setVariants(response.data.variants);
        }
        catch (err) {
            showError(err);
        }
    };

    const getProducts = async () => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.get("/product/getall", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(response.data.products);
        }
        catch (err) {
            // a role without product.read just gets an empty dropdown
            console.log(err);
        }
    };

    const editbutton = async (id) => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.get(`/productvariant/get/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(response.data);

            let v = response.data.variant;

            setFormData({
                product: getId(v.product),
                name: v.name || "",
                sku: v.sku || "",
                barcode: v.barcode || "",
                unitValue: v.unitValue ?? "",
                unit: v.unit || "",
                mrp: v.mrp ?? "",
                sellingPrice: v.sellingPrice ?? "",
                weight: v.weight ?? "",
                dimensions: v.dimensions || "",
                images: (v.images || []).join("\n")
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
            let response = await api.delete(`/productvariant/delete/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log(response.data);
            getVariants();
        }
        catch (err) {
            showError(err);
        }
    };

    const viewbutton = async (id) => {
        let token = localStorage.getItem("token");
        try {
            let response = await api.get(`/productvariant/get/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log(response.data);
            setViewVariant(response.data.variant);
        }
        catch (err) {
            showError(err);
        }
    };

    useEffect(() => {
        getVariants();
        getProducts();
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
                `/productvariant/status/${id}`,
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

            getVariants();

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
                    `/productvariant/update/${editId}`,
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
                    "/productvariant/create",
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
            getVariants();
        }
        catch (err) {
            showError(err);
        }
    };

    const q = search.trim().toLowerCase();
    const filteredVariants = variants.filter(
        (v) =>
            !q ||
            v.name?.toLowerCase().includes(q) ||
            v.sku?.toLowerCase().includes(q) ||
            String(v.barcode || "").includes(q) ||
            getName(v.product).toLowerCase().includes(q)
    );
    const activeCount = variants.filter((v) => v.status !== "inactive").length;
    const inactiveCount = variants.filter((v) => v.status === "inactive").length;

    // live discount shown under the price fields
    const mrpNum = Number(formData.mrp);
    const sellNum = Number(formData.sellingPrice);
    const liveDiscount =
        formData.mrp !== "" && formData.sellingPrice !== "" && mrpNum > 0
            ? Math.round(((mrpNum - sellNum) / mrpNum) * 10000) / 100
            : null;

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
                    <span className="stat-icon"><Layers size={20} /></span>
                    <span>Variants - {variants.length}</span>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><CheckCircle size={20} /></span>
                    <span>Active Variants - {activeCount}</span>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><XCircle size={20} /></span>
                    <span>Inactive Variants - {inactiveCount}</span>
                </div>
            </div>

            {/* ---------- search + add ---------- */}
            <div className="toolbar">
                <div className="search-wrap">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, SKU, barcode, product..."
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
                            <th>Variant</th>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Unit</th>
                            <th>MRP</th>
                            <th>Price</th>
                            <th>Discount</th>
                            <th>Status</th>
                            <th className="actions-col">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredVariants.map((variant) => (
                            <tr key={variant._id}>
                                <td>
                                    <div className="name-cell">
                                        {variant.images?.[0] ? (
                                            <img
                                                src={variant.images[0]}
                                                alt=""
                                                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <span className="avatar">
                                                {variant.name?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                        {variant.name}
                                    </div>
                                </td>
                                <td>{getName(variant.product)}</td>
                                <td>{variant.sku}</td>
                                <td>
                                    {variant.unitValue ?? ""} {variant.unit || ""}
                                </td>
                                <td>{money(variant.mrp)}</td>
                                <td>{money(variant.sellingPrice)}</td>
                                <td>{variant.discountPercentage ?? 0}%</td>
                                <td>
                                    <span className={`status ${variant.status}`}>
                                        {variant.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="row-actions">
                                        <button
                                            className="icon-btn view"
                                            title="View"
                                            onClick={() => viewbutton(variant._id)}
                                        >
                                            <Eye size={17} />
                                        </button>
                                        <button
                                            className="icon-btn edit"
                                            title="Edit"
                                            onClick={() => editbutton(variant._id)}
                                        >
                                            <Pencil size={17} />
                                        </button>
                                        <button
                                            className="icon-btn delete"
                                            title="Delete"
                                            onClick={() => deletebbutton(variant._id)}
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                        {variant.status === "active" ? (
                                            <button
                                                className="status-btn inactive-btn"
                                                onClick={() => changeStatus(variant._id, "inactive")}
                                            >
                                                <ShieldAlert size={17} />
                                            </button>
                                        ) : (
                                            <button
                                                className="status-btn active-btn"
                                                onClick={() => changeStatus(variant._id, "active")}
                                            >
                                                <ShieldCheck size={17} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredVariants.length === 0 && (
                            <tr>
                                <td colSpan="9" className="empty-row">
                                    No variants found
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
                            <h2>{editId ? "Edit Variant" : "Add Variant"}</h2>
                            <button type="button" className="icon-btn" onClick={closeForm} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* ---------- PRODUCT DROPDOWN ---------- */}
                            <div className="form-group">
                                <label>Product</label>
                                <select
                                    name="product"
                                    value={formData.product}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select product</option>
                                    {products.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Variant Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Red / Large, 500 ml pack"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>SKU</label>
                                <input
                                    type="text"
                                    name="sku"
                                    placeholder="e.g. MILK-500ML"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Barcode</label>
                                <input
                                    type="text"
                                    name="barcode"
                                    placeholder="Enter barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Unit Value</label>
                                <input
                                    type="number"
                                    name="unitValue"
                                    min="0"
                                    step="any"
                                    placeholder="e.g. 500"
                                    value={formData.unitValue}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Unit</label>
                                <input
                                    type="text"
                                    name="unit"
                                    placeholder="e.g. ml, g, kg, pcs"
                                    value={formData.unit}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>MRP (₹)</label>
                                <input
                                    type="number"
                                    name="mrp"
                                    min="0"
                                    step="0.01"
                                    placeholder="Maximum retail price"
                                    value={formData.mrp}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Selling Price (₹)</label>
                                <input
                                    type="number"
                                    name="sellingPrice"
                                    min="0"
                                    step="0.01"
                                    placeholder="Price customer pays"
                                    value={formData.sellingPrice}
                                    onChange={handleChange}
                                    required
                                />
                                {liveDiscount !== null && (
                                    <span style={{ fontSize: "0.82rem", color: liveDiscount < 0 ? "#c0392b" : "#66726d" }}>
                                        {liveDiscount < 0
                                            ? "Selling price is more than MRP"
                                            : `Discount: ${liveDiscount}%`}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Weight (kg)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    min="0"
                                    step="any"
                                    placeholder="Enter weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Dimensions</label>
                                <input
                                    type="text"
                                    name="dimensions"
                                    placeholder="e.g. 10 x 5 x 3 cm"
                                    value={formData.dimensions}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Image URLs (one per line)</label>
                                <textarea
                                    name="images"
                                    rows={3}
                                    placeholder="https://..."
                                    value={formData.images}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editId ? "Update Variant" : "Add Variant"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* ---------- view modal ---------- */}
            {viewVariant && (
                <div className="modal-overlay">
                    <div className="modal">

                        <div className="modal-head">
                            <h2>Variant Details</h2>
                            <button type="button" className="icon-btn" onClick={() => setViewVariant(null)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="details">
                            <div className="detail-row">
                                <span>Product</span>
                                <strong>{getName(viewVariant.product)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Name</span>
                                <strong>{viewVariant.name}</strong>
                            </div>
                            <div className="detail-row">
                                <span>SKU</span>
                                <strong>{viewVariant.sku}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Barcode</span>
                                <strong>{viewVariant.barcode || "-"}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Unit</span>
                                <strong>{viewVariant.unitValue ?? ""} {viewVariant.unit || "-"}</strong>
                            </div>
                            <div className="detail-row">
                                <span>MRP</span>
                                <strong>{money(viewVariant.mrp)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Selling Price</span>
                                <strong>{money(viewVariant.sellingPrice)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Discount</span>
                                <strong>{viewVariant.discountPercentage ?? 0}%</strong>
                            </div>
                            <div className="detail-row">
                                <span>Weight</span>
                                <strong>{viewVariant.weight ?? "-"} {viewVariant.weight ? "kg" : ""}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Dimensions</span>
                                <strong>{viewVariant.dimensions || "-"}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Status</span>
                                <strong>{viewVariant.status}</strong>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-primary" onClick={() => setViewVariant(null)}>
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductVariant;