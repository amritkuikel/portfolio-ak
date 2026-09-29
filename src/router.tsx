import type { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ErrorPage } from "./components/errors/error-page";
import { NotFoundPage } from "./components/errors/not-found-page";
import { PendingPage } from "./components/errors/pending-page";
import { createQueryClient } from "./lib/query";
import type { Session } from "./lib/session";
import { deLocalizeUrl, localizeUrl } from "./paraglide/runtime";
import { routeTree } from "./routeTree.gen";

/** Available to every route's beforeLoad/loader via `context`. */
export type RouterContext = {
	queryClient: QueryClient;
	/** Filled by the root route's beforeLoad once auth exists (Phase 6). */
	session: Session | null;
};

export function getRouter() {
	// getRouter runs once per request on the server, so each request gets its own cache.
	const queryClient = createQueryClient();

	const router = createTanStackRouter({
		routeTree,
		context: { queryClient, session: null } satisfies RouterContext,
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

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
