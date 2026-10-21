import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { isoDateInstant } from "@/lib/i18n/date-only";
import { formatDate, formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import type { PostSummary } from "../../types";

/** One article in a list: date, title, excerpt and reading time; the whole row is the link. */
export function PostRow({ post, headingLevel = "h3" }: { post: PostSummary; headingLevel?: "h2" | "h3" }) {
	const Heading = headingLevel;
	return (
		<li className="border-pf-line border-t last:border-b">
			<Link
				to="/journal/$slug"
				params={{ slug: post.slug }}
				className="pf-focus group/row grid grid-cols-4 gap-x-(--pf-gutter) gap-y-3 py-8 transition-colors duration-(--pf-dur-2) hover:bg-pf-paper-2 md:grid-cols-12 md:py-10"
			>
				<time dateTime={post.publishedAt} className="pf-label col-span-4 pt-2 text-pf-stone md:col-span-2">
					{formatDate(isoDateInstant(post.publishedAt), { dateStyle: "medium" })}
				</time>
				<div className="col-span-4 md:col-span-7">
					<Heading className="pf-display text-pf-h3 transition-colors duration-(--pf-dur-2) group-hover/row:text-pf-accent">
						{post.title}
					</Heading>
					<p className="mt-3 text-pf-body text-pf-ink-2">{post.excerpt}</p>
				</div>
				<p className="pf-label col-span-3 pt-2 text-pf-stone md:col-span-2 md:text-right">
					{m.portfolio_journal_reading_time({ minutes: formatNumber(post.readingMinutes) })}
				</p>
				<ArrowRightIcon
					aria-hidden
					className="col-span-1 mt-1 size-5 justify-self-end text-pf-accent transition-transform duration-(--pf-dur-2) group-hover/row:translate-x-1"
				/>
			</Link>
		</li>
	);
}
