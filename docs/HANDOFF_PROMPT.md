# Prompts for continuing with Sonnet

Open Claude Code in this folder (`accessories-storefront`), pick Sonnet (`/model sonnet`), and paste the
first prompt. For each next task, start a fresh session and paste the second one. One task per session
keeps the context small and the result focused.

## First session

```text
You are continuing the storefront of a general-purpose shop template for small shops, Tunisia first
(Next.js 16, Tailwind 4). Never assume one product type in code, words or examples.
The skeleton is done. Before writing code, read AGENTS.md, then docs/ROADMAP.md, docs/DESIGN.md,
docs/RENDERING.md and docs/API.md. Next.js 16 differs from what you know: read the guide in
node_modules/next/dist/docs/ for any Next API you use (caching, metadata, images, route handlers).

Then take the first unticked task in docs/ROADMAP.md. Tell me in 5 bullets what you will change and
which files, wait for my "go", then implement it. Tasks marked API are in ../accessories-store-system:
follow its AGENTS.md and run its tests.

When done: run npm run typecheck, npm run lint and npm run build (and ./gradlew test for API tasks),
tick the task in docs/ROADMAP.md with one line of notes for later tasks, and commit with a conventional
commit message, no AI attribution lines. Do not push.
```

## Every next session

```text
Continue the storefront: read AGENTS.md and docs/ROADMAP.md, take the next unticked task, follow the
same steps as before (5-bullet plan, wait for "go", implement, checks, tick, commit). Stay inside that
task; note anything else you notice in docs/ROADMAP.md instead of doing it.
```

## Useful follow-ups

- Visual check: "Run `npm run build && npm start`, open <page> at 390 px and 1280 px, and compare it with
  docs/DESIGN.md. List what differs, then fix it."
- Performance: "Run Lighthouse mobile on the production build for /, a category and a product page and fix
  anything that misses the budget in docs/RENDERING.md."
- Design feedback works best with design words: "too much space between the price and the button", "the
  main action is not obvious", "two buttons compete". A screenshot beats a description.

## When to come back to Opus

Use the stronger model for: the API-3 refresh listener if Sonnet struggles with the event wiring, a
caching bug you cannot explain (stale page that never updates), or the bilingual decision (product texts
in two languages touches the database, the admin and every page).
