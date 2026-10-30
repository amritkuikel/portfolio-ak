import { createMiddleware } from "@tanstack/react-start";

/** The slug of a short link's path ("/l/<slug>", or "/ne/l/<slug>"). */
const SLUG_IN_PATH = /\/l\/([^/]+)\/?$/;

/**
 * Request middleware of /l/$slug (decision 0191): finds the short link and puts its
 * answer in the context, `shortLink`: a 302 to the target (the click recorded in the
 * background) when the link may redirect now, else null. The route's handler returns
 * it or falls through to the localized 404. Server code is imported here, inside
 * `.server()`, so the route file (a page, it has a component) never reaches it.
 */
export const shortLinkMiddleware = createMiddleware().server(async ({ next, request }) => {
	const slug = SLUG_IN_PATH.exec(new URL(request.url).pathname)?.[1] ?? "";
	const [{ db }, { shortLinkResponse }] = await Promise.all([
		import("@/server/db/client"),
		import("@/server/apps/links/redirect"),
	]);
	return next({ context: { shortLink: await shortLinkResponse(db, decodeURIComponent(slug), request) } });
});
