/**
 * Cache tags. Every cached read is tagged with what it shows, and the store API calls POST /api/revalidate
 * with the tags of what changed (see docs/RENDERING.md, "What refreshes what"), so only the pages that show
 * the change are rebuilt. A page carries the tags of every cached read it makes, the header's included.
 * Keep these names in sync with the backend (StorefrontTags.kt).
 */
export const tags = {
    home: "home",
    settings: "settings",
    announcements: "announcements",
    // which products exist, in which order: every product list, the homepage, the sitemap; never a product page
    lists: "lists",
    // lists filtered on "in stock only"
    stock: "stock",
    // a product's page, and every list, section or "related" row that shows its card
    product: (id: string) => `product:${id}`,
    // an option or specification (Taille, Couleur…) with its values
    attribute: (id: string) => `attribute:${id}`,
    categories: "categories",
    category: (id: string) => `category:${id}`,
    collections: "collections",
    collection: (id: string) => `collection:${id}`,
    tags: "tags",
    tag: (id: string) => `tag:${id}`,
    brands: "brands",
    brand: (id: string) => `brand:${id}`,
    bundles: "bundles",
    bundle: (id: string) => `bundle:${id}`,
    reviews: (productId: string) => `reviews:${productId}`,
} as const;
