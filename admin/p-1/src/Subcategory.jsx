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
    Layers,
    CircleCheck,
    CircleX,
    Tag,
    Link2,
    FileText,
    Image as ImageIcon,
    CircleAlert,
    LayoutGrid,
    ShieldCheck,
    ShieldAlert,
} from "lucide-react";

const API = "/subcategory";
const CATEGORY_API = "/category";

// token saved at login; sent with every request
const getAuth = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

const emptyForm = {
    category: "",
    name: "",
    slug: "",
    description: "",
    image: "",
    status: "active"
};

const slugify = (text) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

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

const SubCategory = () => {
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [errors, setErrors] = useState({});
    const [slugEdited, setSlugEdited] = useState(false);
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

        if (name === "name" && !slugEdited) {
            setFormData({ ...formData, name: value, slug: slugify(value) });
        }
        else if (name === "slug") {
            setSlugEdited(true);
            setFormData({ ...formData, slug: value.toLowerCase().replace(/\s+/g, "-") });
        }
        else {
            setFormData({ ...formData, [name]: value });
        }

        if (errors[name]) setErrors({ ...errors, [name]: "" });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.category) newErrors.category = "Please select a category";
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.slug.trim()) newErrors.slug = "Slug is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getItems = async () => {
        try {
            let response = await api.get(`${API}/getall`, getAuth());
            console.log(response.data);
            setItems(
                response.data.subcategories ||
                response.data.subCategories ||
                response.data.data ||
                []
            );
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    // categories for the dropdown
    const getCategories = async () => {
        try {
            let response = await api.get(`${CATEGORY_API}/getall`, getAuth());
            let list = response.data.categories || response.data.data || [];
            setCategories(list.filter((c) => !c.isDeleted));
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    const getCategoryName = (item) => {
        if (!item.category) return "-";
        if (typeof item.category === "object") return item.category.name || "-";
        return categories.find((c) => c._id === item.category)?.name || "-";
    };

    const editbutton = async (id) => {
        try {
            let response = await api.get(`${API}/get/${id}`, getAuth());
            console.log(response.data);

            let item =
                response.data.subcategory ||
                response.data.subCategory ||
                response.data.data;

            setFormData({
                category:
                    typeof item.category === "object"
                        ? item.category?._id || ""
                        : item.category || "",
                name: item.name || "",
                slug: item.slug || "",
                description: item.description || "",
                image: item.image || "",
                status: item.status || "active"
            });

            setSlugEdited(true);
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
                category: typeof item.category === "object" ? item.category?._id : item.category,
                name: item.name,
                slug: item.slug,
                description: item.description,
                image: item.image,
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
            setViewItem(
                response.data.subcategory ||
                response.data.subCategory ||
                response.data.data
            );
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    useEffect(() => {
        getItems();
        getCategories();
    }, []);

    const openAddForm = () => {
        setFormData(emptyForm);
        setErrors({});
        setSlugEdited(false);
        setEditId(null);
        setShowForm(true);
    };

    const closeForm = () => {
        setFormData(emptyForm);
        setErrors({});
        setSlugEdited(false);
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

    const visible = items.filter((c) => !c.isDeleted);
    const activeCount = visible.filter((c) => c.status === "active").length;
    const inactiveCount = visible.length - activeCount;

    const q = search.trim().toLowerCase();
    const filteredItems = visible.filter(
        (c) =>
            !q ||
            c.name?.toLowerCase().includes(q) ||
            c.slug?.toLowerCase().includes(q) ||
            getCategoryName(c).toLowerCase().includes(q)
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
                    <span className="stat-icon"><Layers size={20} /></span>
                    <span>Sub Categories - {visible.length}</span>
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
                        placeholder="Search sub categories..."
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
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Slug</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th className="actions-col">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item._id}>
                                <td>
                                    {item.image ? (
                                        <img
                                            className="thumb"
                                            src={item.image}
                                            alt={item.name}
                                            onError={(e) => (e.target.style.visibility = "hidden")}
                                        />
                                    ) : (
                                        <span className="thumb thumb-empty"><ImageIcon size={18} /></span>
                                    )}
                                </td>
                                <td className="name-cell">{item.name}</td>
                                <td>{getCategoryName(item)}</td>
                                <td>{item.slug}</td>
                                <td className="address-cell" title={item.description}>
                                    {item.description}
                                </td>
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
                                <td colSpan="7" className="empty-row">
                                    No sub categories found
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
                            <h2>{editId ? "Edit Sub Category" : "Add Sub Category"}</h2>
                            <button type="button" className="icon-btn" onClick={closeForm} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>

                            <Field label="Category" icon={LayoutGrid} name="category" error={errors.category}>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Name" icon={Tag} name="name" error={errors.name}>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Smartphones"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Slug" icon={Link2} name="slug" error={errors.slug}>
                                <input
                                    id="slug"
                                    type="text"
                                    name="slug"
                                    placeholder="e.g. smartphones"
                                    value={formData.slug}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Description" icon={FileText} name="description" error={errors.description}>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    placeholder="Short description"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Image URL" icon={ImageIcon} name="image" error={errors.image}>
                                <input
                                    id="image"
                                    type="text"
                                    name="image"
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={handleChange}
                                />
                            </Field>

                            {formData.image && (
                                <img
                                    className="image-preview"
                                    src={formData.image}
                                    alt="Preview"
                                    onError={(e) => (e.target.style.display = "none")}
                                    onLoad={(e) => (e.target.style.display = "block")}
                                />
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editId ? "Update Sub Category" : "Add Sub Category"}
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
                            <h2>Sub Category Details</h2>
                            <button type="button" className="icon-btn" onClick={() => setViewItem(null)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        {viewItem.image && (
                            <img
                                className="image-preview"
                                src={viewItem.image}
                                alt={viewItem.name}
                                onError={(e) => (e.target.style.display = "none")}
                            />
                        )}

                        <div className="details">
                            <div className="detail-row">
                                <span>Name</span>
                                <strong>{viewItem.name}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Category</span>
                                <strong>{getCategoryName(viewItem)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Slug</span>
                                <strong>{viewItem.slug}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Description</span>
                                <strong>{viewItem.description || "-"}</strong>
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

export default SubCategory;