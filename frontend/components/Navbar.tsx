"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, User as UserIcon, Package, LogOut, ChevronDown, Sprout,Heart } from "lucide-react";
import { toast } from "react-toastify";
type User = {
  name?: string;
  email?: string;
};

type CartItem = { quantity?: number };

export default function Navbar() {
  const router = useRouter();
  const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL ?? "/login";

  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [bump, setBump] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  // read auth + cart from localStorage (client only, avoids hydration mismatch)
  useEffect(() => {
    function syncAuth() {
      try {
        const token = localStorage.getItem("token");
        const raw = localStorage.getItem("user");
        setUser(token && raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    }

function syncCart() {
    try {
        const items = JSON.parse(localStorage.getItem("cart") ?? "[]");
        const count = items.reduce((s: number, i: any) => s + (i.quantity ?? 1), 0);
        if (count > prevCount.current) {
            setBump(true);
            setTimeout(() => setBump(false), 300);
        }
        prevCount.current = count;
        setCartCount(count);
    } catch {
        setCartCount(0);
    }
}

    function syncAll() {
      syncAuth();
      syncCart();
    }

    syncAll();
    setMounted(true);

    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("cart-change", syncCart);
    window.addEventListener("storage", syncAll); // other tabs
    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("cart-change", syncCart);
      window.removeEventListener("storage", syncAll);
    };
  }, []);

  // close dropdown on outside click or Escape
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");                 // clear the cart
    window.dispatchEvent(new Event("auth-change"));
    window.dispatchEvent(new Event("cart-change"));  // reset the badge
    setMenuOpen(false);
    toast.success("Logged out successfully"); 
    router.push("/");
}

  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-green-600">
          <Sprout size={24} />
          YourApp
        </Link>

        <div className="flex items-center gap-3">
          <Link
          href="/wishlist"
          className="group relative rounded-full p-2 text-gray-700 transition hover:bg-green-50 hover:text-green-600"
          >
           <Heart
              size={22}
              className="transition-transform group-hover:-rotate-6 group-hover:scale-110"
            />
          </Link>
          {/* cart */}
          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} items`}
            className="group relative rounded-full p-2 text-gray-700 transition hover:bg-green-50 hover:text-green-600"
          >
            <ShoppingCart
              size={22}
              className="transition-transform group-hover:-rotate-6 group-hover:scale-110"
            />
            {mounted && cartCount > 0 && (
              <span
                className={`absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-xs font-semibold text-white transition-transform duration-300 ${
                  bump ? "scale-125" : "scale-100"
                }`}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* profile / login */}
          {!mounted ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-3 transition hover:border-green-200 hover:bg-green-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                  {initial}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 sm:block">
                  {user.name ?? "Account"}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* dropdown */}
              <div
                role="menu"
                className={`absolute right-0 mt-2 w-60 origin-top-right rounded-xl border bg-white p-1 shadow-lg transition duration-150 ${
                  menuOpen
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-95 opacity-0"
                }`}
              >
                <div className="border-b px-3 py-2">
                  <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>

                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                >
                  <UserIcon size={16} /> My profile
                </Link>
                <Link
                  href="/orders"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                >
                  <Package size={16} /> My orders
                </Link>
                <button
                  onClick={logout}
                  role="menuitem"
                  className="mt-1 flex w-full items-center gap-2 rounded-lg border-t px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                 
                >

                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <a
              href={loginUrl}
              className="rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700 hover:shadow-md active:scale-95"
            >
              Log in
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}