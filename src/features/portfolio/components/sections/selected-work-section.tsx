import { formatNumber } from "@/lib/intl";
import { m } from "@/paraglide/messages";
import type { ProjectSummary } from "../../types";
import { ArrowLink } from "../primitives/arrow-link";
import { Chapter } from "../primitives/chapter";
import { ProjectCard } from "../work/project-card";

type SelectedWorkSectionProps = {
	projects: ReadonlyArray<ProjectSummary>;
	/** Size of the whole archive, for the "All work" link. */
	total: number;
};

/** Chapter two: the featured case studies, alternating sides like a magazine spread. */
export function SelectedWorkSection({ projects, total }: SelectedWorkSectionProps) {
	return (
		<Chapter
			id="work"
			index={2}
			label={m.portfolio_chapter_work()}
			title={m.portfolio_work_heading()}
			aside={m.portfolio_work_aside()}
		>
			<div className="flex flex-col gap-[clamp(5rem,12vw,11rem)]">
				{projects.map((project, position) => (
					<ProjectCard key={project.slug} project={project} index={position + 1} flip={position % 2 === 1} />
				))}
			</div>
			<div className="mt-[clamp(5rem,10vw,9rem)] flex justify-center border-pf-line border-t pt-10">
				<ArrowLink to="/portfolio/work" size="large">
					{m.portfolio_work_all({ count: formatNumber(total) })}
				</ArrowLink>
			</div>
		</Chapter>
	);
}
