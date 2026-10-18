import type { Locale } from "@/paraglide/runtime";
import { resolveLocalized } from "../lib/localize";
import { readingMinutes } from "../lib/reading-time";
import type { PostRecord, ProjectRecord } from "../schema";
import type { PortfolioSource } from "../source";
import type { Post, PostSummary, ProjectSummary } from "../types";

/**
 * The demo adapter: typed fixtures from ../data, resolved per locale.
 *
 * The data module is imported lazily, so the fixtures become their own chunk:
 * pages outside /portfolio never download them, and a portfolio page loaded
 * from the server doesn't either (its queries arrive already filled with the
 * HTML). Only a client-side navigation into the section fetches the chunk.
 */
const data = () => import("../data");

/** Newest first; ties keep the order of the fixture file. */
const newestProjects = (projects: ReadonlyArray<ProjectRecord>) =>
	projects
		.map((project, order) => ({ project, order }))
		.sort((a, b) => b.project.year - a.project.year || a.order - b.order)
		.map(({ project }) => project);

const newestPosts = (posts: ReadonlyArray<PostRecord>) =>
	[...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const toProjectSummary = ({ body: _body, links: _links, ...summary }: ProjectRecord, locale: Locale): ProjectSummary =>
	resolveLocalized(summary, locale);

const toPost = (record: PostRecord, locale: Locale): Post => {
	const post = resolveLocalized(record, locale);
	return { ...post, readingMinutes: readingMinutes(post.body) };
};

const toPostSummary = (record: PostRecord, locale: Locale): PostSummary => {
	const { body: _body, ...summary } = toPost(record, locale);
	return summary;
};

export const fixtureSource: PortfolioSource = {
	async getProfile(locale) {
		const { profile } = await data();
		return resolveLocalized(profile, locale);
	},

	async listProjects(locale, filter = {}) {
		const { projects } = await data();
		return newestProjects(projects)
			.filter((project) => filter.featured === undefined || project.featured === filter.featured)
			.filter((project) => !filter.discipline || project.disciplines.includes(filter.discipline))
			.map((project) => toProjectSummary(project, locale));
	},

	async getProject(locale, slug) {
		const { projects } = await data();
		const ordered = newestProjects(projects);
		const position = ordered.findIndex((project) => project.slug === slug);
		const record = ordered[position];
		if (!record) return null;
		const nextRecord = ordered[(position + 1) % ordered.length] ?? record;
		const next = toProjectSummary(nextRecord, locale);
		return {
			project: resolveLocalized(record, locale),
			index: position + 1,
			total: ordered.length,
			next: { slug: next.slug, title: next.title, client: next.client, cover: next.cover },
		};
	},

	async listExperience(locale) {
		const { experience } = await data();
		const current = (end: string | null) => end ?? "9999-12";
		return [...experience]
			.sort((a, b) => current(b.end).localeCompare(current(a.end)))
			.map((entry) => resolveLocalized(entry, locale));
	},

	async listCapabilities(locale) {
		const { capabilities } = await data();
		return resolveLocalized(capabilities, locale);
	},

	async listProcess(locale) {
		const { processSteps } = await data();
		return resolveLocalized(processSteps, locale);
	},

	async listTestimonials(locale) {
		const { testimonials } = await data();
		return resolveLocalized(testimonials, locale);
	},

	async listPosts(locale, { limit } = {}) {
		const { posts } = await data();
		return newestPosts(posts)
			.slice(0, limit)
			.map((post) => toPostSummary(post, locale));
	},

	async getPost(locale, slug) {
		const { posts } = await data();
		const ordered = newestPosts(posts);
		const position = ordered.findIndex((post) => post.slug === slug);
		const record = ordered[position];
		if (!record) return null;
		const next = toPostSummary(ordered[(position + 1) % ordered.length] ?? record, locale);
		return {
			post: toPost(record, locale),
			next: { slug: next.slug, title: next.title, publishedAt: next.publishedAt },
		};
	},

	async listSlugs() {
		const { projects, posts } = await data();
		return {
			projects: newestProjects(projects).map((project) => project.slug),
			posts: newestPosts(posts).map((post) => post.slug),
		};
	},
};
