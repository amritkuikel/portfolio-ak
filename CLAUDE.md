# CLAUDE.md

Entry point for working on this repository (people and AI sessions alike). Read this first, then the guide for the area you touch. This first version comes from Part 2, Task 18; it's completed in Task 24.

## What this is

A bilingual (English + Nepali) portfolio app with a public site and an admin area. Every page renders on the server, works in both locales, and passes strict CSP, accessibility and layout-shift checks.

- **Plan and status:** [docs/PLAN.md](docs/PLAN.md). Section 7 is Part 2 (Tasks 17–24). Do only the task you're asked to do.
- **Why things are the way they are:** [docs/decisions.md](docs/decisions.md), numbered with an index. Add an entry for every non-obvious choice.
- **Guides:** [docs/guides/](docs/guides/):
  - [conventions.md](docs/guides/conventions.md): file map, building blocks, rules.
  - [search-filters-masking.md](docs/guides/search-filters-masking.md): URL params, filters, list loading, dialogs via route masking, path params.
  - [rbac.md](docs/guides/rbac.md): roles, permissions, guarding functions, routes and UI, the escalation rules.
  - [attachments.md](docs/guides/attachments.md): Cloudinary uploads (signed, direct, verified), showing images, adding images to a feature.
  - [seo.md](docs/guides/seo.md): `seo()`/`listSeo()` vs `privateHead()`, JSON-LD, sitemap, robots, manifest, icons.
  - [audit.md](docs/guides/audit.md): module review and what's scheduled.

**Stack:**
- TanStack Start + Router, Query, DB, Form and Store
- React 19, TypeScript strict
- Tailwind v4 + shadcn/ui (Radix)
- Zod 4, Paraglide 2 (i18n), T3 Env
- Better Auth, Drizzle + Neon Postgres
- React Email + Resend
- Sentry, PostHog (consent-gated)
- Vitest + Storybook 10, Biome, pnpm
- Nitro, deployed to Vercel

## Commands

```bash
pnpm dev                 # http://localhost:3000
pnpm typecheck           # compiles messages, then tsc
pnpm check               # Biome lint + format check (warnings fail). pnpm check:fix to fix
pnpm test                # unit + server (PGlite) + jsdom component tests
pnpm test:storybook      # every story in real Chrome, twice: en/light and ne/dark (a11y violations fail)
pnpm test:coverage       # v8 coverage + per-area table
pnpm build               # production build (.output/)
pnpm build-storybook
pnpm db:generate | db:migrate | db:seed-admin
```

A task is done when `typecheck`, `check`, `test`, `test:storybook`, `build` and `build-storybook` are all green with no warnings, and the touched pages pass a browser review (en/ne × light/dark × 390/768/1280: axe, overflow, console, CSP, CLS ≤ 0.01).

## Golden rules

