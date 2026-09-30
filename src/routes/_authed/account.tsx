import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, type ReactNode, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthField, FormMessage } from "@/features/auth/components/auth-field";
import { authErrorMessage } from "@/features/auth/errors";
import { accountSessionsQueryOptions, authKeys } from "@/features/auth/queries";
import { localizedPath, useAuthNavigation } from "@/features/auth/use-auth-actions";
import { describeUserAgent } from "@/features/auth/user-agent";
import {
	collectErrors,
	type FieldErrors,
	field,
	validateConfirm,
	validateEmail,
	validatePassword,
	validateRequired,
} from "@/features/auth/validation";
import type { AccountSession } from "@/functions/auth";
import { authClient } from "@/lib/auth-client";
import { formatRelativeTimeFrom } from "@/lib/intl";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_authed/account")({
	// ?emailChanged=1 is the callback after confirming a new email address.
	validateSearch: z.object({ emailChanged: z.literal(1).optional().catch(undefined) }),
	loader: ({ context }) => context.queryClient.ensureQueryData(accountSessionsQueryOptions()),
	head: () => ({ meta: [{ title: pageTitle(m.account_title()) }] }),
	component: AccountPage,
});

type Status = { tone: "error" | "success"; text: string } | undefined;

function AccountPage() {
	const { session } = Route.useRouteContext();
	const { emailChanged } = Route.useSearch();
	const { signOut } = useAuthNavigation();

	return (
		<main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12" data-testid="account-page">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">{m.account_title()}</h1>
					<p className="text-muted-foreground" data-testid="account-email">
						{session.user.email}
					</p>
				</div>
				<Button type="button" variant="outline" onClick={signOut}>
					{m.nav_logout()}
				</Button>
			</div>
			{emailChanged ? <FormMessage tone="success">{m.account_email_changed()}</FormMessage> : null}
			<ProfileSection name={session.user.name} />
			<EmailSection email={session.user.email} />
			<PasswordSection />
			<SessionsSection />
		</main>
	);
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<h2>{title}</h2>
				</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent className="flex flex-col gap-4">{children}</CardContent>
		</Card>
	);
}

function ProfileSection({ name }: { name: string }) {
	const { refresh } = useAuthNavigation();
	const [error, setError] = useState<string>();
	const [status, setStatus] = useState<Status>();
	const [pending, setPending] = useState(false);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const value = field(new FormData(event.currentTarget), "name").trim();
		const invalid = validateRequired(value);
		setError(invalid);
		setStatus(undefined);
		if (invalid) return;
		setPending(true);
		const { error: failure } = await authClient.updateUser({ name: value });
		setPending(false);
		if (failure) return setStatus({ tone: "error", text: authErrorMessage(failure) });
		setStatus({ tone: "success", text: m.account_saved() });
		await refresh();
	};

	return (
		<Section title={m.account_profile_title()}>
			<form noValidate onSubmit={onSubmit} className="flex flex-col gap-4" data-testid="profile-form">
				{status ? <FormMessage tone={status.tone}>{status.text}</FormMessage> : null}
				<AuthField name="name" autoComplete="name" defaultValue={name} label={m.auth_name_label()} error={error} />
				<Button type="submit" disabled={pending} className="self-start">
					{m.account_save()}
				</Button>
			</form>
		</Section>
	);
}

function EmailSection({ email }: { email: string }) {
	const [error, setError] = useState<string>();
	const [status, setStatus] = useState<Status>();
	const [pending, setPending] = useState(false);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const newEmail = field(new FormData(event.currentTarget), "newEmail").trim();
		const invalid =
			validateEmail(newEmail) ??
			(newEmail.toLowerCase() === email.toLowerCase() ? m.auth_error_same_email() : undefined);
		setError(invalid);
		setStatus(undefined);
		if (invalid) return;
		setPending(true);
		// The change takes effect when the link sent to the NEW address is opened;
		// the old address then gets a security notice (see auth.ts afterEmailVerification).
		const { error: failure } = await authClient.changeEmail({
			newEmail,
			callbackURL: localizedPath("/account?emailChanged=1"),
		});
		setPending(false);
		if (failure) return setStatus({ tone: "error", text: authErrorMessage(failure) });
		setStatus({ tone: "success", text: m.account_email_sent({ email: newEmail }) });
	};

	return (
		<Section title={m.account_email_title()} description={m.account_email_current({ email })}>
			<form noValidate onSubmit={onSubmit} className="flex flex-col gap-4" data-testid="email-form">
				{status ? <FormMessage tone={status.tone}>{status.text}</FormMessage> : null}
				<AuthField
					name="newEmail"
					type="email"
					autoComplete="email"
					label={m.account_email_new_label()}
					error={error}
				/>
				<Button type="submit" disabled={pending} className="self-start">
					{m.account_email_submit()}
				</Button>
			</form>
		</Section>
	);
}

