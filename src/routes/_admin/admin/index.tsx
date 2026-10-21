import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/admin/components/dashboard";
import { dashboardQueryOptions } from "@/features/admin/queries";
import { ensureQuery } from "@/lib/query";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/")({
	loader: ({ context }) => ensureQuery(context.queryClient, dashboardQueryOptions()),
	head: () => ({ meta: [{ title: pageTitle(m.admin_title()) }] }),
	component: Dashboard,
});
