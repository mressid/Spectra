import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { api, ApiError, type Language, type Page, type Schemas } from "./client";
import { tags } from "./tags";

/**
 * Cached reads of the public catalogue. Each function is cached ('use cache') under the "catalog"
 * profile (next.config.ts) and tagged, so an admin change refreshes it within seconds.
 * Arguments are part of the cache key: one entry per language, per slug, per filter.
 *
 * The API only returns visible items to the public; isActive=true is still sent to be explicit.
 */

export type Product = Schemas["ProductResponseDto"];
export type Variant = Schemas["VariantResponseDto"];
export type HomePage = Schemas["HomePageDto"];
export type HomeSection = Schemas["HomeSectionDto"];
export type StoreSettings = Schemas["StoreSettingsResponseDto"];
export type Category = Schemas["CategoryResponseDto"];
export type Collection = Schemas["CollectionResponseDto"];
export type Tag = Schemas["TagResponseDto"];
export type Brand = Schemas["BrandResponseDto"];
export type Bundle = Schemas["BundleResponseDto"];
export type Review = Schemas["ReviewResponseDto"];
export type Media = Schemas["MediaResponseDto"];
export type Sitemap = Schemas["SitemapDto"];

const ALL = 500;

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

export async function getGovernorates(): Promise<string[]> {
    "use cache";
    cacheLife("max");
    return api<string[]>("/checkout/governorates");
}

export async function getSitemap(): Promise<Sitemap> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.products, tags.categories, tags.collections, tags.bundles);
    return api<Sitemap>("/storefront/sitemap");
}

/* ---------- products ---------- */

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

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name";

export interface ProductQuery {
    categoryId?: string;
    collectionId?: string;
    tag?: string;
    brandId?: string;
    q?: string;
    inStock?: boolean;
    sort?: ProductSort;
    // from 1, as in the URL (?page=2)
    page?: number;
    size?: number;
}

const SORTS: Record<ProductSort, [string, "ASC" | "DESC"]> = {
    newest: ["createdAt", "DESC"],
    "price-asc": ["price", "ASC"],
    "price-desc": ["price", "DESC"],
    name: ["name", "ASC"],
};

export async function getProducts(query: ProductQuery = {}): Promise<Page<Product>> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.products);
    const [sortBy, sortDirection] = SORTS[query.sort ?? "newest"];
    const params = new URLSearchParams({
        isActive: "true",
        size: String(query.size ?? 24),
        page: String(Math.max(0, (query.page ?? 1) - 1)),
        sortBy,
        sortDirection,
    });
    if (query.categoryId) params.set("categoryId", query.categoryId);
    if (query.collectionId) params.set("collectionId", query.collectionId);
    if (query.tag) params.set("tag", query.tag);
    if (query.brandId) params.set("brandId", query.brandId);
    if (query.q) params.set("nameContains", query.q);
    if (query.inStock) params.set("inStock", "true");
    return api<Page<Product>>(`/products?${params}`);
}

/** Up to 8 products the store suggests under this one (shared categories, tags, brand, price). */
export async function getRelatedProducts(productId: string): Promise<Product[]> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.products, tags.product(productId));
    return api<Product[]>(`/products/${productId}/related`);
}

/** A variant with its options, named in the admin, e.g. { Taille: "M", Couleur: "Bleu" }. */
export type VariantWithOptions = Variant & { options: Record<string, string> };

export interface ProductDetails {
    variants: VariantWithOptions[];
    // option names in display order, each with its values in display order
    optionGroups: { name: string; values: string[] }[];
    photos: Media[];
    specifications: { name: string; value: string }[];
    categories: Category[];
}

