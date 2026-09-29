import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppError } from "@/lib/errors";

/**
 * Admin area. Anonymous visitors go to /login; signed-in non-admins get a
 * FORBIDDEN error page. This guards navigation only: every admin server
 * function also runs requireAdminMiddleware on the server (Phase 6 makes the
 * session real).
 */
export const Route = createFileRoute("/_admin")({
	beforeLoad: ({ context, location }) => {
		if (!context.session) {
			throw redirect({ to: "/login", search: { redirect: location.href } });
		}
		if (context.session.user.role !== "admin") {
			throw new AppError("FORBIDDEN", "Admin role required");
		}
		return { session: context.session };
	},
	component: Outlet,
});
