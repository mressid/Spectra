import type { MetadataRoute } from "next";
import { getSitemap, getStoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";

/** Every visible product, category, collection and bundle, in each language the shop offers. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const site = process.env.SITE_URL ?? "http://localhost:3000";
    const [{ products, categories, collections, bundles }, settings] = await Promise.all([getSitemap(), getStoreSettings()]);
    const languages = settings.languages as Language[];
    const url = (lang: Language, path: string) => `${site}/${lang}${path}`;
    const entry = (path: string, updatedAt?: string) =>
        languages.map((lang) => ({
            url: url(lang, path),
            lastModified: updatedAt ? new Date(updatedAt) : undefined,
            alternates: { languages: Object.fromEntries(languages.map((code) => [code, url(code, path)])) },
        }));
    return [
        ...entry(""),
        ...categories.flatMap((item) => entry(`/categories/${item.slug}`, item.updatedAt)),
        ...collections.flatMap((item) => entry(`/collections/${item.slug}`, item.updatedAt)),
        ...products.flatMap((item) => entry(`/products/${item.slug}`, item.updatedAt)),
        ...bundles.flatMap((item) => entry(`/bundles/${item.slug}`, item.updatedAt)),
    ];
}
