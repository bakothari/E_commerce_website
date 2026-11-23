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
  Package,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

// category / subcategory / brand can be a populated object ({ _id, name }) or plain id
const getId = (v) => (v && typeof v === "object" ? v._id : v || "");
const getName = (v) => (v && typeof v === "object" ? v.name : "-");

// the User.css badge uses the words "active" / "inactive"
const getStatus = (p) => (p.isActive ? "active" : "inactive");

// "a, b, c" -> ["a","b","c"]     (empty pieces are removed)
// images use a new line as separator because some image links contain commas
const toList = (text, separator) =>
  String(text || "")
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);

// small round picture in the table. If there is no picture, or the link is
// broken, the first letter of the product name is shown instead.
const ProductThumb = ({ src, name }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className="avatar">{name?.charAt(0).toUpperCase()}</span>;
  }

  return (
    <img
      className="thumb"
      style={{ width: 34, height: 34, borderRadius: "50%" }}
      src={src}
      alt={name}
      onError={() => setFailed(true)}
    />
  );
};

const emptyForm = {
  category: "",
  subcategory: "",
  brand: "",
  name: "",
  description: "",
  unit: "",
  images: "",
  tags: "",
  isFeatured: false,
  isActive: true
};

const Product = () => {
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
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
    const { name, value, type, checked } = e.target;

    // changing the category clears the old subcategory
    if (name === "category") {
      setFormData({ ...formData, category: value, subcategory: "" });
      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const getProducts = async () => {
    let token = localStorage.getItem("token");
    try {
      let response = await api.get("/product/getall", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
      setProducts(response.data.products || []);
    }
    catch (err) {
      showError(err);
    }
  };

  // dropdown lists. The first array found in the response is used,
  // so it works whatever key your category / brand controllers use.
  const getList = async (url, setter) => {
    let token = localStorage.getItem("token");
    try {
      let response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setter(Object.values(response.data).find(Array.isArray) || []);
    }
    catch (err) {
      // a role without read permission just gets an empty dropdown
      console.log(err);
    }
  };

  const editbutton = async (id) => {
    let token = localStorage.getItem("token");
    try {
      let response = await api.get(`/product/get/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(response.data);

      let product = response.data.product;

      setFormData({
        category: getId(product.category),
        subcategory: getId(product.subcategory),
        brand: getId(product.brand),
        name: product.name || "",
        description: product.description || "",
        unit: product.unit || "",
        images: (product.images || []).join("\n"),
        tags: (product.tags || []).join(", "),
        isFeatured: !!product.isFeatured,
        isActive: product.isActive !== false
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
      let response = await api.delete(`/product/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log(response.data);
      getProducts();
    }
    catch (err) {
      showError(err);
    }
  };

  const viewbutton = async (id) => {
    let token = localStorage.getItem("token");
    try {
      let response = await api.get(`/product/view/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log(response.data);
      setViewProduct(response.data.product);
    }
    catch (err) {
      showError(err);
    }
  };

  useEffect(() => {
    getProducts();
    getList("/category/getall", setCategories);
    getList("/subcategory/getall", setSubcategories);
    getList("/brand/getall", setBrands);
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
        `/product/status/${id}`,
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

      getProducts();

    } catch (err) {
      showError(err);
    }
  };

  const handleSubmit = async (e) => {
    let token = localStorage.getItem("token");
    e.preventDefault();

    // the form keeps images and tags as text; the database needs real lists
    const payload = {
      ...formData,
      images: toList(formData.images, /\r?\n/),
      tags: toList(formData.tags, ",")
    };

    try {
      if (editId) {
        let response = await api.put(
          `/product/update/${editId}`,
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
          "/product/create",
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
      getProducts();
    }
    catch (err) {
      showError(err);
    }
  };

  const q = search.trim().toLowerCase();
  const filteredProducts = products.filter(
    (p) =>
      !q ||
      p.name?.toLowerCase().includes(q) ||
      getName(p.category).toLowerCase().includes(q) ||
      getName(p.brand).toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
  );
  const activeCount = products.filter((p) => p.isActive !== false).length;
  const inactiveCount = products.filter((p) => p.isActive === false).length;

  // subcategories of the chosen category (if they have a category field)
  const visibleSubcategories = subcategories.filter(
    (s) => !s.category || getId(s.category) === formData.category
  );

  // pictures typed in the form, shown as a preview
  const previewImages = toList(formData.images, /\r?\n/);

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
          <span className="stat-icon"><Package size={20} /></span>
          <span>Products - {products.length}</span>
        </div>

        <div className="stat-card">
          <span className="stat-icon"><CheckCircle size={20} /></span>
          <span>Active Products - {activeCount}</span>
        </div>

        <div className="stat-card">
          <span className="stat-icon"><XCircle size={20} /></span>
          <span>Inactive Products - {inactiveCount}</span>
        </div>
      </div>

      {/* ---------- search + add ---------- */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search products..."
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
              <th>Category</th>
              <th>Brand</th>
              <th>Unit</th>
              <th>Featured</th>
              <th>Rating</th>
              <th>Status</th>
              <th className="actions-col">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                <td>
                  <div className="name-cell">
                    <ProductThumb
                      key={product.images?.[0]}
                      src={product.images?.[0]}
                      name={product.name}
                    />
                    {product.name}
                  </div>
                </td>
                <td>{getName(product.category)}</td>
                <td>{getName(product.brand)}</td>
                <td>{product.unit || "-"}</td>
                <td>{product.isFeatured ? "Yes" : "No"}</td>
                <td>{product.rating ?? 0} ({product.totalReviews ?? 0})</td>
                <td>
                  <span className={`status ${getStatus(product)}`}>
                    {getStatus(product)}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-btn view"
                      title="View"
                      onClick={() => viewbutton(product._id)}
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      className="icon-btn edit"
                      title="Edit"
                      onClick={() => editbutton(product._id)}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      className="icon-btn delete"
                      title="Delete"
                      onClick={() => deletebbutton(product._id)}
                    >
                      <Trash2 size={17} />
                    </button>
                    {product.isActive !== false ? (
                      <button
                        className="status-btn inactive-btn"
                        title="Make inactive"
                        onClick={() => changeStatus(product._id, "inactive")}
                      >
                        <ShieldAlert size={17} />
                      </button>
                    ) : (
                      <button
                        className="status-btn active-btn"
                        title="Make active"
                        onClick={() => changeStatus(product._id, "active")}
                      >
                        <ShieldCheck size={17} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-row">
                  No products found
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
              <h2>{editId ? "Edit Product" : "Add Product"}</h2>
              <button type="button" className="icon-btn" onClick={closeForm} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* ---------- CATEGORY / SUBCATEGORY / BRAND DROPDOWNS ---------- */}
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subcategory</label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                >
                  <option value="">Select subcategory</option>
                  {visibleSubcategories.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Brand</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                >
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  name="unit"
                  placeholder="e.g. 1 kg, 500 ml, 1 pack"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="About the product"
                  value={formData.description}
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

                {/* live preview: a picture that cannot load is hidden */}
                {previewImages.length > 0 && (
                  <div className="img-row">
                    {previewImages.map((url, i) => (
                      <img
                        key={url + i}
                        src={url}
                        alt={`Preview ${i + 1}`}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="fresh, dairy, organic"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  Featured product
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editId ? "Update Product" : "Add Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---------- view modal ---------- */}
      {viewProduct && (
        <div className="modal-overlay">
          <div className="modal">

            <div className="modal-head">
              <h2>Product Details</h2>
              <button type="button" className="icon-btn" onClick={() => setViewProduct(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* all pictures of the product */}
            {(viewProduct.images || []).length > 0 && (
              <div className="img-row">
                {viewProduct.images.map((url, i) => (
                  <img
                    key={url + i}
                    src={url}
                    alt={`${viewProduct.name} ${i + 1}`}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ))}
              </div>
            )}

            <div className="details">
              <div className="detail-row">
                <span>Name</span>
                <strong>{viewProduct.name}</strong>
              </div>
              <div className="detail-row">
                <span>Slug</span>
                <strong>{viewProduct.slug}</strong>
              </div>
              <div className="detail-row">
                <span>Category</span>
                <strong>{getName(viewProduct.category)}</strong>
              </div>
              <div className="detail-row">
                <span>Subcategory</span>
                <strong>{getName(viewProduct.subcategory)}</strong>
              </div>
              <div className="detail-row">
                <span>Brand</span>
                <strong>{getName(viewProduct.brand)}</strong>
              </div>
              <div className="detail-row">
                <span>Unit</span>
                <strong>{viewProduct.unit || "-"}</strong>
              </div>
              <div className="detail-row">
                <span>Description</span>
                <strong>{viewProduct.description || "-"}</strong>
              </div>
              <div className="detail-row">
                <span>Tags</span>
                <strong>{(viewProduct.tags || []).join(", ") || "-"}</strong>
              </div>
              <div className="detail-row">
                <span>Featured</span>
                <strong>{viewProduct.isFeatured ? "Yes" : "No"}</strong>
              </div>
              <div className="detail-row">
                <span>Rating</span>
                <strong>{viewProduct.rating ?? 0} ({viewProduct.totalReviews ?? 0} reviews)</strong>
              </div>
              <div className="detail-row">
                <span>Status</span>
                <strong>{getStatus(viewProduct)}</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setViewProduct(null)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Product;