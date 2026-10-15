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

## 1. Backend (done 2026-10-15, in ../accessories-store-system)

- [x] **API-1** `priceFrom`, `compareAtPriceFrom`, `priceVaries` on products, batched.
- [x] **API-2** anonymous callers only get visible products, categories, collections and approved reviews.
- [x] **API-3** the API POSTs changed cache tags to `/api/revalidate`, batched every 3 s
      (`STOREFRONT_URL`, `STOREFRONT_REVALIDATE_SECRET`). Verified: an order marks its product page stale.
- [x] **API-4** `sortBy=price`, `minPrice`, `maxPrice`, `inStock=true` on `/products`.
- [x] **API-5** `GET /api/v1/storefront/sitemap`.

## 2–6. Pages (done 2026-10-15)

- [x] Header (rotating banner, categories drawer on phones, search, cart count), footer from the admin.
- [x] Homepage: every section type (products grid/row, carousel with phone image, categories, brands,
      bundles, Markdown text), `Store` JSON-LD.
- [x] Category, collection, tag and search pages: sort, "available only", pagination in the URL; breadcrumb JSON-LD.
- [x] Product page: gallery, option picker (names from the admin), quantity, personalisation, add to cart,
      order now, delivery line, description, long-description blocks, specifications, reviews, related,
      `Product` JSON-LD with one offer per variant.
- [x] Bundle page with a variant choice per product.
- [x] Cart (localStorage), guest checkout through Server Actions (promo code, fee per governorate,
      field errors), confirmation with the server's totals, order tracking and cancel.
- [x] `sitemap.xml`, `robots.txt`, `noindex` on cart, checkout, search, tracking; 404 and error pages.

## Design pass (done 2026-10-15)

- [x] French and English under `/fr` and `/en` (proxy, hreflang, sitemap per language, switch in the header).
- [x] Dark theme with a toggle, no flash on load; icons from lucide-react, no emoji.
- [x] Sticky header with blur, phone menu panel, trust strip on the homepage, product cards with badges,
      redesigned product page, checkout, confirmation and order tracking.

## 7. Next

- [ ] Lighthouse mobile on the production build for /, a category and a product page; fix what misses
      the budget in docs/RENDERING.md (watch the carousel's first image and the product photo).
- [ ] Homepage section "Tout voir" pages (`/sections/[slug]`): the API needs the section's product source
      in `HomeSectionDto` (or an endpoint returning a section's products by slug, paged).
- [ ] Variant photos: when a variant is chosen, show its own photos (`/media?variantId=`) first.
- [ ] Cart: re-read prices and availability when the cart opens (a product page may have changed since),
      and show a line's 409 "sold out" message from checkout on that line.
- [ ] Order confirmation as its own page that survives a reload (today it is shown in place).
- [ ] Generic template pass on the backend and admin: demo data, helper texts and examples still talk about
      jewellery (rings, "Silver 925", "engraving"). Replace with neutral examples.

## Later (ask the owner first)

- English with translated product texts (`/fr`, `/en`, hreflang): needs bilingual product fields in the admin.
- Customer accounts, wishlist, reviews from customers, online payment.
- Hosting: one VPS (Next.js + Spring + Postgres + Mongo + MinIO) behind Nginx, Cloudflare in front.
