import { createFileRoute } from "@tanstack/react-router";
import { ProjectEditPage } from "@/features/portfolio/admin/components/project-pages";
import { projectDetailQueryOptions } from "@/features/portfolio/admin/queries";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { loaderTitleCrumb } from "@/lib/breadcrumbs";
import { loadDetailOr404, titleHead } from "@/lib/crud/route";
import { idSchema } from "@/lib/crud/schema";
import { parseParams } from "@/lib/list/params";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/portfolio/projects/$id")({
	// Only UUIDs match ("new" is its own route and matches first).
	params: { parse: (raw) => parseParams(idSchema, raw) },
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "portfolio:write"),
	loader: async ({ context, params }) => ({
		title: (await loadDetailOr404(context.queryClient, projectDetailQueryOptions(params.id))).title,
	}),
	staticData: { breadcrumb: loaderTitleCrumb },
	head: titleHead(m.portfolio_admin_projects_edit),
	component: ProjectEditPage,
});
