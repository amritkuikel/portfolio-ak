import { createMiddleware } from "@tanstack/react-start";

type LogLevel = "info" | "warn" | "error";

/** One JSON line per server function call. Sentry takes over error reporting in Phase 10. */
export const logServerFn = (level: LogLevel, fields: Record<string, unknown>) => {
	const line = JSON.stringify({ level, msg: "server-fn", ...fields });
	if (level === "error") console.error(line);
	else if (level === "warn") console.warn(line);
	else console.info(line);
};

/**
 * Assigns a request id (passed to downstream middleware as context.requestId)
 * and logs the function name, method, duration and outcome of every call.
 */
export const requestLoggingMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next, serverFnMeta, method }) => {
		const requestId = crypto.randomUUID();
		const started = performance.now();
		const base = { fn: serverFnMeta.name, method, requestId };
		try {
			const result = await next({ context: { requestId } });
			logServerFn("info", { ...base, ms: Math.round(performance.now() - started), outcome: "ok" });
			return result;
		} catch (error) {
			const code = error instanceof Error && "code" in error ? String(error.code) : undefined;
			const status = error instanceof Error && "status" in error ? Number(error.status) : undefined;
			logServerFn(status !== undefined && status < 500 ? "warn" : "error", {
				...base,
				ms: Math.round(performance.now() - started),
				outcome: code ?? (error instanceof Error ? error.name : "thrown"),
			});
			throw error;
		}
	},
);
