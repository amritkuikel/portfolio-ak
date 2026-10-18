import type { Decorator } from "@storybook/react-vite";
import { getLocale } from "@/paraglide/runtime";
import { capabilities, experience, posts, processSteps, profile, projects, testimonials } from "../data";
import { resolveLocalized } from "../lib/localize";
import { readingMinutes } from "../lib/reading-time";
import type { Post, ProjectSummary } from "../types";

/**
 * Story support for portfolio components: the token scope they need, and the
 * demo data resolved to the toolbar's language at render time (stories render
 * synchronously, so they read the fixtures directly instead of the async source).
 */

/** Wraps a story in `.portfolio` (tokens, canvas) like the /portfolio layout does. */
export const withPortfolioCanvas: Decorator = (Story) => (
	<div className="portfolio pf-canvas">
		<Story />
	</div>
);

/** The demo content in the current locale. Call inside a story's render. */
export function demo() {
	const locale = getLocale();
	const allPosts: Post[] = posts.map((record) => {
		const post = resolveLocalized(record, locale);
		return { ...post, readingMinutes: readingMinutes(post.body) };
	});
	const allProjects = projects.map((record) => resolveLocalized(record, locale));
	const summaries: ProjectSummary[] = allProjects.map(({ body: _body, links: _links, ...summary }) => summary);
	return {
		profile: resolveLocalized(profile, locale),
		projects: allProjects,
		summaries,
		capabilities: resolveLocalized(capabilities, locale),
		experience: resolveLocalized(experience, locale),
		processSteps: resolveLocalized(processSteps, locale),
		testimonials: resolveLocalized(testimonials, locale),
		posts: allPosts,
	};
}
