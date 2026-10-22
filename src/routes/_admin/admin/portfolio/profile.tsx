import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/portfolio/admin/components/profile-page";
import { profileQueryOptions } from "@/features/portfolio/admin/queries";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { staticCrumb } from "@/lib/breadcrumbs";
import { loadDetailOr404, titleHead } from "@/lib/crud/route";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/portfolio/profile")({
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "portfolio:read"),
	// The profile, or the 404 page before the portfolio is seeded (pnpm db:seed-portfolio).
	loader: async ({ context }) => {
		await loadDetailOr404(context.queryClient, profileQueryOptions());
	},
	staticData: { breadcrumb: staticCrumb(m.portfolio_admin_profile_title) },
	head: titleHead(m.portfolio_admin_profile_title),
	component: ProfilePage,
});
