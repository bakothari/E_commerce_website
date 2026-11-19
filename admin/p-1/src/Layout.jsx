import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate,Link } from "react-router-dom";
import api from "./api/axios";
import "./Dashboard.css";

import {
  LayoutDashboard,
  Users,
  Store,
  Warehouse,
  LayoutGrid,
  Layers,
  Package,
  Notebook,
  Boxes,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  Megaphone,
  KeyRound,
  Sprout,
  Mail
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/user", label: "User", icon: Users },
  { to: "/store", label: "Store", icon: Store },
  { to: "/storeinventory", label: "Inventory", icon: Warehouse },
  { to: "/category", label: "Category", icon: LayoutGrid },
  { to: "/subcategory", label: "Sub Category", icon: Layers },
  { to: "/product", label: "Product", icon: Package },
  { to: "/brands", label: "Brands", icon: Notebook },
  // path is kept as it was; only the label spelling is fixed
  { to: "/productvarient", label: "Product Variant", icon: Boxes },
  {to:"/banners",label:"Banners",icon:Megaphone},
  { to: "/roles", label: "Roles", icon: KeyRound },
  { to: "/email-templates", label: "Email Templates", icon: Mail },
];

// ---------- who is logged in ----------

// read the data inside the JWT token (works only if the token contains name / email)
const decodeToken = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
};

// first guess from the token only (the real data is loaded from the server below)
const getCurrentUser = () => {
  const payload = decodeToken(localStorage.getItem("token") || "");

  return {
    name: payload?.name || "",
    email: payload?.email || "",
    role: payload?.role || ""
  };
};

// "Bk Sharma" -> "BS"   |   "Bk" -> "B"   |   nothing -> "U"
const getInitials = (name) => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// role can be "STORE_MANAGER", { name: "STORE_MANAGER" } or an id -> "Store Manager"
const formatRole = (role) => {
  const value = role && typeof role === "object" ? role.name : role;

  if (!value || /^[a-f0-9]{24}$/i.test(value)) return "";

  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(getCurrentUser);
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const displayName = user.name || user.email || "User";
  const roleLabel = formatRole(user.role);

  // title in the header follows the page you are on
  const currentLink = links.find(
    (l) => location.pathname === l.to || location.pathname.startsWith(l.to + "/")
  );
  const pageTitle = currentLink ? currentLink.label : "Dashboard";

  // remember the collapsed / expanded choice
  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  };

  // load the REAL logged-in user from the server (found from the token)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/user/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const me = res.data.user;
        setUser({
          name: me.name || "",
          email: me.email || "",
          role: me.role || ""
        });
      })
      .catch((err) => {
        console.log(err);

        // token missing / expired -> back to login
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
        }
      });
  }, []);

  // close the mobile menu when the page changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Esc closes the logout popup
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowLogout(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard">

      <header className="header">

        <div className="header-left">
          {/* phone: open / close the menu */}
          <button
            type="button"
            className="menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* computer: shrink / expand the sidebar */}
          <button
            type="button"
            className="collapse-btn"
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
          </button>

          <div className="logo">
           <Link href="/dashboard">
                     <Sprout size={24} />
                     YourApp
             </Link>
          </div>
        </div>

        <h1 className="page-title">{pageTitle}</h1>

      </header>

      <div className="dashboard-body">

        {mobileOpen && (
          <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
        )}

        <aside
          className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}
        >

          <nav className="sidebar-nav">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} />
                <span className="label">{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* profile + logout stay at the bottom */}
          <div className="sidebar-footer">

            <div
              className="profile-card"
              title={displayName}
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
            >
              <div className="avatar">{getInitials(user.name || user.email)}</div>

              <div className="profile-info label">
                <strong>{displayName}</strong>
                {roleLabel && <span>{roleLabel}</span>}
              </div>
            </div>

            <button
              type="button"
              className="logout-btn"
              onClick={() => setShowLogout(true)}
              title={collapsed ? "Log out" : undefined}
            >
              <LogOut size={18} />
              <span className="label">Log out</span>
            </button>

          </div>

        </aside>

        <main className="main">
          {/* key = the page fades in every time you change page */}
          <div className="page-fade" key={location.pathname}>
            <Outlet />
          </div>
        </main>

      </div>

      <footer className="footer">
        <span>&copy; {new Date().getFullYear()} All rights reserved</span>
      </footer>

      {/* ---------- logout confirmation ---------- */}
      {showLogout && (
        <div className="confirm-overlay" onClick={() => setShowLogout(false)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <LogOut size={22} />
            </div>
            <h3>Log out?</h3>
            <p>You will need to log in again to continue.</p>

            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-cancel"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>
              <button type="button" className="confirm-ok" onClick={logout}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Layout;