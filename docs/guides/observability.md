# Observability: logs, Sentry, PostHog and feature flags

All optional except the logs. Without their variables, Sentry and PostHog are off: nothing is initialised or downloaded, no consent banner, no network calls. Example: `/dev/examples/analytics`.

## Logs

- **One JSON line per server-function call** (`src/middleware/logging.ts`): function name, method, request id, duration and outcome.
- **Levels:** expected refusals (4xx `AppError`) log as `warn`, failures as `error`. The request id is attached to the `AppError` the user sees, so a support report leads to the log line.
- **Unexpected errors** log once, with their stack, in `normalizeServerError` (`src/middleware/errors.ts`).

## Sentry (`VITE_SENTRY_DSN`)

- **Browser** (`src/instrument.client.ts`) and **server** (`src/instrument.server.ts`, imported first by `src/server.ts`): errors and performance traces, including router navigations.
- **What's reported:** unexpected server-function errors, once, with the original stack and the request id. Expected `AppError`s (below 500) aren't reported, and the browser doesn't log them either (`onCaughtError` in `src/client.tsx`).
- **Privacy:** only the user id is attached; the IP address is stripped.
- **Source maps** upload during `pnpm build` when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT` are all set.
- **CSP:** the ingest host is added to `connect-src` only when a DSN is configured.

## PostHog (`VITE_POSTHOG_KEY`, optional `VITE_POSTHOG_HOST`)

- **Opt-in:** a consent banner stores the choice in a cookie (`analyticsConsent` preference), rendered on the server so nothing shifts. The footer link changes it later.
- **Before consent:** `posthog-js` isn't downloaded, `track()` is a no-op, and the server sends no events.
- **After consent:** pageviews on navigation, `identify` on login and `reset` on logout, plus feature events: `test_crud_created`, `test_crud_updated` and `test_crud_deleted` (server) and `test_crud_viewed` (browser).
- **In features:** call `track("event", props)` freely; it does nothing without consent.

## Feature flags

- **Evaluated on the server** in a loader (`src/functions/feature-flags.ts`) and SSR'd through the Query cache, so the server and browser render the same thing and the browser makes no flag request.
- **Unknown or unconfigured flags are off.** Before consent, flags are evaluated with a shared anonymous id and never record `$feature_flag_called`.
- **Example:** create a boolean flag `home-items-cta` in PostHog to show a call to action on the home page.

## Health

`/health` shows the database status and latency (noindex). Uptime monitors can use it.
