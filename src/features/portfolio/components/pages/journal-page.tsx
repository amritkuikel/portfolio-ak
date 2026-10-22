import { useSuspenseQuery } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { journalQueryOptions } from "../../queries";
import { PostRow } from "../journal/post-row";
import { Display } from "../primitives/display";
import { Eyebrow } from "../primitives/eyebrow";

/** /journal: every published article, newest first. */
export function JournalPage() {
	const { data: posts } = useSuspenseQuery(journalQueryOptions());
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