1. **Server-render everything.** The loader awaits `queryClient.ensureQueryData(opts)` and the component calls `useSuspenseQuery(opts)`. No first-paint fetching in effects. Loaders return only what `head`/`staticData` need.
2. **Reuse before writing.** Pages are built from `src/components/page`, `data-table`, `navigation`, `dialogs` and `forms`. Feature code supplies columns, filters, fields and actions. A pattern used twice becomes shared.
3. **The URL is the state** for lists (`q`, filters, `sort`, `page`, `pageSize`). These come from the shared list contract: `src/lib/list.ts` + `src/lib/search.ts` on both sides, plus `src/server/db/list.ts` for SQL. Filters go in `<FilterBar>`, which works without JS. List loaders use `loadList`/`useListQuery`.
4. **The server is the authority.** Every protected server function runs `requirePermission("<resource>:<action>")` (a test checks each function's permission), validates input with the feature's Zod schema, and calls into `src/server/**`. Routes add `assertRoutePermission` in `beforeLoad`; the UI only hides (`useCan`, `<Can>`) what the server would refuse.
5. **Server-only code stays server-only:** `src/server/**` and `*.server.ts`, enforced by Start import protection and tests.
6. **i18n:** every user-visible string is a Paraglide message in `messages/en.json` and `messages/ne.json`. Call `m.key()` at render time, never in module-level constants. Delete keys whose UI is gone (a test checks).
7. **Import Zod as `"zod"`.** It resolves to `src/lib/zod.ts` (jitless). The CSP forbids eval (decision 0086).
8. **No `any`, no `@ts-ignore`,** and no lint suppression without a reason in the comment.
9. **Every page is indexable or private:** public content uses `seo()` (lists `listSeo()`) and goes in the sitemap; everything else is `noindex` via its layout or `privateHead()`. `tests/unit/route-seo.test.ts` checks every route (0100).

## Adding a feature

Follow the Test CRUD pattern (README, "Test CRUD: the template for new features") and the list-page recipe in [conventions.md](docs/guides/conventions.md):
- schema
- repository + service
- thin server functions
- queries / collection
- routes with `staticData.breadcrumb`
- columns for `DataTable`
- messages
- stories + tests

## Pitfalls already solved (don't reintroduce)

- **Zod and the CSP:** Zod 4 probes eval when a `z.object` is created. Always import `"zod"` (aliased), never `zod/v4` in app code (0086).
- **Locale frozen at module scope:** JSX or strings built from `m.*` at module level render in the first request's language on the server.
- **Images are Cloudinary attachments** (0098): upload straight from the browser with a server signature, verify on the server, link in the item's save. Render with `CloudImage` (server-built URLs). Never stream files through a server function.
- **Form arrays updated from async callbacks:** use the field's atomic helpers (`field.pushValue`), not a value read earlier; concurrent uploads lost images that way (0099).
- **Nitro routes** (`vite.config.ts` → `nitro.routes`) are for endpoints outside Start, e.g. the cron job; Nitro dev routes `Sec-Fetch-Dest: image` requests to Vite unless a Nitro route matches (0067).
- **Windows:** keep the checkout path short (0029). In Git Bash, avoid apostrophes inside heredocs and `node -e`; write a script file instead. In edit scripts, pass replacements to `String.replace` as functions: `$`` in a replacement string is a special pattern.
- **Masked routes need `unmaskOnReload: true`.** Without it a reload keeps the mask from history state, so the client renders something the server didn't (a hydration error).
- **Admin guard:** `_admin` checks the server on entering the area and on SSR (any permission opens it); inner navigations reuse the session (0090). Never rely on it for data safety: every server function has its own `requirePermission`.
- **Server-function errors are HTTP 200:** Start sends them as a serialized payload (`x-tss-serialized`). When checking a refusal over HTTP, look for the code (`FORBIDDEN`) in the body.
- **Expected errors aren't logged:** `src/client.tsx`'s `onCaughtError` skips AppErrors below 500 (a 403 page is the intended result). Don't add `console.error` for them elsewhere.
- **Start-only helpers stay out of components:** modules using `createIsomorphicFn` or other `@tanstack/react-start` runtime APIs (e.g. `src/lib/http-status.ts`) may be imported by routes and server code only. Storybook has no Start plugin, so a component importing them breaks every story that renders it. Example: `assertRoutePermission` lives in `rbac/route-guard.ts`, not `rbac/can.tsx`.
- **Radix menus in tests:** they open on pointer events. Use real clicks (Testing Library `userEvent`, puppeteer `page.click`), not `element.click()`.
- **Duplicate meta names:** `head()` keeps one `<meta>` per `name`/`property` (the deepest route's). Tags that need several of the same name (`theme-color` per colour scheme) are rendered in `__root.tsx`'s `<head>`.
- **Running production locally** needs `EMAIL_PROVIDER=resend` and a `RESEND_API_KEY` (any `re_…` placeholder works when emails aren't sent). Production refuses the console email provider.
