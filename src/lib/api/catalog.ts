import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { api, type Language, type Page, type Schemas } from "./client";
import { tags } from "./tags";

/**
 * Cached reads of the public catalogue. Each function is cached ('use cache') under the "catalog"
 * profile (next.config.ts) and tagged, so an admin change refreshes it within seconds.
 * Arguments are part of the cache key: one entry per language, per slug, per filter.
 *
 * Always ask for visible items only (isActive=true): the public list endpoints also return hidden ones.
 */

export type Product = Schemas["ProductResponseDto"];
export type HomePage = Schemas["HomePageDto"];
export type StoreSettings = Schemas["StoreSettingsResponseDto"];

export async function getHome(language: Language): Promise<HomePage> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.home, tags.products);
    return api<HomePage>("/storefront/home", { language });
}

export async function getStoreSettings(): Promise<StoreSettings> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.settings);
    return api<StoreSettings>("/store-settings");
}

/** null when no visible product has this slug (the page then calls notFound()). */
export async function getProductBySlug(slug: string): Promise<Product | null> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.products);
    const page = await api<Page<Product>>(`/products?slug=${encodeURIComponent(slug)}&isActive=true&size=1`);
    const product = page.content[0] ?? null;
    if (product) {
        cacheTag(tags.product(product.id));
    }
    return product;
}

export interface ProductQuery {
    categoryId?: string;
    collectionId?: string;
    tag?: string;
    brandId?: string;
    page?: number;
    size?: number;
    sortBy?: "createdAt" | "name";
    sortDirection?: "ASC" | "DESC";
}

export async function getProducts(query: ProductQuery = {}): Promise<Page<Product>> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.products);
    const params = new URLSearchParams({ isActive: "true", size: String(query.size ?? 24), page: String(query.page ?? 0) });
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && key !== "size" && key !== "page") params.set(key, String(value));
    }
    return api<Page<Product>>(`/products?${params}`);
}

/** Up to 8 products the store suggests under this one (shared categories, tags, brand, price). */
export async function getRelatedProducts(productId: string): Promise<Product[]> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.products, tags.product(productId));
    return api<Product[]>(`/products/${productId}/related`);
}
