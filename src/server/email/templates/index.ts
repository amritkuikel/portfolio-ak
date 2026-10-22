import type { ReactElement } from "react";
import { m } from "@/paraglide/messages";
import {
	AccountDeleted,
	type AccountDeletedProps,
	ContactMessage, // @portfolio
	type ContactMessageProps, // @portfolio
	DeleteAccount,
	type DeleteAccountProps,
	EmailChanged,
	type EmailChangedProps,
	Invite,
	type InviteProps,
	OtpCode,
	type OtpCodeProps,
	PasswordReset,
	type PasswordResetProps,
	SecurityNotice,
	type SecurityNoticeProps,
	VerifyEmail,
	type VerifyEmailProps,
	Welcome,
	type WelcomeProps,
} from "./emails";
import type { EmailBaseProps } from "./layout";

/** Full props per template (including locale and siteName). */
export interface EmailPropsMap {
	"verify-email": VerifyEmailProps;
	"otp-code": OtpCodeProps;
	"password-reset": PasswordResetProps;
	"email-changed": EmailChangedProps;
	welcome: WelcomeProps;
	invite: InviteProps;
	"delete-account": DeleteAccountProps;
	"account-deleted": AccountDeletedProps;
	"security-notice": SecurityNoticeProps;
	"contact-message": ContactMessageProps; // @portfolio
}

export type EmailTemplateId = keyof EmailPropsMap;

/** What callers pass: everything except the shared locale/siteName. */
export type EmailTemplateData<K extends EmailTemplateId> = Omit<EmailPropsMap[K], keyof EmailBaseProps>;

export type EmailTemplate<P extends EmailBaseProps> = {
	component: (props: P) => ReactElement;
	subject: (props: P) => string;
	/** Sample data for the dev preview and tests. */
	sample: Omit<P, keyof EmailBaseProps>;
};

// A mapped type keeps each template's props correlated with its id, so callers of
// renderEmail(id, data) / sendEmail() must pass exactly that template's data.
type EmailRegistry = { [K in EmailTemplateId]: EmailTemplate<EmailPropsMap[K]> };

export const emailTemplates: EmailRegistry = {
	"verify-email": {
		component: VerifyEmail,
		subject: ({ locale, siteName }) => m.email_verify_subject({ site: siteName }, { locale }),
		sample: { name: "Sita Sharma", url: "https://example.com/verify?token=sample", expiresInMinutes: 60 },
	},
	"otp-code": {
		component: OtpCode,
		subject: ({ locale, siteName }) => m.email_otp_subject({ site: siteName }, { locale }),
		sample: { name: "Sita Sharma", code: "482913", expiresInMinutes: 5 },
	},
	"password-reset": {
		component: PasswordReset,
		subject: ({ locale, siteName }) => m.email_reset_subject({ site: siteName }, { locale }),
		sample: { name: "Sita Sharma", url: "https://example.com/reset?token=sample", expiresInMinutes: 30 },
	},
	"email-changed": {
		component: EmailChanged,
		subject: ({ locale, siteName }) => m.email_changed_subject({ site: siteName }, { locale }),
		sample: { name: "Sita Sharma", newEmail: "sita.new@example.com", url: "https://example.com/account" },
	},
	welcome: {
		component: Welcome,
		subject: ({ locale, siteName }) => m.email_welcome_subject({ site: siteName }, { locale }),
		sample: { name: "Sita Sharma", url: "https://example.com/account" },
	},
	invite: {
		component: Invite,
		subject: ({ locale, siteName }) => m.email_invite_subject({ site: siteName }, { locale }),
		sample: {
			name: "Sita Sharma",
			inviter: "Ram Thapa",
			url: "https://example.com/reset-password?token=sample&invite=1",
			expiresInDays: 3,
		},
	},
	"delete-account": {
		component: DeleteAccount,
		subject: ({ locale, siteName }) => m.email_delete_subject({ site: siteName }, { locale }),
		sample: { name: "Sita Sharma", url: "https://example.com/account/delete?token=sample", expiresInMinutes: 60 },
	},
	"account-deleted": {
		component: AccountDeleted,
		subject: ({ locale, siteName }) => m.email_deleted_subject({ site: siteName }, { locale }),
		sample: { name: "Sita Sharma" },
	},
	"security-notice": {
		component: SecurityNotice,
		subject: ({ locale, siteName }) => m.email_notice_subject({ site: siteName }, { locale }),
		sample: { name: "Sita Sharma", kind: "two-factor-enabled", url: "https://example.com/account" },
	},
	// portfolio:start
	"contact-message": {
		component: ContactMessage,
		subject: ({ locale, siteName, name }) => m.email_contact_subject({ name, site: siteName }, { locale }),
		sample: {
			name: "Sita Sharma",
			email: "sita@example.com",
			message: "Namaste! We are planning a bilingual booking site for our trekking agency.\n\nCould we talk next week?",
			url: "https://example.com/admin/portfolio/messages",
		},
	},
	// portfolio:end
};

export const EMAIL_TEMPLATE_IDS = Object.keys(emailTemplates) as EmailTemplateId[];
