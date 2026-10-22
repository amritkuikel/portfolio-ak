import { createFileRoute } from "@tanstack/react-router";
import { PortfolioHome } from "@/features/portfolio/components/pages/home-page";
import { personId, personJsonLd } from "@/features/portfolio/lib/structured-data";
import { homeQueryOptions, profileQueryOptions } from "@/features/portfolio/queries";
import { ensureQuery } from "@/lib/query";
import { seo } from "@/lib/seo";
import { websiteJsonLd } from "@/lib/structured-data";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/")({
	// The whole story in one round trip (getHome), next to the layout's profile.
	loader: async ({ context: { queryClient } }) => {
		const [profile] = await Promise.all([
			ensureQuery(queryClient, profileQueryOptions()),
			ensureQuery(queryClient, homeQueryOptions()),
		]);
		// Only what head() needs: the profile's SEO defaults, or its name and intro.
		return {
			name: profile.name,
			role: profile.role,
			intro: profile.intro,
			socials: profile.socials.map((social) => social.href),
			seo: profile.seo,
		};
	},
	head: ({ loaderData }) =>
		loaderData
			? seo({
					title: loaderData.seo.title || m.portfolio_home_title({ name: loaderData.name, role: loaderData.role }),
					description: loaderData.seo.description || loaderData.intro,
					path: "/",
					...(loaderData.seo.image
						? { image: { url: loaderData.seo.image.og, width: 1200, height: 630, alt: loaderData.name } }
						: {}),
					// The site's home: the WebSite, run by its owner, and the owner.
					jsonLd: [
						websiteJsonLd(loaderData.intro, personId()),
						personJsonLd({
							name: loaderData.name,
							role: loaderData.role,
							description: loaderData.intro,
							socials: loaderData.socials,
						}),
					],
				})
			: {},
	component: PortfolioHome,
});
