import { createFileRoute } from "@tanstack/react-router";
import { KitComponentsExample } from "@/features/dev/examples/kit-components";
import { kitComponentsQueryOptions } from "@/features/dev/examples/queries";
import { staticCrumb } from "@/lib/breadcrumbs";
import { ensureQuery } from "@/lib/query";
import { privateHead } from "@/lib/seo";
import { m } from "@/paraglide/messages";

/** The admin kit's components on one page (src/features/dev/examples/kit-components.tsx). */
export const Route = createFileRoute("/dev/examples/components")({
	loader: async ({ context }) => {
		await ensureQuery(context.queryClient, kitComponentsQueryOptions());
	},
	staticData: { breadcrumb: staticCrumb(m.examples_components_title) },
	head: () => privateHead(m.examples_components_title()),
	component: KitComponentsExample,
});
