# Decisions

Record every non-obvious choice here: **What**, **Why**, **Alternatives considered**. Newest entries at the bottom.

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
- **Verification:** A real Postgres 17 (embedded, local) was used because Docker wasn't available and no Neon credentials were configured yet. All four `db:*` scripts worked, and migrations applied to a fresh database. `/health` rendered OK with JS on and off, and "Unreachable" with no leaked details when the port was wrong. The check against a real Neon database is still pending.

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
