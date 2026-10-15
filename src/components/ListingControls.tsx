import Link from "next/link";
import type { ProductSort } from "@/lib/api/catalog";
import { words } from "@/lib/words";

/** Sort and "available only" as plain links: they work without JavaScript and Google can follow them. */
export function ListingControls({ basePath, sort, inStock, total, keep = {} }: {
    basePath: string;
    sort: ProductSort;
    inStock: boolean;
    total: number;
    // other parameters to keep in the links, e.g. the search text
    keep?: Record<string, string>;
}) {
    const href = (next: { sort?: ProductSort; inStock?: boolean }) => {
        const params = new URLSearchParams(keep);
        const nextSort = next.sort ?? sort;
        const nextStock = next.inStock ?? inStock;
        if (nextSort !== "newest") params.set("sort", nextSort);
        if (nextStock) params.set("stock", "1");
        const query = params.toString();
        return query ? `${basePath}?${query}` : basePath;
    };
    return (
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-muted">{total} produit{total > 1 ? "s" : ""}</span>
            <span className="flex-1" />
            <span className="text-muted">{words.sortLabel} :</span>
            {(Object.keys(words.sort) as ProductSort[]).map((option) => (
                <Link
                    key={option}
                    href={href({ sort: option })}
                    rel="nofollow"
                    aria-current={option === sort ? "true" : undefined}
                    className={option === sort ? "font-semibold underline underline-offset-4" : "text-muted hover:text-ink"}
                >
                    {words.sort[option]}
                </Link>
            ))}
            <Link href={href({ inStock: !inStock })} rel="nofollow" className={inStock ? "font-semibold" : "text-muted hover:text-ink"}>
                {inStock ? "☑" : "☐"} {words.inStockOnly}
            </Link>
        </div>
    );
}

/** Previous / next pages, keeping the other URL parameters. */
export function Pagination({ basePath, params, page, totalPages }: { basePath: string; params: URLSearchParams; page: number; totalPages: number }) {
    if (totalPages <= 1) return null;
    const href = (target: number) => {
        const next = new URLSearchParams(params);
        if (target > 1) next.set("page", String(target));
        else next.delete("page");
        const query = next.toString();
        return query ? `${basePath}?${query}` : basePath;
    };
    const button = "rounded-control border border-field px-4 py-2";
    return (
        <nav aria-label="Pages" className="mt-10 flex items-center justify-center gap-3 text-sm">
            {page > 1 && <Link className={button} href={href(page - 1)}>{words.previous}</Link>}
            <span className="text-muted">{page} / {totalPages}</span>
            {page < totalPages && <Link className={button} href={href(page + 1)}>{words.next}</Link>}
        </nav>
    );
}
