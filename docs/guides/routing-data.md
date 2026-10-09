# Routing, data loading and server functions

The SSR pattern every page follows, how server functions are written, and how errors travel. Examples: `/dev/examples/loader-query`, `/dev/examples/streaming`, `/dev/examples/errors`.

## Routes

- **Layouts by audience** (`src/routes/`):
  - `_public`: the site.
  - `_auth`: sign-in pages; signed-in users are sent on.
  - `_authed`: needs a session.
  - `_admin`: the admin area; the server is asked on entry, and any permission opens it.
- **Locales:** routes are defined once. The router rewrites `/ne/…` onto them and back (`src/router.tsx`, Paraglide's URL strategy).
- **A section's `route.tsx`** names its breadcrumb (`staticData: { breadcrumb: staticCrumb(m.x) }`). Detail routes use `loaderTitleCrumb`, with the loader returning `{ title }`.
- **Path params** are validated by the route (`params: { parse: (raw) => parseParams(schema, raw) }`). An invalid one doesn't match, so the localized 404 renders without a request (0092).
- **Search params:** see [search-filters-masking.md](search-filters-masking.md).

## Loading data (SSR without refetching)

```ts
export const Route = createFileRoute("/_public/things/$id")({
	loader: async ({ context, params }) => {
		const thing = await context.queryClient.ensureQueryData(thingQueryOptions(params.id));
		return { title: thing.title }; // only what head/staticData need
	},
	head: ({ loaderData }) => seo({ title: loaderData?.title, … }),
	component: ThingPage,
});

function ThingPage() {
	const { id } = Route.useParams();
	const { data } = useSuspenseQuery(thingQueryOptions(id)); // from the dehydrated cache
}
```

- **Query client:** one per request on the server, one per tab in the browser (`src/lib/query.ts`). `staleTime` is 60 s, so hydration doesn't refetch. App errors (4xx) aren't retried.
- **Loader data:** keep it small. The item already travels in the Query cache; returning it again sends it twice.
- **Lists:** `loadList(queryClient, options, cause)` in the loader and `useListQuery(options)` in the component. A new search on the same page keeps the old rows on screen, marked busy, instead of showing a pending screen (0089).
- **Streaming:** return a promise without awaiting it (`return { stats: getStats() }`) and render it with `<Await promise fallback>`. Reserve the result's height in the fallback.
- **No first-paint fetching in effects.** If the page needs it, the loader loads it.

## Server functions

```ts
export const updateThing = createServerFn({ method: "POST" })
	.middleware([requirePermission("things:update")])
	.validator(zodInput(thingUpdateSchema))
	.handler(({ data, context }) => updateItem(db, data, { userId: context.user.id }));
```

- **Thin:** the middleware checks the permission, `zodInput` validates with the shared schema (field errors come back keyed by field), and the handler is one call into `src/server/**`. Logic lives there, where tests run it on PGlite.
- **Every protected function** runs `requirePermission` first, and `tests/server/test-crud-functions.test.ts` lists each function with its permission ([rbac.md](rbac.md)). Use `requireUserMiddleware` for "any signed-in user" and `devOnlyMiddleware` for `/dev` helpers.
- **Global function middleware** (`src/start.ts`): it sends the page locale as a header (so `m.*` and `getLocale()` work inside handlers), assigns a request id, logs one JSON line per call, and normalises errors.
- **Runtime:** server functions run only inside Start. Test the plain functions they call, not the wrappers.

## Errors

- **Throw `AppError(code, devMessage, { fieldErrors })`** for expected failures: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`. User-facing text is picked on the client by code (`errorMessage(error)`). `fieldErrors` hold localized messages for form fields; `ruleError(code, dev, user)` makes a whole-form message.
- **Anything else** becomes `INTERNAL` with only a request id. The original is logged and sent to Sentry once (`src/middleware/errors.ts`).
- **Over HTTP**, a server-function error is a 200 with a serialized payload (`x-tss-serialized`). Look for the code in the body.
- **In loaders:**
  - `throw notFound()` for missing records, which renders the localized 404.
  - For an `AppError`, call `await setErrorStatus(error)` before rethrowing, so the SSR response carries 403/404 instead of 500.
  - The route's error component is `ErrorPage`; `src/client.tsx` doesn't log expected errors.
- **In actions:** catch where they happen. Use `applyServerFieldErrors(form, error)` for forms, otherwise a toast with `errorMessage(error)`.

## Server-only code

`src/server/**` and `*.server.*` never reach the client: TanStack Start's import protection fails the build, and `tests/server/env-boundary.test.ts` scans imports. Allowed importers are `src/server`, `src/functions`, `src/middleware` (dynamic import inside `.server()` only), and server routes (`.ts` route files with only `server.handlers`, like `/sitemap.xml`).

Modules that use Start runtime helpers (`createIsomorphicFn`, e.g. `src/lib/http-status.ts`) are for routes and server code only. Storybook has no Start plugin, so a component importing them breaks every story.
