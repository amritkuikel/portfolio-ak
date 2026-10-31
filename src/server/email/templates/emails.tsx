import { Heading, Link, Section, Text } from "react-email";
import { formatNumber } from "@/lib/i18n/intl";
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
/** An admin invited this person; the link lets them choose a password. */
export type InviteProps = EmailBaseProps & WithName & WithUrl & { inviter: string; expiresInDays: number };

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

export function Invite({ locale, siteName, name, url, inviter, expiresInDays }: InviteProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={m.email_invite_preview({}, { locale })}>
			<Greeting locale={locale} name={name} />
			<Text style={styles.text}>{m.email_invite_body({ inviter, site: siteName }, { locale })}</Text>
			<ActionButton locale={locale} href={url} label={m.email_invite_button({}, { locale })} />
			<Text style={styles.muted}>
				{m.email_invite_expires({ days: formatNumber(expiresInDays, {}, locale) }, { locale })}
			</Text>
			<Text style={styles.muted}>{m.email_invite_ignore({}, { locale })}</Text>
		</EmailLayout>
	);
}

// taskline:start
/** Taskline (decision 0212): an admin invited this address to the team; signing up or in with it joins. */
export type TeamInviteProps = EmailBaseProps &
	WithUrl & { inviter: string; team: string; project?: string | undefined; expiresInDays: number };

export function TeamInvite({ locale, siteName, inviter, team, project, url, expiresInDays }: TeamInviteProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={m.email_team_invite_preview({ team }, { locale })}>
			<Heading as="h1" style={styles.heading}>
				{m.email_team_invite_heading({ team }, { locale })}
			</Heading>
			<Text style={styles.text}>{m.email_team_invite_body({ inviter, team, site: siteName }, { locale })}</Text>
			{project ? <Text style={styles.text}>{m.email_team_invite_project({ project }, { locale })}</Text> : null}
			<ActionButton locale={locale} href={url} label={m.email_team_invite_button({}, { locale })} />
			<Text style={styles.muted}>
				{m.email_team_invite_expires({ days: formatNumber(expiresInDays, {}, locale) }, { locale })}
			</Text>
			<Text style={styles.muted}>{m.email_invite_ignore({}, { locale })}</Text>
		</EmailLayout>
	);
}

/** Taskline (decision 0214): what one change told the recipient about one task, sent at once. */
export type TaskNotificationProps = EmailBaseProps &
	WithUrl & { heading: string; items: string[]; excerpt?: string | undefined; settingsUrl: string };

export function TaskNotification({
	locale,
	siteName,
	heading,
	items,
	excerpt,
	url,
	settingsUrl,
}: TaskNotificationProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={items[0] ?? heading}>
			<Heading as="h1" style={styles.heading}>
				{heading}
			</Heading>
			{items.map((item) => (
				<Text key={item} style={styles.text}>
					{item}
				</Text>
			))}
			{excerpt ? (
				<Text style={{ ...styles.muted, borderLeft: "3px solid #e4e4e7", paddingLeft: "12px" }}>{excerpt}</Text>
			) : null}
			<ActionButton locale={locale} href={url} label={m.email_taskline_open({}, { locale })} />
			<Text style={styles.muted}>
				<Link href={settingsUrl} style={styles.link}>
					{m.email_taskline_settings({}, { locale })}
				</Link>
			</Text>
		</EmailLayout>
	);
}

/** Taskline (decision 0214): the day's unread notifications, from the daily cron. */
export type DailyDigestProps = EmailBaseProps &
	WithUrl & {
		name: string;
		items: { id: string; text: string; title: string; url: string }[];
		more: number;
		settingsUrl: string;
	};

export function DailyDigest({ locale, siteName, name, items, more, url, settingsUrl }: DailyDigestProps) {
	const count = formatNumber(items.length + more, {}, locale);
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={m.email_taskline_digest_preview({ count }, { locale })}>
			<Heading as="h1" style={styles.heading}>
				{m.email_taskline_digest_heading({}, { locale })}
			</Heading>
			<Greeting locale={locale} name={name} />
			<Text style={styles.text}>{m.email_taskline_digest_body({ count }, { locale })}</Text>
			<Section style={{ margin: "0 0 16px" }}>
				{items.map((item) => (
					<Text key={item.id} style={{ ...styles.text, margin: "0 0 12px" }}>
						<Link href={item.url} style={styles.link}>
							{item.text}
						</Link>
						{item.title ? <span style={{ color: "#52525b" }}>{` · ${item.title}`}</span> : null}
					</Text>
				))}
			</Section>
			{more > 0 ? (
				<Text style={styles.muted}>
					{m.email_taskline_digest_more({ count: formatNumber(more, {}, locale) }, { locale })}
				</Text>
			) : null}
			<ActionButton locale={locale} href={url} label={m.email_taskline_inbox({}, { locale })} />
			<Text style={styles.muted}>
				<Link href={settingsUrl} style={styles.link}>
					{m.email_taskline_settings({}, { locale })}
				</Link>
			</Text>
		</EmailLayout>
	);
}
// taskline:end

