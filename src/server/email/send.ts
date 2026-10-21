import "@tanstack/react-start/server-only";
import { clientEnv } from "@/lib/env/client";
import type { Locale } from "@/paraglide/runtime";
import { getEmailProvider } from "./config";
import { renderEmail } from "./render";
import type { EmailTemplateData, EmailTemplateId } from "./templates";
import type { EmailProvider, SendResult } from "./types";

export type SendEmailOptions<K extends EmailTemplateId> = {
	to: string;
	template: K;
	data: EmailTemplateData<K>;
	/** The recipient's language (e.g. their saved preference), not necessarily the request's. */
	locale: Locale;
};

/** Renders a localized template and delivers it through the configured provider. */
export const sendEmail = async <K extends EmailTemplateId>(
	options: SendEmailOptions<K>,
	provider: EmailProvider = getEmailProvider(),
): Promise<SendResult> => {
	const email = await renderEmail(options.template, options.data, {
		locale: options.locale,
		siteName: clientEnv.VITE_APP_TITLE,
	});
	return provider.send({ to: options.to, ...email, tag: options.template });
};
