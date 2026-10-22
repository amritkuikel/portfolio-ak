import { createFileRoute } from "@tanstack/react-router";
import { authFeaturesQueryOptions } from "@/features/auth/queries";
import { ContactPage } from "@/features/portfolio/components/pages/contact-page";
import { profileQueryOptions } from "@/features/portfolio/queries";
import { staticCrumb } from "@/lib/breadcrumbs";
import { ensureQuery } from "@/lib/query";
import { seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/contact")({
	// The form needs Turnstile's site key (when configured).
	loader: async ({ context: { queryClient } }) => {
		await Promise.all([
			ensureQuery(queryClient, profileQueryOptions()),
			ensureQuery(queryClient, authFeaturesQueryOptions()),
		]);
	},
	staticData: { breadcrumb: staticCrumb(m.portfolio_nav_contact) },
	head: () =>
		seo({
			title: m.portfolio_contact_title(),
			description: m.portfolio_contact_description(),
			path: "/contact",
		}),
	component: ContactPage,
});
