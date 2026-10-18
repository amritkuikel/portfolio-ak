# Master Plan: Bilingual SSR Portfolio App

This document is the single source of truth for the project. Every task reads it fully before starting and does **only** the phase it names. If reality forces a change to this plan, update this file in the same commit and record the reason in `docs/decisions.md`.

---

## 1. Goals

1. **Fast, SSR, SEO-friendly.** Public pages render fully on the server, work with JavaScript disabled, and ship correct meta, Open Graph, canonical and `hreflang` tags.
2. **Public side and admin side.** Anonymous visitors browse published content. Authenticated admins manage content through a protected admin area.
3. **Fully bilingual.** English (`en`, base locale) and Nepali (`ne`). Every user-facing string, email, validation message, meta tag and formatted value (date, number, NPR currency, relative time) is localized. Devanagari renders correctly without layout shift.
4. **Reference feature.** "Test CRUD" is the canonical, end-to-end example (schema, server functions, admin UI, public pages, events, tests, stories). Every future feature is built by copying its shape.
5. **Production quality.** TypeScript strict, no `any`, no `@ts-ignore`, no unexplained lint suppressions. Secrets never reach the client bundle. Observability, accessibility, security headers and tests are built in, not bolted on.

### Non-goals

- SMS or phone-based authentication.
- Multi-tenant or organisation features.
- Locales beyond `en` and `ne`. The setup must make adding one easy, but none are shipped.
- A CMS beyond what Test CRUD demonstrates.

### Global rules (apply to every phase)

- Check the current official docs for every library before using it. Follow the officially recommended TanStack Start / SSR integration. Do not rely on memory for APIs or versions.
- No `any`, no `@ts-ignore`, no disabled lint rule without an inline comment explaining why.
- After Phase 4, no hardcoded UI text. Everything goes through Paraglide in both locales.
- Server-only code (env, db, auth, email, secrets) must never be importable from client code.
- Every non-obvious choice goes in `docs/decisions.md` as **What**, **Why**, **Alternatives considered**.
- Every phase ends with `pnpm typecheck`, `pnpm check`, `pnpm test` (once tests exist) and `pnpm build`, all green with no warnings, followed by a conventional commit.
- Every phase ends with a short report: what was done, files touched, commands run and results, anything deferred or uncertain.

---

## 2. Stack

| Tool | Role |
| --- | --- |
| **TanStack Start** (React, Vite) | Full-stack framework: file-based routing, SSR, streaming, server functions, server routes. |
| **TanStack Router** | Type-safe routing, loaders, `beforeLoad` guards, Zod-validated search params, typed router context. |
| **TypeScript** (strict) | Type safety end to end, including route params, search params and server function I/O. |
| **Vite** | Dev server and bundler. Hosts the Start, Tailwind and Paraglide plugins. |
| **Tailwind CSS v4** | Styling via the official `@tailwindcss/vite` plugin, CSS-first config and design tokens. |
| **shadcn/ui** | Accessible, copy-in component primitives themed by our tokens. |
| **T3 Env** | Zod-validated environment variables, split into server and client schemas, failing fast at startup. |
| **Zod** | Single schema language for env, search params, forms, server function input and DTOs. |
| **Paraglide JS 2** (inlang) | Compile-time, tree-shakable i18n messages with URL-based locale routing for `en` and `ne`. |
| **TanStack Query** | Server-state cache with the official SSR integration for Start (dehydrate/hydrate handled for us). |
| **TanStack Form** | Headless, type-safe forms, composed via `createFormHook` into a reusable field library. |
| **TanStack DB** | Reactive client collections on top of Query for optimistic mutations with rollback (Test CRUD admin). |
| **TanStack Store** | Small reactive client stores: theme, admin sidebar, table preferences. |
| **Better Auth** | Email + password, email verification, email OTP, password reset, optional Google OAuth, admin roles, rate limiting. |
| **Drizzle ORM** | Type-safe SQL schema, queries and migrations via `drizzle-kit`. |
| **Neon** | Serverless Postgres. Driver choice (HTTP vs WebSocket pool) is decided in Phase 3. |
| **React Email** | Email templates as React components, localized through Paraglide. |
| **Resend** | Production email delivery behind our `EmailProvider` interface. |
| **Sentry** | Error and performance monitoring on client and server via the official TanStack Start SDK, with source maps. |
| **PostHog** | Consent-gated product analytics, pageviews, identify/reset and feature flags (`posthog-js` + `posthog-node`). |
| **Storybook** | Component workshop (Vite builder) with locale/theme toolbar, a11y addon and interaction tests. |
| **Vitest** + **Testing Library** | Unit, component and server-function tests with v8 coverage. |
| **Biome** | Single tool for linting and formatting. No ESLint or Prettier. |
| **pnpm** | Package manager. Lockfile committed. |

### Integration notes verified against official docs (2026-09-29)

These are starting points. Re-check the docs when the phase runs.

- **TanStack Start** is at Release Candidate status. Use the official starter and its documented hosting adapter.
- **Paraglide JS 2** has an official TanStack Start example (`TanStack/router` repo, `examples/react/start-i18n-paraglide`). It uses the Vite plugin, `paraglideMiddleware` in the server entry, and router `rewrite` with `deLocalizeUrl` / `localizeUrl`.
- **Better Auth** mounts its handler at a catch-all API route and requires the `tanstackStartCookies` plugin from `better-auth/tanstack-start` as the last plugin.
- **Sentry** ships `@sentry/tanstackstart-react`. It is marked alpha, so pin the version and record it in decisions.
- **Drizzle + Neon**: HTTP driver for single non-interactive queries, WebSocket driver when interactive transactions or sessions are needed.

### Deployment target (assumption, confirm before Phase 3)

Default target is a **Node-compatible serverless host (Vercel)** using TanStack Start's officially documented hosting adapter at the time of Phase 1. This drives the Neon driver choice in Phase 3 and the header mechanism in Phase 12. If the target changes, update this section and `docs/decisions.md`.

---

## 3. Target folder structure

Exact file names follow the official starter where it differs. Folder responsibilities are fixed.

