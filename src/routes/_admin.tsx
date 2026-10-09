import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/admin-sidebar";
import { ensureAdmin } from "@/functions/auth";
import { isAppError } from "@/lib/errors";
import { setErrorStatus } from "@/lib/http-status";

/**
 * Admin area. Entering it (and every SSR request) checks the role ON THE SERVER
 * (ensureAdmin runs requireAdminMiddleware against the database-backed session).
 * Anonymous visitors go to /login with a return URL; signed-in non-admins get
 * the localized FORBIDDEN error page.
 *
 * Navigations inside the area (another admin page, a filter or page change)
 * reuse the session the root route already loaded instead of another round
 * trip: every admin server function runs the same middleware on every call, so
 * a revoked role still gets nothing but FORBIDDEN. See decisions.md 0090.
 */
export const Route = createFileRoute("/_admin")({
	beforeLoad: async ({ location, cause, context }) => {
		const known = context.session;
		if (cause === "stay" && known?.user.role === "admin") return { session: known };
		try {
			return { session: await ensureAdmin() };
		} catch (error) {
			if (isAppError(error) && error.code === "UNAUTHORIZED") {
				throw redirect({ to: "/login", search: { redirect: location.href } });
			}
			// Serve the FORBIDDEN page with a real 403 during SSR.
			await setErrorStatus(error);
			throw error;
		}
	},
	component: AdminShell,
});

function AdminShell() {
	return (
		<AdminLayout>
			<Outlet />
		</AdminLayout>
	);
}
