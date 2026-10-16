import { NextResponse, type NextRequest } from "next/server";
import { getCategories, getCategoryPreview } from "@/lib/api/catalog";

/**
 * A few products of a category, for the header's Explore panel, which loads them when the visitor points at a
 * category. Only ids of real, visible categories are answered (so random ids cannot fill the cache); the read is
 * the cached, tagged one the Explore page uses, so an admin change shows here too.
 */
export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get("categoryId") ?? "";
    const categories = await getCategories();
    if (!categories.some((category) => category.id === id)) {
        return NextResponse.json({ products: [] }, { status: 404 });
    }
    const products = await getCategoryPreview(id, 4);
    return NextResponse.json(
        {
            products: products.map(({ id, name, slug, thumbnailUrl, priceFrom, compareAtPriceFrom, priceVaries, availability }) => ({
                id, name, slug, thumbnailUrl, priceFrom, compareAtPriceFrom, priceVaries, availability,
            })),
        },
        { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
    );
}
