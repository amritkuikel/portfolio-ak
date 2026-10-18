import { m } from "@/paraglide/messages";
import type { PostSummary } from "../../types";
import { PostRow } from "../journal/post-row";
import { ArrowLink } from "../primitives/arrow-link";
import { Chapter } from "../primitives/chapter";

/** Chapter seven: the latest writing. */
export function JournalTeaserSection({ posts }: { posts: ReadonlyArray<PostSummary> }) {
	return (
		<Chapter
			id="journal"
			index={7}
			label={m.portfolio_nav_journal()}
			title={m.portfolio_journal_heading()}
			aside={<ArrowLink to="/portfolio/journal">{m.portfolio_journal_all()}</ArrowLink>}
		>
			<ul>
				{posts.map((post) => (
					<PostRow key={post.slug} post={post} />
				))}
			</ul>
		</Chapter>
	);
}
