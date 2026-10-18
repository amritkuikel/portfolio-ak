# Portfolio

A bilingual (English + Nepali), server-rendered portfolio app built on TanStack Start.

Public pages render fully on the server (and without JavaScript), every string, email, validation message, meta tag and formatted value exists in both languages, and an admin area manages content. **Test CRUD** is the reference feature to copy for new ones.

The plan, phases and Definition of Done are in [docs/PLAN.md](docs/PLAN.md). Every non-obvious choice is recorded in [docs/decisions.md](docs/decisions.md). Start with [CLAUDE.md](CLAUDE.md) (stack, commands, golden rules, solved pitfalls), then the [guides](#guides). With `pnpm dev`, `/dev/examples` has one working page per module.

## Requirements

- Node.js 22 or newer
- pnpm 10 (`corepack enable` picks up the version pinned in `package.json`)
- On Windows, clone to a short path of about 90 characters or fewer, such as `C:\dev\portfolio`. pnpm's nested `node_modules/.pnpm` paths add about 170 characters. Past about 260 in total, Node misreads ES modules, and tests and builds fail with `ERR_REQUIRE_CYCLE_MODULE`.

## Getting started

```bash
pnpm install
cp .env.example .env    # then fill in real values (see "Environment variables")
pnpm db:migrate         # create the tables in your Neon database
pnpm db:seed-admin --email you@example.com --password "at-least-12-chars" --name "You"
pnpm db:seed-demo --password "at-least-12-chars"   # optional: demo roles, users and items
pnpm dev                # http://localhost:3000
```

Sign in at `/login` with the admin account, then open `/admin/test-crud`.

`pnpm dev` and `pnpm start` validate the whole environment before serving. `pnpm build` validates only the public `VITE_` variables, because those are baked into the bundle. Each command stops with a message naming every missing or invalid variable. See [.env.example](.env.example) for the full list. Set `VITE_SITE_URL` to the public origin (for example `https://example.com`) in every deployed environment: canonical, hreflang and Open Graph URLs are built from it. Visit `/health` to confirm the database connection.

## Environment variables

Everything is validated at startup with T3 Env (`src/server/env.ts` and `src/lib/client-env.schema.ts`). Only `VITE_` variables reach the browser.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_APP_TITLE` | yes | Site name in the header and `<title>`. |
| `VITE_SITE_URL` | yes | Public origin, e.g. `https://example.com`, used for canonical, hreflang and Open Graph URLs. |
| `DATABASE_URL` | yes | Neon **pooled** connection string. |
| `DATABASE_URL_UNPOOLED` | no | Neon direct connection, used for migrations. Falls back to `DATABASE_URL`. |
| `BETTER_AUTH_SECRET` | yes | 32+ random characters (`openssl rand -base64 32`). Signs sessions. |
| `BETTER_AUTH_URL` | yes | The app's public URL, used for auth callbacks and links in emails. |
| `EMAIL_FROM` | yes | Sender, e.g. `Portfolio <hello@example.com>`. |
| `EMAIL_PROVIDER` | prod | `console` (dev) or `resend`. Production refuses to start with `console`. |
| `RESEND_API_KEY` | with Resend | Resend API key (`re_…`). |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | no | Enable "Continue with Google" (both or neither). |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | no | Defaults for `pnpm db:seed-admin`. |
| `DEMO_PASSWORD` | no | Default password for `pnpm db:seed-demo`'s users. |
| `VITE_SENTRY_DSN` | no | Turns Sentry on (browser + server). |
| `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | no | Turn PostHog on (opt-in, behind the consent banner). |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | no | Upload source maps to Sentry during `pnpm build` (all three or none). |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | no | Image uploads (all three or none; server-only). Without them items have no images. See [docs/guides/attachments.md](docs/guides/attachments.md). |
| `CLOUDINARY_FOLDER` | no | public_id prefix for uploads (default `portfolio`). |
| `CRON_SECRET` | no | Bearer token for `/api/cron/*` (Vercel Cron, `vercel.json`); unset, the routes answer 404. |

## Architecture

```
src/
  routes/        file routes: _public (site + /dev examples), _auth (sign-in pages), _authed (account), _admin (admin area)
  features/      feature code shared by client and server: schemas, queries, collections, components
  functions/     server functions: permission middleware + Zod validator + one call into src/server
  server/        SERVER-ONLY: env, db (Drizzle), auth, email, rbac, attachments, seo, repositories/services, Nitro routes
  middleware/    security headers + CSP nonce, CSRF, logging, error normalisation, auth/permissions, dev-only
  components/    shared UI: page, data-table, filters, navigation, dialogs, forms, layout, errors, ui (shadcn)
  lib/           isomorphic helpers: list contract, search params, seo, breadcrumbs, intl, validation, errors, stores
```

A request goes through the server entry (Sentry, locale), request middleware (headers, CSP nonce, CSRF), route guards, a loader that calls a server function (permission, validation, then a repository over Drizzle), and streams back as HTML that hydrates without refetching. The full walk-through is in [docs/guides/architecture.md](docs/guides/architecture.md).

## Guides

| Guide | Covers |
| --- | --- |
| [Architecture](docs/guides/architecture.md) | Layers and a request end to end |
| [Conventions](docs/guides/conventions.md) | File map, building blocks, list-page recipe, live examples |
| [Routing, data, server functions](docs/guides/routing-data.md) | Loaders, SSR without refetching, streaming, server functions, errors |
| [Search params, filters, masking](docs/guides/search-filters-masking.md) | The URL list contract, filters, route masking, path params |
| [Tables and filters](docs/guides/tables-filters.md) | DataTable, FilterBar, chips, Pagination, bulk actions |
| [Forms](docs/guides/forms.md) | useAppForm, fields, validation, server field errors, rich text |
| [State](docs/guides/state.md) | Query, DB (optimistic updates), Store (preferences), URL |
| [RBAC](docs/guides/rbac.md) | Roles, permissions, guards, the permission matrix |
| [Attachments](docs/guides/attachments.md) | Cloudinary uploads and images |
| [SEO](docs/guides/seo.md) | Head tags, JSON-LD, sitemap, robots, manifest, icons |
| [i18n](docs/guides/i18n.md) | Messages, locale URLs, formatting |
| [Testing](docs/guides/testing.md) | Vitest, PGlite, Storybook, browser review |
| [Observability](docs/guides/observability.md) | Logs, Sentry, PostHog, feature flags |
| [Security](docs/guides/security.md) | Headers, CSP, CSRF, authorization, sanitizing |
| [Deployment](docs/guides/deployment.md) | Vercel + Neon, migrations, cron |

## Security

Security headers on every response, a nonce-based CSP on pages, CSRF checks on server functions, permission checks and input validation in every server function, server-side sanitizing of rich text, and verified image uploads. See [docs/guides/security.md](docs/guides/security.md).

## Deployment (Vercel)

Create a Neon database, set the variables above in Vercel (including `VITE_SITE_URL`, `EMAIL_PROVIDER=resend` and `RESEND_API_KEY`), run `pnpm db:migrate` and `pnpm db:seed-admin` against it, and deploy. Steps, cron and release checks: [docs/guides/deployment.md](docs/guides/deployment.md).

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the Vite dev server with SSR. |
| `pnpm build` | Production build (client, SSR and Nitro server output in `.output/`). |
| `pnpm start` | Run the production build with Node, loading `.env` if present. |
| `pnpm typecheck` | TypeScript in strict mode, no emit. |
| `pnpm check` | Biome lint + format check. Warnings fail the run. |
| `pnpm check:fix` | Apply Biome fixes and formatting. |
| `pnpm test` | Run the unit, component and server tests once (Vitest project `unit`). |
| `pnpm test:watch` | Run the unit project in watch mode. |
| `pnpm test:coverage` | Unit run with v8 coverage (`coverage/`, HTML included), then a per-area table. |
| `pnpm test:storybook` | Render every story in headless Chrome, twice (English/light, then Nepali/dark), run play functions and fail on any a11y violation. Uses the installed Chrome. |
| `pnpm db:generate` | Generate a SQL migration in `drizzle/` from schema changes. |
| `pnpm db:migrate` | Apply pending migrations (uses `DATABASE_URL_UNPOOLED` if set). |
| `pnpm db:push` | Push the schema straight to the database, for prototyping only. |
| `pnpm db:studio` | Open Drizzle Studio. |
| `pnpm db:seed-admin` | Create the first admin user (flags or `ADMIN_*` env vars). |
| `pnpm db:seed-demo` | Development data: editor and viewer roles, three users holding them (one with no role), 30 Test CRUD items. Safe to rerun. |
| `pnpm attachments:import-legacy` | Move Part 1 images from Postgres to Cloudinary (`--dry-run` to preview). |
| `pnpm storybook` | Storybook dev server on http://localhost:6006. |
| `pnpm build-storybook` | Static Storybook in `storybook-static/`. |

## Testing

`pnpm test` runs unit, server (real SQL on PGlite) and jsdom component tests; `pnpm test:storybook` renders every story in Chrome twice (en/light, ne/dark) and fails on any accessibility violation; `pnpm test:coverage` prints coverage by area. What lives where and the patterns to copy: [docs/guides/testing.md](docs/guides/testing.md).

## Storybook

Stories sit next to their components (`*.stories.tsx`) and run in the app's providers with mocked server functions (`.storybook/`). The toolbar switches language and theme. `pnpm storybook` opens it; see [docs/guides/testing.md](docs/guides/testing.md#storybook).

## Internationalisation (English + Nepali)

English lives at `/`, Nepali under `/ne/`; every string is a message in `messages/en.json` and `messages/ne.json` (tests check parity and unused keys), and values are formatted with `src/lib/intl.ts`. See [docs/guides/i18n.md](docs/guides/i18n.md).

## Routing, data and server functions

Loaders call `ensureQuery(queryClient, …)` and components read with `useSuspenseQuery`, so pages render on the server and hydrate without refetching. Server functions are `createServerFn().middleware([requirePermission("…")]).validator(zodInput(schema)).handler(…)`. See [docs/guides/routing-data.md](docs/guides/routing-data.md).

## Forms

Build forms with `useAppForm` and the field library (`src/components/forms`), validated by one Zod schema from `src/lib/validation.ts` on both sides. Try every field at `/dev/forms` (`pnpm dev`). See [docs/guides/forms.md](docs/guides/forms.md).

## State: Query, DB and Store

Query for server data you read, a TanStack DB collection for server data you edit with instant feedback and rollback, the Store (cookies) for UI preferences, the URL for view state. See [docs/guides/state.md](docs/guides/state.md).

## Test CRUD: the template for new features

`/admin/test-crud` (admin) and `/test-crud` (public) make up the reference feature. To add a feature, say "projects":

1. **Table:** add `src/server/db/schema/projects.ts`, export it from `schema/index.ts`, then run `pnpm db:generate` and `pnpm db:migrate`.
2. **Shared schema:** `src/features/projects/schema.ts`, with one Zod input schema built from the helpers in `src/lib/validation.ts` (localized messages), the list search params built from `src/lib/list.ts` (`searchParam`, `enumParam`, `pageParam`, `pageSizeParam`), and the DTO types (`Paged<T>` for lists).
3. **Data access:** `src/server/projects/repository.ts` (Drizzle queries over an injected `Db` from `src/server/db/types.ts`; lists use `allOf`, `textSearch`, `orderBySort` and `paginate` from `src/server/db/list.ts`) and `service.ts` (the server functions' logic). Test both with `createTestDb()` (PGlite).
4. **Permissions and server functions:** add the resource to the permission catalog (`src/features/rbac/permissions.ts`, labels in `labels.ts`). Then `src/functions/projects.ts`, with `.middleware([requirePermission("projects:<action>")])` on every function, `.validator(zodInput(schema))`, and a one-line handler that calls the service. Add each function and its permission to `GUARDED_FUNCTIONS` in `tests/server/guarded-functions.test.ts` (see [docs/guides/rbac.md](docs/guides/rbac.md)).
5. **Queries and collection:** `queries.ts` (query keys and `queryOptions`) and, for admin lists, `collection.ts` (TanStack DB optimistic updates).
6. **Routes and UI:** admin routes under `src/routes/_admin/admin/projects/`, public ones under `src/routes/_public/projects/` (use `seo()` in `head`). Add a `route.tsx` per section with `staticData: { breadcrumb: staticCrumb(m.…) }`; detail routes use `loaderTitleCrumb`. Pages use `Page` + `PageHeader`; lists use `tableListInput` + `loadList` in the loader and `useListPage` in the component, `DataTable` with column definitions in `features/projects/components/admin-columns.tsx`, plus `<Pagination {...pagination} />`, `EmptyState` (with `ClearFiltersButton`) and `ConfirmDialog` (see [conventions](docs/guides/conventions.md)). Forms use only `useAppForm` and the field library. Add a link to `admin-sidebar.tsx` and a card on the admin dashboard.
7. **Text:** every string goes in `messages/en.json` and `messages/ne.json`; the parity test fails if a key is missing.
8. **Stories and tests:** add `*.stories.tsx` with play functions, then run `pnpm test` and `pnpm test:storybook`.

The Test CRUD files for each layer:

| Layer | File | What it shows |
| --- | --- | --- |
| Table | `src/server/db/schema/test-crud.ts` | Drizzle table. Then run `pnpm db:generate` and `pnpm db:migrate`. |
| Shared schema | `src/features/test-crud/schema.ts` | One Zod schema for the form and the server, plus list search params and DTOs |
| Data access | `src/server/test-crud/repository.ts` | Plain functions over an injected `db`, tested on PGlite (`tests/server/test-crud-repository.test.ts`) |
| Server functions | `src/functions/test-crud.ts` | `requirePermission("test-crud:<action>")` on every function, `.validator(zodInput(schema))` input, and images as attachment ids (JSON) |
| Queries + DB | `src/features/test-crud/queries.ts`, `collection.ts` | Loader `ensureQuery` for SSR, and a TanStack DB collection for optimistic changes with rollback |
| UI | `src/routes/_admin/admin/test-crud/*`, `src/features/test-crud/components/*`, `filters.tsx` | The shared `DataTable` with Test CRUD's columns, `FilterBar` filters (status, tags, price, dates, image) with chips, URL sorting and paging, bulk actions, a "Quick edit" dialog via route masking, `ConfirmDialog`, forms built from the reusable fields, toasts and the unsaved-changes guard |
| Public pages | `src/routes/_public/test-crud/*`, `src/functions/test-crud-public.ts` | SSR card grid and detail page that work without JavaScript, a masked "Quick view" dialog, published items only, localized 404 for drafts and invalid slugs, and `seo()` head tags |

Images are Cloudinary attachments: uploaded straight from the browser with a server signature, verified, and linked when the item is saved ([docs/guides/attachments.md](docs/guides/attachments.md), decision 0098). Part 1 images stored in Postgres move with `pnpm attachments:import-legacy`.

For a public page's head, use `seo({ title, description, path, image, jsonLd })` from `src/lib/seo.ts` (lists: `listSeo()`). It returns the title, description, robots, canonical URL, `hreflang` alternates for every locale plus `x-default`, Open Graph and Twitter tags, and JSON-LD. Private pages use `privateHead()`. The sitemap, robots.txt and the web manifest are server routes. See [docs/guides/seo.md](docs/guides/seo.md).

## Observability: Sentry and PostHog

Both optional and off without their variables. Sentry reports unexpected errors with a request id; PostHog is opt-in behind a consent banner; feature flags are evaluated on the server. See [docs/guides/observability.md](docs/guides/observability.md).

## Authentication

Better Auth (`src/server/auth/auth.ts`) provides:
- email and password sign-up with required email verification;
- email-code (OTP) sign-in;
- password reset;
- email change, with a security notice to the old address;
- password change and session management;
- optional Google sign-in, which appears only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set;
- an `admin` flag for the first administrator; everything else is roles and permissions edited in the admin area ([docs/guides/rbac.md](docs/guides/rbac.md)).

```bash
pnpm db:migrate                       # creates the auth tables
pnpm db:seed-admin --email you@example.com --password "at-least-12-chars" --name "You"
```

- **Seeding an admin:** `db:seed-admin` also reads `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` from `.env`. Add `--force` if other users already exist.
- **Protecting data:** Use `.middleware([requireUserMiddleware])` or `.middleware([requirePermission("…")])` on server functions. The `_authed` and `_admin` layouts guard navigation (`_admin` asks the server when entering the area; any permission opens it), and each admin section route checks its own permission with `assertRoutePermission`.
- **Rate limits:** They are stored in the database and keyed by a trusted client IP (`src/server/auth/client-ip.ts`). Behind a reverse proxy other than Vercel, set that proxy's trusted header there.
- **Schema changes:** After changing auth plugins, regenerate the schema with `pnpm auth:schema`, then run `pnpm db:generate` and `pnpm db:migrate`.

## Email

- **Sending:** Call `sendEmail({ to, template, data, locale })` from server code (`src/server/email/send.ts`). Pass the recipient's language, not the current page's.
- **Templates:** They live in `src/server/email/templates/` and are registered in `index.ts` with a subject and sample data.
- **Preview:** In development, open `/dev/emails` to see every template in English and Nepali, as HTML and plain text. The preview only exists on the dev server.
- **Delivery in development:** Emails are printed to the terminal (console provider) unless `RESEND_API_KEY` is set.
- **Production:** Resend is required. A production server refuses to start with the console provider or without `RESEND_API_KEY`. To smoke-test a production build locally, set `RESEND_API_KEY` (and clear `EMAIL_PROVIDER`) for that run.

## Adding shadcn/ui components

```bash
pnpm dlx shadcn@latest add <component>
```

The shadcn CLI (4.21.0) currently writes `import { cn } from "cn"`. Replace it with `import { cn } from "@/lib/utils"` after adding a component. `pnpm typecheck` fails until you do.
