import React, { useEffect, useRef, useState } from "react";
import "./User.css"; // same styles as the other pages
import api from "./api/axios"
import { can } from "./access";
import {
    Search,
    Plus,
    Eye,
    Pencil,
    Trash2,
    X,
    Mail,
    CircleCheck,
    CircleX,
    Tag,
    KeyRound,
    FileText,
    Type,
    CircleAlert,
    Lock,
    ShieldCheck,
    ShieldAlert,
} from "lucide-react";

const API = "/email-template";

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

// a readable sentence for a failed request
const explainError = (err) => {
    if (!err.response) return "Cannot reach the server. Is the backend running?";
    if (err.response.data?.message) return err.response.data.message;
    if (err.response.status === 404) return "Server answered 404: check app.use(\"/email-template\", ...) in server.js.";
    return `Server answered with status ${err.response.status}.`;
};

// the placeholders you can type in a subject or body
const VARIABLES = ["name", "email", "password", "otp", "appName"];

// sample values only for the preview
const SAMPLE = {
    name: "John Doe",
    email: "john@example.com",
    password: "Temp1234",
    otp: "123456",
    appName: "YourApp"
};

const fillSample = (text) =>
    (text || "").replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => SAMPLE[name] ?? "");

// the email as it will look (inside a sandboxed frame, so scripts never run)
const previewHtml = (body) =>
    `<body style="font-family:Arial,sans-serif;font-size:14px;color:#222;padding:12px;margin:0">${fillSample(body)}</body>`;

const emptyForm = {
    name: "",
    key: "",
    subject: "",
    body: ""
};

// "Welcome Email" -> "welcome_email"
const makeKey = (text) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

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

