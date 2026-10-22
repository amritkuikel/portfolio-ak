# CLAUDE.md

Entry point for working on this repository (people and AI sessions alike). Read this first, then the guide for the area you touch.

## What this is

A bilingual (English + Nepali) portfolio app with a public site and an admin area. Every page renders on the server, works in both locales, and passes strict CSP, accessibility and layout-shift checks. **Test CRUD** is the reference feature to copy.

- **Plan and status:** [docs/PLAN.md](docs/PLAN.md). Part 1 (sections 1–6), Part 2 (section 7, Tasks 17–24) and the editorial portfolio (section 8, `/portfolio`) are done. Part 3 (section 9, Tasks 25–33: template hardening) is done. Part 4 (section 10, Tasks 34–45: template v2, i.e. a fast foundation, the portfolio at `/` and the demo at `/dev`, the Graphite design system and admin kit, one CRUD standard, the database-driven portfolio and six showcase apps) is in progress: Tasks 34–37 are done. Each Part 4 task runs in its own session, following section 10.1 ("How to run a Part 4 task"); everything a task needs is written in section 10. Do only the task you're asked to do.
- **Why things are the way they are:** [docs/decisions.md](docs/decisions.md), numbered with an index. Add an entry for every non-obvious choice.
- **Where things are:** the portfolio is the site at `/`. The demo and the references live under `/dev` (`pnpm dev` only, 404 in production): the demo home, `/dev/stack`, the public Test CRUD pages and `/dev/examples`, one working page per module, each naming its source file and guide.

## Guides ([docs/guides/](docs/guides/))

| Guide | Covers |
| --- | --- |
| [architecture.md](docs/guides/architecture.md) | Layers, a request end to end, where to start for each task |
| [conventions.md](docs/guides/conventions.md) | File map, building blocks, list-page recipe, breadcrumbs, command palette, rules |
| [design-system.md](docs/guides/design-system.md) | Graphite tokens, accent/radius/density presets, contrast test, the shells, the component kit, theming a project |
| [routing-data.md](docs/guides/routing-data.md) | Routes, loaders (SSR, no refetch), streaming, server functions, errors, server-only code |
| [search-filters-masking.md](docs/guides/search-filters-masking.md) | URL search params, the list contract, filters, route masking, path params |
| [tables-filters.md](docs/guides/tables-filters.md) | DataTable, FilterBar and chips, Pagination, bulk and row actions |
| [forms.md](docs/guides/forms.md) | useAppForm, fields, composite fields (lists, blocks, slug, localized, relations), validation, server field errors, rich text |
| [state.md](docs/guides/state.md) | Query vs DB vs Store vs Form vs URL; optimistic updates |
| [rbac.md](docs/guides/rbac.md) | Roles, permissions, guarding functions/routes/UI, escalation rules |
| [attachments.md](docs/guides/attachments.md) | Cloudinary uploads (signed, direct, verified), showing images |
| [seo.md](docs/guides/seo.md) | seo()/listSeo() vs privateHead(), JSON-LD, sitemap, robots, manifest, icons |
| [i18n.md](docs/guides/i18n.md) | Messages, locale URLs, Intl formatting, fonts, adding a language |
| [testing.md](docs/guides/testing.md) | Vitest projects, PGlite, Storybook, guard tests, the e2e suite and browser review |
| [observability.md](docs/guides/observability.md) | Logs, Sentry, PostHog consent, feature flags |
| [security.md](docs/guides/security.md) | Headers, CSP, CSRF, authorization, sanitizing, secrets |
| [deployment.md](docs/guides/deployment.md) | Vercel + Neon, migrations, cron, running a production build |
| [recipes.md](docs/guides/recipes.md) | Optional features: background jobs, cursor pagination, caching, rate limits, contact form, avatars, CSV/undo/saved views, offline dev, previews, changelog, orgs and billing |
| [new-project.md](docs/guides/new-project.md) | Starting a project: `pnpm strip-demo` (layers), renaming, first admin, `pnpm new:feature` |
| [portfolio.md](docs/guides/portfolio.md) | The portfolio at `/`: content source, demo data, "Dhaka" design system, motion <!-- @portfolio --> |

