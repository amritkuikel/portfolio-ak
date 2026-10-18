import { Link } from "@tanstack/react-router";
import { formatNumber } from "@/lib/intl";
import { DISCIPLINE_LABELS } from "../../lib/labels";
import type { ProjectSummary } from "../../types";
import { CoverArt } from "../primitives/cover-art";
import { CoverFrame } from "../primitives/cover-frame";

/**
 * One project in the work index: a wide row (title, client,
 * disciplines, year) with its cover. On phones the cover sits above the text;
 * from tablets up it waits at the end of the row and wipes open on hover.
 */
export function WorkRow({ project }: { project: ProjectSummary }) {
	return (
		<li className="border-pf-line border-t last:border-b">
			<Link
				to="/portfolio/work/$slug"
				params={{ slug: project.slug }}
				viewTransition
				className="pf-focus group/row grid grid-cols-4 items-center gap-x-(--pf-gutter) gap-y-5 py-8 md:grid-cols-12 md:py-10"
			>
				<div className="col-span-4 md:order-last md:col-span-3">
					<div className="transition-[clip-path] duration-(--pf-dur-3) ease-(--pf-ease-out) md:[clip-path:inset(0_0_0_100%)] md:group-hover/row:[clip-path:inset(0)] md:group-focus-visible/row:[clip-path:inset(0)]">
						<CoverFrame transitionSlug={project.slug} aspect="landscape">
							<CoverArt seed={project.slug} motif={project.cover.motif} glyph={project.cover.glyph} />
						</CoverFrame>
					</div>
				</div>
				<div className="col-span-4 md:col-span-6">
					<h2 className="pf-display text-pf-h2 transition-transform duration-(--pf-dur-2) ease-(--pf-ease-out) md:group-hover/row:translate-x-3">
						{project.title}
					</h2>
					<p className="mt-2 text-pf-body text-pf-ink-2">{project.client}</p>
				</div>
				<p className="pf-label col-span-3 text-pf-stone md:col-span-2">
					{project.disciplines.map((discipline) => DISCIPLINE_LABELS[discipline]()).join(" / ")}
				</p>
				<p className="pf-label col-span-1 text-right text-pf-stone tabular-nums md:col-span-1">
					{formatNumber(project.year, { useGrouping: false })}
				</p>
			</Link>
		</li>
	);
}
