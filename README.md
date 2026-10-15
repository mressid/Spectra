# Spectra

The storefront of the shop template: a fast, SEO-friendly shop for small stores, Tunisia first
(prices in TND, guest checkout, cash on delivery). French and English, light and dark theme.

It is the front half of a two-part project:

| Part | Repository | What it does |
|---|---|---|
| **Spectra** (this repo, the storefront) | [mressid/Spectra](https://github.com/mressid/Spectra) | What customers see: homepage, catalogue, product pages, cart, checkout, order tracking |
| **Backend + admin** | [mressid/accessories-store-system](https://github.com/mressid/accessories-store-system) | Spring Boot API, PostgreSQL, MinIO for photos, and the React-Admin dashboard where the shop owner manages products, orders, stock, homepage and settings |

The storefront has no database of its own. Everything it shows comes from the backend's public API, and
the backend tells the storefront which pages to refresh whenever the owner changes something.

## Features

- **Catalogue**: homepage sections arranged in the admin (product grids and rows, carousel, categories,
  brands, bundles, text), category, collection, tag and search pages with sort, "available only" and pagination.
- **Product page**: gallery, option picker (option names come from the admin), quantity, personalisation,
  description, specifications, long-description blocks (text, images, videos), reviews, related products.
- **Bundles** with a variant choice per product.
- **Cart and checkout** without an account: promo codes, delivery fee per governorate, cash on delivery,
  confirmation with the server's totals, order tracking and cancellation.
- **Languages**: every page under `/fr/…` and `/en/…`; product texts stay as written in the admin.
- **SEO**: static pages, Open Graph tags, `Product`, `BreadcrumbList` and `Store` structured data,
  hreflang, `sitemap.xml`, `robots.txt`.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React 19, TypeScript |
| Styling | Tailwind CSS 4 with design tokens, light and dark |
| Icons | lucide-react |
| API types | generated from the backend's OpenAPI spec (`openapi-typescript`) |
| Rich text | `marked` + `sanitize-html`, on the server |

## Run it locally

1. Start the backend first (see its [README](https://github.com/mressid/accessories-store-system#getting-started)):
   PostgreSQL, MinIO and the API on `http://localhost:8080`.
2. Configure and start the storefront:

```bash
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3000, opens /fr or /en
```

`npm run build` reads the API (product and category pages are built ahead), so the backend must be
running for a build too. Production: `npm run build && npm start`.

### Settings (`.env.local`)

| Variable | Example | Meaning |
|---|---|---|
| `API_URL` | `http://localhost:8080` | The backend API |
| `MEDIA_URL` | `http://localhost:9010` | Where product photos are served (the MinIO bucket host) |
| `EXTRA_IMAGE_HOSTS` | `picsum.photos,fastly.picsum.photos` | Other photo hosts; the backend's demo data uses picsum. Empty in production |
| `SITE_URL` | `https://myshop.tn` | Public address, for canonical URLs, the sitemap and link previews |
| `REVALIDATE_SECRET` | 40 random characters | Shared with the backend so it can refresh pages |

### Connect the backend's page refresh

In the backend's `.env`, point it at this website with the same secret, then restart the API:

```bash
STOREFRONT_URL=http://localhost:3000
STOREFRONT_REVALIDATE_SECRET=<same value as REVALIDATE_SECRET>
```

After a change in the admin (or an order taking stock), the API calls `POST /api/revalidate` here within
3 seconds. The next visitor gets the cached page while it rebuilds, the one after gets the new page.
Without these two settings pages still refresh, but only on the hourly background cycle.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | development server |
| `npm run build` / `npm start` | production build and server |
| `npm run typecheck` | route types + TypeScript |
| `npm run lint` | ESLint |
| `npm run api:spec` | downloads the backend's OpenAPI spec to `docs/openapi.json` (`API_URL`) |
| `npm run api:types` | regenerates `src/lib/api/schema.d.ts` from it |

To check a build while a server is already running, build into another folder so the running server
keeps its files: `NEXT_DIST_DIR=.next-check npm run build`.

## Project layout

```
src/
  app/[lang]/        pages, one folder per route (fr and en)
  app/api/revalidate the endpoint the backend calls after changes
  components/        layout (header, footer), catalogue, product, cart and homepage sections
  lib/api/           API client, generated types, cached reads with their cache tags
  lib/               words (fr/en), formatting, cart store, server actions
  proxy.ts           sends paths without a language to /fr or /en
docs/                design system, rendering and SEO, API guide, roadmap
```

## Documentation

- [docs/DESIGN.md](docs/DESIGN.md): design system, tokens, icons and words
- [docs/RENDERING.md](docs/RENDERING.md): caching, page refresh, languages, SEO, performance budget
- [docs/API.md](docs/API.md): the backend endpoints the storefront uses
- [docs/ROADMAP.md](docs/ROADMAP.md): what is done and what comes next
- [docs/HANDOFF_PROMPT.md](docs/HANDOFF_PROMPT.md): prompts for continuing the work with an AI assistant
- [AGENTS.md](AGENTS.md): rules for anyone (or any assistant) changing the code
