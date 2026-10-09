import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { NOINDEX } from "@/lib/seo";

/**
 * Development-only pages (/dev/forms, /dev/examples). In production builds
 * `import.meta.env.DEV` is the constant false: every page here answers with the
 * localized 404 before its loader runs, and their server functions refuse too
 * (devOnlyMiddleware). Never indexed.
 */
export const Route = createFileRoute("/_public/dev")({
	beforeLoad: () => {
		if (!import.meta.env.DEV) throw notFound();
	},
	head: () => ({ meta: [NOINDEX] }),
	component: Outlet,
});
