import { createFileRoute } from "@tanstack/react-router";
import { ProcessPage } from "@/features/portfolio/admin/components/section-pages";
import { processSection } from "@/features/portfolio/admin/queries";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { staticCrumb } from "@/lib/breadcrumbs";
import { titleHead } from "@/lib/crud/route";
import { ensureQuery } from "@/lib/query";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/portfolio/process")({
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "portfolio:read"),
	loader: ({ context }) => ensureQuery(context.queryClient, processSection.list()),
	staticData: { breadcrumb: staticCrumb(m.portfolio_admin_process_title) },
	head: titleHead(m.portfolio_admin_process_title),
	component: ProcessPage,
});
