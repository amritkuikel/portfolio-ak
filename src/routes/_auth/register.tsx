import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthField, FormMessage } from "@/features/auth/components/auth-field";
import { captchaFetchOptions, Honeypot, isBot, useTurnstile } from "@/features/auth/components/bot-check";
import { CheckEmail } from "@/features/auth/components/check-email";
import { authErrorMessage } from "@/features/auth/errors";
import { authFeaturesQueryOptions } from "@/features/auth/queries";
import { localizedPath } from "@/features/auth/use-auth-actions";
import {
	collectErrors,
	type FieldErrors,
	field,
	validateConfirm,
	validateEmail,
	validatePassword,
	validateRequired,
} from "@/features/auth/validation";
import { authClient } from "@/lib/auth-client";
import { ensureQuery } from "@/lib/query";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_auth/register")({
	// The Turnstile site key, when a captcha is configured.
	loader: ({ context }) => ensureQuery(context.queryClient, authFeaturesQueryOptions()),
	head: () => ({ meta: [{ title: pageTitle(m.auth_register_title()) }] }),
	component: RegisterPage,
});

type Field = "name" | "email" | "password" | "confirm";

function RegisterPage() {
	const search = Route.useSearch();
	const { turnstileSiteKey } = Route.useLoaderData();
	const captcha = useTurnstile(turnstileSiteKey);
	const [errors, setErrors] = useState<FieldErrors<Field>>({});
	const [formError, setFormError] = useState<string>();
	const [pending, setPending] = useState(false);
	const [sentTo, setSentTo] = useState<string>();

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const name = field(form, "name").trim();
		const email = field(form, "email").trim();
		const password = field(form, "password");
		const invalid = collectErrors({
			name: validateRequired(name),
			email: validateEmail(email),
			password: validatePassword(password),
			confirm: validateConfirm(password, field(form, "confirm")),
		});
		setErrors(invalid ?? {});
		setFormError(undefined);
		if (invalid) return;
		// A bot filled the hidden field: look successful, send nothing.
		if (isBot(form)) return setSentTo(email);
		if (!captcha.ready) return setFormError(m.auth_error_captcha());

		setPending(true);
		// Verification is required: no session until the emailed link is opened.
		const { error } = await authClient.signUp.email({
			name,
			email,
			password,
			callbackURL: localizedPath("/verify-email"),
			...captchaFetchOptions(captcha.token),
		});
		setPending(false);
		captcha.reset();
		if (error) {
			setFormError(authErrorMessage(error));
			return;
		}
		setSentTo(email);
	};

	if (sentTo) return <CheckEmail email={sentTo} />;

	return (
		<>
			<h1 className="font-semibold text-2xl tracking-tight">{m.auth_register_title()}</h1>
			<form method="post" noValidate onSubmit={onSubmit} className="flex flex-col gap-4" data-testid="register-form">
				{formError ? <FormMessage tone="error">{formError}</FormMessage> : null}
				<AuthField name="name" autoComplete="name" label={m.auth_name_label()} error={errors.name} />
				<AuthField name="email" type="email" autoComplete="email" label={m.auth_email_label()} error={errors.email} />
				<AuthField
					name="password"
					type="password"
					autoComplete="new-password"
					label={m.auth_password_label()}
					description={m.auth_password_hint()}
					error={errors.password}
				/>
				<AuthField
					name="confirm"
					type="password"
					autoComplete="new-password"
					label={m.auth_confirm_password_label()}
					error={errors.confirm}
				/>
				<Honeypot />
				{captcha.element}
				<Button type="submit" disabled={pending}>
					{pending ? m.auth_submitting() : m.auth_submit_register()}
				</Button>
			</form>
			<p className="text-sm">
				{m.auth_have_account()}{" "}
				<Link to="/login" search={search} className="font-medium underline underline-offset-4">
					{m.auth_login_title()}
				</Link>
			</p>
		</>
	);
}
