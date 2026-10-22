import type { Decorator } from "@storybook/react-vite";
import { resolveLocalized } from "@/lib/i18n/localized";
import type { SafeHtml } from "@/lib/safe-html";
import { getLocale } from "@/paraglide/runtime";
import { proseToHtml, toStoredBlocks } from "../../../../scripts/lib/portfolio-content.ts";
import {
	capabilities,
	experience,
	posts,
	processSteps,
	profile,
	projects,
	testimonials,
} from "../../../../scripts/lib/portfolio-data/index.ts";
import { readingMinutes } from "../lib/reading-time";
import type { Experience, Post, Profile, Project, ProjectSummary, Skill } from "../types";

/**
 * Story support for portfolio components: the token scope they need, and the
 * demo content (scripts/lib/portfolio-data, what `pnpm db:seed-portfolio`
 * writes) shaped like the public reads' results, in the toolbar's language at
 * render time. Stories render synchronously, so they skip the server.
 */

/** Wraps a story in `.portfolio` (tokens, canvas) like the portfolio's layout does. */
export const withPortfolioCanvas: Decorator = (Story) => (
	<div className="portfolio pf-canvas">
		<Story />
	</div>
);

const ids = <T,>(list: ReadonlyArray<T>, prefix: string) =>
	list.map((item, index) => ({ ...item, id: `${prefix}-${index}` }));

/** The demo content in the current locale. Call inside a story's render. */
export function demo() {
	const locale = getLocale();
	const summaryOf = ({ cover, body: _body, links: _links, ...record }: (typeof projects)[number]): ProjectSummary => ({
		...resolveLocalized(record, locale),
		cover: { ...cover, seed: record.slug, image: null },
	});
	const summaries = projects.map(summaryOf);
	const allProjects: Project[] = projects.map((record) => ({
		...summaryOf(record),
		links: resolveLocalized(record.links, locale),
		body: resolveLocalized(toStoredBlocks(record.body), locale),
		gallery: [],
		appSlug: null, // @apps
	}));
	const allPosts: Post[] = posts.map(({ body, ...record }) => {
		const html = proseToHtml(body, locale);
		return {
			...resolveLocalized(record, locale),
			body: html as SafeHtml,
			readingMinutes: readingMinutes(html),
			cover: null,
		};
	});
	const { availability, updated, ...person } = profile;
	const resolved: Profile = {
		...resolveLocalized(person, locale),
		availability: resolveLocalized(availability, locale),
		updated,
		portrait: null,
		resume: null,
		seo: { title: "", description: "", image: null },
	};
	return {
		profile: resolved,
		projects: allProjects,
		summaries,
		capabilities: resolveLocalized(capabilities, locale) satisfies Skill[],
		experience: resolveLocalized(experience, locale) satisfies Experience[],
		processSteps: resolveLocalized(ids(processSteps, "step"), locale),
		testimonials: resolveLocalized(testimonials, locale),
		posts: allPosts,
	};
}
