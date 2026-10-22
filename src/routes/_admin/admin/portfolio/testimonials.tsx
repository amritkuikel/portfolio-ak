import { createFileRoute } from "@tanstack/react-router";
import { TestimonialsPage } from "@/features/portfolio/admin/components/section-pages";
import { testimonialSection } from "@/features/portfolio/admin/queries";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { staticCrumb } from "@/lib/breadcrumbs";
import { titleHead } from "@/lib/crud/route";
import { ensureQuery } from "@/lib/query";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/portfolio/testimonials")({
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "portfolio:read"),
	loader: ({ context }) => ensureQuery(context.queryClient, testimonialSection.list()),
	staticData: { breadcrumb: staticCrumb(m.portfolio_admin_testimonials_title) },
	head: titleHead(m.portfolio_admin_testimonials_title),
	component: TestimonialsPage,
});
