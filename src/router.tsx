import type { DbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routerWithDbClient } from "@tanstack/react-router-with-db";
import { getGlobalStartContext } from "@tanstack/react-start";
import { ErrorPage } from "./components/errors/error-page";
import { NotFoundPage } from "./components/errors/not-found-page";
import { PendingPage } from "./components/errors/pending-page";
import { parseSearch, stringifySearch } from "./lib/list/url";
import { traceNavigation } from "./lib/observability/sentry-client";
import { createQueryClient } from "./lib/query";
import type { Session } from "./lib/session";
import { readPreferences } from "./lib/start/read-preferences";
import { createPreferencesStore, type PreferencesStore } from "./lib/stores/preferences";
import { createDbClient } from "./lib/tanstack-db";
import { deLocalizeUrl, localizeUrl } from "./paraglide/runtime";
import { routeTree } from "./routeTree.gen";

/** Available to every route's beforeLoad/loader via `context`. */
export type RouterContext = {
	queryClient: QueryClient;
	/** TanStack DB client: live collections on top of queryClient (src/lib/tanstack-db.ts). */
	dbClient: DbClient;
	/** UI preferences (theme, sidebar, tables), seeded from cookies (src/lib/stores). */
	preferences: PreferencesStore;
	/** Filled by the root route's beforeLoad once auth exists (Phase 6). */
	session: Session | null;
};

export function getRouter() {
	// getRouter runs once per request on the server, so each request gets its own
	// cache, DB client and preferences store. Never make these module-level: a
	// shared server instance would leak one visitor's data into another's render.
	const queryClient = createQueryClient();
	const dbClient = createDbClient(queryClient);
	const preferences = createPreferencesStore(readPreferences());

	const router = createTanStackRouter({
		routeTree,
		context: { queryClient, dbClient, preferences, session: null } satisfies RouterContext,
		// Per-request CSP nonce (security-headers middleware) for Start's inline scripts
		// and ScriptOnce. Only meaningful during SSR; undefined in the browser.
		ssr: { nonce: typeof window === "undefined" ? getGlobalStartContext()?.nonce : undefined },
		// Arrays in the URL are repeated keys (tags=a&tags=b), exactly what a plain GET
		// form submits, so filter URLs look the same with and without JavaScript.
		parseSearch,
		stringifySearch,
		scrollRestoration: true,
		defaultPreload: "intent",
		// Let TanStack Query decide freshness for preloaded data.
		defaultPreloadStaleTime: 0,
		defaultErrorComponent: ErrorPage,
		defaultNotFoundComponent: NotFoundPage,
		defaultPendingComponent: PendingPage,
		// Paraglide URL strategy: routes are defined once (unprefixed); /ne/... is
		// mapped onto them on the way in and re-prefixed on the way out.
		rewrite: {
			input: ({ url }) => deLocalizeUrl(url),
			output: ({ url }) => localizeUrl(url),
		},
	});

	// Official integration: dehydrates the QueryClient into the SSR stream,
	// hydrates it on the client and wraps the app in QueryClientProvider.
	setupRouterSsrQueryIntegration({ router, queryClient });

	// Navigation performance traces in the browser (only when Sentry is on).
	if (!router.isServer) traceNavigation(router);

	// Official TanStack DB integration, applied after the Query one because it
	// wraps the existing dehydrate/hydrate/Wrap: adds <DbProvider>, streams live
	// query results rendered during SSR and hydrates them in the browser.
	return routerWithDbClient(router, dbClient);
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
