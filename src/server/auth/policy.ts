import "@tanstack/react-start/server-only";
import { canEnterAdmin } from "@/features/rbac/permissions";

/**
 * Auth rules that don't depend on Better Auth itself, kept apart so tests can
 * check them without building an auth instance (decisions.md 0126–0128).
 */

/** Endpoints where a new password is chosen; each one is checked against Have I Been Pwned. */
export const BREACHED_PASSWORD_PATHS = ["/sign-up/email", "/change-password", "/reset-password"] as const;

/**
 * Endpoints that need a Turnstile token when it's configured: the ones that create an
 * account or send an email to an address anyone can type in. Password sign-in is
 * rate limited instead (a captcha there costs every user, every time).
 */
export const CAPTCHA_PATHS = ["/sign-up/email", "/request-password-reset", "/email-otp/send-verification-otp"] as const;

/**
 * Better Auth endpoints that change how an account signs in, or delete it. An
 * impersonated session can't call them (decisions.md 0134): an admin viewing the
 * app as someone must not take over or delete their account. Entries ending in
 * "/" are prefixes.
 */
export const OWNER_ONLY_PATHS = [
	"/change-password",
	"/change-email",
	"/update-user",
	"/delete-user",
	"/link-social",
	"/unlink-account",
	"/revoke-session",
	"/revoke-sessions",
	"/revoke-other-sessions",
	"/two-factor/",
] as const;

export const isOwnerOnlyPath = (path: string) =>
	OWNER_ONLY_PATHS.some((entry) =>
		entry.endsWith("/") ? path.startsWith(entry) : path === entry || path.startsWith(`${entry}/`),
	);

/**
 * Whether this user must turn on two-factor authentication before using what their
 * permissions allow: the setting is on, they hold an admin permission, and it's off.
 */
export const mustSetUpTwoFactor = (input: {
	required: boolean;
	permissions: ReadonlyArray<string>;
	twoFactorEnabled: boolean;
}): boolean => input.required && !input.twoFactorEnabled && canEnterAdmin(input.permissions);
