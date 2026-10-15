import { getProducts, type ProductQuery, type ProductSort } from "@/lib/api/catalog";
import { ListingControls, Pagination } from "./ListingControls";
import { ProductGrid } from "./ProductGrid";

const SORTS: ProductSort[] = ["newest", "price-asc", "price-desc", "name"];

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Sort, "available only" and page come from the URL; the products themselves are cached per combination. */
export async function ProductListing({ basePath, filter, searchParams }: {
    basePath: string;
    filter: Omit<ProductQuery, "sort" | "page" | "inStock">;
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const sortParam = first(params.sort) as ProductSort | undefined;
    const sort = sortParam && SORTS.includes(sortParam) ? sortParam : "newest";
    const inStock = first(params.stock) === "1";
    const page = Math.max(1, Number(first(params.page)) || 1);
    const result = await getProducts({ ...filter, sort, inStock, page });
    const kept = new URLSearchParams();
    if (sort !== "newest") kept.set("sort", sort);
    if (inStock) kept.set("stock", "1");
    if (filter.q) kept.set("q", filter.q);
    return (
        <>
            <ListingControls basePath={basePath} sort={sort} inStock={inStock} total={result.page.totalElements} keep={filter.q ? { q: filter.q } : {}} />
            <ProductGrid products={result.content} />
            <Pagination basePath={basePath} params={kept} page={page} totalPages={result.page.totalPages} />
        </>
    );
}

export function GridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
            {Array.from({ length: 8 }, (_, index) => (
                <div key={index}>
                    <div className="aspect-square rounded-photo bg-surface" />
                    <div className="mt-2 h-4 w-2/3 rounded-chip bg-surface" />
                </div>
            ))}
        </div>
    );
}
