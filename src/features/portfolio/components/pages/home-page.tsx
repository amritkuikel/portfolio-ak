import { useSuspenseQuery } from "@tanstack/react-query";
import { homeQueryOptions, profileQueryOptions } from "../../queries";
import { CapabilitiesSection } from "../sections/capabilities-section";
import { FinaleSection } from "../sections/finale-section";
import { HeroSection } from "../sections/hero-section";
import { ImpactSection } from "../sections/impact-section";
import { JournalTeaserSection } from "../sections/journal-teaser-section";
import { ManifestoSection } from "../sections/manifesto-section";
import { ProcessSection } from "../sections/process-section";
import { SelectedWorkSection } from "../sections/selected-work-section";
import { VoicesSection } from "../sections/voices-section";

/** `/`: the story, in chapters: who → beliefs → work → craft → process → impact → voices → writing → invitation. */
export function PortfolioHome() {
	const { data: profile } = useSuspenseQuery(profileQueryOptions());
	const { data: home } = useSuspenseQuery(homeQueryOptions());

	return (
		<>
			<HeroSection profile={profile} />
			<ManifestoSection profile={profile} />
			<SelectedWorkSection projects={home.featured} total={home.projectCount} />
			<CapabilitiesSection capabilities={home.skills} toolbox={profile.toolbox} index={3} />
			<ProcessSection steps={home.process} />
			<ImpactSection metrics={profile.impact} />
			<VoicesSection testimonials={home.testimonials} index={6} />
			<JournalTeaserSection posts={home.posts} />
			<FinaleSection profile={profile} />
		</>
	);
}
