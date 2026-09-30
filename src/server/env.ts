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
import { postgresUrl, throwEnvError } from "../lib/env.shared.ts";

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
	// Pooled Neon URL (host contains "-pooler"), used by the app at runtime.
	DATABASE_URL: postgresUrl("Required. Set it to your Neon connection string."),
	// Direct (unpooled) Neon URL for migrations. Optional; falls back to DATABASE_URL.
	DATABASE_URL_UNPOOLED: postgresUrl("").optional(),
	EMAIL_PROVIDER: z.enum(["console", "resend"]).optional(),
	RESEND_API_KEY: z.string().trim().startsWith("re_", "Resend API keys start with 're_'.").optional(),
	EMAIL_FROM: emailFrom,

	// Better Auth. The secret signs sessions and tokens: 32+ random characters,
	// e.g. `openssl rand -base64 32`. Rotating it signs everyone out.
	BETTER_AUTH_SECRET: z
		.string({
			error: (issue) =>
				issue.input === undefined ? "Required. Generate one with: openssl rand -base64 32" : undefined,
		})
		.min(32, "Must be at least 32 characters. Generate one with: openssl rand -base64 32"),
	// Public origin of the app, used for links in emails and OAuth callbacks.
	BETTER_AUTH_URL: z.url({
		protocol: /^https?$/,
		error: (issue) => (issue.input === undefined ? "Required, e.g. http://localhost:3000" : "Must be an http(s) URL."),
	}),
	// Optional Google sign-in. Set both or neither; the button only appears when both are set.
	GOOGLE_CLIENT_ID: z.string().trim().min(1).optional(),
	GOOGLE_CLIENT_SECRET: z.string().trim().min(1).optional(),
	// Optional defaults for `pnpm db:seed-admin` (CLI flags override them).
	ADMIN_EMAIL: z.email().optional(),
	ADMIN_PASSWORD: z.string().min(12, "Use at least 12 characters for the admin password.").optional(),
	ADMIN_NAME: z.string().trim().min(1).optional(),
};

export const createServerEnv = (runtimeEnv: Record<string, string | undefined>) =>
	createEnv({
		server: serverEnvSchema,
		runtimeEnv,
		emptyStringAsUndefined: true,
		// Cross-field rules: Resend needs its key; Google needs both id and secret.
		createFinalSchema: (shape) =>
			z.object(shape).superRefine((env, ctx) => {
				if (Boolean(env.GOOGLE_CLIENT_ID) !== Boolean(env.GOOGLE_CLIENT_SECRET)) {
					ctx.addIssue({
						code: "custom",
						path: [env.GOOGLE_CLIENT_ID ? "GOOGLE_CLIENT_SECRET" : "GOOGLE_CLIENT_ID"],
						message: "Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or neither.",
					});
				}
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
