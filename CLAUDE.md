# CLAUDE.md

Entry point for working on this repository (people and AI sessions alike). Read this first, then the guide for the area you touch.

## What this is

A bilingual (English + Nepali) portfolio app with a public site and an admin area. Every page renders on the server, works in both locales, and passes strict CSP, accessibility and layout-shift checks. **Test CRUD** is the reference feature to copy.

- **Plan and status:** [docs/PLAN.md](docs/PLAN.md). Part 1 (sections 1–6), Part 2 (section 7, Tasks 17–24) and the editorial portfolio (section 8, `/portfolio`) are done. Part 3 (section 9, Tasks 25–33: template hardening) is in progress: Tasks 25–28 are done. Do only the task you're asked to do.
- **Why things are the way they are:** [docs/decisions.md](docs/decisions.md), numbered with an index. Add an entry for every non-obvious choice.
- **Live examples:** `pnpm dev`, then `/dev/examples`: one working page per module, each naming its source file and guide (404 in production).

## Guides ([docs/guides/](docs/guides/))

| Guide | Covers |
| --- | --- |
| [architecture.md](docs/guides/architecture.md) | Layers, a request end to end, where to start for each task |
| [conventions.md](docs/guides/conventions.md) | File map, building blocks, list-page recipe, breadcrumbs, rules |
| [routing-data.md](docs/guides/routing-data.md) | Routes, loaders (SSR, no refetch), streaming, server functions, errors, server-only code |
| [search-filters-masking.md](docs/guides/search-filters-masking.md) | URL search params, the list contract, filters, route masking, path params |
| [tables-filters.md](docs/guides/tables-filters.md) | DataTable, FilterBar and chips, Pagination, bulk and row actions |
| [forms.md](docs/guides/forms.md) | useAppForm, fields, validation, server field errors, rich text |
| [state.md](docs/guides/state.md) | Query vs DB vs Store vs Form vs URL; optimistic updates |
| [rbac.md](docs/guides/rbac.md) | Roles, permissions, guarding functions/routes/UI, escalation rules |
| [attachments.md](docs/guides/attachments.md) | Cloudinary uploads (signed, direct, verified), showing images |
| [seo.md](docs/guides/seo.md) | seo()/listSeo() vs privateHead(), JSON-LD, sitemap, robots, manifest, icons |
| [i18n.md](docs/guides/i18n.md) | Messages, locale URLs, Intl formatting, fonts, adding a language |
| [testing.md](docs/guides/testing.md) | Vitest projects, PGlite, Storybook, guard tests, the e2e suite and browser review |
| [observability.md](docs/guides/observability.md) | Logs, Sentry, PostHog consent, feature flags |
| [security.md](docs/guides/security.md) | Headers, CSP, CSRF, authorization, sanitizing, secrets |
| [deployment.md](docs/guides/deployment.md) | Vercel + Neon, migrations, cron, running a production build |
| [audit.md](docs/guides/audit.md) | The Part 2 module review and what each task changed |
| [portfolio.md](docs/guides/portfolio.md) | The editorial `/portfolio` site: content source, demo data, "Dhaka" design system, motion |

## Stack

- **App:** TanStack Start 1.168 + Router 1.170 (file routes, server functions), Nitro 3 beta, deployed to Vercel; React 19.3, TypeScript 6 strict.
- **TanStack libraries:** Query 5, DB 0.5, Form 1.33, Store 0.11.
- **UI:** Tailwind 4.3 + shadcn/ui (Radix), lucide icons.
- **Validation, i18n, env:** Zod 4.6 (aliased, jitless), Paraglide 2.25, T3 Env.
- **Data and auth:** Better Auth 1.7, Drizzle 0.45 + Neon Postgres (PGlite in tests).
- **Services:** Cloudinary (REST, no SDK), React Email 6 + Resend, Sentry 11, PostHog.
- **Tooling:** Vitest 5 + Storybook 10.6, Biome 2.4, Knip 6, lefthook 2, pnpm 10, Node ≥ 22 (`.nvmrc`: 24), Vite 8. CI: GitHub Actions; updates: Dependabot.

## Commands

