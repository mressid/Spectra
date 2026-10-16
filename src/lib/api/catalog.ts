import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { cache } from "react";
import { api, ApiError, type Language, type Page, type Schemas } from "./client";
import { tags } from "./tags";

/**
 * Cached reads of the public catalogue. Each function is cached ('use cache') under the "catalog"
 * profile (next.config.ts) and tagged with exactly what it returns, so an admin change refreshes only the
 * pages that show it. Arguments are part of the cache key: one entry per language, per slug, per filter.
 *
 * A cached read called inside another passes its tags up, and a page carries the tags of every read it
 * makes: never call a read tagged with something broad ("lists", "brands") from a product page.
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
export type Announcement = Schemas["AnnouncementResponseDto"];

const ALL = 500;

/** Tags a list with each product it shows, so editing one refreshes the lists that show its card. */
function tagProducts(products: { id: string }[]) {
    const ids = [...new Set(products.map((product) => tags.product(product.id)))];
    // cacheTag takes at most 128 tags per call
    for (let start = 0; start < ids.length; start += 100) {
        cacheTag(...ids.slice(start, start + 100));
    }
}

export async function getHome(language: Language): Promise<HomePage> {
    "use cache";
    cacheLife("catalog");
    // sections can be built from any product list, category, brand or bundle; the footer is in the settings
    cacheTag(tags.home, tags.lists, tags.settings, tags.categories, tags.brands, tags.bundles);
    const home = await api<HomePage>("/storefront/home", { language });
    tagProducts(home.sections.flatMap((section) => section.products ?? []));
    return home;
}

/** The banner messages showing now, for the header of every page. */
export async function getAnnouncements(): Promise<Announcement[]> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.announcements);
    return (await api<Page<Announcement>>("/announcements?visibleNow=true&size=1")).content;
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
    cacheTag(tags.lists, tags.categories, tags.collections, tags.bundles);
    return api<Sitemap>("/storefront/sitemap");
}

/* ---------- products ---------- */

/**
 * null when no visible product has this slug (the page then calls notFound()). A found product is tagged
 * with its own id only; a missing one with "lists", so it appears once a product takes that slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
    "use cache";
    cacheLife("catalog");
    const page = await api<Page<Product>>(`/products?slug=${encodeURIComponent(slug)}&isActive=true&size=1`);
    const product = page.content[0] ?? null;
    cacheTag(product ? tags.product(product.id) : tags.lists);
    return product;
}

/**
 * A few products of a category for the Explore panel and page: its own newest ones, then those of its subcategories until
 * [limit] is reached. Tagged like the category pages (through getProducts), so an admin change refreshes it.
 */
export async function getCategoryPreview(categoryId: string, limit = 4): Promise<Product[]> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.categories);
    const categories = await getCategories();
    const ids = [categoryId, ...categories.filter((category) => category.parentId === categoryId).map((category) => category.id)];
    const products: Product[] = [];
    for (const id of ids) {
        if (products.length >= limit) break;
        for (const product of (await getProducts({ categoryId: id, size: limit })).content) {
            if (products.length < limit && !products.some((known) => known.id === product.id)) products.push(product);
        }
    }
    return products;
}

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name";

export interface ProductQuery {
    categoryId?: string;
    collectionId?: string;
    tagId?: string;
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
    cacheTag(tags.lists);
    if (query.categoryId) cacheTag(tags.category(query.categoryId));
    if (query.collectionId) cacheTag(tags.collection(query.collectionId));
    if (query.tagId) cacheTag(tags.tag(query.tagId));
    if (query.brandId) cacheTag(tags.brand(query.brandId));
    if (query.inStock) cacheTag(tags.stock);
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
    if (query.tagId) params.set("tagId", query.tagId);
    if (query.brandId) params.set("brandId", query.brandId);
    if (query.q) params.set("nameContains", query.q);
    if (query.inStock) params.set("inStock", "true");
    const page = await api<Page<Product>>(`/products?${params}`);
    tagProducts(page.content);
    return page;
}

/**
 * Up to 8 products the store suggests under this one (shared categories, tags, brand, price). Tagged with
 * the products shown, not "lists": a new product joins the row when this one changes, or within the hour.
 */
export async function getRelatedProducts(productId: string): Promise<Product[]> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.product(productId));
    const related = await api<Product[]>(`/products/${productId}/related`);
    tagProducts(related);
    return related;
}

/** What changes with every sale; read live, never cached (see getVariantStock). */
export type VariantStock = Pick<Variant, "stockQuantity" | "availabilityStatus" | "canBeOrdered">;
/** Live stock of a product's variants, by variant id. */
export type StockByVariant = Record<string, VariantStock>;

/** A variant with its options, named in the admin, e.g. { Taille: "M", Couleur: "Bleu" }; no stock, it is not cached. */
export type VariantWithOptions = Omit<Variant, keyof VariantStock> & { options: Record<string, string> };

export interface ProductDetails {
    variants: VariantWithOptions[];
    // option names in display order, each with its values in display order
    optionGroups: { name: string; values: string[] }[];
    photos: Media[];
    specifications: { name: string; value: string }[];
    categories: Category[];
}

