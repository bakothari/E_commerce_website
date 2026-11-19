"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Heart,
    Minus,
    Plus,
    Share2,
    ShoppingCart,
    Star,
    Zap,
} from "lucide-react";

// Safe localStorage read: never crashes on corrupted JSON
function readList(key: string): any[] {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export default function ProductView({ product }: { product: any }) {
    const router = useRouter();

    const variants: any[] = (product.variants ?? []).filter(
        (v: any) => v.status !== "inactive"
    );

    const [selected, setSelected] = useState<any>(variants[0] ?? null);
    const [qty, setQty] = useState(1);
    const [activeImg, setActiveImg] = useState(0);
    const [added, setAdded] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);

    // product images + the selected variant's images, without duplicates
    const images: string[] = Array.from(
        new Set<string>(
            [...(product.images ?? []), ...(selected?.images ?? [])]
                .map((i: any) => (typeof i === "string" ? i : i?.url))
                .filter(Boolean)
        )
    );

    const price = Number(selected?.sellingPrice ?? 0);
    const mrp = Number(selected?.mrp ?? 0);
    const discount =
        mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const rating = Number(product.rating ?? 0);

    // no inventory data yet, so an active variant counts as available
    const stock = selected?.stock !== undefined ? Number(selected.stock) : 99;
    const inStock = !!selected && selected.status !== "inactive" && stock > 0;
    const lowStock = inStock && stock <= 5;

    // keep the heart in sync with localStorage
    useEffect(() => {
        function sync() {
            setWishlisted(readList("wishlist").some((i) => i._id === product._id));
        }

        sync();
        window.addEventListener("wishlist-change", sync);
        return () => window.removeEventListener("wishlist-change", sync);
    }, [product._id]);

    // arrow keys flip through the gallery
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA") return;
            if (images.length < 2) return;

            if (e.key === "ArrowRight") setActiveImg((i) => (i + 1) % images.length);
            if (e.key === "ArrowLeft")
                setActiveImg((i) => (i - 1 + images.length) % images.length);
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [images.length]);

    function selectVariant(v: any) {
        setSelected(v);
        setQty(1);
        setActiveImg(0);
    }

    function prevImg() {
        setActiveImg((i) => (i - 1 + images.length) % images.length);
    }

    function nextImg() {
        setActiveImg((i) => (i + 1) % images.length);
    }

    function addToCart(goToCart = false) {
        if (!selected) {
            toast.error("Please select an option");
            return;
        }

        if (!inStock) {
            toast.error("Sorry, this product is out of stock");
            return;
        }

        const cart = readList("cart");
        const existing = cart.find(
            (i: any) => i._id === product._id && i.variantId === selected._id
        );

        if (existing) {
            if (existing.quantity + qty > stock) {
                toast.warn(
                    `Only ${stock} available, you already have ${existing.quantity} in your cart`
                );
                return;
            }
            existing.quantity += qty;
        } else {
            cart.push({
                _id: product._id,
                variantId: selected._id,
                name:
                    variants.length > 1
                        ? `${product.name} (${selected.name})`
                        : product.name,
                price,
                mrp,
                image: images[0],
                quantity: qty,
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cart-change"));

        if (goToCart) {
            router.push("/cart");
            return;
        }

        toast.success(`${product.name} added to cart`);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    }

    // Add to / remove from Wishlist
    function toggleWishlist() {
        if (!localStorage.getItem("token")) {
            toast.info("Please log in to add items to your wishlist");
            window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL ?? "/login";
            return;
        }

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
            image: images[0],
        });

        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        setWishlisted(true);
        window.dispatchEvent(new Event("wishlist-change"));

        toast.success("Added to wishlist", {
            icon: <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />,
            progressStyle: { background: "#ec4899" },
        });
    }

    async function shareProduct() {
        const url = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({ title: product.name, url });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied");
            }
        } catch {
            // user cancelled the share sheet, nothing to do
        }
    }

    return (
        <div className="mt-8 grid gap-10 md:grid-cols-2">
            {/* gallery */}
            <div>
                <div className="group relative aspect-square overflow-hidden rounded-2xl border bg-gray-100">
                    {images[activeImg] ? (
                        <img
                            src={images[activeImg]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            No image
                        </div>
                    )}

                    {discount > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow">
                            {discount}% OFF
                        </span>
                    )}

                    {/* share */}
                    <button
                        onClick={shareProduct}
                        aria-label="Share product"
                        title="Share"
                        className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-50 active:scale-90"
                    >
                        <Share2 className="h-5 w-5 text-gray-500" />
                    </button>

                    {/* prev / next */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImg}
                                aria-label="Previous image"
                                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition group-hover:opacity-100 active:scale-90"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={nextImg}
                                aria-label="Next image"
                                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition group-hover:opacity-100 active:scale-90"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>

                            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
                                {activeImg + 1} / {images.length}
                            </span>
                        </>
                    )}
                </div>

                {images.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {images.map((src, i) => (
                            <button
                                key={src + i}
                                onClick={() => setActiveImg(i)}
                                aria-label={`Show image ${i + 1}`}
                                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                    i === activeImg
                                        ? "border-green-600"
                                        : "border-transparent opacity-70 hover:opacity-100"
                                }`}
                            >
                                <img src={src} alt="" className="h-full w-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* details */}
            <div>
                {product.brand?.name && (
                    <p className="text-sm font-medium text-gray-400">{product.brand.name}</p>
                )}
                <h1 className="mt-1 text-3xl font-bold leading-tight">{product.name}</h1>

                {/* rating */}
                <div className="mt-3 flex items-center gap-2">
                    <div className="flex" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                                key={n}
                                className={`h-5 w-5 ${
                                    n <= Math.round(rating)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600">
                        {rating > 0
                            ? `${rating} (${product.totalReviews ?? 0} reviews)`
                            : "No reviews yet"}
                    </span>
                </div>

                {/* price */}
                {selected ? (
                    <div className="mt-5 flex flex-wrap items-baseline gap-3">
                        <span className="text-3xl font-bold text-green-700">
                            ₹{price.toLocaleString("en-IN")}
                        </span>
                        {mrp > price && (
                            <span className="text-lg text-gray-400 line-through">
                                ₹{mrp.toLocaleString("en-IN")}
                            </span>
                        )}
                        {discount > 0 && (
                            <span className="rounded-md bg-green-100 px-2 py-0.5 text-sm font-semibold text-green-700">
                                You save ₹{(mrp - price).toLocaleString("en-IN")}
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="mt-5 text-gray-500">No options available for this product.</p>
                )}

                {product.description && (
                    <p className="mt-4 leading-relaxed text-gray-600">{product.description}</p>
                )}

                {/* variants */}
                {variants.length > 0 && (
                    <div className="mt-6">
                        <p className="text-sm font-medium text-gray-700">
                            Choose option:{" "}
                            <span className="font-semibold">{selected?.name}</span>
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {variants.map((v) => {
                                const active = selected?._id === v._id;
                                const soldOut = v.stock !== undefined && Number(v.stock) <= 0;

                                return (
                                    <button
                                        key={v._id}
                                        onClick={() => selectVariant(v)}
                                        aria-pressed={active}
                                        className={`relative rounded-lg border px-4 py-2 text-sm font-medium transition active:scale-95 ${
                                            active
                                                ? "border-green-600 bg-green-50 text-green-700 ring-1 ring-green-600"
                                                : "bg-white text-gray-700 hover:border-green-400"
                                        } ${soldOut ? "opacity-50" : ""}`}
                                    >
                                        {v.name}
                                        {soldOut && (
                                            <span className="ml-1.5 text-xs text-red-500">
                                                (sold out)
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* availability */}
                {selected && (
                    <p className="mt-4 flex items-center gap-2 text-sm">
                        {!inStock ? (
                            <span className="font-medium text-red-600">Out of stock</span>
                        ) : lowStock ? (
                            <span className="font-medium text-orange-600">
                                Only {stock} left, order soon
                            </span>
                        ) : (
                            <span className="font-medium text-green-600">In stock</span>
                        )}
                        {selected.sku && (
                            <span className="text-gray-400">SKU: {selected.sku}</span>
                        )}
                    </p>
                )}

                {/* quantity + buttons */}
                {inStock && (
                    <>
                        <div className="mt-6 flex items-center gap-4">
                            <span className="text-sm text-gray-600">Quantity</span>

                            <div className="flex items-center overflow-hidden rounded-lg border">
                                <button
                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    disabled={qty <= 1}
                                    aria-label="Decrease quantity"
                                    className="flex h-10 w-10 items-center justify-center transition hover:bg-gray-100 active:scale-90 disabled:opacity-40"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>

                                <span className="w-10 text-center font-medium">{qty}</span>

                                <button
                                    onClick={() => setQty((q) => Math.min(stock, q + 1))}
                                    disabled={qty >= stock}
                                    aria-label="Increase quantity"
                                    className="flex h-10 w-10 items-center justify-center transition hover:bg-gray-100 active:scale-90 disabled:opacity-40"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <span className="text-sm text-gray-500">
                                Total:{" "}
                                <span className="font-semibold text-gray-800">
                                    ₹{(price * qty).toLocaleString("en-IN")}
                                </span>
                            </span>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => addToCart(false)}
                                className={`flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition active:scale-95 ${
                                    added ? "bg-emerald-500" : "bg-green-600 hover:bg-green-700"
                                }`}
                            >
                                {added ? (
                                    <>
                                        <Check className="h-5 w-5" /> Added
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-5 w-5" /> Add to cart
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => addToCart(true)}
                                className="flex items-center justify-center gap-2 rounded-xl border-2 border-green-600 py-3 font-semibold text-green-700 transition hover:bg-green-50 active:scale-95"
                            >
                                <Zap className="h-5 w-5" /> Buy now
                            </button>
                        </div>
                    </>
                )}

                {/* wishlist */}
                <button
                    onClick={toggleWishlist}
                    aria-pressed={wishlisted}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-3 font-semibold transition active:scale-95 ${
                        wishlisted
                            ? "border-pink-300 bg-pink-50 text-pink-600"
                            : "border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600"
                    }`}
                >
                    <Heart
                        className={`h-5 w-5 ${
                            wishlisted ? "fill-pink-500 text-pink-500" : ""
                        }`}
                    />
                    {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
                </button>

                {selected && (selected.weight || selected.dimensions || selected.unitValue) && (
                    <dl className="mt-8 divide-y rounded-xl border text-sm">
                        {selected.unitValue && (
                            <div className="flex justify-between px-4 py-2">
                                <dt className="text-gray-500">Pack size</dt>
                                <dd>
                                    {selected.unitValue} {selected.unit}
                                </dd>
                            </div>
                        )}
                        {selected.weight && (
                            <div className="flex justify-between px-4 py-2">
                                <dt className="text-gray-500">Weight</dt>
                                <dd>{selected.weight} kg</dd>
                            </div>
                        )}
                        {selected.dimensions && (
                            <div className="flex justify-between px-4 py-2">
                                <dt className="text-gray-500">Dimensions</dt>
                                <dd>{selected.dimensions}</dd>
                            </div>
                        )}
                    </dl>
                )}
            </div>
        </div>
    );
}