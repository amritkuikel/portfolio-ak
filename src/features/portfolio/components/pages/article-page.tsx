import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link, notFound } from "@tanstack/react-router";
import { isoDateInstant } from "@/lib/i18n/date-only";
import { formatDate, formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { postQueryOptions } from "../../queries";
import { DraftNotice } from "../chrome/draft-notice";
import { ArticleBody } from "../journal/article-body";
import { ArrowLink } from "../primitives/arrow-link";
import { Display } from "../primitives/display";
import { Eyebrow } from "../primitives/eyebrow";
import { TagList } from "../primitives/tag";

const route = getRouteApi("/_site/journal/$slug");

/** /journal/$slug: an article (`?preview=1` shows a draft to someone who may read it). */
export function ArticlePage() {
	const { slug } = route.useParams();
	const { preview } = route.useLoaderDeps();
	const { data } = useSuspenseQuery(postQueryOptions(slug, preview));
	// The loader already threw for a missing slug; this narrows the type.
	if (!data) throw notFound();
	const { post, next, draft } = data;
	const published = formatDate(isoDateInstant(post.publishedAt), { dateStyle: "long" });

	return (
		<article aria-labelledby="article-title" lang={post.lang}>
			{draft ? <DraftNotice /> : null}
			{/* Reading progress, driven by the page's scroll position (CSS only). */}
			<div aria-hidden className="pf-progress fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-pf-accent" />

			<header className="pf-container pf-grid gap-y-8 pt-[clamp(3rem,8vw,7rem)] pb-[clamp(3rem,6vw,5rem)]">
				<div className="col-span-4 md:col-span-12">
					<ArrowLink to="/journal" direction="left" className="pf-label font-normal text-pf-ink-2">
						{m.portfolio_journal_all()}
					</ArrowLink>
				</div>
				<Eyebrow className="col-span-4 md:col-span-12">
					<time dateTime={post.publishedAt}>{published}</time>
					{" / "}
					{m.portfolio_journal_reading_time({ minutes: formatNumber(post.readingMinutes) })}
				</Eyebrow>
				<Display as="h1" id="article-title" size="h1" className="col-span-4 md:col-span-10">
					{post.title}
				</Display>
				<p className="col-span-4 text-pf-lead text-pf-ink-2 md:col-span-7">{post.excerpt}</p>
				<TagList items={post.tags} label={m.portfolio_journal_tags()} className="col-span-4 md:col-span-12" />
			</header>

			<div className="pf-container pf-grid border-pf-line border-t pt-[clamp(3rem,6vw,5rem)] pb-[clamp(5rem,10vw,9rem)]">
				<div className="col-span-4 md:col-span-8 md:col-start-3 lg:col-span-7 lg:col-start-4">
					<ArticleBody html={post.body} />
				</div>
			</div>

			<nav aria-label={m.portfolio_journal_next()} className="pf-inverse">
				<Link
					to="/journal/$slug"
					params={{ slug: next.slug }}
					className="pf-focus group/next block py-[clamp(4rem,8vw,7rem)]"
				>
					<div className="pf-container">
						<Eyebrow>{m.portfolio_journal_next()}</Eyebrow>
						<p className="pf-display mt-6 text-pf-h1 transition-colors duration-(--pf-dur-2) group-hover/next:text-pf-accent">
							{next.title}
						</p>
					</div>
				</Link>
			</nav>
		</article>
	);
}
