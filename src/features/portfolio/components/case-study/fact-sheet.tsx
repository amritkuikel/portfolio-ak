import type { ReactNode } from "react";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { DISCIPLINE_LABELS } from "../../lib/labels";
import type { Project } from "../../types";
import { ArrowAnchor } from "../primitives/arrow-link";
import { TagList } from "../primitives/tag";

function Fact({ term, children }: { term: string; children: ReactNode }) {
	return (
		<div className="flex flex-col gap-2 border-pf-line border-t py-4">
			<dt className="pf-label text-pf-stone">{term}</dt>
			<dd>{children}</dd>
		</div>
	);
}

type FactSheetProps = {
	project: Pick<Project, "role" | "client" | "year" | "duration" | "disciplines" | "stack" | "links">;
};

/** The project at a glance; pinned beside the story on wide screens. */
export function FactSheet({ project }: FactSheetProps) {
	return (
		<aside aria-labelledby="facts-title" className="md:sticky md:top-[calc(var(--pf-header-h)+2rem)]">
			<h2 id="facts-title" className="sr-only">
				{m.portfolio_case_facts()}
			</h2>
			<dl>
				<Fact term={m.portfolio_case_role()}>{project.role}</Fact>
				<Fact term={m.portfolio_case_client()}>{project.client}</Fact>
				<Fact term={m.portfolio_case_year()}>{formatNumber(project.year, { useGrouping: false })}</Fact>
				<Fact term={m.portfolio_case_duration()}>{project.duration}</Fact>
				<Fact term={m.portfolio_case_disciplines()}>
					{project.disciplines.map((discipline) => DISCIPLINE_LABELS[discipline]()).join(", ")}
				</Fact>
				<Fact term={m.portfolio_case_stack()}>
					<TagList items={project.stack} className="pt-1" />
				</Fact>
				{project.links.length > 0 ? (
					<Fact term={m.portfolio_case_links()}>
						<ul className="flex flex-col gap-2">
							{project.links.map((link) => (
								<li key={link.href}>
									<ArrowAnchor href={link.href} direction="external" rel="noopener">
										{link.label}
									</ArrowAnchor>
								</li>
							))}
						</ul>
					</Fact>
				) : null}
			</dl>
		</aside>
	);
}
