import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteFooter } from "@/components/layout/site-footer";
import { staticCrumb } from "@/lib/breadcrumbs";
import { fontPreloads } from "@/lib/fonts";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

/** Public pages: anyone can view them. Adds the site footer and the "Home" breadcrumb. */
export const Route = createFileRoute("/_public")({
	staticData: { breadcrumb: staticCrumb(m.nav_home) },
	// Each section preloads the fonts it renders first (the portfolio has its own).
	head: () => ({ links: fontPreloads(getLocale()) }),
	component: PublicLayout,
});

function PublicLayout() {
	return (
		<>
			<div className="flex-1">
				<Outlet />
			</div>
			<SiteFooter />
		</>
	);
}
