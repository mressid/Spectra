# Store API for the storefront

The storefront reads from the Spring Boot app in `../accessories-store-system` (API base
`http://localhost:8080/api/v1`). The full contract is [`openapi.json`](openapi.json) and its generated
types are `src/lib/api/schema.d.ts`. Refresh both after a backend change:

```bash
npm run api:spec   # downloads openapi.json from the running API (API_URL, default :8080)
npm run api:types  # regenerates src/lib/api/schema.d.ts
```

Never hand-write a type that exists in the schema: use `Schemas["ProductResponseDto"]` from `src/lib/api/client.ts`.

## Basics

- **Envelope.** Every response is `{ success, data, message, errors, statusCode }`. `api()` in
  `src/lib/api/client.ts` returns `data` or throws `ApiError` (`message`, `status`, `errors`).
- **Field errors** come as `"field:problem"` strings in `errors`, e.g. `"customerPhone:must be a valid phone number"`.
  `ApiError.fieldErrors` turns them into `{ customerPhone: "…" }` to show under each input.
- **Language.** Send `Accept-Language: fr` or `en`. Messages (errors, promo code checks) come back in it if
  the store offers that language (`store-settings.languages`), else in `store-settings.defaultLanguage`.
  Catalogue content (product names, descriptions) is stored in one language and never translated by the API.
- **Money.** Numbers in TND with 3 decimals (`35.5` means 35,500 DT). Always format with `formatMoney()`
  (`src/lib/format.ts`); never do arithmetic for a total the customer pays: the server computes it.
- **Pages.** Lists are Spring pages: `{ content: [...], page: { size, number, totalElements, totalPages } }`,
  `page` starts at **0**. Params: `page`, `size`, `sortBy`, `sortDirection` (`ASC`/`DESC`).
- **Visible items only.** Anonymous callers only ever get visible products, categories, collections and
  approved reviews (hidden ones answer 404). `catalog.ts` still sends `isActive=true` to be explicit.
- **Images** are full URLs on the store's MinIO bucket (`MEDIA_URL`). Render them with `next/image`.
- **No auth.** The storefront uses public endpoints only. Customer accounts exist in the API
  (`/auth/register`, `/auth/login`) but checkout works without one; keep it guest-first.

## Endpoints the storefront uses

### Store-wide

| Call | Returns | Use |
|---|---|---|
| `GET /storefront/home` | `HomePageDto`: `announcements` (visible top-banner messages, in order), `sections` (homepage sections in order, each with its content already resolved), `footer` | Homepage, top banner and footer on every page |
| `GET /store-settings` | delivery fee, free-delivery threshold, fee per governorate, `languages`, `defaultLanguage`, shop name, stamp duty | Delivery info on product page and cart; languages offered |
| `GET /checkout/governorates` | the 24 Tunisian governorates, official spelling | Address form: a select, never free text |
| `GET /storefront/sitemap` | `{ products, categories, collections, bundles }`, each `[{ slug, updatedAt }]`, visible only | `sitemap.xml`, `generateStaticParams` |

Homepage section types (`HomeSectionDto.type`), all in `sections[]`:

| Type | Fields filled | Show as |
|---|---|---|
| `PRODUCTS` | `title`, `subtitle`, `slug` (its "see all" page), `layout` (`GRID` or `ROW`), `products` | Product grid or a sideways-scrolling row |
| `CAROUSEL` | `slides` (`HeroSlideResponseDto`: `imageUrl` 5:2, optional `mobileImageUrl` 4:5, `title`, `description`, `buttonLabel`, `linkUrl`, `altText`) | Full-width slider; text and button optional |
| `CATEGORIES` | `categories` (with `imageUrl` 4:3) | Category tiles |
| `BRANDS` | `brands` (with `logoUrl`, square) | Logo row |
| `BUNDLES` | `bundles` | Bundle cards with the saving |
| `TEXT` | `title`, `body` (Markdown) | A text block; sanitise the HTML |

### Catalogue

