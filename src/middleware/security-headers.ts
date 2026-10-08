import { createMiddleware } from "@tanstack/react-start";
import { analyticsHost, analyticsKey } from "@/lib/analytics";
import { clientEnv } from "@/lib/client-env";
import { buildCsp, originOf } from "@/lib/csp";

/** Sentry ingest and PostHog hosts, only when those services are configured. */
const connectOrigins = [
	...new Set(
		[originOf(clientEnv.VITE_SENTRY_DSN), analyticsKey ? originOf(analyticsHost) : null].filter(
			(origin): origin is string => origin !== null,
		),
	),
];

const createNonce = () => {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return btoa(String.fromCharCode(...bytes));
};

/**
 * A fresh CSP nonce per request, passed on as `context.nonce` (the router puts
 * it on Start's inline scripts via ssr.nonce, see src/router.tsx) and sent in
 * the Content-Security-Policy header of HTML responses.
 *
 * Production only: Vite's dev server and the TanStack Devtools inject inline
 * scripts without a nonce. The other security headers are static (Nitro
 * routeRules in vite.config.ts) and apply to every response.
 */
export const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
	const nonce = createNonce();
	const result = await next({ context: { nonce } });
	if (import.meta.env.PROD && result.response.headers.get("content-type")?.includes("text/html")) {
		result.response.headers.set(
			"content-security-policy",
			buildCsp({ nonce, connectOrigins, upgradeInsecureRequests: true }),
		);
	}
	return result;
});