const EmailTemplates = () => {
    const [editId, setEditId] = useState(null);
    const [editingSystem, setEditingSystem] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [errors, setErrors] = useState({});
    const [loadError, setLoadError] = useState("");
    const [keyEdited, setKeyEdited] = useState(false);

    const [formData, setFormData] = useState(emptyForm);

    const bodyRef = useRef(null);
    const subjectRef = useRef(null);

    const getItems = async () => {
        try {
            let response = await api.get(`${API}/getall`, getAuth());
            console.log(response.data);
            setItems(response.data.templates || []);
            setLoadError("");
        }
        catch (err) {
            console.log(err);
            setLoadError(explainError(err));
            handleAuthError(err);
        }
    };

    useEffect(() => {
        getItems();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "name" && !keyEdited && !editId) {
            // the key follows the name until you type your own key
            setFormData({ ...formData, name: value, key: makeKey(value) });
        }
        else if (name === "key") {
            setKeyEdited(true);
            setFormData({ ...formData, key: value.toLowerCase().replace(/[^a-z0-9_]/g, "_") });
        }
        else {
            setFormData({ ...formData, [name]: value });
        }

        if (errors[name]) setErrors({ ...errors, [name]: "" });
    };

    // puts {{name}} where the cursor is in the body
    const insertVariable = (variable) => {
        const token = `{{${variable}}}`;
        const el = bodyRef.current;
        const start = el ? el.selectionStart : formData.body.length;
        const end = el ? el.selectionEnd : formData.body.length;

        setFormData({
            ...formData,
            body: formData.body.slice(0, start) + token + formData.body.slice(end)
        });

        setTimeout(() => {
            if (el) {
                el.focus();
                el.setSelectionRange(start + token.length, start + token.length);
            }
        }, 0);
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.key.trim()) newErrors.key = "Key is required";
        if (!formData.subject.trim()) newErrors.subject = "Subject is required";
        if (!formData.body.trim()) newErrors.body = "Body is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const openAddForm = () => {
        setFormData(emptyForm);
        setErrors({});
        setKeyEdited(false);
        setShowPreview(false);
        setEditingSystem(false);
        setEditId(null);
        setShowForm(true);
    };

    const openEditForm = (template) => {
        setFormData({
            name: template.name || "",
            key: template.key || "",
            subject: template.subject || "",
            body: template.body || ""
        });
        setErrors({});
        setKeyEdited(true);
        setShowPreview(false);
        setEditingSystem(template.isSystem);
        setEditId(template._id);
        setShowForm(true);
    };

    const closeForm = () => {
        setFormData(emptyForm);
        setErrors({});
        setKeyEdited(false);
        setShowPreview(false);
        setEditingSystem(false);
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (editId) {
                await api.put(`${API}/update/${editId}`, formData, getAuth());
            }
            else {
                await api.post(`${API}/create`, formData, getAuth());
            }

            closeForm();
            getItems();
        }
        catch (err) {
            console.log(err);
            setErrors({ form: explainError(err) });
            handleAuthError(err);
        }
    };

    // action button: Active <-> Inactive
    const toggleStatus = async (template) => {
        const newStatus = template.status === "active" ? "inactive" : "active";

        try {
            await api.put(`${API}/update/${template._id}`, { status: newStatus }, getAuth());
            getItems();
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    const deletebutton = async (template) => {
        if (!window.confirm(`Delete the template "${template.name}"?`)) return;

        try {
            await api.delete(`${API}/delete/${template._id}`, getAuth());
            getItems();
        }
        catch (err) {
            console.log(err);
            handleAuthError(err);
        }
    };

    const activeCount = items.filter((t) => t.status === "active").length;
    const inactiveCount = items.length - activeCount;

    const q = search.trim().toLowerCase();
    const filteredItems = items.filter(
        (t) =>
            !q ||
            t.name?.toLowerCase().includes(q) ||
            t.key?.toLowerCase().includes(q) ||
            t.subject?.toLowerCase().includes(q)
    );

    return (
        <div className="user-page">

            {/* ---------- top cards ---------- */}
            <div className="stats">
                <div className="stat-card">
                    <span className="stat-icon"><Mail size={20} /></span>
                    <span>Templates - {items.length}</span>
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
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {can("emailtemplate.create") && (
                    <button className="add-btn" onClick={openAddForm}>
                        <Plus size={18} /> Add
                    </button>
                )}
            </div>

            {loadError && (
                <span className="error-text">
                    <CircleAlert size={14} /> {loadError}
                </span>
            )}

            {/* ---------- table ---------- */}
            <div className="table-wrap">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Key</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th className="actions-col">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredItems.map((template) => (
                            <tr key={template._id}>
                                <td className="name-cell">{template.name}</td>
                                <td><code>{template.key}</code></td>
                                <td className="address-cell" title={template.subject}>
                                    {template.subject}
                                </td>
                                <td>
                                    <span className={`badge ${template.status === "active" ? "badge-active" : "badge-inactive"}`}>
                                        {template.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="row-actions">
                                        <button className="icon-btn view" title="View" onClick={() => setViewItem(template)}>
                                            <Eye size={17} />
                                        </button>

                                        {can("emailtemplate.update") && (
                                            <button className="icon-btn edit" title="Edit" onClick={() => openEditForm(template)}>
                                                <Pencil size={17} />
                                            </button>
                                        )}

                                        {can("emailtemplate.delete") && (template.isSystem ? (
                                            <span className="icon-btn" title="Used by the system, cannot be deleted">
                                                <Lock size={17} />
                                            </span>
                                        ) : (
                                            <button className="icon-btn delete" title="Delete" onClick={() => deletebutton(template)}>
                                                <Trash2 size={17} />
                                            </button>
                                        ))}

                                        {can("emailtemplate.update") && (template.status === "active" ? (
                                            <button
                                                className="status-btn inactive-btn"
                                                title="Make inactive"
                                                onClick={() => toggleStatus(template)}
                                            >
                                                <ShieldAlert size={17} />
                                            </button>
                                        ) : (
                                            <button
                                                className="status-btn active-btn"
                                                title="Make active"
                                                onClick={() => toggleStatus(template)}
                                            >
                                                <ShieldCheck size={17} />
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredItems.length === 0 && (
                            <tr>
                                <td colSpan="5" className="empty-row">
                                    No templates found
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
                            <h2>{editId ? "Edit Template" : "Add Template"}</h2>
                            <button type="button" className="icon-btn" onClick={closeForm} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>

                            <Field label="Name" icon={Tag} name="name" error={errors.name}>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Order confirmation"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Key" icon={KeyRound} name="key" error={errors.key}>
                                <input
                                    id="key"
                                    type="text"
                                    name="key"
                                    placeholder="e.g. order_confirmation"
                                    value={formData.key}
                                    disabled={!!editId}
                                    onChange={handleChange}
                                />
                            </Field>

                            <span className="hint">
                                {editId
                                    ? "The key cannot be changed, because the code finds the template by it."
                                    : "The code finds the template by this key. Use letters, numbers and underscores."}
                            </span>

                            <Field label="Subject" icon={Type} name="subject" error={errors.subject}>
                                <input
                                    id="subject"
                                    ref={subjectRef}
                                    type="text"
                                    name="subject"
                                    placeholder="e.g. Welcome {{name}}"
                                    value={formData.subject}
                                    onChange={handleChange}
                                />
                            </Field>

                            <Field label="Body (HTML)" icon={FileText} name="body" error={errors.body}>
                                <textarea
                                    id="body"
                                    ref={bodyRef}
                                    name="body"
                                    className="mail-body"
                                    rows={9}
                                    placeholder={"<h2>Hello {{name}}</h2>\n<p>Your message...</p>"}
                                    value={formData.body}
                                    onChange={handleChange}
                                />
                            </Field>

                            <div className="field">
                                <label>Click to add a placeholder to the body</label>
                                <div className="var-chips">
                                    {VARIABLES.map((v) => (
                                        <button
                                            key={v}
                                            type="button"
                                            className="var-chip"
                                            onClick={() => insertVariable(v)}
                                        >
                                            {`{{${v}}}`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="field">
                                <div className="perm-group-head">
                                    <span>Preview</span>
                                    <button
                                        type="button"
                                        className="perm-select-all"
                                        onClick={() => setShowPreview(!showPreview)}
                                    >
                                        {showPreview ? "Hide preview" : "Show preview"}
                                    </button>
                                </div>

                                {showPreview && (
                                    <>
                                        <span className="hint">Subject: <strong>{fillSample(formData.subject)}</strong></span>
                                        <iframe
                                            title="Email preview"
                                            className="mail-preview"
                                            sandbox=""
                                            srcDoc={previewHtml(formData.body)}
                                        />
                                    </>
                                )}
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
                                    {editId ? "Update Template" : "Add Template"}
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
                            <h2>Template Details</h2>
                            <button type="button" className="icon-btn" onClick={() => setViewItem(null)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="details">
                            <div className="detail-row">
                                <span>Name</span>
                                <strong>{viewItem.name}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Key</span>
                                <strong><code>{viewItem.key}</code></strong>
                            </div>
                            <div className="detail-row">
                                <span>Subject</span>
                                <strong>{viewItem.subject}</strong>
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

                        <div className="field" style={{ marginTop: 16 }}>
                            <label>How the email looks (with sample values)</label>
                            <span className="hint">Subject: <strong>{fillSample(viewItem.subject)}</strong></span>
                            <iframe
                                title="Email preview"
                                className="mail-preview"
                                sandbox=""
                                srcDoc={previewHtml(viewItem.body)}
                            />
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

export default EmailTemplates;