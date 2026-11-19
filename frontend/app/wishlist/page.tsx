"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Heart, LogIn, ShoppingBag, Trash2 } from "lucide-react";

type WishlistItem = {
    _id: string;
    name: string;
    slug?: string;
    price: number;
    image?: string;
};

function readWishlist(): WishlistItem[] {
    try {
        const data = JSON.parse(localStorage.getItem("wishlist") || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loggedIn, setLoggedIn] = useState(true);

    // load from localStorage and stay in sync with other components
    useEffect(() => {
        function sync() {
            setItems(readWishlist());
        }

        setLoggedIn(!!localStorage.getItem("token"));
        sync();
        setLoaded(true);

        window.addEventListener("wishlist-change", sync);
        return () => window.removeEventListener("wishlist-change", sync);
    }, []);

    function save(updated: WishlistItem[]) {
        localStorage.setItem("wishlist", JSON.stringify(updated));
        setItems(updated);
        window.dispatchEvent(new Event("wishlist-change"));
    }

    function removeItem(id: string) {
        save(items.filter((i) => i._id !== id));
        toast.info("Removed from wishlist");
    }

    function clearAll() {
        if (!window.confirm("Remove all items from your wishlist?")) return;
        save([]);
        toast.info("Wishlist cleared");
    }

    // avoid a flash of the empty state before localStorage is read
    if (!loaded) return null;

    if (!loggedIn) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-50">
                    <LogIn className="h-9 w-9 text-pink-500" />
                </div>
                <h1 className="mt-5 text-2xl font-bold text-gray-800">Log in to see your wishlist</h1>
                <p className="mt-2 text-gray-500">Your saved products show up here once you are logged in.</p>
                <a
                    href={process.env.NEXT_PUBLIC_LOGIN_URL ?? "/login"}
                    className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 active:scale-95"
                >
                    Log in
                </a>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-50">
                    <Heart className="h-9 w-9 text-pink-400" />
                </div>
                <h1 className="mt-5 text-2xl font-bold text-gray-800">Your wishlist is empty</h1>
                <p className="mt-2 text-gray-500">Tap the heart on any product to save it here.</p>
                <Link
                    href="/products"
                    className="mt-6 flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 active:scale-95"
                >
                    <ShoppingBag className="h-5 w-5" />
                    Browse products
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex items-center justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                    <Heart className="h-7 w-7 fill-pink-500 text-pink-500" />
                    My wishlist
                    <span className="ml-1 text-base font-medium text-gray-400">
                        ({items.length} {items.length === 1 ? "item" : "items"})
                    </span>
                </h1>

                <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                >
                    <Trash2 className="h-4 w-4" />
                    Clear all
                </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => {
                    const href = item.slug ? `/products/${item.slug}` : null;

                    const image = item.image ? (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            No image
                        </div>
                    );

                    return (
                        <div
                            key={item._id}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                {href ? (
                                    <Link href={href} className="block h-full w-full">
                                        {image}
                                    </Link>
                                ) : (
                                    image
                                )}

                                <button
                                    onClick={() => removeItem(item._id)}
                                    aria-label={`Remove ${item.name} from wishlist`}
                                    title="Remove from wishlist"
                                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 shadow-md ring-1 ring-pink-200 transition hover:bg-pink-100 active:scale-90"
                                >
                                    <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />
                                </button>
                            </div>

                            <div className="flex flex-1 flex-col p-4">
                                <h2 className="line-clamp-2 min-h-12 font-semibold leading-snug text-gray-800">
                                    {item.name}
                                </h2>

                                <p className="mt-2 text-xl font-bold text-green-700">
                                    ₹{Number(item.price ?? 0).toFixed(2)}
                                </p>

                                <div className="mt-auto pt-4">
                                    {href ? (
                                        <Link
                                            href={href}
                                            className="flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-95"
                                        >
                                            <ShoppingBag className="h-4 w-4" />
                                            View product
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => removeItem(item._id)}
                                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}