import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import type { Project } from "../../types";
import { ArrowLink } from "../primitives/arrow-link";
import { CoverArt } from "../primitives/cover-art";
import { CoverFrame } from "../primitives/cover-frame";
import { Display } from "../primitives/display";
import { formatIndex } from "../primitives/eyebrow";

type CaseStudyHeroProps = {
	project: Pick<Project, "slug" | "title" | "client" | "year" | "summary" | "cover">;
	index: number;
	total: number;
};

/**
 * The opening of a case study: the title set huge, the hook, and the cover
 * the reader clicked, morphing in from the card (same transition name).
 */
export function CaseStudyHero({ project, index, total }: CaseStudyHeroProps) {
	return (
		<header className="pt-[clamp(2.5rem,6vw,5rem)]">
			<div className="pf-container pf-grid gap-y-8">
				<div className="col-span-4 flex flex-wrap items-center justify-between gap-4 md:col-span-12">
					<ArrowLink to="/work" direction="left" className="pf-label font-normal text-pf-ink-2">
						{m.portfolio_case_back()}
					</ArrowLink>
					<p className="pf-label text-pf-stone">
						{m.portfolio_case_index({ index: formatIndex(index), total: formatIndex(total) })}
					</p>
				</div>
				<p className="pf-label col-span-4 text-pf-accent md:col-span-12">
					{project.client}, {formatNumber(project.year, { useGrouping: false })}
				</p>
				<Display as="h1" id="case-title" size="hero" className="col-span-4 md:col-span-12">
					{project.title}
				</Display>
				<p className="col-span-4 text-pf-lead text-pf-ink-2 md:col-span-7 md:col-start-6">{project.summary}</p>
			</div>
			<div className="pf-container mt-[clamp(3rem,7vw,6rem)]">
				<CoverFrame transitionSlug={project.slug} aspect="wide">
					<div className="pf-parallax h-full w-full">
						<CoverArt seed={project.slug} motif={project.cover.motif} glyph={project.cover.glyph} ratio="wide" />
					</div>
				</CoverFrame>
			</div>
		</header>
	);
}
