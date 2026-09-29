import { Heading, Text } from "react-email";
import { formatNumber } from "@/lib/intl";
import { m } from "@/paraglide/messages";
import { ActionButton, type EmailBaseProps, EmailLayout, Greeting, styles } from "./layout";

type WithName = { name?: string | undefined };
type WithUrl = { url: string };
type WithExpiry = { expiresInMinutes: number };

export type VerifyEmailProps = EmailBaseProps & WithName & WithUrl & WithExpiry;
export type OtpCodeProps = EmailBaseProps & WithName & WithExpiry & { code: string };
export type PasswordResetProps = EmailBaseProps & WithName & WithUrl & WithExpiry;
export type EmailChangedProps = EmailBaseProps & WithName & WithUrl & { newEmail: string };
export type WelcomeProps = EmailBaseProps & WithUrl & { name: string };

const minutes = (value: number, locale: EmailBaseProps["locale"]) => formatNumber(value, {}, locale);

export function VerifyEmail({ locale, siteName, name, url, expiresInMinutes }: VerifyEmailProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={m.email_verify_preview({}, { locale })}>
			<Greeting locale={locale} name={name} />
			<Text style={styles.text}>{m.email_verify_body({}, { locale })}</Text>
			<ActionButton locale={locale} href={url} label={m.email_verify_button({}, { locale })} />
			<Text style={styles.muted}>
				{m.email_link_expires({ minutes: minutes(expiresInMinutes, locale) }, { locale })}
			</Text>
		</EmailLayout>
	);
}

export function OtpCode({ locale, siteName, name, code, expiresInMinutes }: OtpCodeProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={m.email_otp_preview({}, { locale })}>
			<Greeting locale={locale} name={name} />
			<Text style={styles.text}>{m.email_otp_body({ minutes: minutes(expiresInMinutes, locale) }, { locale })}</Text>
			{/* Digits stay Latin: codes are typed on keyboards that may not have Devanagari numerals. */}
			<Text style={styles.code} data-testid="otp-code">
				{code}
			</Text>
			<Text style={styles.muted}>{m.email_otp_warning({}, { locale })}</Text>
		</EmailLayout>
	);
}

export function PasswordReset({ locale, siteName, name, url, expiresInMinutes }: PasswordResetProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={m.email_reset_preview({}, { locale })}>
			<Greeting locale={locale} name={name} />
			<Text style={styles.text}>{m.email_reset_body({}, { locale })}</Text>
			<ActionButton locale={locale} href={url} label={m.email_reset_button({}, { locale })} />
			<Text style={styles.muted}>
				{m.email_link_expires({ minutes: minutes(expiresInMinutes, locale) }, { locale })}
			</Text>
			<Text style={styles.muted}>{m.email_reset_ignore({}, { locale })}</Text>
		</EmailLayout>
	);
}

export function EmailChanged({ locale, siteName, name, url, newEmail }: EmailChangedProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={m.email_changed_preview({}, { locale })}>
			<Greeting locale={locale} name={name} />
			<Text style={styles.text}>{m.email_changed_body({ email: newEmail }, { locale })}</Text>
			<Text style={styles.text}>{m.email_changed_warning({}, { locale })}</Text>
			<ActionButton locale={locale} href={url} label={m.email_changed_button({}, { locale })} />
		</EmailLayout>
	);
}

export function Welcome({ locale, siteName, name, url }: WelcomeProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={m.email_welcome_preview({}, { locale })}>
			<Heading as="h1" style={styles.heading}>
				{m.email_welcome_heading({ name }, { locale })}
			</Heading>
			<Text style={styles.text}>{m.email_welcome_body({}, { locale })}</Text>
			<ActionButton locale={locale} href={url} label={m.email_welcome_button({}, { locale })} />
		</EmailLayout>
	);
}