export type DeleteAccountProps = EmailBaseProps & WithName & WithUrl & WithExpiry;
export type AccountDeletedProps = EmailBaseProps & WithName;

/** Changes to how someone signs in, each told to the account's address. */
export const SECURITY_NOTICE_KINDS = [
	"two-factor-enabled",
	"two-factor-disabled",
	"password-set",
	"google-linked",
	"google-unlinked",
] as const;
export type SecurityNoticeKind = (typeof SECURITY_NOTICE_KINDS)[number];
export type SecurityNoticeProps = EmailBaseProps & WithName & WithUrl & { kind: SecurityNoticeKind };

export function DeleteAccount({ locale, siteName, name, url, expiresInMinutes }: DeleteAccountProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={m.email_delete_preview({}, { locale })}>
			<Greeting locale={locale} name={name} />
			<Text style={styles.text}>{m.email_delete_body({}, { locale })}</Text>
			<ActionButton locale={locale} href={url} label={m.email_delete_button({}, { locale })} />
			<Text style={styles.muted}>
				{m.email_link_expires({ minutes: minutes(expiresInMinutes, locale) }, { locale })}
			</Text>
			<Text style={styles.muted}>{m.email_delete_ignore({}, { locale })}</Text>
		</EmailLayout>
	);
}

export function AccountDeleted({ locale, siteName, name }: AccountDeletedProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={m.email_deleted_preview({}, { locale })}>
			<Greeting locale={locale} name={name} />
			<Text style={styles.text}>{m.email_deleted_body({}, { locale })}</Text>
		</EmailLayout>
	);
}

const noticeText = (kind: SecurityNoticeKind, locale: EmailBaseProps["locale"]) => {
	switch (kind) {
		case "two-factor-enabled":
			return m.email_notice_two_factor_enabled({}, { locale });
		case "two-factor-disabled":
			return m.email_notice_two_factor_disabled({}, { locale });
		case "password-set":
			return m.email_notice_password_set({}, { locale });
		case "google-linked":
			return m.email_notice_google_linked({}, { locale });
		case "google-unlinked":
			return m.email_notice_google_unlinked({}, { locale });
	}
};

export function SecurityNotice({ locale, siteName, name, url, kind }: SecurityNoticeProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={noticeText(kind, locale)}>
			<Greeting locale={locale} name={name} />
			<Text style={styles.text}>{noticeText(kind, locale)}</Text>
			<Text style={styles.text}>{m.email_notice_warning({}, { locale })}</Text>
			<ActionButton locale={locale} href={url} label={m.email_changed_button({}, { locale })} />
		</EmailLayout>
	);
}

// portfolio:start
/** A message from the portfolio's contact form, to the owner (decision 0176). */
export type ContactMessageProps = EmailBaseProps & WithUrl & { name: string; email: string; message: string };

export function ContactMessage({ locale, siteName, name, email, message, url }: ContactMessageProps) {
	return (
		<EmailLayout locale={locale} siteName={siteName} preview={m.email_contact_preview({ name }, { locale })}>
			<Heading as="h1" style={styles.heading}>
				{m.email_contact_heading({ name }, { locale })}
			</Heading>
			<Text style={styles.muted}>{m.email_contact_from({ name, email }, { locale })}</Text>
			{message.split(/\n{2,}/).map((paragraph) => (
				<Text key={paragraph} style={{ ...styles.text, whiteSpace: "pre-line" }}>
					{paragraph}
				</Text>
			))}
			<ActionButton locale={locale} href={url} label={m.email_contact_button({}, { locale })} />
			<Text style={styles.muted}>{m.email_contact_reply({ email }, { locale })}</Text>
		</EmailLayout>
	);
}
// portfolio:end
