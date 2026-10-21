import { Link } from "@tanstack/react-router";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { cn } from "../../lib/cn";
import { DISCIPLINE_LABELS } from "../../lib/labels";
import type { ProjectSummary } from "../../types";
import { ArrowLink } from "../primitives/arrow-link";
import { CoverArt } from "../primitives/cover-art";
import { CoverFrame } from "../primitives/cover-frame";
import { Reveal } from "../primitives/reveal";

type ProjectCardProps = {
	project: ProjectSummary;
	/** 1-based position, shown as a large numeral. */
	index: number;
	/** Mirror the layout (cover on the right) for an alternating rhythm. */
	flip?: boolean;
};

/**
 * A featured project on the home page: a large cover and the story's hook.
 * The title is the link; the cover repeats it for pointer users only (hidden
 * from assistive technology and the tab order), so each card is one stop.
 */
export function ProjectCard({ project, index, flip = false }: ProjectCardProps) {
	const titleId = `project-${project.slug}`;
	return (
		<article aria-labelledby={titleId} className="pf-grid items-end gap-y-8">
			<Reveal className={cn("col-span-4 md:col-span-7", flip && "md:order-2 md:col-start-6")}>
				<Link
					to="/work/$slug"
					params={{ slug: project.slug }}
					viewTransition
					tabIndex={-1}
					aria-hidden
					className="block"
				>
					<CoverFrame transitionSlug={project.slug} aspect={index % 2 === 0 ? "portrait" : "landscape"} zoom>
						<CoverArt
							seed={project.slug}
							motif={project.cover.motif}
							glyph={project.cover.glyph}
							ratio={index % 2 === 0 ? "portrait" : "landscape"}
						/>
					</CoverFrame>
				</Link>
			</Reveal>
			<div className={cn("col-span-4 md:col-span-4 md:pb-4", flip ? "md:order-1 md:col-start-1" : "md:col-start-9")}>
				<p className="pf-label mb-4 text-pf-stone">
					{project.client}, {formatNumber(project.year, { useGrouping: false })}
				</p>
				<h3 id={titleId} className="pf-display text-pf-h2">
					<Link to="/work/$slug" params={{ slug: project.slug }} viewTransition className="pf-focus pf-link">
						{project.title}
					</Link>
				</h3>
				<p className="mt-5 text-pf-body text-pf-ink-2">{project.summary}</p>
				<p className="pf-label mt-6 text-pf-stone">
					{project.disciplines.map((discipline) => DISCIPLINE_LABELS[discipline]()).join(" / ")}
				</p>
				<ArrowLink to="/work/$slug" params={{ slug: project.slug }} viewTransition className="mt-8">
					{m.portfolio_case_read_short()}
					<span className="sr-only">: {project.title}</span>
				</ArrowLink>
			</div>
		</article>
	);
}
