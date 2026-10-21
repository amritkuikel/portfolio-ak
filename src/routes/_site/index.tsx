import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CapabilitiesSection } from "@/features/portfolio/components/sections/capabilities-section";
import { FinaleSection } from "@/features/portfolio/components/sections/finale-section";
import { HeroSection } from "@/features/portfolio/components/sections/hero-section";
import { ImpactSection } from "@/features/portfolio/components/sections/impact-section";
import { JournalTeaserSection } from "@/features/portfolio/components/sections/journal-teaser-section";
import { ManifestoSection } from "@/features/portfolio/components/sections/manifesto-section";
import { ProcessSection } from "@/features/portfolio/components/sections/process-section";
import { SelectedWorkSection } from "@/features/portfolio/components/sections/selected-work-section";
import { VoicesSection } from "@/features/portfolio/components/sections/voices-section";
import { personId, personJsonLd } from "@/features/portfolio/lib/structured-data";
import {
	capabilitiesQueryOptions,
	postsQueryOptions,
	processQueryOptions,
	profileQueryOptions,
	projectsQueryOptions,
	testimonialsQueryOptions,
} from "@/features/portfolio/queries";
import { seo } from "@/lib/seo";
import { websiteJsonLd } from "@/lib/structured-data";
import { m } from "@/paraglide/messages";

const FEATURED = { featured: true } as const;
const LATEST_POSTS = 3;

export const Route = createFileRoute("/_site/")({
	// Every chapter's data is awaited in parallel, so the story arrives complete in the HTML.
	loader: async ({ context: { queryClient } }) => {
		const [profile] = await Promise.all([
			queryClient.ensureQueryData(profileQueryOptions()),
			queryClient.ensureQueryData(projectsQueryOptions(FEATURED)),
			queryClient.ensureQueryData(projectsQueryOptions()),
			queryClient.ensureQueryData(capabilitiesQueryOptions()),
			queryClient.ensureQueryData(processQueryOptions()),
			queryClient.ensureQueryData(testimonialsQueryOptions()),
			queryClient.ensureQueryData(postsQueryOptions(LATEST_POSTS)),
		]);
		// Only what head() needs.
		return {
			name: profile.name,
			role: profile.role,
			intro: profile.intro,
			socials: profile.socials.map((social) => social.href),
		};
	},
	head: ({ loaderData }) =>
		loaderData
			? seo({
					title: m.portfolio_home_title({ name: loaderData.name, role: loaderData.role }),
					description: loaderData.intro,
					path: "/",
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

/** The story, in chapters: who → beliefs → work → craft → process → impact → voices → writing → invitation. */
function PortfolioHome() {
	const { data: profile } = useSuspenseQuery(profileQueryOptions());
	const { data: featured } = useSuspenseQuery(projectsQueryOptions(FEATURED));
	const { data: allProjects } = useSuspenseQuery(projectsQueryOptions());
	const { data: capabilities } = useSuspenseQuery(capabilitiesQueryOptions());
	const { data: steps } = useSuspenseQuery(processQueryOptions());
	const { data: testimonials } = useSuspenseQuery(testimonialsQueryOptions());
	const { data: posts } = useSuspenseQuery(postsQueryOptions(LATEST_POSTS));

	return (
		<>
			<HeroSection profile={profile} />
			<ManifestoSection profile={profile} />
			<SelectedWorkSection projects={featured} total={allProjects.length} />
			<CapabilitiesSection capabilities={capabilities} toolbox={profile.toolbox} index={3} />
			<ProcessSection steps={steps} />
			<ImpactSection metrics={profile.impact} />
			<VoicesSection testimonials={testimonials} index={6} />
			<JournalTeaserSection posts={posts} />
			<FinaleSection profile={profile} />
		</>
	);
}