## Stack

- **App:** TanStack Start 1.168 + Router 1.170 (file routes, server functions), Nitro 3 beta, deployed to Vercel; React 19.3, TypeScript 6 strict.
- **TanStack libraries:** Query 5, DB 0.5, Form 1.33, Store 0.11.
- **UI:** Tailwind 4.3 + shadcn/ui (Radix), lucide icons; TanStack Table 9, Recharts 3 (lazy), dnd-kit (`@dnd-kit/react`).
- **Validation, i18n, env:** Zod 4.6 (aliased, jitless), Paraglide 2.25, T3 Env.
- **Data and auth:** Better Auth 1.7, Drizzle 0.45 + Neon Postgres (PGlite in tests).
- **Services:** Cloudinary (REST, no SDK), React Email 6 + Resend, Sentry 11, PostHog.
- **Tooling:** Vitest 5 + Storybook 10.6, Biome 2.4, Knip 6, lefthook 2, pnpm 10, Node ≥ 22 (`.nvmrc`: 24), Vite 8. CI: GitHub Actions; updates: Dependabot.

## Commands

```bash
pnpm setup:local         # fresh clone -> runnable: .env, secret, messages, local database (0156)
pnpm diagnose            # checks Node, .env, database latency and migrations, ports; prints fixes
pnpm dev                 # http://localhost:3000, on DATABASE_URL from .env
pnpm dev:local           # same, on a local PGlite database in .data/pglite (fast; kept between runs, 0155)
pnpm dev:offline         # same, on in-memory PGlite with every outside service off (0149)
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
pnpm i18n:translate      # machine-translates Nepali for messages that have none (review the diff, 0157)
pnpm i18n:check          # missing or empty translations, variables, plural forms
node scripts/check-bundle.ts   # after a build: every page's JavaScript and preloaded fonts against the budget (0151)
```

A task is done when `typecheck`, `check`, `knip`, `test`, `test:storybook`, `test:e2e`, `build`, `build-storybook`, `i18n:check` and the bundle budget are all green (CI runs them on every PR) with no warnings. `test:e2e` is the browser review: every page on a production build, en/ne × light/dark × 390/768/1280 (axe, overflow, console, CSP, CLS ≤ 0.01), plus the flows.

## Where everything lives

```
src/routes/            file routes: _site (the portfolio at /), dev (demo and references, dev builds only), _public (health,
                       verify email, reset password), _auth (sign-in), _authed (account), _admin (admin area), server routes
src/features/<name>/   one feature, shared by client and server: schema.ts, queries.ts, collection.ts, labels, components/
src/functions/         server functions: middleware + validator + one call into src/server
src/server/            SERVER-ONLY: env, db (Drizzle schema, list SQL), auth, email, rbac, attachments, seo,
                       <feature>/repository.ts + service.ts, Nitro routes (cron, manifest)
src/middleware/        security headers + CSP, CSRF, logging, errors, auth/permissions, dev-only
src/components/        shared UI: admin-shell/, auth-shell/, app-header/, brand/, data-display/, charts/, page/, data-table/, filters/,
                       navigation/, dialogs/, forms/, layout/, errors/, ui/ (shadcn)
src/hooks/             React hooks: useListPage, useListQuery, useHotkeys, useDebouncedValue, useMediaQuery
src/lib/               isomorphic helpers by area: list/ (URL params, paging, serialization), env/, i18n/, http/,
                       observability/, start/ (Start runtime: routes and server only); query, seo, validation, errors, zod
messages/              en.json, ne.json        drizzle/   SQL migrations        public/   icons, og-default.png
tests/                 unit/, server/, components/, i18n/, email/, setup/ (env, dom, PGlite snapshot), utils/ (test-db, fake-cloudinary)
e2e/                   Playwright: review.spec.ts, flows/, harness/ (build + PGlite + fake Resend + server), support/
scripts/               setup-local, diagnose, dev-local, dev-offline, check-bundle, seeds, new-feature, strip-demo (TypeScript run by Node)
docs/                  PLAN.md, decisions.md, guides/, history/ (past reviews)
.github/               CI workflow, Dependabot        lefthook.yml   git hooks        knip.json   dead-code config
```

