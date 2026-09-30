import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthField, FormMessage } from "@/features/auth/components/auth-field";
import { GoogleButton } from "@/features/auth/components/google-button";
import { authErrorMessage } from "@/features/auth/errors";
import { authFeaturesQueryOptions } from "@/features/auth/queries";
import { useAuthNavigation } from "@/features/auth/use-auth-actions";
import { collectErrors, type FieldErrors, field, validateEmail, validateRequired } from "@/features/auth/validation";
import { authClient } from "@/lib/auth-client";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_auth/login")({
	loader: ({ context }) => context.queryClient.ensureQueryData(authFeaturesQueryOptions()),
	head: () => ({ meta: [{ title: pageTitle(m.auth_login_title()) }] }),
	component: LoginPage,
});

function LoginPage() {
	const search = Route.useSearch();
	const features = Route.useLoaderData();
	const { afterSignIn } = useAuthNavigation();
	const [errors, setErrors] = useState<FieldErrors<"email" | "password">>({});
	const [formError, setFormError] = useState<string>();
	const [pending, setPending] = useState(false);
	const target = search.redirect ?? "/account";

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
		await afterSignIn(target);
	};

	return (
		<>
			<h1 className="font-semibold text-2xl tracking-tight">{m.auth_login_title()}</h1>
			<form noValidate onSubmit={onSubmit} className="flex flex-col gap-4" data-testid="login-form">
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
			<div className="flex flex-col gap-2 text-sm">
				<Link to="/forgot-password" className="underline underline-offset-4">
					{m.auth_forgot_link()}
				</Link>
				<Link to="/sign-in-code" search={search} className="underline underline-offset-4">
					{m.auth_otp_link()}
				</Link>
			</div>
			{features.google ? (
				<>
					<p className="text-center text-muted-foreground text-sm">{m.auth_or()}</p>
					<GoogleButton redirectTo={target} />
				</>
			) : null}
			<p className="text-sm">
				{m.auth_no_account()}{" "}
				<Link to="/register" search={search} className="font-medium underline underline-offset-4">
					{m.auth_register_title()}
				</Link>
			</p>
		</>
	);
}
