# Decisions

Record every non-obvious choice here: **What**, **Why**, **Alternatives considered**. Newest entries at the bottom.

<details>
<summary>Index (99 entries)</summary>

- [0001](#0001-project-has-its-own-git-repository): Project has its own git repository
- [0002](#0002-default-deployment-target-is-vercel-assumption): Default deployment target is Vercel (assumption)
- [0003](#0003-scaffold-with-the-official-tanstack-cli-biome-vercel-shadcn-add-ons): Scaffold with the official TanStack CLI (Biome, Vercel, shadcn add-ons)
- [0004](#0004-nitro-is-the-server-build-the-vercel-preset-is-auto-detected): Nitro is the server build; the Vercel preset is auto-detected
- [0005](#0005-only-use-client-warnings-from-dependencies-are-filtered-in-the-nitro-build): Only "use client" warnings from dependencies are filtered in the Nitro build
- [0006](#0006-import-alias-is-not-the-starters): Import alias is `@/`, not the starter's `#/`
- [0007](#0007-self-hosted-fonts-with-preloads-and-metric-matched-fallbacks): Self-hosted fonts with preloads and metric-matched fallbacks
- [0008](#0008-next-themes-removed-from-the-shadcn-sonner-component): `next-themes` removed from the shadcn Sonner component
- [0009](#0009-tanstack-router-cli-removed-the-route-tree-is-committed): TanStack router CLI removed; the route tree is committed
- [0010](#0010-prettier-remains-only-as-a-transitive-dependency): Prettier remains only as a transitive dependency
- [0011](#0011-when-and-where-env-is-validated): When and where env is validated
- [0012](#0012-client-schema-lives-in-its-own-file-client-env-files-avoid-the-client-name): Client schema lives in its own file; client env files avoid the `*.client.*` name
- [0013](#0013-three-layers-keep-server-only-code-off-the-client): Three layers keep server-only code off the client
- [0014](#0014-env-validation-details): Env validation details
- [0015](#0015-neon-driver-is-node-postgres-tcp-with-a-small-pool-and-attachdatabasepool): Neon driver is node-postgres (TCP) with a small pool and `attachDatabasePool`
- [0016](#0016-drizzle-stable-045x-not-the-10-release-candidate): Drizzle stable 0.45.x, not the 1.0 release candidate
- [0017](#0017-sslmoderequire-is-rewritten-to-verify-full): `sslmode=require` is rewritten to `verify-full`
- [0018](#0018-migrations-use-the-direct-url-and-start-from-an-empty-baseline): Migrations use the direct URL and start from an empty baseline
- [0019](#0019-the-health-check-hides-failure-details-from-clients): The health check hides failure details from clients
- [0020](#0020-paraglide-follows-the-official-tanstack-start-example-options-live-in-paraglideconfigts): Paraglide follows the official TanStack Start example; options live in `paraglide.config.ts`
- [0021](#0021-locale-strategy-is-url-only-for-pages-english-unprefixed-nepali-under-ne): Locale strategy is URL-only for pages; English unprefixed, Nepali under `/ne`
- [0022](#0022-server-functions-receive-the-page-locale-in-a-header): Server functions receive the page locale in a header
- [0023](#0023-the-language-switcher-uses-plain-links-to-localized-urls): The language switcher uses plain links to localized URLs
- [0024](#0024-nepali-formatting-never-uses-icu-ne-data): Nepali formatting never uses ICU `ne` data
- [0025](#0025-dates-render-in-a-fixed-app-time-zone-relative-time-takes-an-explicit-now): Dates render in a fixed app time zone; relative time takes an explicit `now`
- [0026](#0026-devanagari-font-preloads-only-on-nepali-pages-no-preloads-in-dev): Devanagari font preloads only on Nepali pages; no preloads in dev
- [0027](#0027-react-is-split-into-its-own-client-chunk): React is split into its own client chunk
- [0028](#0028-how-no-hydration-warnings-was-verified): How "no hydration warnings" was verified
- [0029](#0029-windows-checkouts-need-a-short-path): Windows checkouts need a short path
- [0030](#0030-tanstack-query-via-the-official-ssr-integration-with-a-60-second-staletime): TanStack Query via the official SSR integration, with a 60-second `staleTime`
- [0031](#0031-one-apperror-shape-normalised-by-middleware-and-serialised-with-an-adapter): One `AppError` shape, normalised by middleware and serialised with an adapter
- [0032](#0032-zodinput-instead-of-passing-zod-schemas-straight-to-inputvalidator): `zodInput()` instead of passing Zod schemas straight to `inputValidator`
- [0033](#0033-middleware-lives-in-srcmiddleware-not-srcservermiddleware): Middleware lives in `src/middleware/`, not `src/server/middleware/`
- [0034](#0034-csrf-protection-for-server-functions): CSRF protection for server functions
- [0035](#0035-layout-routes-guards-and-the-session-slot): Layout routes, guards and the session slot
- [0036](#0036-stack-is-the-phase-5-reference-page): `/stack` is the Phase 5 reference page
- [0037](#0037-email-provider-selection-and-fail-fast-in-production): Email provider selection and fail-fast in production
- [0038](#0038-react-email-6-rendered-in-an-explicit-locale): React Email 6, rendered in an explicit locale
- [0039](#0039-the-email-preview-is-a-vite-dev-server-middleware-not-an-app-route): The email preview is a Vite dev-server middleware, not an app route
- [0040](#0040-better-auth-configuration): Better Auth configuration
- [0041](#0041-auth-emails-are-sent-in-the-users-language-in-the-background): Auth emails are sent in the user's language, in the background
- [0042](#0042-email-change-notice-to-the-old-address): Email-change notice to the old address
- [0043](#0043-session-in-the-router-context-via-tanstack-query-admin-checked-on-the-server): Session in the router context via TanStack Query; admin checked on the server
- [0044](#0044-apperror-status-codes-survive-ssr): AppError status codes survive SSR
- [0045](#0045-rate-limits-keyed-by-a-trusted-client-ip): Rate limits keyed by a trusted client IP
- [0046](#0046-auth-pages-and-placement): Auth pages and placement
- [0047](#0047-the-admin-seed-wraps-better-auths-create-admin): The admin seed wraps Better Auth's `create-admin`
- [0048](#0048-better-auths-env-name-appears-in-the-client-bundle): Better Auth's env *name* appears in the client bundle
- [0049](#0049-local-e2e-database-must-be-utf-8): Local e2e database must be UTF-8
- [0050](#0050-form-system-built-on-tanstack-form-composition-and-shadcn-field): Form system built on TanStack Form composition and shadcn Field
- [0051](#0051-when-errors-appear-and-formvalidators): When errors appear, and `formValidators()`
- [0052](#0052-formerrorsummary-focuses-itself-submitbutton-never-blocks): FormErrorSummary focuses itself; SubmitButton never blocks
- [0053](#0053-validation-helpers-return-localized-messages-at-validation-time): Validation helpers return localized messages at validation time
- [0054](#0054-number-and-currency-inputs-keep-a-draft-string): Number and currency inputs keep a draft string
- [0055](#0055-local-changes-to-shadcn-components): Local changes to shadcn components
- [0056](#0056-component-tests-run-in-jsdom-with-a-shared-harness): Component tests run in jsdom with a shared harness
- [0057](#0057-phone-numbers-are-stored-as-e164-with-a-separate-country-picker): Phone numbers are stored as E.164 with a separate country picker
- [0058](#0058-date-fields-store-calendar-dates-as-strings): Date fields store calendar dates as strings
- [0059](#0059-rich-text-loads-only-in-the-browser-behind-a-placeholder-of-the-same-size): Rich text loads only in the browser, behind a placeholder of the same size
- [0060](#0060-sanitizing-rich-text-on-the-server-with-a-safehtml-brand): Sanitizing rich text on the server, with a SafeHtml brand
- [0061](#0061-the-dev-only-showcase-is-a-real-route-dropped-from-production-builds): The dev-only showcase is a real route, dropped from production builds
- [0062](#0062-file-fields-use-the-native-input-plus-drag-and-drop-and-validate-in-the-schema): File fields use the native input plus drag-and-drop, and validate in the schema
- [0063](#0063-mustaccept-takes-a-boolean-input): `mustAccept()` takes a boolean input
- [0064](#0064-when-to-use-tanstack-db-query-or-store-and-the-rest): When to use TanStack DB, Query or Store, and the rest
- [0065](#0065-preferences-live-in-cookies-with-one-store-per-router): Preferences live in cookies, with one store per router
- [0066](#0066-tanstack-db-uses-the-official-router-integration-and-has-its-own-chunk): TanStack DB uses the official router integration and has its own chunk
- [0067](#0067-uploaded-images-are-stored-in-postgres-and-served-by-a-nitro-route): Uploaded images are stored in Postgres and served by a Nitro route
- [0068](#0068-the-admin-list-is-url-driven-query-owns-ssr-and-a-db-collection-owns-optimism): The admin list is URL-driven; Query owns SSR and a DB collection owns optimism
- [0069](#0069-server-functions-use-validator-and-report-field-errors-the-form-can-show): Server functions use `.validator()` and report field errors the form can show
- [0070](#0070-testing-data-access-against-pglite-and-how-admin-only-access-is-verified): Testing data access against PGlite, and how admin-only access is verified
- [0071](#0071-seo-tags-come-from-one-helper-and-a-required-vitesiteurl): SEO tags come from one helper and a required `VITE_SITE_URL`
- [0072](#0072-public-reads-are-a-separate-published-only-path): Public reads are a separate, published-only path
- [0073](#0073-sentry-via-sentrytanstackstart-react-1140-beta-pinned-off-without-a-dsn): Sentry via `@sentry/tanstackstart-react` 11.4.0 (beta, pinned), off without a DSN
- [0074](#0074-posthog-is-opt-in-consent-is-a-cookie-and-posthog-js-loads-only-after-yes): PostHog is opt-in; consent is a cookie, and posthog-js loads only after "yes"
- [0075](#0075-feature-flags-are-evaluated-on-the-server-and-shipped-with-the-page): Feature flags are evaluated on the server and shipped with the page
- [0076](#0076-csp-and-ad-blockers-deferred-to-task-16): CSP and ad blockers (deferred to Task 16)
- [0077](#0077-storybook-has-its-own-vite-config-and-replaces-server-modules-wholesale): Storybook has its own Vite config and replaces server modules wholesale
- [0078](#0078-stories-are-tests-two-browser-passes-a11y-violations-fail): Stories are tests: two browser passes, a11y violations fail
- [0079](#0079-accessibility-fixes-found-by-the-stories): Accessibility fixes found by the stories
- [0080](#0080-server-function-logic-lives-in-plain-functions-coverage-is-reported-per-area): Server-function logic lives in plain functions; coverage is reported per area
- [0081](#0081-security-headers-static-headers-via-nitro-a-per-request-csp-nonce-via-start-middleware): Security headers: static headers via Nitro, a per-request CSP nonce via Start middleware
- [0082](#0082-final-review-fixes-accessibility-responsiveness-layout-stability): Final review fixes (accessibility, responsiveness, layout stability)

- [0083](#0083-breadcrumbs-come-from-route-staticdata-labels-resolved-at-render-time): Breadcrumbs come from route `staticData`, labels resolved at render time
- [0084](#0084-one-list-contract-shared-by-url-server-function-and-repository): One list contract, shared by URL, server function and repository
- [0085](#0085-reusable-page-building-blocks-feature-code-is-columns-filters-and-actions): Reusable page building blocks; feature code is columns, filters and actions
- [0086](#0086-zod-resolves-to-a-configured-module-jitless-before-any-schema-exists): `zod` resolves to a configured module (jitless before any schema exists)
- [0087](#0087-story-tests-need-no-setup-file-unused-messages-fail-the-build): Story tests need no setup file; unused messages fail the build
- [0088](#0088-filters-are-one-get-form-of-native-controls-arrays-are-repeated-keys): Filters are one GET form of native controls; arrays are repeated keys
- [0089](#0089-search-driven-lists-keep-showing-results-while-new-ones-load): Search-driven lists keep showing results while new ones load
- [0090](#0090-the-admin-guard-checks-the-server-when-entering-the-area-not-on-every-inner-navigation): The admin guard checks the server when entering the area, not on every inner navigation
- [0091](#0091-route-masking-for-the-edit-dialog-and-quick-view-masked-links-always-unmask-on-reload): Route masking for the edit dialog and quick view; masked links always unmask on reload
- [0092](#0092-path-params-are-validated-by-the-route-paramsparse-not-in-loaders): Path params are validated by the route (`params.parse`), not in loaders
- [0093](#0093-date-filters-are-calendar-days-in-the-app-time-zone-compared-as-instants): Date filters are calendar days in the app time zone, compared as instants
- [0094](#0094-roles-and-permissions-live-in-app-tables-better-auth-keeps-identity-sessions-and-the-admin-flag): Roles and permissions live in app tables; Better Auth keeps identity, sessions and the admin flag
- [0095](#0095-every-server-function-names-its-permission-pages-guard-by-permission-the-ui-only-hides): Every server function names its permission; pages guard by permission; the UI only hides
- [0096](#0096-rules-against-self-escalation-and-lockout): Rules against self-escalation and lockout
- [0097](#0097-the-permission-matrix-saves-each-change-optimistically-and-rolls-back-on-refusal): The permission matrix saves each change optimistically and rolls back on refusal
- [0098](#0098-attachments-signed-direct-uploads-to-cloudinary-verified-on-the-server): Attachments: signed direct uploads to Cloudinary, verified on the server
- [0099](#0099-the-image-editor-is-a-feature-field-concurrent-uploads-append-atomically): The image editor is a feature field; concurrent uploads append atomically
- [0100](#0100-every-page-is-indexable-through-seo-or-private-through-noindex-a-test-checks-every-route): Every page is indexable through seo() or private through noindex; a test checks every route
- [0101](#0101-the-sitemap-robotstxt-and-manifest-are-start-server-routes-built-from-the-same-data-as-the-pages): The sitemap, robots.txt and manifest are Start server routes built from the same data as the pages
- [0102](#0102-json-ld-is-typed-with-schema-dts-and-emitted-through-route-heads-items-are-products): JSON-LD is typed with schema-dts and emitted through route heads; items are Products
- [0103](#0103-module-examples-are-dev-only-routes-over-in-memory-data-guarded-by-one-layout): Module examples are dev-only routes over in-memory data, guarded by one layout
- [0104](#0104-forms-handled-in-javascript-use-methodpost): Forms handled in JavaScript use `method="post"`
</details>

---

## 0001: Project has its own git repository

- **What:** `git init` inside the project folder instead of committing to the enclosing repository.
- **Why:** The only enclosing repository was rooted at `C:\` and tracks the whole drive. Project history must be isolated and pushable on its own.
- **Alternatives considered:** Committing to the drive-level repository (rejected: pollutes an unrelated repo and risks leaking unrelated files).

## 0002: Default deployment target is Vercel (assumption)

- **What:** The plan assumes a Node-compatible serverless host (Vercel) using TanStack Start's official hosting adapter.
- **Why:** The Neon driver choice (Phase 3) and the security-header mechanism (Phase 12) depend on the runtime. A default avoids blocking.
- **Alternatives considered:** Long-running Node server, Netlify, Cloudflare Workers. Revisit before Phase 3 if the target differs.

## 0003: Scaffold with the official TanStack CLI (Biome, Vercel, shadcn add-ons)

- **What:** `@tanstack/cli create --toolchain biome --deployment vercel --add-ons shadcn --no-examples`. Only Phase 1 add-ons were selected. The `.cta.json` file is kept so later phases can use `tanstack add` for official add-ons.
- **Why:** This is the starter the TanStack Start docs point to. It wires the Start, Tailwind v4 and Nitro Vite plugins the officially supported way.
- **Alternatives considered:** Cloning `examples/react/start-basic` with gitpick (no Biome, Tailwind or deploy adapter). `shadcn init -t start` (a different starter with its own conventions).

## 0004: Nitro is the server build; the Vercel preset is auto-detected

- **What:** The Vercel add-on uses `nitro/vite` plus `vercel.json`. Local builds use Nitro's `node-server` preset, and `pnpm start` runs `.output/server/index.mjs`. On Vercel, Nitro switches to its Vercel preset automatically.
- **Why:** This is the adapter the official CLI generates for Vercel. `nitro` is pinned to the exact beta version the CLI chose, because beta versions can break between releases.
- **Alternatives considered:** Hardcoding `preset: "vercel"`, which would break the local `pnpm start`.

## 0005: Only "use client" warnings from dependencies are filtered in the Nitro build

- **What:** `vite.config.ts` gives Nitro an `onwarn` handler. It drops only `MODULE_LEVEL_DIRECTIVE` warnings about `"use client"` in `node_modules`. Nitro's default ignore list is re-applied, because a custom handler replaces it.
- **Why:** `@tanstack/react-router` and `sonner` ship `"use client"` for React Server Component frameworks. The directive has no meaning in this app. `@vitejs/plugin-react` already silences it for the client and SSR builds, but Nitro's separate Rolldown pass does not. The warnings come from upstream packages, so they can't be fixed in this repo.
- **Alternatives considered:** Ignoring all `MODULE_LEVEL_DIRECTIVE` warnings (too broad, would hide directives in our own code). Living with 21 warnings per build.

## 0006: Import alias is `@/`, not the starter's `#/`

- **What:** `@/*` maps to `src/*` through tsconfig `paths`, resolved by Vite's `resolve.tsconfigPaths`. The starter's `#/*` Node subpath import was removed.
- **Why:** `@/` is shadcn's documented default and has one source of truth. Two aliases for the same folder invite inconsistency. The shadcn CLI (4.21.0) emits a bare `"cn"` import for either alias, which is fixed by hand and noted in the README.
- **Alternatives considered:** Keeping `#/` (native, but non-standard for shadcn and other tooling).

## 0007: Self-hosted fonts with preloads and metric-matched fallbacks

- **What:** Inter Variable (Latin) and Noto Sans Devanagari Variable come from Fontsource packages imported in `app.css`. The Inter Latin subset and the Noto Devanagari subset are preloaded, with `crossorigin` set, from `src/lib/fonts.ts`. Other subsets load on demand through `unicode-range`. `font-display: swap` comes from Fontsource. The fallback faces keep line boxes stable during the swap. `Inter Fallback` is Arial with size, ascent and descent overrides. `Noto Sans Devanagari Fallback` uses system Devanagari fonts with Noto's vertical metrics.
- **Why:** Self-hosting avoids a third-party request, is privacy-friendly, and keeps the Phase 12 CSP simple. The preload `?url` imports resolve to the same hashed files the CSS uses, so nothing downloads twice (verified in the network log). Inter overrides are computed with `@capsizecss/metrics` and match next/font's published values. Devanagari `size-adjust` stays at 100% because no system-font width metrics exist to compute it from. Measured layout shift is 0 on the home page on a throttled network.
- **Alternatives considered:** A Google Fonts `@import` (the starter's approach: render-blocking, third-party, not preloadable by hash). `font-display: optional` (no shift, but the web font often never shows on a first visit). The Fontaine plugin (an extra build dependency for two fonts).
- **Follow-up (Phase 4):** Preload the Devanagari subset only on `ne` pages, so English pages don't download 121 kB they may not use.

## 0008: `next-themes` removed from the shadcn Sonner component

- **What:** `Toaster` takes a `theme` prop, defaulting to `"system"`, instead of calling `useTheme()` from `next-themes`.
- **Why:** Theme state belongs to the TanStack Store theme in Phase 8. `next-themes` is Next.js-oriented and would be a second source of truth.
- **Alternatives considered:** Keeping `next-themes` until Phase 8 (dependency churn).

## 0009: TanStack router CLI removed; the route tree is committed

- **What:** `@tanstack/router-cli` was dropped. The Start Vite plugin regenerates `src/routeTree.gen.ts` on `dev` and `build`. The file is committed so `pnpm typecheck` works on a fresh clone.
- **Why:** The CLI printed a Node circular-dependency warning on every run, and the Vite plugin already does its job.
- **Alternatives considered:** Running `tsr generate` before `tsc` (duplicate work, plus the warning).

## 0010: Prettier remains only as a transitive dependency

- **What:** Prettier is installed only because `@tanstack/router-generator` uses it internally to format the generated route tree. There is no Prettier config, no script, and no direct dependency.
- **Why:** It is an internal detail of TanStack's generator and can't be removed without forking it. Biome is the project's only formatter and linter.

## 0011: When and where env is validated

- **What:**
  - `vite.config.ts` loads `.env` files and validates the client schema on `dev` and `build`, and the server schema on `dev` only.
  - In production, a Nitro plugin (`src/server/plugins/validate-env.ts`) validates the server env when the server boots.
  - `pnpm start` loads `.env` with Node's `--env-file-if-exists`.
- **Why:**
  - `VITE_` values are inlined at build time, so a bad one must stop the build.
  - Server values are runtime config. Requiring production secrets at build time would couple CI to secrets for no benefit.
  - TanStack Start's SSR handler is loaded lazily on the first request, so validating inside it wouldn't fail at startup. A Nitro plugin runs at boot, and on Vercel at cold start.
  - Real environment variables take precedence over `.env` files, matching Vite.
- **Alternatives considered:**
  - A custom `src/server.ts` entry that imports the env. It only runs on the first request (verified).
  - Validating server env during `build` (forces secrets into CI).
  - Reading env per request, as TanStack's docs suggest for edge runtimes. Not needed on Node/Vercel. Revisit if the deploy target moves to Cloudflare.

## 0012: Client schema lives in its own file; client env files avoid the `*.client.*` name

- **What:**
  - `src/lib/client-env.schema.ts` holds the schema and a `createClientEnv` factory.
  - `src/lib/client-env.ts` holds the instance built from `import.meta.env`.
  - The server env is a single file, `src/server/env.ts`.
- **Why:**
  - `import.meta.env` doesn't exist while Vite loads its config, so the config imports the schema file, not the instance.
  - TanStack Start's import protection denies `**/*.client.*` files on the server. The plan's original name, `env.client.ts`, broke the SSR build.
  - Env files use relative imports with `.ts` extensions because `vite.config.ts` imports them and Vite's upcoming native config loader requires explicit extensions. It currently warns without them.
- **Alternatives considered:**
  - A `process.env` fallback inside the client module (leaves `process.env` references in the browser bundle).
  - Duplicating the schema in the config.

## 0013: Three layers keep server-only code off the client

- **What:**
  - **Build:** TanStack Start import protection, with `client.files` set to `**/*.server.*` and `**/src/server/**`. `files` replaces the defaults, so the default `*.server.*` rule is restated. `src/server/env.ts` also carries the `@tanstack/react-start/server-only` marker.
  - **Runtime:** `src/server/env.ts` throws if evaluated where `window` exists. T3 Env's own proxy would also throw on any server-variable access in a browser.
  - **Test:** A static scan (`tests/utils/import-boundary.ts`) fails if any file outside `src/server/` and `src/functions/` imports `src/server/`. Fixtures prove it detects direct, relative, dynamic and re-export imports.
- **Why:** Import protection is the official mechanism and fails production builds, but only warns in dev. The test catches violations in CI without a full build and documents the rule. Both were verified by adding a real violation to a route: the test failed and the build failed with "Import denied in client environment".
- **Alternatives considered:** Only T3 Env's runtime proxy (catches access, not bundling). Running a full Vite build inside Vitest (slow and brittle).

## 0014: Env validation details

- **What:**
  - `emptyStringAsUndefined` is on, so blank lines in `.env` count as missing.
  - `DATABASE_URL` must use the `postgres` or `postgresql` scheme.
  - `EMAIL_FROM` accepts either `a@b.co` or `Name <a@b.co>`.
  - `RESEND_API_KEY` must start with `re_`, and `createFinalSchema` requires it when `EMAIL_PROVIDER=resend`.
  - `EMAIL_PROVIDER` is optional for now. Phase 6 defines the dev and production defaults.
  - Error messages list every invalid variable by name and never include values.
- **Why:** These give clear, actionable startup errors without leaking secrets into logs.
- **Alternatives considered:** Making `EMAIL_PROVIDER` required now (it would pre-empt Phase 6's selection rules).

## 0015: Neon driver is node-postgres (TCP) with a small pool and `attachDatabasePool`

- **What:**
  - `drizzle-orm/node-postgres` with a `pg` `Pool` (max 5, 10 s idle timeout), connected to Neon's pooled (`-pooler`) connection string.
  - `attachDatabasePool` from `@vercel/functions` is registered on the pool.
  - In dev, one pool is cached on `globalThis` so hot reloads don't leak pools.
- **Why:**
  - Neon's current "choose a connection method" guidance recommends TCP with `pg` for Vercel Fluid compute, which is the deploy target (decision 0002), and for long-running Node servers. Warm instances reuse TCP connections, so later queries skip connection setup.
  - `attachDatabasePool` keeps the function alive until idle connections close before Vercel suspends it. Outside Vercel it is a no-op (verified in its source).
  - Neon's PgBouncer does the real pooling, so the client pool stays small.
  - TCP also supports interactive transactions, which Better Auth and Test CRUD may need.
- **Alternatives considered:**
  - `neon-http`: fastest for one-shot queries, but no interactive transactions. Neon now positions it for edge runtimes where TCP isn't available.
  - `neon-serverless` over WebSocket: supports transactions, but needs `ws` and gives no benefit over TCP on Node.
  - `postgres.js`: also recommended, but Neon's Vercel example and `attachDatabasePool`'s pg support make `pg` the most documented path.
- **Revisit if:** The deploy target moves to Cloudflare Workers or another edge runtime. Switch to `neon-http` or `neon-serverless` there.

## 0016: Drizzle stable 0.45.x, not the 1.0 release candidate

- **What:** `drizzle-orm@0.45` and `drizzle-kit@0.31` (npm `latest`).
- **Why:** Drizzle's Neon docs show `drizzle-orm@rc` (1.0.0-rc). Better Auth's Drizzle adapter (Phase 6) and TanStack DB integrations target the stable line, and an RC can change APIs before GA.
- **Alternatives considered:** 1.0 RC (newer relational query API, higher churn risk). Revisit when 1.0 is published as `latest`.

## 0017: `sslmode=require` is rewritten to `verify-full`

- **What:** `withVerifiedSsl()` (`src/server/db/connection-string.ts`) rewrites `sslmode=prefer`, `require` and `verify-ca` to `verify-full`, unless `uselibpqcompat` is set. It runs for both the app pool and drizzle-kit.
- **Why:**
  - Neon's connection strings use `sslmode=require`. pg 8 already treats that as `verify-full`, but prints a "SECURITY WARNING" at runtime. The project rule is no warnings.
  - pg 9 will switch `require` to libpq semantics, which don't verify the certificate.
  - The rewrite keeps today's certificate-verifying behavior, silences the warning (verified) and survives the upgrade. Neon uses publicly trusted certificates, so `verify-full` works without extra configuration.
- **Alternatives considered:**
  - Asking users to edit the URL, or rejecting `require` in validation (friction with Neon's copy-paste string).
  - `uselibpqcompat=true&sslmode=require` (weaker: no certificate verification).

## 0018: Migrations use the direct URL and start from an empty baseline

- **What:**
  - drizzle-kit connects with `DATABASE_URL_UNPOOLED` when set (Vercel's Neon integration provides it), otherwise `DATABASE_URL`.
  - `drizzle.config.ts` loads `.env` itself and validates only the two URLs.
  - `drizzle/0000_init.sql` is an empty baseline (`SELECT 1`).
  - The schema uses `casing: "snake_case"`.
- **Why:**
  - Neon recommends direct connections for schema changes. PgBouncer's transaction mode can break DDL and session-level locks.
  - Validating only the URLs lets a CI migrate step run without app secrets such as email keys.
  - The baseline gives `db:migrate` a journal to apply before the first real table exists, so the pipeline is proven end to end.
  - With `snake_case` casing, TypeScript keys stay camelCase while columns stay snake_case, without naming every column twice.
- **Alternatives considered:** Deferring `db:migrate` until Phase 6 (the script would be untested). `db:push` only (no migration history for production).

## 0019: The health check hides failure details from clients

- **What:**
  - `checkDatabaseHealth()` (`src/server/db/health.ts`) runs `select 1` and returns `{ status, latencyMs, checkedAt }`.
  - The `getDbHealth` server function (`src/functions/health.ts`) wraps it.
  - A `/health` page renders the result through a route loader.
  - On failure, the driver error and its `cause` are logged on the server only.
- **Why:** Connection errors contain hostnames, ports and sometimes credentials. The client only needs to know whether the database is reachable. The page makes the check visible in SSR and exercises the server-function path.
- **Alternatives considered:** A server route at `/api/health` for uptime monitors (can be added when monitoring is set up in Phase 10). Returning the error message (leaks infrastructure details).
- **Verification:** A real Postgres 17 (embedded, local) was used because Docker wasn't available and no Neon credentials were configured yet. All four `db:*` scripts worked, and migrations applied to a fresh database. `/health` rendered OK with JS on and off, and "Unreachable" with no leaked details when the port was wrong. The check against a real Neon database was completed during Phase 6: `/health` returned OK over the pooled connection. The first request took 3.4 s while Neon woke from idle, and later ones about 280 ms, including the network round trip to the database region. `sslmode=require` was rewritten to `verify-full` against Neon's real certificates without warnings.

## 0020: Paraglide follows the official TanStack Start example; options live in `paraglide.config.ts`

- **What:**
  - The wiring matches `TanStack/router/examples/react/start-i18n-paraglide`: the Vite plugin, `paraglideMiddleware` in `src/server.ts` (given the original request), and router `rewrite` with `deLocalizeUrl` / `localizeUrl`.
  - Compiler options are in `project.inlang/paraglide.config.ts` (`defineConfig`), which both the Vite plugin and the `paraglide-js compile` CLI read.
  - `pnpm typecheck` compiles first, so it works on a fresh clone. `vitest.config.ts` also loads the plugin.
  - `emitTsDeclarations: true` generates `.d.ts` files, instead of the example's `allowJs`.
- **Why:**
  - One options source prevents drift between dev, build, tests and typecheck.
  - `emitTsDeclarations` keeps the tsconfig strict (`verbatimModuleSyntax`, no `allowJs`).
- **Alternatives considered:**
  - Inline plugin options plus duplicated CLI flags (drift risk).
  - A custom shared TS module (the config file is the official mechanism, available since Paraglide 2.x).
  - Committing the generated output.

## 0021: Locale strategy is URL-only for pages; English unprefixed, Nepali under `/ne`

- **What:**
  - `strategy: ["url", "baseLocale"]`, with `urlPatterns` listing `/ne/:path(.*)?` before `/:path(.*)?`. Paraglide matches in order.
  - No cookie or `Accept-Language` strategy for pages.
- **Why:**
  - Paraglide's routing docs give `["url", "baseLocale"]` as the setup for an unprefixed base locale.
  - With an unprefixed base locale, the URL strategy always resolves, so later strategies are never consulted. The docs say always-resolving strategies belong last.
  - Putting cookie or `Accept-Language` before `url` would make `/` language-dependent. That hurts canonical URLs, `hreflang` and caching, and makes the middleware redirect.
  - The URL is authoritative, and the switcher is the user's control. A test asserts that `Accept-Language: ne` doesn't change `/`.
- **Alternatives considered:**
  - `["url", "cookie", "preferredLanguage", "baseLocale"]` as in the example, which prefixes every locale including `/en`. It conflicts with the plan's "`/` for English".
  - Auto-redirecting first-time visitors based on `Accept-Language` (surprising, bad for SEO; could be added later as a dismissible suggestion banner).
- **Note:** Bare `/ne` gets a 307 to `/ne/`. The canonical Nepali home is `/ne/`.

## 0022: Server functions receive the page locale in a header

- **What:**
  - A global function middleware (`src/start.ts`, `src/lib/i18n/locale-middleware.ts`) adds an `x-paraglide-locale` header with the page's locale to every server function call.
  - A Paraglide custom strategy, `custom-header`, is defined in `src/server.ts` and applied only to `/_serverFn/*` through `routeStrategies`. `toLocale()` rejects unknown values.
- **Why:**
  - Server function RPCs go to `/_serverFn/...` with no locale prefix. An experiment showed a call from `/ne/...` resolving to `en` on the server.
  - The header carries the exact locale of the page that made the call, and stays correct with two tabs in different languages. A shared cookie would not.
  - With the header, the probe returned `ne` from Nepali pages and `en` from English pages.
  - SSR-time calls run inside the page request's AsyncLocalStorage, so they are unaffected.
- **Alternatives considered:**
  - A cookie strategy for RPCs, as in the example (wrong with multiple tabs, and needs `setLocale()` on the client to write the cookie).
  - Passing `locale` as an explicit argument to every server function (easy to forget).

## 0023: The language switcher uses plain links to localized URLs

- **What:** `LanguageSwitcher` renders `<a href={localizeHref(location.href, { locale })} hreflang lang>` for each locale, from the router's de-localized location.
- **Why:**
  - Paraglide messages aren't reactive. A locale change needs a document load so SSR renders the new language, `<html lang>` and font preloads. This is the same thing `setLocale()` does with the URL strategy.
  - Anchors work without JavaScript, are crawlable, and keep path and search params (verified in the browser, both directions).
  - The URL hash can't be preserved in SSR, because browsers never send it.
- **Alternatives considered:** `setLocale()` buttons (need JS). Router `<Link>` (client navigation would show stale strings).

## 0024: Nepali formatting never uses ICU `ne` data

- **What:**
  - `src/lib/intl.ts` formats English with `Intl` directly.
  - For Nepali it uses only data every runtime has: `en-IN-u-nu-deva` for lakh grouping and Devanagari digits, locale-neutral date fields, and CLDR 47 `ne` month, weekday, currency and relative-time data transcribed into `src/lib/intl-ne.ts`.
  - The API exposes a portable subset: `dateStyle` / `timeStyle`, and decimal, percent and currency styles.
- **Why:**
  - Desktop Chrome's reduced ICU data has no Nepali: `Intl.DateTimeFormat.supportedLocalesOf("ne")` returns `[]`, so the browser silently formats English.
  - Node has full ICU and formats real Nepali. The result was a hydration mismatch (React error #418) on every Nepali page, and English formatting after React re-rendered.
  - The portable implementation produces identical strings everywhere. Tests compare it with Node's full-ICU `ne-NP` output for every date and time style, 16 dates across all months and weekdays, numbers, percent, currency, and every relative unit from -10 to +12 in both numeric modes. It matches exactly, including CLDR quirks like `+१ सत्रमा`.
- **Alternatives considered:**
  - `suppressHydrationWarning` (hides the error, but client re-renders still show English).
  - Client-only formatting (breaks SSR and no-JS).
  - Shipping full ICU data to browsers (not possible).
  - A formatting library (large, and still needs Nepali data).

## 0025: Dates render in a fixed app time zone; relative time takes an explicit `now`

- **What:** `APP_TIME_ZONE = "Asia/Kathmandu"` is the default for all date formatting. `formatRelativeTimeFrom(value, now)` requires `now`.
- **Why:** Servers run in UTC and browsers in local time, so machine-zone formatting differs between SSR and hydration. `Date.now()` during render also differs between server and client.
- **Alternatives considered:** The user's own zone (only knowable on the client, which forces client-only rendering or a cookie round-trip). UTC (wrong for the target audience).

## 0026: Devanagari font preloads only on Nepali pages; no preloads in dev

- **What:**
  - `fontPreloads(locale)` returns the Inter Latin preload everywhere, and the Noto Devanagari preload only for `ne`. It returns nothing in dev.
  - On English pages, the switcher's "नेपाली" label uses a system Devanagari font stack (`font-devanagari-system`), so English pages never download the 121 kB web font. Verified in the network log.
- **Why:**
  - This follows up decision 0007.
  - In dev, Vite injects extra stylesheet copies, so the browser re-requests the font instead of using the preload and logs a warning. Preloads are a production optimization.
- **Known benign warning:** After switching from an English page to Nepali in the same tab, Chrome can log "preloaded but not used within a few seconds" for the Devanagari font. The cached stylesheet requests the font milliseconds after the preload starts and doesn't attach to it. It is still downloaded only once. Cold loads of `/ne/`, including on a throttled network, use the preload with no warning.
- **Layout shift:** Nepali pages measured a CLS of 0.0006 to 0.0008, far below the 0.1 "good" threshold. The Devanagari fallback can match vertical metrics only; widths are unknown for system fonts (decision 0007). English pages measured 0.

## 0027: React is split into its own client chunk

- **What:** The client build's `codeSplitting.groups` puts `react`, `react-dom` and `scheduler` into a `react-vendor` chunk.
- **Why:** Adding Paraglide's URLPattern polyfill pushed the entry chunk past Vite's 500 kB warning, to 507 kB. React DOM alone is about 200 kB and rarely changes, so a separate chunk stays cached across deploys. The entry is now 287 kB and React is 219 kB.
- **Alternatives considered:** Raising `chunkSizeWarningLimit` (silences the warning without improving anything). Swapping client-side Zod for `zod/mini` (the forms in Phase 7 will bring Zod to the client anyway).

## 0028: How "no hydration warnings" was verified

- **What:** Headless Chrome 154 (puppeteer-core) loaded `/`, `/ne/`, `/health?tab=db&x=1` and `/ne/health?tab=db&x=1` on both the Vite dev server and the production build. It captured every console message and page error, clicked the language switcher, and recorded the URL, `<html lang>`, the rendered formatting samples, preloads and downloaded fonts before and after.
- **Result:**
  - The dev server (React's development build, which reports hydration mismatches in detail) had a clean console on all four pages, before and after switching.
  - Production had no hydration errors.
  - A no-JS load renders the full localized content with the correct `lang`.
- **Why:** React's production build reports hydration failures only as minified error #418, so a dev-server run was required to catch and diagnose the Nepali `Intl` mismatch (decision 0024).

## 0029: Windows checkouts need a short path

- **What:** The README asks Windows users to keep the project path to about 90 characters or fewer.
- **Why:**
  - A fresh-clone check under a long temporary directory failed tests and the build with `ERR_REQUIRE_CYCLE_MODULE` on `@tanstack/react-start/dist/esm/server-only.js`. The module path was 274 characters, and Node treated the ES module as CommonJS.
  - The same commit cloned to a shorter path passed install, typecheck, all 60 tests and the build with zero warnings.
  - The working copy's longest dependency paths are about 170 characters. pnpm already truncates `.pnpm` directory names on Windows (`virtualStoreDirMaxLength`).
- **Alternatives considered:** pnpm `node-linker=hoisted` (loses pnpm's strictness). Enabling long paths only (already on in this machine's registry, and not enough for Node here).

## 0030: TanStack Query via the official SSR integration, with a 60-second `staleTime`

- **What:**
  - `setupRouterSsrQueryIntegration` from `@tanstack/react-router-ssr-query`, with a new `QueryClient` per `getRouter()` call (once per request on the server).
  - `staleTime` defaults to 60 s, and `AppError`s aren't retried.
  - Loaders `await queryClient.ensureQueryData(...)`, and components read with `useSuspenseQuery`.
  - Query keys for translated data include the locale.
- **Why:**
  - The integration dehydrates and hydrates automatically and provides `QueryClientProvider`. There is no hand-written dehydration.
  - With the default `staleTime` of 0, freshly hydrated data counts as stale and refetches on mount. Verified: with 60 s, zero server-function requests are made after hydrating `/stack`.
  - Locale in the key stops English and Nepali results from sharing cache entries.
- **Alternatives considered:** Router loader data only, without Query (no shared cache or background refresh, and Test CRUD needs Query for TanStack DB). `useQuery` (doesn't run during SSR).

## 0031: One `AppError` shape, normalised by middleware and serialised with an adapter

- **What:**
  - `AppError` (`src/lib/errors.ts`) carries `code` (7 codes), `status`, a developer `message`, optional `fieldErrors`, and `requestId`.
  - Global function middleware assigns a request ID, logs one JSON line per call (function name, method, duration, outcome), and normalises every thrown value:
    - redirect and notFound pass through;
    - an `AppError` keeps its code;
    - a `ZodError` becomes `BAD_REQUEST`;
    - anything else becomes `INTERNAL` with no details, and the original is logged.
  - A `createSerializationAdapter` registered in `createStart` rebuilds a real `AppError` on the client.
  - `ErrorPage` shows a localized message chosen by `code`, plus the request ID.
- **Why:**
  - Clients can branch on `error instanceof AppError` and `code`, never on message strings.
  - Raw errors leak infrastructure details. Verified: a thrown message containing a host and password never appears in the SSR HTML or on the RPC wire, while the server log keeps it under the same request ID.
  - User-facing text stays in Paraglide, so the same error reads correctly in either language.
- **Alternatives considered:** Returning `{ ok, error }` result objects from every function (verbose, and loses throw semantics in loaders). Relying on Start's default error serialisation (class and fields not guaranteed).

## 0032: `zodInput()` instead of passing Zod schemas straight to `inputValidator`

- **What:** `zodInput(schema)` wraps a schema in a `{ parse }` validator that throws `AppError("BAD_REQUEST")` with field errors keyed by dotted path. Input and output types come from the schema.
- **Why:** For Standard Schema validators, Start throws a plain `Error` whose message is a JSON dump of the issues. That would need string parsing to normalise.
- **Alternatives considered:** Parsing the JSON error message in middleware (fragile). Validating manually inside each handler (easy to forget).

## 0033: Middleware lives in `src/middleware/`, not `src/server/middleware/`

- **What:** The CSRF, logging, error and auth middleware live in `src/middleware/`.
- **Why:** `src/start.ts` registers global middleware and is part of the client bundle. The locale middleware has a client half. Import protection denies `src/server/**` on the client, so middleware can't live there. The Start compiler strips `.server()` bodies from the client build (verified: the client bundle scan is clean). This changes the folder plan in PLAN.md.
- **Alternatives considered:** Excluding middleware files from import protection (weakens the boundary).

## 0034: CSRF protection for server functions

- **What:** Start's `createCsrfMiddleware({ filter: ctx => ctx.handlerType === "serverFn" })` is registered as request middleware.
- **Why:**
  - In dev, Start warned that server functions were unprotected.
  - Verified by replaying a real server-function request. Before the change, cross-site, foreign-`Origin` and signal-less requests all returned 200. After it, they return 403 while same-origin requests return 200.
  - Page navigation is unaffected.
- **Alternatives considered:** Silencing the warning (leaves the endpoints open). A token-based CSRF scheme (unnecessary for same-origin RPC with Fetch Metadata, and needs state).

## 0035: Layout routes, guards and the session slot

- **What:**
  - Pathless layouts: `_public` (footer), `_auth` (login and register, which bounce signed-in users to a safe `?redirect=`), `_authed` (redirects anonymous users to `/login?redirect=<path>`), `_admin` (anonymous users go to login, non-admins get `AppError("FORBIDDEN")`).
  - The router context is typed `{ queryClient, session: Session | null }`, and `session` is always `null` until Phase 6.
  - The guards already run their real logic against that slot. `_authed` and `_admin` narrow `session` to non-null for child routes.
  - Placeholder server middleware follows the same contracts: `sessionMiddleware`, `requireUserMiddleware` (UNAUTHORIZED) and `requireAdminMiddleware` (FORBIDDEN).
  - `?redirect=` only accepts same-site paths (`/…`, not `//host` or `/\host`), so login can't become an open redirect.
- **Why:** Phase 6 only has to fill the session in. Routes, redirects and server checks are already wired and tested. Route guards control navigation only; server functions must still use the middleware.
- **Verification:** `/account` and `/admin` return 307 to `/login?redirect=…`, and `/ne/account` returns 307 to `/ne/login?redirect=%2Faccount`. `?redirect=//evil.example` is dropped. Unknown paths return 404 with the localized page.

## 0036: `/stack` is the Phase 5 reference page

- **What:** A public page listing this project's tech stack, with the Phase 5 patterns applied:
  - Zod search params with `.default().catch()` (invalid values are corrected and default values stripped from the URL);
  - a loader using `ensureQueryData`;
  - a `pendingComponent` skeleton;
  - a deferred stats promise rendered with `<Await>` and streamed;
  - a search `<form>` that works without JS, and links for sorting and pagination;
  - a dev-only `?simulate=error` that throws a deliberately leaky error.
- **Why:** The patterns get exercised on real, localized content without building ahead into Test CRUD.
- **Streaming verified by chunk timing:** A browser user agent receives the list, fallback and dehydrated state in the first chunk (79 ms), and the stats in a later chunk (881 ms). Crawler user agents get one complete document, because Start buffers for bots, which is good for SEO. With JS disabled, the fallback stays visible, since streamed content is inserted by inline script.

## 0037: Email provider selection and fail-fast in production

- **What:** `selectEmailProvider()` (`src/server/email/config.ts`) is a pure, tested function:
  - `EMAIL_PROVIDER=resend` → Resend (the env schema already requires a key).
  - `EMAIL_PROVIDER=console` → console in development, an error in production.
  - Unset → Resend if `RESEND_API_KEY` is set; otherwise console in development and an error in production.
  - "Production" means `import.meta.env.PROD`, fixed at build time.
  - The boot-time Nitro plugin calls `getEmailProvider()`, so a misconfigured production server refuses to start.
- **Why:**
  - A production app that silently prints verification and reset emails to a log is broken in a way nobody notices until users complain.
  - `NODE_ENV` isn't reliable: `pnpm start` doesn't set it, and a production build could run with it unset.
  - Verified by booting the production build: `console` and "no provider" both stop with the messages above, and a Resend key boots normally.
- **Alternatives considered:** Deciding at send time (fails on the first signup, not at deploy). Allowing console in production with a warning (emails lost).
- **Consequence:** Smoke-testing a production build locally needs `RESEND_API_KEY` set for that run (see the README).

## 0038: React Email 6, rendered in an explicit locale

- **What:**
  - The unified `react-email` package provides both components and `render` / `toPlainText`.
  - The five templates share a layout and a typed registry (`EmailPropsMap` → subject builder + sample data).
  - `renderEmail(id, data, { locale, siteName })` returns subject, HTML and plain text.
  - Every message call passes `{ locale }` explicitly, rather than reading `getLocale()`.
- **Why:**
  - The recipient's language isn't the current request's: an admin action, a background job or an email change can send to someone else. Explicit locale makes that correct by construction.
  - Plain text is included for accessibility and spam scores.
- **Devanagari:**
  - The Nepali layout sets `lang="ne"` and a stack of fonts that ship with each major OS (Nirmala UI, Kohinoor Devanagari, Noto Sans Devanagari, Mangal).
  - Clients that support web fonts also get Noto Sans Devanagari from the Fontsource CDN.
  - Verified visually in Chrome: conjuncts and vowel signs shape correctly, and numbers use Devanagari digits.
  - OTP codes stay in Latin digits so they can be typed on any keyboard.
- **Alternatives considered:** Tailwind in emails (heavier, and inline style objects are enough here). One template per locale (duplication).

## 0039: The email preview is a Vite dev-server middleware, not an app route

- **What:**
  - `/dev/emails` is served by `vite/email-preview-plugin.ts` (`apply: "serve"`).
  - It lists every template × locale with iframes, plus raw HTML and `.txt` URLs.
  - Templates load through a dedicated runnable Vite environment (`email_preview`).
- **Why:**
  - Vite never registers `apply: "serve"` plugins during `vite build`, so production output can't contain the preview.
  - Verified: the build output has no "dev/emails" or preview code, and `/dev/emails`, `/dev/emails/otp-code/ne` and `/ne/dev/emails` return 404 on the production server.
  - An app route would sit in the committed route tree. Excluding it only for builds (`routeFileIgnorePattern`) would make `routeTree.gen.ts` differ between dev and build and churn in git.
  - Start runs its "ssr" environment inside Nitro, where `ssrLoadModule` isn't available, hence the dedicated environment.
- **Alternatives considered:**
  - A route guarded with `import.meta.env.DEV` (still shipped as a 404 route).
  - `react-email`'s own preview server (a second dev server; it wouldn't use the app's Paraglide setup or aliases).
- **Note:** The index page's labels are English. It's a developer tool, not user-facing; the emails themselves are fully localized.

## 0040: Better Auth configuration

- **What:** Better Auth 1.7 with `@better-auth/drizzle-adapter` (the adapter now ships separately), the `admin` and `emailOTP` plugins, and `tanstackStartCookies()` as the last plugin. The API is mounted at `src/routes/api/auth/$.ts`, and the schema is generated with the `auth` CLI (`pnpm auth:schema`). Settings:
  - email and password with `requireEmailVerification`, `sendOnSignIn` (an unverified user who tries to log in gets a new link), `autoSignInAfterVerification`, and `revokeSessionsOnPasswordReset`;
  - `changeEmail` enabled;
  - Google only when both env vars are set;
  - OTP with `disableSignUp`, so codes sign in existing users only and new accounts always go through verified sign-up.
- **Why:** This follows the official TanStack Start integration and plugin docs. The session cookie cache stays off, so a revoked session stops working on the next request (verified: a revoked second device is sent to login).
- **Alternatives considered:** Hand-written Drizzle auth tables (drift from Better Auth's expectations). Allowing OTP sign-up (creates accounts without a password or name).

## 0041: Auth emails are sent in the user's language, in the background

- **What:**
  - The auth client sends the page locale in `x-paraglide-locale`. A Paraglide route strategy reads it for `/api/auth/*`, the same mechanism as server functions (0022).
  - `resolveEmailLocale()` uses that header, then the locale of the request's `callbackURL`, because emailed links are opened without our header, then `getLocale()`.
  - Emails are sent without blocking the response, and `advanced.backgroundTasks.handler` is set to Vercel's `waitUntil`.
- **Why:**
  - A user on `/ne/register` gets Nepali verification and welcome emails, verified end to end.
  - Not awaiting delivery avoids a timing side channel that would reveal which emails have accounts, as the Better Auth docs advise.
- **Alternatives considered:** A `locale` column on the user (extra migration, and still needs the request locale for anonymous flows like OTP and reset). Always sending English.

## 0042: Email-change notice to the old address

- **What:** When a change-email link is confirmed, `afterEmailVerification` re-verifies the request's token with `verifyJWT` and the app secret, reads the previous address from it, and sends it the `email-changed` security notice. For ordinary verification it sends the `welcome` email instead.
- **Why:** Better Auth passes only the already-updated user to the hook. The signed token is the one place that still names the previous address. Better Auth has already validated the token, and the second verification makes the hook independent of that. Verified end to end: the new address gets the link, and the old address gets the notice.
- **Alternatives considered:**
  - `sendChangeEmailConfirmation`, which makes the old address approve first (a different flow, and the plan's template is a notice).
  - A DB hook (update hooks receive only the changed fields).
- **Risk:** This relies on Better Auth's token payload (`email`, `updateTo`). The e2e flow will catch a change on upgrade.

## 0043: Session in the router context via TanStack Query; admin checked on the server

- **What:**
  - The root `beforeLoad` fills `context.session` from `sessionQueryOptions()` (the `getSession` server function, cached for 60 s on the client), and sign-in, sign-out and account changes invalidate it.
  - `_authed` redirects to `/login?redirect=<path>`.
  - `_admin` calls the `ensureAdmin` server function (`requireAdminMiddleware`) on every navigation instead of trusting the cached context. Anonymous visitors are redirected to login; signed-in non-admins get the FORBIDDEN page. *(Revised by 0090: on entering the admin area and on every SSR request; inner navigations reuse the loaded admin session. Since 0095 the gate is any permission, not the admin role.)*
- **Why:** One session lookup per SSR request, and no extra RPC on client navigations for ordinary pages. The admin area gets a server decision each time. Data safety never depends on these guards, because server functions carry their own middleware.
- **Alternatives considered:** Calling `getSession` in every `beforeLoad` (an RPC per navigation). Trusting the cached role for `_admin` (fails the plan's "checks the role on the server").

## 0044: AppError status codes survive SSR

- **What:**
  - `setErrorStatus(error)` (an isomorphic helper) records an AppError's status in a per-request `AsyncLocalStorage` record (`src/server/http/error-status.ts`).
  - The server entry wraps each request in that record and, when the SSR response is 500 and a status was recorded, returns it with that status.
  - `_admin` uses it, so a non-admin gets a real 403.
- **Why:** TanStack Router's SSR sets any errored match to 500 (`router-core` `applyFailure`), and headers set during rendering don't reach the final Response (both tried and verified). A 403 page served as 500 misleads monitoring and crawlers.
- **Alternatives considered:** `setResponseStatus` in `beforeLoad` (overwritten). A response header marker (dropped).

## 0045: Rate limits keyed by a trusted client IP

- **What:**
  - Rate limiting is on in every environment, stored in the database, and has stricter rules for sign-in, sign-up, OTP, reset, verification and account changes.
  - The `/api/auth` route rewrites the request with `x-client-ip` taken from a trusted source (Vercel's edge headers on Vercel, otherwise the socket address), and Better Auth reads only that header.
- **Why:**
  - Better Auth disables rate limiting in development by default, which left nothing to test.
  - In the production build it warned it couldn't find a client IP and fell back to one shared bucket per path, so one attacker could lock everyone out.
  - Trusting client-supplied `X-Forwarded-For` would let attackers rotate fake IPs.
  - Verified on the production build: seven failed logins with a different forged `x-client-ip` and `x-forwarded-for` on each returned 401 five times, then 429, all in one bucket, with no warnings.
  - Database storage works across serverless instances.
- **Alternatives considered:** Memory storage (per instance). Trusting `X-Forwarded-For` (spoofable).
- **Note:** The server runtime's Request subclass (srvx) can't be passed to `new Request()`, so the copy is rebuilt from url, method, headers and body.

## 0046: Auth pages and placement

- **What:**
  - `_auth` holds login, register, sign-in-code and forgot-password, and bounces signed-in users to a safe `?redirect=` target (re-localized).
  - `verify-email` and `reset-password` live under `_public`: a successful verification arrives signed in, and a signed-in user may still reset from an emailed link.
  - Forms are simple accessible controlled forms (label, `aria-invalid`, `aria-describedby`, `role="alert"`). Phase 7's form system replaces them.
  - Better Auth error codes map to localized messages, and raw server text is never shown.
  - "Forgot password" and "send code" show the same confirmation whether or not the account exists; only rate limits are surfaced.
- **Why:** This avoids account enumeration, keeps pages working in both languages, and avoids building the Phase 7 form library early.

## 0047: The admin seed wraps Better Auth's `create-admin`

- **What:** `pnpm db:seed-admin` (`scripts/seed-admin.mjs`) validates `--email`, `--password` (12+ characters) and `--name`, falling back to `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME`. It then runs the official `auth create-admin` with the app's auth config, spawned with Node directly, without a shell.
- **Why:** The official command hashes the password, marks the email verified and sets the role the same way the app does. There's no second implementation to keep in sync.
- **Alternatives considered:** Inserting rows by hand (would duplicate password hashing). Admin-plugin `createUser` (needs an admin session).

## 0048: Better Auth's env *name* appears in the client bundle

- **What:** The client bundle contains the string `BETTER_AUTH_SECRET` inside Better Auth's generic env reader, which reads from an empty object in the browser. No value is ever present.
- **Why it's acceptable:** It's library code shared between client and server builds. The plan's "no server variable names" check targets our own env. The build-output scan confirms no values and no server modules; all of our server code is absent.

## 0049: Local e2e database must be UTF-8

- **What:** The end-to-end runs used a throwaway embedded Postgres created with UTF-8 encoding. Neon databases are UTF-8 (verified read-only on the project's database).
- **Why:** Windows' default encoding (WIN1252) rejected the Devanagari name "राम" with error 22P05. It's a test-environment trap, not an app bug, but any self-hosted Postgres for this app must be UTF-8.

## 0050: Form system built on TanStack Form composition and shadcn Field

- **What:**
  - `src/components/forms` sets up `createFormHookContexts` and `createFormHook`, exporting `useAppForm` and `withForm`, with 14 field components and three form components (`Form`, `SubmitButton`, `FormErrorSummary`).
  - Every field renders through `useFieldA11y` or `FieldShell`, which provide:
    - stable ids (a per-form `useId` prefix plus the field name);
    - a label (`htmlFor`), a description and an error (shadcn `FieldError`, `role="alert"`);
    - `aria-invalid`, and `aria-describedby` listing the description and the error.
  - Groups (radio, checkbox group) use `<fieldset>` and `<legend>`.
- **Why:**
  - This is the documented TanStack Form composition API: fields get typed state from context, so forms stay terse.
  - shadcn's `Field` family is the design system's own form layout and accepts Standard Schema issues.
  - Per-form id prefixes keep two forms on one page from colliding.
- **Alternatives considered:** react-hook-form (the plan names TanStack Form). Hand-rolled layout (duplicates shadcn).

## 0051: When errors appear, and `formValidators()`

- **What:**
  - Errors show once a field has been blurred or a submit was attempted, never while the user types into a pristine field.
  - `formValidators(schema)` applies one schema to `onChange`, `onBlur` and `onSubmit`.
- **Why:**
  - With only `onChange`, tabbing past an empty required field never validated it. A test caught this.
  - Blur covers fields the user skipped, and submit covers untouched ones. Duplicate messages across causes are de-duplicated.
- **Alternatives considered:** Showing errors immediately (noisy). Validating only on submit (late feedback).

## 0052: FormErrorSummary focuses itself; SubmitButton never blocks

- **What:**
  - After a failed submit, the summary (`role="alert"`, labelled by its heading) lists each problem as "Label: message", with a link that focuses the field (the first option for groups). The summary takes focus on each failed attempt, but not while the user types a fix.
  - `SubmitButton` is disabled only while submitting (`aria-busy`, pending label), not while the form is invalid.
- **Why:** This is the GOV.UK error-summary pattern: keyboard and screen-reader users learn what failed and can jump to it. A disabled submit button gives no feedback about why.

## 0053: Validation helpers return localized messages at validation time

- **What:** `src/lib/validation.ts` provides:
  - text: `required`, `optionalText`, `email`, `url`;
  - passwords: `password` with a 0–4 `passwordStrength` score;
  - numbers: `numberRange`, `currency` (two decimals, non-negative by default);
  - choices: `choice`, `choices`, `mustAccept`.
- **How messages work:** They're Zod `error` callbacks that call Paraglide messages, so the same schema reports in the current locale on client and server, with numbers formatted per locale (for example "कम्तीमा ८ अक्षर …"). Tests confirm a schema created in English reports in Nepali after the locale changes.
- **Why:** One schema for forms and server functions, with no per-locale schemas.

## 0054: Number and currency inputs keep a draft string

- **What:**
  - `NumberField` and `CurrencyField` keep what the user typed separately from the stored number. `parseLocaleNumber` accepts Devanagari digits, grouping commas and spaces, and yields NaN for garbage, which the schema reports as "Enter a number".
  - Currency shows the locale's symbol (NPR or नेरू) and reformats to two decimals with local grouping on blur.
  - Both use `type="text"` with a numeric `inputmode`.
- **Why:** `<input type="number">` rejects Devanagari digits and grouping, and silently empties invalid input. A draft string also stops partial input like "12." from being clobbered while typing.

## 0055: Local changes to shadcn components

- **What:**
  - `Field` no longer has `role="group"`.
  - The `input-group` wrapper and addon lost `role="group"`, and the addon lost its click-to-focus handler.
  - `FieldError` uses `===` and message keys instead of index keys.
  - `dialog.tsx` keeps its localized "Close" labels when shadcn adds components that depend on it: the CLI overwrite was reverted from a backup.
- **Why:**
  - Biome's a11y rules flagged these as real issues. Labels already name single controls, and genuine groups use `<fieldset>`.
  - The click-to-focus handler was a mouse-only nicety that needed two lint suppressions.
- **How to add shadcn components:** Back up `src/components/ui`, run `shadcn add … --overwrite`, restore changed existing files, then fix the CLI's `from "cn"` import.

## 0056: Component tests run in jsdom with a shared harness

- **What:**
  - Component tests opt in with `// @vitest-environment jsdom`.
  - `tests/setup/dom.ts` adds jest-dom matchers, cleanup, and stubs for `ResizeObserver`, `scrollIntoView` and pointer capture, which Radix UI and cmdk use but jsdom lacks.
  - `tests/components/forms/harness.tsx` renders a real `useAppForm` form with one field and checks the accessibility contract (`aria-invalid`, plus `aria-describedby` pointing at the error text).
- **Why:** The fields are tested through the same form machinery the app uses, including validation timing and the error summary, rather than in isolation.

## 0057: Phone numbers are stored as E.164 with a separate country picker

- **What:** `PhoneField` pairs a searchable country picker (Nepal +977 by default) with a national-number input. It stores E.164 and validates with libphonenumber-js `isValidPhoneNumber`. Devanagari digits are accepted, and the number is reformatted in national style on blur.
- **Why:**
  - E.164 is one unambiguous format for storage, SMS providers and `tel:` links.
  - Country names come from `Intl.DisplayNames("en")` in both languages. Desktop Chrome has no Nepali region names, so the server and browser would render different text and cause a hydration mismatch.
- **Alternatives:**
  - `react-phone-number-input`: brings its own styling and flag assets, and doesn't use our field shell.
  - A single free-text input: parsing is ambiguous without a country.

## 0058: Date fields store calendar dates as strings

- **What:**
  - `DateField` stores `"YYYY-MM-DD"` and `DateRangeField` stores `{ from, to }` in that format. `src/lib/date-only.ts` converts them.
  - Dates are displayed via `isoDateInstant` (noon UTC) and `formatDate` in Asia/Kathmandu.
  - The picker is react-day-picker 10 (shadcn Calendar) wrapped as `LocalizedCalendar`. Captions, weekdays, digits and day labels come from `src/lib/intl.ts`.
  - `TimeField` is a text input normalised to `"HH:mm"`, with Devanagari digits in Nepali.
- **Why:**
  - A birthday or deadline is a calendar day, not an instant. Storing `Date` objects shifts the day across time zones and serialization.
  - `<input type="time">` can't show Devanagari digits and differs per browser.
- **Alternatives:**
  - A date-fns locale for Nepali: none exists that matches our CLDR data.
  - The native date input: not localizable and not consistent across browsers.

## 0059: Rich text loads only in the browser, behind a placeholder of the same size

- **What:**
  - `RichTextField` renders `<ClientOnly fallback={placeholder}>` with `<Suspense fallback={placeholder}>` around `React.lazy(() => import("./rich-text-editor"))`.
  - The editor uses Tiptap 3 `useEditor({ immediatelyRender: false })`.
  - The placeholder and the editor share their frame classes (`rich-text-frame.ts`): a 40px toolbar row and a 160px minimum surface.
- **Measured:** In Chrome, both are 202px tall at the same position in en and ne. CLS is about 0.00001. There are no hydration warnings.
- **Why:**
  - ProseMirror needs the DOM. Loading it lazily keeps Tiptap out of the main client bundle and out of the SSR render.
  - Matching geometry means nothing moves when the editor arrives.
- **Toolbar:**
  - Follows the WAI-ARIA toolbar pattern: one tab stop, arrow keys, Home and End.
  - Toggle buttons use `aria-pressed`.
  - Unavailable Undo/Redo use `aria-disabled`, not `disabled`, so arrow keys don't skip them.
- **Alternatives:** Rendering the editor's HTML on the server: Tiptap's SSR output doesn't match the client-mounted editor, so it would cause hydration warnings.

## 0060: Sanitizing rich text on the server, with a SafeHtml brand

- **What:**
  - `sanitizeRichText()` in `src/server/rich-text/sanitize.ts` uses sanitize-html with an allowlist that exactly matches what the toolbar produces. Allowed tags: p, br, strong, em, u, s, code, pre, h2, h3, ul, ol, li, blockquote, hr, a.
  - Links allow only href (http, https, mailto) and are forced to `rel="noopener noreferrer nofollow" target="_blank"`. A link that loses its href becomes plain text.
  - It returns `SafeHtml`, a compile-time brand. `RichTextContent` is the app's only `dangerouslySetInnerHTML`, and it accepts only `SafeHtml`.
  - The rule: sanitize before storage and again on the server read path before rendering.
  - The editor additionally only allows http, https and mailto links (`normalizeLinkHref`).
- **Why:**
  - Server-side sanitizing can't be bypassed by a modified client. The brand makes rendering unsanitized HTML a type error.
  - The second pass protects against rows written by older code or directly in the database.
- **Alternatives:**
  - DOMPurify in the browser: it adds client weight, and client-side sanitizing alone is bypassable. Rendering in the browser would also need the sanitizer in the client bundle, while sanitizing on the server read path keeps it server-only. In production, sanitize-html and its PostCSS dependency are not in the client bundle (verified).

## 0061: The dev-only showcase is a real route, dropped from production builds

- **What:**
  - `src/routes/_public/dev/forms.tsx` throws `notFound()` in `beforeLoad` unless `import.meta.env.DEV`. Its component is `import.meta.env.DEV ? FormsShowcase : () => null`.
  - The showcase module builds its schema and options inside functions, so it has no top-level side effects and the bundler drops it.
  - `previewRichText`, a dev server function, also refuses outside dev.
- **Verified:** The production server returns 404 for `/dev/forms` and `/ne/dev/forms`. The build output contains no showcase component or schema.
- **Why:**
  - A real route exercises the actual layout, locale routing and hydration.
  - A static import is used because `lazyRouteComponent` made React log "called use() to suspend … did not call use()" while hydrating this route in dev.
- **Alternatives:**
  - Storybook (Task 14): it doesn't exercise SSR or the router.
  - A Vite `apply: "serve"` plugin, as for `/dev/emails`: it can't render inside the app shell.

## 0062: File fields use the native input plus drag-and-drop, and validate in the schema

- **What:**
  - `FileField` and `ImageField` keep a visually hidden but focusable `<input type="file">` labelled by the field. A second `<label>` acts as the visible "Choose" button and shows a focus ring through `peer-focus-visible`.
  - The drop zone is a pointer-only enhancement, with a lint suppression and comment.
  - The value is `File[]`. `files({ maxBytes, accept, min, max })` reports size and type errors with the file name, localized.
  - `accept` also narrows the native picker. Image previews use object URLs that are revoked on change and on unmount.
- **Why:**
  - The native input gives keyboard users and assistive technology the platform file picker.
  - Dropped files bypass `accept`, so validation has to live in the schema.
- **Alternatives:** react-dropzone: it duplicates what roughly 40 lines do here and has its own input handling.

## 0063: `mustAccept()` takes a boolean input

- **What:** `mustAccept()` is now `z.boolean().refine(v => v)` instead of `z.literal(true)`.
- **Why:** The form's default value is honestly `false`. With a literal input type, every form needed a cast to start unticked. The output and error message are unchanged.

## 0064: When to use TanStack DB, Query or Store, and the rest

| State | Tool | Example in this app |
| --- | --- | --- |
| Server data you **read** (lists, details, stats) | **TanStack Query**, using `queryOptions` and `ensureQueryData` in loaders. It is SSR-dehydrated by the official integration. | `/stack` list and stats, session (`sessionQueryOptions`) |
| Server data you **edit** in place and want instant feedback (optimistic, with rollback) | **TanStack DB query collection**, backed by Query, with live queries over it | Test CRUD admin table (Task 11): edit, delete and bulk delete update instantly and roll back when the server function fails |
| Client-only **UI preferences** shared across components and persisted | **TanStack Store** (`src/lib/stores`) | Theme, admin sidebar collapsed, table page size and hidden columns |
| Values being typed into a form | **TanStack Form** | Every form (`useAppForm`) |
| Shareable, bookmarkable view state | **URL search params** (Zod `validateSearch`) | `/stack?q=&sort=&page=`, and Test CRUD filters later |
| Local, one-component state | `useState` | Popover open, password visibility |

- **Rules of thumb:**
  - Never copy server data into a Store. Query or DB own it.
  - Don't use DB for read-only pages. Query is simpler and is already SSR-hydrated.
  - Don't put view state in a Store if a link should reproduce it. Use the URL.
- **Alternatives considered:**
  - Query alone with `onMutate` and manual cache patching: workable, but every feature re-implements optimistic updates and rollback. DB makes that the default.
  - Zustand or React context for preferences: TanStack Store is in the stack, has fine-grained `useSelector` subscriptions, and supports actions.

## 0065: Preferences live in cookies, with one store per router

- **What:**
  - `createPreferencesStore(readPreferences())` is created in `getRouter()`, so there is one per request on the server and one per tab in the browser, exposed as `context.preferences`.
  - `readPreferences` is a `createIsomorphicFn`. It reads `getCookies()` on the server and `document.cookie` in the browser, so both renders start from the same values.
  - Store actions write `theme`, `sidebar` and `table-prefs` cookies (one year, `SameSite=Lax`, `Secure` on https, not httpOnly because the browser writes them).
  - Values are parsed with Zod. Tampered values fall back to defaults, and page sizes are limited to an allowlist.
- **Theme without a flash:**
  - An explicit "dark" is rendered by the server as `<html class="dark">`.
  - "system" is resolved before first paint by a tiny inline `ScriptOnce` script in `<head>` (emitted in the SSR HTML only, removes itself, supports a CSP nonce for Task 16).
  - `ThemeSync` then keeps the class in sync and follows OS changes.
  - `<html>` has `suppressHydrationWarning`, needed only because that script may add the class before hydration.
  - `color-scheme` is set per theme so native controls match.
- **Verified in Chrome** (dev server):
  - With a dark cookie, or "system" on a dark OS, `.dark` and the dark background are already applied when `<body>` is first parsed.
  - Choosing Dark in the menu and hard-reloading also shows no light frame.
  - Production SSR renders `class="dark"` for the dark cookie and falls back to "system" for a tampered cookie.
  - Sidebar: collapsing persists, the JS-off server render shows it collapsed (56px), and it is still collapsed after a reload.
  - There were no console warnings in either locale.
- **Why cookies:** `localStorage` is invisible to the server. The server would render defaults and the client would correct them after hydration, causing a flash or a hydration mismatch. The store must not be module-level, because on the server it would be shared between visitors.
- **Alternatives:**
  - `localStorage` plus a blocking script for everything: it still can't render the sidebar width or page size on the server.
  - A server function to set cookies: an extra round trip for a purely cosmetic change.

## 0066: TanStack DB uses the official router integration and has its own chunk

- **What:**
  - `getRouter()` creates a `DbClient` with the request's `QueryClient` as a dependency (`src/lib/db.ts`, `queryClientOf`). It wraps the router with `routerWithDbClient` from `@tanstack/react-router-with-db` 0.1.0, after `setupRouterSsrQueryIntegration`, because it chains the existing `dehydrate`, `hydrate` and `Wrap`.
  - Feature collections are module-level descriptors (`collectionOptions(id, factory)`) that each DbClient materializes separately, so SSR requests never share rows. Tests cover this.
  - A `tanstack-db` client chunk group (alongside `react-vendor`) keeps the entry chunk under Vite's 500 kB warning: entry 299 kB, DB 284 kB, 84 kB gzipped.
- **Why:**
  - This is the officially documented Start integration. It streams live queries rendered during SSR and hydrates them.
  - Mutation handlers that throw make DB roll back the optimistic change, which is exactly what Test CRUD's admin needs. `tests/unit/db-collection.test.ts` shows it.
- **Costs and risks:**
  - The DB runtime loads on every page, about 84 kB gzipped and cached separately.
  - Both packages are pre-1.0. Query collections still auto-refetch after a handler unless it returns `{ refetch: false }`, and that changes at 1.0. Pin versions and re-check on upgrade.
- **Alternatives:** Creating the DbClient only on admin routes: it has no official SSR path and would duplicate the provider wiring.

## 0067: Uploaded images are stored in Postgres and served by a Nitro route

*Superseded by 0098 (Cloudinary attachments); the legacy table remains only for `pnpm attachments:import-legacy`.*

- **What:**
  - `test_crud_image` (`bytea`, sniffed MIME type, size) is referenced by `test_crud.image` with `ON DELETE SET NULL`. Create and update are ONE FormData request: shared-schema JSON plus an optional file. The image is inserted, replaced or removed in the same transaction as the row, and replaced or orphaned images are deleted there too.
  - The type comes from the file's magic bytes (PNG, JPEG or WebP). The browser's `File.type` and the extension are ignored. The limit is 2 MB, checked before reading the file.
  - `GET /api/images/:id` is served with `Cache-Control: immutable` (ids are never reused) and `nosniff`.
- **Why a Nitro route, not a Start server route:** in dev, Nitro (3.0 beta) sends any request with `Sec-Fetch-Dest: image` that matches no Nitro-level route to Vite's static server. So every `<img>` pointing at a TanStack Start server route returned 404 in dev, although curl got 200. Registering the handler via `nitro({ routes })` makes dev and production use the same path. Verified: 200 with `Sec-Fetch-Dest: image`; 404 for unknown or malformed ids.
- **Why Postgres:** the stack has no object storage, and this keeps the template self-contained and transactional. Image ids are random UUIDs, but images of draft items are not access-controlled. Note that before storing anything sensitive.
- **Alternatives:**
  - Vercel Blob or S3 with signed uploads: the right choice at scale. Swap `insertImage`, `getImage` and the route behind the same shape when needed.
  - Uploading the file first in its own request: leaves orphans when the form is abandoned.
  - A URL text field: makes the reusable ImageField pointless.

## 0068: The admin list is URL-driven; Query owns SSR and a DB collection owns optimism

- **What:**
  - Search, status, sort, page and page size are Zod-validated search params (`.catch()` corrects bad values) and are also the `listTestCrud` input.
  - Without `pageSize` in the URL, the saved table preference applies. The server reads it from the preferences cookie, so SSR matches.
  - The loader awaits `ensureQueryData`, so the page is in the SSR HTML.
  - A TanStack DB query collection per list page uses the SAME query key, so its initial rows come from that cache. Rows render from the collection when it is ready and from the identical Query rows before that, so hydration matches.
  - Publish/unpublish, delete and bulk delete go through `collection.update` / `collection.delete`. A failing handler rolls the change back, and the table shows a localized toast. After success, every list page is invalidated.
- **Verified in Chrome** (dev, local Postgres):
  - With the server call forced to fail (500 after 1.2 s), the badge showed "Published" immediately, rolled back to "Draft", and the toast read "That didn't work, so the change was undone." The row in the DB stayed `draft`.
  - Real publish, single delete with confirmation, bulk delete of 2 items, column hiding and page size all work and persist across a reload.
- **Alternatives:**
  - DB on-demand sync with predicate push-down: total counts and `ILIKE` search don't map cleanly, so this is revisited when DB is 1.0.
  - Optimistic updates through Query `onMutate`: more hand-written cache code per feature.

## 0069: Server functions use `.validator()` and report field errors the form can show

- **What:**
  - New server functions use `.validator()`, the current name; `.inputValidator()` is deprecated. Existing functions keep the old name for now, which logs a deprecation warning in dev; migrate them in Task 16.
  - Server-only failures (slug taken → CONFLICT, image rejected → BAD_REQUEST) carry `fieldErrors` with localized messages. `applyServerFieldErrors()` puts them on the fields under `errorMap.onServer`, so they show in the field and in FormErrorSummary. `clearServerErrorOnChange` (a form `listeners.onChange`) removes one when the user edits that field.
  - `UnsavedChangesGuard` uses `useBlocker({ shouldBlockFn, enableBeforeUnload, withResolver })` with a localized AlertDialog. The form passes `!saved && !form.state.isDefaultValue`.
- **Why:** The same validation is reported in the same place whether it ran in the browser or on the server. Reverting edits to the original values doesn't trigger a false "unsaved changes" prompt.

## 0070: Testing data access against PGlite, and how admin-only access is verified

- **What:**
  - Repository tests run the committed migrations on `@electric-sql/pglite` (in-process Postgres), so real SQL, constraints (unique slug), transactions and `ILIKE` escaping are exercised without a server.
  - Server functions can't run under Vitest because their middleware only runs in the Start runtime. A static test asserts that every `createServerFn` in `src/functions/test-crud.ts` is chained with `.middleware([requireAdminMiddleware])`. The middleware itself is unit-tested.
  - Live check (dev): the browser's real list (GET) and publish (POST) calls, replayed without cookies, returned `UNAUTHORIZED`. Replayed as a signed-in verified non-admin, they returned `FORBIDDEN`. Start reports function errors in the payload with HTTP 200.
- **Alternatives:**
  - Mocking Drizzle: misses SQL bugs.
  - A shared test Neon branch: slower, and needs network and credentials in CI.

## 0071: SEO tags come from one helper and a required `VITE_SITE_URL`

- **What:**
  - `seo({ title, description, path, image, type, noindex })` in `src/lib/seo.ts` returns `head` meta and links: the title template, description, canonical, `hreflang` alternates for every locale plus `x-default` (base locale), and Open Graph tags (`og:locale` and its alternates; `og:image` only when there is an image). It also returns Twitter card tags.
  - URLs are absolute, built from the new required client variable `VITE_SITE_URL`: an origin only, no path, no trailing slash, http(s). Locale paths come from Paraglide's `localizeHref`, so they follow the same URL strategy as routing.
  - Canonicals: list page 1 is `/test-crud`, later pages are their own canonical URLs, and search results are `noindex, follow` with the list as canonical. The detail page adds `article:published_time`.
- **Why:** canonical and hreflang must be absolute, and the request's Host header is not trustworthy, so the origin is configured. Making it required means a deploy without it fails at build or start instead of shipping wrong canonicals.
- **Verified:**
  - In dev and the production build: one title, one description and one canonical per page (child heads replace the root defaults).
  - Nepali pages are canonical at `/ne/...`, with English as `x-default`.
  - Unit tests cover both locales, noindex and images.
- **Alternatives:**
  - Deriving the origin from the request: can't be trusted and differs behind proxies.
  - Per-route hand-written tags: easy to get inconsistent.

## 0072: Public reads are a separate, published-only path

- **What:**
  - `src/functions/test-crud-public.ts` (no auth) calls `listPublishedTestCrud` and `getPublishedTestCrud`. Both always filter on `status = 'published'` and return public DTOs that leave out the id, status, creator and timestamps other than `publishedAt`.
  - A draft and a missing slug both become NOT_FOUND, so the route throws `notFound()` and responds with the localized 404 page and HTTP 404. A malformed slug 404s without a query.
  - The body is sanitized again on read. Verified with a row written straight into the DB with `<img onerror>`, `<script>` and a `javascript:` link: all were stripped and only the link text remained.
  - Public query keys live under `["test-crud", "public"]`, which admin writes invalidate.
- **Verified:**
  - With JavaScript disabled, the list (12 cards per page, search, pagination) and the detail page render fully.
  - No console warnings in en or ne, light or dark.
  - Card widths are fixed (`min-w-0`), and the site header now wraps, so there is no horizontal scroll at 360, 390, 768 or 1280 px.
- **Alternatives:** Reusing the admin functions with a "public" flag: one mistake would expose drafts.

## 0073: Sentry via `@sentry/tanstackstart-react` 11.4.0 (beta, pinned), off without a DSN

- **What:**
  - The official SDK is pinned to an exact version because it is beta. Initialisation follows Sentry's manual setup for serverless hosts:
    - `src/instrument.client.ts` is imported first by a custom `src/client.tsx`.
    - `src/instrument.server.ts` is imported first by `src/server.ts`, which wraps the entry in `wrapFetchWithSentry`.
    - `sentryGlobalRequestMiddleware` runs first in `start.ts`.
    - `tanstackRouterBrowserTracingIntegration` is added in `getRouter()` in the browser.
  - Both sides share `sentryOptions()`: `environment` is the Vite mode, `tracesSampleRate` is 1 in dev and 0.1 in prod, and `sendDefaultPii: false`.
  - One DSN variable, `VITE_SENTRY_DSN`. DSNs are public by design.
- **Where errors are captured:**
  - Unexpected server-function errors are captured in `normalizeServerError` while the original error still exists, tagged with the `requestId` shown to the user. They are not captured by an outer function middleware, which would only see the generic INTERNAL `AppError`.
  - `beforeSend` drops every `AppError` (4xx are expected; INTERNAL was already reported) and strips `user.ip_address`, which the server SDK adds even with `sendDefaultPii: false`.
  - The route error page captures non-`AppError` client errors.
  - `Sentry.setUser({ id })` follows the session; it is cleared on logout.
- **Source maps:** `sentryTanstackStart()` is added to Vite only when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT` are all set (validated together), with `telemetry: false` and `autoInstrumentMiddleware: false` (the middleware is wired explicitly). Not verified end to end: there is no Sentry account in this environment.
- **Verified** against a local fake ingest:
  - A client error arrived with the user id.
  - A server-function failure arrived once, with a readable stack (`functions/stack.ts:17`), the `requestId` tag and no IP address.
  - Without a DSN, the production build made no external requests.
- **Consent:** Sentry is error monitoring, not product analytics, so it is not tied to the analytics consent banner. It sends no PII beyond the user id. Error message text is not scrubbed by the app; enable Sentry's server-side data scrubbing (the default) and avoid putting secrets in error messages.
- **Alternatives:**
  - The `--import` flag setup: not available on Vercel functions.
  - Session Replay: left out for privacy and bundle size. Add `replayIntegration()` if wanted.

## 0074: PostHog is opt-in; consent is a cookie, and posthog-js loads only after "yes"

- **What:**
  - `analyticsConsent` (`unset` / `granted` / `denied`) lives in the preferences store and the `analytics-consent` cookie, so the server renders the banner (or not) and the page doesn't shift after hydration.
  - The banner is shown only when `VITE_POSTHOG_KEY` is set and the choice is `unset`. A footer link reopens it.
  - `posthog-js` is a dynamic import started only by "Allow analytics". Before that there is no PostHog code, cookie or request.
  - Configuration: no autocapture, no session recording, no surveys, `person_profiles: identified_only`, and pageviews sent on router navigation.
  - Withdrawing consent calls `opt_out_capturing()` and `reset()` and deletes PostHog's cookie and localStorage.
  - Server events (posthog-node, `captureImmediate`, `disableGeoip`) are sent only when the request carries `analytics-consent=granted`.
  - Test CRUD events:
    - Created, updated (edit or status change) and deleted are sent from the admin server functions, with the admin's user id as the distinct id.
    - Viewed is sent from the public detail page, once per item.
- **Verified** against the fake ingest, with a normal user agent: posthog-js drops events from headless Chrome as bots, which hid events in the first run.
  - Before consent: no browser requests to PostHog, and posthog-js not loaded.
  - After "Allow": `$pageview`, then `test_crud_viewed`, `$identify` with the user id on login, and the server's `test_crud_updated` with the admin's id.
  - After logout, events use a new anonymous id.
  - "No thanks" stops sending and removes `ph_*` storage.
  - With no key, nothing was requested.
- **Alternatives:**
  - Initialising PostHog with `opt_out_capturing_by_default`: the SDK still loads and may make config requests before consent.
  - Cookieless mode: weaker funnels, and still a consent question in many jurisdictions.

## 0075: Feature flags are evaluated on the server and shipped with the page

- **What:**
  - `getHomeFlags` (a server function) calls `posthog.getFeatureFlag(key, distinctId, { sendFeatureFlagEvents: false, disableGeoip: true })` with a 1.5 s timeout. Missing key, `false`, `undefined`, `"control"` or any failure means off.
  - The home loader awaits it into the Query cache, which is dehydrated with the SSR HTML, so the server and the hydrated client render the same branch.
  - The distinct id is the visitor's PostHog id read from PostHog's cookie, but only with consent. Otherwise every visitor is evaluated as `"anonymous"`, so no per-visitor identifier leaves the server before consent and no flag-call event is recorded.
  - Example flag: `home-items-cta` shows a call-to-action card on the home page.
- **Verified:** with the flag on at the fake ingest, the card was in the SSR HTML and still present after hydration, with no console warnings. With no key it was absent in both.
- **Alternatives:**
  - Client-side `posthog.isFeatureEnabled`: renders a default first and then flips, unless bootstrapped. It also needs posthog-js before consent.
  - Local evaluation with a personal API key: faster, but another secret. Revisit at scale.

## 0076: CSP and ad blockers (deferred to Task 16)

- **What:** Sentry (`*.ingest.sentry.io` or a tunnel) and PostHog (`VITE_POSTHOG_HOST`, plus its assets host for posthog-js extensions) must be added to the Content Security Policy in Task 16. The inline theme script needs the router's nonce.
- **Why noted now:** both SDKs fail silently when blocked. A managed tunnel (`sentryTanstackStart({ tunnelRoute })`) and a PostHog reverse proxy are options if ad blockers become a problem.

## 0077: Storybook has its own Vite config and replaces server modules wholesale

- **What:**
  - Storybook 10.6.1 (`@storybook/react-vite`, pinned) with `viteConfigPath: .storybook/vite.config.ts`. That config has only Paraglide, Tailwind and React, plus tsconfig paths.
  - `.env` loading is off (`envDir: false`). The two public values Storybook needs (`VITE_APP_TITLE`, `VITE_SITE_URL`) are set in `.storybook/aliases.ts`, and the Sentry/PostHog keys are removed.
  - Vite aliases replace `@/functions/*` and `@/lib/auth-client` with mocks built from `fn()`, so play functions can assert calls (for example the FormData sent by the Test CRUD form).
  - A global decorator wraps every story in the real providers (router with memory history, Query, DB client, preferences store) and applies the locale and theme toolbar globals.
  - The login form was extracted from its route into `LoginForm` (with an `onSignedIn` callback) so it can be rendered and interaction-tested on its own.
- **Why:**
  - The app's Vite config runs TanStack Start, Nitro and env validation, none of which belong in a component workshop.
  - `sb.mock()` still evaluates the original module and its dependencies, which would bundle the database driver and Better Auth into the browser. Aliases swap the whole module, so that server code is never bundled.
- **Alternatives:**
  - `package.json` subpath imports (`#functions/...`): they would change every app import.
  - MSW for server functions: Start's RPC wire format is an internal detail.

## 0078: Stories are tests: two browser passes, a11y violations fail

- **What:**
  - `@storybook/addon-vitest` runs every story as a Vitest browser test (Playwright provider using the installed Chrome via `channel: "chrome"`; no browser download). Play functions are assertions.
  - `parameters.a11y.test = "error"` makes any axe violation fail the story.
  - There are two projects: `storybook` (English, light) and `storybook-dark-ne` (Nepali, dark, via `initialGlobals` in its setup file). They run one after the other, each with a 30 s timeout per test. Running both browsers in parallel caused sporadic timeouts on this machine.
  - `pnpm test` stays the fast jsdom/node suite (`--project unit`).
- **Verified:** 50 stories × 2 passes = 100 tests, green on three consecutive runs. `pnpm build-storybook` is green with no warnings. The 1.5 MB preview iframe chunk has its warning limit raised in `viteFinal` (a dev tool, never served to users).
- **Alternatives:** `@storybook/test-runner`, which needs a running Storybook and a separate Jest setup.

## 0079: Accessibility fixes found by the stories

- **What:**
  - Light theme `--destructive` changed from shadcn's red-600 to red-700 (`oklch(0.505 0.213 27.518)`). Error text on the tinted error panels (form error summary, auth messages) measured 4.36:1, below WCAG AA's 4.5:1.
  - Light theme `--muted-foreground` darkened from `oklch(0.552 …)` to `oklch(0.5 …)`. Muted text on `--muted` (selected table rows) measured 4.39:1.
  - The theme menu, table row actions and column picker use `DropdownMenu modal={false}`. The modal default `aria-hide`s the rest of the page while it still contains focusable elements, which axe flags (`aria-hidden-focus`). For small menus that close on Escape or an outside click, non-modal is the better pattern.
- **Why:** these were real defects in the app, caught by running axe in both themes and both languages, not only in Storybook.

## 0080: Server-function logic lives in plain functions; coverage is reported per area

- **What:**
  - `createServerFn` handlers only run inside the TanStack Start runtime. Calling one under Vitest fails with "No Start context found in AsyncLocalStorage", and faking that context means importing an internal package.
  - So the Test CRUD server functions are now one-line wrappers:
    - The work lives in `src/server/test-crud/service.ts`, plain functions over an injected `db`: image change selection, validation, the NOT_FOUND mapping and the analytics events.
    - The create/update wire format lives in `src/features/test-crud/form-data.ts`. `toFormData` (used by the form) and `parseSaveForm`/`parseUpdateForm` (used by the validators) sit side by side, so a round-trip test proves they agree.
  - Tests:
    - The service runs against PGlite with the real migrations (`tests/utils/test-db.ts`).
    - Route guards (`_authed`, `_auth`, `_admin`) are tested through their `beforeLoad`.
    - The global middleware (CSRF, request logging, error normalisation, locale header) is tested through its server/client steps.
  - Admin-only access is proven by three things together: the middleware tests, the static check that every Test CRUD function uses `requireAdminMiddleware`, and the live replay recorded in 0070.
  - `pnpm test:coverage`: v8 coverage of `src/**` (excluding generated Paraglide output, the route tree and stories), with text, JSON summary and HTML reporters. `scripts/coverage-report.mjs` then prints line, branch and function coverage for the plan's areas plus the overall total.
- **Result** (334 unit tests):

  | Area | Lines | Branches | Functions |
  | --- | --- | --- | --- |
  | Schemas & validation | 94.9% | 92.7% | 87.0% |
  | Form fields | 90.8% | 81.3% | 87.1% |
  | Server functions | 77.2% | 81.0% | 66.2% |
  | Guards | 94.3% | 84.5% | 89.5% |
  | Email | 84.3% | 73.7% | 75.9% |
  | i18n | 100% | 87.1% | 100% |
  | Env | 97.7% | 78.0% | 100% |

  Overall is 57.8% of lines, because route pages and UI composition are exercised by the Storybook browser tests and live checks, not by this run.
- **Why not merge the browser coverage too:** it would make `pnpm test:coverage` depend on Chrome and roughly triple its time. The Storybook run stays a separate gate.
- **Known gap:** the `src/functions/*` wrapper files show 0%. They can't execute outside Start, and their contents are a middleware list, a validator and a single call.
- **Alternatives:**
  - Mocking `@tanstack/start-storage-context`: depends on internals.
  - An HTTP-level test harness against a running server: the live checks already do this, and it's too slow for every run.

## 0081: Security headers: static headers via Nitro, a per-request CSP nonce via Start middleware

- **What:**
  - **Every response** (pages, assets, `/api/images`) gets static headers through Nitro `routeRules`:
    - `Strict-Transport-Security: max-age=63072000; includeSubDomains`
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy` with camera, microphone, geolocation, payment, usb and browsing-topics disabled
    - `X-Frame-Options: DENY`
    - `Cross-Origin-Opener-Policy: same-origin`
  - **HTML pages** get a Content-Security-Policy from `securityHeadersMiddleware` (`src/middleware/security-headers.ts`), production only:
    - A fresh 128-bit nonce per request goes into the request context. `getRouter()` passes it to `ssr.nonce` via `getGlobalStartContext()`, so Start's inline hydration scripts, its entry module script and the `ScriptOnce` theme script all carry it.
    - `script-src 'nonce-…' 'strict-dynamic'` (no `unsafe-inline`, no `unsafe-eval`).
    - `style-src 'self' 'unsafe-inline'`, because Radix positions popovers with style attributes.
    - `img-src 'self' data: blob:`, for image previews.
    - `connect-src 'self'` plus the Sentry DSN's origin and the PostHog host, only when configured.
    - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`.
  - **Zod jitless:** Zod 4 probes `new Function` to decide whether to JIT-compile schemas, and the CSP correctly blocks it. `src/lib/zod-config.ts` sets `z.config({ jitless: true })`. It's imported first by both entries and by `client-env.schema.ts`, because code splitting runs the env schema (parsed at import time) before the entry's own imports. *(Superseded by 0086: `zod` now resolves to a configured module, because import order alone proved fragile.)*
- **Verified on the production build:**
  - All headers are present on an HTML page, a JS asset and the image route, and every inline script has the nonce.
  - 204 page loads (17 pages × en/ne × light/dark × 390/768/1280 px) had zero `securitypolicyviolation` events.
  - A separate build with Sentry and PostHog pointed at a local ingest still sent `$pageview`, `test_crud_viewed` and a Sentry error under the enforced CSP, with no violations or blocked requests.
  - Unit tests cover the policy builder and the middleware.
- **Why production only:** Vite's dev server and the TanStack Devtools inject scripts without a nonce.
- **Alternatives:**
  - A hash-based CSP: Start's inline scripts change per render.
  - `'unsafe-inline'` scripts: would defeat the point.
  - Headers in `vercel.json`: not portable, and no per-request nonce.

## 0082: Final review fixes (accessibility, responsiveness, layout stability)

- **Method:** axe-core (WCAG 2.0/2.1/2.2 A and AA, plus best practice), a horizontal-overflow check and console/CSP capture on every page (anonymous, user and admin) in both locales, both themes and three widths. Plus keyboard Tab walks and CLS measurements with an empty cache.
- **Fixes:**
  - **Contrast:** the disabled pagination step on `/test-crud` was `opacity-50` (3.73:1). It now uses the muted text colour with `aria-disabled`.
  - **Admin on phones:** the search field had a fixed width (`w-64`), so it now fills the row below `sm`. The sidebar is icon-only below `md` regardless of the saved preference, because a 224 px sidebar on a 390 px screen left too little room.
  - **Rich-text toolbar:** it scrolls sideways on narrow screens. Its height is unchanged, so it still matches the SSR placeholder.
  - **Layout shift on `/test-crud`** (0.03): the card's `aspect-[16/9]` box grew to the image's own aspect when it loaded. The image is now absolutely positioned over a clipped box, and title and summary reserve fixed line counts. CLS is now ≤ 0.0004 on every measured page, in both locales, at phone and desktop widths.
- **Result:** 204/204 page loads with no axe violations, no overflow, no CSP violations and no console errors (the 404 page's own 404 aside). Every Tab stop has a visible focus indicator; cards use a `focus-within` ring.

## 0083: Breadcrumbs come from route `staticData`, labels resolved at render time

- **What:** A route joins the trail by declaring `staticData: { breadcrumb }` (typed by declaration merging on `StaticDataRouteOption` in `src/lib/breadcrumbs.ts`). `staticCrumb(m.x)` gives a fixed, localized label. `loaderTitleCrumb` reads the `title` returned by the route's loader (detail pages). Sections get a `route.tsx` layout (`/_admin/admin`, `/_admin/admin/test-crud`, `/_public/test-crud`) whose only job is naming the section. `_public` names "Home". `<Breadcrumbs>` builds the trail from `useMatches()` and merges a layout with its index route (same path, deeper label wins). `jsonLd` also emits a schema.org `BreadcrumbList` with absolute, localized URLs. `<PageHeader>` shows the trail by default.
- **Why:** TanStack Router's documented breadcrumb pattern walks the matched routes. The trail then needs no per-page code, renders identically on the server and the client (no shift), and follows the URL structure. Labels are functions, not strings, so they're read in the request's locale at render time. Detail loaders return only `{ title, … }`, not the item: the item already travels in the Query cache, and returning it from the loader would serialize it twice.
- **Alternatives considered:** `beforeLoad` context (`getTitle`), as in the router-context guide. It runs before the loader, so it can't name a detail page from its data. Per-page `items` props: repetitive and easy to forget. They remain available (`<Breadcrumbs items>`) for pages whose trail doesn't follow the URL, and for stories.

## 0084: One list contract, shared by URL, server function and repository

- **What:** `src/lib/list.ts` defines the list params every list uses: `searchParam()` (`q`), `enumParam(values, fallback)` (`sort`, status filters), `pageParam()`, `pageSizeParam()` (optional in the URL, so it falls back to the saved table preference) and `resolvedPageSize()` (server input). It also defines `Paged<T>`, `parseSort`, `pageWindow` (clamping and offset), `paginateArray` and `bulkIdsSchema`. The server half, `src/server/db/list.ts`, has `textSearch` (ILIKE with escaped wildcards), `allOf`, `orderBySort` (a whitelist of columns plus a unique tiebreaker), `countRows` and `paginate`. The Test CRUD and stack schemas and repositories are rebuilt on them. `Db`/`Tx` moved to `src/server/db/types.ts`.
- **Why:** The same rules (forgiving URL parsing, page clamping, literal search, stable ordering) were written out per feature. The frontend building blocks (`<DataTable sort>`, `<Pagination>`, `<SearchLink>`) read and write exactly these params, so the backend must agree on them in one place. `paginate` takes `count`/`rows` callbacks rather than a table, so each repository keeps fully typed Drizzle queries.
- **Alternatives considered:** A generic `paginate(db, table, …)` that builds the select itself. Typing the row shape across arbitrary tables needs casts. Cursor pagination: not needed at this scale, and page numbers are what admin users expect.

## 0085: Reusable page building blocks; feature code is columns, filters and actions

- **What:** These live in `src/components/`:
  - `page/`: `Page` (standard widths), `PageHeader` (breadcrumbs, h1, description, actions), `Breadcrumbs`, `EmptyState`, `PageHeaderSkeleton` and `ListSkeleton`
  - `data-table/`: `DataTable<Row>` (typed columns, URL sort links with `aria-sort`, row selection with a bulk bar, a row-actions menu, column visibility from the table preference cookie, empty state), `DataTableColumnsMenu` and `DataTableSkeleton`
  - `navigation/`: `Pagination` (URL-driven; disabled steps are text) and `SearchLink` (a link to the current page with search params changed; works without JS)
  - `dialogs/ConfirmDialog`

  Test CRUD's admin list now defines only its columns (`features/test-crud/components/admin-columns.tsx`), its actions and its data wiring. The bespoke table, delete dialog and three hand-written paginations were removed. The admin dashboard became a section index.
- **Why:** Part 2 rule: reuse before writing. Every list gets the same accessibility (sort state, labelled checkboxes, focus to Cancel in confirmations), the same SSR and no-JS behaviour, and the same look.
- **Alternatives considered:** TanStack Table. Sorting, paging and filtering happen on the server here, so a headless table engine would add a dependency for column visibility and selection, both of which are a few lines. It can still be adopted inside `DataTable` later without changing its props.

## 0086: `zod` resolves to a configured module (jitless before any schema exists)

- **What:** The bare specifier `zod` is aliased (`vite/zod-alias.ts`, used by the app, Storybook and Vitest configs) to `src/lib/zod.ts`, which imports `zod/v4`, calls `z.config({ jitless: true })` and re-exports everything. The side-effect module `src/lib/zod-config.ts` and its "import first" lines in the entries are gone. `tests/unit/zod-config.test.ts` guards it.
- **Why:** In Zod 4.6, creating a `z.object` already runs the eval probe (not just the first parse). After this task's refactor, Rolldown evaluated the chunk with the preferences and list schemas before the chunk that set jitless, and every page reported a CSP `eval` violation. "Import it first" depends on chunk order. Being the module that `zod` resolves to makes it an ES-module guarantee.
- **Alternatives considered:** Importing the config in every file with module-level schemas: easy to forget. Allowing `'unsafe-eval'` in the CSP: no.

## 0087: Story tests need no setup file; unused messages fail the build

- **What:** `addon-vitest` applies the preview and addon annotations itself (Storybook ≥ 10.3), so `.storybook/vitest.setup*.ts` were removed. The Nepali/dark pass is selected with a `STORYBOOK_VARIANT` define (`vitest.config.ts`), and `.storybook/preview.tsx` reads it for `initialGlobals`. A `VariantProbe` story asserts each pass really runs in its locale and theme. `tests/i18n/message-usage.test.ts` fails when a message key is referenced nowhere. The 19 dead keys found (16 replaced by shared `table_*`/`pagination_*`/`common_*` keys, plus 3 that were already unused) were deleted. jsdom gets a `scrollTo` stub, which silences "Not implemented" noise from router scroll restoration.
- **Why:** These clear two notices that printed on every test run, and keep the message files from collecting dead translations.

## 0088: Filters are one GET form of native controls; arrays are repeated keys

- **What:**
  - **The form:** `<FilterBar>` (`src/components/filters/`) is a `<form method="get">` with no `action`, so it submits to the current URL in any locale. It wraps native controls: `SearchFilter`, `SelectFilter` (a styled native `<select>`, `ui/native-select.tsx`), `MultiSelectFilter` (checkboxes in a `<details>` dropdown), `BooleanFilter`, `NumberRangeFilter` and `DateRangeFilter` (`<input type="date">`).
  - **With JavaScript:** a change updates the URL at once. Text, number and date inputs wait 400 ms and replace the history entry. The page resets to 1, and the `preserve`d params (sort, page size) are kept. Controls are uncontrolled and re-synced from the URL after back/forward, a chip or "Clear all", skipping the field being typed in.
  - **Chips:** `<ActiveFilters>` shows one removable chip per applied filter, plus "Clear all". These are links (`SearchLink`).
  - **URL format:** the router's `stringifySearch` (`src/lib/search.ts`) writes arrays as repeated keys (`tags=a&tags=b`), the format HTML forms submit; parsing already reads them as arrays.
  - **Params:** `arrayParam`, `numberParam`, `dateParam` and `booleanParam` accept what forms send (empty means "not set"), and `.catch` bad values.
- **Why:** The same URL comes out with or without JavaScript, filters render on the server, and every state can be shared. Native controls work before hydration. The Radix Select, used for the old status filter, did nothing without JS. A `<details>` dropdown opens without JS and floats, so opening it causes no layout shift.
- **Alternatives considered:**
  - TanStack's default JSON arrays (`tags=%5B%22a%22%5D`): unreadable, and different from what a form submits.
  - Controlled inputs keyed by URL value: remounting while typing loses focus.
  - Radix popovers: they need JS.
  - A localized date picker: its native counterpart needs no JS and is accessible; dates still show localized in the chips.

## 0089: Search-driven lists keep showing results while new ones load

- **What:** List loaders call `loadList(queryClient, options, cause)` (`src/lib/query.ts`). On SSR and when entering the route, it awaits the data as before. When only the search changes on the same route (`cause: "stay"`), it prefetches without awaiting, so the navigation commits immediately. Pages read the data with `useListQuery` (`src/lib/use-list-query.ts`): `useQuery` with `placeholderData: keepPreviousData`. Its `busy` flag also covers the router's own pending state. The table and grids dim (`aria-busy`) while busy. Parameters that only open a dialog (`edit`, `view`) are left out of `loaderDeps`.
- **Why:** A loaderDeps change creates a new match. If loading takes longer than `pendingMs`, the router swaps in the pending component, which unmounted the filter being typed in and moved the page. Measured with 2.5 s of latency: before, a skeleton flash and lost focus; after, focus and text are kept and the old rows dim until the new ones arrive.
- **Alternatives considered:** Raising `pendingMs`, which only delays the flash. Disabling the pending component, which would also remove it when entering a route.

## 0090: The admin guard checks the server when entering the area, not on every inner navigation

- **What:** `_admin`'s `beforeLoad` calls the `ensureAdmin` server function on SSR and whenever the admin area is entered. On navigations inside it (`cause: "stay"`), it reuses the session the root route already loaded, if that session is an admin's; otherwise it still asks the server. This revises the "on every navigation" rule of decision 0043.
- **Why:** Every filter change paid a full round trip before the list could even start loading. That doubled the latency and, on slow networks, triggered the pending screen (0089). The guard is a UX gate. The security boundary is `requireAdminMiddleware` on every admin server function, which still runs on every call, so a revoked admin gets FORBIDDEN on the next data request. Task 20 (RBAC) builds on the same split.

## 0091: Route masking for the edit dialog and quick view; masked links always unmask on reload

- **What:**
  - **Admin "Quick edit":** opens the edit form in a dialog over the list. The real location is `/admin/test-crud?edit=<id>`; the address bar shows `/admin/test-crud/<id>`.
  - **Public "Quick view":** opens over the grid. The real location is `/test-crud?view=<slug>`; it shows the canonical `/test-crud/<slug>`.
  - **The links** (`features/test-crud/components/masked-links.tsx`) pass `mask: { …, unmaskOnReload: true }`, and their href is the masked URL.
  - **Closing** (`useCloseOverlay`) goes back in history when it can, otherwise it removes the param.
  - **Data:** the dialogs load with `useQuery` and show inline skeletons. The edit form gained `onSaved`/`onCancel`.
- **Why:**
  - **SSR:** masks persist in history state, and by default a reload keeps them. The server never sees history state, though: it renders the masked URL, so the client must render the same page or hydration breaks. `unmaskOnReload` makes reload, sharing, new tabs and no-JS clicks all land on the full page.
  - **Closing:** going back means Back after closing doesn't reopen the dialog, and the list underneath (filters, scroll) is exactly as it was.
- **Verified:**
  - **jsdom:** href, masked address, Back/Forward and a fresh load of the masked URL.
  - **Production:** open, save, Escape, Back/Forward, reload to the full page, and axe on the open dialogs.

## 0092: Path params are validated by the route (`params.parse`), not in loaders

- **What:** `/admin/test-crud/$id` (UUID) and `/test-crud/$slug` (slug pattern) use `params: { parse: (raw) => parseParams(schema, raw) }`. `parseParams` returns the parsed params, or `false` so the route doesn't match. The loaders no longer re-check.
- **Why:** This is TanStack Router's documented contract: `false` means "no match", so the request falls through to the localized not-found page with a real 404 status, and loaders and components get typed params. Verified: `/test-crud/Not_A_Slug` and `/admin/test-crud/not-a-uuid` return 404.

## 0093: Date filters are calendar days in the app time zone, compared as instants

- **What:** `?from=`/`?to=` are `YYYY-MM-DD`. `dayRangeInZone` (`src/lib/date-only.ts`) turns them into `[start of from, start of the day after to)` in `APP_TIME_ZONE` (Asia/Kathmandu), using Intl offsets (correct across DST, tested with New York). `dateRange(column, from, to)` (`src/server/db/list.ts`) compares the timestamp column with those instants. Also added: `numberRange`, `overlapsAny` (array `&&`) and a GIN index on `test_crud.tags` plus a B-tree index on `price` (migration 0003).
- **Why:** Dates are displayed in Nepal time (0025), so "published on 2 Sep" must mean the Nepal day, not the UTC day: 18:20 UTC on 1 Sep is already 2 Sep in Nepal, and the tests cover that edge. Comparing instants keeps indexes usable, which `AT TIME ZONE` on the column would not.

## 0094: Roles and permissions live in app tables; Better Auth keeps identity, sessions and the admin flag

- **What:**
  - **Catalog:** the permission catalog is code: `src/features/rbac/permissions.ts`, with `"<resource>:<action>"` strings and a localized label for each (`labels.ts`, typed as `Record<Permission, …>` so none can be missing).
  - **Tables:**
    - `role`: the seeded system roles `admin` and `user` (migration 0005) plus custom roles;
    - `role_permission`;
    - `user_role`: custom roles only.
  - **Admin:** Better Auth's `user.role = "admin"` remains the one admin flag. It's what `pnpm db:seed-admin` and Better Auth's own admin endpoints use, and it grants every permission implicitly. `user` is everyone's baseline (it starts empty).
  - **Ban:** a ban sets `user.banned` and deletes the user's sessions in one transaction. Better Auth's admin plugin then refuses new sign-ins.
- **Why:** Better Auth's admin-plugin roles are defined statically in code. Its database-stored roles ("dynamic access control") belong to the organization plugin and are scoped to organizations and their members, which this app doesn't have. Admins have to be able to create roles and tick permissions at runtime, so roles are app data. Keeping the admin flag where Better Auth has it avoids a second, drifting source of truth.
- **Alternatives considered:**
  - The organization plugin with one implicit organization: more tables and APIs for no benefit.
  - Roles as a comma-separated `user.role`: no foreign keys, and no clean place for permissions.
  - Better Auth's `banUser` endpoint: it checks Better Auth's static roles, so a custom role holding `users:ban` couldn't use it.

## 0095: Every server function names its permission; pages guard by permission; the UI only hides

- **What:**
  - **Per request:** `getServerSession` resolves the user's permissions from the database on every request: one query, or none for admins; banned users get none. They travel in the `Session`.
  - **Server functions:** each one runs `requirePermission("<resource>:<action>", …)`, for example `test-crud:publish` for publishing. A test checks every function in `src/functions/test-crud.ts` and `rbac.ts` against an explicit name-to-permission table.
  - **Admin area:** the `_admin` gate needs any permission (`ensureAdminAccess`).
  - **Routes:** each section route calls `assertRoutePermission(context.session, …)` in `beforeLoad`, which gives the localized FORBIDDEN page with a real 403 during SSR.
  - **UI:** `useCan`, `<Can>` and `usePermissions` decide what to show: sidebar sections, dashboard cards, buttons, row actions, bulk selection.
  - **Client:** `hydrateRoot`'s `onCaughtError` no longer logs expected app errors (status < 500); everything else is logged as before.
- **Why:** The server is the authority, and naming the permission at each function makes the mapping reviewable and testable. Resolving per request means removing a permission takes effect on the user's next request.
- **Verified live (production build):**
  - An Editor's replayed "publish" call came back `FORBIDDEN` / "Missing permission: test-crud:publish", and the item stayed unchanged. Start transports function errors in the payload with HTTP 200, as already noted in 0070.
  - The Editor's direct visits to Users, Roles and Permissions returned a 403 page.
  - After the admin revoked "create", the Editor's next request to the new-item page returned 403.

## 0096: Rules against self-escalation and lockout

- **What** (`src/server/rbac/service.ts`, enforced on the server whatever the UI shows):
  - The admin role is fixed: it has every permission, and its permissions can't be edited.
  - Only admins change who is an admin. Non-admins can't change an admin's roles or ban an admin.
  - There is always at least one active admin: you can't demote or ban the last one.
  - Nobody changes their own roles or bans themselves.
  - A non-admin can only grant, revoke, hand out or take away permissions they hold themselves. This covers matrix edits, role assignments and role deletion.
  - System roles can't be renamed or deleted. Custom role names are unique, case-insensitively.
- **Messages:** rule violations carry a localized explanation in `fieldErrors._form` (`ruleError`), which `errorMessage()` shows instead of the generic text for the code.
- **Tests:** PGlite tests cover each rule, including a `roles:manage` holder trying to grant themselves `users:ban` and a `users:update` holder handing out a stronger role. The UI mirrors the rules by disabling what the actor can't change.

## 0097: The permission matrix saves each change optimistically and rolls back on refusal

- **What:**
  - **Layout:** roles are columns; permissions are rows grouped by resource, each group with an "all" box that is indeterminate when partly granted. The first column is sticky so the matrix scrolls sideways on phones.
  - **Saving:** each change is one `updateRolePermissions({ roleId, grant, revoke })` call, run as a TanStack Query mutation. `onMutate` updates the cached roles, `onError` restores them and shows a toast, and `onSettled` refetches roles and the session.
  - **Disabled cells:** the Admin column, everything for read-only viewers, and permissions a non-admin doesn't hold.
- **Why:** Instant feedback and no "Save" step to forget. A rule violation or a network failure visibly undoes itself. Plain Query mutations are enough here; the roles list is small and has no paging that would call for a TanStack DB collection.

## 0098: Attachments: signed direct uploads to Cloudinary, verified on the server

- **What:**
  - **Upload flow:** the browser asks `signImageUpload` (permission `attachments:upload`) for a ticket. The server picks the `public_id` (`<CLOUDINARY_FOLDER>/<scope>/<uuid>`) and signs it together with `allowed_formats` and `overwrite=false`. The browser then POSTs the file straight to Cloudinary (XHR, for progress and cancel). `confirmImageUpload` reads the asset back through Cloudinary's Admin API, checks the format and the size (10 MB), and records an `attachment` row as *pending*.
  - **Linking:** the item's own save links pending uploads, in the user's order with their alt text, in the same transaction (`syncEntityAttachments`). Only the user's own pending uploads, or images already on that item, can be linked.
  - **Removal:** images an item drops, and the images of deleted items, are marked removed. Their assets are deleted at once when Cloudinary answers. A daily Vercel Cron job (`/api/cron/attachments`, bearer `CRON_SECRET`) deletes what's left, plus day-old orphans.
  - **Delivery:** URLs are built on the server (`ImageAsset`: `full`, a 16:9 `cover` and a `thumb`, each with a `srcSet` using `f_auto,q_auto`). `CloudImage` renders them with width/height, `sizes` and lazy loading; the detail page's cover is eager with high fetch priority. The CSP allows Cloudinary's upload origin (`connect-src`) and delivery origin (`img-src`) only when it's configured.
  - **Unconfigured:** without the three `CLOUDINARY_*` variables, uploads are refused with a clear message and items have no images.
  - **Client:** a thin client over Cloudinary's REST API (`src/server/attachments/cloudinary.ts`) instead of the SDK.
- **Why:**
  - **Direct uploads:** files never pass through our server (no body-size limits, no memory pressure).
  - **The signature:** it fixes where a file goes and which formats Cloudinary accepts.
  - **Size limit:** Cloudinary has no size parameter for signed uploads, so the size is enforced from the Admin API's authoritative `bytes`, and an oversized asset is deleted.
  - **Pending, then linked:** a failed or abandoned form can't attach anything to an item, and orphans are cleaned up.
  - **Server-built URLs:** the browser needs no Cloudinary config, and every image gets one consistent set of transformations.
  - **REST over the SDK:** the SDK is CommonJS with dependencies, and the four calls used are small. Signing follows Cloudinary's documented algorithm, and the test reproduces the documentation's example signatures.
- **Legacy images:** Test CRUD's Postgres images (decision 0067) are no longer read. `pnpm attachments:import-legacy` moves existing ones to Cloudinary; the old table and column stay until that has run, then a migration can drop them.
- **Verified live** against a real Cloudinary account (production build, all test assets deleted afterwards):
  - **Upload and save:** uploading two images straight to Cloudinary, verification, saving in a chosen order with alt text.
  - **Public pages:** responsive delivery on cards and the detail page (no layout shift, no CSP violations), and the cover as `og:image`.
  - **Cloudinary-side rules:** it refused an SVG outside the signed formats and a reused signature for another `public_id`.
  - **Clean-up:** discard before saving, item deletion, and the cron cleanup each deleted the assets.
  - **Permissions:** no picker without `attachments:upload`.
- **Alternatives considered:**
  - Unsigned upload presets: anyone could upload.
  - Streaming uploads through our server: memory and time limits on Vercel.
  - Cloudinary's Upload Widget: a third-party script under our CSP, and not our UI.
  - Verifying only the upload response signature: it proves the asset exists, but its size and format fields aren't signed.

## 0099: The image editor is a feature field; concurrent uploads append atomically

- **What:**
  - **The field:** `AttachmentsField` (`src/features/attachments/components`) is used inside `form.AppField`. Its value is `{ id, alt, preview }[]`, and `toTestCrudInput` sends ids and alt text only.
  - **Editing:** a native file picker or drag-and-drop adds images. Up/down buttons reorder them, with drag-and-drop as a bonus. Each image has an alt-text input and a remove button, the first image is marked as the cover, and a live region announces changes.
  - **Without permission:** a user without `attachments:upload` can still reorder, describe and remove images, but not add them.
  - **Busy state:** the form refuses to submit while uploads are running.
  - **Concurrency:** finished uploads are added with TanStack Form's `pushValue`.
- **Why:** The first version appended to the value read when the upload started, so when two uploads finished together one image was lost. The live test caught it, and a regression test now fails without the fix. The field lives in the feature, not the generic field library, because it calls the app's server functions.

## 0100: Every page is indexable through seo() or private through noindex; a test checks every route

- **What:**
  - **Indexable pages** (home, `/stack`, `/test-crud`, items) build their head with `seo()` (`src/lib/seo.ts`):
    - title, description and `robots: index, follow, max-image-preview:large`;
    - a canonical, and `hreflang` alternates for en, ne and `x-default`;
    - Open Graph and Twitter tags with an image that always exists: the item's own, or `public/og-default.png`;
    - JSON-LD.
  - **Lists** use `listSeo()`: page 1 is canonical at the bare path; later pages are their own canonical URLs with "page N" in the title and description; searches are `noindex, follow`; sort doesn't change the canonical.
  - **Private pages** get `noindex, nofollow`. The `_admin`, `_auth` and `_authed` layouts set it for all their children (TanStack keeps the deepest route's meta per name, so a child that sets only a title inherits it). Single pages under `_public` (health, reset-password, verify-email, dev) use `privateHead()`.
  - **The test:** `tests/unit/route-seo.test.ts` builds the real router, computes each page's merged head the way the router does, in both languages. It checks:
    - the indexable pages' tags, and that their titles and descriptions are unique;
    - that every other page is noindex.
    A new page that is neither fails it.
- **Why:**
  - **Layout-level noindex:** a private page can't be forgotten; the test catches anything outside the layouts.
  - **Paginated pages self-canonical:** Google no longer uses rel=prev/next and recommends that each page of a series be its own canonical. Pointing them all at page 1 hides the items on later pages.
  - **Searches noindex but followed:** search result URLs are infinite and thin, but their links lead to real pages.
  - **A default image:** shared links always get a large preview card instead of a text-only card.
- **theme-color:** rendered in the document head from the theme preference: one colour, or both with media queries for "system". `head()` can't do this because the router dedupes meta by name.
- **Alternatives considered:**
  - `noindex` via an `X-Robots-Tag` header in middleware: invisible in the page, and it duplicates route knowledge in a path list.
  - Disallowing every private path in robots.txt: crawlers then never see the `noindex`, and a linked URL can still be indexed without content.

## 0101: The sitemap, robots.txt and manifest are Start server routes built from the same data as the pages

- **What:**
  - **`/sitemap.xml`:**
    - Contents: the home page, `/stack` with its later pages, `/test-crud` with its later pages, and every published item (`lastmod` from `updated_at`; the list uses the newest item's).
    - Format: each page appears once per language, and each `<url>` lists all `hreflang` alternates, as Google documents for localized sitemaps.
  - **`/robots.txt`:** allows everything except `/admin`, `/ne/admin`, `/api/` and `/_serverFn/`, and names the sitemap.
  - **`/manifest.webmanifest`:** localized; the root head links `/ne/manifest.webmanifest` on Nepali pages. Icons: 192, 512 and a maskable 512.
  - **Routes:** the handlers live in `src/server/seo/` behind `.ts` route files with only `server.handlers`. `/ne/sitemap.xml` and `/ne/robots.txt` are 404s (the router maps `/ne/*` onto every route, so the handler checks the path). Responses are cached at the edge for an hour.
  - **Import boundary:** the rule now recognises such server routes structurally (a `.ts` route file with `server.handlers` and no component) instead of only `src/routes/api/`.
- **Why:**
  - **From the database at request time:** a newly published item is listed without a rebuild.
  - **The same page list:** the sitemap's pages match what `seo()` marks indexable (page N URLs are built the same way as `listSeo()`), so no page is listed that says noindex.
  - **Server routes over Nitro routes:** they get the locale middleware and the app's server-only import protection. Nitro routes stay for endpoints outside Start, such as the cron job.
- **Static files:** the icons and `og-default.png` are generated from the logo mark and live in `public/`. They are replaced at the same sizes to rebrand (see docs/guides/seo.md).

## 0102: JSON-LD is typed with schema-dts and emitted through route heads; items are Products

- **What:**
  - **Builders:** `src/lib/structured-data.ts` returns schema-dts types: `organizationJsonLd`, `websiteJsonLd` and `productJsonLd`.
  - **Emitting:** `seo({ jsonLd })` adds each one as a head entry `{ "script:ld+json": data }`. TanStack renders that as `<script type="application/ld+json">` with `<`, `>` and `&` escaped as JSON unicode escapes, so content can't close the tag. The entries swap on client navigation like the rest of the head.
  - **Home:** `WebSite` (in the page's language) and `Organization` (`@id` `<site>/#organization`, logo `/icon-512.png`). Other entities refer to it by `@id`.
  - **Test CRUD item:** `Product` with an `Offer`: price with two decimals, NPR, `InStock`, URL, and seller and brand pointing at the Organization. It also has images (the 1200×630 `og` renditions), keywords from the tags, and `releaseDate`. The page keeps `og:type=article` with `article:published_time`.
  - **BreadcrumbList:** unchanged (0083): rendered by `<Breadcrumbs jsonLd>` in the body.
  - **Per-item Open Graph image:** a new `ImageAsset.og` URL (`c_fill,g_auto,w_1200,h_630,f_jpg,q_auto`), with the image's alt text, or the item title when it has none.
- **Why:**
  - **schema-dts:** it is the schema.org vocabulary as TypeScript types, so "validated against the schema.org types" holds at compile time at zero runtime cost (types only). The route test pins the exact output.
  - **Product, not Article:** items have a price, and Google's product snippets need `offers`. The body text doesn't make them articles.
  - **A JPEG `og` rendition:** some crawlers don't read AVIF or WebP from `f_auto`, and 1200×630 is the size every platform's large card expects.
- **The cast:** React's `<meta>` props type doesn't list the `script:ld+json` key the router accepts. `jsonLdMeta()` casts it in one documented place.
- **Alternatives considered:**
  - Rendering JSON-LD `<script>` tags in page components: they stay in the body, and data needed by the head would be duplicated in components.
  - A `@graph` per page: one more nesting level for no gain at this size.

## 0103: Module examples are dev-only routes over in-memory data, guarded by one layout

- **What:**
  - **Pages:** `/dev/examples` lists 14 example pages, one per module: loader + Query, streaming, filters, masking, forms, DataTable, optimistic update, preferences, permissions, attachments, SEO, i18n, errors, analytics and flags.
    - Each page is a real route under `src/routes/_public/dev/examples/` that uses the same building blocks as the app.
    - Each shows its source file and guide (`ExamplePage`), and the guides link back.
  - **Registry:** `features/dev/examples/registry.ts` drives the index; a test checks it against the route tree, and that every source and guide file exists.
  - **One guard:** `src/routes/_public/dev/route.tsx`'s `beforeLoad` throws `notFound()` when `import.meta.env.DEV` is false, so every `/dev` page (examples and `/dev/forms`) is the localized 404 in builds, before any loader runs. Its head is `noindex`.
  - **Server functions:** in `src/functions/examples.ts` behind `devOnlyMiddleware` (NOT_FOUND in builds). The permission example's two functions are in `examples-permissions.ts`; they run `requirePermission` first like every guarded function (the guarded-functions test covers that file), then the dev check.
  - **Data:** an in-memory task list in the dev server process (`src/server/examples/tasks.ts`), with fixed ids and dates. It is shared by the filters, DataTable, masking and optimistic examples, and the DataTable page can reset it.
  - **Uploads:** they use a new `examples` scope (`UPLOAD_SCOPES`), so example uploads land in their own Cloudinary folder. They're never linked, so the daily cleanup deletes them.
- **Why:**
  - **Real routes, not stories:** the patterns are about loaders, SSR, URLs, server functions and the router (masking, streaming, status codes), which only a running app shows.
  - **In-memory data:** examples can be clicked freely (bulk delete, refusals) without touching the database or needing a migration, and the store module is never part of a client bundle.
  - **The layout guard:** one place decides that /dev doesn't exist in production; the per-function middleware covers direct calls to the endpoints.
- **The manifest moved to a Nitro route:** the live check found `/manifest.webmanifest` 404 in dev. Browsers fetch it with `Sec-Fetch-Dest: manifest`, and Nitro's dev server sends non-document destinations to Vite unless a Nitro route matches (as with images, 0067). It is now `src/server/routes/manifest.ts`, registered per locale in `vite.config.ts`, with the locale taken from the path. Production behaved the same either way; dev logged an error on every page.
- **Verified:**
  - **Statuses:** every page answers 200 in dev; missing and invalid ids, `notFound()`, a refusal and a crash give 404, 404, 403 and 500.
  - **Browser review** (axe, overflow, console, CSP, CLS; en/ne × light/dark × 390/768/1280; 228 loads):
    - **Where:** on a production build with the /dev guards temporarily turned off (then restored and rebuilt).
    - **Why not dev:** dev skips font preloads (src/lib/fonts.ts), so the first paint uses fallback metrics. That wrapped a long breadcrumb 1 px earlier and registered as CLS that production doesn't have.
    - **Result:** one real issue, now fixed: permission badges overflowed at 390 px in Nepali (`Facts` now stacks on phones).
  - **Scripted flows:** no request while hydrating; streaming fallback then value; the filter URL; the masked dialog, Back and reload; a server field error; the bulk action; optimistic success and rollback; the theme surviving a reload; the server's permission answers for an admin and an editor; the action-error toast; consent changes.
  - **Production build:** all of `/dev/*` is 404.
- **Alternatives considered:**
  - Storybook stories: no router, loaders or server functions.
  - Examples on the database (a seeded table): a migration and cleanup for development-only data.
  - An env flag to enable the pages in production: the brief says unreachable in production, and `import.meta.env.DEV` is a build-time constant.

## 0104: Forms handled in JavaScript use method="post"

- **What:** the shared `Form` (useAppForm) and every hand-written form (sign-in, register, sign-in code, forgot and reset password, verify email, account) set `method="post"`. FilterBar keeps `method="get"`, because its values belong in the URL. `tests/unit/form-method.test.ts` checks every `<form>` in `src`.
- **Why:**
  - **The problem:** a form without a method submits as GET. A submit before hydration (a slow phone, a click during load) then put the fields in the URL: passwords in the address bar, history, referrers and server logs. The dev examples' scripted flows hit exactly that (`?username=…&email=…`) while the dev server was busy.
  - **The fix:** with POST, a pre-hydration submit sends the values in the body. The server renders the page again (a page URL accepts POST and ignores the body), and the user simply submits again once it has loaded.
- **Verified:** with JavaScript off, submitting the sign-in form and the examples form leaves the URL unchanged. With JavaScript, the forms behave as before (unit tests, the auth flows and the example flows).
- **Alternatives considered:**
  - Disabling submit buttons until hydration: the buttons change state after load, and nothing at all works without JavaScript.
  - `action="javascript:void(0)"`: blocked by the CSP and flagged by React.
