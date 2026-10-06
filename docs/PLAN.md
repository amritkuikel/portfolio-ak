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
│   ├── not-installed.mjs        # stub for tools added in later phases
│   └── seed-admin.mjs           # creates the first admin user (wraps Better Auth create-admin)
├── .storybook/                  # Storybook config, decorators (locale, theme)
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
│   │   ├── test-crud/           # repository.ts (Drizzle queries, injectable db), image.ts (signature checks)
│   │   ├── routes/              # Nitro routes (images.ts: GET /api/images/:id), registered in vite.config.ts
│   │   ├── analytics/           # posthog-node wrapper
│   │   └── plugins/             # Nitro plugins run at boot (validate-env.ts)
│   ├── middleware/              # Start middleware (isomorphic; outside src/server so start.ts can import it):
│   │                            #   csrf, logging, errors (normalisation), auth (session/user/admin guards)
│   ├── functions/               # createServerFn definitions, grouped by feature
│   │   ├── health.ts
│   │   ├── dev.ts               # dev-only helpers (rich-text sanitize preview; refuses in production)
│   │   ├── test-crud.ts         # admin server functions (all behind requireAdminMiddleware)
│   │   └── test-crud-public.ts  # public reads: published items only, drafts are NOT_FOUND
│   ├── features/
│   │   ├── auth/                # auth UI, error mapping, validation, session queries
│   │   ├── dev/                 # dev-only pages (forms showcase)
│   │   └── test-crud/           # constants, schema.ts (shared Zod + DTOs), queries, collection (TanStack DB), components/
│   ├── components/
│   │   ├── errors/              # error, not-found and pending pages
│   │   ├── ui/                  # shadcn/ui primitives
│   │   ├── layout/              # header, footer, admin sidebar, language switcher, theme toggle
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
│   │   ├── stores/              # TanStack Store: theme, sidebar, table prefs (cookie-backed, one store per router)
│   │   ├── db.ts                # TanStack DB client per request + queryClientOf() for query collections
│   │   ├── analytics.ts         # posthog-js wrapper with consent
│   │   ├── fonts.ts             # font preload links
│   │   └── utils.ts             # cn() and small helpers
│   ├── paraglide/               # GENERATED by the Paraglide Vite plugin (gitignored)
│   ├── routeTree.gen.ts         # GENERATED by the Start Vite plugin (committed)
│   ├── styles/
│   │   └── app.css              # Tailwind entry, tokens, light/dark themes, fonts
│   ├── router.tsx               # createRouter, context, Query + DB SSR integrations, preferences store, i18n rewrite
│   ├── server.ts                # server entry, Paraglide middleware
│   └── start.ts                 # createStart: global function middleware
├── tests/
│   ├── setup/                   # env.ts (baseline env), dom.ts (jest-dom, cleanup, jsdom polyfills)
│   ├── unit/                    # schemas, validation, intl, env, provider selection
│   ├── components/              # every form field (forms/harness.tsx), layout components
│   ├── server/                  # server functions, guards, auth/admin rejection
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

Each item must be verified with evidence such as command output, a test name or a described manual check. Nothing is assumed.

**Rendering & SSR**
- [ ] All public pages render complete, readable content with JavaScript disabled.
- [ ] No hydration warnings in the browser console on any page, in either locale or theme.
- [ ] The streaming example works.

**Internationalisation**
- [ ] `en` and `ne` message files have identical keys (test passes).
- [ ] No hardcoded user-facing strings in UI, emails, validation or meta.
- [ ] `<html lang>`, canonical and `hreflang` tags are correct per locale.
- [ ] Dates, numbers, NPR currency and relative times format per locale.
- [ ] Devanagari renders correctly with no font-swap layout shift.

**Theming & UX**
- [ ] Light, dark and system themes work with no flash on load.
- [ ] Every page is usable at mobile, tablet and desktop widths.

**Accessibility**
- [ ] The Storybook a11y addon reports no violations on any story.
- [ ] Every form field has a label, description, `aria-invalid`, `aria-describedby` and error text.
- [ ] Keyboard navigation and visible focus work on all interactive elements. FormErrorSummary receives focus on a failed submit.

**Security**
- [ ] No secrets or server-only modules in the client bundle (boundary test passes and a build output search is clean).
- [ ] Admin server functions reject non-admins on the server.
- [ ] Auth endpoints are rate limited.
- [ ] Rich text is sanitized before storage and on render.
- [ ] Security headers are present on production responses, and the CSP allows only required origins.
- [ ] Dev-only routes (email preview, form showcase) are unreachable in production.

**Observability**
- [ ] Sentry and PostHog no-op cleanly when keys are absent.
- [ ] No analytics before consent.

**Quality gates**
- [ ] `pnpm typecheck`, `pnpm check`, `pnpm test`, `pnpm build` and `pnpm build-storybook` are all green with no warnings.
- [ ] No `any`, no `@ts-ignore`, no unexplained lint suppressions (verified by search).
- [ ] Migrations are committed and apply cleanly to an empty database.
- [ ] README and `docs/decisions.md` are complete and accurate.

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
