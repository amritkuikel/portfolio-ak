import { createFileRoute } from "@tanstack/react-router";
import { ExperiencePage } from "@/features/portfolio/admin/components/section-pages";
import { experienceSection } from "@/features/portfolio/admin/queries";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { staticCrumb } from "@/lib/breadcrumbs";
import { titleHead } from "@/lib/crud/route";
import { ensureQuery } from "@/lib/query";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/portfolio/experience")({
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "portfolio:read"),
	loader: ({ context }) => ensureQuery(context.queryClient, experienceSection.list()),
	staticData: { breadcrumb: staticCrumb(m.portfolio_admin_experience_title) },
	head: titleHead(m.portfolio_admin_experience_title),
	component: ExperiencePage,
});