```bash
pnpm dev                 # http://localhost:3000
pnpm typecheck           # compiles messages, then tsc
pnpm check               # Biome lint + format check (warnings fail). pnpm check:fix to fix
pnpm knip                # unused files, exports, types and dependencies (knip.json)
pnpm test                # unit + server (PGlite) + jsdom component tests
pnpm test:storybook      # every story in real Chrome, twice: en/light and ne/dark (a11y violations fail)
pnpm test:e2e            # builds + starts a production server (PGlite, fake Resend), then flows + the browser review of every page
pnpm test:coverage       # v8 coverage + per-area table
pnpm build               # production build (.output/); pnpm start runs it
pnpm build-storybook
pnpm db:generate | db:migrate | db:check | db:seed-admin | db:seed-demo   # seed-demo: roles, users with them, 30 Test CRUD items (0117)
```

A task is done when `typecheck`, `check`, `knip`, `test`, `test:storybook`, `test:e2e`, `build` and `build-storybook` are all green (CI runs them on every PR) with no warnings. `test:e2e` is the browser review: every page on a production build, en/ne × light/dark × 390/768/1280 (axe, overflow, console, CSP, CLS ≤ 0.01), plus the flows.

## Where everything lives

```
src/routes/            file routes: _public (site, /dev examples), _auth (sign-in), _authed (account), _admin (admin area),
                       portfolio (editorial site, own chrome), server routes (sitemap, robots, /api/auth)
src/features/<name>/   one feature, shared by client and server: schema.ts, queries.ts, collection.ts, labels, components/
src/functions/         server functions: middleware + validator + one call into src/server
src/server/            SERVER-ONLY: env, db (Drizzle schema, list SQL), auth, email, rbac, attachments, seo,
                       <feature>/repository.ts + service.ts, Nitro routes (cron, manifest)
src/middleware/        security headers + CSP, CSRF, logging, errors, auth/permissions, dev-only
src/components/        shared UI: page/, data-table/, filters/, navigation/, dialogs/, forms/, layout/, errors/, ui/ (shadcn)
src/lib/               isomorphic helpers: list + search (URL contract), query (loadList), seo, structured-data,
                       breadcrumbs, intl, validation, errors, stores, analytics, csp, zod
messages/              en.json, ne.json        drizzle/   SQL migrations        public/   icons, og-default.png
tests/                 unit/, server/, components/, i18n/, email/, utils/ (test-db, fake-cloudinary)
e2e/                   Playwright: review.spec.ts, flows/, harness/ (build + PGlite + fake Resend + server), support/
docs/                  PLAN.md, decisions.md, guides/
.github/               CI workflow, Dependabot        lefthook.yml   git hooks        knip.json   dead-code config
```

## Golden rules

1. **Server-render everything.** The loader awaits `ensureQuery(queryClient, opts)` (`src/lib/query.ts`; Query 5.104 deprecated `ensureQueryData`, 0111) and the component calls `useSuspenseQuery(opts)`. No first-paint fetching in effects. Loaders return only what `head`/`staticData` need.
2. **Reuse before writing.** Pages are built from `src/components/page`, `data-table`, `filters`, `navigation`, `dialogs` and `forms`. Feature code supplies columns, filters, fields and actions. A pattern used twice becomes shared.
3. **The URL is the state** for lists (`q`, filters, `sort`, `page`, `pageSize`). These come from the shared list contract: `src/lib/list.ts` + `src/lib/search.ts` on both sides, plus `src/server/db/list.ts` for SQL. Filters go in `<FilterBar>`, which works without JS. List pages call `tableListInput` + `loadList` in the loader and `useListPage` in the component, which also wires `<Pagination>` (0116).
4. **The server is the authority.** Every protected server function runs `requirePermission("<resource>:<action>")` (`tests/server/guarded-functions.test.ts` makes every file in `src/functions` declare its guards), validates input with the feature's Zod schema, and calls into `src/server/**`. Routes add `assertRoutePermission` in `beforeLoad`; the UI only hides (`useCan`, `<Can>`) what the server would refuse.
5. **Server-only code stays server-only:** `src/server/**` and `*.server.ts`, enforced by Start import protection and tests.
6. **i18n:** every user-visible string is a Paraglide message in `messages/en.json` and `messages/ne.json`. Call `m.key()` at render time, never in module-level constants. Delete keys whose UI is gone (a test checks).
7. **Import Zod as `"zod"`.** It resolves to `src/lib/zod.ts` (jitless). The CSP forbids eval (decision 0086).
8. **No `any`, no `@ts-ignore`,** and no lint suppression without a reason in the comment.
9. **Every page is indexable or private:** public content uses `seo()` (lists `listSeo()`) and goes in the sitemap; everything else is `noindex` via its layout or `privateHead()`. `tests/unit/route-seo.test.ts` checks every route (0100).
10. **Docs move with code:** update the guide for the area, `decisions.md` for non-obvious choices, and this file for new pitfalls, in the same commit.

