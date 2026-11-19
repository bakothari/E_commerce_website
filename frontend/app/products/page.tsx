import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "../../components/ProductCard";

type SP = { category?: string; brand?: string; search?: string };

async function ProductList({ searchParams }: { searchParams: Promise<SP> }) {
    const { category, brand, search } = await searchParams;

    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (brand) q.set("brand", brand);
    if (search) q.set("search", search);

    const [prodRes, catRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/products?${q}`, { cache: "no-store" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/categories`, { cache: "no-store" }),
    ]);

    if (!prodRes.ok) return <p className="mt-8 text-red-600">Could not load products.</p>;

    const products = (await prodRes.json()).products ?? [];
    const categories = catRes.ok ? (await catRes.json()).categories ?? [] : [];
    const current = categories.find((c: any) => c._id === category);

    const pill = (active: boolean) =>
        `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            active
                ? "border-green-600 bg-green-600 text-white"
                : "bg-white text-gray-700 hover:border-green-400 hover:text-green-700"
        }`;

    return (
        <>
            <nav className="text-sm text-gray-500">
                <Link href="/" className="hover:text-green-600">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{current?.name ?? "All products"}</span>
            </nav>

            <h1 className="mt-3 text-3xl font-bold capitalize">{current?.name ?? "All products"}</h1>
            <p className="mt-1 text-sm text-gray-500">{products.length} products</p>

            {/* category pills */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                <Link href="/products" className={pill(!category)}>All</Link>
                {categories.map((c: any) => (
                    <Link
                        key={c._id}
                        href={`/products?category=${c._id}`}
                        className={pill(category === c._id)}
                    >
                        {c.name}
                    </Link>
                ))}
            </div>

            {products.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-5xl">🛍️</p>
                    <p className="mt-3 text-xl font-semibold">No products here yet</p>
                    <Link href="/products" className="mt-4 inline-block text-green-600 underline">
                        See all products
                    </Link>
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {products.map((p: any) => (
                        <ProductCard key={p._id} product={p} />
                    ))}
                </div>
            )}
        </>
    );
}

export default function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <Suspense
                fallback={
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-200" />
                        ))}
                    </div>
                }
            >
                <ProductList searchParams={searchParams} />
            </Suspense>
        </main>
    );
}