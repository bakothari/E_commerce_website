"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
type CartItem = {
    _id: string;        // product id
    variantId: string;
    name: string;
    price: number;
    mrp?: number;
    image?: string;
    quantity: number;
};

const FREE_DELIVERY_ABOVE = 500;
const DELIVERY_FEE = 40;
const MAX_QTY = 99;

export default function CartPage() {
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [ready, setReady] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
     
     
    useEffect(() => {
        const token = localStorage.getItem("token");
        setLoggedIn(!!token);

        if (token) {
            try {
                setItems(JSON.parse(localStorage.getItem("cart") || "[]"));
            } catch {
                setItems([]);
            }
        }
        setReady(true);

        // keep the page in sync if the cart changes elsewhere (logout, other tab)
        function sync() {
            const t = localStorage.getItem("token");
            setLoggedIn(!!t);
            try {
                setItems(t ? JSON.parse(localStorage.getItem("cart") || "[]") : []);
            } catch {
                setItems([]);
            }
        }
        window.addEventListener("auth-change", sync);
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener("auth-change", sync);
            window.removeEventListener("storage", sync);
        };
    }, []);

    function save(next: CartItem[]) {
        setItems(next);
        localStorage.setItem("cart", JSON.stringify(next));
        window.dispatchEvent(new Event("cart-change")); // updates the Navbar badge
    }

    const same = (a: CartItem, b: CartItem) => a._id === b._id && a.variantId === b.variantId;

    function setQty(item: CartItem, qty: number) {
        if (qty > MAX_QTY) {
            toast.warn(`You can add at most ${MAX_QTY} of one item`);
            return;
        }
        save(items.map((i) => (same(i, item) ? { ...i, quantity: qty } : i)));
    }

    function remove(item: CartItem) {
        save(items.filter((i) => !same(i, item)));
        toast.info(`${item.name} removed from cart`);
    }

    function clear() {
        save([]);
        toast.info("Cart cleared");
    }

function checkout() {
    const token = localStorage.getItem("token");

    if (!token) {
        toast.error("Please log in to place your order");
        return;
    }

    if (items.length === 0) {
        toast.error("Your cart is empty");
        return;
    }

    router.push("/checkout");
}
    if (!ready) return null;

    // guests never see a cart
    if (!loggedIn) {
        return (
            <section className="py-24 text-center">
                <p className="text-6xl">🔒</p>
                <p className="mt-4 text-xl font-semibold">Log in to see your cart</p>
                <a
                    href={process.env.NEXT_PUBLIC_LOGIN_URL ?? "/login"}
                    className="mt-5 inline-block rounded-full bg-green-600 px-6 py-2.5 font-medium text-white hover:bg-green-700"
                >
                    Log in
                </a>
            </section>
        );
    }

    if (items.length === 0) {
        return (
            <section className="py-24 text-center">
                <p className="text-6xl">🛒</p>
                <p className="mt-4 text-xl font-semibold">Your cart is empty</p>
                <Link
                    href="/"
                    className="mt-5 inline-block rounded-full bg-green-600 px-6 py-2.5 font-medium text-white hover:bg-green-700"
                >
                    Continue shopping
                </Link>
            </section>
        );
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const savings = items.reduce((s, i) => s + Math.max(0, (i.mrp ?? i.price) - i.price) * i.quantity, 0);
    const delivery = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    const total = subtotal + delivery;
    const remaining = FREE_DELIVERY_ABOVE - subtotal;
    const progress = Math.min(100, (subtotal / FREE_DELIVERY_ABOVE) * 100);
    const totalUnits = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <section className="mx-auto max-w-5xl px-4 py-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    Your cart <span className="text-lg font-medium text-gray-500">({totalUnits} items)</span>
                </h1>
                <button onClick={clear} className="text-sm text-red-500 hover:underline">
                    Clear cart
                </button>
            </div>

            {/* free delivery progress */}
            <div className="mt-5 rounded-2xl border bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                    {remaining > 0
                        ? `Add ₹${remaining.toFixed(0)} more for free delivery`
                        : "🎉 You've unlocked free delivery!"}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-green-100">
                    <div
                        className="h-full rounded-full bg-green-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* items */}
                <div className="space-y-3 lg:col-span-2">
                    {items.map((i) => (
                        <div
                            key={i._id + i.variantId}
                            className="flex items-center gap-4 rounded-2xl border bg-white p-4"
                        >
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                {i.image && (
                                    <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold">{i.name}</p>
                                <p className="mt-1 text-sm text-gray-700">
                                    ₹{i.price}
                                    {i.mrp && i.mrp > i.price && (
                                        <span className="ml-2 text-xs text-gray-400 line-through">₹{i.mrp}</span>
                                    )}
                                </p>
                                <button
                                    onClick={() => remove(i)}
                                    className="mt-1 text-xs text-red-500 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center overflow-hidden rounded-lg border">
                                    <button
                                        onClick={() => (i.quantity > 1 ? setQty(i, i.quantity - 1) : remove(i))}
                                        className="px-3 py-1.5 transition hover:bg-gray-100 active:scale-90"
                                    >
                                        −
                                    </button>
                                    <span className="w-8 text-center text-sm font-medium">{i.quantity}</span>
                                    <button
                                        onClick={() => setQty(i, i.quantity + 1)}
                                        className="px-3 py-1.5 transition hover:bg-gray-100 active:scale-90"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="font-bold text-green-700">₹{(i.price * i.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* summary */}
                <aside className="h-fit rounded-2xl border bg-white p-5 lg:sticky lg:top-24">
                    <h2 className="text-lg font-bold">Order summary</h2>
                    <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Subtotal</dt>
                            <dd>₹{subtotal.toFixed(2)}</dd>
                        </div>
                        {savings > 0 && (
                            <div className="flex justify-between text-green-700">
                                <dt>You save</dt>
                                <dd>₹{savings.toFixed(2)}</dd>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Delivery</dt>
                            <dd>{delivery ? `₹${delivery}` : "Free"}</dd>
                        </div>
                    </dl>
                    <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={checkout}
                        className="mt-5 w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 active:scale-95"
                    >
                        Proceed to checkout
                    </button>
                    <Link href="/" className="mt-3 block text-center text-sm text-green-600 hover:underline">
                        Continue shopping
                    </Link>
                </aside>
            </div>
        </section>
    );
}