import { createFileRoute } from "@tanstack/react-router";
import { FormsShowcase } from "@/features/dev/forms-showcase";
import { privateHead } from "@/lib/seo";
import { m } from "@/paraglide/messages";

/**
 * Development-only showcase of every form field. In production builds the /dev
 * layout answers 404 (see ./route.tsx), and `import.meta.env.DEV` is the
 * constant `false`, so FormsShowcase is never referenced and the bundler drops
 * the (side-effect free) showcase module. Imported statically on purpose: lazyRouteComponent made
 * React warn about use() while hydrating this route in dev.
 */
export const Route = createFileRoute("/_public/dev/forms")({
	head: () => privateHead(m.showcase_title()),
	component: import.meta.env.DEV ? FormsShowcase : () => null,
});
