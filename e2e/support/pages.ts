/**
 * The pages the browser review visits (e2e/review.spec.ts). Every route in
 * src/routeTree.gen.ts must be either reviewed or excluded here with a reason;
 * tests/unit/e2e-pages.test.ts fails otherwise, so a new route can't skip the review.
 *
 * Plain data without Playwright imports, so the unit test can read it.
 */
import type { E2EUser } from "../harness/config.ts";

export type ReviewedPage = {
	/** The route's path as in FileRoutesByTo (`$param` segments included). */
	route: string;
	/** Who visits it; anonymous when unset. */
	as?: E2EUser;
	/** How a `$param` route gets a concrete URL. */
	params?: { from: "sitemap" } | { from: "test-crud-id" };
	/** A path that isn't a route (the not-found page). Defaults to `route`. */
	path?: string;
	/** The expected HTTP status when it isn't 200. */
	status?: 403 | 404;
	/** A name for pages reviewed more than once (e.g. a route as two users). */
	label?: string;
};

/** A seeded Test CRUD item (scripts/lib/demo-data.mjs) for admin detail pages. */
export const SEEDED_ITEM_SLUG = "momo-masterclass-1";

export const REVIEWED_PAGES: ReadonlyArray<ReviewedPage> = [
	// Public site
	{ route: "/" },
	{ route: "/stack" },
	{ route: "/health" },
	{ route: "/test-crud" },
	{ route: "/test-crud/$slug", params: { from: "sitemap" } },
	{ route: "/verify-email" },
	{ route: "/reset-password" },
	{ route: "/portfolio" },
	{ route: "/portfolio/about" },
	{ route: "/portfolio/contact" },
	{ route: "/portfolio/work" },
	{ route: "/portfolio/work/$slug", params: { from: "sitemap" } },
	{ route: "/portfolio/journal" },
	{ route: "/portfolio/journal/$slug", params: { from: "sitemap" } },
	// Signing in
	{ route: "/login" },
	{ route: "/register" },
	{ route: "/forgot-password" },
	{ route: "/sign-in-code" },
	// Account and admin
	{ route: "/account", as: "member" },
	{ route: "/admin", as: "admin" },
	{ route: "/admin", as: "member", status: 403, label: "forbidden" },
	{ route: "/admin/test-crud", as: "admin" },
	{ route: "/admin/test-crud/new", as: "admin" },
	{ route: "/admin/test-crud/$id", as: "admin", params: { from: "test-crud-id" } },
	{ route: "/admin/roles", as: "admin" },
	{ route: "/admin/roles/permissions", as: "admin" },
	{ route: "/admin/users", as: "admin" },
	// Errors
	{ route: "(not found)", path: "/no-such-page", status: 404 },
];

/** Routes the review skips, each with the reason. */
export const NOT_REVIEWED: Readonly<Record<string, string>> = {
	"/robots.txt": "not a page (text)",
	"/sitemap.xml": "not a page (XML); the review reads it to find $slug URLs",
	"/api/auth/$": "Better Auth's HTTP API",
	"/dev": "dev-only: 404 in production builds",
};

/** Dev-only routes (the /dev layout 404s in builds) need no entry of their own. */
export const isDevOnlyRoute = (route: string) => route === "/dev" || route.startsWith("/dev/");

/** `/ne` prefix for Nepali (English is unprefixed). */
export const localizedPath = (path: string, locale: "en" | "ne") =>
	locale === "en" ? path : path === "/" ? "/ne" : `/ne${path}`;

/** A RegExp matching the route's concrete paths (each `$param` is one segment). */
export const routePattern = (route: string) =>
	new RegExp(`^${route.replace(/[.*+?^{}()|[\]\\]/g, "\\$&").replace(/\$[a-zA-Z]+/g, "[^/]+")}$`);
