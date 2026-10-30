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
	/** How a `$param` route gets a concrete URL (or give its `path`). */
	params?:
		| { from: "sitemap" }
		| { from: "test-crud-id" }
		| { from: "seeded-slug" }
		| { from: "portfolio-project-id" } // @portfolio
		| { from: "portfolio-post-id" } // @portfolio
		| { from: "kanban-board-id" } // @apps
		| { from: "note-id" } // @apps
		| { from: "shared-note-token" } // @apps
		| { from: "link-id" } // @apps
		| { from: "expenses-data" } // @apps
		| { from: "habit-data" } // @apps
		| { from: "habit-id" }; // @apps
	/** The concrete path, when it isn't `route` (the not-found page, a fixed `$param`). */
	path?: string;
	/** The expected HTTP status when it isn't 200. */
	status?: 403 | 404;
	/** A name for pages reviewed more than once (e.g. a route as two users). */
	label?: string;
};

/** A seeded Test CRUD item (scripts/lib/demo-data.ts) for admin detail pages (a draft: every third item is). */
export const SEEDED_ITEM_SLUG = "momo-masterclass-1";
/** A seeded, published one, for the public detail page. */
export const SEEDED_PUBLISHED_SLUG = "thangka-painting-1";

export const REVIEWED_PAGES: ReadonlyArray<ReviewedPage> = [
	// The home page: the portfolio (a neutral landing page once it is stripped)
	{ route: "/" },
	// portfolio:start
	{ route: "/about" },
	{ route: "/contact" },
	{ route: "/work" },
	{ route: "/work/$slug", params: { from: "sitemap" } },
	{ route: "/journal" },
	{ route: "/journal/$slug", params: { from: "sitemap" } },
	// portfolio:end
	// Public pages outside any section
	{ route: "/health" },
	{ route: "/verify-email" },
	{ route: "/reset-password" },
	// The demo and references under /dev (the harness builds with VITE_DEV_ROUTES=true)
	{ route: "/dev" },
	{ route: "/dev/stack" },
	{ route: "/dev/test-crud" },
	{ route: "/dev/test-crud/$slug", params: { from: "seeded-slug" } },
	{ route: "/dev/forms" },
	{ route: "/dev/examples" },
	{ route: "/dev/examples/loader-query" },
	{ route: "/dev/examples/streaming" },
	{ route: "/dev/examples/filters" },
	{ route: "/dev/examples/masking" },
	{ route: "/dev/examples/forms" },
	{ route: "/dev/examples/components" },
	{ route: "/dev/examples/fields" },
	{ route: "/dev/examples/data-table" },
	{ route: "/dev/examples/optimistic" },
	{ route: "/dev/examples/preferences" },
	{ route: "/dev/examples/permissions" },
	{ route: "/dev/examples/attachments" },
	{ route: "/dev/examples/seo" },
	{ route: "/dev/examples/i18n" },
	{ route: "/dev/examples/idempotency" },
	{ route: "/dev/examples/errors" },
	{ route: "/dev/examples/analytics" },
	{ route: "/dev/examples/list-extras" },
	{ route: "/dev/examples/caching" },
	{ route: "/dev/examples/background-jobs" },
	{ route: "/dev/examples/contact" },
	// A fixed in-memory task (src/server/examples/tasks.ts).
	{ route: "/dev/examples/masking/$id", path: "/dev/examples/masking/00000000-0000-4000-8000-000000000001" },
	// Signing in
	{ route: "/login" },
	{ route: "/register" },
	{ route: "/forgot-password" },
	{ route: "/sign-in-code" },
	// A guest is sent here from account pages; a visitor sees the same offer.
	{ route: "/upgrade" },
	// Account and admin
	{ route: "/account", as: "member" },
	// Without the emailed token it only explains where the link comes from (nothing is deleted).
	{ route: "/account/delete", as: "member" },
	{ route: "/admin", as: "admin" },
	{ route: "/admin", as: "member", status: 403, label: "forbidden" },
	{ route: "/admin/test-crud", as: "admin" },
	{ route: "/admin/test-crud/new", as: "admin" },
	{ route: "/admin/test-crud/$id", as: "admin", params: { from: "test-crud-id" } },
	{ route: "/admin/roles", as: "admin" },
	{ route: "/admin/roles/permissions", as: "admin" },
	{ route: "/admin/users", as: "admin" },
	{ route: "/admin/audit", as: "admin" },
	{ route: "/admin/settings/appearance", as: "admin" },
	// The editor's roles don't include audit:read (decisions.md 0132).
	{ route: "/admin/audit", as: "editor", status: 403, label: "forbidden" },
	// portfolio:start
	{ route: "/admin/portfolio/profile", as: "admin" },
	{ route: "/admin/portfolio/projects", as: "admin" },
	{ route: "/admin/portfolio/projects/new", as: "admin" },
	{ route: "/admin/portfolio/projects/$id", as: "admin", params: { from: "portfolio-project-id" } },
	{ route: "/admin/portfolio/journal", as: "admin" },
	{ route: "/admin/portfolio/journal/new", as: "admin" },
	{ route: "/admin/portfolio/journal/$id", as: "admin", params: { from: "portfolio-post-id" } },
	{ route: "/admin/portfolio/experience", as: "admin" },
	{ route: "/admin/portfolio/skills", as: "admin" },
	{ route: "/admin/portfolio/process", as: "admin" },
	{ route: "/admin/portfolio/testimonials", as: "admin" },
	{ route: "/admin/portfolio/messages", as: "admin" },
	{ route: "/admin/media", as: "admin" },
	// The demo editor writes the portfolio but doesn't read the inbox.
	{ route: "/admin/portfolio/messages", as: "editor", status: 403, label: "forbidden" },
	// portfolio:end
	// apps:start
	// The showcase apps (decision 0187): landings for visitors, the app for a user.
	{ route: "/apps" },
	{ route: "/apps/kanban" },
	{ route: "/apps/kanban", as: "member", label: "boards" },
	{ route: "/apps/kanban/$boardId", as: "member", params: { from: "kanban-board-id" } },
	{ route: "/apps/notes" },
	{ route: "/apps/notes", as: "member", label: "notes" },
	{ route: "/apps/notes/$noteId", as: "member", params: { from: "note-id" } },
	// Public to anyone with the link: reviewed signed out.
	{ route: "/apps/notes/s/$token", params: { from: "shared-note-token" } },
	{ route: "/apps/links" },
	{ route: "/apps/links", as: "member", label: "links" },
	{ route: "/apps/links/$linkId", as: "member", params: { from: "link-id" } },
	{ route: "/apps/expenses" },
	// With a month of expenses, budgets and categories (the harness adds them on first ask).
	{ route: "/apps/expenses", as: "member", label: "expenses", params: { from: "expenses-data" } },
	{ route: "/apps/expenses/categories", as: "member", params: { from: "expenses-data" } },
	{ route: "/apps/expenses/import", as: "member" },
	{ route: "/apps/habits" },
	{ route: "/apps/habits", as: "member", label: "habits", params: { from: "habit-data" } },
	{ route: "/apps/habits/$habitId", as: "member", params: { from: "habit-id" } },
	{ route: "/admin/apps", as: "admin" },
	{ route: "/admin/links", as: "admin" },
	// apps:end
	// @new-feature:reviewed-pages
	// Errors
	{ route: "(not found)", path: "/no-such-page", status: 404 },
];

/** Routes the review skips, each with the reason. */
export const NOT_REVIEWED: Readonly<Record<string, string>> = {
	"/robots.txt": "not a page (text)",
	"/sitemap.xml": "not a page (XML); the review reads it to find $slug URLs",
	"/api/auth/$": "Better Auth's HTTP API",
	"/api/health": "JSON for uptime monitors (checked by e2e/flows/health.spec.ts)",
	"/api/account/export": "a JSON download (checked by e2e/flows/account.spec.ts)",
	"/api/csp-report": "POST endpoint for CSP reports (checked by e2e/flows/frontend.spec.ts)",
	"/l/$slug": "a redirect, or the 404 (checked by e2e/flows/apps.spec.ts)", // @apps
	// @new-feature:not-reviewed
};

/** `/ne` prefix for Nepali (English is unprefixed). */
export const localizedPath = (path: string, locale: "en" | "ne") =>
	locale === "en" ? path : path === "/" ? "/ne" : `/ne${path}`;

/** A RegExp matching the route's concrete paths (each `$param` is one segment). */
export const routePattern = (route: string) =>
	new RegExp(`^${route.replace(/[.*+?^{}()|[\]\\]/g, "\\$&").replace(/\$[a-zA-Z]+/g, "[^/]+")}$`);
