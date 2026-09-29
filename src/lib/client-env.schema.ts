import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { throwEnvError } from "./env.shared.ts";

/**
 * Client (public) environment schema. Every key must start with VITE_,
 * because Vite inlines these values into the browser bundle at build time.
 *
 * Kept separate from client-env.ts so vite.config.ts can validate the same
 * schema at startup, where `import.meta.env` does not exist yet.
 */
export const clientEnvSchema = {
	VITE_APP_TITLE: z
		.string({ error: (issue) => (issue.input === undefined ? "Required. Used in the header and <title>." : undefined) })
		.trim()
		.min(1, "Required. Used in the header and <title>.")
		.max(60),
};

export const createClientEnv = (runtimeEnv: Record<string, string | boolean | number | undefined>) =>
	createEnv({
		clientPrefix: "VITE_",
		client: clientEnvSchema,
		runtimeEnv,
		emptyStringAsUndefined: true,
		onValidationError: throwEnvError("client"),
	});
