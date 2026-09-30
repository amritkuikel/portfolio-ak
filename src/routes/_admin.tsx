import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ensureAdmin } from "@/functions/auth";
import { isAppError } from "@/lib/errors";
import { setErrorStatus } from "@/lib/http-status";

/**
 * Admin area. The role is checked ON THE SERVER on every navigation (ensureAdmin
 * runs requireAdminMiddleware against the database-backed session), never from
 * cached client state. Anonymous visitors go to /login with a return URL;
 * signed-in non-admins get the localized FORBIDDEN error page. Admin server
 * functions repeat the same middleware check, so the UI can't be bypassed.
 */
export const Route = createFileRoute("/_admin")({
	beforeLoad: async ({ location }) => {
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
	component: Outlet,
});
