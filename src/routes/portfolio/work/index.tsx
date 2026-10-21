import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Display } from "@/features/portfolio/components/primitives/display";
import { Eyebrow } from "@/features/portfolio/components/primitives/eyebrow";
import { WorkRow } from "@/features/portfolio/components/work/work-row";
import { DISCIPLINE_LABELS } from "@/features/portfolio/lib/labels";
import { collectionPageJsonLd } from "@/features/portfolio/lib/structured-data";
import { projectsQueryOptions } from "@/features/portfolio/queries";
import { DISCIPLINES, type Discipline, workSearchSchema } from "@/features/portfolio/schema";
import { staticCrumb } from "@/lib/breadcrumbs";
import { formatNumber } from "@/lib/i18n/intl";
import { seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/portfolio/work/")({
	validateSearch: workSearchSchema,
	loaderDeps: ({ search }) => ({ discipline: search.discipline }),
	loader: async ({ context: { queryClient }, deps }) => {
		// The full archive (for the counts and the year range) and the filtered list.
		await Promise.all([
			queryClient.ensureQueryData(projectsQueryOptions()),
			queryClient.ensureQueryData(projectsQueryOptions(deps)),
		]);
	},
	staticData: { breadcrumb: staticCrumb(m.portfolio_nav_work) },
	// A filtered view is the same page: noindex, canonical to the full list.
	head: ({ match: { search } }) =>
		seo({
			title: m.portfolio_work_title(),
			description: m.portfolio_work_description(),
			path: "/portfolio/work",
			noindex: search.discipline !== undefined,
			jsonLd: collectionPageJsonLd({
				name: m.portfolio_work_title(),
				description: m.portfolio_work_description(),
				path: "/portfolio/work",
			}),
		}),
	component: WorkIndexPage,
});

const filterLink =
	"pf-focus pf-label inline-flex items-center gap-2 border-2 border-pf-line px-4 py-2 transition-colors " +
	"hover:border-pf-ink aria-[current=page]:border-pf-ink aria-[current=page]:bg-pf-ink aria-[current=page]:text-pf-paper";

function WorkIndexPage() {
	const { discipline } = Route.useSearch();
	const { data: all } = useSuspenseQuery(projectsQueryOptions());
	const { data: projects } = useSuspenseQuery(projectsQueryOptions({ discipline }));
	const years = all.map((project) => project.year);
	const countOf = (value: Discipline) => all.filter((project) => project.disciplines.includes(value)).length;
	const year = (value: number) => formatNumber(value, { useGrouping: false });

	return (
		<>
			<header className="pf-container pf-grid gap-y-8 pt-[clamp(3rem,8vw,7rem)] pb-[clamp(3rem,6vw,5rem)]">
				<Eyebrow className="col-span-4 md:col-span-12">{m.portfolio_work_title()}</Eyebrow>
				<Display as="h1" size="h1" className="col-span-4 md:col-span-10">
					{m.portfolio_work_heading_years({ from: year(Math.min(...years)), to: year(Math.max(...years)) })}
				</Display>
				<p className="col-span-4 text-pf-lead text-pf-ink-2 md:col-span-6 md:col-start-7">
					{m.portfolio_work_description()}
				</p>
			</header>

			<div className="pf-container pb-[clamp(5rem,10vw,9rem)]">
				<nav aria-label={m.portfolio_work_filter_label()} className="mb-10">
					<ul className="flex flex-wrap gap-2">
						<li>
							<Link
								to="/portfolio/work"
								search={{}}
								className={filterLink}
								aria-current={discipline ? undefined : "page"}
							>
								{m.portfolio_work_filter_all()}
								<span className="opacity-70">{formatNumber(all.length)}</span>
							</Link>
						</li>
						{DISCIPLINES.map((value) => (
							<li key={value}>
								<Link
									to="/portfolio/work"
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
