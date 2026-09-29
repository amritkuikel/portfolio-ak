import "@tanstack/react-start/server-only";

export type DbHealth =
	| { status: "ok"; latencyMs: number; checkedAt: string }
	| { status: "error"; latencyMs: number; checkedAt: string };

/**
 * Runs a trivial query and times it. Failures are logged on the server and
 * reported as `status: "error"` without details, so connection strings,
 * hostnames and driver errors never reach the client.
 */
export const checkDatabaseHealth = async (
	ping: () => Promise<unknown>,
	now: () => number = () => performance.now(),
): Promise<DbHealth> => {
	const started = now();
	const checkedAt = new Date().toISOString();
	try {
		await ping();
		return { status: "ok", latencyMs: Math.round(now() - started), checkedAt };
	} catch (error) {
		// Drizzle wraps driver errors ("Failed query: ..."); the useful reason is on `cause`.
		const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : undefined;
		console.error("[db] health check failed:", error instanceof Error ? error.message : error, cause ?? "");
		return { status: "error", latencyMs: Math.round(now() - started), checkedAt };
	}
};