```
.
├── docs/
│   ├── PLAN.md                  # this file
│   └── decisions.md             # ADR-style log of non-obvious choices
├── messages/
│   ├── en.json                  # Paraglide source messages (base locale)
│   └── ne.json                  # must have identical keys to en.json
├── project.inlang/              # inlang settings + paraglide.config.ts (compiler options)
├── drizzle/                     # generated SQL migrations (committed)
├── public/                      # static assets, self-hosted font files if needed
├── vite/
│   └── email-preview-plugin.ts  # dev-server-only /dev/emails (apply: "serve")
├── scripts/
│   ├── seed-admin.mjs           # creates the first admin user (wraps Better Auth create-admin)
│   └── coverage-report.mjs      # per-area coverage table (pnpm test:coverage)
├── .storybook/                 # main.ts, own vite.config.ts, preview (locale/theme toolbar), mocks/, vitest setups
├── src/
│   ├── routes/
│   │   ├── __root.tsx           # document shell, head, <html lang>, error/notFound
│   │   ├── health.tsx           # database health page (Phase 3)
│   │   ├── _public/verify-email, reset-password  # public: a signed-in user may need them
│   │   ├── _public/             # public layout: header, footer
│   │   │   ├── index.tsx
│   │   │   └── test-crud/
│   │   │       ├── index.tsx    # SSR card grid
│   │   │       └── $slug.tsx    # SSR detail page
│   │   ├── _auth/               # login, register, sign-in-code (OTP), forgot-password
│   │   ├── _authed/             # requires a session (account: profile, email, password, sessions)
│   │   ├── _admin/              # requires admin role (sidebar layout)
│   │   │   └── admin/test-crud/ # index (list), new, $id (edit)
│   │   ├── api/
│   │   │   └── auth/$.ts        # Better Auth handler
│   │   └── _public/dev/forms.tsx # dev-only form showcase (404 + tree-shaken in production)
│   ├── server/                  # SERVER-ONLY. Never imported by client code.
│   │   ├── env.ts               # T3 Env server schema
│   │   ├── db/
│   │   │   ├── client.ts        # Drizzle + node-postgres pool (Neon)
│   │   │   ├── connection-string.ts # sslmode normalisation
│   │   │   ├── health.ts        # database health check
│   │   │   └── schema/          # one file per domain (auth, test-crud)
│   │   ├── auth/                # Better Auth instance, session lookup, email locale, trusted client IP
│   │   ├── http/                # per-request AppError -> HTTP status record
│   │   ├── email/
│   │   │   ├── types.ts         # EmailProvider interface, EmailMessage
│   │   │   ├── providers/       # ConsoleProvider, ResendProvider
│   │   │   ├── config.ts        # selectEmailProvider() rules + getEmailProvider()
│   │   │   ├── templates/       # React Email templates + typed registry
│   │   │   ├── render.ts        # renderEmail(id, data, { locale }) -> subject/html/text
│   │   │   ├── send.ts          # sendEmail(): render in recipient locale + deliver
│   │   │   └── preview.ts       # helpers for the dev-only preview
│   │   ├── rich-text/           # sanitize.ts: allowlist sanitizer for rich-text HTML (returns SafeHtml)
│   │   ├── test-crud/           # repository.ts (Drizzle queries), service.ts (server fn logic), image.ts (signature checks)
│   │   ├── routes/              # Nitro routes (images.ts: GET /api/images/:id), registered in vite.config.ts
│   │   ├── analytics/           # posthog.ts: consent-gated server events + SSR feature flags (posthog-node)
│   │   └── plugins/             # Nitro plugins run at boot (validate-env.ts)
│   ├── middleware/              # Start middleware (isomorphic; outside src/server so start.ts can import it):
│   │                            #   security-headers (CSP nonce), csrf, logging, errors, auth (session/user/admin guards)
│   ├── functions/               # createServerFn definitions, grouped by feature
│   │   ├── health.ts
│   │   ├── feature-flags.ts     # server-evaluated PostHog flags (SSR-safe)
│   │   ├── dev.ts               # dev-only helpers (rich-text sanitize preview; refuses in production)
│   │   ├── test-crud.ts         # admin server functions (all behind requireAdminMiddleware)
│   │   └── test-crud-public.ts  # public reads: published items only, drafts are NOT_FOUND
│   ├── features/
│   │   ├── auth/                # auth UI, error mapping, validation, session queries
│   │   ├── dev/                 # dev-only pages (forms showcase)
│   │   └── test-crud/           # constants, schema.ts (shared Zod + DTOs), form-data.ts (create/update wire format),
│   │                            #   queries, collection (TanStack DB), components/
│   ├── components/
│   │   ├── errors/              # error, not-found and pending pages
│   │   ├── ui/                  # shadcn/ui primitives
│   │   ├── layout/              # header, footer, admin sidebar, language switcher, theme toggle,
│   │   │                        #   observability.tsx (consent banner, PostHog/Sentry sync)
│   │   └── forms/               # useAppForm/withForm (index.ts), contexts, field shell (a11y wiring),
│   │                            #   fields/ (text, number, choice, phone/otp, date/time, slider/tags/color,
│   │                            #   file/image, rich text), Form, SubmitButton, FormErrorSummary
│   │   └── rich-text-content.tsx # renders SafeHtml (the only innerHTML sink)
│   ├── lib/
│   │   ├── client-env.ts        # validated client env (import this)
│   │   ├── client-env.schema.ts # T3 Env client schema (also used by vite.config.ts)
│   │   ├── env.shared.ts        # env error formatting
│   │   ├── intl.ts              # locale-aware date, number, NPR currency, relative time
│   │   ├── intl-ne.ts           # portable CLDR ne data (browsers lack ICU ne)
│   │   ├── i18n/                # locale header + server-function locale middleware
│   │   ├── validation.ts        # localized Zod helpers
│   │   ├── date-only.ts         # "YYYY-MM-DD" calendar dates without time-zone drift
│   │   ├── safe-html.ts         # SafeHtml brand type
│   │   ├── query.ts             # QueryClient factory (per request on the server)
│   │   ├── errors.ts            # AppError + serialization adapter
│   │   ├── fn-input.ts          # zodInput(): Zod -> AppError(BAD_REQUEST) for server fn input
│   │   ├── session.ts           # Session types (router context, middleware)
│   │   ├── redirect.ts          # safe ?redirect= validation
│   │   ├── seo.ts               # page title template + seo(): canonical, hreflang, Open Graph
│   │   ├── csp.ts               # Content-Security-Policy builder + static security headers
│   │   ├── zod-config.ts        # Zod jitless mode (CSP forbids eval); imported first
│   │   ├── stores/              # TanStack Store: theme, sidebar, table prefs (cookie-backed, one store per router)
│   │   ├── db.ts                # TanStack DB client per request + queryClientOf() for query collections
│   │   ├── analytics.ts         # posthog-js wrapper: loaded only after consent
│   │   ├── observability/       # sentry.ts: shared Sentry options (no DSN = off)
│   │   ├── fonts.ts             # font preload links
│   │   └── utils.ts             # cn() and small helpers
│   ├── paraglide/               # GENERATED by the Paraglide Vite plugin (gitignored)
│   ├── routeTree.gen.ts         # GENERATED by the Start Vite plugin (committed)
│   ├── styles/
│   │   └── app.css              # Tailwind entry, tokens, light/dark themes, fonts
│   ├── router.tsx               # createRouter, context, Query + DB SSR integrations, preferences store, i18n rewrite
│   ├── client.tsx               # client entry (imports instrument.client first)
│   ├── instrument.client.ts     # Sentry browser init (only with VITE_SENTRY_DSN)
│   ├── instrument.server.ts     # Sentry server init (only with VITE_SENTRY_DSN)
│   ├── server.ts                # server entry: Sentry wrap, Paraglide middleware
│   └── start.ts                 # createStart: global request + function middleware
├── tests/
│   ├── setup/                   # env.ts (baseline env), dom.ts (jest-dom, cleanup, jsdom polyfills)
│   ├── unit/                    # schemas, validation, intl, env, provider selection
│   ├── components/              # every form field (forms/harness.tsx), layout components
│   ├── server/                  # server logic (PGlite), guards, route guards, auth/admin rejection, email providers
│   ├── email/                   # templates render in both locales
│   └── i18n/                    # message key parity
├── .env.example
├── biome.json
├── drizzle.config.ts
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

Stories live next to their components as `*.stories.tsx`.

**Boundary rule.** Anything under `src/server/` is server-only. Phase 2 adds an automated guard (test and/or build check) that fails if client code imports it. Server functions in `src/functions/` may import `src/server/`. Components and routes call server functions and never import `src/server/` directly.

---

## 4. Phases

Each phase lists **Scope**, **Deliverables** and **Acceptance criteria**. Every phase also inherits the global rules in section 1: green `typecheck`, `check`, `test` (once present) and `build`, a decisions entry for each non-obvious choice, a conventional commit and a short report.

| Phase | Name | Task(s) |
| --- | --- | --- |
| 1 | Scaffold & tooling | 1 |
| 2 | Environment validation | 2 |
| 3 | Database | 3 |
| 4 | Internationalisation | 4 |
| 5 | Router, SSR & server functions | 5 |
| 6 | Email + authentication | 6 (email), 7 (auth) |
| 7 | Form system | 8 (core fields), 9 (advanced fields) |
| 8 | State & reactive data | 10 |
| 9 | Test CRUD | 11 (backend + admin), 12 (public) |
| 10 | Observability | 13 |
| 11 | Storybook + testing | 14 (Storybook), 15 (testing pass) |
| 12 | Polish & final verification | 16 |

### Phase 1: Scaffold & tooling

**Scope.** Create the app from the current official TanStack Start starter and set up tooling. No features.

**Deliverables**
- TanStack Start app from the official starter, TypeScript strict.
- Biome for lint and format. All ESLint/Prettier config and dependencies removed.
- Tailwind v4 via the official Vite plugin, with initial design tokens.
- shadcn/ui initialised for TanStack Start with button, input, card, dialog, dropdown-menu and sonner.
- Fonts: one Latin font and Noto Sans Devanagari (or equivalent), self-hosted or preloaded, `font-display` set, metric-matched fallbacks so there is no visible layout shift.
- `package.json` scripts: `dev`, `build`, `start`, `typecheck`, `check`, `check:fix`, `test`, `test:watch`, `db:generate`, `db:migrate`, `db:push`, `db:studio`, `storybook`, `build-storybook`. Stubs that print a clear "not installed yet" message are acceptable for later tools.
- `.gitignore` covering `node_modules`, build output, `.env`, generated Paraglide output.

**Acceptance criteria**
- `pnpm typecheck`, `pnpm check` and `pnpm build` pass with no warnings.
- `pnpm dev` serves the home page with SSR HTML visible via view-source.
- No ESLint or Prettier files or dependencies remain.
- Fonts load with preload links in `<head>` and no layout shift from font swap on the home page.

### Phase 2: Environment validation

**Scope.** Typed, validated environment for server and client.

**Deliverables**
- T3 Env server schema in its own file (`src/server/env.ts`) and client schema in its own file (`src/lib/client-env.schema.ts`, consumed via `src/lib/client-env.ts`). Client files avoid the `*.client.*` name, which TanStack Start import protection reserves for client-only code.
- Client: `VITE_APP_TITLE`, shown in the header and used in `<title>`.
- Server: `DATABASE_URL` (validated as a postgres URL), `EMAIL_PROVIDER` (`console` or `resend`), `RESEND_API_KEY` (optional), `EMAIL_FROM`.
- Complete, commented `.env.example`. `.env` gitignored.
- Startup fails with a clear, human-readable message on missing or invalid env.
- A test proving the server env module cannot be imported from client code.

**Acceptance criteria**
- Removing or corrupting a required variable makes `pnpm dev` and `pnpm start` fail immediately with a message naming it.
- The client bundle contains no server variable names or values, verified by searching the build output.
- The import-boundary test passes, and fails when the boundary is deliberately broken.

### Phase 3: Database

**Scope.** Drizzle + Neon wiring and migration tooling. No feature tables yet.

**Deliverables**
- Neon driver chosen from current Neon + Drizzle docs against the deploy target, recorded in `docs/decisions.md`.
- `drizzle.config.ts`, `src/server/db/schema/` and a server-only `src/server/db/client.ts`.
- Working scripts: `db:generate`, `db:migrate`, `db:push`, `db:studio`.
- A `health` server function that runs a trivial query and returns status and latency.

**Acceptance criteria**
- The health server function returns OK against a real Neon database.
- The db client is only imported from server code, enforced by the Phase 2 boundary check.

### Phase 4: Internationalisation

**Scope.** Paraglide JS 2 exactly as in the official TanStack Start example.

**Deliverables**
- Paraglide Vite plugin, server middleware and router URL rewrite.
- Locales `en` (base) and `ne`. URL strategy: `/` for English, `/ne/...` for Nepali. Cookie and `Accept-Language` fallbacks only as the docs recommend.
- `<html lang>` correct on SSR for both locales.
- Preload the Devanagari font subset only on `ne` pages (see decision 0007).
- Language switcher that preserves path and search params. (The URL hash is not preserved: browsers never send it to the server, so SSR cannot render it.)
- `src/lib/intl.ts` with date, number, NPR currency and relative-time helpers built on `Intl` and keyed to the current locale.
- Test asserting `messages/en.json` and `messages/ne.json` have identical keys.
- All existing UI text migrated to messages.

**Acceptance criteria**
- `/` renders English and `/ne` renders Nepali on the server, each with the correct `lang`.
- Switching language keeps the current path and query.
- No hydration warnings in the browser console when loading and switching both locales. The report states exactly how this was verified.
- Key-parity test passes and no hardcoded UI strings remain.

### Phase 5: Router, SSR & server functions

**Scope.** Routing architecture, data-loading patterns and the middleware skeleton.

**Deliverables**
- Root route with localized `head` (meta, title template), `errorComponent` and `notFoundComponent`.
- Typed router context with `queryClient` and a `session` slot.
- The official TanStack Query SSR integration for Start. No hand-written dehydrate/hydrate.
- Loaders using `ensureQueryData`, with `pendingComponent` and `errorComponent`.
- One streaming example: deferred promise with `Suspense` / `Await`.
- Zod-validated search params.
- Server function middleware: request logging, error normalisation to a typed error shape, placeholder `auth` and `admin` middleware.
- Layout routes `_public`, `_auth` (login/register stubs), `_authed` and `_admin` with wired `beforeLoad` hooks. Stub guards are allowed.

**Acceptance criteria**
- Data fetched in a loader is present in the SSR HTML and not refetched on hydration.
- The streaming example shows a fallback, then the streamed content.
- Invalid search params are corrected or rejected per schema.
- A thrown server error reaches the client as the normalised shape and renders the localized error component.

### Phase 6: Email + authentication

#### Phase 6a: Email system (Task 6)

**Deliverables**
- `EmailProvider` interface with `ConsoleProvider` (dev) and `ResendProvider`.
- Provider selection from env: console in development, Resend when configured, clear error in production when no provider is configured.
- React Email templates: verify email, OTP code, password reset, email changed, welcome. Localized via Paraglide in `en` and `ne`, with Devanagari rendering correctly.
- Dev-only preview route listing every template in both locales, unreachable in production builds.
- Tests for provider selection.

**Acceptance criteria**
- Each template renders in both locales in the preview route.
- A production build neither contains nor serves the preview route, verified by requesting it and by inspecting build output.
- Provider selection tests cover development, production with Resend, and misconfigured production.

#### Phase 6b: Authentication (Task 7)

**Deliverables**
- Better Auth with the Drizzle adapter and the official TanStack Start integration, including the `tanstackStartCookies` plugin. Auth schema generated and migrated.
- Email + password with required email verification, email OTP sign-in, password reset, and optional Google OAuth enabled only when its env vars are set.
- Admin plugin with `user` and `admin` roles. Rate limiting on auth endpoints.
- All auth emails sent through the Phase 6a email system.
- Localized pages: login, register, verify email, OTP, forgot password, reset password, account settings (name, email change, password change, active sessions).
- Real guards: `_authed` redirects to login with a return URL, and `_admin` checks the role on the server.
- Seed script creating an admin user from env or CLI arguments.
- No SMS or phone auth.

**Acceptance criteria**
- These flows work end to end in dev with the console provider: register, verify, log in, OTP login, forgot and reset password, email change, password change, session revoke.
- Anonymous users on `_authed` routes are redirected with a working return URL. Non-admins are refused on `_admin` routes by the server, not just hidden in the UI.
- The Google button is absent when its env vars are missing.
- Rate limiting triggers on repeated failed logins.

### Phase 7: Form system

#### Phase 7a: Core fields (Task 8)

**Deliverables**
- `createFormHookContexts` + `createFormHook`, exporting `useAppForm` and `withForm`.
- `src/lib/validation.ts`: localized Zod helpers (required, email, password strength, URL, number range, currency) returning Paraglide messages.
- Fields wired to shadcn/ui and fully accessible (label, description, `aria-invalid`, `aria-describedby`, error text): TextField, TextareaField, EmailField, PasswordField (show/hide + strength), NumberField, CurrencyField (NPR default, locale-aware), SelectField, ComboboxField, MultiSelectField, RadioGroupField, CheckboxField, CheckboxGroupField, SwitchField, UrlField, SubmitButton (pending/disabled), FormErrorSummary (focuses on submit failure).
- A Vitest + Testing Library test per field covering render, input, validation error and a11y attributes.

#### Phase 7b: Advanced fields (Task 9)

**Deliverables**
- PhoneField: libphonenumber-js, +977 default, country picker, stores E.164.
- OtpField: 6 digits, paste support, `autocomplete="one-time-code"`.
- DateField, DateRangeField and TimeField with locale-aware display.
- SliderField, TagsInputField, ColorField.
- FileField and ImageField with size/type validation, preview and drag-and-drop.
- RichTextField (Tiptap), loaded client-only with a server placeholder of matching dimensions, with a toolbar, and sanitized before storage and on render.
- Dev-only `/dev/forms` showcase rendering every field in both locales.
- Tests for every new field.

**Acceptance criteria (7a + 7b)**
- Every field has a passing test and appears in the showcase.
- Validation messages appear in the active locale.
- The rich text field causes no hydration warning and no layout jump on load.
- `/dev/forms` is unreachable in production builds.

### Phase 8: State & reactive data (Task 10)

**Deliverables**
- TanStack Store for theme (light/dark/system, no flash on SSR via cookie or inline script per best practice), admin sidebar open/collapsed, and persisted table preferences (page size, visible columns).
- A TanStack DB query-collection pattern backed by TanStack Query, ready for Test CRUD.
- A `docs/decisions.md` entry explaining when to use DB vs Query vs Store in this app, with examples.

**Acceptance criteria**
- A hard reload in dark mode shows no light flash.
- Sidebar and table preferences survive reload.
- No hydration warnings from theme or preference state.

### Phase 9: Test CRUD (reference feature)

#### Phase 9a: Backend + admin (Task 11)

**Deliverables**
- `test_crud` table: `id`, `slug` (unique), `title`, `summary`, `body` (rich text), `status`, `price`, `phone`, `tags`, `image`, `published_at`, `created_by`, `created_at`, `updated_at`. Migration generated and applied.
- One shared Zod schema used by both forms and server functions.
- Server functions for list (paginated, sortable, searchable, filterable), get, create, update, delete and bulk delete, all behind auth + admin middleware.
- Admin UI: table with URL-driven pagination, sort, search and filters (Zod search params); create/edit forms built only from the reusable fields; delete and bulk delete with confirmation; optimistic updates via TanStack DB with rollback; toasts; an unsaved-changes warning. Fully localized.

#### Phase 9b: Public side (Task 12)

**Deliverables**
- `/test-crud`: SSR card grid with search and pagination in the URL, skeletons and an empty state.
- `/test-crud/$slug`: SSR detail page with sanitized rich text and a localized 404 for missing or unpublished slugs.
- Responsive, built on design tokens, correct in both themes.
- Localized meta, Open Graph, canonical and `hreflang` (en/ne) tags on both pages.
- Only published items visible publicly.

**Acceptance criteria (9a + 9b)**
- Anonymous and non-admin calls to admin server functions are rejected server-side.
- A failed mutation visibly rolls back the optimistic change and shows a localized toast.
- Public pages render full content with JS disabled.
- Draft items return the localized 404 publicly.

### Phase 10: Observability (Task 13)

**Deliverables**
- Sentry via the official TanStack Start SDK: client + server, source maps uploaded on build, user context set after login and cleared on logout.
- PostHog client (`posthog-js`) and server (`posthog-node`): consent toggle with no tracking before consent, route-change pageviews, `identify` on login and `reset` on logout, one SSR-safe feature flag visibly affecting the UI, and Test CRUD events (created, updated, deleted, viewed).
- All Sentry and PostHog env vars added to T3 Env as optional.

**Acceptance criteria**
- With keys absent, the app runs and builds with no errors or warnings and makes no network calls to either service.
- With keys present, a test error appears in Sentry with a readable stack trace, and PostHog events appear only after consent.
- The feature flag renders identically on server and client.

### Phase 11: Storybook + testing

#### Phase 11a: Storybook (Task 14)

**Deliverables**
- Storybook (Vite builder) loading Tailwind and fonts.
- Toolbar toggles for locale (en/ne) and theme (light/dark).
- a11y addon enabled.
- Stories for every form field, the layout components (header, footer, admin sidebar, language switcher) and the Test CRUD components (card, table, form).
- Interaction tests (play functions) for the login form and the Test CRUD form.

#### Phase 11b: Testing pass (Task 15)

**Deliverables**
- Tests covering Zod schemas and validation helpers, every form field, Test CRUD server functions (including auth/admin rejection), auth guards, email templates in both locales, i18n key parity and env validation.
- v8 coverage enabled with a per-area report.

**Acceptance criteria (11a + 11b)**
- `pnpm build-storybook` passes and the a11y addon reports no violations.
- `pnpm test` is green and coverage is reported per area.

### Phase 12: Polish & final verification (Task 16)

**Deliverables**
- Security headers: CSP compatible with Sentry and PostHog, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Accessibility and responsive review of every page in both locales and both themes at mobile, tablet and desktop widths, with fixes.
- README: setup, env vars, scripts, architecture overview, and how to add a new feature using Test CRUD as the template.
- `docs/decisions.md` finalised.
- A walk through the Definition of Done (section 5) item by item, fixing failures, then the final summary (section 6).

**Acceptance criteria**
- Every Definition of Done item is checked with evidence.
- Headers are verified on a production build response.

---

## 5. Definition of Done (whole project)

Each item must be verified with evidence such as command output, a test name or a described manual check. Nothing is assumed. All items were verified in Phase 12; the evidence is in the final summary and docs/decisions.md 0081–0082.

**Rendering & SSR**
- [x] All public pages render complete, readable content with JavaScript disabled.
- [x] No hydration warnings in the browser console on any page, in either locale or theme.
- [x] The streaming example works.

**Internationalisation**
- [x] `en` and `ne` message files have identical keys (test passes).
- [x] No hardcoded user-facing strings in UI, emails, validation or meta.
- [x] `<html lang>`, canonical and `hreflang` tags are correct per locale.
- [x] Dates, numbers, NPR currency and relative times format per locale.
- [x] Devanagari renders correctly with no font-swap layout shift.

**Theming & UX**
- [x] Light, dark and system themes work with no flash on load.
- [x] Every page is usable at mobile, tablet and desktop widths.

**Accessibility**
- [x] The Storybook a11y addon reports no violations on any story.
- [x] Every form field has a label, description, `aria-invalid`, `aria-describedby` and error text.
- [x] Keyboard navigation and visible focus work on all interactive elements. FormErrorSummary receives focus on a failed submit.

**Security**
- [x] No secrets or server-only modules in the client bundle (boundary test passes and a build output search is clean).
- [x] Admin server functions reject non-admins on the server.
- [x] Auth endpoints are rate limited.
- [x] Rich text is sanitized before storage and on render.
- [x] Security headers are present on production responses, and the CSP allows only required origins.
- [x] Dev-only routes (email preview, form showcase) are unreachable in production.

**Observability**
- [x] Sentry and PostHog no-op cleanly when keys are absent.
- [x] No analytics before consent.

**Quality gates**
- [x] `pnpm typecheck`, `pnpm check`, `pnpm test`, `pnpm build` and `pnpm build-storybook` are all green with no warnings.
- [x] No `any`, no `@ts-ignore`, no unexplained lint suppressions (verified by search).
- [x] Migrations are committed and apply cleanly to an empty database.
- [x] README and `docs/decisions.md` are complete and accurate.

---

## 6. Final summary format (end of Phase 12)

The final summary uses exactly these sections, in this order:

1. **Overview.** Two or three sentences on what was built and its current state.
2. **Definition of Done.** A table with columns *Item*, *Status* (pass / fail / partial) and *Evidence*, one row per item in section 5.
3. **Quality gates.** A table listing each script, its result and its warning count.
4. **Test coverage.** A table of line, branch and function coverage per area (schemas & validation, form fields, server functions, guards, email, i18n, env) plus overall.
5. **Architecture recap.** A short bulleted tour of the folder structure and the data flow from route to loader to server function to middleware to database, pointing to the README for detail.
6. **Key decisions.** The five to ten most important entries from `docs/decisions.md`, one line each.
7. **Known limitations and deferred work.** Everything not done or only partly done, with the reason.
8. **Recommended next steps.** A short, prioritised list.
9. **How to run.** The minimal commands to install, migrate, seed an admin and start the app.

---

## 7. Part 2: admin platform, RBAC, attachments, SEO and developer docs (Tasks 17–24)

Part 2 builds on the finished Part 1 app. It turns Test CRUD's one-off admin pieces into a reusable admin platform, adds role-based permissions that admins can edit, Cloudinary attachments, complete SEO, and documentation that lets any future session (human or AI) work on the app without re-discovering how it fits together.

### Part 2 rules (in addition to section 1's global rules)

- **Reuse before writing:** a page is assembled from shared building blocks (page header, breadcrumbs, data table, filter bar, pagination, dialogs, empty states, form fields). Feature code only adds columns, filters and fields. If a pattern appears twice, it becomes a component in `src/components/`.
- **Everything is SSR:** every page renders its real content on the server. No client-only data fetching for first paint, no hydration warnings, no console errors or warnings, and layout shift ≤ 0.01 on every page (measured with an empty cache).
- **Server is the authority:** permissions, validation and ownership are checked on the server for every server function and route. The UI only hides what the server would refuse anyway.
- **Docs move with code:** every task updates `CLAUDE.md` and the relevant guide in `docs/guides/` in the same commit.
- **Each task ends** with the section 1 gates, plus `pnpm test:storybook`, a browser review of the pages it touched (en/ne × light/dark × 390/768/1280: axe, overflow, console, CLS), a commit and a short report.

| Task | Phase | Name |
| --- | --- | --- |
| 17 | 13 | Part 2 plan (this section) |
| 18 | 14 | Setup audit + reusable admin/page building blocks |
| 19 | 15 | Filters, search params and route masking |
| 20 | 16 | RBAC: permissions, roles and the admin permission matrix |
| 21 | 17 | Attachments with Cloudinary |
| 22 | 18 | SEO everywhere |
| 23 | 19 | Module examples (how to use each piece in a page) |
| 24 | 20 | Developer docs, final verification and summary |

### Phase 14: Setup audit + reusable building blocks (Task 18)

**Deliverables**
- **Audit:** a written review (`docs/guides/audit.md`) of every module against current official docs and best practice: routing and loaders, Query/DB/Store use, forms, i18n, auth, env, server functions, errors, observability, testing and file structure. Each finding has a verdict (keep, fix, improve) and a fix in this task or a named later task.
- **Folder structure:** a documented convention, with code moved to match it:
  - `src/components/` holds generic UI only
  - `src/features/<name>/` holds schema, queries, collection, components, columns and filters
  - `src/server/<name>/` holds repository and service
  - `src/functions/<name>.ts` holds thin server functions
- **Reusable components**, each with stories and tests:
  - `PageHeader`: title, description, actions, breadcrumbs.
  - `Breadcrumbs`: driven by route `staticData`/loader data, localized, a `<nav aria-label>` with `aria-current`, emitting `BreadcrumbList` JSON-LD on public pages.
  - `DataTable`: generic over the row type with column definitions; sortable headers bound to URL search; row selection with a bulk-action bar; column visibility from table preferences; loading skeleton and empty state; responsive.
  - `Pagination`: one component for admin and public, URL-driven, works without JS.
  - `ConfirmDialog`, `EmptyState`, `ListSkeleton`.
- **Refactor:** Test CRUD admin and public pages are rebuilt from these components with no behaviour change. Breadcrumbs appear on every admin page and on public detail pages.

**Acceptance criteria**
- The Test CRUD list page's feature code is only column, filter and action definitions plus data wiring.
- All previous tests and stories pass, with new stories for every new component.
- The audit document lists every module with a verdict.

### Phase 15: Filters, search params and route masking (Task 19)

**Deliverables**
- A reusable `FilterBar` with filter primitives: text search (debounced, also works as a plain GET form without JS), select, multi-select, boolean, number range, date range, and active-filter chips with "clear all".
- Typed search-param helpers (`src/lib/search.ts`): Zod-based parsing with defaults and `.catch()`, stripping defaults from URLs, preserving params across navigation, arrays and ranges in the URL, and a schema-to-loader-deps pattern.
- Test CRUD admin filters: status, tags, price range, published date range, has image. Each is URL-driven, SSR'd and supported by the repository (indexed where needed).
- TanStack Router **route masking**, two worked examples:
  - Opening an item's edit form from the admin list as a dialog over the list, with the URL masked to `/admin/test-crud/$id` (reload or share opens the full page).
  - A public "quick view" of an item over the grid, masked to its canonical `/test-crud/$slug`.
- Path params validated with Zod (`params.parse`), with localized 404 for invalid params.

**Acceptance criteria**
- Every filter combination is shareable by URL, survives reload, renders on the server and works with JS disabled (search, select and pagination).
- Masked routes show the masked URL. Reload, back/forward and opening in a new tab behave correctly.
- Tests cover search parsing, filter-to-query translation in the repository (PGlite) and both masking flows.

### Phase 16: RBAC: permissions, roles and the permission matrix (Task 20)

**Deliverables**
- Research the current Better Auth access-control options (admin plugin roles, `createAccessControl`, dynamic roles). Choose and record either Better Auth-native or app-level tables, keeping Better Auth sessions as the source of identity.
- **Permission catalog in code:** resources and actions, e.g. `test-crud:read|create|update|publish|delete`, `users:read|update`, `roles:manage`, `attachments:upload|delete`. Each has a localized label and description.
- **Data model:** `roles` (system roles `admin` and `user` plus custom roles), `role_permissions` and user to role assignment. Migration and seed. `admin` always has every permission and cannot be locked out.
- **Server:**
  - `requirePermission(...)` middleware for server functions, replacing `requireAdminMiddleware` where a finer permission applies.
  - Route guards by permission.
  - Permissions resolved per request and cached for the request; all checks happen on the server.
- **Client:** `useCan(permission)` and `<Can permission>`, which hide navigation, buttons and actions the user can't use. Admin sidebar items are filtered by permission.
- **Admin UI:**
  - A Users page (DataTable with filters; assign roles; ban and unban).
  - A Roles page (create, rename and delete custom roles).
  - A permission matrix: roles as columns, permissions grouped by resource as rows, checkboxes with a select-all per resource, saved with an optimistic update and rollback.
- **Tests:** middleware, guards, matrix save, escalation attempts (a user granting themselves `roles:manage`, editing system roles), and a live 403 replay.

**Acceptance criteria**
- An admin can create a role "Editor", tick `test-crud:read/create/update` in the matrix, assign it to a user, and that user can then do exactly those things in the UI and on the server, and nothing else.
- Removing a permission takes effect on that user's next request.

### Phase 17: Attachments with Cloudinary (Task 21)

**Deliverables**
- Research the current Cloudinary docs for signed direct uploads, the Node SDK, transformations and deletion.
- Optional env vars `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` (server-only), plus a public `VITE_CLOUDINARY_CLOUD_NAME`. Attachments are disabled cleanly when they're unset.
- **Upload flow:**
  1. The browser asks a server function for a signature, which checks the `attachments:upload` permission and the type, size and folder rules.
  2. The browser uploads directly to Cloudinary, with progress and the option to cancel.
  3. A server function verifies the upload with the Cloudinary API before writing an `attachments` row.
  4. The attachment is linked to an entity.
- **Data model:** an `attachments` table holding `public_id`, resource type, format, bytes, width/height, alt text, owner, the entity it's linked to, and created/deleted timestamps.
- **Lifecycle:** deletion removes the asset from Cloudinary, and a scheduled cleanup removes orphans.
- **Reusable UI:** `AttachmentField`/`ImageField` integration (single and multiple, drag and drop, reorder, alt text), an attachment list/gallery, and responsive `<Image>` delivery with Cloudinary transformations (`srcset`, `f_auto`, `q_auto`) and a fixed aspect ratio (no layout shift).
- **Migration:** Test CRUD's Postgres-stored image moves to Cloudinary attachments, and a gallery is added. CSP updated for Cloudinary's upload and delivery hosts.
- **Tests:** signature, verification, permission checks, orphan cleanup and the UI flow (with Cloudinary mocked). Live-verified against a real Cloudinary account if credentials are provided; otherwise the gap is reported.

**Acceptance criteria**
- An admin can upload, reorder, add alt text to and delete images on a Test CRUD item. The public page serves optimized responsive images with no layout shift.
- Uploads without permission, of the wrong type or too large are refused by the server.

### Phase 18: SEO everywhere (Task 22)

**Deliverables**
- An audit of every route's head tags. Every page has a localized title and description; private pages (auth, account, admin, dev) get `noindex`.
- `sitemap.xml` (dynamic: static pages plus published items, with hreflang alternates and `lastmod`) and `robots.txt` (points to the sitemap and disallows admin and API routes), both as server routes.
- JSON-LD:
  - `WebSite` and `Organization` on the home page
  - `BreadcrumbList` wherever breadcrumbs appear
  - an appropriate type for Test CRUD items (`Product` or `Article`)
  - validated against the schema.org types
- A default Open Graph image and per-item OG images (Cloudinary transformation once Phase 17 exists). Twitter cards, `theme-color`, favicon set and web manifest.
- An `seo()` helper extension for JSON-LD and robots. A test runs across every route and asserts title, description, canonical, hreflang and robots rules.

**Acceptance criteria**
- Every indexable page in both locales has a unique title and description, a canonical, hreflang (en, ne, x-default), Open Graph and valid JSON-LD.
- Private pages are `noindex` and are absent from the sitemap.

### Phase 19: Module examples (Task 23)

**Deliverables**
- A dev-only `/dev/examples` index linking one small, real page per module. Each page shows the recommended pattern, and the matching guide links to its source:
  - loader + Query (SSR, no refetch)
  - streaming with `Await`
  - search params + filters
  - route masking
  - forms (simple and with server field errors)
  - DataTable + bulk actions
  - TanStack DB optimistic update and rollback
  - Store preferences
  - permissions (`useCan`, guarded server function)
  - attachments upload
  - SEO head + JSON-LD
  - i18n + Intl formatting
  - error and not-found handling
  - analytics consent and feature flags
- Every example page is SSR'd, has stories or tests where it adds value, and returns 404 in production builds.

**Acceptance criteria**
- Each example page has no axe violations, no console warnings and no layout shift, and is unreachable in production.

### Phase 20: Developer docs, final verification and summary (Task 24)

**Deliverables**
- A root `CLAUDE.md` (the entry point for future AI sessions) covering:
  - the stack and versions
  - commands
  - the folder map
  - golden rules (SSR, i18n, server-only, permissions, reuse)
  - "how to add a feature"
  - where everything lives
  - pitfalls already solved (Windows path length, CSP/Zod jitless, Nitro image route, Start runtime-only server functions)
- `docs/guides/`: architecture, conventions and file structure, routing/data/server functions, search params and masking, forms, tables and filters, RBAC, attachments, SEO, i18n, state (Query/DB/Store), testing (unit, PGlite, Storybook, coverage), observability, security, and deployment. Each guide is short, links to its example page and code, and is kept accurate.
- The README links to the guides.
- A full verification run across every page (the Part 1 review method, extended to the new pages), all gates, and the Part 2 Definition of Done with evidence. The final summary uses the section 6 format.

### Part 2 Definition of Done

- [x] Admin and public pages are built from the shared building blocks. Breadcrumbs appear on every admin page and on public detail pages.
- [x] Every list has URL-driven, SSR'd filters, sorting and pagination; search and pagination work without JS.
- [x] Route masking examples work across reload, back/forward and new tab.
- [x] RBAC: the permission matrix edits role permissions, the server enforces every permission, and the UI reflects them. Escalation tests pass.
- [x] Attachments: Cloudinary signed uploads with server-side verification, permissions, cleanup and responsive delivery with no layout shift.
- [x] SEO: every page has correct head tags. Sitemap, robots and JSON-LD are valid; private pages are noindex.
- [x] A dev-only example page exists for every module, and it returns 404 in production.
- [x] `CLAUDE.md` and `docs/guides/*` are complete and accurate.
- [x] Every page in both locales and themes at 3 widths: no axe violations, no overflow, no console errors or warnings, no hydration warnings, and CLS ≤ 0.01.
- [x] All gates are green with no warnings: typecheck, check, test, test:storybook, build and build-storybook.

---

## 8. Editorial portfolio at /portfolio (static demo data)

A design-studio-style portfolio for a full-stack developer: big type, art direction and a story told in chapters, in both languages, on typed demo data that real data can replace later. The guide is [guides/portfolio.md](guides/portfolio.md); decisions 0105–0109.

### Constraints

- Nothing currently used changes behaviour. The only edits outside the section are additive:
  - the header opt-out (`src/lib/chrome.ts`, `site-header.tsx`)
  - one CSS import in `app.css`
  - "never inline fonts" in `vite.config.ts`
  - sitemap entries and test rows
  - `portfolio_*` messages
  - three font packages
- It follows the app's conventions: SSR loaders with `ensureQueryData` + `useSuspenseQuery`, Paraglide for UI text, `seo()` on every page, strict CSP, and CLS ≤ 0.01.

### Deliverables

- **Routes:** `/portfolio` (hero → manifesto → selected work → capabilities → process → impact → voices → journal → finale), `/portfolio/work` (`?discipline=` filter), `/portfolio/work/$slug`, `/portfolio/about`, `/portfolio/journal`, `/portfolio/journal/$slug`, `/portfolio/contact`, and a 404 in the section's chrome.
- **Content source:** a `PortfolioSource` port with a lazy-loaded fixture adapter, and query options per read.
- **Demo content in en and ne:** a profile, 7 case studies, 6 articles, experience, capabilities, process and testimonials.
- **"Ink & Paper" design system:**
  - scoped tokens, light/dark palettes and inverse bands, plus a fluid type scale and the editorial grid
  - CSS-only motion
  - generated cover and screen art
  - metric-matched fallbacks for every new face
- **Tests and stories:** unit tests (data, source, lib), component tests (header opt-out, menu, marquee, copy email), stories for every primitive and section, route-SEO and sitemap coverage.

### Definition of Done

- [x] No existing page changed: `/`, `/stack`, `/test-crud` and the admin area keep the site header (component test).
- [x] Every portfolio page is server-rendered complete, indexable with JSON-LD, and listed in the sitemap. A filtered work index is noindex.
- [x] Both locales, both themes, at 390/768/1280: no axe violations, no overflow, no console errors (apart from the browser's own line for the intentional 404), no CSP violations, and CLS ≤ 0.01.
- [x] Typecheck, check, test, test:storybook, build and build-storybook are green with no warnings.

---

## 9. Part 3: template hardening (Tasks 25–33)

Part 3 turns the finished app into a base template: it runs its own gates in CI, makes the browser review reproducible, closes the auth and data-integrity gaps a real product needs on day one, and makes starting a new project from it a short, scripted job. It comes from a review of the whole app against current starter kits (Epic Stack, the Better Auth and TanStack Start kits) and the official docs (2026-10-18).

### Part 3 rules (in addition to sections 1 and 7)

- **Core vs recipe:** items marked *(core)* ship in the base. Items marked *(recipe)* ship as a guide section plus a dev example or a script, not as code every project carries. When in doubt, it's a recipe.
- **Research first:** each task checks the current official docs (Better Auth plugins, TanStack Start, React, Vercel, Neon) before writing code, and records every choice in `docs/decisions.md`.
- **Nothing silently changes behaviour:** a change that existing users would notice (2FA enforcement, captcha, conflicts on save) is behind a documented setting or env var, with the default recorded in a decision.
- **Each task ends** with the section 7 gates. From Task 27 on, the browser review is the committed e2e suite, not an outside script.

| Task | Phase | Name |
| --- | --- | --- |
| 25 | 21 | Part 3 plan (this section). Done |
| 26 | 22 | Housekeeping, CI and repo hygiene. Done (decisions 0118–0120) |
| 27 | 23 | Committed e2e and browser-review suite. Done (decision 0121) |
| 28 | 24 | Data integrity and request tracing |
| 29 | 25 | Auth hardening and account lifecycle |
| 30 | 26 | Audit log and admin user management |
| 31 | 27 | Frontend quality: compiler, accessibility, real-user metrics |
| 32 | 28 | Template ergonomics: scaffolder, strip-demo, structure |
| 33 | 29 | Recipes for optional features |

### Phase 22: Housekeeping, CI and repo hygiene (Task 26)

**Deliverables**
- **Dependencies:** remove `cn` (unused third-party package; `cn` comes from `src/lib/utils.ts`) and `date-fns` (not imported; `react-day-picker` brings its own). Remove the `db:push` script: the project is migration-based and `push` changes the schema without a migration.
- **Knip** for unused files, exports and dependencies, configured for the Start, Storybook and Vitest entry points. `pnpm knip` runs in CI and before push.
- **Git hooks with lefthook:** Biome on staged files before commit; typecheck and `knip --dependencies` before push.
- **CI (GitHub Actions):** on every PR and push to `main`, run typecheck, check, knip, test, test:storybook, build and build-storybook, with the pnpm store cached (story tests use the runner's installed Chrome, so there is no browser download). Migrations are checked by applying `drizzle/` to a fresh PGlite/Postgres.
- **Dependency updates:** Dependabot, grouped (TanStack, Storybook, Vitest, Better Auth), with the pinning policy below.
- **Repo files:** `.nvmrc`/`.node-version` matching `engines`, a `LICENSE`, and `package.json` renamed from `portfolio` to the template's name.
- **Decisions:** a version-pinning policy (exact vs caret; today it's mixed), and the reason for running a dated Nitro 3 beta in production, with an upgrade trigger.

**Acceptance criteria**
- A PR with an unused export, an unused dependency, a lint warning or a failing story fails CI.
- `pnpm install && pnpm knip` is clean on `main`.

### Phase 23: Committed e2e and browser-review suite (Task 27)

**Deliverables**
- A Playwright project (`pnpm test:e2e`) that builds and starts a production server (`EMAIL_PROVIDER=resend` with a placeholder key, PGlite or a CI Postgres, `db:seed-demo`).
- **Browser review as code:** every page in en/ne × light/dark × 390/768/1280 is checked for axe violations, horizontal overflow, console errors and warnings, hydration warnings, CSP violations (`securitypolicyviolation` listener) and CLS ≤ 0.01 (a `PerformanceObserver` on `layout-shift`). The page list comes from the route tree, so a new route is reviewed automatically or fails until it's listed.
- **Flows:** sign up → verify email → sign in; sign-in code; password reset; admin creates, edits, publishes and deletes a Test CRUD item; permission matrix grant and revoke; a 403 for a user without a permission; JS-disabled search and pagination.
- Runs in CI (sharded if slow). `docs/guides/testing.md` replaces "the scripts live outside the repo" with how to run and extend the suite.

**Acceptance criteria**
- The section 7 browser review can be run by anyone with one command, locally and in CI.

### Phase 24: Data integrity and request tracing (Task 28)

**Deliverables**
- **Optimistic concurrency** *(core)*: edits send the version they started from (`updatedAt`); the repository updates only when it still matches and otherwise the service throws `CONFLICT`. The shared form shows "changed by someone else" with a reload action. Test CRUD and roles adopt it, and the conventions guide makes it part of the feature recipe.
- **Request IDs** *(core)*: one ID per request, returned as `x-request-id`, attached to every log line, Sentry event and error page (errors already carry `requestId`).
- **Health endpoint** *(core)*: a JSON server route for uptime monitors (`200` with DB latency, `503` when the DB is unreachable, no details leaked). The `/health` page stays as the human view.
- **Idempotency keys** *(recipe)*: a key on create/send actions so a double submit or retry doesn't duplicate rows or emails.

**Acceptance criteria**
- Two sessions editing the same item: the second save is refused with a localized conflict message and no data is lost (PGlite test and e2e).
- A server error's request ID appears in the response header, the log line and the Sentry event.

### Phase 25: Auth hardening and account lifecycle (Task 29)

**Deliverables**
- **Two-factor authentication** *(core)*: Better Auth `twoFactor` (TOTP + backup codes), set up and managed on the account page. A setting requires it for users with any admin permission. Better Auth's second factor only guards password sign-in, so the decision records the policy for email-code and Google sign-in.
- **Breached passwords** *(core)*: Better Auth `haveIBeenPwned` on sign-up, reset and change, with a localized message.
- **Bot protection** *(core)*: Better Auth `captcha` with Cloudflare Turnstile on register, forgot-password and sign-in-code (CSP updated, disabled cleanly when unconfigured), plus a honeypot field in the shared auth forms.
- **Account deletion and data export** *(core)*: delete confirmed by email (Better Auth `deleteUser`), cleaning up sessions and attachments; an export of the user's own data as JSON.
- **Linked accounts** *(core)*: a Google-only user can set a password; link and unlink Google, never leaving an account with no way in.
- **Last login method** and **passkeys** *(recipe)*: Better Auth `lastLoginMethod` and `@better-auth/passkey`.
- Emails for each new flow in both languages; rate limits for each new endpoint in `src/server/auth/auth.ts`.

**Acceptance criteria**
- An admin without 2FA is asked to set it up before entering `/admin` (when the setting is on); a breached password is refused; a deleted account can't sign in and its attachments are queued for cleanup.

### Phase 26: Audit log and admin user management (Task 30)

**Deliverables**
- **Audit log** *(core)*: an `audit_events` table (actor, action, target type and ID, before/after summary, request ID, IP, time), written by services inside the same transaction as the change (role edits, permission matrix saves, role assignments, bans, deletes, Test CRUD publish/delete). An admin list page built from the list contract, filtered by actor, action, target and date, guarded by a new `audit:read` permission.
- **User management** *(core)*: invite or create a user (email invite in both languages), revoke a user's sessions (and on ban), all through `src/functions/rbac.ts` with `requirePermission` (Better Auth's admin endpoints stay disabled, decision 0112).
- **Roles model documented:** `rbac.md` states that Better Auth's `user.role === "admin"` is the superuser flag and the RBAC tables hold everything else, or the flag moves into the RBAC tables; the choice is a decision.
- **Impersonation** *(recipe)*: guarded, audited, with a visible banner and a one-click exit.

**Acceptance criteria**
- Every admin action listed above leaves an audit row with its request ID; an Editor without `audit:read` gets a 403 on the audit page and its server function.

### Phase 27: Frontend quality (Task 31)

**Deliverables**
- **React Compiler** *(core, measured)*: `@rolldown/plugin-babel` with `reactCompilerPreset()` (React's docs for `@vitejs/plugin-react` 6+). Record build-time and bundle impact; remove manual memoization only where the compiler covers it.
- **Accessibility in the main app** *(core)*: a skip-to-content link in the shared layouts, and `prefers-reduced-motion` handling in `app.css` (the portfolio already has it).
- **Real-user Web Vitals** *(core)*: CLS, LCP and INP from visitors, sent to PostHog (respecting consent) or Sentry, so the CLS ≤ 0.01 rule is checked in production, not only locally.
- **CSP reporting** *(core)*: `report-to` with violations forwarded to Sentry, rate-limited.
- **Admin view transitions** and an **admin command palette** (`cmdk`, permission-filtered) *(recipe)*.

**Acceptance criteria**
- The compiler decision has before/after numbers; skip link and reduced motion pass the e2e suite; a forced CSP violation in a preview deploy shows up in Sentry.

### Phase 28: Template ergonomics (Task 32)

**Deliverables**
- **Feature scaffolder** *(core)*: `pnpm new:feature <name>` generates the Test CRUD shape (table, schema, repository + service with PGlite tests, permissions, guarded functions and their guarded-functions test entry, queries, admin routes, messages in both languages, sidebar link, stories). The generated feature passes every gate unchanged.
- **Strip the demo** *(core)*: a documented "starting a new project" checklist plus `scripts/strip-demo.mjs` that removes the portfolio, `/stack` and the Intl showcase (with their messages, sitemap entries and tests) and keeps Test CRUD and `/dev/examples` as references. The home page becomes a neutral landing.
- **Thin routes:** `_authed/account.tsx` and `admin/test-crud/index.tsx` move their UI into `src/features/<name>/components`, so the reference feature matches the conventions it teaches.
- **Docs:** CLAUDE.md's pitfalls split into "always relevant" and "per area" (the rest move into the guides); `src/lib` grouped by area (`list/`, `seo/`, `env/`) *(recipe)*.

**Acceptance criteria**
- A fresh clone → strip-demo → new:feature → all gates green, with no manual edits.

### Phase 29: Recipes for optional features (Task 33)

Each recipe is a guide section with a dev example or script, decided and documented, not shipped in every project:
- **Background jobs:** Vercel Workflow, Inngest or Trigger.dev (no long-running worker on Vercel), with retries; bulk email moves off the request.
- **Cursor pagination** in `src/server/db/list.ts` for large tables and feeds, next to the offset default.
- **Caching public pages:** `s-maxage`/`stale-while-revalidate` headers or prerendering for static content such as `/portfolio`.
- **Rate limiting server functions** with database storage, for public endpoints.
- **Contact form** (Resend, rate limit, Turnstile) for the portfolio.
- **Avatar upload** on the account page, through attachments.
- **CSV export** from `DataTable`; **soft delete** with undo toasts; **saved list views** (stored search strings).
- **Offline development:** mocks so `pnpm dev` runs without Cloudinary, Resend, PostHog or Sentry keys.
- **Preview deploys** with a Neon branch per PR and migrations applied automatically.
- **Changelog** with changesets or a conventional-commit check.
- **Organizations and billing** (Better Auth `organization` and Stripe plugins), as a recipe only: multi-tenancy stays a non-goal of the base.

### Part 3 Definition of Done

- [ ] CI runs every gate, knip and the e2e suite on each PR; hooks run Biome and knip locally.
- [ ] The browser review is a committed suite covering every route in both locales, both themes and three widths.
- [ ] Concurrent edits are refused with a conflict message; request IDs link responses, logs and Sentry; a JSON health endpoint exists.
- [ ] 2FA, breached-password checks, captcha, account deletion/export and linked accounts work in both languages.
- [ ] Admin actions are audited and viewable; admins can invite users and revoke their sessions.
- [ ] React Compiler decided with numbers; skip link, reduced motion, Web Vitals and CSP reporting in place.
- [ ] Clone → strip-demo → new:feature → green gates, with no manual edits.
- [ ] Every recipe has a guide section and a working example or script.
- [ ] All gates are green with no warnings: typecheck, check, knip, test, test:storybook, test:e2e, build and build-storybook.
