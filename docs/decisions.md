# Decisions

Record every non-obvious choice here: **What**, **Why**, **Alternatives considered**. Newest entries at the bottom.

<details>
<summary>Index (177 entries)</summary>

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
- [0101](#0101-the-sitemap-robotstxt-and-manifest-are-built-from-the-same-data-as-the-pages-the-manifest-is-a-nitro-route): The sitemap, robots.txt and manifest are built from the same data as the pages; the manifest is a Nitro route
- [0102](#0102-json-ld-is-typed-with-schema-dts-and-emitted-through-route-heads-items-are-products): JSON-LD is typed with schema-dts and emitted through route heads; items are Products
- [0103](#0103-module-examples-are-dev-only-routes-over-in-memory-data-guarded-by-one-layout): Module examples are dev-only routes over in-memory data, guarded by one layout
- [0104](#0104-forms-handled-in-javascript-use-methodpost): Forms handled in JavaScript use `method="post"`
- [0105](#0105-sections-can-opt-out-of-the-app-header-with-staticdatachrome): Sections can opt out of the app header with `staticData.chrome`
- [0106](#0106-portfolio-content-sits-behind-a-portfoliosource-port-the-demo-adapter-lazy-loads-fixtures): Portfolio content sits behind a `PortfolioSource` port; the demo adapter lazy-loads fixtures
- [0107](#0107-portfolio-content-is-localized-in-the-data--en-ne--ui-chrome-in-paraglide): Portfolio content is localized in the data (`{ en, ne }`), UI chrome in Paraglide
- [0108](#0108-the-portfolios-design-system-is-scoped-under-portfolio-generated-art-fonts-pinned-to-an-optical-size): The portfolio's design system is scoped under `.portfolio`; generated art; fonts pinned to an optical size
- [0109](#0109-portfolio-motion-is-css-only-scroll-driven-animations-clip-path-reveals-and-view-transitions): Portfolio motion is CSS only: scroll-driven animations, clip-path reveals and View Transitions
- [0110](#0110-the-portfolio-is-dressed-as-dhaka-cloth-anek-type-generated-weaves-no-house-style-defaults): The portfolio is dressed as Dhaka cloth: Anek type, generated weaves, no house-style defaults
- [0111](#0111-loaders-read-through-ensurequery-not-the-deprecated-ensurequerydata): Loaders read through ensureQuery(), not the deprecated ensureQueryData
- [0112](#0112-better-auths-admin-endpoints-are-disabled-over-http): Better Auth's admin endpoints are disabled over HTTP
- [0113](#0113-expired-sessions-are-handled-by-a-global-client-middleware-not-an-http-interceptor): Expired sessions are handled by a global client middleware, not an HTTP interceptor
- [0114](#0114-session-tokens-stay-on-the-server-the-account-page-revokes-sessions-by-id): Session tokens stay on the server; the account page revokes sessions by id
- [0115](#0115-the-last-admin-guard-locks-the-admin-rows-inside-the-changes-transaction): The last-admin guard locks the admin rows inside the change's transaction
- [0116](#0116-list-pages-share-uselistpage-and-tablelistinput): List pages share useListPage() and tableListInput()
- [0117](#0117-every-server-function-file-is-declared-in-the-guard-test-demo-data-is-a-seeded-script): Every server function file is declared in the guard test; demo data is a seeded script
- [0118](#0118-knip-guards-against-dead-code-cn-date-fns-and-dbpush-removed): Knip guards against dead code; `cn`, `date-fns` and `db:push` removed
- [0119](#0119-version-pinning-caret-by-default-exact-only-with-a-reason): Version pinning: caret by default, exact only with a reason
- [0120](#0120-ci-on-github-actions-git-hooks-with-lefthook-dependabot-for-updates): CI on GitHub Actions, git hooks with lefthook, Dependabot for updates
- [0121](#0121-the-browser-review-is-a-playwright-suite-against-a-harnessed-production-server): The browser review is a Playwright suite against a harnessed production server
- [0122](#0122-edits-carry-the-version-they-started-from-a-stale-save-is-a-conflict): Edits carry the version they started from; a stale save is a CONFLICT
- [0123](#0123-one-request-id-per-request-kept-in-asynclocalstorage-by-the-server-entry): One request id per request, kept in AsyncLocalStorage by the server entry
- [0124](#0124-get-apihealth-for-monitors-the-health-page-stays-for-people): GET /api/health for monitors; the /health page stays for people
- [0125](#0125-idempotency-keys-are-a-recipe-not-core): Idempotency keys are a recipe, not core
- [0126](#0126-two-factor-is-totp-with-backup-codes-admins-can-be-required-to-use-it): Two-factor is TOTP with backup codes; admins can be required to use it
- [0127](#0127-breached-passwords-are-refused-through-have-i-been-pwned-on-by-default): Breached passwords are refused through Have I Been Pwned, on by default
- [0128](#0128-turnstile-on-the-endpoints-that-send-email-or-create-accounts-plus-a-honeypot): Turnstile on the endpoints that send email or create accounts, plus a honeypot
- [0129](#0129-account-deletion-always-takes-an-emailed-link-the-export-is-a-json-download): Account deletion always takes an emailed link; the export is a JSON download
- [0130](#0130-linked-accounts-add-a-password-link-and-unlink-google-never-the-last-way-in): Linked accounts: add a password, link and unlink Google, never the last way in
- [0131](#0131-last-login-method-and-passkeys-are-recipes): Last login method and passkeys are recipes
- [0132](#0132-admin-actions-are-audited-in-the-same-transaction-as-the-change): Admin actions are audited in the same transaction as the change
- [0133](#0133-inviting-a-user-creates-the-account-and-emails-a-long-lived-reset-token): Inviting a user creates the account and emails a long-lived reset token
- [0134](#0134-impersonation-is-admin-only-audited-and-cant-change-the-account): Impersonation is admin-only, audited, and can't change the account
- [0135](#0135-better-auths-role--admin-stays-the-superuser-flag): Better Auth's `role = "admin"` stays the superuser flag
- [0136](#0136-the-react-compiler-runs-on-client-builds-through-babel): The React Compiler runs on client builds, through Babel
- [0137](#0137-a-skip-link-on-every-page-reduced-motion-finishes-animations-at-once): A skip link on every page; reduced motion finishes animations at once
- [0138](#0138-real-user-web-vitals-go-to-posthog-after-consent): Real-user Web Vitals go to PostHog, after consent
- [0139](#0139-csp-violations-are-reported-to-apicsp-report-and-forwarded-to-sentry): CSP violations are reported to /api/csp-report and forwarded to Sentry
- [0140](#0140-the-admin-command-palette-and-view-transitions-are-a-recipe): The admin command palette and view transitions are a recipe
- [0141](#0141-pnpm-newfeature-generates-an-admin-crud-section-from-templates-and-marker-lines): `pnpm new:feature` generates an admin CRUD section from templates and marker lines
- [0142](#0142-pnpm-strip-demo-removes-the-demo-by-file-list-markers-and-unused-messages): `pnpm strip-demo` removes the demo by file list, markers and unused messages
- [0143](#0143-routes-stay-thin-claudemd-keeps-only-the-pitfalls-that-apply-everywhere): Routes stay thin; CLAUDE.md keeps only the pitfalls that apply everywhere
- [0144](#0144-two-part-3-bugs-found-by-the-e2e-suite): Two Part 3 bugs found by the e2e suite
- [0145](#0145-background-jobs-and-cursor-pagination-are-recipes): Background jobs and cursor pagination are recipes
- [0146](#0146-server-function-rate-limits-are-stored-in-better-auths-rate_limit-table): Server-function rate limits are stored in Better Auth's `rate_limit` table
- [0147](#0147-public-page-caching-is-a-header-helper-not-a-default): Public-page caching is a header helper, not a default
- [0148](#0148-contact-form-avatar-upload-and-list-extras-are-examples-to-copy): Contact form, avatar upload and list extras are examples to copy
- [0149](#0149-pnpm-devoffline-runs-on-in-memory-pglite-with-every-outside-service-off): `pnpm dev:offline` runs on in-memory PGlite with every outside service off
- [0150](#0150-preview-branches-changelog-checks-organizations-and-billing-are-documented-not-wired): Preview branches, changelog checks, organizations and billing are documented, not wired
- [0151](#0151-every-pages-javascript-has-a-budget-and-route-options-stay-light): Every page's JavaScript has a budget, and route options stay light
- [0152](#0152-browser-sentry-loads-after-the-entry-chunk): Browser Sentry loads after the entry chunk
- [0153](#0153-the-session-is-resolved-once-per-request): The session is resolved once per request
- [0154](#0154-feature-flags-never-wait-more-than-300-ms): Feature flags never wait more than 300 ms
- [0155](#0155-dev-speed-one-message-module-per-locale-babel-only-on-our-code-a-local-database): Dev speed: one message module per locale, Babel only on our code, a local database
- [0156](#0156-pnpm-setuplocal-and-pnpm-diagnose): `pnpm setup:local` and `pnpm diagnose`
- [0157](#0157-inlang-cli-for-machine-translation-and-checks-plugins-load-from-node_modules): inlang CLI for machine translation and checks; plugins load from node_modules
- [0158](#0158-srclib-is-grouped-by-area-and-biome-enforces-the-import-boundaries): `src/lib` is grouped by area, and Biome enforces the import boundaries
- [0159](#0159-tests-start-from-one-migrated-pglite-database-per-run): Tests start from one migrated PGlite database per run
- [0160](#0160-postgres-image-storage-from-part-1-is-dropped): Postgres image storage from Part 1 is dropped
- [0161](#0161-the-portfolio-is-the-site-at--each-layout-renders-its-own-header-sections-can-skip-the-session): The portfolio is the site at `/`; each layout renders its own header; sections can skip the session
- [0162](#0162-dev-pages-exist-in-dev-and-in-e2e-builds-dev_routes-a-production-deploy-refuses-the-flag): `/dev` pages exist in dev and in e2e builds (`DEV_ROUTES`); a production deploy refuses the flag
- [0163](#0163-pnpm-strip-demo-removes-layers-portfolio-apps-by-data-lists-and-markers-the-core-stays): `pnpm strip-demo` removes layers (portfolio, apps) by data lists and markers; the core stays
- [0164](#0164-graphite-layered-oklch-tokens-accent-radius-and-density-presets-on-html-contrast-tested): "Graphite": layered oklch tokens, accent, radius and density presets on `<html>`, contrast tested
- [0165](#0165-the-command-palette-is-part-of-the-admin-shell): The command palette is part of the admin shell
- [0166](#0166-the-admin-dashboard-reads-one-server-function-filtered-by-permission): The admin dashboard reads one server function, filtered by permission
- [0168](#0168-the-admin-component-kit-heavy-fields-arent-registered-dialogs-load-on-click-confirms-are-a-promise): The admin component kit: heavy fields aren't registered, dialogs load on click, confirms are a promise
- [0169](#0169-datatable-v2-runs-on-tanstack-table-v9-in-manual-mode): DataTable v2 runs on TanStack Table v9, in manual mode
- [0170](#0170-sortable-lists-use-dnd-kitreact-pinned-exactly-plus-alt--arrows): Sortable lists use `@dnd-kit/react`, pinned exactly, plus Alt + arrows
- [0171](#0171-charts-recharts-3-loaded-on-demand-into-a-fixed-size-frame-with-a-data-table-for-screen-readers): Charts: Recharts 3 loaded on demand into a fixed-size frame, with a data table for screen readers
- [0172](#0172-slugs-are-linked-to-their-source-checked-as-you-type-and-a-submit-waits-for-async-validation): Slugs are linked to their source, checked as you type, and a submit waits for async validation
- [0173](#0173-the-crud-standard-one-shape-shared-helpers-on-both-sides-every-section-on-it): The CRUD standard: one shape, shared helpers on both sides, every section on it
- [0174](#0174-admin-crud-writes-use-query-mutations-tanstack-db-is-for-client-first-apps): Admin CRUD writes use Query mutations; TanStack DB is for client-first apps
- [0175](#0175-pnpm-newfeature-v2-the-standards-shape---public-and---localized-and-a-clean-tree): `pnpm new:feature` v2: the standard's shape, `--public` and `--localized`, and a clean tree
- [0176](#0176-the-portfolios-content-lives-in-the-database-edited-in-the-admin-read-through-public-server-functions): The portfolio's content lives in the database, edited in the admin, read through public server functions
- [0177](#0177-a-media-library-items-reference-library-attachments-by-id-alt-text-in-both-languages): A media library: items reference library attachments by id; alt text in both languages
- [0178](#0178-missing-nepali-falls-back-to-english-marked-langen-on-the-record-or-block): Missing Nepali falls back to English, marked `lang="en"` on the record or block
- [0179](#0179-the-portfolio-is-himal-the-himalaya-from-kathmandu-printed-in-altitude-layers-in-fields-of-colour): The portfolio is "Himal": the Himalaya from Kathmandu, printed in altitude layers, in fields of colour
- [0180](#0180-the-generated-mountains-seeded-peaks-marching-squares-stacked-sheets-the-same-markup-everywhere): The generated mountains: seeded peaks, marching squares, stacked sheets, the same markup everywhere
- [0181](#0181-portfolio-motion-stays-css-plus-a-1-kb-pointer-drift-no-motion-library): Portfolio motion stays CSS, plus a 1 kB pointer drift (no Motion library)
- [0182](#0182-kathmandu-at-this-hour-the-sky-from-the-suns-real-position-hydrated-from-the-servers-read-time): "Kathmandu at this hour": the sky from the sun's real position, hydrated from the server's read time
- [0183](#0183-archival-pictures-public-domain-credited-printed-in-the-pages-two-inks): Archival pictures: public domain, credited, printed in the page's two inks
- [0184](#0184-eczar-for-display-in-both-scripts-preloaded-with-measured-fallbacks-per-weight): Eczar for display in both scripts, preloaded, with measured fallbacks per weight
- [0185](#0185-guest-sessions-better-auths-anonymous-plugin-no-permissions-refused-everywhere-an-account-is-needed): Guest sessions: Better Auth's anonymous plugin, no permissions, refused everywhere an account is needed
- [0186](#0186-guest-data-sample-rows-on-start-moved-to-the-account-on-sign-up-or-sign-in-deleted-after-7-days): Guest data: sample rows on start, moved to the account on sign-up or sign-in, deleted after 7 days
- [0187](#0187-the-showcase-apps-a-registry-in-two-halves-an-_apps-frame-every-row-owned): The showcase apps: a registry in two halves, an `_apps` frame, every row owned
- [0188](#0188-kanban-fractional-positions-moves-by-pointer-or-keyboard-optimistic-in-tanstack-db): Kanban: fractional positions, moves by pointer or keyboard, optimistic in TanStack DB
- [0189](#0189-tanstack-db-loads-only-with-the-pages-that-use-it): TanStack DB loads only with the pages that use it
- [0190](#0190-notes-full-text-search-with-the-simple-configuration-app-uploads-revocable-share-links): Notes: full-text search with the `simple` configuration, app uploads, revocable share links
- [0191](#0191-links-a-redirect-route-with-request-middleware-clicks-without-ips-moderation): Links: a redirect route with request middleware, clicks without IPs, moderation
- [0192](#0192-expenses-minor-units-per-currency-budgets-per-month-a-csv-import-that-runs-once): Expenses: minor units per currency, budgets per month, a CSV import that runs once
- [0193](#0193-habits-streaks-on-calendar-days-in-kathmandu-a-server-drawn-heatmap-optimistic-check-ins): Habits: streaks on calendar days in Kathmandu, a server-drawn heatmap, optimistic check-ins
- [0194](#0194-a-routes-loader-imports-its-queries-on-demand): A route's loader imports its queries on demand
- [0195](#0195-forms-field-definitions-as-data-one-schema-for-both-sides-a-public-page-outside-the-sections): Forms: field definitions as data, one schema for both sides, a public page outside the sections
- [0196](#0196-every-form-clears-a-fields-stale-errors-when-it-changes): Every form clears a field's stale errors when it changes
- [0197](#0197-every-route-loader-imports-its-queries-on-demand): Every route loader imports its queries on demand
- [0198](#0198-paraglides-cli-is-told-the-output-structure): Paraglide's CLI is told the output structure
- [0199](#0199-app-quotas-are-checked-under-a-transaction-scoped-advisory-lock): App quotas are checked under a transaction-scoped advisory lock
- [0200](#0200-part-4-measured-task-45): Part 4 measured (Task 45)
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
  - `src/lib/env/client.schema.ts` holds the schema and a `createClientEnv` factory.
  - `src/lib/env/client.ts` holds the instance built from `import.meta.env`.
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
  - A global function middleware (`src/start.ts`, `src/middleware/locale.ts`) adds an `x-paraglide-locale` header with the page's locale to every server function call.
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
  - `src/lib/i18n/intl.ts` formats English with `Intl` directly.
  - For Nepali it uses only data every runtime has: `en-IN-u-nu-deva` for lakh grouping and Devanagari digits, locale-neutral date fields, and CLDR 47 `ne` month, weekday, currency and relative-time data transcribed into `src/lib/i18n/intl-ne.ts`.
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

*Extended by 0185: guest sign-in (`/sign-in/anonymous`) allows 5 per hour per IP.*

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

*Restated in 0161 (Task 35): `_public` keeps verify-email and reset-password; the site's other pages moved to `_site` (the portfolio at `/`) and `/dev`.*

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
  - `DateField` stores `"YYYY-MM-DD"` and `DateRangeField` stores `{ from, to }` in that format. `src/lib/i18n/date-only.ts` converts them.
  - Dates are displayed via `isoDateInstant` (noon UTC) and `formatDate` in Asia/Kathmandu.
  - The picker is react-day-picker 10 (shadcn Calendar) wrapped as `LocalizedCalendar`. Captions, weekdays, digits and day labels come from `src/lib/i18n/intl.ts`.
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

*Superseded by 0162: the guard is `DEV_ROUTES` (`src/lib/dev-routes.ts`), and the route is `src/routes/dev/forms.tsx`.*

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

*The "edit with instant feedback" row is superseded by 0174: admin CRUD uses Query mutations; TanStack DB is for client-first apps.*

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

*Superseded by 0189: TanStack DB loads only with the pages that use it (`DbScope`).*

- **What:**
  - `getRouter()` creates a `DbClient` with the request's `QueryClient` as a dependency (`src/lib/tanstack-db.ts`, `queryClientOf`). It wraps the router with `routerWithDbClient` from `@tanstack/react-router-with-db` 0.1.0, after `setupRouterSsrQueryIntegration`, because it chains the existing `dehydrate`, `hydrate` and `Wrap`.
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

*Superseded by 0174 (the list stays URL-driven; writes are Query mutations that patch every cached page).*

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

- **What:** List loaders call `loadList(queryClient, options, cause)` (`src/lib/query.ts`). On SSR and when entering the route, it awaits the data as before. When only the search changes on the same route (`cause: "stay"`), it prefetches without awaiting, so the navigation commits immediately. Pages read the data with `useListQuery` (`src/hooks/use-list-query.ts`): `useQuery` with `placeholderData: keepPreviousData`. Its `busy` flag also covers the router's own pending state. The table and grids dim (`aria-busy`) while busy. Parameters that only open a dialog (`edit`, `view`) are left out of `loaderDeps`.
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

- **What:** `?from=`/`?to=` are `YYYY-MM-DD`. `dayRangeInZone` (`src/lib/i18n/date-only.ts`) turns them into `[start of from, start of the day after to)` in `APP_TIME_ZONE` (Asia/Kathmandu), using Intl offsets (correct across DST, tested with New York). `dateRange(column, from, to)` (`src/server/db/list.ts`) compares the timestamp column with those instants. Also added: `numberRange`, `overlapsAny` (array `&&`) and a GIN index on `test_crud.tags` plus a B-tree index on `price` (migration 0003).
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

## 0101: The sitemap, robots.txt and manifest are built from the same data as the pages; the manifest is a Nitro route

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

*Updated by 0162: the sitemap lists only the home page and the portfolio's pages.*

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

*Updated by 0161: Test CRUD's pages are private dev references now, so the `Product` and `Organization` builders were removed.*

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

*Superseded in part by 0162: the guard is `DEV_ROUTES`, the pages are under `src/routes/dev/`, and the e2e suite reviews them.*

## 0104: Forms handled in JavaScript use method="post"

- **What:** the shared `Form` (useAppForm) and every hand-written form (sign-in, register, sign-in code, forgot and reset password, verify email, account) set `method="post"`. FilterBar keeps `method="get"`, because its values belong in the URL. `tests/unit/form-method.test.ts` checks every `<form>` in `src`.
- **Why:**
  - **The problem:** a form without a method submits as GET. A submit before hydration (a slow phone, a click during load) then put the fields in the URL: passwords in the address bar, history, referrers and server logs. The dev examples' scripted flows hit exactly that (`?username=…&email=…`) while the dev server was busy.
  - **The fix:** with POST, a pre-hydration submit sends the values in the body. The server renders the page again (a page URL accepts POST and ignores the body), and the user simply submits again once it has loaded.
- **Verified:** with JavaScript off, submitting the sign-in form and the examples form leaves the URL unchanged. With JavaScript, the forms behave as before (unit tests, the auth flows and the example flows).
- **Alternatives considered:**
  - Disabling submit buttons until hydration: the buttons change state after load, and nothing at all works without JavaScript.
  - `action="javascript:void(0)"`: blocked by the CSP and flagged by React.

## 0105: Sections can opt out of the app header with staticData.chrome

- **What:** `src/lib/chrome.ts` adds `chrome?: "bare"` to `StaticDataRouteOption` (the same augmentation as breadcrumbs). `SiteHeader` reads the matched routes with `useMatches({ select: isBareChrome })` and renders nothing when any of them is bare. The `/portfolio` layout sets it and brings its own header. `tests/components/layout/site-chrome.test.tsx` checks that `/` and `/stack` keep the header and a bare section's children don't.
- **Why:**
  - **Immersive design:** an editorial site with a full-bleed header can't sit under a second, unrelated header.
  - **Opt-in:** the rule had to change no existing page. A route that doesn't set it behaves exactly as before.
  - **Declared on routes:** it lives where breadcrumbs already do (`staticData`), so the root layout doesn't need a list of paths.
- **Alternatives considered:**
  - A pathless layout outside the root layout: impossible, since every route is under `__root`.
  - Hiding the header with CSS from the section: it would still be in the HTML and the accessibility tree.
  - A path check (`pathname.startsWith("/portfolio")`) in the header: it breaks with the `/ne` prefix and spreads knowledge of one section into shared code.

*Superseded by 0161: the root renders no header; each layout renders its own.*

## 0106: Portfolio content sits behind a PortfolioSource port; the demo adapter lazy-loads fixtures

*Superseded by 0176 (the content is in the database; the port and the fixture adapter are gone, the fixtures seed the database).*

- **What:**
  - **The port:** `src/features/portfolio/source.ts` defines the reads the UI needs (profile, projects, a project with its neighbour, posts, experience…). Every method takes the locale and returns records resolved to it; a missing slug is `null`.
  - **The adapter:** `sources/fixture-source.ts` implements it over typed fixtures in `data/`, imported with `import("../data")`. `sources/index.ts` picks the adapter.
  - **The UI:** `queries.ts` wraps every read in `queryOptions` (keys include the locale, `staleTime: Infinity`), and routes follow the usual loader + `useSuspenseQuery` pattern.
- **Why:**
  - **The brief:** a static frontend with demo data now, real data later. The port makes "later" a one-file change: no route or component knows where content comes from.
  - **Same SSR path as real data:** loaders await queries, so the page arrives complete and hydrates without a request. A future server-function adapter keeps that.
  - **No cost to other pages:** the dynamic import makes the fixtures (about 80 kB) their own chunk. Pages outside `/portfolio` never load it, and a portfolio page loaded from the server doesn't either (its queries are already filled). Only a client-side navigation into the section fetches it.
  - **Testable:** the adapter is plain async functions, tested directly (`tests/unit/portfolio-source.test.ts`).
- **Alternatives considered:**
  - Importing fixtures straight into components: simplest today, but every component would need rewriting for real data, and the data would land in the route chunks.
  - Server functions over the fixtures right away: a server round trip on client navigation for data that is static, and more moving parts for a demo.
  - A database table and migration now: real infrastructure for placeholder content the owner will replace.

## 0107: Portfolio content is localized in the data ({ en, ne }), UI chrome in Paraglide

- **What:**
  - **Content fields:** every human-language field of a content record is `Localized` (`{ en, ne }`, `schema.ts`). `resolveLocalized(record, locale)` (`lib/localize.ts`) resolves a whole record deeply, and its type `Resolved<T>` keeps tuples as tuples. The source returns resolved records, so components only ever see strings.
  - **What stays unlocalized:** brand names, tech names and code are plain strings.
  - **UI chrome:** labels, buttons and the site's own headings are `portfolio_*` Paraglide messages.
- **Why:**
  - **Content is data, like database rows:** Test CRUD items aren't messages either. Putting 300+ paragraphs of case studies in `messages/*.json` would bury the UI strings and tie content edits to a rebuild of the message bundle.
  - **Pairs stay together:** keeping both languages side by side in one file makes translations easy to review and impossible to forget. `tests/unit/portfolio-data.test.ts` fails if a Nepali text has no Devanagari or an English text has some.
  - **No mixed caching:** query keys include the locale, so English and Nepali results never share a cache entry.
- **Alternatives considered:**
  - Messages for everything: rule 6 is about UI text. Content keys would be unbounded and meaningless (`project_ledgerline_chapter_2_paragraph_1`).
  - One file per language: translations drift apart silently.

## 0108: The portfolio's design system is scoped under .portfolio; generated art; fonts pinned to an optical size

*The scoping rule stands (now `.himal`, `hm-`); the look and the art are superseded by 0179 and 0180.*

- **What:**
  - **Scoped tokens:** `src/styles/portfolio.css` (imported once from `app.css`) holds the "Ink & Paper" system:
    - colour tokens under `.portfolio`, with a dark palette and `.pf-inverse` bands
    - `@theme inline` mappings (`bg-pf-paper`, `text-pf-h2`, `font-pf-mono`)
    - `pf-*` utilities and the motion rules
  - **Fonts:** Fraunces, JetBrains Mono and Noto Serif Devanagari, self-hosted with Fontsource and preloaded by the portfolio layout only.
  - **Covers and screens** are SVG generated from a seed (`CoverArt`, `ScreenArt`).
  - **Portfolio `cn`:** components use `features/portfolio/lib/cn.ts`, which registers the `text-pf-*` size scale with tailwind-merge.
  - **Vite never inlines fonts:** `build.assetsInlineLimit` returns `false` for `.woff`/`.woff2`.
- **Why:**
  - **Scoping:** the rest of the app keeps the shadcn tokens untouched. Unused `pf-*` utilities add a few kB of CSS and no behaviour, and `@font-face` files download only when a portfolio page uses them.
  - **Generated art:** no binary placeholders to replace later, nothing for the CSP to allow, and covers follow the theme. A fixed aspect ratio means zero layout shift. Rounded coordinates from a seeded generator keep server and client markup identical.
  - **Fallback metrics and optical size:**
    - **The problem:** Fraunces changes width with its optical size. Measured in Chrome, it is 1.02× Georgia at 24px and 0.82× at 160px. A single `size-adjust` can't match it, and the hero's first line wrapped differently before and after the font swap (CLS 0.05).
    - **The fix:** pinning `opsz` (144 for display, 36 for h3-size type) makes the ratio constant. Each gets a fallback face with the measured glyph ratio (83.35% / 78.29% italic, and 102.19% / 95.3%). Measured CLS is now 0.
  - **Never inline fonts:** JetBrains Mono's cyrillic-ext subset is 2 kB, under Vite's 4 kB inline limit, so it was emitted as a `data:` URL, which the CSP's `font-src 'self'` blocks (a console error found by the browser review). No existing font was small enough to be inlined, so current output is unchanged.
  - **tailwind-merge:** with the app's `cn`, `cn("text-pf-h2", "text-pf-accent")` kept only the colour, because both look like colour classes to tailwind-merge.
- **Alternatives considered:**
  - Extending the app's shadcn tokens: it would change the look of every existing page.
  - Placeholder images in `public/`: binary files to replace, plus `srcset` and size work for content that's temporary.
  - `font-display: optional`: not configurable with Fontsource's CSS, and it would show the fallback on most first visits.
  - Allowing `data:` in `font-src`: it loosens the CSP for every page.

## 0109: Portfolio motion is CSS only: scroll-driven animations, clip-path reveals and View Transitions

*Extended by 0181 (a 1 kB pointer drift script; still no animation library).*

- **What:**
  - **Effects:** hero lines rise out of masks on load. Blocks wipe in with `animation-timeline: view()` (`.pf-reveal`). The manifesto inks in word by word (`SplitWords` sets `--i`/`--n`). The toolbox marquee slides in pure CSS. Articles show a reading-progress bar (`scroll(root)`).
  - **Shared element:** a card's cover morphs into the case study hero through View Transitions (`CoverFrame` sets `view-transition-name`, links pass `viewTransition`, and the transition styles are scoped to a `pf-cover` class).
  - **Guards:** everything sits inside `@media screen and (prefers-reduced-motion: no-preference)` and `@supports`. No animation library was added.
- **Why:**
  - **Progressive enhancement:** content is visible by default. Browsers without scroll timelines, readers who prefer reduced motion and print simply get the static page, and the JavaScript budget stays at zero.
  - **Only `transform`, `clip-path` and `color` move:** layout never shifts (CLS 0), and axe never measures half-faded text. An opacity fade did exactly that in practice: elements caught mid-fade fail contrast.
  - **Marquee pause button:** auto-moving content longer than 5 s needs a way to pause (WCAG 2.2.2), not just hover.
- **Alternatives considered:**
  - GSAP or Motion: richer choreography, but tens of kB on every portfolio page, and work that must wait for hydration.
  - IntersectionObserver reveals in React: needs JavaScript, and risks content hidden until hydration (or forever if it fails).

## 0110: The portfolio is dressed as Dhaka cloth: Anek type, generated weaves, no house-style defaults

*Superseded by 0179 (Himal) and 0184 (Eczar).*

- **What:**
  - **Identity:** the "Ink & Paper" look (cream paper, Fraunces, a vermilion accent, uppercase mono eyebrows numbered "01 ——") is replaced by "Dhaka", after the handloom cloth of Palpa. Cotton-white ground and indigo ink. Dark mode is an indigo night. Three thread colours (crimson, marigold, jade) are shared by both themes.
  - **Type:** Anek Latin + Anek Devanagari, one family for both scripts. Headlines are condensed (`wdth` 75) and bold. Body, quotes and labels are at normal width. Labels are sentence case. JetBrains Mono remains for code blocks only.
  - **Weaves:** `lib/weave.ts` generates stepped, mirrored bands (stripes, zigzags, diamonds, triangles, checks) on a cell grid from a seed. `Weave` draws them as SVG runs. The hero's cloth weaves in row by row once on load (`.pf-weaving`, a `steps()` clip-path animation). Every project cover is its own cloth with the glyph on a cotton label. The footer is edged with a selvedge.
  - **Markers:** chapters are marked by a diamond in the next thread colour. Numerals only appear on real sequences (process steps, project n of m).
  - **Fallback metrics:** "Anek Fallback" (Arial, 93.51%) and "Anek Display Fallback" (Arial Bold, 67.12%), measured in Chrome.
- **Why:**
  - **Distinctive, not generic:** the previous look matched a widely shared house style. Dhaka ties the site to its owner (a Nepali developer) and to the craft (a loom is a grid and its rows). It stays coherent in both scripts and both themes: the indigo ground of a weave becomes white cloth in dark mode, because the ground is the ink token.
  - **One family:** Anek's width axis gives the contrast two families would, and its Latin and Devanagari cuts are designed together, so Nepali pages look as intended rather than as a fallback.
  - **Generated, not drawn:** same reasons as 0108. It is deterministic (integer cells, seeded), themeable and causes no layout shift. Runs of the same thread merge, which keeps a cover to a few hundred `<rect>`s.
  - **No cotton stripes:** a full row of cotton is the page colour and reads as a hole in the cloth.
- **Alternatives considered:**
  - Prayer-flag colours as section bands: the five colours carry religious meaning, and flat bands of colour say less than woven geometry.
  - A topographic (contour-line) theme: common on developer portfolios.
  - Keeping Fraunces with a new palette: the serif display would still read as the same house style.

## 0111: Loaders read through ensureQuery(), not the deprecated ensureQueryData

- **What:** `src/lib/query.ts` has `ensureQuery(queryClient, options)` (`queryClient.query({ ...options, staleTime: "static" })`) and `prefetch(queryClient, options)` (`query(options).catch(noop)`); `loadList` uses both. Every loader outside the portfolio calls `ensureQuery`. The root route reads the session with `queryClient.query(sessionQueryOptions())`, which honours the session's one-minute `staleTime`.
- **Why:** TanStack Query 5.104 deprecates `ensureQueryData`, `fetchQuery` and `prefetchQuery` (to be removed in v6); `query()` with `staleTime: "static"` is the documented replacement. One helper keeps the "static" detail out of every route and makes the next change one edit. `ensureQueryData` also never refetched cached data, so client-side route guards could trust a session for as long as the tab stayed open; the root now refetches it once it is a minute old.
- **Alternatives considered:** calling `queryClient.query({ ..., staleTime: "static" })` inline in each loader (repetitive, easy to forget the option); `revalidateIfStale` on the session (deprecated with `ensureQueryData`, and it doesn't wait, so the guard would still decide with the old value). The portfolio routes still use `ensureQueryData` until that work is next touched; it keeps working until Query v6.

## 0112: Better Auth's admin endpoints are disabled over HTTP

*Extended by 0185: the anonymous plugin's `/delete-anonymous-user` is off too.*

- **What:** every `/api/auth/admin/*` path of the admin plugin is in `disabledPaths` (`src/server/auth/disabled-paths.ts`); Better Auth answers 404. A test compares the list with the plugin's endpoints, so an upgrade that adds one fails until it is listed.
- **Why:** the plugin let any `role: "admin"` user call set-role, ban-user, remove-user, impersonate-user and set-user-password directly, skipping `src/server/rbac/service.ts` (an admin could demote the last admin, or themselves). The UI never used them; roles and bans go through `src/functions/rbac.ts`. The plugin stays for its `role`/`banned` fields and sign-in checks; `disabledPaths` only affects the HTTP router, so server code (and `db:seed-admin`'s CLI) can still call `auth.api.*`.
- **Alternatives considered:** removing the admin plugin (loses the banned-user sign-in refusal and the `role` field the schema relies on); re-implementing the service rules inside Better Auth hooks (two places for one set of rules).

## 0113: Expired sessions are handled by a global client middleware, not an HTTP interceptor

- **What:** `src/middleware/session-expiry.ts` is a `createMiddleware({ type: "function" }).client(...)` registered in `createStart({ functionMiddleware })`. When any server function answers UNAUTHORIZED in the browser, it clears the cached session and navigates to `/login?redirect=<current page>`, then rethrows so the caller's own handling still runs. FORBIDDEN is left to the caller (a toast, or the forbidden page).
- **Why:** server functions don't go through axios or a `fetch` wrapper the app owns; Start's function middleware is the documented place for logic around every call on the client, the equivalent of a response interceptor. Before, an expired session showed "Please log in" in a toast or error page without taking the user anywhere.
- **Alternatives considered:** axios interceptors (server functions don't use axios); `QueryCache`/`MutationCache` `onError` (misses server functions called outside Query, e.g. forms and TanStack DB handlers); throwing `redirect()` from the middleware (the router only handles it inside loaders and `beforeLoad`, not in event handlers).

## 0114: Session tokens stay on the server; the account page revokes sessions by id

- **What:** `listMySessions` no longer returns tokens. `revokeMySession({ id })` (requireUserMiddleware) looks the token up among the caller's own sessions on the server and revokes it; ids that aren't the caller's are NOT_FOUND, and the current session is refused.
- **Why:** session tokens are bearer credentials. Sending every session's token to the page meant one injected script could take over all of a user's devices. The browser only needs an id to say which device to sign out.
- **Alternatives considered:** Better Auth's client `revokeSession({ token })` (needs the token in the browser); deleting the session row directly (bypasses Better Auth's hooks and cookie handling).

## 0115: The last-admin guard locks the admin rows inside the change's transaction

- **What:** demoting or banning an admin runs in one transaction that first locks the active admins (`SELECT … FOR UPDATE`, `lockActiveAdmins`) and refuses the change if the target is the last one. The repository writes run inside it (nested as savepoints).
- **Why:** the count used to run before, and outside, the write. Two admins demoting each other at the same moment could both see "another admin is left" and leave none. With the lock, the second transaction waits, re-reads the rows (one admin left) and is refused.
- **Alternatives considered:** a database trigger (rules split between SQL and the service); `SERIALIZABLE` isolation (retries to handle wherever it's used).

## 0116: List pages share useListPage() and tableListInput()

- **What:** `src/hooks/use-list-page.ts`. `tableListInput(search, preferences, tableId)` resolves the page size (URL, then the table's saved preference, then 20) and is called by the loader. `useListPage({ tableId, search, query })` uses the same resolution, reads the list with `useListQuery`, rethrows a first-load error to the route's error page, and returns `pagination` props for `<Pagination>` whose rows-per-page picker saves the preference and updates the URL. `<ClearFiltersButton>` is the filtered empty state's action.
- **Why:** the Test CRUD and users pages repeated the same ~60 lines (page-size fallback, saved preference, pagination wiring, the empty state's clear link), and every new CRUD would have copied them again (golden rule 2). Loader and component sharing one resolution keep SSR and hydration on the same page size.
- **Alternatives considered:** a `<ListPage>` component taking columns, filters and actions (hides too much: pages differ in dialogs, bulk actions and data sources such as the TanStack DB collection); leaving it as documented copy-paste.

## 0117: Every server function file is declared in the guard test; demo data is a seeded script

- **What:** `tests/server/guarded-functions.test.ts` reads `src/functions/` and fails for any file that isn't listed, either with each function's permission or as deliberately unguarded with a reason and its function names. `pnpm db:seed-demo` (`scripts/seed-demo.mjs`, data in `scripts/lib/demo-data.ts`, tested on PGlite) adds an editor and a viewer role, three users (one without a role, to see the forbidden page) and 30 Test CRUD items.
- **Why:** the old test only checked the files it already listed, so a new `src/functions/<feature>.ts` without `requirePermission` passed. The demo seed makes the permission flows (forbidden page, read-only admin, pagination) testable by hand on a fresh database. It is plain SQL with Better Auth's own password hash, so it runs with `node` alone; the app's TypeScript modules use path aliases Node can't resolve.
- **Alternatives considered:** a lint rule for `requirePermission` (can't express "public on purpose"); seeding through the app's repositories with a TypeScript runner (a new dev dependency for one script).

## 0118: Knip guards against dead code; cn, date-fns and db:push removed

- **What:** `pnpm knip` (config in `knip.json`) reports unused files, exports, types and dependencies, and runs in CI. Entries knip can't find on its own are listed: Nitro routes and plugins (named by string in `vite.config.ts`), the email preview (loaded by a Vite plugin), `src/lib/zod.ts` (an alias target), the Storybook mocks (alias targets), `tests/` and `scripts/`. CSS is part of the project so `@import`/`@plugin` count as uses. `src/components/ui/` is ignored: it's the vendored shadcn kit, kept whole so a component's unused parts are there when needed. `ignoreExportsUsedInFile` is on: exporting a constant the file itself uses is harmless.
- **Removed on the first run:** the `cn` package, `date-fns`, the unused `src/components/filters/index.ts` barrel, and type exports nothing imported (`Auth`, `FormImage`, `WorkSearch`, `ExampleSort`, `ExampleSignup`, and four barrel re-exports). Also the `db:push` script.
- **Why:**
  - `cn` was an unrelated npm package, most likely installed to satisfy the shadcn CLI's `import { cn } from "cn"` (see the README). With it installed, that wrong import type-checked and shipped someone else's code; without it, `pnpm typecheck` fails until the import is fixed, as intended.
  - `date-fns` was never imported; `react-day-picker` depends on its own copy.
  - `db:push` changes the database schema without writing a migration. The app is migration-based (0018), so push could leave production and `drizzle/` out of step. CI now also fails when the schema changes without a migration (`drizzle-kit generate` must produce nothing) and runs `pnpm db:check`.
  - Biome and TypeScript see one file at a time; only a whole-project tool notices that nothing uses an export or a package.
- **Alternatives considered:** depcheck (dependencies only, no exports); TypeScript's `noUnusedLocals` (file-local only); listing every shadcn export as used (noise for vendored code).

## 0119: Version pinning: caret by default, exact only with a reason

- **What:** dependencies use `^` unless one of these applies, in which case they are exact and the reason is recorded:
  - **Pre-release:** `nitro` (3.0 beta, 0004) and `@sentry/tanstackstart-react` (beta, 0073).
  - **Output that gates check:** `@biomejs/biome` (formatting and lint rules change in minors, failing `pnpm check`); the Anek fonts (fallback metrics measured per version, 0108, 0110).
  - **Families that must match:** Storybook packages, and `@vitest/*` with `playwright`.
  - **Verified privacy behaviour:** `posthog-js` and `posthog-node`. The consent flow (no request before consent, cookie and storage removed on withdrawal, 0074) was checked against these versions; an update is re-verified before the pin moves.
  The lockfile is what installs; the range only says what an update may move to. Dependabot (0120) opens grouped PRs for both kinds, and CI runs every gate on them.
- **Nitro beta in production:** kept because it's the server build TanStack Start generates for Vercel (0004), and there is no stable Nitro 3 yet. Move to the first stable Nitro 3 release (or the version the TanStack CLI then pins) in its own PR with a full production browser review; re-check the dev-only routing workarounds (0067, 0103) at that point.
- **Why:** the repo had both styles with no rule, so nobody could tell a deliberate pin from an accident.
- **Alternatives considered:** pin everything exactly (every update becomes a manual edit; the lockfile already gives reproducible installs); caret everywhere (beta and output-changing packages would move under the gates without a decision).

## 0120: CI on GitHub Actions, git hooks with lefthook, Dependabot for updates

- **What:**
  - `.github/workflows/ci.yml` runs on every PR and push to `main`, in four parallel jobs: typecheck + check + knip + the migration check; `pnpm test`; `pnpm test:storybook` + `build-storybook`; `pnpm build`. The build gets placeholder `VITE_` values (only public variables are needed at build time, 0011). Story tests use the runner's installed Chrome, as locally.
  - `lefthook.yml`: Biome on staged files before commit (fixes re-staged; warnings block), `pnpm typecheck` and `knip --dependencies` before push. `pnpm install` installs the hooks via `scripts/install-hooks.mjs`, which skips CI and installs without a `.git` folder (Vercel builds), where `lefthook install` fails.
  - `.github/dependabot.yml`: weekly npm and GitHub Actions updates, grouped by packages that move together (TanStack, Storybook, Vitest + Playwright, Better Auth, Tiptap, Tailwind, Drizzle, React, `@types`).
  - `.nvmrc` is `24` (the current LTS, used to verify the gates); `engines` stays `>=22`. The package is named `start-template` and licensed MIT.
- **Why:** the gates only ran on the author's machine, so a PR could merge red. Hooks catch the cheap mistakes before a push; CI is the authority. The browser review joins CI in Task 27.
- **Alternatives considered:** Husky + lint-staged (two packages and a shell script per hook; lefthook is one binary with parallel commands); Renovate (more options, but needs a GitHub app; Dependabot's groups cover what's needed); one sequential CI job (simpler, about twice as slow); running the full `knip` before push (unused exports are normal mid-work; CI runs it).

## 0121: The browser review is a Playwright suite against a harnessed production server

- **What:** `pnpm test:e2e` (Playwright, `e2e/`) replaces the review scripts that lived outside the repo. Its `webServer` is `e2e/harness/server.ts`, which builds the app, starts a database, migrates and seeds it, starts a fake Resend API, and runs `.output/server/index.mjs` with only the env it sets. A unit test checks the page list against the route tree. CI runs the suite in 3 shards on a Postgres 17 service.
- **Choices:**
  - **Playwright test runner** (`@playwright/test`, pinned to the same exact version as `playwright`, which the Vitest browser tests already pin) with `@axe-core/playwright`. It uses the installed Chrome (`channel: "chrome"`) like the story tests, so neither CI nor a fresh clone downloads a browser.
  - **Emails through the real provider:** the server runs with `EMAIL_PROVIDER=resend` and `RESEND_BASE_URL` (read by the Resend SDK) pointing at the harness, which stores each message. The app carries no test-only code, and a production build still refuses the console provider.
  - **Database:** locally, in-memory PGlite served over TCP by `e2e/harness/pglite-server.ts` (nothing to install); in CI, a real Postgres (`E2E_DATABASE_URL`). That database is emptied first, so its name must contain `e2e` or `test`. `@electric-sql/pglite-socket` was tried and dropped: its queue takes single protocol messages from all connections in arrival order, so two pooled connections can interleave Parse/Bind/Execute and run each other's unnamed statements. The harness's server takes turns per whole request (up to Sync, or a simple query) and keeps a connection's turn for the length of a transaction. 300 concurrent pooled queries and transactions ran without a wrong result.
  - **Seeding** reuses `scripts/lib/demo-data.ts` plus an admin row written the same way, instead of `db:seed-admin` (which loads the app's auth config through Better Auth's CLI).
  - **Rate limits** stay on (they're part of what's tested). Every test comes from 127.0.0.1, so the harness clears the `rate_limit` table before tests that sign in. Seeded users sign in through the API the first time a test needs them, and the saved state is reused for the rest of that harness run (it's keyed on a per-run id, because each run has a new database). An earlier version used a setup project; Playwright's UI mode doesn't run a setup project unless it's ticked, so tests there started from sessions of an older database and failed.
  - **Every route is reviewed or excused:** `REVIEWED_PAGES` names each route with its user, how `$param` values are found (from `/sitemap.xml`, or a seeded row through the harness) and any expected 403/404. `tests/unit/e2e-pages.test.ts` reads `FileRoutesByTo` from `src/routeTree.gen.ts` (importing the tree would load every route) and fails on a route that's in neither list. It's a unit test so it fails fast in `pnpm test` and the pre-push hooks.
  - **Console, page errors and CSP** are checked by an automatic fixture in every test, flows included. Each test can allow the lines it expects (a 403/404 document).
  - **A warm-up load before the measured one.** Cold loads on a CPU running six browsers sometimes painted the fallback faces before the preloaded fonts arrived, and the swap then shifted text. The worst case was 0.13 on `/admin/test-crud/$id` at 390 px, where the last breadcrumb wraps in the fallback face and fits in Inter. Unloaded, or with fonts cached, CLS is 0. The section 7 method assumed fonts arrive before first paint (an idle machine), so the suite makes that deterministic instead of letting CLS depend on machine load. The underlying gap: the single "Inter Fallback" face is tuned for regular weight, so medium and bold text is about 1.7% wider in the fallback. Per-weight fallbacks are left to Task 31.
  - **UI mode:** the config lists `flows` first, because UI mode ticks only the first project at start. A successful build's stderr (Vite's timing notes) goes to stdout, because UI mode flags any webServer stderr as an error. The harness exits when its parent process is gone; on Windows a killed UI process otherwise left the harness and server on their ports, and the next local run silently reused them.
  - **Traces only on the CI retry:** recording a trace for every test under parallel load on Windows failed with `ENOENT` on Playwright's artifact files, and doubled the run time.
- **Why:** only whoever had the scripts could run the review, so a regression on a page nobody re-checked went unnoticed. Now it's one command, and CI runs it on every PR.
- **Alternatives considered:** keeping the review scripts outside the repo (not reproducible); `@electric-sql/pglite-socket` (interleaving, above); requiring Docker or a local Postgres (more setup for every contributor); a test-only email provider in the app (production code would carry it); a Mailpit/SMTP container (Resend's API is what production calls); discovering pages by crawling (misses pages behind a sign-in or a seeded id, and can't tell a missing page from an intentionally private one).

## 0122: Edits carry the version they started from; a stale save is a CONFLICT

*Since 0173 the version is checked one way everywhere: in the UPDATE's WHERE (`updateVersioned`), without a separate row lock.*

- **What:** an edit sends the row's `updatedAt` as it received it (`versionSchema()`, `src/lib/concurrency.ts`). The repository writes only while the row still has that version (`sameVersion(column, version)`, `src/server/db/concurrency.ts`) and otherwise throws `staleError()`: a `CONFLICT` with `reason: "stale"`. Forms catch it with `handleSaveError(form, error, onStale)` and show `StaleVersionAlert`, whose "Reload" refetches the record and resets the form to it. Test CRUD's edit form and the role rename dialog use it.
- **Choices:**
  - **`updatedAt` is the version.** Both tables already have it, maintained by Drizzle's `$onUpdate`, so no migration and no extra column. Postgres keeps microseconds (an insert's `defaultNow()`) and a JS Date milliseconds, so the comparison is `date_trunc('milliseconds', updated_at) = $version`.
  - **Checked under the row lock** in Test CRUD (the update already selects the row `for update`), so two saves of the same version can't both pass; for roles, the check is in the `UPDATE ... WHERE` itself. A zero-row update is then told apart as deleted (`NOT_FOUND`) or changed (stale).
  - **A `reason` on AppError**, carried by the serialization adapter, rather than a magic `fieldErrors` key: the client branches on it (`isStaleError`) and `errorMessage` localizes it on the client.
  - **What's versioned:** whole-record edits. The list's publish toggle and deletes aren't (one field or the whole row, and the edit form's version check catches a publish that happened meanwhile). The permission matrix sends grant/revoke deltas, which can't overwrite someone else's change, so it doesn't bump the role's version.
  - **Reload, not merge:** the alert says nothing was saved and reloads the latest version. A field-by-field merge UI is a lot of code for a rare case; a feature that needs it can build it on `isStaleError`.
  - Also fixed while here: `applyServerFieldErrors` treated `_form` (a `ruleError`'s message) as a field, so forms swallowed rule errors (e.g. "last admin") without a toast.
- **Why:** before this, the second of two concurrent edits silently overwrote the first.
- **Alternatives considered:** an integer `version` column (a migration per table, same result); ETags/`If-Match` headers (server functions aren't REST resources); `SELECT ... FOR UPDATE` alone (stops simultaneous writes, not a save from a form opened before someone else's save); last-write-wins with an audit trail (Task 30's audit log records changes but doesn't prevent loss).

## 0123: One request id per request, kept in AsyncLocalStorage by the server entry

- **What:** `src/server.ts` wraps every request in `runWithRequestId` (`src/server/http/request-id.ts`): a fresh UUID in AsyncLocalStorage, returned as `x-request-id`. Server functions get it as `context.requestId` (the logging middleware reads it, so `AppError.requestId` and the error page's reference match the header), `log()` (`src/server/log.ts`) adds it to every server log line, and `instrument.server.ts`'s `beforeSend` tags each Sentry event with it.
- **Choices:**
  - **Always generated**, never taken from an incoming `x-request-id`: that header is client input. Vercel's own `x-vercel-id` stays available in its logs for edge correlation.
  - **AsyncLocalStorage**, like the existing per-request error status (`error-status.ts`) and Paraglide's locale: one place sets it, and code deep inside a request (the DB health check, auth email delivery, PostHog) reads it without threading a parameter.
  - **`withHeader`** copies the response when its headers are immutable (`Response.redirect`).
  - **Function middleware** reaches the server-only module by a dynamic import inside `.server()` (the same rule as the rest of `src/middleware`). Nitro routes (cron, manifest) bypass the Start entry and have no id.
- **Why:** each server-function call made its own id, so a page request had none and its log lines couldn't be tied to the response or to Sentry.
- **Alternatives considered:** trusting an upstream id (spoofable); a Start request middleware putting the id in context (it wouldn't reach code outside the middleware chain, such as Better Auth's hooks); OpenTelemetry trace ids (Sentry already traces; a separate id is simpler to show to users).

## 0124: GET /api/health for monitors; the /health page stays for people

- **What:** `src/routes/api/health.ts` (a server route, GET and HEAD) answers `200` with `{ status, checks: { database: { status, latencyMs } }, checkedAt }`, or `503` when the database doesn't answer, with `cache-control: no-store`. The ping times out after 3 s (`HEALTH_TIMEOUT_MS`), so a hung connection counts as down instead of hanging the monitor. The `/health` page renders the same check.
- **Why:** monitors need a status code, not an HTML page that's 200 even when the database is down. No details leave the server (0019): the reason is in the log line.
- **Alternatives considered:** a Nitro route (only needed for requests Vite intercepts in dev, 0103; monitors send ordinary requests); checking more dependencies (Cloudinary, Resend: their outages don't make the site unusable, and a monitor would page for a third party).

## 0125: Idempotency keys are a recipe, not core

- **What:** `/dev/examples/idempotency` and the routing guide's "Idempotency keys" section. `createIdempotencyStore()` (`src/server/examples/idempotency.ts`) runs an action once per key, answers repeats (a double submit, a retry after a lost response) with the first result, makes a duplicate that arrives while the first is still running wait for it, refuses a key reused with different input or by another user, and forgets a key whose action failed. The guide shows the Postgres version a real feature uses.
- **Why a recipe:** the shared submit button already disables itself while saving, and the app's creates are admin forms where a duplicate is visible and deletable. Keys matter for actions with side effects outside the database (emails, payments, webhooks), which the base doesn't have. The in-memory store is for the example only (one process).
- **Alternatives considered:** a core `idempotency_key` table and middleware on every POST (a table and a write per call for a problem the base doesn't have); unique constraints alone (they stop duplicate rows, not duplicate emails).

## 0126: Two-factor is TOTP with backup codes; admins can be required to use it

- **What:** Better Auth's `twoFactor` plugin (TOTP + 10 encrypted backup codes, migration `0007_auth_hardening`). The account page's two-factor section turns it on (password, scan a QR code or type the key, confirm a code, save the backup codes), issues new backup codes and turns it off. The login form shows a second step (app code or backup code, "trust this browser for 30 days"). `AUTH_REQUIRE_ADMIN_2FA=true` makes it mandatory for anyone holding an admin permission.
- **Choices:**
  - **Enforcement in one place:** `getServerSession` (`src/server/auth/session.ts`) gives a user who must set it up (`mustSetUpTwoFactor`, `src/server/auth/policy.ts`) no permissions and `twoFactorRequired: true`. Every `requirePermission` then refuses, `useCan` hides admin UI, and `requireAdminAccessMiddleware` throws FORBIDDEN with the new `two-factor-required` reason, which the `_admin` layout turns into a redirect to `/account?twoFactor=required#two-factor`. Nothing else in the app needed to learn about it.
  - **Default off** (Part 3 rule: nothing silently changes behaviour). Existing admins would otherwise be locked out of `/admin` on deploy.
  - **Policy for the other sign-in methods.** Better Auth's second factor only runs after password sign-in. An emailed sign-in code would get around it, so an email-code sign-in to an account with two-factor on is undone and refused (`refuseEmailCodeWithTwoFactor`, `src/server/auth/hooks.ts`, an `after` hook that deletes the new session and clears the cookie). It runs after the code is checked, so only someone holding a valid code learns that the account uses two-factor. **Google sign-in is trusted as is:** Google runs its own second factor, and asking for ours after an OAuth redirect needs a challenge flow Better Auth doesn't have for social sign-in. A password reset doesn't sign in, so it doesn't bypass anything.
  - **`allowPasswordless: true`:** a Google-only admin can still satisfy the requirement (the factor applies once they set a password).
  - **QR code:** `uqr` (zero dependencies) renders the `otpauth://` URI as an SVG shown through a `data:` image (allowed by `img-src`), with the key as text next to it.
  - **Rate limits:** `/two-factor/*` 10 a minute, on top of the plugin's account lockout (10 failed codes lock the account for 15 minutes).
  - **Notices:** turning it on or off emails a `security-notice` (Better Auth's `user.update.after` hook, by path).
- **Why:** a password alone is one leaked credential away from an admin takeover.
- **Alternatives considered:** email or SMS codes as the second factor (email is the account-recovery channel already, SMS costs money and is phishable); blocking `/admin` with a route check only (functions would still answer, so the requirement would be cosmetic); refusing email-code sign-in before the code is checked (tells anyone who types an address whether it has two-factor).

## 0127: Breached passwords are refused through Have I Been Pwned, on by default

- **What:** Better Auth's `haveIBeenPwned` plugin on `/sign-up/email`, `/change-password` and `/reset-password` (`BREACHED_PASSWORD_PATHS`). `setMyPassword` (a Google user adding a password) calls `isPasswordCompromised` itself, because Better Auth's set-password endpoint is server-only with no path, so the plugin can't see it. The `PASSWORD_COMPROMISED` code shows a localized message.
- **Choices:** on by default (`AUTH_BREACHED_PASSWORD_CHECK`): only the first 5 characters of the SHA-1 hash leave the server (k-anonymity, with response padding), and existing users only notice when they pick a breached password. If the API is down, the plugin fails closed (sign-up answers an error) rather than letting a breached password through; turn the check off with the variable during an outage. The e2e harness turns it off so the suite makes no outside calls; `tests/server/auth-hardening.test.ts` runs the plugin on a real Better Auth instance against a stubbed range API.
- **Why:** password reuse from other breaches is the most common way accounts are taken over.
- **Alternatives considered:** a local list of common passwords (stale and large); zxcvbn-style strength scoring only (a strong-looking password can still be in a breach; the forms already show strength hints).

## 0128: Turnstile on the endpoints that send email or create accounts, plus a honeypot

- **What:** Better Auth's `captcha` plugin with Cloudflare Turnstile on `/sign-up/email`, `/request-password-reset` and `/email-otp/send-verification-otp` (`CAPTCHA_PATHS`), when `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` are both set. The site key reaches the forms through `getAuthFeatures`; `useTurnstile` (`src/features/auth/components/bot-check.tsx`) loads the script, renders the widget (65 px reserved, so no layout shift) and sends the token as `x-captcha-response`. Every auth form also has a honeypot field: hidden from people and assistive tech; when it's filled the form shows its success state and sends nothing.
- **Choices:**
  - **Off unless configured.** No keys, no widget, no CSP change. With keys, the CSP adds `frame-src https://challenges.cloudflare.com` (and the same host to `script-src` for browsers without `'strict-dynamic'`); the script itself is allowed because our nonced code adds it.
  - **Not on password sign-in:** it's rate limited (5 a minute per IP) and a captcha there costs every user on every visit. The three endpoints above are the ones that let anyone make the app send email to any address, or create rows.
  - **Server env, not `VITE_`:** the site key is public, but serving it from the server means turning the captcha on or off doesn't need a rebuild.
  - A refused token shows "complete the security check"; forgot-password and sign-in-code otherwise keep showing the same "sent" message whether or not the account exists.
- **Why:** sign-up and reset forms are where bots send email in bulk on someone else's behalf.
- **Alternatives considered:** hCaptcha or reCAPTCHA (heavier, tracking concerns); Vercel BotID (ties the template to Vercel); the honeypot alone (only stops bots that fill forms in a browser).

## 0129: Account deletion always takes an emailed link; the export is a JSON download

*Extended by 0186: guests are deleted by a daily cleanup, with their uploads.*

- **What:** Better Auth's `deleteUser` with `sendDeleteAccountVerification`. "Email me a deletion link" on the account page sends a `delete-account` email whose link opens `/account/delete?token=…` (signed-in only), where one more click sends the token back (`authClient.deleteUser({ token })`). `beforeDelete` runs `prepareAccountDeletion` (`src/server/account/service.ts`): it refuses the last active admin (`LAST_ADMIN`, the same lock as the RBAC rules) and marks the user's unsaved uploads removed so the cleanup job deletes them from Cloudinary. Sessions, sign-in methods, two-factor rows and role assignments go with the user row (foreign keys cascade); records they created stay, with no author. `afterDelete` sends an `account-deleted` email. `GET /api/account/export` returns the user's data as a JSON download (profile, sign-in methods, sessions, roles, uploads, items they created; never password hashes, tokens or 2FA secrets).
- **Choices:**
  - **Email always, password never enough:** a stolen session (or an unlocked laptop) can't delete the account. The link opens our page, not Better Auth's GET callback, so a mail scanner opening it deletes nothing.
  - **Linked images stay:** an image saved with a record belongs to that record (other editors use it); only uploads nobody saved are queued.
  - **The last-admin check isn't in the same transaction as Better Auth's delete** (it can't be: Better Auth runs its own queries). Two last admins deleting themselves in the same instant is the remaining race; it's documented rather than worked around.
  - **Export as a server route**, so it's a plain link that works before hydration; a cross-site page can make the browser request it but can't read the answer.
- **Why:** users must be able to leave and take their data with them (and in many places the law says so).
- **Alternatives considered:** deleting with the password (no proof of inbox control, and Google users have no password); soft delete (a recipe in Task 33; a deleted account should be gone); an emailed export (a file with personal data sitting in an inbox).

## 0130: Linked accounts: add a password, link and unlink Google, never the last way in

- **What:** the account page's "Ways to sign in" section. A user without a password (signed up with Google) can set one (`setMyPassword` → Better Auth's server-only `setPassword`). Google can be linked (`authClient.linkSocial`, only when its verified address matches) and unlinked (`authClient.unlinkAccount`) while a password remains; Better Auth refuses to remove the last account (`allowUnlinkingAll: false`), and the button is disabled in that case. Adding a password or linking Google (also Better Auth's automatic linking when a Google sign-in matches an existing address) and unlinking send a `security-notice` email. The change-password section shows only when there's a password.
- **Why:** a Google-only user had no way to stop using Google, and nothing told a user that a new way into their account had appeared.
- **Alternatives considered:** allowing different addresses on linked accounts (an account takeover path when an attacker controls a Google account with another address); counting email-code sign-in as a way in, so Google could be unlinked without a password (it would leave the inbox as the only factor; Better Auth's rule is simpler and stricter).

## 0131: Last login method and passkeys are recipes

- **What:** `docs/guides/security.md` ("Recipes: last login method, passkeys") shows how to add Better Auth's `lastLoginMethod` plugin (a "last used" hint on the login page) and `@better-auth/passkey` (WebAuthn sign-in, with its own table and two-factor interplay).
- **Why a recipe:** last login method is a convenience with a cookie or an extra column; passkeys need a new dependency, a table, a migration and per-browser testing that not every project wants on day one. Both are a guide section only, with the exact code: a dev example would need the dependency and schema in every project, which is what the recipe avoids.
- **Alternatives considered:** shipping passkeys in the base (most templates built on this won't use them, and they change the sign-in UI's shape).

## 0132: Admin actions are audited in the same transaction as the change

*Its scope is widened by 0173: creates and edits of content are audited too, through `withAudit`. Extended by 0186: showcase-app data is never audited.*

- **What:** an `audit_event` table (migration `0008_audit_log`): actor, the admin behind an impersonated session, action, target type, id and label, a `before`/`after` summary of the changed fields, request id, client IP and time. Services write it with `recordAudit(tx, actor, entry)` (`src/server/audit/record.ts`) inside the transaction that makes the change: role create, rename, delete and permission edits; a user's roles, ban, unban, sign-out-everywhere and invitation; impersonation start and stop; Test CRUD publish, unpublish and delete. `/admin/audit` lists it through the list contract (search by target or request id, actor, action, target type, day range), guarded by a new `audit:read` permission (page and function).
- **Choices:**
  - **Same transaction, not an event bus or an after-commit hook:** a change without its row (or a row without its change) can't happen, and the service is the one place that knows what changed. A refused or failed action leaves no row.
  - **Who and where from:** server functions build the actor with `auditActorFrom(context)` (`src/server/audit/actor.ts`): the user, `impersonatedBy`, the request id from AsyncLocalStorage (0123) and the client IP from the same trusted source as the rate limits. Services take the plain `AuditActor`, so tests pass `{ id }`.
  - **Summaries, not snapshots:** `before`/`after` hold the few fields the action touched (names, permission lists, status, role names, counts), never secrets or whole rows. Unchanged saves (granting a permission the role has, publishing a published item) write nothing.
  - **History outlives accounts:** `actor_id` is set null when the account is deleted and `actor_label` keeps the email from the time. That is personal data kept after deletion on purpose (an audit trail that forgets who acted is no trail); projects with stricter rules can blank `actor_label` in `prepareAccountDeletion`.
  - **Append-only in the app:** nothing updates or deletes rows. Retention (e.g. delete after a year) is a cron job a project adds if it needs one.
  - **Not audited:** edits and creates of Test CRUD items (high volume, and the item itself has `updatedAt`); sign-ins and account changes (Better Auth's own events, a Task 33 recipe if wanted).
- **Why:** "who removed this permission?" needs an answer that doesn't depend on someone's memory, and the request id ties it to the logs and Sentry.
- **Alternatives considered:** database triggers (they don't know the actor or request id without session variables on every connection); writing after the transaction (a crash between the two loses the row); a generic diff of whole rows (noisy, and it would copy fields that shouldn't be kept).

## 0133: Inviting a user creates the account and emails a long-lived reset token

- **What:** `inviteUser` (`users:invite`, a new permission) takes a name, email and the invitation's language. The service creates the account (the `user` baseline, address unverified, no password) and its audit row in one transaction, then `sendInvitation` (`src/server/auth/invite.ts`) stores a Better Auth `reset-password:<token>` verification valid for 3 days and emails an `invite` template linking to `/reset-password?token=…&invite=1`. That page, worded as "Accept your invitation", calls Better Auth's normal reset, which creates the password account. `onPasswordReset` marks the address verified (only its owner could open the link), so the invitee signs in at once.
- **Choices:**
  - **Reuse the reset flow** instead of a new token type: the endpoint, its rate limit, the breached-password check and the page already exist and are tested. Only the lifetime (3 days, set when the token is stored) and the copy differ.
  - **No roles in the invitation:** an invitee starts with the baseline, and roles are given from the list like for anyone else, through the same escalation rules. The invite form stays three fields.
  - **An expired invitation needs no resend button:** "Forgot password" with the same address sends a fresh reset link and works for an account without a password.
  - **The email is sent in the background** (like every auth email), so a mail outage doesn't fail the invitation; the address is the admin's to re-check.
- **Why:** admins needed to add people without asking them to sign up and then finding their row.
- **Alternatives considered:** Better Auth's admin `createUser` (its endpoint is disabled, 0112, and it wants a password the admin would then have to pass on); the `organization` plugin's invitations (multi-tenancy, a non-goal); an admin-chosen password (it travels outside the app).

## 0134: Impersonation is admin-only, audited, and can't change the account

- **What:** "View as this user" on `/admin/users` calls `impersonateUser`, which runs Better Auth's server-side `impersonateUser` (its HTTP endpoint stays disabled, 0112) after writing the `user.impersonate` audit row, which is deleted again if the call fails. (Not one transaction: Better Auth writes the session through its own pooled connection, which waits for an open transaction; on the e2e harness, one PGlite backend, it waited forever. Stopping works the same way.) The session is the user's, with `impersonatedBy` set, for at most an hour. Every page then shows a banner (`ImpersonationBanner`, rendered in `__root.tsx` from the session, so no layout shift) with "Back to my account", which calls `stopImpersonating` (`src/functions/auth.ts`): Better Auth restores the admin's session from its signed `admin_session` cookie, and a `user.impersonate-stop` row names the admin. Rows written while impersonating carry the admin as `impersonator_id`.
- **Choices:**
  - **Admins only (the superuser flag), not a permission:** the session acts with all of the target's permissions, so a custom role holding "impersonate" could reach anything any user can. The function is guarded with `users:update` (every protected function names a permission) and the service refuses non-admins; Better Auth's own check agrees. Never another admin, never a banned user, never from an impersonated session.
  - **The account stays the owner's:** an impersonated session can't change the password, email, two-factor, linked accounts, other sessions or delete the account. Better Auth's endpoints are refused by a `before` hook (`refuseOwnerOnlyWhileImpersonating`, `OWNER_ONLY_PATHS` in `src/server/auth/policy.ts`); the app's own (`setMyPassword`, `revokeMySession`) use `requireAccountOwnerMiddleware`. Reading (including the data export) is allowed: it's what the admin came to see.
  - **A recipe in the base:** it ships because the guards are the hard part, but nothing else depends on it; a project that doesn't want it deletes the row action, `impersonateUser` and the banner.
- **Why:** support ("what does this user see?") without asking for their password, with a record of every use.
- **Alternatives considered:** a "view as role" preview (doesn't reproduce a user's data); our own session cookie handling (Better Auth already signs and restores the admin's session); allowing it for any `users:update` holder (escalation by impersonating someone with more permissions).

## 0135: Better Auth's `role = "admin"` stays the superuser flag

- **What:** `user.role === "admin"` (Better Auth's admin plugin field) means "every permission, and the rules only an admin may break" (making admins, acting on admins, impersonating). Everything else lives in the RBAC tables: the `user` baseline role, custom roles and their permissions. The `admin` row in `role` exists for display and holds no permission rows. `docs/guides/rbac.md` states the model.
- **Why:** the flag is read on every request by Better Auth itself (sign-in checks, impersonation, `adminRoles`), so moving it into `user_role` would mean keeping two sources in sync. A single boolean is also what the lockout rules (always one active admin) lock on.
- **Alternatives considered:** an `admin` assignment in `user_role` with Better Auth's `role` derived from it (two writes per change, and a window where they disagree); dropping the admin plugin (it also provides bans and the impersonation sessions used by 0134).

## 0136: The React Compiler runs on client builds, through Babel

- **What:** `babel({ presets: [reactCompilerPreset()] })` (`@rolldown/plugin-babel` + `babel-plugin-react-compiler`, as `@vitejs/plugin-react` 6 documents) in `vite.config.ts` and `.storybook/vite.config.ts`. The preset applies to the client environment only, so SSR output is unchanged. `babel-plugin-react-compiler` is pinned exactly (0119: its output is what ships, and React's docs advise pinning it). The `useCallback`s in `FilterBar`, `useBotCheck` and `useCloseOverlay` were removed (the compiler memoizes them; no caller uses them as an effect dependency). The `useMemo`s that create a resource (TanStack DB collections in the admin Test CRUD list and the optimistic example) stay: the compiler's memoization is a performance hint, not a guarantee of identity. shadcn's own `useMemo`s in `ui/` stay as generated.
- **Numbers** (`pnpm build`, same machine, before → after; client assets):

  | | Before | After | Change |
  | --- | --- | --- | --- |
  | Build time | 10–14 s | 19–20 s | about +7 s |
  | Client JS, raw | 2,815 kB | 2,963 kB | +5.2% |
  | Client JS, gzip -9 | 919 kB | 980 kB | +6.7% |
  | Entry chunk, gzip | 133.4 kB | 137.9 kB | +4.6 kB |
  | Forms chunk, gzip | 64.0 kB | 72.1 kB | +8.1 kB |

  Over `src/` (server code excluded) the compiler compiled 348 components and hooks and skipped 21, which stay as written. Most skips are "Cannot access refs during render" in form field components and Babel constructs it doesn't lower yet (`try`/`finally`, tagged templates in `ui/calendar.tsx`). The compiler's `logger` option lists them again when those files change.
- **Why:** lists, filters and forms re-render on every keystroke and URL change; the compiler removes that work without hand-written memoization, and the template stops teaching `useCallback` where it isn't needed. The cost is about 61 kB gzip, mostly in the lazy forms and editor chunks, and ~7 s of build time.
- **Alternatives considered:** the Rust compiler (`react({ compiler: true })` with `oxc-transform-react`): faster builds, but the plugin marks it experimental; revisit when it's stable. `compilationMode: "annotation"` (only `"use memo"` files): smaller bundle, but every new component has to opt in. No compiler: smallest bundle, and memoization stays a code-review topic.

## 0137: A skip link on every page; reduced motion finishes animations at once

- **What:** `SkipLink` (`src/components/layout/skip-link.tsx`) is the root layout's first element and jumps to `#main-content`; every page's `<main>` spreads `MAIN_CONTENT` (`id` + `tabIndex={-1}`; the shared `Page` does it). Sections with their own chrome (`chrome: "bare"`, the portfolio) bring their own link, and the root one is hidden there. The browser review checks on every page that the first tab stop is a skip link whose target is a `<main>`; `e2e/flows/frontend.spec.ts` follows it with the keyboard (in the admin area it also skips the sidebar). Under `prefers-reduced-motion: reduce`, `app.css` sets every animation and transition to 0.01 ms and removes view-transition animations. The text is the shared `skip_to_content` message (the portfolio's own key was merged into it).
- **Why:** WCAG 2.4.1 (bypass blocks) and 2.3.3 (animation from interactions). Shortening instead of `animation: none` keeps `animationend`/`transitionend` firing, which Radix Presence and sonner wait for before unmounting. `!important` is needed to beat component and inline styles, so the block carries a Biome suppression with that reason.
- **Alternatives considered:** a skip link per layout (four copies, each needing its own target); targeting the root's content wrapper (no per-page change, but in the admin area focus lands on the sidebar); `motion-reduce:` variants on each animated element (opt-in per component, easy to forget, and third-party CSS isn't covered).

## 0138: Real-user Web Vitals go to PostHog, after consent

- **What:** `src/lib/observability/web-vitals.ts` loads `web-vitals` once analytics runs (consent granted) and sends CLS, LCP and INP as a `web_vital` PostHog event with `metric`, `value` (CLS to 4 decimals, the others in ms), `rating`, `navigation_type` and `path` (no query or hash). Events go out with `send_instantly`, so the CLS/INP report made as the page is hidden uses `sendBeacon`. Without consent or a PostHog key, the library isn't downloaded.
- **Why:** the CLS ≤ 0.01 rule was only checked on a lab build (the e2e review). Visitors have slower devices, other fonts and real data; the 75th percentile of `web_vital` where `metric = CLS`, per `path`, is the production check (`docs/guides/observability.md`). PostHog is already the consented analytics tool, so vitals need no new processor or banner text.
- **Alternatives considered:** PostHog's built-in capture (`capture_performance`): loads its extension from PostHog's asset host at runtime, changing the network behaviour verified for 0074/0119. Sentry's browser tracing: records vitals too, but only for sampled page loads (10%) and adds the tracing bundle to every page. Sending without consent: vitals alone aren't personal data, but the PostHog request carries its device id.

## 0139: CSP violations are reported to /api/csp-report and forwarded to Sentry

- **What:** in production the CSP ends with `report-uri <origin>/api/csp-report; report-to csp`, and HTML responses carry `Reporting-Endpoints: csp="<origin>/api/csp-report"`. The endpoint (`src/routes/api/csp-report.ts`, logic in `src/server/http/csp-report.ts`) accepts both formats (Reporting API batches and the older `application/csp-report`), keeps only the origin and path of URLs, drops reports caused by browser extensions, and takes 10 reports a minute per client IP and 100 in total per server instance (429 beyond). Each report becomes a `warn` log line and a Sentry warning fingerprinted by directive and blocked resource, so a recurring violation is one issue with a count.
- **Why:** a CSP block in production is otherwise invisible: the page just misses a script or an image. The limits stop a misbehaving client or a flood from spending the Sentry quota. The limiter lives in memory because it guards a quota, not the app; exact limits across instances aren't needed.
- **Checking it:** `e2e/flows/frontend.spec.ts` checks the headers and the endpoint, `tests/server/csp-report.test.ts` the parsing, the limits and the Sentry call. Browsers deliver Reporting API reports out of band (Playwright can't see them), so watching one arrive in Sentry is a manual step on a preview deploy (`docs/guides/deployment.md`).
- **Alternatives considered:** `report-uri` straight to Sentry's security endpoint (no filtering or limits, and the DSN key in every page's header); `Content-Security-Policy-Report-Only` first (the policy has been enforced since 0081, so there is nothing to trial); a database-backed limiter (the Task 33 recipe; more than a quota guard needs).

## 0140: The admin command palette and view transitions are a recipe

- **What:** `/dev/examples/command-palette` shows a `cmdk` palette (`ui/command.tsx`) opened with Ctrl/⌘ K. It lists the admin sections the user holds the permission for (the sidebar's filter) and navigates with `viewTransition: true`. `docs/guides/conventions.md` explains mounting it in `AdminLayout` and the router's `defaultViewTransition`. Reduced motion turns the transition's animation off (0137).
- **Why:** both are product choices (a shortcut can clash with an app's own; a cross-fade on every admin navigation is a matter of taste), so the base stays plain and the recipe is ready to copy.
- **Alternatives considered:** shipping both in the admin layout (every project would carry the shortcut and the transition, wanted or not).

*Superseded by 0165: the palette is part of the admin shell; view transitions stay opt-in.*

## 0141: `pnpm new:feature` generates an admin CRUD section from templates and marker lines

*Superseded by 0175 (v2: the CRUD standard's shape, `--public`, `--localized`, a clean tree and rollback).*

- **What:** `scripts/new-feature.mjs <name> [--title] [--title-ne] [--no-build]` copies `scripts/templates/feature/` (paths and contents use `__name__`, `__snake__`, `__camel__`, `__Pascal__`, `__UPPER__`, `__Title__`; `.tpl` files, so Biome, TypeScript and knip ignore them) and inserts entries above `// @new-feature:<slot>` lines in the shared lists: the schema index, the permission catalog and its labels, audit actions, targets and labels, `ADMIN_SECTIONS`, the guarded-functions test and the e2e page lists. It appends messages to both locales, runs `drizzle-kit generate --name <snake>`, Biome on what it touched (and `drizzle/`), the Paraglide compiler and a build (which regenerates the route tree). The generated feature is the admin half of Test CRUD: title and notes, search, sort, pagination, create, edit with the version check (0122), delete and bulk delete with an audit row each (0132), thin routes, a PGlite service test and stories with their server-function mocks. `AdminSection["to"]` is now derived from the route tree (every `/admin/…` path without a param), so a new section needs no type edit.
- **Checked:** on a copy of the repo, `pnpm strip-demo` then `pnpm new:feature projects --title-ne "परियोजनाहरू"`, then typecheck, check, knip, test (564 tests), test:storybook, build-storybook and test:e2e, with no edits in between.
- **Why:** adding a feature touched about 25 files in a fixed order; most mistakes were a missing list entry (guard test, labels, e2e pages), which the gates catch only after the fact. Templates are plain files, so changing a convention is a reviewable diff of them. Marker lines are explicit and survive formatting, unlike anchoring on surrounding code.
- **Limits:** the edit page (`/admin/<name>/$id`) goes in `NOT_REVIEWED` until a seeded row exists (the review needs a real id). Without `--title-ne`, the Nepali name is the English one plus "(अनुवाद गर्नुहोस्)", which passes the parity test but is visibly untranslated. Public pages, filters beyond search, optimistic collections and attachments are left to copy from Test CRUD.
- **Alternatives considered:** a generator framework (Plop, Hygen): another dependency and template language for one command. Codemods over the TypeScript AST: robust to formatting but much more code than markers. Generating the whole Test CRUD feature: most projects would delete half of it.

## 0142: `pnpm strip-demo` removes the demo by file list, markers and unused messages

- **What:** `scripts/strip-demo.mjs` deletes the portfolio, `/stack` and their tests and guide (a file list), removes the lines between `demo:start` and `demo:end` comments and every line ending in `// @demo` (or holding `<!-- @demo -->` in Markdown) in tracked files, replaces the site description and home intro with neutral copy, drops every message no longer used in `src/` or `.storybook/` (the message-usage test's rule), removes the demo fonts (`pnpm remove`), its own `package.json` script and itself, then formats, compiles messages and builds. The home page keeps the feature-flag call to action (it links to Test CRUD) and loses the Intl card; Test CRUD and `/dev/examples` stay. `docs/guides/new-project.md` is the checklist around it.
- **Why:** a new project shouldn't start by hunting down a design system, two fonts and a dozen tests by hand. Trailing `// @demo` markers exist because Biome's import sorting moves a comment line onto the next import but keeps a trailing comment on its own line.
- **Alternatives considered:** a separate "bare" branch (drifts from `main`, and fixes need porting); keeping the demo in a package (the portfolio uses app internals throughout); deleting by regex on content (fragile across edits).

*Superseded by 0163: layers, data lists and stricter markers.*

## 0143: Routes stay thin; CLAUDE.md keeps only the pitfalls that apply everywhere

- **What:** `_authed/account.tsx` and `_admin/admin/test-crud/index.tsx` now hold only loader, search, head and a component that renders `AccountPage` (`features/auth/components/account-page.tsx`) or `TestCrudAdminList` (`features/test-crud/components/admin-list.tsx`), with what came from the URL as props. CLAUDE.md's pitfalls are split into "Always relevant" (kept) and "Per area": 23 moved to a "Pitfalls already solved" section at the end of their guide, with a one-line index per guide in CLAUDE.md. Grouping `src/lib` by area is a recipe in `conventions.md`, not done here.
- **Why:** the reference feature taught "UI in `features/<name>/components`" while its own biggest routes broke the rule. CLAUDE.md is read at the start of every session; per-area details there cost every reader for the benefit of a few. Moving `src/lib` would change ~150 imports and many doc paths for a modest gain, so it waits for a project that needs it.
- **Alternatives considered:** a component per account section in its own file (more files, no clearer); keeping all pitfalls in CLAUDE.md (it was past 150 lines and growing with every task).

## 0144: Two Part 3 bugs found by the e2e suite

- **What:** (1) `/reset-password` declared `invite: z.literal("1")`, but the router parses `invite=1` as the number 1, so invitations showed the plain reset page; it now uses `z.literal(1)` like `/account`'s `emailChanged`. (2) Starting and stopping impersonation called Better Auth inside the audit row's transaction. Better Auth writes through its own pooled connection, which waits for that transaction; the e2e harness's PGlite (one backend) then waited forever and every later test timed out. The row is now written first and deleted if the call fails (`withAuditRow` in `src/server/rbac/service.ts`), keeping 0134's guarantee; `recordAudit` returns the row ids for that.
- **Why:** both made `pnpm test:e2e` fail; (2) would also hold two connections per impersonation on Neon and could deadlock under row locks.
- **Alternatives considered:** for (2), running Better Auth's adapter on the transaction (it has no per-call connection option).

## 0145: Background jobs and cursor pagination are recipes

- **What:** `docs/guides/recipes.md` recommends Workflow DevKit for Vercel-only apps and Inngest or Trigger.dev otherwise; all three run named steps with retries, persisted between runs. `/dev/examples/background-jobs` shows that model in process (`runSteps()` in `src/server/examples/jobs.ts`: per-step retries with exponential backoff, giving up after the last one), with the rules for steps and for moving bulk email off the request. `cursorPaginate()`, `cursorOrder()`, `encodeCursor()` and `decodeCursor()` sit next to `paginate()` in `src/server/db/list.ts`, tested on PGlite with tied timestamps.
- **Why:** no job service fits every deployment, and each brings an account, a webhook route and a secret, so none is in the base. Cursor pagination is generic code, so it ships as a tested helper; admin lists keep offsets because they show totals and page numbers.
- **Alternatives considered:** a Postgres-backed queue (pg-boss): needs a long-running worker, which Vercel doesn't have. Cursor pagination by default: loses "page N of M", which admin tables use.

## 0146: Server-function rate limits are stored in Better Auth's `rate_limit` table

- **What:** `consumeRateLimit` / `enforceRateLimit` (`src/server/http/rate-limit.ts`) count fixed windows with one upsert into `rate_limit`, keys prefixed `fn:`. The contact example uses it; nothing in the base does.
- **Why:** the table already exists for Better Auth's database storage, so no migration, and all instances share it. Prefixed keys can't clash with Better Auth's (paths).
- **Alternatives considered:** a table of its own (a migration for the same three columns); Redis or Upstash (another service); in memory (per instance, so ineffective on serverless).

## 0147: Public-page caching is a header helper, not a default

- **What:** `publicCache({ sMaxAge, staleWhileRevalidate })` (`src/lib/http/cache-control.ts`) builds the Cache-Control value for a route's `headers`; `/dev/examples/caching` sets and reads it back. The guide lists which pages qualify and why.
- **Why:** every page today depends on the session or preference cookies through the root layout, and a wrongly cached page leaks one visitor's view to others. Caching has to be chosen per page, after checking the HTML is the same for everyone.
- **Alternatives considered:** caching `/portfolio` in the base (it is demo content that strip-demo removes); prerendering by default (content changes need a deploy).

## 0148: Contact form, avatar upload and list extras are examples to copy

- **What:** `/dev/examples/contact` (honeypot, Turnstile via `verifyTurnstile`, the rate limit), `/dev/examples/list-extras` (CSV export with `src/lib/csv.ts`, delete with an undo toast, saved views in `localStorage`), and the avatar steps in the guide on top of the attachments example.
- **Why:** each is a small product decision (where contact mail goes, whether undo is client-side or a soft delete, where views are stored), so the template shows a working version and the trade-offs instead of picking for every project. CSV escaping and formula-injection are easy to get wrong, so that part is a tested helper.
- **Alternatives considered:** soft delete in Test CRUD (every list and the sitemap would need the filter); saved views in a table (a migration for a feature most projects won't use).

## 0149: `pnpm dev:offline` runs on in-memory PGlite with every outside service off

- **What:** `scripts/dev-offline.ts` serves an in-memory PGlite over TCP (the e2e harness's server and seed), starts `vite dev` with it, the console email provider, and Sentry, PostHog, Cloudinary, Turnstile, Google and Resend keys set but empty.
- **Why:** each service was already optional, but the database wasn't, so a first run needed a Neon project. Reusing the harness keeps one PGlite server and one seed.
- **Alternatives considered:** mock HTTP servers for each service (more code than the "off" paths that already exist); a persistent PGlite directory (the seed isn't idempotent, and a real Neon branch suits data you keep).

## 0150: Preview branches, changelog checks, organizations and billing are documented, not wired

- **What:** `docs/recipes/preview-neon.yml` (a Neon branch per PR, migrated before a Vercel preview, deleted on close), `scripts/check-commit-msg.mjs` (Conventional Commits, tested, an opt-in `commit-msg` hook), and a guide section for Better Auth's `organization()` and `@better-auth/stripe` plugins.
- **Why:** the workflow needs project secrets, a commit convention is a team choice, and multi-tenancy changes every table, so none can be on by default. Organizations and billing stay guide-only: a working example would mean the plugins' tables, Stripe keys and per-tenant filters in every project, which is what "non-goal of the base" rules out.
- **Alternatives considered:** Changesets instead of a commit check (the guide describes both); enabling the hook (it would reject this repo's existing style of commit messages).

## 0151: Every page's JavaScript has a budget, and route options stay light

- **What:**
  - **Budget:** `scripts/check-bundle.ts` runs in CI after `pnpm build`. It sums the gzip size of the root route's preloads (the JavaScript every page loads) and fails above 240 kB, to become 200 kB when the site header leaves the root layout (Part 4, Task 35). TanStack DB has its own 105 kB line until Task 41 decides where it loads. A route may add at most 250 kB. A font that a `fonts.ts` module preloads must be 150 kB or less; the old portfolio's 709 kB Devanagari face is exempt until Task 40 replaces it, and an exemption that no longer matches a preloaded font fails the check.
  - **Code splitting:** `tanstackStart({ router: { codeSplittingOptions } })` splits `pendingComponent` too. The router plugin's default (component, errorComponent, notFoundComponent) kept Test CRUD's skeleton, and everything it imports (forms, Tiptap, libphonenumber), in the entry chunk. Route options must stay inline object properties: the splitter skips spreads and helper return values.
  - **Light route options:** `validateSearch`, `params`, `loader` and `head` stay in the entry chunk, so route files import a feature's URL contract from `search.ts`, never `schema.ts` (form schemas pull in rich-text and phone validation). `phone()` moved to `src/lib/phone.ts`, so only schemas with a phone field load libphonenumber.
  - **Results (gzip, every page):** 399.4 kB before. Splitting `pendingComponent` → 338.3. Sentry off the critical path (0152) → 286.3. Phone and search split → 258.7. Toaster and auth client on demand → 244.6. Impersonation banner's toast on demand → 235.5 (−41%). TanStack DB adds 100.6 kB on top.
- **Why:** the 300-plus kB were the same for a visitor reading one portfolio page and for an admin, and nothing stopped them growing back. A number in CI does.
- **Alternatives considered:** Rolldown's `treeshake.manualPureFunctions` for Zod calls (it covers direct calls only, not chains like `z.string().trim()` or the app's helpers); a 200 kB budget now (the site header's Radix menus stay in the root until Task 35).

## 0152: Browser Sentry loads after the entry chunk

- **What:** `src/lib/observability/sentry-client.ts` imports and initialises the browser SDK when `src/client.tsx` starts, in parallel with hydration; errors thrown before it's ready are buffered by two listeners and sent once it is. `captureException`, `setSentryUser` and `traceNavigation` (used by the error page, ObservabilitySync and the router) queue on it. Code that also runs in the browser never imports `@sentry/tanstackstart-react` statically: `src/middleware/sentry.ts` re-implements Sentry's global request middleware (a try/catch around `next()`) with the SDK imported inside `.server()`, and `normalizeServerError` imports it when it captures. Development sends no traces unless `VITE_SENTRY_DEV_TRACING=true`; production still samples 10%. Supersedes the loading part of 0073.
- **Why:** the SDK was about 45 kB gzip of every page's entry chunk, and one static import anywhere in the client graph (start.ts, through the request middleware's browser stub) was enough to keep all of it, because a module that is both imported and dynamically imported isn't split. Tracing every dev request and navigation slowed `pnpm dev` noticeably with a DSN in `.env`.
- **Alternatives considered:** Sentry's loader script (a third-party script the CSP would have to allow); `lazyLoadIntegration` (the core SDK stays in the entry); dropping capture of errors before load (hydration errors are the ones most worth seeing).

## 0153: The session is resolved once per request

- **What:** the request-id store (0123) is now a request scope: `src/server/http/request-scope.ts` holds the id and a memo, and `requestMemo(key, compute)` shares one promise per request. `getServerSession` uses it, so the root `beforeLoad`, the admin gate and every server function called while rendering a page share one Better Auth lookup and one permissions query. Failures aren't kept; `forgetSession()` clears it after stopping an impersonation. Outside a request (scripts, Nitro routes, tests) it computes every time. The session stays in the root `beforeLoad` (0043, 0090) and the cookie cache stays off (0040).
- **Why:** an admin page looked the session up three times per request (root, `ensureAdminAccess`, each loader's `requirePermission`), each a database round trip, which is about 300 ms each from Kathmandu to Neon's us-east-2.
- **Alternatives considered:** Better Auth's cookie cache (rejected in 0040: revoked sessions and permission changes would lag); passing the session down through context (server functions are separate entry points and must check for themselves).

## 0154: Feature flags never wait more than 300 ms

- **What:** with `POSTHOG_SECRET_KEY` (a Project Secret or Personal API key), posthog-node polls flag definitions every 30 s and evaluates flags in memory. Without it, a flag request times out after 300 ms (was 1.5 s) and answers are cached per flag and visitor for 30 s, at most 1,000 entries. Off on any failure, as before. Extends 0075.
- **Why:** `/` waited up to 1.5 s on PostHog for every server render, for a flag that rarely changes.
- **Alternatives considered:** evaluating flags in the browser after hydration (the UI would flicker, which 0075 avoids); no flags on SSR pages.

## 0155: Dev speed: one message module per locale, Babel only on our code, a local database

- **What:**
  - **Paraglide:** `paraglide.config.ts` uses `outputStructure: "locale-modules"`, so the CLI, Vitest and `pnpm dev` produce the same files (the CLI needs the flag too: 0198). Only production builds override it to `message-modules` (in `vite.config.ts`), which tree-shakes messages per page. Supersedes 0020's "the same options everywhere".
  - **React Compiler:** Babel runs on `src/**` only, excluding `src/paraglide` (the plugin's default ran it on all 1,064 compiled message modules).
  - **Vite:** `server.warmup` transforms the client entry, the layouts and the server entry at startup.
  - **Database:** `pnpm dev:local` serves PGlite stored in `.data/pglite` (gitignored) over TCP; every start applies new migrations and the first one seeds an admin and the demo data. The dev pool keeps idle connections for 5 minutes (production: 10 s).
  - **Fonts:** each section's layout preloads its own fonts; the root no longer preloads Inter on portfolio pages.
  - **Measured on this machine (Windows, Kathmandu):** Neon answers in about 300 ms per query (`pnpm diagnose`), so every page waited for several of those; on `dev:local`, Vite is ready in 3–5 s, a new page renders in 0.3–0.4 s and a repeat in about 50 ms. The first page after a cold start takes 5–12 s (server-side transforms, noisy on Windows).
- **Why:** dev was slow for three stacked reasons: a thousand message modules (each a request and a Babel pass), a remote database far away, and Sentry tracing (0152).
- **Alternatives considered:** keeping `message-modules` in dev with only the Babel filter (still a thousand requests per first page; Paraglide's docs recommend `locale-modules` for dev); a Docker Postgres for `dev:local` (another tool to install; PGlite is already a dependency). 0149 rejected a persistent PGlite because the seed isn't idempotent; `dev:local` seeds only a new directory.

## 0156: `pnpm setup:local` and `pnpm diagnose`

- **What:** `pnpm setup:local` takes a fresh clone to a runnable app: it checks Node, creates `.env` from `.env.example` if missing and fills an empty `BETTER_AUTH_SECRET`, compiles the messages and creates the local database. `pnpm diagnose` checks Node and pnpm against the pins, `.env` against both env schemas, which optional services are on, database reachability and per-query latency, pending migrations, compiled messages, and ports 3000 and 3100 (a running e2e server is reused as is), and prints the fix for each problem. Both are TypeScript run by Node directly.
- **Why:** a first run needed a Neon project and reading three guides; most "it doesn't start" problems are one of the things `diagnose` checks.
- **Alternatives considered:** the names `pnpm setup` and `pnpm doctor` (both are pnpm's own commands, so the scripts would never run); a postinstall hook (installs run in CI and on Vercel too).

## 0157: inlang CLI for machine translation and checks; plugins load from node_modules

- **What:** `project.inlang/settings.json` loads the message-format and m-function-matcher plugins from pinned devDependencies (`./node_modules/...`) instead of an unpinned jsdelivr URL. `pnpm i18n:translate` runs `inlang machine translate` from English into Nepali and fills only messages that have no Nepali yet (existing translations are skipped). `pnpm i18n:check` runs `inlang check` (missing or empty translations, variables, markup, plural forms) and runs in CI; the message-usage test still covers unused keys, because inlang can't follow re-exports.
- **Why:** every compile (dev start, typecheck, CI) fetched the plugins first and needed the network, from an unpinned major version. Machine translation was the Paraglide feature the project didn't use, and adding a message meant typing Nepali by hand.
- **Caveat recorded:** without a key the CLI uses a community-run service (translate.demosjarco.dev). A test produced fluent but wrong Nepali (it added sentences that weren't in the English). Set `INLANG_GOOGLE_TRANSLATE_API_KEY` for quality, and always review the diff; DeepL has no Nepali.
- **Alternatives considered:** a script calling an LLM or Google directly (more code for what the CLI does); committing the CDN cache (the cache is keyed by URL and still needs the first fetch).

## 0158: `src/lib` is grouped by area, and Biome enforces the import boundaries

- **What:**
  - **Layout:** `lib/list/` (`params.ts` URL param schemas, `paging.ts` `Paged` and page maths, `url.ts` search serialization; was `list.ts` + `search.ts`, split by what each export is rather than at random), `lib/env/`, `lib/i18n/` (intl, Nepali digits, calendar days), `lib/http/` (CSP, cache-control, redirects), `lib/observability/`, `lib/start/` (modules that need the Start runtime: `http-status`, `read-preferences`), `lib/tanstack-db.ts` (was `db.ts`, easily confused with the database). Hooks moved to `src/hooks/` (where `components.json` expects them); the server-function validator to `src/functions/_lib/validator.ts`; the locale function middleware to `src/middleware/locale.ts`; `zodFieldErrors` to `lib/errors.ts`.
  - **Biome:** `noRestrictedImports` refuses `zod/v4` and `zod/mini` everywhere but the alias target, and in `src/components/**`, `src/features/**/components/**` and `src/hooks/**` refuses `@/server/**` and `@/lib/start/**`. The React, test and Playwright rule domains are on.
  - **Scripts:** the seed, coverage and commit-check scripts are TypeScript, type-checked with the app and run by Node directly; `engines` is `>=22.18` (type stripping), which the `.ts` scripts already needed.
- **Why:** a flat folder of 40 files with names like `db.ts` and `cache.ts` didn't say what was safe to import where; the rules that did (CLAUDE.md pitfalls, tests scanning imports) caught mistakes late.
- **Alternatives considered:** Biome's `useSortedClasses` (a nursery rule, and it doesn't know the Tailwind 4 custom utilities); converting `new-feature` and `strip-demo` now (both are rewritten in Part 4, Tasks 35 and 38); converting `install-hooks` (it runs during `pnpm install`, on whatever Node is installed).

## 0159: Tests start from one migrated PGlite database per run

- **What:** the unit project's global setup (`tests/setup/pglite.ts`) migrates one PGlite database and dumps its data directory to `node_modules/.cache/vitest-pglite/`, keyed by a hash of `drizzle/`. `createTestDb()` loads it (`loadDataDir`) instead of running initdb and the migrations, takes an optional `seed` for a file's own fixtures, and `reset()` truncates every table and adds the admin and the seed back. Testing Library loads only under jsdom. Both Storybook passes run in one `vitest run`. The e2e harness deletes saved sign-ins (`e2e/.auth`) when it starts a new database.
- **Why:** starting PGlite costs about 1.5 s (initdb) against 0.4 s to load a snapshot, and `reset()` only cleared two tables, so tests could depend on each other's users and roles. Measured: `pnpm test` 43–50 s → 29 s; `pnpm test:storybook` two sequential runs → one 69 s run.
- **Alternatives considered:** PGlite `clone()` (needs a live instance in the same worker; files run isolated); one shared database for all files (tests would interfere).

## 0160: Postgres image storage from Part 1 is dropped

- **What:** migration `0009_drop_legacy_test_crud_image` drops `test_crud.image` and the `test_crud_image` table, and `pnpm attachments:import-legacy` is removed. The migration is hand-ordered (foreign key, column, table): drizzle-kit generated `DROP TABLE … CASCADE` first, which removes the foreign key, so its own next statement would have failed.
- **Why:** nothing in the app has read them since attachments moved to Cloudinary (0098), and every new project inherited a `bytea` table it would never use.
- **Before migrating a database that may still hold Part 1 images:** run `attachments:import-legacy` from the commit before this one first.
- **Alternatives considered:** keeping them until each project drops them (every project would have to know to).

## 0161: The portfolio is the site at `/`; each layout renders its own header; sections can skip the session

- **What:**
  - **Routes:** the portfolio moved from `/portfolio` to a pathless `_site` layout (`/`, `/work`, `/about`, `/journal`, `/contact`). The old demo home, `/stack`, the public Test CRUD pages, `/dev/forms` and `/dev/examples` moved under `src/routes/dev/` (0162). `_public` keeps health, verify-email and reset-password, and is where new public pages go.
  - **Headers:** the root renders no header, only the skip link, the impersonation banner, the consent banner and toasts. `SiteHeader` takes `links`. `_public`, `_auth`, `_authed` and `_admin` render it with none (the brand to `/`, Admin when permitted, account or sign-in, language, theme); `dev` passes the demo's four links and adds `SiteFooter`; the portfolio renders its own. `src/lib/chrome.ts` (`chrome: "bare"`) is gone. Supersedes 0105.
  - **One skip link:** the root's `SkipLink` is the only one. The portfolio's `<main>` spreads `MAIN_CONTENT` instead of having its own link to `#pf-main`.
  - **Session opt-out:** `staticData: { session: "skip" }` (`src/lib/session-scope.ts`). The root `beforeLoad` returns `{ session: null }` without a lookup when any match sets it (router-core 1.171 passes `matches` to `beforeLoad`). `ImpersonationBanner` and `ObservabilitySync` read the session with `enabled: !useSessionSkipped()`; otherwise the browser would fetch it after hydration. Only `_site` sets it; navigating to any other section runs the root `beforeLoad` again and looks it up.
  - **Impersonation (0134):** the portfolio shows no impersonation banner (it never knows the session), so "View as this user" now lands on `/account` instead of `/`. Every other section still shows the banner.
  - **Types:** reading `matches` in the root `beforeLoad` made the route tree's types circular (`match.routeId` became `unknown` in `session-expiry.ts`). An explicit return type, `Promise<{ session: Session | null }>`, breaks the cycle.
  - **JSON-LD:** the portfolio home emits `WebSite` (its publisher is the owner's `Person`, whose `@id` is now `/#person`) with the `Person`. The old home's `Organization` and Test CRUD's `Product` (0102) went private with their pages, so `organizationJsonLd` and `productJsonLd` were removed; `websiteJsonLd` takes an optional publisher.
- **Why:**
  - It is the finished product's URL layout: the owner's portfolio is the site, and the demo is a developer reference.
  - Once most sections have their own frame (Task 36 turns these headers into shells), a header per layout is simpler than a global header with opt-outs.
  - The portfolio reads no user state. A session lookup on each of its pages was a database round trip (about 300 ms against Neon from Kathmandu, section 10.4) for nothing, and fetching it in the browser instead would only move the cost.
- **0046 restated:** `verify-email` and `reset-password` stay under `_public`, not `_auth`: `_auth` sends signed-in users away, and `autoSignInAfterVerification` arrives signed in.
- **Alternatives considered:** keeping 0105's opt-out with the portfolio at `/` (every new section would have to opt out); a path check for the session (breaks with the `/ne` prefix and spreads section knowledge into the root; `matches` exists, so it isn't needed); fetching the session lazily in the browser on the portfolio (moves the cost, doesn't remove it).

## 0162: `/dev` pages exist in dev and in e2e builds (`DEV_ROUTES`); a production deploy refuses the flag

- **What:**
  - **The flag:** `src/lib/dev-routes.ts` exports `DEV_ROUTES = import.meta.env.DEV || import.meta.env.VITE_DEV_ROUTES === "true"`. It reads `import.meta.env` directly, so Vite inlines both values and a plain build folds it to `false` (checked: the `/dev` layout's `beforeLoad` compiles to an unconditional `throw notFound()`).
  - **Every dev check uses it:** the `/dev` layout, `devOnlyMiddleware` and `assertDev`, `/dev/forms`'s component, and `functions/dev.ts` (which now uses the middleware instead of its own check). Supersedes the `import.meta.env.DEV` guard of 0061 and 0103.
  - **Env and guards:** `VITE_DEV_ROUTES` (`"true" | "false"`, optional) is in the client env schema. `vite.config.ts` throws at build, and `src/server/plugins/validate-env.ts` at boot, when it is `"true"` and `VERCEL_ENV` is `"production"` (Nitro inlines the flag in the plugin too).
  - **Reviewed:** the e2e harness builds with it, so the browser review covers every `/dev` page (`/dev/forms`, `/dev/examples` and its 21 pages are new to it, 12 combinations each). CI's e2e job runs on 5 shards instead of 3.
  - **Public Test CRUD is a dev reference:** `/dev/test-crud` and its detail pages use `privateHead()`, and `test-crud-public.ts` and `stack.ts` run `devOnlyMiddleware`. The old home (`/dev`) and `/dev/stack` are private too.
  - **Sitemap (updates 0101):** only the home page and the portfolio's pages. The `/stack` and `/test-crud` entries and their published-items query are gone. `robots.txt` is unchanged, since `/dev` is a 404 in production.
  - **`listSeo()`** has no caller now. It stays as the list-page recipe's head, tagged `@public` so knip keeps it.
- **Why:** the dev pages are references that should be checked like any other page, but must never ship. A build flag lets the review use a real production build. The double guard (build and boot) makes a mis-set flag on Vercel fail loudly instead of publishing them.
- **Alternatives considered:**
  - Reviewing `/dev` against `vite dev`: not a production build (different chunks, no font preloads, layout-shift numbers meaningless).
  - `clientEnv.VITE_DEV_ROUTES`: not folded, so dev-only code would stay in every bundle.
  - A runtime server variable: the client code would still ship.

## 0163: `pnpm strip-demo` removes layers (portfolio, apps) by data lists and markers; the core stays

- **What:**
  - **Script:** `scripts/strip-demo.ts` replaces `strip-demo.mjs`, with flags `--keep-portfolio`, `--keep-apps` and `--no-build`. The layers are `portfolio` and `apps` (empty until Task 41). Each layer's files, package scripts, `vercel.json` crons, `knip.json` entries and schema files are lists at the top of the script, so later tasks append to them.
  - **Core, never removed:** auth, admin, RBAC, audit, attachments, i18n, SEO, Test CRUD and all of `/dev`. `/dev/stack` and the Intl showcase now stay (dev-only references), so their old `demo` markers are gone.
  - **Markers** (`scripts/lib/strip-markers.ts`):
    - Blocks: `<layer>:start` / `<layer>:end` comment lines (`//`, `/*`, `{/*`, `<!--`, `#`).
    - Lines: a line ending in `// @<layer>`, or holding an HTML comment `@<layer>` outside backticks.
    - Never touched: mentions in prose, and the records (PLAN.md, decisions.md, docs/history). 0142 matched `demo:start` anywhere, so it would have cut lines from those.
    - `tests/unit/strip-markers.test.ts` checks every tracked text file for balanced blocks and for leftover `demo` markers.
  - **When the portfolio goes**, the script writes:
    - a neutral landing page, `src/routes/_public/index.tsx`, from `scripts/templates/landing/index.tsx.tpl` (`seo()` with `WebSite` JSON-LD);
    - its `landing_*` messages, which the script holds: unused keys would fail the message-usage test while the portfolio exists;
    - the route test's indexable home entry, at a `// @strip-demo:indexable` line;
    - a neutral `site_description` and `home_intro`.
  - **Then:** it drops messages nothing uses, runs `knip --fix --fix-type dependencies` and `pnpm install` (removing the portfolio's three fonts), formats, compiles the messages, runs `drizzle-kit generate --name strip_<layers>` when a layer had tables, and builds.
  - **Once no layer is left,** it deletes itself, its marker library, its landing template, its test, and CI's template job (a `# strip-demo:start` block). With a layer kept, it stays, so the rest can go later.
  - **CI:** the template job is a matrix: all layers stripped, `--keep-apps`, and `--keep-portfolio`. Each runs `new:feature`, typecheck, check, knip, test and the migration check.
- **Found while running that matrix locally (fixed here):**
  - The scaffolder's templates still imported the `src/lib` paths from before 0158, so `pnpm new:feature` failed to build.
  - knip's vite plugin loads `vite.config.ts` in serve mode, which validates the server env, so `pnpm knip` exited 2 without a `.env` (as in CI). knip now has `"vite": false`, with `vite.config.ts` as a plain entry.
  - `tests/setup/env.ts` only defaulted its values, so CI's `VITE_APP_TITLE` changed what the tests expected. It now sets them.
- **Why:** later tasks add the database-driven portfolio and six apps, which a new project may or may not want, so one all-or-nothing demo no longer fits.
- **Alternatives considered:** one script per layer (the shared steps would be duplicated); an AST-based remover (markers are simpler, and they work in CSS, Markdown and YAML); deleting by directory only (shared files like the sitemap and the route test need edits). Supersedes 0142.

## 0164: "Graphite": layered oklch tokens, accent, radius and density presets on `<html>`, contrast tested

- **What:**
  - **Tokens** (`src/styles/app.css`): cool graphite neutrals (hue 265) with three layers (`--background`, `--surface-1` for the sidebar and muted panels, `--surface-2` for cards and popovers); a near-black dark mode (`oklch(0.165 0.005 265)`); hairline borders; an elevation scale (`--elevation-*`, mapped to `shadow-*`, darker with a faint top highlight in dark mode); status tokens `success`, `warning`, `info` and `danger` (= `destructive`), each with `-foreground` (text on the fill) and `-subtle` (a tint); a type scale (`text-display`, `text-title`, `text-heading`, `text-body`, `text-caption`, registered in the app's `cn`); Inter's `cv11` and `ss01`; tabular figures in tables and `[data-figures]`.
  - **Presets**, each an attribute on `<html>` rendered by the server from a cookie (`preferenceHtmlProps`), so nothing flashes: `data-accent` (indigo, violet, emerald, amber, rose: `--primary`, `--primary-foreground`, `--accent-subtle`, `--chart-2…5` per theme), `data-radius` (sharp 4 px, default 8 px, round 14 px; `rounded-sm…xl` scale from `--radius` by multiplication, so the sharp preset never goes negative) and `data-density` (`--control-height` 36/32 px and `--row-padding`, used by Button, Input, InputGroup, Select, NativeSelect, the filter bar and table cells). `Preferences` gained `accent`, `radius` and `density`, with cookies, parsing and store actions; the appearance page (`/admin/settings/appearance`) sets them.
  - **Dark accents are light, with dark text on them** (as shadcn's dark primary): an indigo fill with white text would leave `text-primary` under 4.5:1 on the dark background.
  - **Accent selectors match any element** (`[data-accent="rose"]`, `.dark[data-accent="rose"], .dark [data-accent="rose"]`), so a swatch can show another accent; indigo repeats the `:root` defaults for that.
  - **`tests/unit/design-tokens.test.ts`** parses `app.css`, applies its rules as `<html>` would match them per accent × theme, resolves `var()`, converts oklch to sRGB (clipped) and checks 4.5:1 for every text pair. The browser review only sees the default preset.
  - **Shells** (`components/admin-shell`, `auth-shell`, `app-header`, `brand`): the admin frame on shadcn's `Sidebar` (icon collapse, a sheet on phones chosen by CSS rather than an `isMobile` state, which broke hydration of 403 pages on phones; the `sidebar` preference cookie instead of shadcn's own; a sticky container instead of a fixed one so the impersonation banner pushes it down; a `<div>` inset because pages own `<main>`), a split-screen sign-in frame with server-rendered contour art, and a compact header for the account page. Breadcrumbs moved out of `PageHeader`: the admin topbar shows them, other pages render `<Breadcrumbs />` above the header.
- **Checked:** Tailwind 4's `--text-<name>--line-height`, `--letter-spacing` and `--font-weight` sub-properties compile into the `text-<name>` utility (built CSS). shadcn's CLI (`shadcn@latest add`) still writes `from "cn"` and adds the unrelated `cn` package (reverted, 0118); every overwrite prompt was answered "no". Its sidebar writes a `sidebar_state` cookie, renders `<main>` and hard-codes English screen-reader text; its `BreadcrumbPage` is `role="link" aria-disabled`. All changed in our copies (design-system.md, pitfalls).
- **Why:** the owner chose a Linear-style admin with switchable presets (PLAN 10.2). Attributes on `<html>` keep the presets in CSS (no JavaScript per component, no runtime theme object) and SSR-safe; the test makes ten combinations as safe as the one the browser review sees.
- **Alternatives considered:** CSS variables set inline from JavaScript (flashes before hydration); generating the accent ramps at runtime with relative `oklch(from …)` colours (contrast can't be tested statically); one fixed accent (the owner asked for presets).
- **Entry JS:** +1.4 kB gzip (234.8 → 236.2): the root needs the preset state and `useAppearance` to render `<html>`'s attributes, plus the new route's options. The shell itself is in the `_admin` route chunk (35 kB).

## 0165: The command palette is part of the admin shell

- **What:** `components/admin-shell/command-menu.tsx` (cmdk) opens with Ctrl/⌘ K anywhere in the admin area, or with the topbar's search button. Groups: recent pages (the last five admin pages opened, in `localStorage`, every access in try/catch), every section the user may open (`permittedSections`, matching labels and each section's localized `keywords`), feature actions (`AdminCommand`s from `features/<name>/commands.ts`, collected in `ADMIN_COMMANDS`; Test CRUD's "New Test CRUD item"), theme, language (a full load, like the switcher) and sign out. It navigates with `viewTransition: true`. The `/dev/examples/command-palette` recipe and its messages are gone.
- **Why:** the owner chose a keyboard-first admin (PLAN 10.2); a palette that only exists as a recipe isn't keyboard-first. Actions registered per feature keep the palette free of feature imports beyond one list.
- **Known quirk:** after typing, cmdk's `aria-activedescendant` can briefly name an item the filter just removed, which axe flags while the dialog is open. The e2e review never opens it; the story closes it before its a11y check.
- **Alternatives considered:** keeping the recipe (0140); a palette that searches records too (needs a search endpoint per feature; later, when a feature wants it). Supersedes 0140.

## 0166: The admin dashboard reads one server function, filtered by permission

- **What:** `getDashboard` (`src/functions/admin.ts`, `requireAdminAccessMiddleware`, listed in the guarded-functions test with its reason) calls `src/server/admin/dashboard.ts`, which runs these reads in parallel, each only when the actor holds that section's read permission: Test CRUD totals by status plus items created in the last 7 days (one scan with `count(*) filter (where …)`), users (total, banned, new in 7 days), the role count, and the last 10 audit events (the audit list query). Parts the user may not read are `null`, so the browser never gets numbers it couldn't open. It also returns `generatedAt`, the "now" for relative times, so the server and the browser render the same words. The page (`features/admin/components/dashboard.tsx`) shows `StatCard`s, the activity list and quick actions (the `ADMIN_COMMANDS` the user may run, plus Appearance).
- **Why:** one round trip for the whole page (the database is about 300 ms away from the owner), and the permission rule lives on the server like every other read.
- **Alternatives considered:** one query per card through each section's list function (four round trips, and list functions return pages, not totals); counting on the client from cached lists (wrong once a list is filtered or paged).

## 0168: The admin component kit: heavy fields aren't registered, dialogs load on click, confirms are a promise

- **What:** Task 37's kit in `src/components`: page layouts (`PageTabs`, `DetailLayout`, `SettingsLayout`, `FormSection`, `FormCard`, `StickyFormBar`, `EmptyState` v2), data display (`DescriptionList`, `StatusOf` with `defineStatuses`, `UserCell`, `RelativeTime`, `CopyButton`, `Timeline`/`ActivityFeed`, `StatCard` with a sparkline), charts (0171), dialogs, DataTable v2 (0169), composite fields, hooks (`useHotkeys`, `useDebouncedValue`, `useMediaQuery`) and 13 shadcn primitives. Three rules shape it:
  - **Composite fields aren't registered on `useAppForm`.** `createFormHook`'s `fieldComponents` are imported by every page with a form, the login page included. The new fields (sortable lists, blocks, relations, slug, localized, the image gallery) bring dnd-kit, Query searches or Tiptap, so they are imported where they're used and rendered inside `form.AppField`; they read the field from context like the registered ones. `LocalizedField` is a `withFieldGroup` group (exported from `components/forms`).
  - **Dialogs that open on click are lazy.** The users and roles pages imported their form dialogs at module level, so every field on `useAppForm` came with the page (Task 34 measured 90–104 kB). They now `React.lazy` the dialogs: users 100.3 → 50.5 kB, roles 86.9 → 37.7 kB gzip on top of the root. The RBAC dialogs are `FormDialog`s.
  - **Confirms are `await confirm({ … })`.** `ConfirmProvider` is mounted once per shell (`AdminShell`, the `/dev` layout, Storybook's providers) and `useConfirm()` returns a promise of `true`/`false`. The per-page confirm state (`DeleteRequest`, `Confirming`, `Dialog`) and `ConfirmDialog` are gone; asking again while one is open answers the first with `false`.
- **Also:** `RelativeTime` renders from a `now` the server also used (`useSyncExternalStore` with that as the server snapshot), then one shared minute clock. `slugify` and `SLUG_PATTERN` moved to `src/lib/slug.ts` (Task 38 replaces the portfolio and RBAC copies). `/dev/examples` gained `components` and `fields`; its frame uses `FormCard` and `DescriptionList` (`Facts` is gone), list-extras uses the table's own CSV and views.
- **Why:** the plan's goal (features supply data, columns, fields and actions), without making every page pay for every component.
- **Trade-offs:** two ways to render a field (`field.TextField` vs `<SlugField />` inside `AppField`); the forms guide says which is which. Entry JS grew 1.7 kB gzip (236.3 → 238.0): two new routes in the route tree and longer preload lists of shared chunks, not kit code.
- **Alternatives considered:** registering everything (simplest call sites, heaviest pages); a second form hook for heavy fields (two `useAppForm`s to choose from); keeping `ConfirmDialog` controlled (every page re-implements the pending-request state).

## 0169: DataTable v2 runs on TanStack Table v9, in manual mode

- **What:** `DataTable` (same props: `DataTableColumn<Row>`, `tableId`, `rows`, `sort`, `bulkActions`) is built on `@tanstack/react-table` 9.3 (`useTable`, `tableFeatures`): column visibility (controlled from the preferences cookie), row selection (this page's rows only), column pinning (the first column and the checkboxes stay put on phones, by CSS `sticky`) and sorting state in manual mode (it only drives `aria-sort`; the header is still a `SearchLink`). New: `toolbar`/`activeFilters` slots and a button group with saved views (`savedViews`, localStorage per table), CSV (`exportName`, columns with `csv`) and the Columns menu (`DataTableColumnsMenu` merged in); `rowActions` returns `RowAction` data (`permission`, `destructive`, `separated`, `hidden`, `onSelect` or `render`), shown in the "…" menu and a non-modal right-click menu, the column omitted when no row has one; past 15 rows the table scrolls in a focusable frame under a sticky header (a bare `<table>`: `ui/table`'s own scroll wrapper would capture the sticky header).
- **Why v9:** it is the current major (9.3.1), its state is TanStack Store 0.11, the version the app already uses, and it works under the React Compiler (v8's `useReactTable` needed `"use no memo"`). Manual mode keeps the URL contract (0116) and server rendering: the table never sorts or pages in the browser.
- **Deviation from the plan:** pagination isn't registered with the table (`rowPaginationFeature`): rows are one server page and `Pagination` renders URL links, so the feature would hold state nothing reads.
- **Alternatives considered:** v8 (an older major and Compiler workarounds); keeping the hand-written table (selection, pinning and visibility logic duplicated, and no path to resizing or expansion: those are now a recipe, recipes.md).

## 0170: Sortable lists use `@dnd-kit/react`, pinned exactly, plus Alt + arrows

- **What:** `SortableList` (`components/forms/fields/sortable-list.tsx`) on `@dnd-kit/react` 0.5.1 and `@dnd-kit/dom` 0.5.1 (exact versions: pre-1.0, minors break, per 0119). Pointer and keyboard dragging come from its default sensors; the `Accessibility` plugin's announcements and instructions are Paraglide messages. Each handle also takes Alt + ↑/↓ to move one place, announced in a live region. `SortableListField`, `BlocksField`, `KeyValueField` and `ImageGalleryField` (which replaced the attachments field's native drag and drop and move buttons) use it.
- **Why:** `@dnd-kit/core` 6.3 and `@dnd-kit/sortable` 10 haven't had a release since December 2024; `@dnd-kit/react` is where development happens (0.5.1, October 2026), supports React 19, and its multi-list sortable is what the Kanban app (Task 41) needs. Alt + arrows is a one-key-press path that needs no drag mode, and it is deterministic in jsdom (the image gallery and list tests use it; Storybook covers the real browser).
- **Alternatives considered:** `@dnd-kit/core` + `sortable` (stable API, but unmaintained); move up/down buttons per item (two more buttons per row; the gallery had them); native HTML drag and drop (no keyboard, no touch).

## 0171: Charts: Recharts 3 loaded on demand into a fixed-size frame, with a data table for screen readers

- **What:** `components/charts`: `AreaChart`, `BarChart`, `DonutChart` render a `ChartFrame` (a fixed aspect ratio) that shows a skeleton on the server and until `React.lazy` has loaded the Recharts chunk (`ClientOnly` + `Suspense`), then the chart in the same box. The drawing is `aria-hidden` (`accessibilityLayer={false}`, the pie's `rootTabIndex={-1}`); a visually hidden `<table>` with the same numbers, captioned by `label`, is server-rendered. Values print with `formatNumber` (Devanagari digits in Nepali). `ui/chart.tsx` is shadcn's v3 chart without its injected `<style>` (colours are inline `--color-<key>` variables, `var(--chart-n)` by default) and with locale-aware numbers. `Sparkline` is plain SVG.
- **Why:** Recharts is about 150 kB gzip; no page should load it before it shows a chart, and a chart that sizes itself would shift the page (the review's CLS limit is 0.01). A table is the accessible form of a chart's numbers. A sparkline doesn't need a chart library.
- **Deviation from the plan:** `Sparkline` isn't a lazy Recharts wrapper (the plan listed it with the others): it renders on the server at its final size for nothing.
- **Trade-offs:** charts appear after hydration and a chunk load. Storybook's chart story preloads the chunk in a loader (under a full parallel run the first import outlasted the play function) and checks the mounted container, not Recharts' SVG (it needs a measured size, which a background test iframe may not have).

## 0172: Slugs are linked to their source, checked as you type, and a submit waits for async validation

- **What:** `SlugField` follows its source field (`from`, a dotted path) while linked: new records start linked, typing in the slug unlinks it, the link button re-links it. `slugValidators({ from, isAvailable })` puts a debounced async check on the AppField (`onChangeAsync`, re-run when the source changes through `onChangeListenTo`); Test CRUD's form uses it with a new `isTestCrudSlugFree` server function (`test-crud:read`, in the guard test; `isSlugFree` in the repository, tested on PGlite). The save still maps the unique violation to a field error. The shared `Form` now waits for validation to settle before calling `handleSubmit`.
- **Why the wait:** TanStack Form's `handleSubmit` returns without submitting on a first attempt while `canSubmit` is false, and `canSubmit` is false while any field validates (`isFieldsValidating` is true already during the debounce). A user who typed a title and pressed Create within the slug check's 400 ms got nothing: Storybook's Test CRUD story caught it under load, a jsdom test now covers it.
- **Alternatives considered:** checking on blur (the slug is usually never focused, as it follows the title); disabling Save while validating (the submit button stays enabled on purpose, so pressing it reveals every error; `SubmitButton`); `canSubmitWhenInvalid` (would submit invalid forms too).

## 0173: The CRUD standard: one shape, shared helpers on both sides, every section on it

- **What:** one way to build a feature, written once in `docs/guides/crud.md` and used by Test CRUD, users, roles, the permission matrix and the audit log (Task 38).
  - **Shape:** `features/<name>/` holds `search.ts` (URL contract), `schema.ts` (strict inputs, DTO schemas), `keys.ts`, `queries.ts` (queryOptions and mutationOptions), `columns.tsx`, `filters.tsx`, `labels.ts`, `commands.ts` and `components/` (list, form, detail, pending). Functions are `createServerFn → requirePermission, withServices → validator → one service call`; `server/<name>/` has the repository and the service. Routes are literal `createFileRoute` objects whose components come from the feature and read the URL with `getRouteApi`.
  - **Client helpers** (`src/lib/crud/`, `src/components/crud/`): `createCrudKeys`, `listSchema` (search, strict input, defaults, filter keys), `idSchema`, `isoDateTime()` (a `z.codec`: a row's Date to the wire's ISO string), `listSearch`, `listLoader`, `loadDetailOr404`, `titleHead`, `defineFilters` with chip specs (`textChip`, `choiceChip`, `eachChip`, `rangeChip`, `flagChip`), `CrudListPage`/`CrudListPending`, `useCrudMutation`, `useCrudForm` + `CrudForm` + `crudFormKey`, `NewButton`, `RecordLink`; also `QueryDialog` (a dialog that loads its record) and `availabilityValidators` (a debounced "is it free?" check).
  - **Server helpers** (`src/server/db/crud.ts`): `listPage`, `findOrThrow`/`notFound`, `updateVersioned` (the version in the UPDATE's WHERE, no separate lock), `uniqueViolation` (insert, then map the constraint to a field error), `isValueFree`, `uniqueSlug`, `withAudit` (the transaction and the audit rows the change reports). `withServices` (`src/middleware/services.ts`, server modules imported inside `.server()`) adds `context.db`, `context.actor` and `context.imageStore`; services take them as their first argument (`Services`, `src/server/services.ts`), so tests pass their own.
  - **RBAC:** one isomorphic `Actor` (`features/rbac/types.ts`) replaces the four copies; `canGrant` is the self-escalation rule on both sides; `useCan`/`<Can>` are the only UI checks; the matrix groups resources under the sidebar's groups; functions are named `listX`/`getX`/`createX`/`updateX`/`deleteX`/`setXStatus` with explicit return types.
  - **Behaviour that changed:** creates and edits of Test CRUD items are audited (supersedes 0132's scope: every change of admin data and content is), recording only the fields that changed (`changes()`); role names are unique by a case-insensitive index (`role_name_lower_unique`, migration `0010`) and emails by Better Auth's constraint, both mapped to field errors instead of checked first; a user's roles are saved against their version (`updatedAt`), so the roles dialog has a stale check and "Reload"; the invite form checks the address as you type; the delete confirm and the save, delete and failure toasts use shared messages (`crud_*`, `common_toast_failed`); the router has `defaultStructuralSharing`; the sidebar's sections are `linkOptions`.
  - **Removed duplicates:** the four `Actor` types, four `notFound`s, the role-key and portfolio slug copies (now `slugify(name, 40)` + `uniqueSlug`, `SLUG_PATTERN`), the two `day()` chip formatters (`dayValue`), `testCrudIdSchema`/`testCrudIdParamSchema` (`idSchema`), the hard-coded skeleton widths (from the columns), `refreshRbac` and the invalidation helpers (keys), the double row lock of a publish, the services the functions skipped.
- **Numbers (wc -l):**
  - Test CRUD's admin code (features, functions, server, admin routes; the public reads included both times): 1,895 → 1,462 lines (−23%). The shared code it now uses is 1,191 lines (`src/lib/crud`, `src/components/crud`, `server/db/crud.ts`, the services middleware and module, `QueryDialog`, `availabilityValidators`, `localizedValue`), written once for every section.
  - The roles, users and audit routes: 495 → 91 lines (their UI moved to `features/*/components`).
  - Every page's JavaScript: 238.0 → 232.5 kB gzip (the admin pages no longer pull Test CRUD's TanStack DB collection).
- **Deviation:** the plan asked for about 40% less Test CRUD code. It came out at 23%: the reference keeps its public pages, image gallery, masked dialog and analytics events, its filters and columns are its own, and creates and edits gained audit rows. The repetitive half (list page wiring, filter chips, mutations, form plumbing, routes, server boilerplate) is what shrank; the rest is the feature.
- **Choices:**
  - **Client helpers are split by what they need:** pure ones in `src/lib/crud/`, React ones in `src/components/crud/` (the plan put both in `lib`), and the route helpers in `src/lib/crud/route.ts`, kept out of components by Biome (it needs the Start runtime for the 404 status).
  - **`listLoader(route, options)`, not `loader: listLoader(options)`:** a non-inline loader is typed before the route's loader deps are, and its deps came out as `{}`.
  - **DTO schemas over types:** `dto.parse(row)` checks what leaves the server and picks the fields; a few parses per page cost nothing measurable.
  - **Reload by key:** "Reload" refetches the record's query, and its new `updatedAt` re-keys the form (`crudFormKey`); dialogs read their record from the list's cache by id. One way instead of Test CRUD's remount and roles' `form.reset()`.
- **Alternatives considered:** a generic `<ResourcePage resource={…}>` that renders everything from a config (hides too much: every feature differs in actions, dialogs and fields); keeping the four write styles and documenting them (the next six features would copy whichever they found first).

## 0174: Admin CRUD writes use Query mutations; TanStack DB is for client-first apps

*Supersedes 0068 and 0064's "edit with instant feedback" row.*

- **What:** admin writes go through `useCrudMutation` (Query's `useMutation` over the feature's `mutationOptions`): optimistic updates patch every cached page of the list (`queryClient.getQueriesData({ queryKey: keys.lists() })`) and roll back from the snapshot; after the write, the feature's keys are invalidated. Test CRUD's per-page TanStack DB collections and their LRU (`features/test-crud/collection.ts`) are gone. TanStack DB stays for `/dev/examples/optimistic` and the apps (Kanban, Habits, Notes; Task 41), where live queries over client state and optimistic transactions are the point.
- **Why:** an admin list is a server-paginated, server-sorted window: the collection held one page, needed a descriptor per search (and a cap on how many), and every feature would have repeated it. Query's cache already holds every page, so one helper patches them all and rolls back. The permission matrix's hand-written `onMutate` became the same helper.
- **Trade-offs:** no live queries in the admin (nothing there needs them); the DB runtime's 100.6 kB still loads with every page until Task 41 moves its provider (0066).
- **Alternatives considered:** keeping collections for admin lists (one per page and search, rebuilt as the URL changes); optimistic updates by hand per feature (what roles and the matrix did).

## 0175: `pnpm new:feature` v2: the standard's shape, `--public` and `--localized`, and a clean tree

*Supersedes 0141.*

- **What:** `scripts/new-feature.ts` (TypeScript, run by Node) writes a feature in 0173's shape from `scripts/templates/feature/` (28 templates): the table and migration, search/schema/keys/queries/columns/filters/commands, list, form, detail and pending components, functions on `withServices`, an audited repository and service, thin routes, messages, stories and mocks, a PGlite test. Shared lists get entries at their `// @new-feature:<slot>` lines (new slots: `commands`, `sitemap`, `indexable`, `content-titled`, `unguarded-functions`); imports go at the top of the file and Biome sorts them.
  - `--public`: a slug (with the as-you-type check) and a "published" switch; public list and detail pages under `_public` with `listSeo()`/`seo()`, unguarded read functions on `withPublicServices` (declared in the guard test), sitemap entries from the database (`SITEMAP_SOURCES`), route-SEO test entries.
  - `--localized`: the title and notes are `{ en, ne }` jsonb columns, `LocalizedField` in the form, searched in both languages and shown with `localizedValue()`.
  - Templates use `{{#flag}}…{{/flag}}` and `{{^flag}}…{{/flag}}` sections; `*.public.tpl` files exist only with `--public`.
- **Safety:** it refuses to run with uncommitted changes to tracked files; any failure runs `git checkout -- .` and `git clean` on the files it created (and drizzle's new migration), so a half-generated feature never stays.
- **Checked:** in a scratch worktree, `pnpm new:feature ci-pages --public --localized` then typecheck, check, knip, test (664 tests), test:storybook (364), i18n:check, the migration check and the full e2e review (735 passed, the generated admin and public pages included). CI's template job generates a plain feature and a `--public --localized` one after `strip-demo`, committing in between.
- **Why:** the generator now emits the standard, so the six apps and every new project start from it; the flags cover the two variants the portfolio needs (public pages, bilingual content). The clean-tree rule is what makes the rollback safe.
- **Alternatives considered:** separate templates per flag combination (four copies to keep in step); a template engine dependency (sections are a 15-line function).

## 0176: The portfolio's content lives in the database, edited in the admin, read through public server functions

*Supersedes 0106.*

- **What:** Task 39 moves the portfolio from typed fixtures to tables (`src/server/db/schema/portfolio.ts`, migration `0011_portfolio`): `portfolio_profile` (one row, id `profile`), `portfolio_project`, `portfolio_post`, `portfolio_experience`, `portfolio_skill`, `portfolio_process_step`, `portfolio_testimonial` and `portfolio_contact_message`.
  - **Columns:** localized fields are `{ en, ne }` jsonb (`localizedText()` in `schema/columns.ts`: one column per field, so a third language needs no migration); structured content (case-study blocks, metrics, links, principles) is jsonb written only after the same Zod schema the admin form uses (`features/portfolio/schema.ts`). Blocks carry an `id` and a `type` (what `BlocksField` needs); architecture edges are `{ from, to }`. Journal bodies are rich-text HTML per language, sanitized on the way in and out.
  - **Admin** (`/admin/portfolio/*`, sidebar group "Portfolio"): the profile (one form in a `SettingsLayout`), projects and journal on the CRUD standard (0173: list, form, publish, preview), projects reordered in a dialog, the four ordered sections on one `OrderedSection` page with a sheet each, the contact inbox. Permissions `portfolio:read|write|publish`, `messages:read|manage`, `media:read|write`; a save may change a status only with `portfolio:publish` (the services check it; a new record must then be a draft). Reordering keeps `updatedAt`, so it never makes an open edit stale. Every change is audited.
  - **Public reads:** `src/functions/portfolio-public.ts` (unguarded, declared in the guard test) calls `src/server/portfolio/public.ts`: published rows only, one call per page (`getHome` returns the whole story), the locale as an input. `?preview=1` asks for drafts; the handler grants it only when the session holds `portfolio:read` (the pages never look the session up otherwise, 0161), and such pages are noindex. The sitemap reads the published slugs.
  - **Seeding:** the fixtures moved to `scripts/lib/portfolio-data/`; `scripts/lib/portfolio-seed.ts` (plain SQL, idempotent and never destructive: it writes nothing once a profile exists) runs from `pnpm db:seed-portfolio`, `db:seed-demo`, the e2e harness and `dev:local`/`setup:local` (on every start, so a database that predates the tables gets content), so `/` is never empty.
  - **Contact form:** honeypot, Turnstile when configured, a database rate limit keyed by a keyed hash of the IP (3 per 10 minutes); the message is saved for the inbox, then emailed to the profile's address (`contact-message` template, in the site's base locale); a failed email is logged, not shown.
- **Why:** the owner edits the portfolio without a deploy, in both languages, with the same kit, permissions, audit and tests as every other section; publishing shows on `/` at once (no server cache: on Vercel a cache cleared on write would reach one instance only).
- **Notes:** the locale is an explicit input although server functions already receive the page's locale in a header (0022): it is part of the Query key anyway, and a read can't silently use another language. Only projects are reordered by hand; posts are chronological. The projects list has no year filter (there is no single-number filter control, and the list is short).
- **Alternatives considered:** keeping the `PortfolioSource` port with a database adapter (an extra layer once there is one source); one column per language (a migration per language, twice the columns); a CMS (another service to run, and the content would leave the template's audit and permissions).

## 0177: A media library: items reference library attachments by id; alt text in both languages

- **What:** `/admin/media` holds the portfolio's images and PDFs. Uploads use the existing direct-to-Cloudinary flow (0098) with the `media` scope, whose rules (`UPLOAD_RULES` in `features/attachments/constants.ts`) add PDFs, need `media:write` on top of `attachments:upload`, and record the verified upload straight into the library (entity type `media`: never pending, never cleaned up after a day). Portfolio records reference library items by id (`cover_id`, `portrait_id`… as foreign keys with `on delete restrict`; the project gallery as a `uuid[]`); a save locks them `FOR SHARE` and refuses an unknown or removed id on its form field. An item can be deleted only while nothing uses it: the delete locks it `FOR UPDATE`, checks every reference, and otherwise refuses with the first user's name.
  - **Alt text** moved to `{ en, ne }` jsonb (the migration keeps the old text as English). `CloudImage` shows the reader's language and marks an English fallback `lang="en"`; `ImageGalleryField` edits both. In the library the alt text belongs to the item and shows wherever it is used.
  - **Picking:** `MediaField` (features/media) is the form field for library items: "Choose from the library" opens a lazily loaded picker that searches, selects and uploads. `ImageGalleryField` stays for item-owned images (Test CRUD).
  - `ImageAsset` gained `format` and `url` (the original file: a PDF to open).
- **Why:** one image can serve several records (a portrait as the social image too) and be described once; a project's images outlive its edits; "used by" is what the owner needs to see before deleting.
- **Deviation from the plan:** the plan said `ImageGalleryField` picks from the library. Owned and shared images behave differently (who edits the alt text, whether removing deletes the file), so the library got its own field instead of a mode switch in the owned one.
- **Alternatives considered:** a usage join table for every attachment (a rewrite of Test CRUD's owned images for no gain there); copying a library image into each record (the alt text would drift); letting a delete orphan references (pages with broken images).

## 0178: Missing Nepali falls back to English, marked `lang="en"` on the record or block

- **What:** `resolveLocalized(value, locale)` (now in `src/lib/i18n/localized.ts`) shows English where a Nepali text is empty, and adds `lang: "en"` to an object none of whose own localized texts is in the page's language (a record or a block not translated yet). Components put it on the element that renders that object (`<article lang={project.lang}>`, a chapter, a testimonial). A partly translated object stays unmarked. `localized(schema)` is the Zod shape (Nepali may be empty); `isFallback` tells it for one value.
- **Why:** screen readers choose their voice and pronunciation by `lang`, and hyphenation follows it. A whole untranslated record is the common case (a new project typed in English first), and marking it needs no change to every string-rendering component.
- **Alternatives considered:** marking each string (a branded string type, or objects instead of strings, would touch every component); marking an object as soon as any text fell back (its translated texts would then be read with the English voice).

## 0179: The portfolio is "Himal": the Himalaya from Kathmandu, printed in altitude layers, in fields of colour

*Supersedes 0110 (Dhaka) and the look of 0108; 0108's scoping rule stands, renamed.*

- **What:**
  - **Idea:** the Himalaya seen from Kathmandu is the site's one picture. The hero is a range of generated mountains printed as stacked sheets, one per altitude, like a multi-block woodblock print (0180). Its sky follows the hour in Kathmandu (0182). The owner's name runs margin to margin under it.
  - **Tokens:** `src/styles/himal.css`, scoped under `.himal` with `hm-` utilities (the `_site` layout sets the class).
    - Semantic tokens: `--hm-ground`, `--hm-ground-2`, `--hm-ink`, `--hm-muted`, `--hm-accent`, `--hm-action`, `--hm-on-action`, `--hm-focus`.
    - Fields (`hm-field-snow-2`, `ridge`, `pine`, `night`, `rhodo`) reassign them for a section. Neighbouring sections never share a field.
    - The altitude ramp (`--hm-alt-0` … `8`) runs pine → rock blue → snow, like a relief map's tints and Nepal's own belts.
    - Rhododendron red marks what can be acted on (the primary button, a link's hover underline, focus, form errors) and the contact field, which the owner chose. Active states, selection, quote marks and the reading line use ink: the finish review found red spread onto them, and a serif with red everywhere is the look this direction refuses.
    - Dark mode is night on the ridge.
  - **Contrast:** `tests/unit/himal-tokens.test.ts` checks ink, muted and accent on every field's ground and surface step, the buttons, and the text set on the art (strata, sky labels), in both themes.
  - **Composition:** taste-skill's direction "The name as a monument" (seed 426837719) and its section layouts, adapted:
    - big project names beside a sticky preview;
    - name columns for skills;
    - switchback lines for the process;
    - quiet figure lines;
    - a lead quote with corner quotes;
    - a journal line-up;
    - the email as display type;
    - the name at full width in the footer.
  - **House rules:** taste-skill's (no eyebrows, rules, cards, shadows, gradients or index numbers), applied site-wide.
  - **Social image:** a page without its own image (a project's Cloudinary cover, the profile's social image) shares `public/himal/og.png` (`himalOgImage`, `lib/og-image.ts`): the range at dawn with the name, rendered once at 1200 × 630 from the art. The app's `public/og-default.png` stays the template's, outside the portfolio layer.
  - **Process:** impeccable's (`PRODUCT.md`, the surface brief's direction contract with roll `seed:b3d9cd8a084181f1`, the finish review, `DESIGN.md`).
- **Why:**
  - **The first written plan failed its own history:** a Fraunces serif on cream "snow paper" with a red accent, and prayer-flag markers. 0110 had already rejected the serif as house style and the flags as religious symbols, and that combination is the most common look of generated pages.
  - **Where Himal comes from:** the owner chose Himalayan topography; this keeps it but draws it in filled layers, not contour hairlines (0110's "common on developer portfolios").
  - **Fields of colour instead of cards** give each section its own place without dividers.
- **Alternatives considered:**
  - A lokta-paper woodblock world: impeccable's roll assigned it. The owner chose Himal, and the roll's layered print and print-on-load ritual were kept.
  - Kathmandu's bilingual painted signboards.
  - A plain conventional portfolio.

## 0180: The generated mountains: seeded peaks, marching squares, stacked sheets, the same markup everywhere

- **What:**
  - **Pipeline** (`features/portfolio/lib/terrain/`):
    1. A height field of seeded peaks: rounded pyramids with concave slopes, domain-warped and roughened by ridged simplex noise, with saddles and a foothill band. Each cover motif is a landform.
    2. Marching squares at 7–9 levels on a grid framed by "sea", so every contour closes into a ring.
    3. Each level's region is drawn as one even-odd path, smoothed through its midpoints and rounded to whole units.
    4. Each level is lifted a step above the one below and filled flat in its altitude colour. Above a snow line (the top 38% of the levels) the colours are the ramp's two snows, so every summit that clears it carries snow.
    5. The hero's plan is drawn wider than its frame (`bleed`), so the low land closes out of view and runs off both edges. Sides longer than 64 units are split before smoothing, or a straight edge's corner rounded across half the drawing.
  - **Rendering:**
    - `Relief` renders inline SVG, `aria-hidden`, coloured by tokens.
    - The hero splits its sheets into three stacked SVGs so motion can move bands of altitude on the compositor.
    - `PanoramaBoard` draws `/work`'s board with the same engine (`reliefOf` over a field of its own): a crest with one summit per project and a leader line from each name to the highest sheet drawn there.
    - `cachedRelief` keeps the last 64 reliefs.
- **Why:**
  - **No hydration mismatch:** noise and heights use only +, −, ×, ÷, floor and sqrt, exact in every engine, and the output is rounded, so the server and every browser print the same `d`.
  - **Bounded markup:** tests hold the hero under 35 kB and a cover under 8 kB, and check that every ring closes.
  - **No layout shift:** frames have fixed sizes or aspect ratios.
- **Alternatives considered:**
  - Hairline contour lines: the cliché 0110 named.
  - Side-view silhouettes only: they lose the map that rises.
  - Canvas or WebGL: no server render, more JavaScript.

## 0181: Portfolio motion stays CSS, plus a 1 kB pointer drift (no Motion library)

*Extends 0109.*

- **What:**
  - The map rises on load: each of the hero's three bands of altitude starts lowered to the flat map and lifts into relief (`hm-lift`, transform only, the low land first). The first version clipped and moved each sheet inside the SVG, which repaints the drawing every frame: 720 ms of blocking time on the home page under Lighthouse's applied mobile throttling, against 180 ms on `/login`.
  - Scrolling past the hero spreads the three bands of altitude apart (`animation-timeline: scroll(root)`).
  - `art/drift.ts`, loaded after hydration on fine pointers only, sets `--hm-px`/`--hm-py` so the bands move by depth with the cursor. It pauses while the hero is offscreen.
  - Section parts rise into view with `clip-path` and transform (`hm-reveal`, staggered by `--hm-i`). Archival pictures settle from a slight zoom.
  - The work index's preview swaps on hover and focus. Mountains morph from the index to the case study (`viewTransition`, `view-transition-class: hm-frame`). Articles draw a reading line.
  - Everything sits under `prefers-reduced-motion: no-preference` and `@supports`. Only transform, translate, clip-path and colour move.
- **Why:** the plan allowed the Motion library, but CSS covers every effect here, and Lighthouse mobile ≥ 95 leaves no room for tens of kB of animation code. Opacity fades stay out (0109: axe measured half-faded text).

## 0182: "Kathmandu at this hour": the sky from the sun's real position, hydrated from the server's read time

- **What:**
  - **Sky:** `lib/daylight.ts` (place constant `HOME`: Asia/Kathmandu, 27.7172° N 85.324° E) computes the sun's elevation and azimuth with NOAA's algorithm, and sunrise and sunset (within 2 minutes of the published times, tested).
    - Its phases: night, dawn, day, dusk. Dawn and dusk give the summits alpenglow.
    - The sun shows near the edge it rises or sets on, the view facing north. At noon it is behind the viewer.
  - **Server render:** the public profile read carries `generatedAt`. The server draws that moment, and hydration uses it.
  - **Browser:** `useMinuteClock` (`src/hooks/use-minute-clock.ts`, extracted from `RelativeTime`) takes over.
  - **Time line:** `HomeTime` writes the Kathmandu time. Only in the browser does it add the gap to the visitor's clock ("4 h 45 min ahead of you"), in a line reserved for it.
- **Why:** the one live thing taste-skill asks for, made from the subject: a remote client learns when the owner is awake. It works without JavaScript, can't mismatch on hydration, and never moves the layout.

## 0183: Archival pictures: public domain, credited, printed in the page's two inks

- **What:** five public-domain pictures from Wikimedia Commons, found with taste-skill's assets tool:
  - Vittorio Sella's Kangchen Glacier panorama (1899);
  - Sella's "Below the Jonsong La" (1899);
  - Kangchenjunga at first light (Round Kangchenjunga, 1903);
  - Kathmandu and the Tundikhel (about 1920);
  - Perceval Landon's Map of the Valley (1928).
  - **Preparation:** the books' printed captions were cropped off, the pictures greyed and saved as WebP at two widths in `public/himal/` (33–245 kB; the large map is the heaviest).
  - **Registry:** `lib/archive.ts` holds them, with alt text and captions in both languages, and the credits print in the footer.
  - **Display:** `ArchivalFigure` frames them at a fixed shape, lazy, in a CSS duotone. The field sets the inks: the map is printed in rhododendron on the contact field.
  - **Provenance:** each file's origin (creator, date, licence, Commons page) is also written beside it (`<file>.webp.json`, impeccable's `embed-prompt`), and `og.png` carries how it was made; `embed-prompt --scan public/himal` lists any picture without one.
  - **Left out:** a 1921 Everest plate (its photographer may still be in copyright in the UK) and a plate of people.
- **Why:** pages with real pictures read as finished (taste-skill's study), and these show the world the site is about. Captions say what each one is, and none is presented as the owner's work.

## 0184: Eczar for display in both scripts, preloaded, with measured fallbacks per weight

*Replaces 0110's type.*

- **What:**
  - **Faces:** Eczar Variable (wght 400–800) sets display type in Latin and Devanagari; the app's Inter and Noto Sans Devanagari set the text.
  - **Preloads:** the `_site` layout preloads Eczar Latin (25.8 kB) and Inter, and on Nepali pages both Devanagari files (Eczar 85.8 kB). All are under the 150 kB budget, so `scripts/check-bundle.ts` has no font exemption left. The Anek packages are removed.
  - **Fallbacks:** "Eczar Fallback" (Times New Roman, or Liberation Serif on Linux with the same metrics) and "Eczar Devanagari Fallback" (Nirmala UI), one face per weight range, with `size-adjust` and ascent/descent measured in Chrome.
  - **Fitting the name:** the hero name and the contact email are sized to their container from their length (`lib/fit.ts`), with no measuring script. Latin sums Eczar 700's advance widths, measured in Chrome (kerning only narrows, so a name fills 97–99% and never overflows). Devanagari, whose conjuncts make per-letter widths meaningless, counts letters, half forms and spacing signs by Unicode category, times a measured factor.
  - **Nepali display:** no negative tracking (it breaks conjuncts) and leading ≥ 1.2.
  - **Metric overrides:** the Eczar faces are declared in `himal.css` (Fontsource's files, its unicode ranges) with `ascent-override` and `descent-override` of 0.88/0.24 em (Latin) and 1.0/0.36 em (Devanagari). Eczar ships 1.14/0.63 em, and at display sizes the text's hit box reached half an em past the line, so a big mailto link caught clicks on the sentence above it; the taste inspector reported it as covered text.
- **Why:** one family for both scripts, as 0110 argued, in a face built for display in both. Impeccable flags Fraunces as a default every generated page uses.

## 0185: Guest sessions: Better Auth's anonymous plugin, no permissions, refused everywhere an account is needed

*Extends 0112 (one more endpoint off over HTTP) and 0045 (a stricter rate limit).*

- **What:**
  - Visitors try the showcase apps without an account: "Try it" calls `signIn.anonymous()` (the `anonymous` plugin, after `twoFactor` in the plugin list). A guest is a user row with `is_anonymous` true, the name "Guest" and a placeholder address (`…@anonymous.placeholder.invalid`); `pnpm auth:schema` added only that column (migration `0012_guests_kanban`).
  - `Session.isAnonymous` is set by `getServerSession`. `permissionsForUser` returns nothing for a guest, so the baseline `user` role never reaches one and `canEnterAdmin` is false.
  - **Refused, server side:** `requireUserMiddleware` answers UNAUTHORIZED to a guest, so every account function (sessions, password, two-factor, the dashboard, every `requirePermission`) refuses them; the apps use `requireAppUser` (`src/middleware/apps.ts`), which lets them in. `/api/account/export` answers 401. A Better Auth `hooks.before` (`refuseGuestPaths`) refuses a guest on the account-changing endpoints (`GUEST_REFUSED_PATHS`: the owner-only list of 0134 plus `/send-verification-email`, with two-factor's sign-in steps left open), and refuses `/sign-in/anonymous` to someone already signed in (it would replace their session). `/delete-anonymous-user` is in `disabledPaths`.
  - **Pages:** `_authed` sends a guest to `/upgrade` (sign up or sign in to keep the data); `_auth` treats a guest as signed out, so `/register` and `/login` open for them.
  - **Elsewhere:** `sendEmail` refuses any `.invalid` address; `ObservabilitySync` never identifies a guest to PostHog or Sentry; `/admin/users`, the role counts and the dashboard leave guests out (`isAccount`).
  - **Rate limit:** `/sign-in/anonymous` allows 5 per hour per client IP (each one is a user row). Turnstile isn't wired on it: the button would need a widget on every landing, and the limit plus the weekly cleanup bound the cost.
- **Why core, not the apps layer:** the plugin's column lives in the Better Auth–generated schema, and the guards sit in the auth middleware and the session type. With the apps stripped nothing starts a guest session; the endpoint stays, rate limited and cleaned up, and removing the plugin is one line (docs/guides/apps.md).
- **Alternatives considered:** a demo account shared by every visitor (everyone sees everyone's boards); data in localStorage (no server rendering, nothing to keep on sign-up); a guest role with an empty permission set (one role assignment away from holding something).

## 0186: Guest data: sample rows on start, moved to the account on sign-up or sign-in, deleted after 7 days

*Extends 0129 (deletion) and 0132 (what is audited).*

- **What:**
  - **Start:** an after hook on `/sign-in/anonymous` (`startGuest`) seeds every app's sample rows in the guest's language (`GUEST_DATA`, `src/server/guests/data.ts`, filled from the server apps registry) and sets the `guest_claim` cookie: the guest's id with an HMAC-SHA256 of it under `BETTER_AUTH_SECRET`, httpOnly, SameSite Lax, 7 days.
  - **Claim:** `claimGuest(db, guestId, userId)` moves every owner's rows and the guest's uploads to the account and deletes the guest, in one transaction; it does nothing unless `guestId` is still a guest and `userId` an account, so it is idempotent. It runs from the plugin's `onLinkAccount` (a sign-up verified in the same browser, any sign-in that sets a session in one step, Google) with `disableDeleteAnonymousUser` (the claim deletes the guest itself, after moving the rows), and from `claimGuestData` (`src/functions/guests.ts`), which reads the cookie. That fallback runs after every sign-in (`useAuthNavigation.afterSignIn`, two-factor included) and on the verify-email landing, because a password sign-in that stops for two-factor deletes the guest's session cookie before the plugin's hook looks, and `/two-factor/verify-totp` isn't one of the paths the hook matches.
  - Quotas don't apply to a claim: nothing a guest made is lost, though the account may have to delete some before adding more.
  - **No publishing by guests:** an app's service checks `user.isGuest` before anything public (short links, published forms, shared notes: Tasks 42 and 44), so the owner's domain can't serve a stranger's phishing page.
  - **Never audited:** app rows are users' own data, not admin actions; 0132's log stays the admin's.
  - **Cleanup:** `GET /api/cron/guests` (a Nitro route, daily in `vercel.json`, bearer `CRON_SECRET`) deletes guests created more than 7 days ago in batches of 200. Their app rows go by cascade (every app table's `owner_id`); their uploads are marked removed in the same transaction, then deleted from Cloudinary through the attachments service, and what Cloudinary refuses stays queued for the attachments cleanup. The plugin's own delete would skip both, which is why it is off (0185).
- **Why:** trying an app should cost nothing, and keeping what you made should cost one form. The cookie fallback is what makes the two-factor and verify-later paths keep the data.
- **Verified:** e2e `apps.spec.ts`: a guest moves a card with the keyboard, signs up, verifies and finds the board; another signs in to an account with two-factor and finds it; a guest can't enter the admin area or change an account. PGlite tests cover the claim, its idempotency and rollback, and the cleanup.
- **Alternatives considered:** claiming in `databaseHooks.session.create` (it fires for the guest's own session too, and has no cookie to read); a claim token in the verification URL (Better Auth builds that URL; the cookie needs no change to it).

## 0187: The showcase apps: a registry in two halves, an `_apps` frame, every row owned

- **What:**
  - **Registry:** `src/features/apps/registry.ts` (slug, name, tagline, description, icon, usage labels; it drives `/apps`, the app switcher, the sitemap and `/admin/apps`) and `src/server/apps/registry.ts` (each app's `seedGuestData`, `claim` and `usage`). The plan's single registry would have put server code in the browser's.
  - **Frame:** the pathless `_apps` layout (`AppsLayout`): the app header (brand, app switcher, a link to the app's case study, language, theme, the user menu or "Log in"), the guest banner, `ConfirmProvider` and `DbScope` (0189). Pages are private unless they say otherwise; `/apps` and each app's landing (`/apps/<slug>`) are indexable and in the sitemap. A landing explains the app with "Try it" for a visitor and becomes the app for anyone with a session.
  - **Case study link:** a published portfolio project whose "App" field names the app (Task 39's `appSlug`); the case study page links to the live app the same way. The plan's `projectSlug` in the registry would have been a second source of truth.
  - **Ownership:** every app table has `owner_id text not null references user(id) on delete cascade`; repositories take the owner and add `ownedBy(table, userId)` to every query, so another user's row is "not found", never "forbidden". App functions run `requireAppUser` then `withAppServices` (`context.db` and `context.user: { id, isGuest }`); no permission is involved, and the guard test checks that order for every file in `src/functions/apps/`.
  - **Admin:** `/admin/apps` (group "Apps", permission `apps:read`): guests alive now, the accounts and guests with data in each app (a stacked bar chart), rows per app. Counts only.
  - **strip-demo:** the `apps` layer is its routes, features, functions, server code, middleware, the Kanban schema, `src/lib/fractional-index.ts` and their tests, plus marked lines elsewhere (sections, permissions, labels, sitemap, schema index, guard test, e2e pages and harness, the case study's link). Guest sessions stay with the core (0185).
- **Why:** the apps hold real people's data on a portfolio's domain; scoping by owner in one helper is what lets "user A can't read or move user B's cards" be tested once per repository.

## 0188: Kanban: fractional positions, moves by pointer or keyboard, optimistic in TanStack DB

- **What:**
  - **Tables:** `kanban_board`, `kanban_column` (board, name, position), `kanban_card` (board, column, title, description, labels `text[]`, `due_on` date, checklist jsonb, position), each with `owner_id` and timestamps.
  - **Order:** positions are fractional order keys (`src/lib/fractional-index.ts`, rocicorp's algorithm, CC0, unit-tested with 2,000 random inserts), so a move writes one row. Keys compare by code unit: `collate "C"` in SQL, plain `<` in JavaScript (`boardLayout` sorts; a DB `orderBy` would need `stringSort: "lexical"`). The browser computes the key (`moves.ts`, the same code for pointer and keys) and the server checks its form (`isOrderKey`).
  - **Board:** dnd-kit (0170's pinned packages): cards are sortables grouped by column, columns are sortables that also accept cards (so an empty column takes one), committed on drop. From a handle: Space, arrows, Space (dnd-kit's keyboard sensor), or Alt + arrows at once (a card up or down its column or into the next column, a column left or right). Every move is announced in the page's language. On narrow screens the board scrolls sideways in a focusable, labelled region.
  - **Writes:** columns and cards are TanStack DB query collections over the board query (`select`), so they start from the server-rendered rows; a change shows at once, the handler saves it, then refetches the board explicitly and returns `{ refetch: false }` (the automatic refetch is deprecated and logs a warning). A refused save rolls the row back, with a toast. Ids are made in the browser, so the optimistic row and the saved one share a key. The board list and board names use Query mutations.
  - **Quotas:** 20 boards and 500 cards per user, 12 columns per board, checked by the service (CONFLICT, with a localized message).
  - **Guest seed:** "Getting started": To do, Doing, Done, and five cards that explain the board (labels, a checklist, the keyboard).
- **Why:** one-row moves keep a drag cheap and never renumber a column; computing the key where the move happens lets the optimistic row and the saved row agree.
- **Alternatives considered:** integer positions with renumbering (a move writes a column's worth of rows); `@dnd-kit/helpers`' `move()` in `onDragOver` (state changes mid-drag; optimistic sorting already shows the drag); the server computing keys from neighbours (the optimistic position would differ from the saved one).

## 0189: TanStack DB loads only with the pages that use it

*Supersedes 0066.*

- **What:** `routerWithDbClient` and `@tanstack/react-router-with-db` are gone. `dbClientFor(queryClient)` (`src/lib/tanstack-db.ts`) makes one DbClient per QueryClient (so per request on the server), and `<DbScope>` (`src/components/layout/db-scope.tsx`) provides it to the pages below it: the `_apps` layout and `/dev/examples/optimistic`. On the server it turns on DB's cleanup and runs it once the router has finished rendering, as the official integration does.
- **How the first paint is server-rendered without DB's stream:** the loader fills the Query cache (`ensureQuery`), the collections read that query (`select`), and the page uses `useLiveSuspenseQuery`. On the server the live query resolves from the cache inside the render (measured: 37 ms, no fetch); in the browser the same rows come from the dehydrated Query cache, and the suspended boundary keeps the server's HTML until they do. Nothing DB-specific is streamed.
- **Numbers:** every page's JavaScript went from 338.5 kB gzip (237.9 entry + 100.6 DB) to 245.6 kB. The entry line itself grew because TanStack Query's core, which the old `tanstack-db` chunk group had absorbed, is back in it; that group is removed, the entry budget is 250 kB, and `scripts/check-bundle.ts` fails if DB's code is ever preloaded by every page (`NOT_IN_ENTRY`). The Kanban board page adds 157.8 kB on top of the root (DB, dnd-kit, the board).
- **Found on the way:** the optimistic example's loader imported `OPTIMISTIC_SEARCH` from its collection module, which put DB in every page's JavaScript as soon as the router stopped doing so; the constant moved to `queries.ts`.
- **Alternatives considered:** keeping the router integration (100.6 kB on every page for two pages that use it); dehydrating DB state into loader data with `HydrationBoundary` (more moving parts for the same first paint).

## 0190: Notes: full-text search with the `simple` configuration, app uploads, revocable share links

- **What:**
  - **Table:** `note` (title, sanitized rich-text `body`, its visible text `body_text`, `tags text[]`, `pinned`, `archived`, `share_token` unique and nullable, timestamps, `owner_id`). Images are attachments with `entity_type` "note" (at most 8; the first is the card's cover).
  - **Search:** a stored generated column `search tsvector` holds the title (weight A) and body text (B) with the `simple` configuration, behind a GIN index, queried with `websearch_to_tsquery('simple', q)` and ranked by `ts_rank` (quoted phrases, `-word`, `or`; any text is valid input). `simple` doesn't stem, so English and Nepali words match as written: Postgres has no Nepali stemmer, and an English one would mangle Devanagari. Checked in PGlite: Devanagari words with vowel signs stay whole tokens. `body_text` comes from `richTextToText` (one line per block, entities decoded) and is also the list's excerpt.
  - **List:** a TanStack DB collection over the list query (0189): new notes, pin, archive and delete are optimistic and roll back with a toast. Search runs on the server and returns ranked ids; the page shows those rows of the collection, so a search never refetches the notes. The search box is the shared `FilterBar` (search as you type, a GET form without JavaScript); the archive and a tag are links.
  - **Editor:** `useCrudForm` with the stale-version check (two tabs can't silently overwrite each other), `RichTextField`, tags, `ImageGalleryField`.
  - **Uploads for app users:** guests hold no `attachments:upload`, so `ImageGalleryField` and `uploadImage` take an `UploadTransport` (sign, confirm, discard, settings, and the permission to check, `null` for none). Notes passes its own functions, behind `requireAppUser`, on the new `notes` upload scope, with 30 signed uploads per user per hour. The admin's transport is the default, so nothing else changed. `withAppServices` adds `context.imageStore`.
  - **Sharing:** accounts only (a guest's note can't become public, 0186). The token is 144 random bits in base64url. Sharing while already shared returns the same token, revoking clears it, and sharing after a revoke makes a new one, so an old link never comes back. `/apps/notes/s/$token` (the unguarded `getSharedNote`, declared in the guard test) shows the title, body and images, never the owner or the tags. It is `noindex` in the head and in an `X-Robots-Tag` header, set by a route request middleware (`src/middleware/robots.ts`).
  - **Quotas:** 500 notes per user.
- **Why:** search in the database keeps one source of truth and works the same for both of the site's languages; a random token instead of the note's id keeps "stop sharing" meaningful.
- **Alternatives considered:** client-side search over the collection (no ranking, and every body in the browser); an `english` configuration (stems English, breaks Nepali); `pg_trgm` similarity (fuzzy, but no phrases or exclusions, and an extension to install); a permission for app uploads (guests would need a role, which 0185 rules out).

## 0191: Links: a redirect route with request middleware, clicks without IPs, moderation

- **What:**
  - **Tables:** `link` (slug unique across everyone, target, title, `active` (the owner's switch), `expires_at`, `blocked_at` (a moderator's), timestamps, `owner_id`) and `link_click` (link, `at`, `referrer_host`, `country`, `device`, `owner_id`). No IP and no user agent are stored: only the referrer's host without `www.`, Vercel's `x-vercel-ip-country` when it is two letters, and a device class (desktop, mobile, tablet, bot) derived from the User-Agent.
  - **Rules:** slugs are `[a-z0-9-]{3,32}` and not in a reserved list (words that read like this site's pages or an official notice); left empty, the slug is 7 random characters without look-alikes. Targets are http(s), without credentials, at most 2,048 characters, and never this site's host (`VITE_SITE_URL`). A slug can't change after creation, so a printed QR code keeps working. Creates are limited to 30 per user per hour, and links to 200 per user.
  - **Redirect:** `src/routes/l/$slug.ts`. Its request middleware (`src/middleware/short-links.ts`, server code imported inside `.server()`) looks the link up and puts the answer in the context; the GET/HEAD handler returns it or calls `next()`. A link redirects only when it is active, not blocked, not expired and owned by an account (a guest's links never redirect, 0186). The answer is a 302 with `cache-control: private, no-store` (pausing takes effect at once) and `x-robots-tag: noindex, nofollow`. A GET records the click with `waitUntil`, so the redirect never waits for the insert and a failed insert is only logged; HEAD (link checkers) isn't counted. Anything else falls through to the router, where the route's `beforeLoad` throws `notFound()`: the localized 404, in both languages.
  - **Statistics:** the last 30 days by calendar day in Nepal time (days without clicks included), and the top 8 referrers, countries and devices. Country names are English in both languages, marked `lang="en"` in Nepali: browsers don't ship Nepali region names, and the server and the browser must print the same text. The QR code is `uqr`'s SVG (black on white whatever the theme); "PNG image" draws it on a canvas at 1024 px in the browser.
  - **Moderation:** `/admin/links` (group "Apps", permission `links:moderate`, held only by admins by default) follows the CRUD standard: every link with its owner (guests shown as "Guest"), search and a state filter, block or unblock (with a confirm before blocking), delete (one or many). Each change is audited (`link.block`, `link.unblock`, `link.delete`, target `link`). A blocked link stays off even if its owner turns it on. Unlike `/admin/apps`, this page shows what people wrote in an app, because short links are public by nature.
- **Found on the way:**
  - Start falls through from a server handler (`next()`) only to a route with a component, so the route has an empty one that never renders. With a component the route is a page, which may not import server code (the import-boundary test), hence the middleware.
  - Grouping by `to_char(at at time zone $1)` fails in Postgres when the zone is a bound parameter: the SELECT and GROUP BY expressions get different parameters. The query groups by position.
  - The link's click total was always 0: inside a subquery Drizzle printed `link.id` unqualified, which resolved to the click's own id. It now names `"link"."id"`.
- **Why:** a server handler keeps the redirect off the React render path; storing no IP keeps the statistics useful without collecting personal data; moderation exists because a short link on this domain can hide where it leads.
- **Alternatives considered:** a redirect in a global request middleware (it would run on every request); redirecting from the 404 page's loader (it renders HTML first); counting the click before redirecting (the visitor waits for a database write); hashed IPs for unique visitors (still personal data, and the app doesn't need uniques).

## 0192: Expenses: minor units per currency, budgets per month, a CSV import that runs once

- **What:**
  - **Tables** (singular, like the rest of the schema): `expense_category` (name unique per owner in any case, a palette colour, an icon), `expense_transaction` (`amount_minor` bigint, `currency` NPR or USD, `occurred_on` date, note, the category or null, the import's key), `expense_budget` (category, the month's first day, currency, `amount_minor`; unique per category, month and currency), `expense_import` (the idempotency key, owner, a SHA-256 of the rows, the result). All with `owner_id`. Migration `0014_expenses_habits`.
  - **Money:** integers in minor units (paisa, cents) everywhere: the database, the wire and the sums; forms take major units and convert with `toMinor` (`Math.round(x * 100)`). Totals, charts and budgets are per currency and never converted (no exchange rates to keep); the dashboard has an NPR/USD switch in the URL. Formatting goes through `formatCurrency`, so Nepali shows Devanagari digits and "नेरू".
  - **Dashboard** (`/apps/expenses?month=YYYY-MM&currency=…`; no month is the current one in Kathmandu): spent, budgeted and count tiles (`StatCard` takes a `format`); spending by category (a donut in the categories' own colours: `DonutChart` takes `colors`); six months of spending (bars); budget progress (spent of budget, "left" or "over"); the month's expenses with edit and delete. Writes are Query mutations that invalidate the user's keys.
  - **CSV import** (`/apps/expenses/import`): `parseCsv` in `src/lib/csv.ts` (RFC 4180: quoted delimiters, doubled quotes and line breaks, CRLF/LF/CR, a BOM, an unclosed quote reported by line). The page maps columns (guessed from the header, the export's own names in both languages), a date order (Y-M-D, D/M/Y, M/D/Y) and a default currency, then previews every line through `previewImport` (`features/apps/expenses/import.ts`), which checks each row with `importRowSchema`, the schema the server checks again. Only valid rows are sent, at most 1,000. The server claims the key (`insert … on conflict do nothing`) in the same transaction as the rows: a repeat waits for the first and gets its result, and the same key with other rows or from another owner is a CONFLICT (the routing guide's recipe, kept in Postgres). A refused import rolls the key back with the rows, so a retry runs. Categories are matched without case and made when missing (spelled as first seen). Ten imports an hour per user.
  - **CSV export:** every expense, oldest first, with localized headers, through `toCsv`/`downloadCsv` (formula cells neutralized). The import reads it back.
  - **Claim:** category names are unique per owner, so a guest's "Food" joins an account's "Food": its expenses move over, its budgets too unless the account has one for that month and currency.
  - **Quotas:** 5,000 expenses and 30 categories per user. **Guest seed:** five categories, six months of spending (and one dollar expense), three budgets for this month.
- **Why:** floats lose paisa; converting currencies needs rates nobody maintains; a bank CSV is the realistic way in, and a double click on "Import" must not double a month.
- **Alternatives considered:** a `numeric` column (fine in SQL, but JavaScript would still need care at every step); a server-side upload and parse (the preview would need a round trip per mapping change, and the browser already has the file); idempotency in memory (`/dev/examples/idempotency`; lost on a restart and per instance).

## 0193: Habits: streaks on calendar days in Kathmandu, a server-drawn heatmap, optimistic check-ins

- **What:**
  - **Tables:** `habit` (name, palette colour, `days` a weekday bitmask with bit 0 Sunday, `target` check-ins a day from 1 to 20, `archived`) and `habit_checkin` (habit, `day` date, `count` > 0; primary key habit and day; no row is zero).
  - **Streaks and rates** (`src/features/apps/habits/streaks.ts`) work on "YYYY-MM-DD" strings only, with "today" passed in as Kathmandu has it (`todayInZone(APP_TIME_ZONE)`). Days a habit isn't meant for neither count nor break a streak; today doesn't break it until it is over; a day is done at its target. History starts at the habit's creation day or an earlier back-filled check-in. The completion rate covers the last 30 days since the start, today only once done, and is null before any scheduled day. Unit-tested across month, year and leap-day boundaries and at 00:05 on 1 January in Kathmandu (still 31 December in UTC).
  - **Server-computed stats:** the overview loads every check-in of the user (bounded by 20 habits) and computes streak, best and rate with the same module; the list's strip shows the last 7 days.
  - **Check-ins** are a TanStack DB collection over the overview query (0189): a tap adds one, back to none after the target, shown at once and rolled back with a toast if refused; the handler saves the day's count and refetches, which brings the new streak. Check-ins are accepted for today and the 366 days before, in Kathmandu time, never ahead.
  - **Heatmap:** plain SVG, 53 weeks by 7 days from a Sunday, rendered on the server (no chart library), four levels of the habit's colour by share of the target, days the habit isn't meant for outlined; `role="img"` with a summary title, and a title per cell for hover.
  - **Accessibility:** a strip button's name is its visible text (weekday, date or count) followed by a visually hidden sentence ("Water, Tuesday 27 October 2026: 5 of 8"), as WCAG 2.5.3 asks (axe's label-content-name-mismatch caught an `aria-label` that didn't hold the visible text); done cells are a tint of the colour behind body text, not white on the colour.
  - **Colours** for categories and habits are one palette (`src/features/apps/colors.ts`), stored by name, each a middle lightness that shows on both themes.
  - **Deleting from the habit's own page** invalidates the overview only and drops the page's query after navigating away: invalidating it while still on screen would refetch a 404.
  - **Guest seed:** three habits begun 60 days ago (a 9-day reading streak, weekday walks, eight glasses of water part-done today).
- **Not done (stretch goals, each would need its own decision):** a Bikram Sambat calendar view and a daily reminder digest.
- **Why:** a streak is a calendar notion; computing it on instants would move days for anyone not on UTC, and Nepal is UTC+5:45. Server-side SVG keeps the year view out of the JavaScript and on the first paint.
- **Alternatives considered:** streaks in SQL (gaps-and-islands can't skip unscheduled weekdays simply); recomputing streaks in the browser from the strip (it would need the whole history on every page); a chart library heatmap (about 100 kB of JavaScript for 371 rectangles).

## 0194: A route's loader imports its queries on demand

- **What:** the apps' routes (`src/routes/_apps/apps/**`) load their query options inside the loader with `await import("@/features/apps/<app>/queries")` instead of a static import. A loader is in every page's JavaScript (0151), and a static import put the queries module there with the server-function stubs of every function in the app's functions file (a module lands in one chunk, whole). Now the queries load with the route: on the server while rendering, in the browser on navigation or on preload (intent), next to the component chunk that needs them anyway.
- **Numbers:** with Expenses and Habits added (five routes), the entry was 251.4 kB gzip, over the 250 kB budget. Loading the new routes' queries on demand gave 250.5 kB; doing the same for Kanban's, Notes' and Links' routes gave 248.5 kB, below Task 42's 248.9 kB.
- **Why:** the plan says new pages must not grow the entry chunk; this keeps an app's data layer out of pages that never show it.
- **Alternatives considered:** splitting each functions file into reads and writes (the loader's reads would still be in the entry, and the guard test's layout would change); raising the budget again. Task 45 can apply the same to the admin and portfolio routes.

## 0195: Forms: field definitions as data, one schema for both sides, a public page outside the sections

- **What:**
  - **Tables** (singular, like the rest of the schema): `form` (`slug` unique, random and never changed; title, description, `fields` jsonb, `status` draft or published, `published_at`) and `form_response` (the form, `data` jsonb, `submitted_at`, `ip_hash`). A response carries its form's owner as `owner_id`, so `ownedBy`, the claim and the guests' cleanup treat it like every other app row. Migration `0015_forms`.
  - **Field definitions** (`src/features/apps/forms/fields.ts`): a Zod discriminated union of nine types (short text, long text, email, number, one choice, several choices, rating 1–5, date, consent), each with `id`, `label`, `help`, `required` and its own settings (a length limit, a range and whole numbers, options with a radio or dropdown display, the most choices, the rating's end labels, date bounds). Fields and options have ids made in the browser (`f` + 8, `o` + 6 characters): answers are keyed by field id and choices stored as option ids, so renaming a question or an option keeps its answers. `fields` is written only after this schema.
  - **`toZodSchema(fields)`** turns a definition into the schema a response must pass: a strict object (no answers to questions the form doesn't have), optional fields taking their empty value, "Required" for an empty required number or rating (the fields store `undefined`), choices limited to the form's option ids. The public form's TanStack Form validators and the server's submission check use the same function; `tests/unit/forms-fields.test.ts` covers every type. The server stores the parsed answers without the empty ones.
  - **Builder** (`/apps/forms/$formId`): a draft held in the page, not a TanStack Form: the definition is a list of differently shaped items edited from three places (palette, list, settings panel), and a save validates the whole of it. Save checks the draft with `saveFormInput` first, then sends it against the version the builder loaded (a stale CONFLICT shows `StaleVersionAlert`); problems come back keyed like the input (`fields.2.label`) and show under their settings, the question marked in the list. Publishing doesn't change the version (it isn't an edit of the questions), as reordering projects doesn't (0176). The preview tab renders the draft with the public page's renderer.
  - **Drag and drop:** one dnd-kit provider holds the palette (draggables) and the questions (sortables that also accept palette items, plus a drop zone at the end), so a type dropped on a question goes in at its place. From the keyboard: each palette entry has an "add" button (after the selected question), its grip is a keyboard drag too, and questions move with Space/arrows/Space or Alt + ↑/↓, all announced. Options are a `SortableList` in the settings panel, outside that provider.
  - **Publishing:** accounts only (a guest's form is never public, 0186); a form needs a question. Editing a published form changes it live on save, which the builder says.
  - **Public page `/f/$slug`:** a root-level route (a short link to share), outside every section, so it renders its own small frame (brand, language, theme) and reads no session (`staticData.session: "skip"`). Only an account's published form; a draft, a guest's form or an unknown slug is the localized 404. `noindex` in the head and in `X-Robots-Tag`. The submission (`submitFormResponse`, unguarded and declared in the guard test) passes a honeypot (same "sent" answer, nothing stored), Turnstile when configured, a rate limit of 5 an hour per sender and form (a keyed hash of the IP, `clientIpHash`, now shared with the contact form), the form's schema, and a cap of 1,000 responses per form.
  - **Results** (`/apps/forms/$formId/results?page=`): computed from every response by `summarize` (`results.ts`): bars per option, the average and the 1–5 spread of ratings, average and range of numbers, agreement for consent, the newest text answers; answers that no longer fit their field (a removed option) are left out. Responses in a `DataTable`, 25 a page, a column per question; the CSV export has every response with the questions as headers and option labels as text.
  - **Quotas:** 20 forms per user. **Guest seed:** "Café feedback" in the guest's language, five questions and twelve responses, a draft.
  - **Not audited** (app data, 0186) and **not moderated:** a published form needs an account, the field types collect no passwords or files, and the owner can take it down; a moderation page like `/admin/links` (0191) can follow if forms are abused.
  - `NameDialog` moved from Kanban to `src/features/apps/components/` (Forms names a new form with it).
  - **Found on the way, in the form kit:** after a failed submit, a field fixed by typing kept its submit error until it lost focus; the message leaving moved the page between the press and the release of the next click, so pressing Send did nothing (the public form's e2e flow caught it). `clearServerErrorOnChange` now clears the server's, the submit's and the blur's errors of the changed field (the change validator has just checked it), so the message goes while typing. It is the listener `useCrudForm` already sets; forms without it keep the old behaviour (forms guide, pitfalls).
- **Why:** a definition that is data can be stored, previewed and validated by one schema on both sides, so the browser's errors are the server's. Option ids keep results meaningful when the owner fixes a typo after answers came in.
- **Alternatives considered:** a schema stored as JSON Schema (another validator, and Zod's localized messages would be lost); TanStack Form for the builder (nested arrays of unions with per-type settings; the draft-and-validate model is simpler and the errors map the same way); answers keyed by position (reordering would scramble them); versioned form definitions per response (more than a showcase needs; removed questions simply leave the results).

## 0196: Every form clears a field's stale errors when it changes

*Extends 0195's fix to every form.*

- **What:** `useAppForm` (`src/components/forms/index.ts`) wraps the hook `createFormHook` makes: every form gets `clearServerErrorOnChange` as its `listeners.onChange`, run before the form's own listener when it has one. Editing a field clears the errors the edit made stale (the server's, the last submit's and blur's); the change validator has just checked the field, so what it found is what shows. `useCrudForm`, the public form's renderer and `/dev/examples/forms` no longer pass the listener, and the forms barrel no longer exports it.
- **Why:** Task 44 found that without it a field fixed after a failed submit kept its message until it lost focus, and the message leaving moved the page between the press and the release of the next click, so the click on Send was lost. Only forms that remembered the listener were safe; the Expenses, Habits, Kanban, Links and media dialogs and the portfolio's section pages weren't.
- **Alternatives considered:** adding the listener to each form (easy to forget, which is how those forms missed it); a lint rule (no AST rule for "an options object without a key").

## 0197: Every route loader imports its queries on demand

*Extends 0194 from the apps to every section.*

- **What:** the admin, portfolio, `/dev` and `_apps` layout loaders load their feature's `queries.ts` with `await import(…)` inside the loader, as the apps' routes have since 0194; `/dev/examples/errors` and `/dev/examples/streaming` do the same for the functions module they call. Where a route's own component reads the same query options, the file also keeps the static import: the router's code splitter moves the component into its own chunk, and the reference file (loader, head, search) drops imports only the component uses. The auth routes keep their static import: `features/auth/queries` is in the root (the session) anyway.
- **Numbers (gzip, every page):** 249.8 kB → 246.3 kB; the server-function stubs in the entry chunk went from 94 to 11 (one stub pulls its whole functions file, and stubs are 64-character hashes that don't compress). The rest of the entry is the router (about 60 kB raw of `router-core` and `react-router`), React (66 kB gzip, its own chunk), Zod's core, and the route tree with every route's options and the messages their heads and crumbs use.
- **Trade-off:** a client-side navigation to a route whose chunk isn't loaded yet fetches the queries chunk before the loader can start its request. Links preload on intent (hover, focus, touch), which fetches the chunk and runs the loader before the click; on the server the import is a module already in memory. TanStack Router's docs advise against splitting the whole loader (`codeSplittingOptions` `['loader']`) for this reason; this moves only the import, route by route.
- **Not done:** the theme toggle's dropdown (Radix menu and floating-ui, about 45 kB raw) is in the entry because `theme.tsx` also holds what the root needs. Moving it to its own file would lower the entry line, but every section's header renders the toggle, so every page would still load it: the number would move, not the cost.
- **Alternatives considered:** splitting every loader with the router's option (an extra round trip even for routes whose loader needs nothing); raising the budget.

## 0198: Paraglide's CLI is told the output structure

*Corrects 0155.*

- **What:** `pnpm i18n:compile` (and so `pnpm typecheck`), `scripts/setup-local.ts`, `scripts/new-feature.ts` and `scripts/strip-demo.ts` pass `--output-structure locale-modules` to `paraglide-js compile`.
- **Why:** 0155 assumed the CLI reads `outputStructure` from `project.inlang/paraglide.config.ts`. It reads the config's other options, but this one is always the command-line value or the CLI's default, message-modules (Paraglide 2.25, `cli/commands/compile/command.js`). So `pnpm typecheck` replaced a running dev server's two message modules with 4,600 files, and a fresh clone's first `pnpm dev:local` (after `setup:local`) failed to load a message module while the Vite plugin rewrote them (Task 45's fresh-clone check).
- **Alternatives considered:** letting the CLI default stand and the plugin rewrite (the race above, and a thousand modules in dev, which 0155 removed).

## 0199: App quotas are checked under a transaction-scoped advisory lock

- **What:** `lockQuota(tx, scope)` (`src/server/apps/ownership.ts`) runs `pg_advisory_xact_lock(hashtextextended(scope, 0))`. Every app create that counts before it inserts (Kanban boards and cards, Notes, Links, Expenses' expenses, categories and imports, Habits, Forms) takes it first with `<app>:<user id>`, and a form's submission takes `forms-responses:<form id>` around the cap's count and the insert, now in one transaction.
- **Why:** under READ COMMITTED two requests could both count `quota − 1` and both insert, so a script could pass any per-user quota (the review of Part 4 found it). Kanban's columns were already safe because `createColumn` locks the board row; most quotas have no row to lock.
- **Also from the review:** an Expenses import's retry with a finished key is answered before the hourly import limit counts it (the key exists for retries); the short-link middleware no longer throws `URIError` on malformed percent-encoding (`/l/%E0`), though such a URL doesn't reach it yet: Nitro's h3 (2.0.1-rc.22) decodes every path with `decodeURI` while creating the request event, so any malformed path (`/work/%E0` too) is an uncaught exception and a request left without an answer on the Node server. h3 2.0.8 no longer decodes there; it comes with a Nitro upgrade; a short link can't target this site in another spelling (port, trailing dot, `www.`); a public form whose questions changed since the page loaded asks the respondent to reload (a CONFLICT with that message) instead of failing on questions the page doesn't show.
- **Alternatives considered:** `SERIALIZABLE` transactions (retries on every conflict for every create); a counter row per owner (another table and its upkeep in the claim and the cleanup).

## 0200: Part 4 measured (Task 45)

Measured on the owner's Windows machine (Node 24.11), 2026-10-30.

- **Every page's JavaScript:** 246.4 kB gzip (budget 250; 235.5 after Task 34, 338.5 with TanStack DB before Task 41). The heaviest routes on top of the root: the Kanban board 160.3 kB (TanStack DB, dnd-kit), the form builder 132.7, the notes list 127.6, the habits list 124.2, the `/dev/examples` pages 107–113, the admin profile editor 78.0. Preloaded fonts within budget, no exemptions.
- **`pnpm dev:local` on a fresh clone:** `pnpm install` 23 s, `pnpm setup:local` 10 s. Vite ready in 2.8–3.7 s once messages are compiled (15.9 s on the very first start, with the compile and the dependency scan); the first page 5.5–8.5 s; a page not seen yet 0.1–0.4 s, except the first app page (`/apps/kanban`: 18 s, the dependency optimizer bundling dnd-kit and TanStack DB); a repeat 0.1–0.4 s. A request in the first seconds after Vite prints its address can get a 503 ("Vite environment nitro is unavailable", Nitro 3 beta); a reload a moment later works.
- **Lighthouse 13.6, mobile, simulated throttling, behind a brotli proxy** (the harness server doesn't compress, portfolio guide): `/` 89, 97 and 94 in three runs (FCP and LCP 0.9 s, TBT 210–440 ms, CLS 0); `/login` 100, 99, 99. Task 40's 64 (home) and 69 (`/login`) were measured with TanStack DB still on every page (338.5 kB, removed in Task 41) and with an earlier Lighthouse, so the two aren't directly comparable. The home page's blocking time (hydrating the long page) is what still separates it from `/login`; the plan's ≥ 95 is met by one run in three.
- **Gates:** `pnpm test` 79 s (104 files, 905 tests); `pnpm test:storybook` 181 s (406 story tests, both passes); `pnpm build` 80 s; `pnpm build-storybook` 349 s; `pnpm test:e2e` 1,194 checks, all passed, none flaky, 14.8 min (Task 44: 1,194 in 14.4 min).
- **Review:** `/code-review` (high) over the Part 4 diff (`c129243..HEAD`, about 1,000 files) plus this task's changes. Fixed: the findings in 0199, the forms barrel's dead export and the missing decision (0196). Kept, with the reason: the loaders' on-demand import (0197's trade-off); the results page reading every response of a form (at most 1,000, and the summaries need them all).