## Golden rules

1. **Server-render everything.** The loader awaits `ensureQuery(queryClient, opts)` (`src/lib/query.ts`; Query 5.104 deprecated `ensureQueryData`, 0111) and the component calls `useSuspenseQuery(opts)`. No first-paint fetching in effects. Loaders return only what `head`/`staticData` need.
2. **Reuse before writing.** Pages are built from `src/components/page`, `data-table`, `data-display`, `charts`, `filters`, `navigation`, `dialogs` and `forms` (the kit: design-system.md, "Components"). Feature code supplies columns, filters, fields and actions. A pattern used twice becomes shared.
3. **The URL is the state** for lists (`q`, filters, `sort`, `page`, `pageSize`). These come from the shared list contract: `src/lib/list/` (params, paging, URL serialization) on both sides, plus `src/server/db/list.ts` for SQL. Filters go in `<FilterBar>`, which works without JS. List pages call `tableListInput` + `loadList` in the loader and `useListPage` in the component, which also wires `<Pagination>` (0116).
4. **The server is the authority.** Every protected server function runs `requirePermission("<resource>:<action>")` (`tests/server/guarded-functions.test.ts` makes every file in `src/functions` declare its guards), validates input with the feature's Zod schema, and calls into `src/server/**`. Routes add `assertRoutePermission` in `beforeLoad`; the UI only hides (`useCan`, `<Can>`) what the server would refuse.
5. **Server-only code stays server-only:** `src/server/**` and `*.server.ts`, enforced by Start import protection and tests.
6. **i18n:** every user-visible string is a Paraglide message in `messages/en.json` and `messages/ne.json`. Call `m.key()` at render time, never in module-level constants. Delete keys whose UI is gone (a test checks).
7. **Import Zod as `"zod"`.** It resolves to `src/lib/zod.ts` (jitless). The CSP forbids eval (decision 0086). Biome refuses `zod/v4`.
8. **No `any`, no `@ts-ignore`,** and no lint suppression without a reason in the comment.
9. **Every page is indexable or private:** public content uses `seo()` (lists `listSeo()`) and goes in the sitemap; everything else is `noindex` via its layout or `privateHead()`. `tests/unit/route-seo.test.ts` checks every route (0100).
10. **Docs move with code:** update the guide for the area, `decisions.md` for non-obvious choices, and this file for new pitfalls, in the same commit.

## Adding a feature

Start with `pnpm new:feature <name>` (an admin section in this shape that passes every gate, 0141), then grow it. By hand, follow the Test CRUD pattern (README, "Test CRUD: the template for new features") and the list-page recipe in [conventions.md](docs/guides/conventions.md):
1. Table + migration.
2. Shared schema (input, search params, DTOs).
3. Repository + service over an injected `Db`, tested on PGlite. Updates check the version the edit started from (`updatedAt`, `sameVersion`, `staleError()`; 0122).
4. Permissions in the catalog; thin server functions with `requirePermission`, listed in the guarded-functions test.
5. Queries (and a collection for optimistic admin edits).
6. Routes with `staticData.breadcrumb`, `seo()`/`privateHead()`; columns for `DataTable`, filters for `FilterBar`, forms with `useAppForm`.
7. Messages in both languages; an `ADMIN_SECTIONS` entry (sidebar, palette) and, for actions, `features/<name>/commands.ts`.
8. Stories + tests (a new route goes in `e2e/support/pages.ts`, or `pnpm test` fails), then the gates.

## Pitfalls already solved (don't reintroduce)

### Always relevant

