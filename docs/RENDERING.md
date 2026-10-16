# Rendering, caching and SEO

Next.js 16 with **Cache Components** (`cacheComponents: true`). Read the bundled docs before changing
anything here: `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` and `09-revalidating.md`.
This version differs from older Next.js tutorials (no `export const revalidate`, no `getStaticProps`).

## The model

Pages are prerendered and cached; the store API refreshes exactly what changed.

1. Every read of catalogue data is a `'use cache'` function in `src/lib/api/catalog.ts`, with
   `cacheLife("catalog")` and `cacheTag(...)` (names in `src/lib/api/tags.ts`), tagged with exactly what it
   returns: a list is tagged with the id of every product it shows.
2. Profile `catalog` (next.config.ts): served from cache, rebuilt in the background at most hourly,
   kept up to 30 days. That hourly refresh is only a safety net.
3. On an admin change, the API calls `POST /api/revalidate` with the changed tags →
   `revalidateTag(tag, "max")` → only the pages carrying one of those tags go stale, and each is rebuilt
   on its next visit while the old one is still served. Nothing is rebuilt ahead, and there is no full
   rebuild: `next build` is only for deploying new code.

### What refreshes what

A page carries the tags of every cached read it makes, the header's and footer's included, and a cached
read called inside another passes its tags up. So keep broad tags out of shared code:

- The header and footer read `getStoreSettings`, `getCategories` and `getAnnouncements` only (tags
  `settings`, `categories`, `announcements`): those changes really do show on every page. They must never
  read `getHome`, whose product sections would tie every page to every product.
- A product page is tagged with its own `product:<id>`, its options (`attribute:<id>`), its brand
  (`brand:<id>`), its reviews, and the products in its "related" row. Never `lists`: editing one product
  must not refresh the others.
- Lists (category, collection, tag, search, homepage sections, sitemap) are tagged `lists`, their scope
  (`category:<id>`…), `stock` when filtered on availability, and each product they show.
- A slug lookup that finds nothing is tagged with the broad tag (`lists`, `collections`…) so the page
  appears once something takes that slug; a found one only with its own id.

| Admin change | Pages rebuilt on their next visit |
|---|---|
| Edit product X's description or photos | X's page, and the lists, homepage and "related" rows showing X |
| Rename, hide, show or reprice product X | the above, and every list (not the other product pages) |
| A sale changes X's stock | X's page, the pages showing X's card, lists filtered on "in stock" |
| Rename option "Couleur" or value "Bleu" | product pages using that option |
| Add X to category C | X's page, C's listing, the homepage |
| Rename a category | every page (the menu shows it) |
| Banner message, store settings | every page (the header and footer show them) |

Known limits, covered by the hourly refresh: a new product joins other products' "related" rows only when
those products change, and things shown on a schedule (banner messages, bundles with dates) appear or go
when their time comes, not to the second.

| Page | Route | Rendering |
|---|---|---|
| Home | `/` | cached (`home`, `lists`, and each product it shows) |
| Category | `/categories/[slug]` | cached per slug and page; filters and sort in the URL (`?sort=price&page=2`) |
| Collection / tag | `/collections/[slug]`, `/tags/[slug]` | cached (a section "see all" page, `/sections/[slug]`, is not built yet) |
| Product | `/products/[slug]` | cached per slug (`product:<id>`, its options, brand and reviews), with live stock in a `<Suspense>` hole (see below); `generateStaticParams` returns the slugs so they are built ahead |
| Bundle | `/bundles/[slug]` | cached (`bundle:<id>`) |
| Search | `/search?q=` | per request, `noindex` |
| Cart, checkout | `/cart`, `/checkout` | client; cart in `localStorage`; prices re-read at checkout and the server has the final word |
| Order tracking | `/track` | per request, `noindex`; the confirmation is shown in place after ordering |
| Sitemap, robots | `app/sitemap.ts`, `app/robots.ts` | cached (`lists`, `categories`…) |

**Stock is live, the rest of the product page is cached (partial prerendering).** `cacheComponents` makes
the page a static shell with holes. The product, photos, options, prices, reviews and related products are
cached and tagged as above. Stock (`stockQuantity`, `availabilityStatus`, `canBeOrdered`) is not: it is
stripped from the cached `getProductDetails` and read by `getVariantStock` on every request, which the page
passes as an unawaited promise to `ProductView`. Under `<Suspense>`, the availability line shows a skeleton
and the option picker and order buttons are off (no option looks sold out) until it arrives; the JSON-LD
offers' `availability` streams the same way. If the stock call fails the page lets the customer order and
the API rechecks at checkout (409 "X est épuisé"). A sale therefore no longer needs to revalidate the product
page; the `stock` tag still refreshes lists filtered on "in stock". Price stays cached and tagged.

**The shop's look is cached with the settings.** The layout reads `getStoreSettings()` (tag `settings`), turns its
`theme` into CSS variables with `src/lib/theme.ts` and writes them in a `<style>` in the page head; the header
shows the logo or icon from it arranged as the owner chose (`navbarLayout`), and the icon becomes the page icon. Saving Appearance in the admin refreshes the
`settings` tag, so the new look is on every page at its next view, with no rebuild.

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