function PasswordSection() {
	const queryClient = useQueryClient();
	const [errors, setErrors] = useState<FieldErrors<"current" | "password" | "confirm">>({});
	const [status, setStatus] = useState<Status>();
	const [pending, setPending] = useState(false);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formElement = event.currentTarget;
		const form = new FormData(formElement);
		const currentPassword = field(form, "current");
		const newPassword = field(form, "password");
		const invalid = collectErrors({
			current: validateRequired(currentPassword),
			password: validatePassword(newPassword),
			confirm: validateConfirm(newPassword, field(form, "confirm")),
		});
		setErrors(invalid ?? {});
		setStatus(undefined);
		if (invalid) return;
		setPending(true);
		const { error: failure } = await authClient.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: form.get("revokeOthers") === "on",
		});
		setPending(false);
		if (failure) return setStatus({ tone: "error", text: authErrorMessage(failure) });
		formElement.reset();
		setStatus({ tone: "success", text: m.account_password_changed() });
		await queryClient.invalidateQueries({ queryKey: authKeys.sessions });
	};

	return (
		<Section title={m.account_password_title()}>
			<form noValidate onSubmit={onSubmit} className="flex flex-col gap-4" data-testid="password-form">
				{status ? <FormMessage tone={status.tone}>{status.text}</FormMessage> : null}
				<AuthField
					name="current"
					type="password"
					autoComplete="current-password"
					label={m.auth_current_password_label()}
					error={errors.current}
				/>
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
				<label className="flex items-center gap-2 text-sm">
					<input type="checkbox" name="revokeOthers" defaultChecked className="size-4" />
					{m.account_password_revoke_others()}
				</label>
				<Button type="submit" disabled={pending} className="self-start">
					{m.account_password_submit()}
				</Button>
			</form>
		</Section>
	);
}

const deviceLabel = (session: AccountSession) => {
	const { browser, os } = describeUserAgent(session.userAgent);
	if (browser && os) return m.account_session_on({ browser, os });
	return browser ?? os ?? m.account_session_unknown_device();
};

function SessionsSection() {
	const queryClient = useQueryClient();
	const { data } = useSuspenseQuery(accountSessionsQueryOptions());
	const [status, setStatus] = useState<Status>();
	const [pendingToken, setPendingToken] = useState<string>();

	const afterRevoke = async (failure: Parameters<typeof authErrorMessage>[0]) => {
		setPendingToken(undefined);
		if (failure) return setStatus({ tone: "error", text: authErrorMessage(failure) });
		setStatus({ tone: "success", text: m.account_sessions_revoked() });
		await queryClient.invalidateQueries({ queryKey: authKeys.sessions });
	};

	const revoke = async (token: string) => {
		setPendingToken(token);
		const { error } = await authClient.revokeSession({ token });
		await afterRevoke(error);
	};

	const revokeOthers = async () => {
		setPendingToken("others");
		const { error } = await authClient.revokeOtherSessions();
		await afterRevoke(error);
	};

	const others = data.sessions.filter((session) => !session.current);

	return (
		<Section title={m.account_sessions_title()}>
			{status ? <FormMessage tone={status.tone}>{status.text}</FormMessage> : null}
			<ul className="flex flex-col divide-y" data-testid="session-list">
				{data.sessions.map((session) => (
					<li key={session.id} className="flex items-center justify-between gap-4 py-3">
						<div className="text-sm">
							<p className="font-medium">
								{m.account_session_meta({
									device: deviceLabel(session),
									when: formatRelativeTimeFrom(session.createdAt, data.now),
								})}
							</p>
							{session.current ? <p className="text-muted-foreground">{m.account_session_current()}</p> : null}
						</div>
						{session.current ? null : (
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={pendingToken !== undefined}
								onClick={() => revoke(session.token)}
							>
								{m.account_session_revoke()}
							</Button>
						)}
					</li>
				))}
			</ul>
			{others.length > 0 ? (
				<Button
					type="button"
					variant="outline"
					className="self-start"
					disabled={pendingToken !== undefined}
					onClick={revokeOthers}
				>
					{m.account_session_revoke_others()}
				</Button>
			) : null}
		</Section>
	);
}
