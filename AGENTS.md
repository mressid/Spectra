<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Storefront rules

Customer website of a small Tunisian accessories shop. The API and admin live in
`../accessories-store-system` (Spring Boot + React-Admin); this project only reads its public API.

Read before working: `docs/ROADMAP.md` (what to do next), `docs/DESIGN.md` (look and words),
`docs/RENDERING.md` (caching and SEO), `docs/API.md` (endpoints).

- **Data**: only through `src/lib/api/catalog.ts` (cached, tagged) or `api()` for per-request calls. Never
  `fetch` the API from a component or from the browser. Types come from `src/lib/api/schema.d.ts`
  (`npm run api:types`), never hand-written.
- **Server components by default.** `"use client"` only for interaction (cart, option picker, gallery,
  carousel, forms), as small and low in the tree as possible.
- **Styling**: Tailwind with the tokens in `src/app/globals.css` (`text-muted`, `bg-ink`, `rounded-photo`…).
  No raw hex in components, no UI component library.
- **Images**: `next/image` with `alt` and `sizes`, never `<img>`.
- **Money and words**: `formatMoney()`, `formatLeadTime()`; French texts from docs/DESIGN.md section 7.
- **Before finishing**: `npm run typecheck && npm run lint && npm run build` must pass. Check a page at
  390 px and 1280 px width.
- **Commits**: conventional commits (`feat(product): option picker`), a body that says why. No AI or tool
  attribution lines (no `Co-Authored-By`, no "Generated with"). Do not push unless asked.
- Do not change the backend's behaviour for the admin when doing **API** tasks; follow that repo's AGENTS.md.
