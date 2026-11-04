import { createMiddleware } from "@tanstack/react-start";
import { sessionMiddleware } from "./auth";

/**
 * Parda's catalogue gate (PLAN 12.5, decision 0234): open to everyone, signed in or
 * not. Adds `context.catalog`: TMDB, its cache and the controls (takedowns, settings),
 * with the region and the kids' cap, or null when the catalogue isn't configured.
 * Anonymous calls over HTTP are limited per IP. Every function in src/functions/parda
 * that reads the catalogue starts with it (tests/server/guarded-functions.test.ts):
 *
 *   createServerFn({ method: "GET" })
 *     .middleware([withPardaCatalog])
 *     .validator(zodInput(hubInput))
 *     .handler(({ data, context }) => …);
 *
 * The server module is imported inside `.server()`, which the client build strips.
 */
export const withPardaCatalog = createMiddleware({ type: "function" })
	.middleware([sessionMiddleware])
	.server(async ({ next, context }) => {
		const { pardaCatalog } = await import("@/server/parda/catalog/context");
		return next({ context: { catalog: await pardaCatalog(context.session) } });
	});