- **Windows:** keep the checkout path short, about 90 characters at most (0029). In Git Bash, avoid apostrophes inside heredocs and `node -e`, and backslashes inside `node -e` strings; write a script file instead. In edit scripts, pass replacements to `String.replace` as functions: `$`` in a replacement string is a special pattern.
- **Zod and the CSP:** Zod 4 probes eval when a `z.object` is created. Always import `"zod"` (aliased), never `zod/v4` in app code (0086).
- **Server functions run only inside the Start runtime.** Keep them as thin wrappers and test the plain functions in `src/server/**` they call.
- **Start-only helpers stay out of components:** modules using `createIsomorphicFn` or other `@tanstack/react-start` runtime APIs (e.g. `src/lib/start/http-status.ts`) may be imported by routes and server code only. Storybook has no Start plugin, so a component importing them breaks every story that renders it. Example: `assertRoutePermission` lives in `rbac/route-guard.ts`, not `rbac/can.tsx`.
- **Locale frozen at module scope:** JSX or strings built from `m.*` at module level render in the first request's language on the server.
- **Forms handled in JavaScript set `method="post"`** (the shared `Form` does): without it a submit before hydration puts the fields, passwords included, in the URL. A test checks every `<form>` (0104).
- **Server-function errors are HTTP 200:** Start sends them as a serialized payload (`x-tss-serialized`). When checking a refusal over HTTP, look for the code (`FORBIDDEN`) in the body.
- **Expected errors aren't logged:** `src/client.tsx`'s `onCaughtError` skips AppErrors below 500 (a 403 page is the intended result). Don't add `console.error` for them elsewhere.
- **Dev-only pages** live under `src/routes/dev/`: the layout 404s unless `DEV_ROUTES` (`src/lib/dev-routes.ts`: `vite dev`, or a build with `VITE_DEV_ROUTES=true`, which the e2e harness uses and production refuses; 0162). Their server functions use `devOnlyMiddleware`. Gate dev-only code on `DEV_ROUTES`, not `import.meta.env.DEV`, or the e2e build breaks it.
- **One header per section** (0161): the root renders none. Each layout renders its own frame (`AdminShell`, `AuthShell`, `AppHeader`, `SiteHeader` for `/dev`, or the portfolio's), so a new layout must too. Breadcrumbs belong to the frame: the admin topbar shows them, `PageHeader` doesn't (0164). A section that never reads the session sets `staticData: { session: "skip" }` (`src/lib/session-scope.ts`); root-mounted session readers pass `enabled: !useSessionSkipped()`.
- **Slow `pnpm dev`?** Run `pnpm diagnose`: a remote database costs a few hundred ms per query from far away; `pnpm dev:local` uses a local one (0155).
- **Browser scripts against dev:** a devtools SSE stream stays open (wait for `load`, not network idle), clicks must wait for hydration, and layout-shift numbers aren't meaningful (no font preloads in dev). Measure CLS on a production build.
- **Knip entries:** files reached only by a string path (Nitro routes and plugins in `vite.config.ts`, Vite-plugin modules, alias targets) must be listed in `knip.json`'s `entry`, or knip reports them unused. Don't delete them on knip's word alone.
- **Schema changes need a migration:** CI fails when `drizzle-kit generate` would produce one. There is no `db:push` (0118).
- **E2E against a stale build:** locally, `pnpm test:e2e` reuses a server already on port 3100 (`node e2e/harness/server.ts`). Restart it after changing app code, or the suite tests the old build. Auth endpoints are rate limited per IP: tests that sign in call `harness.resetRateLimits()` first.
- **Server logs go through `log()`** (`src/server/log.ts`), not `console.*`, so each line carries the request id; the id comes from AsyncLocalStorage set by `src/server.ts` (0123). Uptime monitors use `GET /api/health`, not the `/health` page (0124).
- **Shared lists carry `// @new-feature:<slot>` markers** (permissions, labels, audit actions, admin sections, schema index, guard test, e2e pages): keep them when editing those lists, or `pnpm new:feature` can't insert there. Code of a removable layer in shared files sits between `portfolio:start`/`portfolio:end` (or `apps:…`) comment lines or on a line ending in `// @portfolio` (`<!-- @portfolio -->` in Markdown), for `pnpm strip-demo` (0141, 0163); `tests/unit/strip-markers.test.ts` checks they balance.
- **Routes stay thin:** loader, search, head and a component that renders one from `src/features/<name>/components` (0143).
- **Every `<main>` is the skip link's target** (0137): use `Page`, or spread `MAIN_CONTENT` (`components/layout/skip-link.tsx`) on a hand-written `<main>`. The browser review fails a page without it.
- **The React Compiler memoizes client code** (0136): don't add `useMemo`/`useCallback` for speed. Keep `useMemo` where identity matters (creating a TanStack DB collection). It runs in Storybook too, not in SSR.
- **Route options are in every page's JavaScript** (0151): only `component`, `pendingComponent`, `errorComponent` and `notFoundComponent` are split out, and only when written inline in `createFileRoute("…")({ … })` (not spread or returned by a helper). Route files import a feature's `search.ts` (URL contract), never `schema.ts` (form schemas). `node scripts/check-bundle.ts` after a build shows the cost.
- **No static Sentry import in browser code** (0152): `start.ts`, function middleware and components run in the browser too, and one static `@sentry/tanstackstart-react` import puts the whole SDK in every page. Use `src/lib/observability/sentry-client.ts`, or import the SDK inside `.server()`.
- **Server-only imports in middleware go inside `.server()`** (`await import("@/server/…")`). A dynamic import in an exported helper is still in the client graph, and import protection warns in dev.
- **Heavy fields aren't on `useAppForm`** (0168): every page with a form loads the registered fields. The composite fields (sortable lists, blocks, slug, localized, relations, the image gallery) are imported where used and rendered inside `form.AppField`. Dialogs that open on click are `React.lazy`, or their forms load with the page.
- **Confirms are `await useConfirm()(…)`** (0168): the shells mount `ConfirmProvider` (`AdminShell`, the `/dev` layout). A new shell that asks for confirmation mounts one too; there is no `ConfirmDialog` any more.
- **Moving or renaming files:** `src/lib` is grouped by area and Biome enforces the boundaries (0158). Update `knip.json` entries and path mentions in docs with the move.

### Per area

Each guide ends with its own "Pitfalls already solved" list. Read it before you change that area:

- [routing-data.md](docs/guides/routing-data.md): The root `beforeLoad` and `matches`; Nitro routes.
- [attachments.md](docs/guides/attachments.md): Images are Cloudinary attachments.
- [forms.md](docs/guides/forms.md): Form arrays updated from async callbacks; A submit while an async validator runs did nothing; Edits without a version.
- [search-filters-masking.md](docs/guides/search-filters-masking.md): Masked routes need `unmaskOnReload: true`.
- [rbac.md](docs/guides/rbac.md): Admin guard; Better Auth's `/api/auth/admin/*` endpoints are disabled; Admin actions are audited in their transaction; Impersonated sessions.
- [seo.md](docs/guides/seo.md): Duplicate meta names.
- [testing.md](docs/guides/testing.md): Radix menus in tests.
- [deployment.md](docs/guides/deployment.md): Running production locally; Raw SQL inserts into Better Auth tables.
- [portfolio.md](docs/guides/portfolio.md): A layout's `notFoundComponent` replaces the layout; Custom `text-*` sizes and tailwind-merge; Variable fonts with a width axis need one fallback per width. <!-- @portfolio -->
- [i18n.md](docs/guides/i18n.md): Fonts are never inlined.
- [security.md](docs/guides/security.md): Expired sessions are handled once, globally; Session tokens never go to the browser; Auth hardening (0126–0130); CSP reports.
- [conventions.md](docs/guides/conventions.md): shadcn's `from "cn"` import; One header per section.
- [design-system.md](docs/guides/design-system.md): shadcn's sidebar cookie and `<main>`; No `isMobile` state after hydration; `CommandDialog`'s hidden title; English in shadcn primitives; `aria-label` hiding visible text; shadcn's chart `<style>` and `Progress` value; Recharts' pie tab stop; non-modal or named Radix overlays; platform text after hydration.
