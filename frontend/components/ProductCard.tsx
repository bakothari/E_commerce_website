"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Heart, Minus, Plus, ShoppingCart, Star, Zap } from "lucide-react";

// Safe localStorage read: never crashes on corrupted JSON
function readList(key: string): any[] {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export default function ProductCard({ product }: { product: any }) {
    const [quantity, setQuantity] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);

    // Product image
    const img =
        typeof product.images?.[0] === "string"
            ? product.images[0]
            : product.images?.[0]?.url;

    // Product variant
    const variant = product.variant ?? product.variants?.[0];

    const price = Number(variant?.sellingPrice ?? 0);
    const originalPrice = Number(variant?.mrp ?? 0);

    // Discount
    const discount =
        originalPrice > price && originalPrice > 0
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0;

    // Stock
    const stock = variant?.stock !== undefined ? Number(variant.stock) : 99;
    const inStock = variant?.status === "active" && stock > 0;
    const lowStock = inStock && stock <= 5;

    // Rating
    const rating = Number(product.rating ?? 0);

    // Keep the heart in sync with localStorage (also when changed elsewhere)
    useEffect(() => {
        function sync() {
            setWishlisted(readList("wishlist").some((i) => i._id === product._id));
        }

        sync();
        window.addEventListener("wishlist-change", sync);
        return () => window.removeEventListener("wishlist-change", sync);
    }, [product._id]);

    function requireLogin(message: string) {
        if (localStorage.getItem("token")) return true;

        toast.info(message);
        window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL ?? "/login";
        return false;
    }

    // Add to Cart
    function addToCart() {
        if (!requireLogin("Please log in to add items to your cart")) return;

        if (!variant) {
            toast.error("This product has no available option");
            return;
        }

        if (!inStock) {
            toast.error("Sorry, this product is out of stock");
            return;
        }

        const cart = readList("cart");

        const existing = cart.find(
            (item: any) =>
                item._id === product._id && item.variantId === variant._id
        );

        if (existing) {
            if (existing.quantity + quantity > stock) {
                toast.warn(
                    `Only ${stock} available, you already have ${existing.quantity} in your cart`
                );
                return;
            }

            existing.quantity += quantity;
            toast.info(`${product.name} quantity updated (${existing.quantity})`);
        } else {
            cart.push({
                _id: product._id,
                variantId: variant._id,
                name: product.name,
                price,
                mrp: originalPrice,
                image: img,
                quantity,
            });

            toast.success(`${product.name} added to cart`);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cart-change"));
        setQuantity(1);
    }

    // Add to / remove from Wishlist
    function toggleWishlist() {
        if (!requireLogin("Please log in to add items to your wishlist")) return;

        const wishlist = readList("wishlist");
        const exists = wishlist.some((i) => i._id === product._id);

        if (exists) {
            const updated = wishlist.filter((i) => i._id !== product._id);
            localStorage.setItem("wishlist", JSON.stringify(updated));
            setWishlisted(false);
            window.dispatchEvent(new Event("wishlist-change"));
            toast.info("Removed from wishlist");
            return;
        }

        wishlist.push({
            _id: product._id,
            name: product.name,
            slug: product.slug,
            price,
            image: img,
        });

        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        setWishlisted(true);
        window.dispatchEvent(new Event("wishlist-change"));

        toast.success("Added to wishlist", {
            icon: <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />,
            progressClassName: "bg-pink-500!",
        });
    }

    return (
        <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Link href={`/products/${product.slug}`} className="block h-full w-full">
                    {img ? (
                        <img
                            src={img}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            No image
                        </div>
                    )}
                </Link>

                {/* Discount Badge */}
                {discount > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow">
                        {discount}% OFF
                    </span>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={toggleWishlist}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={wishlisted}
                    title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition active:scale-90 ${
                        wishlisted
                            ? "bg-pink-50 ring-1 ring-pink-200"
                            : "bg-white hover:bg-pink-50"
                    }`}
                >
                    <Heart
                        className={`h-5 w-5 transition ${
                            wishlisted
                                ? "fill-pink-500 text-pink-500"
                                : "text-gray-500 group-hover:text-pink-400"
                        }`}
                    />
                </button>

                {/* Stock Badge (only when it matters) */}
                {(!inStock || lowStock) && (
                    <span
                        className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                            !inStock
                                ? "bg-gray-900/80 text-white"
                                : "bg-orange-100 text-orange-700"
                        }`}
                    >
                        {!inStock ? "Out of stock" : `Only ${stock} left`}
                    </span>
                )}
            </div>

            {/* Product Details */}
            <div className="flex flex-1 flex-col p-4">
                {product.brand?.name && (
                    <p className="text-xs font-medium text-gray-400">
                        {product.brand.name}
                    </p>
                )}

                <Link href={`/products/${product.slug}`}>
                    <h3 className="mt-1 line-clamp-2 min-h-12 font-semibold leading-snug text-gray-800 hover:text-green-700">
                        {product.name}
                    </h3>
                </Link>

                {product.unit && (
                    <p className="mt-1 text-xs text-gray-500">{product.unit}</p>
                )}

                {/* Rating */}
                <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                                key={n}
                                className={`h-4 w-4 ${
                                    n <= Math.round(rating)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                }`}
                            />
                        ))}
                    </div>

                    <span className="text-xs text-gray-500">
                        {rating > 0
                            ? `${rating} (${product.totalReviews ?? 0})`
                            : "No reviews yet"}
                    </span>
                </div>

                {/* Price */}
                <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    <span className="text-xl font-bold text-green-700">
                        ₹{price.toFixed(2)}
                    </span>

                    {originalPrice > price && (
                        <span className="text-sm text-gray-400 line-through">
                            ₹{originalPrice.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Quantity */}
                {inStock && (
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600">Quantity</span>

                        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                                className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
                                aria-label="Decrease quantity"
                            >
                                <Minus className="h-4 w-4" />
                            </button>

                            <span className="min-w-8 text-center text-sm font-medium">
                                {quantity}
                            </span>

                            <button
                                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                                disabled={quantity >= stock}
                                className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
                                aria-label="Increase quantity"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                    <button
                        onClick={addToCart}
                        disabled={!inStock}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {inStock ? "Add" : "Sold out"}
                    </button>

                    <Link
                        href={`/products/${product.slug}`}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-green-600 px-3 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50 active:scale-95"
                    >
                        <Zap className="h-4 w-4" />
                        Buy now
                    </Link>
                </div>
            </div>
        </div>
    );
}