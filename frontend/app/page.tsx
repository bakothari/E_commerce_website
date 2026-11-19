import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "../components/ProductCard";
import BannerSection from "../components/BannerSection";
import Reveal from "../components/Reveal";

const gradients = [
    "from-green-400 to-emerald-600",
    "from-orange-400 to-rose-500",
    "from-sky-400 to-indigo-500",
    "from-amber-300 to-orange-500",
    "from-fuchsia-400 to-purple-600",
    "from-teal-300 to-cyan-600",
];

// same name always gets the same colour
function gradientFor(name: string) {
    const sum = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
    return gradients[sum % gradients.length];
}

async function Categories() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/categories`, {
        cache: "no-store",
    });
    if (!res.ok) return <p className="mt-6 text-red-600">Could not load categories.</p>;

    const data = await res.json();
    const categories = data.categories ?? [];

    return (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c: any, i: number) => (
                <Reveal key={c._id} delay={i * 70}>
                    <Link
                        href={`/products?category=${c._id}`}
                        className={`group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br ${gradientFor(
                            c.name
                        )} shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl`}
                    >
                        {c.image ? (
                            <img
                                src={c.image}
                                alt={c.name}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-7xl font-black text-white/30 transition duration-500 group-hover:scale-125">
                                {c.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                            <span className="text-lg font-semibold capitalize">{c.name}</span>
                            <span className="flex h-8 w-8 translate-x-3 items-center justify-center rounded-full bg-white/90 text-green-700 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                →
                            </span>
                        </div>
                    </Link>
                </Reveal>
            ))}
        </div>
    );
}

async function FeaturedProducts() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/public/products/featured?limit=8`,
        { cache: "no-store" }
    );
    if (!res.ok) return <p className="mt-6 text-red-600">Could not load products.</p>;

    const data = await res.json();
    const products = data.products ?? [];

    if (!products.length) {
        return <p className="mt-6 text-center text-gray-500">No featured products available.</p>;
    }

    return (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p: any, i: number) => (
                <Reveal key={p._id} delay={(i % 4) * 80}>
                    <ProductCard product={p} />
                </Reveal>
            ))}
        </div>
    );
}

function Skeleton({ count, className, ratio }: { count: number; className: string; ratio: string }) {
    return (
        <div className={className}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`${ratio} animate-pulse rounded-2xl bg-gray-200`} />
            ))}
        </div>
    );
}

function SectionTitle({ title, subtitle, href }: { title: string; subtitle: string; href?: string }) {
    return (
        <div className="flex items-end justify-between">
            <div>
                <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            </div>
            {href && (
                <Link
                    href={href}
                    className="group text-sm font-semibold text-green-600"
                >
                    View all{" "}
                    <span className="inline-block transition group-hover:translate-x-1">→</span>
                </Link>
            )}
        </div>
    );
}

export default function Home() {
    return (
        <div>
            {/* ================= banners from admin (top of page) ================= */}
            <Suspense fallback={null}>
                <BannerSection />
            </Suspense>

            <section className="mx-auto max-w-6xl px-4 pb-20">
                {/* ================= perks ================= */}
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        ["🚚", "Free delivery", "On orders above ₹500"],
                        ["✅", "Quality assured", "Genuine products only"],
                        ["🔒", "Secure checkout", "Your details stay safe"],
                    ].map(([icon, title, text], i) => (
                        <Reveal key={title} delay={i * 100}>
                            <div className="flex items-center gap-4 rounded-2xl border bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-md">
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
                                    {icon}
                                </span>
                                <div>
                                    <p className="font-semibold">{title}</p>
                                    <p className="text-sm text-gray-500">{text}</p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                {/* ================= categories ================= */}
                <div id="categories" className="mt-16 scroll-mt-24">
                    <Reveal>
                        <SectionTitle
                            title="Shop by category"
                            subtitle="Find what you need, faster"
                            href="/products"
                        />
                    </Reveal>
                    <Suspense
                        fallback={
                            <Skeleton
                                count={4}
                                ratio="aspect-[4/3]"
                                className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                            />
                        }
                    >
                        <Categories />
                    </Suspense>
                </div>

                {/* ================= featured products ================= */}
                <div className="mt-16">
                    <Reveal>
                        <SectionTitle
                            title="Featured products"
                            subtitle="Hand-picked just for you"
                            href="/products"
                        />
                    </Reveal>
                    <Suspense
                        fallback={
                            <Skeleton
                                count={4}
                                ratio="aspect-[3/4]"
                                className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
                            />
                        }
                    >
                        <FeaturedProducts />
                    </Suspense>
                </div>

                {/* ================= promo band ================= */}
                <Reveal className="mt-16">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-10 text-center text-white md:px-12 md:text-left">
                        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-green-500/30 blur-3xl" />
                        <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div>
                                <h3 className="text-2xl font-bold md:text-3xl">
                                    Free delivery on orders above ₹500
                                </h3>
                                <p className="mt-2 text-gray-300">
                                    Fill your cart and we bring it to you.
                                </p>
                            </div>
                            <Link
                                href="/products"
                                className="shrink-0 rounded-full bg-green-500 px-8 py-3 font-semibold text-white transition hover:scale-105 hover:bg-green-400 active:scale-95"
                            >
                                Start shopping
                            </Link>
                        </div>
                    </div>
                </Reveal>

                {/* ================= why us ================= */}
                <div className="mt-16 grid gap-4 md:grid-cols-3">
                    {[
                        ["💸", "Best prices", "Great discounts on every order, every day."],
                        ["📦", "Fast delivery", "Quick, careful delivery right to your door."],
                        ["🤝", "Easy returns", "Not happy? We make returns simple."],
                    ].map(([icon, title, text], i) => (
                        <Reveal key={title} delay={i * 100}>
                            <div className="rounded-2xl bg-green-50 p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-md">
                                <p className="text-4xl">{icon}</p>
                                <p className="mt-3 text-lg font-semibold">{title}</p>
                                <p className="mt-1 text-sm text-gray-600">{text}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>
        </div>
    );
}