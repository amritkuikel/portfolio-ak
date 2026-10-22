import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/features/portfolio/components/pages/about-page";
import { profilePageJsonLd } from "@/features/portfolio/lib/structured-data";
import { aboutQueryOptions, profileQueryOptions } from "@/features/portfolio/queries";
import { staticCrumb } from "@/lib/breadcrumbs";
import { ensureQuery } from "@/lib/query";
import { seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/about")({
	loader: async ({ context: { queryClient } }) => {
		const [profile] = await Promise.all([
			ensureQuery(queryClient, profileQueryOptions()),
			ensureQuery(queryClient, aboutQueryOptions()),
		]);
		return {
			name: profile.name,
			role: profile.role,
			intro: profile.intro,
			socials: profile.socials.map((social) => social.href),
		};
	},
	staticData: { breadcrumb: staticCrumb(m.portfolio_nav_about) },
	head: ({ loaderData }) =>
		seo({
			title: m.portfolio_about_title(),
			description: m.portfolio_about_description(),
			path: "/about",
			jsonLd: loaderData
				? profilePageJsonLd({
						name: loaderData.name,
						role: loaderData.role,
						description: loaderData.intro,
						socials: loaderData.socials,
					})
				: [],
		}),
	component: AboutPage,
});
