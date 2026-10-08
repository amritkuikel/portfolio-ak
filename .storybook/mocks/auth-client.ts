import { fn } from "storybook/test";

type Result = { data: unknown; error: { code?: string; message?: string; status?: number } | null };
const ok = async (): Promise<Result> => ({ data: {}, error: null });

/**
 * Stand-in for src/lib/auth-client.ts (Better Auth). No network: every call
 * resolves locally. signIn.email rejects "wrong@example.com" so stories can show
 * the error path.
 */
export const authClient = {
	signIn: {
		email: fn(
			async ({ email }: { email: string; password: string }): Promise<Result> =>
				email === "wrong@example.com"
					? { data: null, error: { code: "INVALID_EMAIL_OR_PASSWORD", status: 401 } }
					: { data: {}, error: null },
		).mockName("authClient.signIn.email"),
		emailOtp: fn(ok).mockName("authClient.signIn.emailOtp"),
		social: fn(ok).mockName("authClient.signIn.social"),
	},
	signUp: { email: fn(ok).mockName("authClient.signUp.email") },
	signOut: fn(ok).mockName("authClient.signOut"),
	emailOtp: { sendVerificationOtp: fn(ok).mockName("authClient.emailOtp.sendVerificationOtp") },
	sendVerificationEmail: fn(ok).mockName("authClient.sendVerificationEmail"),
	requestPasswordReset: fn(ok).mockName("authClient.requestPasswordReset"),
	resetPassword: fn(ok).mockName("authClient.resetPassword"),
	changeEmail: fn(ok).mockName("authClient.changeEmail"),
	changePassword: fn(ok).mockName("authClient.changePassword"),
	updateUser: fn(ok).mockName("authClient.updateUser"),
	revokeSession: fn(ok).mockName("authClient.revokeSession"),
	revokeOtherSessions: fn(ok).mockName("authClient.revokeOtherSessions"),
};
