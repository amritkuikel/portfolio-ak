import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PostRow } from "@/features/portfolio/components/journal/post-row";
import { Display } from "@/features/portfolio/components/primitives/display";
import { Eyebrow } from "@/features/portfolio/components/primitives/eyebrow";
import { blogJsonLd } from "@/features/portfolio/lib/structured-data";
import { postsQueryOptions } from "@/features/portfolio/queries";
import { staticCrumb } from "@/lib/breadcrumbs";
import { seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/journal/")({
	loader: ({ context }) => context.queryClient.ensureQueryData(postsQueryOptions()),
	staticData: { breadcrumb: staticCrumb(m.portfolio_nav_journal) },
	head: () =>
		seo({
			title: m.portfolio_journal_title(),
			description: m.portfolio_journal_description(),
			path: "/journal",
			jsonLd: blogJsonLd({ name: m.portfolio_journal_title(), description: m.portfolio_journal_description() }),
		}),
	component: JournalPage,
});

function JournalPage() {
	const { data: posts } = useSuspenseQuery(postsQueryOptions());
	return (
		<>
			<header className="pf-container pf-grid gap-y-8 pt-[clamp(3rem,8vw,7rem)] pb-[clamp(3rem,6vw,5rem)]">
				<Eyebrow className="col-span-4 md:col-span-12">{m.portfolio_nav_journal()}</Eyebrow>
				<Display as="h1" size="h1" className="col-span-4 md:col-span-9">
					{m.portfolio_journal_heading()}
				</Display>
				<p className="col-span-4 text-pf-lead text-pf-ink-2 md:col-span-6 md:col-start-7">
					{m.portfolio_journal_description()}
				</p>
			</header>
			<div className="pf-container pb-[clamp(5rem,10vw,9rem)]">
				<ul>
					{posts.map((post) => (
						<PostRow key={post.slug} post={post} headingLevel="h2" />
					))}
				</ul>
			</div>
		</>
	);
}
