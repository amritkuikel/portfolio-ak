// Sentry first, so it can instrument everything after it. (Zod is configured by src/lib/zod.ts.)
import "./instrument.client";

import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { isAppError } from "./lib/errors";

/**
 * React logs every error an error boundary catches. Expected app errors
 * (FORBIDDEN, UNAUTHORIZED, NOT_FOUND… anything below 500) are the page's
 * intended outcome, shown as the localized error page, so they aren't logged;
 * everything else is, as React would (and ErrorPage reports it to Sentry).
 */
const onCaughtError = (error: unknown, info: { componentStack?: string | undefined }) => {
	if (isAppError(error) && error.status < 500) return;
	console.error(error, info.componentStack ?? "");
};

/** Custom client entry (TanStack Start's default plus the Sentry import and error filter above). */
startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<StartClient />
		</StrictMode>,
		{ onCaughtError },
	);
});
