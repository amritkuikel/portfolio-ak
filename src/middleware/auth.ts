import { createMiddleware } from "@tanstack/react-start";
import { canEnterAdmin, hasAll, type Permission } from "@/features/rbac/permissions";
import { AppError, ruleError } from "@/lib/errors";
import type { Session } from "@/lib/session";
import { m } from "@/paraglide/messages";

/**
 * The session for the current request, from Better Auth, with the user's
 * permissions resolved from the database (once per request: each server
 * function call is one request and runs this once). Loaded with a dynamic
 * import inside `.server()` so this file (which client code reaches through
 * server function modules) never pulls src/server/** into the client bundle.
 */
export const resolveSession = async (): Promise<Session | null> => {
	const { getServerSession } = await import("@/server/auth/session");
	return getServerSession();
};

/** Adds `context.session` (Session | null). Does not reject anonymous calls. */
export const sessionMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) =>
	next({ context: { session: await resolveSession() } }),
);

/**
 * Rejects anonymous calls with UNAUTHORIZED; adds `context.user`, `context.permissions`,
 * `context.twoFactorRequired` (admin permissions held back until 2FA is on, 0126) and
 * `context.impersonatedBy` (the admin behind an impersonated session, or null; 0134).
 */
export const requireUserMiddleware = createMiddleware({ type: "function" })
	.middleware([sessionMiddleware])
	.server(({ next, context }) => {
		if (!context.session) throw new AppError("UNAUTHORIZED", "Authentication required");
		return next({
			context: {
				user: context.session.user,
				permissions: context.session.permissions,
				twoFactorRequired: context.session.twoFactorRequired === true,
				impersonatedBy: context.session.impersonatedBy ?? null,
			},
		});
	});

/**
 * For changes only the account's owner may make (password, signing out devices):
 * refused with FORBIDDEN in an impersonated session. Better Auth's own account
 * endpoints are refused the same way by a hook (src/server/auth/hooks.ts).
 */
export const requireAccountOwnerMiddleware = createMiddleware({ type: "function" })
	.middleware([requireUserMiddleware])
	.server(({ next, context }) => {
		if (context.impersonatedBy) {
			throw ruleError("FORBIDDEN", "Account change while impersonating", m.auth_error_impersonating());
		}
		return next();
	});

/**
 * Rejects calls from users missing ANY of `required` with FORBIDDEN (anonymous:
 * UNAUTHORIZED). Runs on the server for every call, so roles changed a moment
 * ago apply at once and nothing in the UI can bypass it.
 *
 *   createServerFn({ method: "POST" }).middleware([requirePermission("test-crud:delete")])
 */
export const requirePermission = (...required: [Permission, ...Permission[]]) =>
	createMiddleware({ type: "function" })
		.middleware([requireUserMiddleware])
		.server(({ next, context }) => {
			if (!hasAll(context.permissions, required)) {
				throw new AppError("FORBIDDEN", `Missing permission: ${required.join(", ")}`);
			}
			return next();
		});

/**
 * The admin area's gate: any admin permission is enough (pages and functions check
 * their own). A user who must set up two-factor first gets FORBIDDEN with the
 * "two-factor-required" reason, which the _admin layout turns into a redirect.
 */
export const requireAdminAccessMiddleware = createMiddleware({ type: "function" })
	.middleware([requireUserMiddleware])
	.server(({ next, context }) => {
		if (context.twoFactorRequired) {
			throw new AppError("FORBIDDEN", "Two-factor authentication required", { reason: "two-factor-required" });
		}
		if (!canEnterAdmin(context.permissions)) throw new AppError("FORBIDDEN", "No admin permissions");
		return next();
	});