/** The variant without its stock, which must not end up in the cache. */
function withoutStock(variant: Variant): Omit<Variant, keyof VariantStock> {
    const copy: Partial<Variant> = { ...variant };
    delete copy.stockQuantity;
    delete copy.availabilityStatus;
    delete copy.canBeOrdered;
    return copy as Omit<Variant, keyof VariantStock>;
}

/** Everything the product page needs besides the product itself, in parallel. */
export async function getProductDetails(productId: string): Promise<ProductDetails> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.product(productId));
    const [variantPage, mediaPage, attributes, categories] = await Promise.all([
        api<Page<Variant>>(`/variants?productId=${productId}&isActive=true&size=100&sortBy=price&sortDirection=ASC`),
        api<Page<Media>>(`/media?productId=${productId}&size=100&sortBy=sortOrder&sortDirection=ASC`),
        api<Schemas["ProductAttributeResponseDto"][]>(`/products/${productId}/attributes`),
        api<Schemas["ProductCategoryLinkResponseDto"][]>(`/products/${productId}/categories`),
    ]);
    const selections = await Promise.all(
        variantPage.content.map((variant) =>
            api<Schemas["VariantAttributeResponseDto"][]>(`/variant-attributes/variants/${variant.id}`),
        ),
    );
    // only the options this product uses, each cached and tagged on its own (see getOption)
    const options = await Promise.all(
        [...new Set(selections.flat().map((selection) => selection.attributeId))].map(getOption),
    );
    // a specification's name is the attribute's: renaming it changes this page
    if (attributes.length) cacheTag(...attributes.map((row) => tags.attribute(row.attributeId)));
    const optionNames = options.map((option) => option.attribute).sort((a, b) => a.sortOrder - b.sortOrder);
    const optionValues = options.flatMap((option) => option.values);
    const valueById = new Map(optionValues.map((value) => [value.id, value]));
    const variants = variantPage.content.map((variant, index) => ({
        ...withoutStock(variant),
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

/**
 * Stock of each variant, read from the API on every request: the one part of the product page that is
 * not cached (partial prerendering). The page streams it into a <Suspense> hole in the cached shell.
 * One call per request even when several parts of the page ask. A failed call answers {}: the page then
 * lets the customer order, and the API rechecks stock when the order is placed.
 */
export const getVariantStock = cache(async (productId: string): Promise<StockByVariant> => {
    await connection();
    try {
        const page = await api<Page<Variant>>(`/variants?productId=${productId}&isActive=true&size=100`);
        return Object.fromEntries(
            page.content.map(({ id, stockQuantity, availabilityStatus, canBeOrdered }) => [id, { stockQuantity, availabilityStatus, canBeOrdered }]),
        );
    } catch {
        return {};
    }
});

/** One option (Taille, Couleur…) with its values, shared by every product page that uses it. */
async function getOption(attributeId: string): Promise<{ attribute: Schemas["AttributeResponseDto"]; values: Schemas["AttributeValueResponseDto"][] }> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.attribute(attributeId));
    const [attribute, values] = await Promise.all([
        api<Schemas["AttributeResponseDto"]>(`/attributes/${attributeId}`),
        api<Page<Schemas["AttributeValueResponseDto"]>>(`/attribute-values?attributeId=${attributeId}&size=${ALL}&sortBy=sortOrder&sortDirection=ASC`),
    ]);
    return { attribute, values: values.content };
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
    const collection = (await api<Page<Collection>>(`/collections?slug=${encodeURIComponent(slug)}&isActive=true&size=1`)).content[0] ?? null;
    // a missing slug waits for any collection change; a found one only for its own
    cacheTag(collection ? tags.collection(collection.id) : tags.collections);
    return collection;
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
    "use cache";
    cacheLife("catalog");
    const tag = (await api<Page<Tag>>(`/tags?slug=${encodeURIComponent(slug)}&size=1`)).content[0] ?? null;
    cacheTag(tag ? tags.tag(tag.id) : tags.tags);
    return tag;
}

/** One brand, for a product page: tagged with that brand only, so other brands' changes leave it alone. */
export async function getBrand(brandId: string): Promise<Brand | null> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.brand(brandId));
    try {
        return await api<Brand>(`/brands/${brandId}`);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

/* ---------- bundles ---------- */

export async function getBundleBySlug(slug: string): Promise<Bundle | null> {
    "use cache";
    cacheLife("catalog");
    const bundles = (await api<Page<Bundle>>(`/bundles?isActive=true&size=${ALL}`)).content;
    const bundle = bundles.find((item) => item.slug === slug) ?? null;
    cacheTag(bundle ? tags.bundle(bundle.id) : tags.bundles);
    if (bundle) tagProducts(bundle.items.map((item) => ({ id: item.productId })));
    return bundle;
}

/** Variants of the products of a bundle, so the customer can choose a size or colour for each. */
export async function getBundleVariants(bundle: Bundle): Promise<Record<string, Variant[]>> {
    "use cache";
    cacheLife("catalog");
    cacheTag(tags.bundle(bundle.id));
    tagProducts(bundle.items.map((item) => ({ id: item.productId })));
    const entries = await Promise.all(
        bundle.items.map(async (item) => [
            item.productId,
            (await api<Page<Variant>>(`/variants?productId=${item.productId}&isActive=true&size=100&sortBy=price&sortDirection=ASC`)).content,
        ] as const),
    );
    return Object.fromEntries(entries);
}

export { ApiError };