## Adding a feature

Follow the Test CRUD pattern (README, "Test CRUD: the template for new features") and the list-page recipe in [conventions.md](docs/guides/conventions.md):
1. Table + migration.
2. Shared schema (input, search params, DTOs).
3. Repository + service over an injected `Db`, tested on PGlite. Updates check the version the edit started from (`updatedAt`, `sameVersion`, `staleError()`; 0122).
4. Permissions in the catalog; thin server functions with `requirePermission`, listed in the guarded-functions test.
5. Queries (and a collection for optimistic admin edits).
6. Routes with `staticData.breadcrumb`, `seo()`/`privateHead()`; columns for `DataTable`, filters for `FilterBar`, forms with `useAppForm`.
7. Messages in both languages; a sidebar link and dashboard card for admin sections.
8. Stories + tests (a new route goes in `e2e/support/pages.ts`, or `pnpm test` fails), then the gates.

## Pitfalls already solved (don't reintroduce)

- **Windows:** keep the checkout path short, about 90 characters at most (0029). In Git Bash, avoid apostrophes inside heredocs and `node -e`, and backslashes inside `node -e` strings; write a script file instead. In edit scripts, pass replacements to `String.replace` as functions: `$`` in a replacement string is a special pattern.
- **Zod and the CSP:** Zod 4 probes eval when a `z.object` is created. Always import `"zod"` (aliased), never `zod/v4` in app code (0086).
- **Server functions run only inside the Start runtime.** Keep them as thin wrappers and test the plain functions in `src/server/**` they call.
- **Start-only helpers stay out of components:** modules using `createIsomorphicFn` or other `@tanstack/react-start` runtime APIs (e.g. `src/lib/http-status.ts`) may be imported by routes and server code only. Storybook has no Start plugin, so a component importing them breaks every story that renders it. Example: `assertRoutePermission` lives in `rbac/route-guard.ts`, not `rbac/can.tsx`.
- **Nitro routes** (`vite.config.ts` → `nitro.routes`) are for endpoints outside Start, e.g. the cron job and the web manifest. Nitro's dev server hands requests whose `Sec-Fetch-Dest` isn't a document (`image`, `manifest`…) to Vite unless a Nitro route matches, so a Start server route fetched that way is a 404 in dev only (0067, 0103).
- **Locale frozen at module scope:** JSX or strings built from `m.*` at module level render in the first request's language on the server.
- **Images are Cloudinary attachments** (0098): upload straight from the browser with a server signature, verify on the server, link in the item's save. Render with `CloudImage` (server-built URLs). Never stream files through a server function.
- **Form arrays updated from async callbacks:** use the field's atomic helpers (`field.pushValue`), not a value read earlier; concurrent uploads lost images that way (0099).
- **Forms handled in JavaScript set `method="post"`** (the shared `Form` does): without it a submit before hydration puts the fields, passwords included, in the URL. A test checks every `<form>` (0104).
- **Masked routes need `unmaskOnReload: true`.** Without it a reload keeps the mask from history state, so the client renders something the server didn't (a hydration error).
- **Admin guard:** `_admin` checks the server on entering the area and on SSR (any permission opens it); inner navigations reuse the session (0090). Never rely on it for data safety: every server function has its own `requirePermission`.
- **Server-function errors are HTTP 200:** Start sends them as a serialized payload (`x-tss-serialized`). When checking a refusal over HTTP, look for the code (`FORBIDDEN`) in the body.
- **Expected errors aren't logged:** `src/client.tsx`'s `onCaughtError` skips AppErrors below 500 (a 403 page is the intended result). Don't add `console.error` for them elsewhere.
- **Duplicate meta names:** `head()` keeps one `<meta>` per `name`/`property` (the deepest route's). Tags that need several of the same name (`theme-color` per colour scheme) are rendered in `__root.tsx`'s `<head>`.
- **Dev-only pages** live under `src/routes/_public/dev/` (the layout 404s in builds); their server functions use `devOnlyMiddleware`.
- **Browser scripts against dev:** a devtools SSE stream stays open (wait for `load`, not network idle), clicks must wait for hydration, and layout-shift numbers aren't meaningful (no font preloads in dev). Measure CLS on a production build.
- **Radix menus in tests:** they open on pointer events. Use real clicks (Testing Library `userEvent`, puppeteer `page.click`), not `element.click()`.
- **Running production locally** needs `EMAIL_PROVIDER=resend` and a `RESEND_API_KEY` (any `re_…` placeholder works when emails aren't sent). Production refuses the console email provider.
- **A layout's `notFoundComponent` replaces the layout:** a `notFound()` thrown below `/portfolio` renders without the layout's wrapper, so it must render the shell itself (`PortfolioShell` in `routes/portfolio/route.tsx`).
- **Fonts are never inlined:** a font file under Vite's 4 kB limit would become a `data:` URL, which the CSP's `font-src 'self'` blocks. `vite.config.ts` turns inlining off for `.woff`/`.woff2` (0108).
- **Custom `text-*` sizes and tailwind-merge:** `cn("text-pf-h2", "text-pf-accent")` drops the size with the app's `cn` (both look like colours). Portfolio components import `cn` from `features/portfolio/lib/cn.ts`, which registers the scale.
- **Variable fonts with a width axis need one fallback per width:** Anek's `wdth` changes its advance widths and Arial has no such axis, so the portfolio has a fallback face per width it uses (100% body, 75% bold display). A new width or weight for large type needs its own measured `size-adjust` (0110).
- **Expired sessions are handled once, globally:** `src/middleware/session-expiry.ts` sends any UNAUTHORIZED server-function answer in the browser to `/login?redirect=…` (0113). Don't add per-call login redirects; FORBIDDEN stays the caller's to show (toast, or the forbidden page via `assertRoutePermission`).
- **Better Auth's `/api/auth/admin/*` endpoints are disabled** (0112). Manage users, roles and bans through `src/functions/rbac.ts`, never `authClient.admin.*`; a Better Auth upgrade that adds an admin endpoint fails `auth-disabled-paths.test.ts` until it's listed.
- **Session tokens never go to the browser** (0114): revoke another device with `revokeMySession({ id })`.
- **Raw SQL inserts into Better Auth tables** (seeds, scripts) must set `updated_at` on `account` and `session`: those columns have no database default.
- **shadcn's `from "cn"` import:** the CLI writes it; fix it to `@/lib/utils`. Never install the `cn` package (an unrelated library) to silence typecheck (0118).
- **Knip entries:** files reached only by a string path (Nitro routes and plugins in `vite.config.ts`, Vite-plugin modules, alias targets) must be listed in `knip.json`'s `entry`, or knip reports them unused. Don't delete them on knip's word alone.
- **Schema changes need a migration:** CI fails when `drizzle-kit generate` would produce one. There is no `db:push` (0118).
- **E2E against a stale build:** locally, `pnpm test:e2e` reuses a server already on port 3100 (`node e2e/harness/server.ts`). Restart it after changing app code, or the suite tests the old build. Auth endpoints are rate limited per IP: tests that sign in call `harness.resetRateLimits()` first.
- **Edits without a version:** an update schema without `updatedAt: versionSchema()` lets the second of two editors overwrite the first. Forms catch the stale `CONFLICT` with `handleSaveError(form, error, onStale)` and show `StaleVersionAlert` (0122).
- **Server logs go through `log()`** (`src/server/log.ts`), not `console.*`, so each line carries the request id; the id comes from AsyncLocalStorage set by `src/server.ts` (0123). Uptime monitors use `GET /api/health`, not the `/health` page (0124).
- **The app header is opt-out per section:** `staticData: { chrome: "bare" }` on a layout hides `SiteHeader` for its subtree (0105). Don't hide it with CSS or path checks.
