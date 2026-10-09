import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { m } from "@/paraglide/messages";
import { authErrorMessage } from "../errors";
import { collectErrors, type FieldErrors, field, validateEmail, validateRequired } from "../validation";
import { AuthField, FormMessage } from "./auth-field";

/**
 * Email + password sign-in. Validates locally, then calls Better Auth; failures
 * show a localized message, success calls `onSignedIn` (the route navigates).
 */
export function LoginForm({ onSignedIn }: { onSignedIn: () => Promise<void> | void }) {
	const [errors, setErrors] = useState<FieldErrors<"email" | "password">>({});
	const [formError, setFormError] = useState<string>();
	const [pending, setPending] = useState(false);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const email = field(form, "email").trim();
		const password = field(form, "password");
		const invalid = collectErrors({ email: validateEmail(email), password: validateRequired(password) });
		setErrors(invalid ?? {});
		setFormError(undefined);
		if (invalid) return;

		setPending(true);
		const { error } = await authClient.signIn.email({ email, password });
		setPending(false);
		if (error) {
			setFormError(authErrorMessage(error));
			return;
		}
		await onSignedIn();
	};

	return (
		<form method="post" noValidate onSubmit={onSubmit} className="flex flex-col gap-4" data-testid="login-form">
			{formError ? <FormMessage tone="error">{formError}</FormMessage> : null}
			<AuthField name="email" type="email" autoComplete="email" label={m.auth_email_label()} error={errors.email} />
			<AuthField
				name="password"
				type="password"
				autoComplete="current-password"
				label={m.auth_password_label()}
				error={errors.password}
			/>
			<Button type="submit" disabled={pending}>
				{pending ? m.auth_submitting() : m.auth_submit_login()}
			</Button>
		</form>
	);
}
