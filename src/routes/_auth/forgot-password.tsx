import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthField, FormMessage } from "@/features/auth/components/auth-field";
import { authErrorMessage } from "@/features/auth/errors";
import { localizedPath } from "@/features/auth/use-auth-actions";
import { field, validateEmail } from "@/features/auth/validation";
import { authClient } from "@/lib/auth-client";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_auth/forgot-password")({
	head: () => ({ meta: [{ title: pageTitle(m.auth_forgot_title()) }] }),
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const [error, setError] = useState<string>();
	const [formError, setFormError] = useState<string>();
	const [sentTo, setSentTo] = useState<string>();
	const [pending, setPending] = useState(false);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const email = field(new FormData(event.currentTarget), "email").trim();
		const invalid = validateEmail(email);
		setError(invalid);
		setFormError(undefined);
		if (invalid) return;

		setPending(true);
		const { error: failure } = await authClient.requestPasswordReset({
			email,
			redirectTo: localizedPath("/reset-password"),
		});
		setPending(false);
		// Same confirmation whether or not the account exists (no enumeration); only rate limits are shown.
		if (failure?.status === 429) {
			setFormError(authErrorMessage(failure));
			return;
		}
		setSentTo(email);
	};

	return (
		<>
			<h1 className="font-semibold text-2xl tracking-tight">{m.auth_forgot_title()}</h1>
			{sentTo ? (
				<FormMessage tone="success">{m.auth_forgot_sent({ email: sentTo })}</FormMessage>
			) : (
				<form noValidate onSubmit={onSubmit} className="flex flex-col gap-4" data-testid="forgot-form">
					<p className="text-muted-foreground">{m.auth_forgot_intro()}</p>
					{formError ? <FormMessage tone="error">{formError}</FormMessage> : null}
					<AuthField name="email" type="email" autoComplete="email" label={m.auth_email_label()} error={error} />
					<Button type="submit" disabled={pending}>
						{pending ? m.auth_submitting() : m.auth_forgot_submit()}
					</Button>
				</form>
			)}
			<Link to="/login" className="text-sm underline underline-offset-4">
				{m.auth_back_to_login()}
			</Link>
		</>
	);
}
