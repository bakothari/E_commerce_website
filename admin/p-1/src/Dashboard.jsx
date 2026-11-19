import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "./api/axios"
import "./DashboardHome.css";
import {
  Users,
  Store,
  Warehouse,
  LayoutGrid,
  Layers,
  Package,
  Notebook,
  Boxes,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";

const API = "/dashboard";

// token saved at login; sent with every request
const getAuth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

// key = the same key the backend sends, to = the page that opens on click
// (the paths are the same as the links in Layout.jsx)
const CARDS = [
  { key: "users", label: "Users", to: "/user", icon: Users, color: "#4f46e5", bg: "#eef2ff" },
  { key: "stores", label: "Stores", to: "/store", icon: Store, color: "#0891b2", bg: "#ecfeff" },
  { key: "inventory", label: "Store Inventory", to: "/storeinventory", icon: Warehouse, color: "#059669", bg: "#ecfdf5" },
  { key: "products", label: "Products", to: "/product", icon: Package, color: "#d97706", bg: "#fffbeb" },
  { key: "variants", label: "Product Variants", to: "/productvarient", icon: Boxes, color: "#7c3aed", bg: "#f5f3ff" },
  { key: "categories", label: "Categories", to: "/category", icon: LayoutGrid, color: "#db2777", bg: "#fdf2f8" },
  { key: "subcategories", label: "Sub Categories", to: "/subcategory", icon: Layers, color: "#2563eb", bg: "#eff6ff" },
  { key: "brands", label: "Brands", to: "/brands", icon: Notebook, color: "#ea580c", bg: "#fff7ed" }
];

// number that counts up from 0 when it appears
const CountUp = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (typeof value !== "number") return;

    let frame;
    const start = performance.now();
    const duration = 700;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return typeof value === "number" ? display : "—";
};

const DashboardHome = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 401 = token missing / expired  -> go back to login
  // anything else (403 = not allowed, 500...) -> only show the message
  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    setErrorMsg(err.response?.data?.message || "Something went wrong");
    setTimeout(() => setErrorMsg(""), 4000);
  };

  const load = async () => {
    setLoading(true);

    try {
      let response = await api.get(API, getAuth());
      console.log(response.data);
      setStats(response.data.stats || []);
      setUpdatedAt(new Date());
    }
    catch (err) {
      console.log(err);
      handleAuthError(err);
    }
    finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statsByKey = Object.fromEntries(stats.map((s) => [s.key, s]));

  // only the cards the backend sent (the role may not be allowed to see all)
  const visibleCards = CARDS.filter((c) => statsByKey[c.key]);

  return (
    <div className="dash-home">

      {/* ---------- error message ---------- */}
      {errorMsg && <div className="dash-toast">{errorMsg}</div>}

      {/* ---------- heading ---------- */}
      <div className="dash-head">
        <div>
          <h2>Overview</h2>
          <p>
            {updatedAt
              ? `Updated at ${updatedAt.toLocaleTimeString()}`
              : "Loading your data..."}
          </p>
        </div>

        <button
          type="button"
          className="dash-refresh"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ---------- cards ---------- */}
      <div className="dash-grid">

        {/* grey placeholders while the first load is running */}
        {!loaded &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="dash-card dash-skeleton" />
          ))}

        {visibleCards.map((card, i) => {
          const s = statsByKey[card.key];
          const Icon = card.icon;

          return (
            <Link
              key={card.key}
              to={card.to}
              className="dash-card"
              style={{
                "--c": card.color,
                "--bg": card.bg,
                animationDelay: `${i * 0.05}s`
              }}
            >
              <div className="dash-card-top">
                <span className="dash-icon">
                  <Icon size={22} />
                </span>
                <ArrowUpRight className="dash-arrow" size={20} />
              </div>

              <div className="dash-number">
                <CountUp value={s.total} />
              </div>
              <div className="dash-label">{card.label}</div>

              <div className="dash-chips">
                {typeof s.active === "number" && (
                  <span className="chip chip-green">Active {s.active}</span>
                )}
                {typeof s.inactive === "number" && (
                  <span className="chip chip-red">Inactive {s.inactive}</span>
                )}
                {typeof s.lowStock === "number" && (
                  <span className="chip chip-amber">Low stock {s.lowStock}</span>
                )}
                {typeof s.outOfStock === "number" && (
                  <span className="chip chip-red">Out of stock {s.outOfStock}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {loaded && visibleCards.length === 0 && (
        <div className="dash-empty">
          No dashboard data is available for your role.
        </div>
      )}

    </div>
  );
};

export default DashboardHome;