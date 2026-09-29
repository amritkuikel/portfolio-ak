import type { ReactElement } from "react";
import { m } from "@/paraglide/messages";
import {
	EmailChanged,
	type EmailChangedProps,
	OtpCode,
	type OtpCodeProps,
	PasswordReset,
	type PasswordResetProps,
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
};

export const EMAIL_TEMPLATE_IDS = Object.keys(emailTemplates) as EmailTemplateId[];
