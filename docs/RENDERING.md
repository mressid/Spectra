# Rendering, caching and SEO

Next.js 16 with **Cache Components** (`cacheComponents: true`). Read the bundled docs before changing
anything here: `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` and `09-revalidating.md`.
This version differs from older Next.js tutorials (no `export const revalidate`, no `getStaticProps`).

## The model

Pages are prerendered and cached; the store API refreshes exactly what changed.

1. Every read of catalogue data is a `'use cache'` function in `src/lib/api/catalog.ts`, with
   `cacheLife("catalog")` and `cacheTag(...)` (names in `src/lib/api/tags.ts`).
2. Profile `catalog` (next.config.ts): served from cache, rebuilt in the background at most hourly,
   kept up to 30 days. That hourly refresh is only a safety net.
3. On an admin change, the API calls `POST /api/revalidate` with the changed tags →
   `revalidateTag(tag, "max")` → the next visitor still gets the cached page instantly while it rebuilds.
4. Anything per-customer (cart, checkout, order tracking) is never cached: client components, or server
   code that runs per request inside `<Suspense>`.

| Page | Route | Rendering |
|---|---|---|
| Home | `/` | cached (`home`, `products`) |
| Category | `/categories/[slug]` | cached per slug and page; filters and sort in the URL (`?sort=price&page=2`) |
| Collection / tag / section "see all" | `/collections/[slug]`, `/tags/[slug]`, `/sections/[slug]` | cached |
| Product | `/products/[slug]` | cached per slug (`product:<id>`, `products`); `generateStaticParams` returns the slugs so they are built ahead |
| Bundle | `/bundles/[slug]` | cached (`bundle:<id>`) |
| Search | `/search?q=` | per request, `noindex` |
| Cart, checkout | `/cart`, `/checkout` | client; cart in `localStorage`; prices re-read at checkout and the server has the final word |
| Order confirmation, tracking | `/orders/[number]` | per request, `noindex` |
| Sitemap, robots | `app/sitemap.ts`, `app/robots.ts` | cached (`products`, `categories`…) |

**Stock and price freshness.** A cached product page may be a few seconds old after a sale. That is fine:
the API rechecks price and stock when the order is placed and answers 409 with "X est épuisé", which the
checkout shows. Do not make product pages dynamic to chase stock.

## SEO

- `generateMetadata` on every page: `title` (SEO title or name), `description` (SEO description or short
  description, 155 characters), `alternates.canonical` (without filter params), `openGraph.images` (the
  square thumbnail), `robots: { index: false }` on search, cart, checkout, orders.
- **Structured data** (JSON-LD in a `<script type="application/ld+json">`):
  - Product page: `Product` with `name`, `image[]`, `description`, `brand`, `sku`, and `offers`
    (`price`, `priceCurrency: "TND"`, `availability`: `InStock` / `PreOrder` (made to order) / `OutOfStock`,
    `url`); `aggregateRating` only when there are approved reviews.
  - `BreadcrumbList` on product and category pages; `Organization` (shop name, logo, social links) on home.
- Clean URLs from slugs; one URL per page (redirect trailing slashes, canonical on filtered pages).
- `app/sitemap.ts` lists every visible product, category, collection and bundle with `lastModified`.
- Headings: one `h1` per page (product name, category name), sections `h2`.

## Performance budget

Measured with Lighthouse mobile on the production build (`npm run build && npm start`):

| Metric | Target |
|---|---|
| LCP | < 2.5 s (the main product photo: `priority`, correct `sizes`) |
| CLS | < 0.1 (every image has its shape; fonts `display: swap` from `next/font`) |
| INP | < 200 ms |
| JS per page | as little as possible: pages are server components; client components only for the cart button, option picker, gallery swipe, carousel, checkout form |

Rules: no client-side data fetching for catalogue content; no UI library that ships a runtime (MUI, Chakra);
Tailwind only. Images through `next/image` (AVIF/WebP, sized); a 2.3 MB upload becomes ~15 KB on a card.

## Languages

Every page lives under `app/[lang]/…` (`/fr/…`, `/en/…`); the layout's `generateStaticParams` builds both,
so each language is its own cached, static page.

- `src/proxy.ts` sends a path without a language (`/`, an old link) to the visitor's language: the one
  they picked before (cookie `lang`, set by the switch), else their browser's, else French.
- The layout redirects a language the shop does not offer (store settings `languages`) to its default.
- `generateMetadata` uses `alternates(lang, path)` from `src/lib/i18n.ts`: canonical URL plus hreflang
  links; `sitemap.xml` lists every page in each offered language.
- The language is sent to the API as `Accept-Language`, so its messages (checkout errors, promo codes)
  match the page. Product texts are not translated.
