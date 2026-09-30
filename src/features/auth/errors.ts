import { m } from "@/paraglide/messages";

/** The error shape Better Auth's client returns (errors are values, not throws). */
export type AuthClientError = { code?: string | undefined; status?: number | undefined; message?: string | undefined };

const byCode: Readonly<Record<string, () => string>> = {
	INVALID_EMAIL_OR_PASSWORD: m.auth_error_invalid_credentials,
	INVALID_PASSWORD: m.auth_error_invalid_current_password,
	EMAIL_NOT_VERIFIED: m.auth_error_email_not_verified,
	USER_ALREADY_EXISTS: m.auth_error_user_exists,
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: m.auth_error_user_exists,
	INVALID_EMAIL: m.auth_error_email,
	PASSWORD_TOO_SHORT: m.auth_error_password_length,
	INVALID_OTP: m.auth_error_invalid_code,
	OTP_EXPIRED: m.auth_error_invalid_code,
	TOO_MANY_ATTEMPTS: m.auth_error_too_many_attempts,
	INVALID_TOKEN: m.auth_reset_invalid,
	TOKEN_EXPIRED: m.auth_reset_invalid,
	EMAIL_MISMATCH: m.auth_error_same_email,
	SESSION_NOT_FRESH: m.error_unauthorized,
};

/**
 * Localized text for a Better Auth client error. Unknown codes get a generic
 * message; raw server messages are never shown.
 */
export const authErrorMessage = (error: AuthClientError | null | undefined): string => {
	if (!error) return m.auth_error_generic();
	if (error.status === 429) return m.error_rate_limited();
	const message = error.code ? byCode[error.code] : undefined;
	return message ? message() : m.auth_error_generic();
};
