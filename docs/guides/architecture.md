# Architecture

How the app is put together and how a request flows through it. The file-by-file map is in [conventions.md](conventions.md); why each choice was made is in [decisions.md](../decisions.md).

## The shape

- **One TanStack Start app**: React 19, file routes, server functions. Nitro builds it for Vercel.
- **Every page renders on the server**, in English (`/…`) or Nepali (`/ne/…`), and hydrates without refetching. Public pages work without JavaScript.
- **The server is the authority:** each server function checks the caller's permission and validates its input with the same Zod schema the form uses.
- **Data:** Postgres (Neon) through Drizzle. Repositories take an injected `Db`, so tests run them on PGlite with the real migrations.
- **Outside services, all optional except the database and email:** Cloudinary (images), Resend (email), Sentry (errors), PostHog (analytics after consent, feature flags).

## Layers

| Layer | Where | Rule |
| --- | --- | --- |
| Routes | `src/routes/` | Thin: `validateSearch`, guards in `beforeLoad`, a loader, `head`, `staticData.breadcrumb`, and a page made of shared components. |
| Features | `src/features/<name>/` | Code shared by client and server for one feature: Zod schemas, query options, TanStack DB collections, components, labels. |
| Server functions | `src/functions/<name>.ts` | The only door from the browser to the server: middleware (permission) + `validator(zodInput(schema))` + a one-line call into `src/server`. |
| Server | `src/server/` | Server-only: env, database, auth, email, repositories and services, Nitro routes. Import protection and a test keep it out of client bundles. |
| Middleware | `src/middleware/` | Security headers + CSP nonce, CSRF, locale, logging, error normalisation, auth/permissions, dev-only guard. |
| Shared UI | `src/components/` | Generic building blocks with no feature knowledge: page, data table, filters, navigation, dialogs, forms, layout. |
| Helpers | `src/lib/` | Isomorphic: list contract, search params, SEO, breadcrumbs, intl, validation, errors, stores, analytics, Zod. |

## A request, end to end

1. **Server entry** (`src/server.ts`): Sentry starts, Paraglide resolves the locale from the URL (or from a header, for server-function calls), and AppError statuses become HTTP statuses.
2. **Request middleware** (`src/start.ts`): Sentry, security headers with a per-request CSP nonce, CSRF (server functions only).
3. **Router**: `/ne/…` is mapped onto the same routes. The root `beforeLoad` loads the session into the Query cache. Layout guards run next: `_authed` needs a session; `_admin` asks the server on entry; section routes run `assertRoutePermission`.
4. **Loader**: `ensureQuery(queryClient, options)`, or `loadList(...)` for search-driven lists. The query function calls a **server function**.
5. **Server function**: function middleware (locale header, request id and logging, error normalisation, then `requirePermission(…)`), the Zod validator, then the handler. The handler calls a service or repository, which talks to Postgres through Drizzle.
6. **Response**: the page streams as HTML with the Query cache dehydrated into it, and hydrates without refetching (`staleTime` 60 s). Errors arrive as `AppError` with a code; the page shows a localized message, and SSR responses carry the matching status.

## Where to start for…

| Task | Read |
| --- | --- |
| A new feature (list, form, detail, public page) | README "Test CRUD", [conventions.md](conventions.md) |
| Loaders, server functions, errors | [routing-data.md](routing-data.md) |
| Lists: URL params, filters, masking | [search-filters-masking.md](search-filters-masking.md), [tables-filters.md](tables-filters.md) |
| Forms | [forms.md](forms.md) |
| Permissions | [rbac.md](rbac.md) |
| Images | [attachments.md](attachments.md) |
| Head tags, sitemap | [seo.md](seo.md) |
| Text and formatting | [i18n.md](i18n.md) |
| Query vs DB vs Store | [state.md](state.md) |
| Tests | [testing.md](testing.md) |
| Errors, logs, analytics | [observability.md](observability.md) |
| Headers, CSP, CSRF, sanitizing | [security.md](security.md) |
| Shipping | [deployment.md](deployment.md) |

Every module has a working page at `/dev/examples` (`pnpm dev`).
