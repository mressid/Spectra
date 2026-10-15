# Roadmap

Work top to bottom, **one task per session**, commit after each. Tick the box when done and add one line
on anything a later task should know. Tasks marked **API** happen in `../accessories-store-system`
(Kotlin/Spring Boot); read its `AGENTS.md` first and run its tests (`./gradlew test`, needs Docker).

## Done (skeleton)

- [x] Next.js 16.3.8, TypeScript, Tailwind 4, App Router, `src/`, Cache Components on.
- [x] API client (`src/lib/api/client.ts`), generated types (`schema.d.ts`), cached catalogue reads with
      tags (`catalog.ts`, `tags.ts`), `POST /api/revalidate` with a shared secret.
- [x] Design tokens (`globals.css`), Inter, `formatMoney` / `formatLeadTime`.
- [x] Skeleton homepage: top banner, product sections, footer line (proves cache + images work).

## 1. Backend first (small, unblock everything)

- [ ] **API-1 Prices in lists.** Add `priceFrom`, `compareAtPriceFrom`, `priceVaries` (lowest active variant)
      to `ProductResponseDto`, filled in product lists, related products and homepage sections without N+1
      queries. Integration test. Then `npm run api:spec && npm run api:types` here.
- [ ] **API-2 Visible only for the public.** Anonymous `GET` on products, categories, collections returns
      only active items; reviews only approved ones. The admin (ADMIN/STAFF token) still sees everything. Test both.
- [ ] **API-4 Shop filters.** `/products`: `sortBy=price` (on `priceFrom`), `minPrice`, `maxPrice`, `inStock=true`.
- [ ] **API-5 Sitemap feed.** `GET /api/v1/storefront/sitemap`: `{ products, categories, collections, bundles }`
      each `[{ slug, updatedAt }]`, visible only. Public.
- [ ] **API-3 Refresh the website.** A listener on the existing domain events (`common/events`, see how
      `AuditLogListener` subscribes) that POSTs `{ tags }` to `${STOREFRONT_URL}/api/revalidate` with
      `X-Revalidate-Secret`, after commit, async, never failing the admin action (log and continue). Tag mapping
      in this repo's docs/API.md, "Refreshing the cache". Config: `store.storefront-url`, `store.revalidate-secret`
      (empty URL = disabled). Unit-test the event → tags mapping.

## 2. Shell

- [ ] Header: rotating top banner, shop name, category menu (drawer on phones), cart icon with count.
- [ ] Footer from `/storefront/home` `footer` (about, contact, WhatsApp link `https://wa.me/<digits>`, socials, columns).
- [ ] `not-found.tsx` and `error.tsx` in the store's style.

## 3. Homepage

- [ ] Every section type in order: PRODUCTS (grid / row), CAROUSEL (5:2, 4:5 on phones, no autoplay when
      reduced motion), CATEGORIES tiles, BRANDS logos, BUNDLES cards, TEXT (Markdown → sanitised HTML).
- [ ] `ProductCard` with price (needs API-1), old price, discount badge, availability.
- [ ] Metadata + `Organization` JSON-LD.

## 4. Catalogue pages

- [ ] `/categories/[slug]`: title, subcategories, product grid, sort and pagination in the URL, breadcrumb (+ JSON-LD).
- [ ] `/collections/[slug]`, `/tags/[slug]`, `/sections/[slug]` (homepage "see all") reusing the same grid.
- [ ] `/search?q=` (per request, `noindex`).

## 5. Product page (the most important page)

- [ ] `/products/[slug]` with `generateStaticParams`: gallery, name, price, availability, option picker,
      quantity, personalisation text when allowed, order button, delivery line, description
      (Markdown/HTML/text, sanitised), long-description blocks, specifications, reviews, related products.
- [ ] Variant choice updates price, availability and photos without a page reload (client component fed by
      the server-loaded variants; no client fetching).
- [ ] Metadata, Open Graph image, `Product` + `BreadcrumbList` JSON-LD.
- [ ] `/bundles/[slug]`: products of the bundle, a variant picker per product with variants, saving shown.

## 6. Cart and checkout (client side, guest)

- [ ] Cart in `localStorage` (variant lines and bundle lines), drawer + `/cart` page, re-reads prices and
      availability from the API when opened.
- [ ] `/checkout`: name, phone, governorate (select), city, street, notes, promo code (`coupon-check`),
      summary; submit to `POST /checkout/orders` through a Server Action (keeps the API URL server-side).
      Field errors under fields, 409 stock messages shown on the line.
- [ ] `/orders/[number]` confirmation with the server's totals; "Suivre ma commande" page (number + phone),
      cancel while new or confirmed.

## 7. SEO and performance pass

- [ ] `sitemap.ts` (needs API-5), `robots.ts`, canonical URLs, `noindex` where listed in docs/RENDERING.md.
- [ ] Lighthouse mobile on the production build: LCP < 2.5 s, CLS < 0.1; fix what fails.

## Later (ask the owner first)

- English with translated product texts (`/fr`, `/en`, hreflang): needs bilingual product fields in the admin.
- Customer accounts, wishlist, reviews from customers, online payment.
- Hosting: one VPS (Next.js + Spring + Postgres + Mongo + MinIO) behind Nginx, Cloudflare in front.
