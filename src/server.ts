/**
 * Custom server entry (TanStack Start). Paraglide's middleware resolves the
 * request locale and scopes it with AsyncLocalStorage, so getLocale() is correct
 * during SSR. The original request is passed on because the router does its own
 * URL de-localization (see router.tsx); passing the rewritten one causes loops.
 */
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { LOCALE_HEADER } from "./lib/i18n/locale-header";
import { defineCustomServerStrategy, toLocale } from "./paraglide/runtime.js";
import { paraglideMiddleware } from "./paraglide/server.js";

// Used for /_serverFn/* only (routeStrategies in project.inlang/paraglide.config.ts).
// toLocale() rejects anything that isn't a configured locale.
defineCustomServerStrategy("custom-header", {
	getLocale: (request) => toLocale(request?.headers.get(LOCALE_HEADER) ?? undefined),
});

export default createServerEntry({
	fetch(request) {
		return paraglideMiddleware(request, () => handler.fetch(request));
	},
});
