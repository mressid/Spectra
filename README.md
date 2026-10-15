# Accessories storefront

Customer website of the accessories store: Next.js 16 (App Router, Cache Components), Tailwind 4.
Reads the public API of [`../accessories-store-system`](../accessories-store-system) (Spring Boot).

## Run

```bash
cp .env.example .env.local   # API_URL, MEDIA_URL, SITE_URL, REVALIDATE_SECRET
npm install
npm run dev                  # http://localhost:3000 (the API must run on API_URL)
```

Production check: `npm run build && npm start`.

| Script | Does |
|---|---|
| `npm run typecheck` | route types + TypeScript |
| `npm run lint` | ESLint |
| `npm run api:spec` | downloads the API's OpenAPI spec to `docs/openapi.json` |
| `npm run api:types` | regenerates `src/lib/api/schema.d.ts` from it |

## Docs

- [docs/ROADMAP.md](docs/ROADMAP.md): what is done and what comes next
- [docs/DESIGN.md](docs/DESIGN.md): design system and words
- [docs/RENDERING.md](docs/RENDERING.md): caching, revalidation, SEO, performance budget
- [docs/API.md](docs/API.md): the endpoints the storefront uses
- [docs/HANDOFF_PROMPT.md](docs/HANDOFF_PROMPT.md): prompts for continuing the work with an AI assistant
