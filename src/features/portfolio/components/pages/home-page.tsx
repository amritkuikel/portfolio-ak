import { useSuspenseQuery } from "@tanstack/react-query";
import { homeQueryOptions, profileQueryOptions } from "../../queries";
import { ArchivalFigure } from "../primitives/archival-picture";
import { ContactSection } from "../sections/contact-section";
import { HeroSection } from "../sections/hero-section";
import { ImpactSection } from "../sections/impact-section";
import { IntroSection } from "../sections/intro-section";
import { JournalSection } from "../sections/journal-section";
import { ProcessSection } from "../sections/process-section";
import { SelectedWorkSection } from "../sections/selected-work-section";
import { SkillsSection } from "../sections/skills-section";
import { VoicesSection } from "../sections/voices-section";

/**
 * `/`: who and where (the range at this hour) → what they believe → the work
 * → what they work with → how → what came of it → what people say → writing
 * → write to them. Neighbouring sections never share a field of colour.
 */
export function PortfolioHome() {
	const { data: profile } = useSuspenseQuery(profileQueryOptions());
	const { data: home } = useSuspenseQuery(homeQueryOptions());

	return (
		<>
			<HeroSection profile={profile} />
			<IntroSection profile={profile} />
			{/* One picture across the page between the beliefs and the work: Sella's panorama of the Kangchen Glacier. */}
			<div className="hm-field-snow-2 pb-[clamp(3rem,6vw,5rem)]">
				<ArchivalFigure
					picture="kangchenGlacier"
					aspect="2000 / 420"
					phoneAspect="4 / 3"
					position="52% 50%"
					sizes="(min-width: 48rem) 100vw, 200vw"
					className="hm-container"
				/>
			</div>
			<SelectedWorkSection projects={home.featured} total={home.projectCount} />
			<SkillsSection skills={home.skills} toolbox={profile.toolbox} />
			<ProcessSection steps={home.process} />
			<ImpactSection metrics={profile.impact} />
			<VoicesSection testimonials={home.testimonials} />
			<JournalSection posts={home.posts} />
			<ContactSection profile={profile} />
		</>
	);
}
