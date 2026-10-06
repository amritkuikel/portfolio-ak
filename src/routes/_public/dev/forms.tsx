import { createFileRoute, notFound } from "@tanstack/react-router";
import { FormsShowcase } from "@/features/dev/forms-showcase";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

/**
 * Development-only showcase of every form field. In production builds
 * `import.meta.env.DEV` is the constant `false`: beforeLoad answers 404 and
 * FormsShowcase is never referenced, so the bundler drops the (side-effect
 * free) showcase module. Imported statically on purpose: lazyRouteComponent made
 * React warn about use() while hydrating this route in dev.
 */
export const Route = createFileRoute("/_public/dev/forms")({
	beforeLoad: () => {
		if (!import.meta.env.DEV) throw notFound();
	},
	head: () => ({ meta: [{ title: pageTitle(m.showcase_title()) }, { name: "robots", content: "noindex" }] }),
	component: import.meta.env.DEV ? FormsShowcase : () => null,
});
