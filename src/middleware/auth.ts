import { createMiddleware } from "@tanstack/react-start";
import { AppError } from "@/lib/errors";
import type { Session } from "@/lib/session";

/**
 * The session for the current request, from Better Auth. Loaded with a dynamic
 * import inside `.server()` so this file (which client code reaches through server
 * function modules) never pulls src/server/** into the client bundle.
 */
export const resolveSession = async (): Promise<Session | null> => {
	const { getServerSession } = await import("@/server/auth/session");
	return getServerSession();
};

/** Adds `context.session` (Session | null). Does not reject anonymous calls. */
export const sessionMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) =>
	next({ context: { session: await resolveSession() } }),
);

/** Rejects anonymous calls with UNAUTHORIZED; adds `context.user`. */
export const requireUserMiddleware = createMiddleware({ type: "function" })
	.middleware([sessionMiddleware])
	.server(({ next, context }) => {
		if (!context.session) throw new AppError("UNAUTHORIZED", "Authentication required");
		return next({ context: { user: context.session.user } });
	});

/** Rejects non-admins with FORBIDDEN. Always runs on the server, so it can't be bypassed from the UI. */
export const requireAdminMiddleware = createMiddleware({ type: "function" })
	.middleware([requireUserMiddleware])
	.server(({ next, context }) => {
		if (context.user.role !== "admin") throw new AppError("FORBIDDEN", "Admin role required");
		return next();
	});
