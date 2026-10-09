# Portfolio

A bilingual (English + Nepali), server-rendered portfolio app built on TanStack Start.

Public pages render fully on the server (and without JavaScript), every string, email, validation message, meta tag and formatted value exists in both languages, and an admin area manages content. **Test CRUD** is the reference feature to copy for new ones.

The plan, phases and Definition of Done are in [docs/PLAN.md](docs/PLAN.md). Every non-obvious choice is recorded in [docs/decisions.md](docs/decisions.md). Start with [CLAUDE.md](CLAUDE.md) (commands, golden rules, solved pitfalls), then the guides in [docs/guides/](docs/guides/): [conventions](docs/guides/conventions.md) (file map, building blocks, list-page recipe) and the [setup audit](docs/guides/audit.md).

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
| `VITE_SENTRY_DSN` | no | Turns Sentry on (browser + server). |
| `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | no | Turn PostHog on (opt-in, behind the consent banner). |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | no | Upload source maps to Sentry during `pnpm build` (all three or none). |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | no | Image uploads (all three or none; server-only). Without them items have no images. See [docs/guides/attachments.md](docs/guides/attachments.md). |
| `CLOUDINARY_FOLDER` | no | public_id prefix for uploads (default `portfolio`). |
| `CRON_SECRET` | no | Bearer token for `/api/cron/*` (Vercel Cron, `vercel.json`); unset, the routes answer 404. |

## Architecture

```
src/
  routes/        file routes: _public (site), _auth (sign-in pages), _authed (account), _admin (admin area)
  features/      feature code: schema (shared Zod), queries, collections, components (auth, test-crud, flags)
  functions/     server functions (createServerFn): thin wrappers with middleware + validation
  server/        SERVER-ONLY: env, db (Drizzle), auth (Better Auth), email, repositories/services, Nitro routes
  middleware/    Start middleware: security headers + CSP nonce, CSRF, logging, error normalisation, auth guards
  components/    generic UI: ui/ (shadcn), page/ (Page, PageHeader, Breadcrumbs, EmptyState, skeletons),
                 data-table/ (DataTable, columns menu), filters/ (FilterBar, filter controls, chips),
                 navigation/ (Pagination, SearchLink, useCloseOverlay), dialogs/ (ConfirmDialog),
                 forms/ (field library), layout/ (header, footer, sidebar, theme, consent)
  lib/           isomorphic helpers: list contract, breadcrumbs, intl, validation, seo, errors, stores, analytics, zod
```

**A request, end to end:** the server entry (`src/server.ts`) starts Sentry and resolves the locale (Paraglide).
1. Request middleware adds the security headers and the CSP nonce, and checks CSRF for server functions.
2. The router matches the route; `beforeLoad` guards check the session (`_authed`) or ask the server for the admin role (`_admin`).
3. The **loader** calls `queryClient.ensureQueryData(...)`, which calls a **server function**.
4. The server function runs its **middleware** (locale, logging, error normalisation, `requirePermission(…)`) and its **validator** (the shared Zod schema), then its handler. The handler calls a service or repository in `src/server/**` that talks to Postgres through **Drizzle**.
5. The result is rendered on the server, streamed as HTML with the Query cache dehydrated, and hydrated in the browser without refetching. Admin lists then use a **TanStack DB** collection over the same query for optimistic edits with rollback.

## Security

- **Headers on every response** (Nitro `routeRules`, `src/lib/csp.ts`): `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation and others off), `X-Frame-Options: DENY` and `Cross-Origin-Opener-Policy`.
- **Content-Security-Policy on HTML pages** (production), with a fresh nonce per request:
  - Only nonce-bearing scripts run (`'strict-dynamic'` lets them load their own chunks).
  - No `eval`. Zod runs in jitless mode.
  - `connect-src` allows only the same origin plus the configured Sentry and PostHog hosts.
  - Also `frame-ancestors 'none'` and `object-src 'none'`.
- **Server-only code** (`src/server/**`, `*.server.*`) can't be imported by client code: TanStack Start import protection and `tests/server/env-boundary.test.ts` enforce it.
- **Auth:** every protected server function runs `requirePermission("<resource>:<action>")`, resolved from the database on each request (roles and the permission matrix: [docs/guides/rbac.md](docs/guides/rbac.md)). Auth endpoints are rate limited, and server functions reject cross-site calls (CSRF).
- **Content:** rich text is sanitized on the server before it's stored and again when read. Uploaded images are type-checked from their bytes.

## Deployment (Vercel)

1. Create a Neon database and set every required variable from the table above in Vercel, including `VITE_SITE_URL` (your domain), `EMAIL_PROVIDER=resend` and `RESEND_API_KEY`.
2. Run `pnpm db:migrate` against the production database (from CI or locally with `DATABASE_URL_UNPOOLED`), then `pnpm db:seed-admin`.
3. Deploy. `pnpm build` produces the Vercel output through Nitro. The server validates its environment on boot and refuses to start if something is missing.

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
| `pnpm attachments:import-legacy` | Move Part 1 images from Postgres to Cloudinary (`--dry-run` to preview). |
| `pnpm storybook` | Storybook dev server on http://localhost:6006. |
| `pnpm build-storybook` | Static Storybook in `storybook-static/`. |

## Testing

| What | Where | Run with |
| --- | --- | --- |
| Zod schemas and validation helpers | `tests/unit/validation.test.ts`, `test-crud-schema.test.ts`, `search.test.ts` | `pnpm test` |
| Attachments (Cloudinary flow, rules, cleanup) | `tests/server/attachments.test.ts`, `tests/components/attachments/*` (fake Cloudinary API) | `pnpm test` |
| Every form field (jsdom, accessibility contract) | `tests/components/forms/` | `pnpm test` |
| Test CRUD server logic (real SQL on PGlite) | `tests/server/test-crud-service.test.ts`, `test-crud-repository.test.ts` | `pnpm test` |
| Auth and admin rejection | `tests/server/auth-middleware.test.ts`, `route-guards.test.ts`, `test-crud-functions.test.ts` | `pnpm test` |
| Global guards (CSRF, logging, error normalisation, locale) | `tests/server/guards.test.ts` | `pnpm test` |
| Email templates in both locales, provider selection | `tests/email/`, `tests/server/email-provider.test.ts` | `pnpm test` |
| i18n key parity and locale routing | `tests/i18n/` | `pnpm test` |
| Env validation and the server/client boundary | `tests/unit/env.test.ts`, `tests/server/env-*.test.ts` | `pnpm test` |
| Stories: interactions and a11y, in en/light and ne/dark | `src/**/*.stories.tsx` | `pnpm test:storybook` |

- **Server functions:** they only run inside the TanStack Start runtime, so each one is a thin wrapper around a plain function in `src/server/**` that takes an injected `db`. Test those functions with `createTestDb()` (`tests/utils/test-db.ts`: PGlite with the real migrations).
- **Coverage:** `pnpm test:coverage` writes `coverage/index.html` and prints coverage by area: schemas & validation, form fields, server functions, guards, email, i18n, env, and overall.

## Storybook

Stories live next to their components (`*.stories.tsx`). They cover every form field, the form error summary, the layout components (header, footer, admin sidebar, language switcher and theme menu), the login form, and the Test CRUD card, table, dialog and form.

- **Toolbar:** language (English or नेपाली) and theme (light or dark), applied the way the app applies them.
- **App context:** each story is wrapped in the app's providers: TanStack Router with memory history, Query, the TanStack DB client and the preferences store (`.storybook/app-providers.tsx`). Stories set the session, preferences and initial URL through `parameters.app`.
- **No server:** Storybook uses its own Vite config (`.storybook/vite.config.ts`). Server functions (`@/functions/*`) and the Better Auth client are swapped for local mocks (`.storybook/mocks/`), so no database or network is involved and no real keys are read.
- **Accessibility:** the a11y addon runs on every story and fails it on any violation (`parameters.a11y.test = "error"`). `pnpm test:storybook` enforces this, together with the play-function interaction tests (login form, Test CRUD form, table, field errors).
- **For a new component:** add `component.stories.tsx`, wrap form fields in `FieldStory` (`src/components/forms/story-harness.tsx`), and add a `play` function for anything interactive.

## Internationalisation (English + Nepali)

- Messages live in `messages/en.json` and `messages/ne.json`. Both files must have the same keys, and a test enforces it.
- Use them in code with `import { m } from "@/paraglide/messages"`, then `m.some_key()`. Paraglide compiles them into `src/paraglide/` (generated, gitignored) on `dev`, `build`, `test` and `typecheck`.
- English lives at `/`, Nepali under `/ne/`. Define each route once; the router maps `/ne/...` onto it.
- Format dates, numbers, NPR amounts and relative times with `src/lib/intl.ts`, never `Intl` directly. Browsers such as Chrome lack Nepali locale data, so raw `Intl` output differs between server and browser.
- Compiling messages downloads two inlang plugins from jsDelivr, so the first compile needs network access.

## Routing, data and server functions

- **Layout routes:** `_public` (public pages), `_auth` (login and register), `_authed` (signed-in users) and `_admin` (admins). The guards run in each layout's `beforeLoad`.
- **Data loading:** Loaders call `queryClient.ensureQueryData(...)`, and components read with `useSuspenseQuery`. SSR dehydration is handled by `@tanstack/react-router-ssr-query`. See `src/routes/_public/stack.tsx` for the full pattern: search params, loader, pending state and streaming.
- **Server functions:** Use `createServerFn().inputValidator(zodInput(schema))`. Throw `AppError(code)` for expected failures. Anything else reaches the client as `INTERNAL`, with details only in the server log.
- **Guarding server functions:** Add `.middleware([requireUserMiddleware])` (signed in) or `.middleware([requirePermission("…")])` (`src/middleware/auth.ts`). Route guards alone never protect data.

## Forms

Build forms with `useAppForm` from `src/components/forms` and schemas from `src/lib/validation.ts`. The schema helpers return localized messages.

```tsx
const form = useAppForm({
	defaultValues: { name: "", price: undefined as number | undefined },
	validators: formValidators(z.object({ name: required(), price: currency() })),
	onSubmit: async ({ value }) => save(value),
});

<form.AppForm>
	<form.Form>
		<form.FormErrorSummary />
		<form.AppField name="name">{(field) => <field.TextField label={m.auth_name_label()} />}</form.AppField>
		<form.AppField name="price">{(field) => <field.CurrencyField label="…" />}</form.AppField>
		<form.SubmitButton>{m.account_save()}</form.SubmitButton>
	</form.Form>
</form.AppForm>
```

- **Fields:** `TextField`, `TextareaField`, `EmailField`, `PasswordField`, `NumberField`, `CurrencyField`, `SelectField`, `ComboboxField`, `MultiSelectField`, `RadioGroupField`, `CheckboxField`, `CheckboxGroupField`, `SwitchField`, `UrlField`, `PhoneField`, `OtpField`, `DateField`, `DateRangeField`, `TimeField`, `SliderField`, `TagsInputField`, `ColorField`, `FileField`, `ImageField`, `RichTextField`.
- **Showcase:** run `pnpm dev` and open `/dev/forms` (or `/ne/dev/forms`) to see and try every field. It returns 404 in production builds.
- **Accessibility:** Every field wires label, description, `aria-invalid` and `aria-describedby`.
- **When errors show:** Only after a field is left (blurred) or a submit is attempted.
- **Validation:** `formValidators(schema)` runs the schema on change, blur and submit.
- **Error summary:** `FormErrorSummary` lists every problem after a failed submit and takes focus. Each entry links to its field.
- **Numbers:** `NumberField` and `CurrencyField` accept Devanagari digits and thousands separators.
- **Stored values:** `PhoneField` stores E.164 (`+9779812345678`, Nepal by default). `DateField` stores `"YYYY-MM-DD"`, `DateRangeField` stores `{ from, to }` and `TimeField` stores `"HH:mm"`. `FileField` and `ImageField` store `File[]`. Validate them with `phone()`, `isoDate()`, `dateRange()`, `time()` and `files({ maxBytes, accept })`.
- **Rich text:** `RichTextField` (Tiptap) loads only in the browser, and the server renders a placeholder of the same size. Its HTML is untrusted. On the server, pass it through `sanitizeRichText()` (`src/server/rich-text/sanitize.ts`) before storing it and again before sending it to a page, then display it with `<RichTextContent html={safe} />`. That component only accepts the `SafeHtml` type the sanitizer returns.

## State: Query, DB and Store

Pick the tool by what the state is (full reasoning in `docs/decisions.md` 0064):

- **Server data you read:** TanStack Query, using `queryOptions` plus `ensureQueryData` in loaders. Example: `/stack`.
- **Server data you edit with instant feedback:** a TanStack DB query collection. It is backed by Query, so optimistic changes roll back on failure. Define the collection as in `src/lib/db.ts` and read it with `useLiveQuery`. Test CRUD (Task 11) is the first real collection. `tests/unit/db-collection.test.ts` shows the optimistic-update and rollback behaviour.
- **Client UI preferences:** the TanStack Store in `src/lib/stores`:
  - `useTheme()` gives light, dark or system.
  - `useSidebar()` controls the admin sidebar.
  - `useTablePreferences(id)` stores page size and hidden columns.
  - These are saved in cookies, so the server renders them on the first byte, with no theme flash and no hydration mismatch.
- **Form state:** TanStack Form. **URL state** (filters, page): Zod search params.

## Test CRUD: the template for new features

`/admin/test-crud` (admin) and `/test-crud` (public) make up the reference feature. To add a feature, say "projects":

1. **Table:** add `src/server/db/schema/projects.ts`, export it from `schema/index.ts`, then run `pnpm db:generate` and `pnpm db:migrate`.
2. **Shared schema:** `src/features/projects/schema.ts`, with one Zod input schema built from the helpers in `src/lib/validation.ts` (localized messages), the list search params built from `src/lib/list.ts` (`searchParam`, `enumParam`, `pageParam`, `pageSizeParam`), and the DTO types (`Paged<T>` for lists).
3. **Data access:** `src/server/projects/repository.ts` (Drizzle queries over an injected `Db` from `src/server/db/types.ts`; lists use `allOf`, `textSearch`, `orderBySort` and `paginate` from `src/server/db/list.ts`) and `service.ts` (the server functions' logic). Test both with `createTestDb()` (PGlite).
4. **Permissions and server functions:** add the resource to the permission catalog (`src/features/rbac/permissions.ts`, labels in `labels.ts`). Then `src/functions/projects.ts`, with `.middleware([requirePermission("projects:<action>")])` on every function, `.validator(zodInput(schema))`, and a one-line handler that calls the service. Add each function and its permission to `GUARDED_FUNCTIONS` in `tests/server/test-crud-functions.test.ts` (see [docs/guides/rbac.md](docs/guides/rbac.md)).
5. **Queries and collection:** `queries.ts` (query keys and `queryOptions`) and, for admin lists, `collection.ts` (TanStack DB optimistic updates).
6. **Routes and UI:** admin routes under `src/routes/_admin/admin/projects/`, public ones under `src/routes/_public/projects/` (use `seo()` in `head`). Add a `route.tsx` per section with `staticData: { breadcrumb: staticCrumb(m.…) }`; detail routes use `loaderTitleCrumb`. Pages use `Page` + `PageHeader`; lists use `DataTable` with column definitions in `features/projects/components/admin-columns.tsx`, plus `Pagination`, `EmptyState` and `ConfirmDialog` (see [conventions](docs/guides/conventions.md)). Forms use only `useAppForm` and the field library. Add a link to `admin-sidebar.tsx` and a card on the admin dashboard.
7. **Text:** every string goes in `messages/en.json` and `messages/ne.json`; the parity test fails if a key is missing.
8. **Stories and tests:** add `*.stories.tsx` with play functions, then run `pnpm test` and `pnpm test:storybook`.

The Test CRUD files for each layer:

| Layer | File | What it shows |
| --- | --- | --- |
| Table | `src/server/db/schema/test-crud.ts` | Drizzle table. Then run `pnpm db:generate` and `pnpm db:migrate`. |
| Shared schema | `src/features/test-crud/schema.ts` | One Zod schema for the form and the server, plus list search params and DTOs |
| Data access | `src/server/test-crud/repository.ts` | Plain functions over an injected `db`, tested on PGlite (`tests/server/test-crud-repository.test.ts`) |
| Server functions | `src/functions/test-crud.ts` | `requirePermission("test-crud:<action>")` on every function, `.validator()` input, and FormData for file uploads |
| Queries + DB | `src/features/test-crud/queries.ts`, `collection.ts` | Loader `ensureQueryData` for SSR, and a TanStack DB collection for optimistic changes with rollback |
| UI | `src/routes/_admin/admin/test-crud/*`, `src/features/test-crud/components/*`, `filters.tsx` | The shared `DataTable` with Test CRUD's columns, `FilterBar` filters (status, tags, price, dates, image) with chips, URL sorting and paging, bulk actions, a "Quick edit" dialog via route masking, `ConfirmDialog`, forms built from the reusable fields, toasts and the unsaved-changes guard |
| Public pages | `src/routes/_public/test-crud/*`, `src/functions/test-crud-public.ts` | SSR card grid and detail page that work without JavaScript, a masked "Quick view" dialog, published items only, localized 404 for drafts and invalid slugs, and `seo()` head tags |

Images are Cloudinary attachments: uploaded straight from the browser with a server signature, verified, and linked when the item is saved ([docs/guides/attachments.md](docs/guides/attachments.md), decision 0098). Part 1 images stored in Postgres move with `pnpm attachments:import-legacy`.

For a public page's head, use `seo({ title, description, path, image })` from `src/lib/seo.ts`. It returns the title, description, canonical URL, `hreflang` alternates for every locale plus `x-default`, and Open Graph and Twitter tags.

## Observability: Sentry and PostHog

Both are optional. If their variables are unset they are off completely: nothing is initialised or downloaded, no consent banner is shown, and no network calls are made.

- **Sentry** (`VITE_SENTRY_DSN`): errors and traces in the browser (`src/instrument.client.ts`) and on the server (`src/instrument.server.ts`).
  - Unexpected server-function errors are reported once, with the original stack and the `requestId` the user sees.
  - Expected `AppError`s (4xx) are not reported.
  - Only the user id is attached: no email, and the IP address is stripped.
  - Source maps are uploaded on `pnpm build` when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT` are all set.
- **PostHog** (`VITE_POSTHOG_KEY`, optional `VITE_POSTHOG_HOST`): opt-in only. A consent banner (with a footer link to change the choice later) stores the choice in a cookie.
  - Before consent `posthog-js` isn't loaded and the server sends no events.
  - After consent: pageviews on navigation, `identify` on login, `reset` on logout, and the Test CRUD events `test_crud_created`, `test_crud_updated` and `test_crud_deleted` (server) and `test_crud_viewed` (browser).
- **Feature flags** are evaluated on the server (`src/functions/feature-flags.ts`) and SSR'd through the Query cache, so server and client render the same thing.
  - Example: create a boolean flag `home-items-cta` in PostHog to show a call to action on the home page.
  - Before consent, flags are evaluated with a shared anonymous id and never record `$feature_flag_called`.

## Authentication

Better Auth (`src/server/auth/auth.ts`) provides:
- email and password sign-up with required email verification;
- email-code (OTP) sign-in;
- password reset;
- email change, with a security notice to the old address;
- password change and session management;
- optional Google sign-in, which appears only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set;
- `user` and `admin` roles.

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
