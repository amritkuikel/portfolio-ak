import { createServerFn } from "@tanstack/react-start";
import type { Session } from "@/lib/session";
import { requireAdminAccessMiddleware, requireUserMiddleware, sessionMiddleware } from "@/middleware/auth";

/** Current session or null. Used by the root route to fill the router context. */
export const getSession = createServerFn({ method: "GET" })
	.middleware([sessionMiddleware])
	.handler(({ context }): Session | null => context.session);

/** Which optional sign-in methods are configured (the Google button depends on this). */
export const getAuthFeatures = createServerFn({ method: "GET" }).handler(async () => {
	const { authFeatures } = await import("@/server/auth/auth");
	return authFeatures;
});

/**
 * Server-side gate for the _admin layout: the user must hold at least one
 * permission. Throws UNAUTHORIZED/FORBIDDEN; permissions come from the database
 * for this request, never from client state.
 */
export const ensureAdminAccess = createServerFn({ method: "GET" })
	.middleware([requireAdminAccessMiddleware])
	.handler(({ context }): Session => ({ user: context.user, permissions: context.permissions }));

export type AccountSession = {
	id: string;
	token: string;
	current: boolean;
	createdAt: string;
	userAgent: string | null;
};

/** The signed-in user's sessions, newest first, for the account page. */
export const listMySessions = createServerFn({ method: "GET" })
	.middleware([requireUserMiddleware])
	.handler(async (): Promise<{ sessions: AccountSession[]; now: string }> => {
		const [{ auth }, { getRequestHeaders }] = await Promise.all([
			import("@/server/auth/auth"),
			import("@tanstack/react-start/server"),
		]);
		const headers = getRequestHeaders();
		const [sessions, current] = await Promise.all([
			auth.api.listSessions({ headers }),
			auth.api.getSession({ headers }),
		]);
		return {
			// Sent with the data so relative times render identically on server and client.
			now: new Date().toISOString(),
			sessions: sessions
				.map((session) => ({
					id: session.id,
					token: session.token,
					current: session.id === current?.session.id,
					createdAt: new Date(session.createdAt).toISOString(),
					userAgent: session.userAgent ?? null,
				}))
				.sort((a, b) => Number(b.current) - Number(a.current) || b.createdAt.localeCompare(a.createdAt)),
		};
	});
