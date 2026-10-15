import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ProductSort } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { getWords } from "@/lib/words";

/** Sort and "available only" as plain links: they work without JavaScript and Google can follow them. */
export function ListingControls({ lang, basePath, sort, inStock, total, keep = {} }: {
    lang: Language;
    // full path including the language
    basePath: string;
    sort: ProductSort;
    inStock: boolean;
    total: number;
    // other parameters to keep in the links, e.g. the search text
    keep?: Record<string, string>;
}) {
    const words = getWords(lang);
    const href = (next: { sort?: ProductSort; inStock?: boolean }) => {
        const params = new URLSearchParams(keep);
        const nextSort = next.sort ?? sort;
        const nextStock = next.inStock ?? inStock;
        if (nextSort !== "newest") params.set("sort", nextSort);
        if (nextStock) params.set("stock", "1");
        const query = params.toString();
        return query ? `${basePath}?${query}` : basePath;
    };
    const chip = "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-control border px-3.5 text-sm";
    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-sm text-muted tabular-nums">{words.products(total)}</span>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:ml-auto sm:px-0 sm:pb-0">
                <span className="sr-only">{words.sortLabel}</span>
                {(Object.keys(words.sort) as ProductSort[]).map((option) => (
                    <Link
                        key={option}
                        href={href({ sort: option })}
                        rel="nofollow"
                        aria-current={option === sort ? "true" : undefined}
                        className={`${chip} ${option === sort ? "border-ink bg-ink text-on-ink" : "border-field text-muted hover:border-ink hover:text-ink"}`}
                    >
                        {words.sort[option]}
                    </Link>
                ))}
                <Link
                    href={href({ inStock: !inStock })}
                    rel="nofollow"
                    aria-pressed={inStock}
                    className={`${chip} ${inStock ? "border-stock bg-stock-soft text-stock" : "border-field text-muted hover:border-ink hover:text-ink"}`}
                >
                    {inStock && <Check size={15} aria-hidden />}
                    {words.inStockOnly}
                </Link>
            </div>
        </div>
    );
}

/** Previous / next pages, keeping the other URL parameters. */
export function Pagination({ lang, basePath, params, page, totalPages }: { lang: Language; basePath: string; params: URLSearchParams; page: number; totalPages: number }) {
    if (totalPages <= 1) return null;
    const words = getWords(lang);
    const href = (target: number) => {
        const next = new URLSearchParams(params);
        if (target > 1) next.set("page", String(target));
        else next.delete("page");
        const query = next.toString();
        return query ? `${basePath}?${query}` : basePath;
    };
    const button = "inline-flex h-10 items-center gap-1 rounded-control border border-field px-3 text-sm hover:border-ink";
    return (
        <nav aria-label={words.pages} className="mt-12 flex items-center justify-center gap-3">
            {page > 1 && <Link className={button} href={href(page - 1)}><ChevronLeft size={16} aria-hidden />{words.previous}</Link>}
            <span className="text-sm text-muted tabular-nums">{words.page(page, totalPages)}</span>
            {page < totalPages && <Link className={button} href={href(page + 1)}>{words.next}<ChevronRight size={16} aria-hidden /></Link>}
        </nav>
    );
}
