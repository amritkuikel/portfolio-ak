import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, notFound } from "@tanstack/react-router";
import { m } from "@/paraglide/messages";
import { projectQueryOptions } from "../../queries";
import { CaseStudyBody } from "../case-study/case-study-body";
import { CaseStudyHero } from "../case-study/case-study-hero";
import { FactSheet } from "../case-study/fact-sheet";
import { NextProject } from "../case-study/next-project";
import { DraftNotice } from "../chrome/draft-notice";
import { StatGrid } from "../primitives/stat";

const route = getRouteApi("/_site/work/$slug");

/** /work/$slug: a case study (`?preview=1` shows a draft to someone who may read it). */
export function CaseStudyPage() {
	const { slug } = route.useParams();
	const { preview } = route.useLoaderDeps();
	const { data } = useSuspenseQuery(projectQueryOptions(slug, preview));
	// The loader already threw for a missing slug; this narrows the type.
	if (!data) throw notFound();
	const { project, index, total, next, draft } = data;

	return (
		<article aria-labelledby="case-title" lang={project.lang}>
			{draft ? <DraftNotice /> : null}
			<CaseStudyHero project={project} index={index} total={total} />

			{project.metrics.length > 0 ? (
				<section aria-labelledby="outcomes-title" className="pf-container pt-[clamp(4rem,8vw,7rem)]">
					<h2 id="outcomes-title" className="pf-label mb-8 text-pf-stone">
						{m.portfolio_case_outcomes()}
					</h2>
					<StatGrid metrics={project.metrics} className="lg:grid-cols-4" />
				</section>
			) : null}

			<div className="pf-container pf-grid gap-y-16 py-[clamp(5rem,10vw,9rem)]">
				<div className="col-span-4 md:col-span-4 lg:col-span-3">
					<FactSheet project={project} />
				</div>
				<div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
					<CaseStudyBody blocks={project.body} seed={project.cover.seed} />
				</div>
			</div>

			<NextProject next={next} />
		</article>
	);
}
