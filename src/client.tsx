// Sentry first, so it can instrument everything after it. (Zod is configured by src/lib/zod.ts.)
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
