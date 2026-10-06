import type { DbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routerWithDbClient } from "@tanstack/react-router-with-db";
import { ErrorPage } from "./components/errors/error-page";
import { NotFoundPage } from "./components/errors/not-found-page";
import { PendingPage } from "./components/errors/pending-page";
import { createDbClient } from "./lib/db";
import { createQueryClient } from "./lib/query";
import type { Session } from "./lib/session";
import { createPreferencesStore, type PreferencesStore } from "./lib/stores/preferences";
import { readPreferences } from "./lib/stores/read-preferences";
import { deLocalizeUrl, localizeUrl } from "./paraglide/runtime";
import { routeTree } from "./routeTree.gen";

/** Available to every route's beforeLoad/loader via `context`. */
export type RouterContext = {
	queryClient: QueryClient;
	/** TanStack DB client: live collections on top of queryClient (src/lib/db.ts). */
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
