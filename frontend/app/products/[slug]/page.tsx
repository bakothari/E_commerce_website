import Link from "next/link";
import { Suspense } from "react";
import ProductView from "../../../components/ProductView";

async function Details({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/public/products/${slug}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        return (
            <div className="py-24 text-center">
                <p className="text-5xl">😕</p>
                <p className="mt-3 text-xl font-semibold">Product not found</p>
                <Link href="/" className="mt-4 inline-block text-green-600 underline">
                    Back to home
                </Link>
            </div>
        );
    }

    const { product } = await res.json();

    return (
        <>
            <nav className="text-sm text-gray-500">
                <Link href="/" className="hover:text-green-600">Home</Link>
                {product.category?.name && (
                    <>
                        <span className="mx-2">/</span>
                        <Link
                            href={`/products?category=${product.category._id}`}
                            className="hover:text-green-600"
                        >
                            {product.category.name}
                        </Link>
                    </>
                )}
                <span className="mx-2">/</span>
                <span className="text-gray-900">{product.name}</span>
            </nav>

            <ProductView product={product} />
        </>
    );
}

function DetailsSkeleton() {
    return (
        <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
            <div className="space-y-4">
                <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-1/3 animate-pulse rounded bg-gray-200" />
            </div>
        </div>
    );
}

export default function ProductPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <Suspense fallback={<DetailsSkeleton />}>
                <Details params={params} />
            </Suspense>
        </main>
    );
}