import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { CaseStudyBody } from "@/features/portfolio/components/case-study/case-study-body";
import { CaseStudyHero } from "@/features/portfolio/components/case-study/case-study-hero";
import { FactSheet } from "@/features/portfolio/components/case-study/fact-sheet";
import { NextProject } from "@/features/portfolio/components/case-study/next-project";
import { StatGrid } from "@/features/portfolio/components/primitives/stat";
import { caseStudyJsonLd } from "@/features/portfolio/lib/structured-data";
import { projectQueryOptions } from "@/features/portfolio/queries";
import { portfolioSlugParamSchema } from "@/features/portfolio/schema";
import { loaderTitleCrumb } from "@/lib/breadcrumbs";
import { parseParams } from "@/lib/list/params";
import { seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/portfolio/work/$slug")({
	// Not a slug -> can't exist: the route doesn't match and the 404 needs no query.
	params: { parse: (raw) => parseParams(portfolioSlugParamSchema, raw) },
	loader: async ({ context, params }) => {
		const detail = await context.queryClient.ensureQueryData(projectQueryOptions(params.slug));
		if (!detail) throw notFound();
		// Only what head() and the breadcrumb need; the full project is in the Query cache.
		const { title, summary, slug, year, client, stack } = detail.project;
		return { title, summary, slug, year, client, stack };
	},
	staticData: { breadcrumb: loaderTitleCrumb },
	head: ({ loaderData }) =>
		loaderData
			? seo({
					title: loaderData.title,
					description: loaderData.summary,
					path: `/portfolio/work/${loaderData.slug}`,
					type: "article",
					jsonLd: caseStudyJsonLd(loaderData),
				})
			: {},
	component: CaseStudyPage,
});

function CaseStudyPage() {
	const { slug } = Route.useParams();
	const { data } = useSuspenseQuery(projectQueryOptions(slug));
	// The loader already threw for a missing slug; this narrows the type.
	if (!data) throw notFound();
	const { project, index, total, next } = data;

	return (
		<article aria-labelledby="case-title">
			<CaseStudyHero project={project} index={index} total={total} />

			<section aria-labelledby="outcomes-title" className="pf-container pt-[clamp(4rem,8vw,7rem)]">
				<h2 id="outcomes-title" className="pf-label mb-8 text-pf-stone">
					{m.portfolio_case_outcomes()}
				</h2>
				<StatGrid metrics={project.metrics} className="lg:grid-cols-4" />
			</section>

			<div className="pf-container pf-grid gap-y-16 py-[clamp(5rem,10vw,9rem)]">
				<div className="col-span-4 md:col-span-4 lg:col-span-3">
					<FactSheet project={project} />
				</div>
				<div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
					<CaseStudyBody blocks={project.body} seed={project.slug} />
				</div>
			</div>

			<NextProject next={next} />
		</article>
	);
}
