import type { MetadataRoute } from "next";
import { getSitemap } from "@/lib/api/catalog";

/** Every visible product, category, collection and bundle, from the store API. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const site = process.env.SITE_URL ?? "http://localhost:3000";
    const { products, categories, collections, bundles } = await getSitemap();
    const entries = (path: string, items: { slug: string; updatedAt?: string }[]) =>
        items.map((item) => ({ url: `${site}/${path}/${item.slug}`, lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined }));
    return [
        { url: site, changeFrequency: "daily" },
        ...entries("categories", categories),
        ...entries("collections", collections),
        ...entries("products", products),
        ...entries("bundles", bundles),
    ];
}
