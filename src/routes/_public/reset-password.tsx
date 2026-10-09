import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthField, FormMessage } from "@/features/auth/components/auth-field";
import { authErrorMessage } from "@/features/auth/errors";
import { collectErrors, type FieldErrors, field, validateConfirm, validatePassword } from "@/features/auth/validation";
import { authClient } from "@/lib/auth-client";
import { privateHead } from "@/lib/seo";
import { m } from "@/paraglide/messages";

/**
 * Target of the emailed reset link. Better Auth validates the token and redirects
 * here with ?token=…, or with ?error=INVALID_TOKEN when it's invalid or expired.
 */
export const Route = createFileRoute("/_public/reset-password")({
	validateSearch: z.object({
		token: z.string().max(512).optional().catch(undefined),
		error: z.string().max(64).optional().catch(undefined),
	}),
	head: () => privateHead(m.auth_reset_title()),
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const { token, error } = Route.useSearch();
	const [errors, setErrors] = useState<FieldErrors<"password" | "confirm">>({});
	const [formError, setFormError] = useState<string>();
	const [done, setDone] = useState(false);
	const [pending, setPending] = useState(false);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!token) return;
		const form = new FormData(event.currentTarget);
		const password = field(form, "password");
		const invalid = collectErrors({
			password: validatePassword(password),
			confirm: validateConfirm(password, field(form, "confirm")),
		});
		setErrors(invalid ?? {});
		setFormError(undefined);
		if (invalid) return;

		setPending(true);
		const { error: failure } = await authClient.resetPassword({ newPassword: password, token });
		setPending(false);
		if (failure) {
			setFormError(authErrorMessage(failure));
			return;
		}
		setDone(true);
	};

	return (
		<main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-16" data-testid="reset-password-page">
			<h1 className="font-semibold text-2xl tracking-tight">{m.auth_reset_title()}</h1>
			{done ? (
				<>
					<FormMessage tone="success">{m.auth_reset_success()}</FormMessage>
					<Button asChild>
						<Link to="/login">{m.auth_submit_login()}</Link>
					</Button>
				</>
			) : error || !token ? (
				<>
					<FormMessage tone="error">{m.auth_reset_invalid()}</FormMessage>
					<Link to="/forgot-password" className="text-sm underline underline-offset-4">
						{m.auth_forgot_submit()}
					</Link>
				</>
			) : (
				<form method="post" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
					{formError ? <FormMessage tone="error">{formError}</FormMessage> : null}
					<AuthField
						name="password"
						type="password"
						autoComplete="new-password"
						label={m.auth_new_password_label()}
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
					<Button type="submit" disabled={pending}>
						{pending ? m.auth_submitting() : m.auth_reset_submit()}
					</Button>
				</form>
			)}
		</main>
	);
}
