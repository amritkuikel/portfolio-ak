import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { DISCIPLINES, type Discipline } from "../../constants";
import { DISCIPLINE_LABELS } from "../../lib/labels";
import { workQueryOptions } from "../../queries";
import { Display } from "../primitives/display";
import { Eyebrow } from "../primitives/eyebrow";
import { WorkRow } from "../work/work-row";

const route = getRouteApi("/_site/work/");

const filterLink =
	"pf-focus pf-label inline-flex items-center gap-2 border-2 border-pf-line px-4 py-2 transition-colors " +
	"hover:border-pf-ink aria-[current=page]:border-pf-ink aria-[current=page]:bg-pf-ink aria-[current=page]:text-pf-paper";

/** /work: the archive, filterable by discipline (links, so it works without JavaScript). */
export function WorkPage() {
	const { discipline } = route.useSearch();
	const { data: all } = useSuspenseQuery(workQueryOptions());
	const projects = discipline ? all.filter((project) => project.disciplines.includes(discipline)) : all;
	const years = all.map((project) => project.year);
	const countOf = (value: Discipline) => all.filter((project) => project.disciplines.includes(value)).length;
	const year = (value: number) => formatNumber(value, { useGrouping: false });

	return (
		<>
			<header className="pf-container pf-grid gap-y-8 pt-[clamp(3rem,8vw,7rem)] pb-[clamp(3rem,6vw,5rem)]">
				<Eyebrow className="col-span-4 md:col-span-12">{m.portfolio_work_title()}</Eyebrow>
				<Display as="h1" size="h1" className="col-span-4 md:col-span-10">
					{years.length > 0
						? m.portfolio_work_heading_years({ from: year(Math.min(...years)), to: year(Math.max(...years)) })
						: m.portfolio_work_title()}
				</Display>
				<p className="col-span-4 text-pf-lead text-pf-ink-2 md:col-span-6 md:col-start-7">
					{m.portfolio_work_description()}
				</p>
			</header>

			<div className="pf-container pb-[clamp(5rem,10vw,9rem)]">
				<nav aria-label={m.portfolio_work_filter_label()} className="mb-10">
					<ul className="flex flex-wrap gap-2">
						<li>
							<Link to="/work" search={{}} className={filterLink} aria-current={discipline ? undefined : "page"}>
								{m.portfolio_work_filter_all()}
								<span className="opacity-70">{formatNumber(all.length)}</span>
							</Link>
						</li>
						{DISCIPLINES.map((value) => (
							<li key={value}>
								<Link
									to="/work"
									search={{ discipline: value }}
									className={filterLink}
									aria-current={discipline === value ? "page" : undefined}
								>
									{DISCIPLINE_LABELS[value]()}
									<span className="opacity-70">{formatNumber(countOf(value))}</span>
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<p className="sr-only" aria-live="polite">
					{m.portfolio_work_count({ count: formatNumber(projects.length) })}
				</p>
				<ul>
					{projects.map((project) => (
						<WorkRow key={project.slug} project={project} />
					))}
				</ul>
			</div>
		</>
	);
}
