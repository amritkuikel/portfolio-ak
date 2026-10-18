import type { ErrorEvent, EventHint } from "@sentry/tanstackstart-react";
import { clientEnv } from "@/lib/client-env";
import { isAppError } from "@/lib/errors";

/**
 * Shared Sentry options for the browser (src/instrument.client.ts) and the
 * server (src/instrument.server.ts). With no VITE_SENTRY_DSN Sentry is never
 * initialised, so nothing is captured or sent.
 */
export const sentryDsn = clientEnv.VITE_SENTRY_DSN;

/**
 * AppErrors are expected outcomes (4xx) or already reported: unexpected server
 * errors are captured with their original stack in normalizeServerError before
 * they become a generic INTERNAL AppError. Dropping them avoids noise and duplicates.
 */
export const dropExpectedErrors = (event: ErrorEvent, hint: EventHint): ErrorEvent | null => {
	if (isAppError(hint.originalException)) return null;
	// The server SDK still attaches the client IP from the request; we only ever send the user id.
	if (event.user?.ip_address) {
		const { ip_address: _ip, ...user } = event.user;
		return { ...event, user };
	}
	return event;
};

/** Tags a server event with the request it happened in (kept if the event already has one). */
export const tagRequestId = (event: ErrorEvent, requestId: string | undefined): ErrorEvent =>
	requestId && !event.tags?.requestId ? { ...event, tags: { ...event.tags, requestId } } : event;

export const sentryOptions = (dsn: string) => ({
	dsn,
	environment: import.meta.env.MODE,
	// Every trace in development; 10% in production (adjust to your traffic and quota).
	tracesSampleRate: import.meta.env.PROD ? 0.1 : 1,
	// No IP addresses, cookies or request bodies. The user id is set explicitly (ObservabilitySync).
	sendDefaultPii: false,
	beforeSend: dropExpectedErrors,
});
