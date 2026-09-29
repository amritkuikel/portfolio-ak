import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteFooter } from "@/components/layout/site-footer";

/** Public pages: anyone can view them. Adds the site footer. */
export const Route = createFileRoute("/_public")({
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
