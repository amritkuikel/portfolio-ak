/**
 * Server-only environment. Never import this from client code.
 *
 * Three layers keep it off the client:
 * 1. The marker import below, plus the `src/server/**` rule in vite.config.ts,
 *    makes TanStack Start's import protection fail the build on a client import.
 * 2. The guard below throws if this module is ever evaluated in a browser.
 * 3. tests/server/env-boundary.test.ts scans the source for forbidden imports.
 */
import "@tanstack/react-start/server-only";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { throwEnvError } from "../lib/env.shared.ts";

if (typeof window !== "undefined") {
	throw new Error("src/server/env.ts is server-only and was loaded in a browser. Call a server function instead.");
}

const isEmail = (value: string) => z.email().safeParse(value).success;

/** Accepts `hello@example.com` or `Portfolio <hello@example.com>`. */
const emailFrom = z
	.string({ error: (issue) => (issue.input === undefined ? "Required." : undefined) })
	.trim()
	.refine((value) => {
		const named = /^(.+?)\s*<([^<>]+)>$/.exec(value);
		return named?.[2] ? isEmail(named[2]) : isEmail(value);
	}, "Must be an email address, optionally with a name: 'Portfolio <hello@example.com>'.");

export const serverEnvSchema = {
	DATABASE_URL: z.url({
		protocol: /^postgres(ql)?$/,
		error: (issue) =>
			issue.input === undefined
				? "Required. Set it to your Neon connection string."
				: "Must be a Postgres connection URL (postgresql://user:password@host/db).",
	}),
	EMAIL_PROVIDER: z.enum(["console", "resend"]).optional(),
	RESEND_API_KEY: z.string().trim().startsWith("re_", "Resend API keys start with 're_'.").optional(),
	EMAIL_FROM: emailFrom,
};

export const createServerEnv = (runtimeEnv: Record<string, string | undefined>) =>
	createEnv({
		server: serverEnvSchema,
		runtimeEnv,
		emptyStringAsUndefined: true,
		// Cross-field rule: choosing Resend requires its API key.
		createFinalSchema: (shape) =>
			z.object(shape).superRefine((env, ctx) => {
				if (env.EMAIL_PROVIDER === "resend" && !env.RESEND_API_KEY) {
					ctx.addIssue({
						code: "custom",
						path: ["RESEND_API_KEY"],
						message: "Required when EMAIL_PROVIDER is 'resend'.",
					});
				}
			}),
		onValidationError: throwEnvError("server"),
	});

/** Validated server environment. Validation runs once, when the server starts. */
export const serverEnv = createServerEnv(process.env);
