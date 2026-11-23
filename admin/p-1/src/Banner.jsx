import { useEffect, useState } from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor } from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Banner.css";
import api from "./api/axios"

const API = "/admin/banners";
const HEIGHTS = { small: 100, medium: 160, big: 240, hero: 320 };
import {
    ClassicEditor,
    Essentials,
    Paragraph,
    Bold,
    Italic,
    Heading,
    Link,
    List,
    BlockQuote
} from "ckeditor5";
const empty = {
    name: "",
    type: "text",
    content: "",
    image: "",
    link: "",
    size: "medium",
    backgroundColor: "#16a34a",
    textColor: "#ffffff",
    textAlign: "center",
    startDate: "",
    endDate: "",
    status: "active",
};

const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
const toInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

// background style shared by the live preview and the list
const bannerStyle = (b) => ({
    background:
        b.type === "image" && b.image
            ? `linear-gradient(rgba(0,0,0,${b.content ? 0.35 : 0}),rgba(0,0,0,${b.content ? 0.35 : 0})), url(${b.image}) center/cover`
            : b.backgroundColor,
    color: b.textColor,
    textAlign: b.textAlign,
    minHeight: HEIGHTS[b.size] ?? HEIGHTS.medium,
});

export default function Banners() {
    const [form, setForm] = useState(empty);
    const [editingId, setEditingId] = useState(null);
    const [banners, setBanners] = useState([]);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editorReady, setEditorReady] = useState(false);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    async function load() {
        try {
            const { data } = await api.get(API, authHeader());
            setBanners(data.banners||[]);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load banners");
        }
    }
    useEffect(() => { load(); }, []);

    async function submit(e) {
        e.preventDefault();
        if (!form.name.trim()) return toast.error("Banner name is required");
        if (form.type === "text" && !form.content.replace(/<[^>]*>/g, "").trim())
            return toast.error("Banner text is required");
        if (form.type === "image" && !form.image)
            return toast.error("Please upload or paste an image");

        try {
            setSaving(true);
            const res = editingId
                ? await api.put(`${API}/${editingId}`, form, authHeader())
                : await api.post(API, form, authHeader());
            toast.success(res.data.message);
            reset();
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save banner");
        } finally {
            setSaving(false);
        }
    }

    async function upload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("image", file);
        try {
            setUploading(true);
            const { data } = await api.post(`${API}/upload`, fd, authHeader());
            set("image", data.url);
            toast.success("Image uploaded");
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    }

    function edit(b) {
        setEditingId(b._id);
        setForm({
            name: b.name,
            type: b.type || "text",
            content: b.content || "",
            image: b.image || "",
            link: b.link || "",
            size: b.size || "medium",
            backgroundColor: b.backgroundColor,
            textColor: b.textColor,
            textAlign: b.textAlign,
            startDate: toInput(b.startDate),
            endDate: toInput(b.endDate),
            status: b.status,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function reset() {
        setEditingId(null);
        setForm(empty);
    }
    useEffect(() => {
        setEditorReady(true);
    }, []);
    async function remove(b) {
        if (!window.confirm(`Delete "${b.name}"?`)) return;
        try {
            await api.delete(`${API}/${b._id}`, authHeader());
            toast.info("Banner deleted");
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not delete banner");
        }
    }

    async function toggle(b) {
        try {
            await api.put(
                `${API}/${b._id}`,
                { ...b, status: b.status === "active" ? "inactive" : "active" },
                authHeader()
            );
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not update status");
        }
    }

    return (
        <div className="bn-page">
            <ToastContainer position="top-right" autoClose={2500} />
            <h1>Banners</h1>

            <form className="bn-card" onSubmit={submit}>
                <h2>{editingId ? "Edit banner" : "Create banner"}</h2>

                <label>Banner name</label>
                <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Diwali Sale 50% off"
                />

                <div className="bn-grid">
                    <div>
                        <label>Banner type</label>
                        <select value={form.type} onChange={(e) => set("type", e.target.value)}>
                            <option value="text">Text banner</option>
                            <option value="image">Image banner</option>
                        </select>
                    </div>
                    <div>
                        <label>Size</label>
                        <select value={form.size} onChange={(e) => set("size", e.target.value)}>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="big">Big</option>
                            <option value="hero">Full hero</option>
                        </select>
                    </div>
                </div>

                {form.type === "image" && (
                    <>
                        <label>Banner image</label>
                        <input type="file" accept="image/*" onChange={upload} />
                        {uploading && <p>Uploading...</p>}
                        <input
                            value={form.image}
                            onChange={(e) => set("image", e.target.value)}
                            placeholder="...or paste an image URL"
                        />
                        <label>Click link (optional)</label>
                        <input
                            value={form.link}
                            onChange={(e) => set("link", e.target.value)}
                            placeholder="/products?category=... or https://..."
                        />
                    </>
                )}

                <label>{form.type === "image" ? "Text on image (optional)" : "Banner text"}</label>
                {editorReady && (
                    <CKEditor
                        key={editingId || "new"}
                        editor={ClassicEditor}
                        data={form.content}
                        config={{
                            licenseKey: "GPL",
                            plugins: [
                                Essentials,
                                Paragraph,
                                Bold,
                                Italic,
                                Heading,
                                Link,
                                List,
                                BlockQuote
                            ],
                            toolbar: [
                                "heading", "|",
                                "bold",
                                "italic",
                                "link", "|",
                                "bulletedList",
                                "numberedList",
                                "blockQuote", "|",
                                "undo",
                                "redo"
                            ]
                        }}
                        onChange={(_, editor) => set("content", editor.getData())}
                    />
                )}

                <div className="bn-grid">
                    <div>
                        <label>Background</label>
                        <input type="color" value={form.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} />
                    </div>
                    <div>
                        <label>Text colour</label>
                        <input type="color" value={form.textColor} onChange={(e) => set("textColor", e.target.value)} />
                    </div>
                    <div>
                        <label>Alignment</label>
                        <select value={form.textAlign} onChange={(e) => set("textAlign", e.target.value)}>
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                    <div>
                        <label>Status</label>
                        <select value={form.status} onChange={(e) => set("status", e.target.value)}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label>Show from (optional)</label>
                        <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                    </div>
                    <div>
                        <label>Hide after (optional)</label>
                        <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
                    </div>
                </div>

                <label>Live preview</label>
                <div
                    className="bn-preview bn-content"
                    style={bannerStyle(form)}
                    dangerouslySetInnerHTML={{
                        __html:
                            form.content ||
                            (form.type === "image" ? "" : "<p>Your banner will look like this</p>"),
                    }}
                />

                <div className="bn-actions">
                    <button type="submit" disabled={saving || uploading} className="bn-primary">
                        {saving ? "Saving..." : editingId ? "Update banner" : "Create banner"}
                    </button>
                    {editingId && (
                        <button type="button" onClick={reset} className="bn-ghost">Cancel</button>
                    )}
                </div>
            </form>

            <h2 className="bn-list-title">All banners</h2>
            {banners.length === 0 && <p>No banners yet.</p>}
            {banners.map((b) => (
                <div key={b._id} className="bn-card">
                    <div className="bn-row">
                        <strong>
                            {b.name}{" "}
                            <small style={{ color: "#6b7280", fontWeight: 400 }}>
                                ({b.type || "text"}, {b.size || "medium"})
                            </small>
                        </strong>
                        <span className={`bn-badge ${b.status}`}>{b.status}</span>
                    </div>
                    <div
                        className="bn-preview bn-content"
                        style={bannerStyle(b)}
                        dangerouslySetInnerHTML={{ __html: b.content }}
                    />
                    <div className="bn-actions">
                        <button onClick={() => edit(b)} className="bn-ghost">Edit</button>
                        <button onClick={() => toggle(b)} className="bn-ghost">
                            {b.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => remove(b)} className="bn-danger">Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
}