/** Everything the product page needs besides the product itself, in parallel. */
export async function getProductDetails(productId: string): Promise<ProductDetails> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.products, tags.product(productId));
    const [variantPage, mediaPage, attributes, categories, optionNames, optionValues] = await Promise.all([
        api<Page<Variant>>(`/variants?productId=${productId}&isActive=true&size=100&sortBy=price&sortDirection=ASC`),
        api<Page<Media>>(`/media?productId=${productId}&size=100&sortBy=sortOrder&sortDirection=ASC`),
        api<Schemas["ProductAttributeResponseDto"][]>(`/products/${productId}/attributes`),
        api<Schemas["ProductCategoryLinkResponseDto"][]>(`/products/${productId}/categories`),
        getVariantOptionNames(),
        getAttributeValues(),
    ]);
    const selections = await Promise.all(
        variantPage.content.map((variant) =>
            api<Schemas["VariantAttributeResponseDto"][]>(`/variant-attributes/variants/${variant.id}`),
        ),
    );
    const valueById = new Map(optionValues.map((value) => [value.id, value]));
    const variants = variantPage.content.map((variant, index) => ({
        ...variant,
        options: Object.fromEntries(
            selections[index].flatMap((selection) => {
                const name = optionNames.find((attribute) => attribute.id === selection.attributeId)?.name;
                const value = valueById.get(selection.attributeValueId)?.value;
                return name && value ? [[name, value]] : [];
            }),
        ),
    }));
    const optionGroups = optionNames
        .map((attribute) => ({
            name: attribute.name,
            values: optionValues
                .filter((value) => value.attributeId === attribute.id)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((value) => value.value)
                .filter((value) => variants.some((variant) => variant.options[attribute.name] === value)),
        }))
        .filter((group) => group.values.length > 0);
    const allCategories = await getCategories();
    return {
        variants,
        optionGroups,
        photos: mediaPage.content.filter((media) => media.mediaType === "IMAGE"),
        specifications: [...attributes]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((row) => ({ name: row.attributeName, value: row.value })),
        categories: categories.flatMap((link) => allCategories.filter((category) => category.id === link.categoryId)),
    };
}

async function getVariantOptionNames(): Promise<Schemas["AttributeResponseDto"][]> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.products);
    return (await api<Page<Schemas["AttributeResponseDto"]>>(`/attributes?isVariantLevel=true&size=${ALL}&sortBy=sortOrder&sortDirection=ASC`)).content;
}

async function getAttributeValues(): Promise<Schemas["AttributeValueResponseDto"][]> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.products);
    return (await api<Page<Schemas["AttributeValueResponseDto"]>>(`/attribute-values?size=5000&sortBy=sortOrder&sortDirection=ASC`)).content;
}

export async function getReviews(productId: string): Promise<Review[]> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.reviews(productId));
    return (await api<Page<Review>>(`/reviews?productId=${productId}&isApproved=true&size=50&sortBy=createdAt&sortDirection=DESC`)).content;
}

/* ---------- categories, collections, tags, brands ---------- */

/** Every visible category, in the admin's order; parentId builds the tree. */
export async function getCategories(): Promise<Category[]> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.categories);
    return (await api<Page<Category>>(`/categories?isActive=true&size=${ALL}&sortBy=sortOrder&sortDirection=ASC`)).content;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    return (await getCategories()).find((category) => category.slug === slug) ?? null;
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.collections);
    return (await api<Page<Collection>>(`/collections?slug=${encodeURIComponent(slug)}&isActive=true&size=1`)).content[0] ?? null;
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.tags);
    return (await api<Page<Tag>>(`/tags?slug=${encodeURIComponent(slug)}&size=1`)).content[0] ?? null;
}

export async function getBrands(): Promise<Brand[]> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.brands);
    return (await api<Page<Brand>>(`/brands?size=${ALL}&sortBy=name&sortDirection=ASC`)).content;
}

/* ---------- bundles ---------- */

export async function getBundleBySlug(slug: string): Promise<Bundle | null> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.bundles);
    const bundles = (await api<Page<Bundle>>(`/bundles?isActive=true&size=${ALL}`)).content;
    const bundle = bundles.find((item) => item.slug === slug) ?? null;
    if (bundle) {
        cacheTag(tags.bundle(bundle.id));
    }
    return bundle;
}

/** Variants of the products of a bundle, so the customer can choose a size or colour for each. */
export async function getBundleVariants(bundle: Bundle): Promise<Record<string, Variant[]>> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.products, tags.bundle(bundle.id));
    const entries = await Promise.all(
        bundle.items.map(async (item) => [
            item.productId,
            (await api<Page<Variant>>(`/variants?productId=${item.productId}&isActive=true&size=100&sortBy=price&sortDirection=ASC`)).content,
        ] as const),
    );
    return Object.fromEntries(entries);
}

export { ApiError };
