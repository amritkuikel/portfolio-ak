import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthField, FormMessage } from "@/features/auth/components/auth-field";
import { authErrorMessage } from "@/features/auth/errors";
import { useAuthNavigation } from "@/features/auth/use-auth-actions";
import { field, validateEmail, validateOtp } from "@/features/auth/validation";
import { authClient } from "@/lib/auth-client";
import { formatNumber } from "@/lib/intl";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

/** Must match AUTH_LIFETIMES.otpSeconds on the server (src/server/auth/auth.ts). */
const OTP_MINUTES = 5;

export const Route = createFileRoute("/_auth/sign-in-code")({
	head: () => ({ meta: [{ title: pageTitle(m.auth_otp_title()) }] }),
	component: SignInCodePage,
});

function SignInCodePage() {
	const search = Route.useSearch();
	const { afterSignIn } = useAuthNavigation();
	const [email, setEmail] = useState<string>();
	const [error, setError] = useState<string>();
	const [formError, setFormError] = useState<string>();
	const [pending, setPending] = useState(false);

	const sendCode = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const value = field(new FormData(event.currentTarget), "email").trim();
		const invalid = validateEmail(value);
		setError(invalid);
		setFormError(undefined);
		if (invalid) return;

		setPending(true);
		const { error: failure } = await authClient.emailOtp.sendVerificationOtp({ email: value, type: "sign-in" });
		setPending(false);
		// Only rate limiting is surfaced; unknown emails get the same "sent" message (no account enumeration).
		if (failure?.status === 429) {
			setFormError(authErrorMessage(failure));
			return;
		}
		setEmail(value);
	};

	const verify = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!email) return;
		const otp = field(new FormData(event.currentTarget), "otp").trim();
		const invalid = validateOtp(otp);
		setError(invalid);
		setFormError(undefined);
		if (invalid) return;

		setPending(true);
		const { error: failure } = await authClient.signIn.emailOtp({ email, otp });
		setPending(false);
		if (failure) {
			setFormError(authErrorMessage(failure));
			return;
		}
		await afterSignIn(search.redirect ?? "/account");
	};

	return (
		<>
			<h1 className="font-semibold text-2xl tracking-tight">{m.auth_otp_title()}</h1>
			{formError ? <FormMessage tone="error">{formError}</FormMessage> : null}
			{email ? (
				<form noValidate onSubmit={verify} className="flex flex-col gap-4" data-testid="otp-verify-form">
					<FormMessage tone="success">{m.auth_otp_sent({ email, minutes: formatNumber(OTP_MINUTES) })}</FormMessage>
					<AuthField
						name="otp"
						label={m.auth_code_label()}
						inputMode="numeric"
						autoComplete="one-time-code"
						pattern="[0-9]{6}"
						maxLength={6}
						error={error}
					/>
					<Button type="submit" disabled={pending}>
						{pending ? m.auth_submitting() : m.auth_otp_verify()}
					</Button>
					<Button type="button" variant="ghost" onClick={() => setEmail(undefined)}>
						{m.auth_otp_change_email()}
					</Button>
				</form>
			) : (
				<form noValidate onSubmit={sendCode} className="flex flex-col gap-4" data-testid="otp-request-form">
					<p className="text-muted-foreground">{m.auth_otp_intro()}</p>
					<AuthField name="email" type="email" autoComplete="email" label={m.auth_email_label()} error={error} />
					<Button type="submit" disabled={pending}>
						{pending ? m.auth_submitting() : m.auth_otp_send()}
					</Button>
				</form>
			)}
			<Link to="/login" search={search} className="text-sm underline underline-offset-4">
				{m.auth_password_link()}
			</Link>
		</>
	);
}
