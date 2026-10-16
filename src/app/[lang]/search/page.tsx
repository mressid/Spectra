import { Search } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { GridSkeleton, ProductListing } from "@/components/ProductListing";
import { ui } from "@/components/ui";
import type { Language } from "@/lib/api/client";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";

export async function generateMetadata({ params }: PageProps<"/[lang]/search">): Promise<Metadata> {
    return { title: getWords((await params).lang as Language).search, robots: { index: false } };
}

/** Search by product name; results are never indexed. */
export default async function SearchPage({ params, searchParams }: PageProps<"/[lang]/search">) {
    const lang = (await params).lang as Language;
    const words = getWords(lang);
    return (
        <>
            <form action={localPath(lang, "/search")} className="mb-8 flex gap-2" role="search">
                <div className="relative min-w-0 flex-1">
                    <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
                    <input name="q" type="search" placeholder={words.searchPlaceholder} aria-label={words.search} className={`${ui.input} pl-10`} />
                </div>
                <button type="submit" className={ui.primary}>{words.search}</button>
            </form>
            <Suspense fallback={<GridSkeleton />}>
                <SearchResults lang={lang} searchParams={searchParams} />
            </Suspense>
        </>
    );
}

async function SearchResults({ lang, searchParams }: { lang: Language; searchParams: PageProps<"/[lang]/search">["searchParams"] }) {
    const params = await searchParams;
    const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim().slice(0, 80) ?? "";
    if (!q) return null;
    return (
        <>
            <h1 className="mb-4 text-xl font-medium">{getWords(lang).resultsFor(q)}</h1>
            <ProductListing lang={lang} basePath={localPath(lang, "/search")} filter={{ q }} searchParams={searchParams} />
        </>
    );
}
