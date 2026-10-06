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
	VITE_SITE_URL: z
		.url({
			error: (issue) =>
				issue.input === undefined
					? "Required. The public origin, e.g. https://example.com."
					: "Must be an absolute URL, e.g. https://example.com.",
		})
		// Zod runs refinements even after .url() fails, so parse defensively.
		.refine(
			(value) => !URL.canParse(value) || (new URL(value).pathname === "/" && !value.endsWith("/")),
			"Origin only: no path and no trailing slash, e.g. https://example.com.",
		)
		.refine(
			(value) => !URL.canParse(value) || /^https?:$/.test(new URL(value).protocol),
			"Must start with http:// or https://.",
		),
};

export const createClientEnv = (runtimeEnv: Record<string, string | boolean | number | undefined>) =>
	createEnv({
		clientPrefix: "VITE_",
		client: clientEnvSchema,
		runtimeEnv,
		emptyStringAsUndefined: true,
		onValidationError: throwEnvError("client"),
	});
