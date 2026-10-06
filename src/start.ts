import { sentryGlobalRequestMiddleware } from "@sentry/tanstackstart-react";
import { createStart } from "@tanstack/react-start";
import { appErrorSerializationAdapter } from "@/lib/errors";
import { localeFunctionMiddleware } from "@/lib/i18n/locale-middleware";
import { csrfMiddleware } from "@/middleware/csrf";
import { errorNormalizationMiddleware } from "@/middleware/errors";

export const startInstance = createStart(() => ({
	// Runs for every request; the CSRF check itself only applies to server functions.
	// Sentry first so it sees every request (no-op without a DSN). Server-function
	// errors are captured in normalizeServerError instead, with their original stack.
	requestMiddleware: [sentryGlobalRequestMiddleware, csrfMiddleware],
	// Order matters: locale first, then request logging + error normalisation
	// (errorNormalizationMiddleware pulls in requestLoggingMiddleware).
	functionMiddleware: [localeFunctionMiddleware, errorNormalizationMiddleware],
	serializationAdapters: [appErrorSerializationAdapter],
}));
