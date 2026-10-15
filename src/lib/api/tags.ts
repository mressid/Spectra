/**
 * Cache tags. Every cached read is tagged; the store API calls POST /api/revalidate with the tags of
 * what changed (see docs/API.md, "Refreshing the cache"), and only those pages are rebuilt.
 * Keep these names in sync with the backend notifier.
 */
export const tags = {
    home: "home",
    settings: "settings",
    // any list of products (category pages, sections, search): refreshed when any product changes
    products: "products",
    product: (id: string) => `product:${id}`,
    categories: "categories",
    category: (id: string) => `category:${id}`,
    collections: "collections",
    collection: (id: string) => `collection:${id}`,
    tags: "tags",
    brands: "brands",
    bundles: "bundles",
    bundle: (id: string) => `bundle:${id}`,
    reviews: (productId: string) => `reviews:${productId}`,
} as const;
