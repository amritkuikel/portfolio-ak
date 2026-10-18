import "@tanstack/react-start/server-only";
import { AsyncLocalStorage } from "node:async_hooks";

/**
 * One id per request (docs/decisions.md 0123). The server entry opens it
 * (runWithRequestId) and returns it as `x-request-id`; log lines (src/server/log.ts),
 * server-function errors (AppError.requestId, shown on the error page) and Sentry
 * events (src/instrument.server.ts) read it here. Always generated: an incoming
 * x-request-id is client input and isn't trusted.
 */
export const REQUEST_ID_HEADER = "x-request-id";

const storage = new AsyncLocalStorage<string>();

/** The current request's id; undefined outside a request (scripts, Nitro routes, tests). */
export const currentRequestId = (): string | undefined => storage.getStore();

/** The response with `name: value` set, copied first when its headers are immutable (e.g. Response.redirect). */
const withHeader = (response: Response, name: string, value: string): Response => {
	try {
		response.headers.set(name, value);
		return response;
	} catch {
		const headers = new Headers(response.headers);
		headers.set(name, value);
		return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
	}
};

export const runWithRequestId = async (
	handle: (requestId: string) => Promise<Response>,
	createId: () => string = () => crypto.randomUUID(),
): Promise<Response> => {
	const requestId = createId();
	const response = await storage.run(requestId, () => handle(requestId));
	return withHeader(response, REQUEST_ID_HEADER, requestId);
};
