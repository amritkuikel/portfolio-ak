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
 * Whether this user must turn on two-factor authentication before using what their
 * permissions allow: the setting is on, they hold an admin permission, and it's off.
 */
export const mustSetUpTwoFactor = (input: {
	required: boolean;
	permissions: ReadonlyArray<string>;
	twoFactorEnabled: boolean;
}): boolean => input.required && !input.twoFactorEnabled && canEnterAdmin(input.permissions);
