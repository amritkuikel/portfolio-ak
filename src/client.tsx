// Zod must be in jitless mode before any schema runs (CSP: no eval); then Sentry.
import "./lib/zod-config";
import "./instrument.client";

import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

/** Custom client entry (TanStack Start's default plus the Sentry import above). */
startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<StartClient />
		</StrictMode>,
	);
});
