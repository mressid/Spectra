import type { Metadata } from "next";
import { Suspense } from "react";
import { GridSkeleton, ProductListing } from "@/components/ProductListing";
import { words } from "@/lib/words";

export const metadata: Metadata = { title: words.search, robots: { index: false } };

/** Search by product name; results are never indexed. */
export default function SearchPage({ searchParams }: PageProps<"/search">) {
    return (
        <>
            <form action="/search" className="mb-6 flex gap-2" role="search">
                <input
                    name="q"
                    type="search"
                    placeholder={words.searchPlaceholder}
                    aria-label={words.search}
                    className="min-w-0 flex-1 rounded-control border border-field px-3 py-3 text-base"
                />
                <button type="submit" className="rounded-control bg-ink px-5 font-semibold text-white">{words.search}</button>
            </form>
            <Suspense fallback={<GridSkeleton />}>
                <SearchResults searchParams={searchParams} />
            </Suspense>
        </>
    );
}

async function SearchResults({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
    const params = await searchParams;
    const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim().slice(0, 80) ?? "";
    if (!q) return null;
    return (
        <>
            <h1 className="mb-4 text-xl font-semibold">{words.resultsFor(q)}</h1>
            <ProductListing basePath="/search" filter={{ q }} searchParams={searchParams} />
        </>
    );
}