| Call | Notes |
|---|---|
| `GET /products?isActive=true&…` | Filters: `categoryId`, `collectionId`, `tag` (tag slug), `tagId`, `brandId`, `nameContains`, `slug`, `minPrice`, `maxPrice`, `inStock=true`. Sort: `createdAt`, `name`, `price` (lowest variant price). Each product has `priceFrom`, `compareAtPriceFrom`, `priceVaries`. |
| `GET /products?slug=<slug>&isActive=true&size=1` | Product page lookup by URL slug (`getProductBySlug`). |
| `GET /products/{id}/related` | Up to 8 suggestions: shared categories, then tags and brand, closest price. Already visible-only. |
| `GET /products/{id}/attributes` | Specifications as rows (`attributeName`, `value`, `sortOrder`): show as "Matière : Argent 925" lines in `sortOrder`. |
| `GET /products/{id}/categories` | The product's categories, for the breadcrumb. |
| `GET /variants?productId=<id>&isActive=true` | Also `minPrice`, `maxPrice`. Variants: `price`, `compareAtPrice` (old price), `availabilityStatus` (`IN_STOCK`, `ON_ORDER`, `OUT_OF_STOCK`), `leadTimeDays`, `canBeOrdered`, `stockQuantity`. |
| `GET /variant-attributes/variants/{variantId}` | Options of a variant (Size: 52), to build the option picker; attribute names from `GET /attributes?isVariantLevel=true`. |
| `GET /media?productId=<id>` / `?variantId=<id>` | Extra photos in `sortOrder`; the product's `thumbnailUrl` comes first. |
| `GET /categories?isActive=true` | Tree via `parentId` (null = top level), `sortOrder`, `imageUrl`, SEO fields. `?slug=` for a category page. |
| `GET /collections?isActive=true&slug=` | Seasonal selections (dates already applied by `isActive` + schedule). |
| `GET /bundles?availableNow=true` and `/bundles/{id}` | `items[]` (product, quantity, `unitPriceFrom`, `hasVariants`), `regularPrice`, `bundlePrice`, `priceVaries` ("from"), `isAvailable`. |
| `GET /reviews?productId=<id>&isApproved=true` | Approved reviews: `rating` 1–5, `title`, `body`. |

Product fields worth knowing (`ProductResponseDto`): `name`, `slug`, `thumbnailUrl` (square),
`shortDescription`, `description` + `descriptionFormat` (`MARKDOWN`, `HTML`, `TEXT`), `contentBlocks`
(long description: `TEXT`, `IMAGE` 16:9, `VIDEO` blocks in order), `seoTitle`, `seoDescription`,
`hasVariants`, `defaultVariantId` (simple products), `availability`, `leadTimeDays`, `allowPersonalization`,
`personalizationInstructions`.

### Checkout (cash on delivery, no account)

| Call | Body | Notes |
|---|---|---|
| `POST /checkout/coupon-check` | `{ code, subtotal, customerPhone? }` | Never fails: `{ code, valid, discount, message }`; show `message` when not valid (already in the customer's language). |
| `POST /checkout/orders` | `PlaceOrderDto` (below) | 201 with the order (`number`, totals). 400 with field errors, 409 when stock ran out ("… is sold out"). Rate limited per IP. |
| `POST /checkout/track-order` | `{ orderNumber, customerPhone }` | The order with its status and step dates. |
| `POST /checkout/cancel-order` | `{ orderNumber, customerPhone }` | Works while the order is new or confirmed; 409 after. |

`PlaceOrderDto`: `customerName`, `customerPhone`, `customerEmail?`, `streetLine1`, `streetLine2?`, `city`,
`state` (a governorate from the list, required for `countryCode: "TN"`), `postalCode?`, `countryCode` (`"TN"`),
`deliveryNotes?`, `couponCode?`, `items: [{ variantId, quantity, personalization? }]`,
`bundles: [{ bundleId, quantity, variantIds: [one chosen variant per product with variants] }]`.
The server prices everything (bundle discounts, coupon, delivery fee per governorate, stamp duty):
show its totals on the confirmation page, not the cart's estimate.

Order statuses a customer can see: `PENDING` (new), `CONFIRMED`, `SHIPPED` (with the courier), `FULFILLED`
(delivered), `REFUSED`, `CANCELLED`. Words for them: docs/DESIGN.md, "Words".

## Refreshing the cache

Pages are cached (docs/RENDERING.md). The store API will call `POST /api/revalidate` on this website with
header `X-Revalidate-Secret: <REVALIDATE_SECRET>` and body `{ "tags": [...] }` after each change (task API-3).
Tag names are in `src/lib/api/tags.ts`:

| Change in the admin | Tags to send |
|---|---|
| Product, its variants, photos, specifications, stock, an order taking stock | `product:<id>`, `products` |
| Category / collection / tag / brand | `category:<id>` (etc.), `categories` / `collections` / `tags` / `brands`, `products` |
| Bundle | `bundle:<id>`, `bundles`, `home` |
| Banner, carousel, homepage section, footer | `home` |
| Store settings (delivery fees, languages) | `settings`, `home` |
| Review approved or removed | `reviews:<productId>` |

## Backend gaps

All five gaps found when the skeleton was made (prices in lists, visible-only, page refresh, shop filters,
sitemap) are done. Open ones are listed in docs/ROADMAP.md, "Next".
