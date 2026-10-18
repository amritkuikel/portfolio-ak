import { queryOptions } from "@tanstack/react-query";
import { getLocale } from "@/paraglide/runtime";
import type { ProjectFilter } from "./source";
import { portfolioSource } from "./sources";

/**
 * Query options for every portfolio read. Loaders await them with
 * ensureQueryData (so pages arrive complete) and components read them with
 * useSuspenseQuery. Keys include the locale: content is resolved per language,
 * so English and Nepali never share a cache entry.
 *
 * The content only changes with a deploy, so it never goes stale in a session.
 */
const STATIC = { staleTime: Number.POSITIVE_INFINITY } as const;

export const portfolioKeys = {
	all: ["portfolio"] as const,
	scoped: () => [...portfolioKeys.all, getLocale()] as const,
	profile: () => [...portfolioKeys.scoped(), "profile"] as const,
	projects: (filter: ProjectFilter) => [...portfolioKeys.scoped(), "projects", filter] as const,
	project: (slug: string) => [...portfolioKeys.scoped(), "project", slug] as const,
	experience: () => [...portfolioKeys.scoped(), "experience"] as const,
	capabilities: () => [...portfolioKeys.scoped(), "capabilities"] as const,
	process: () => [...portfolioKeys.scoped(), "process"] as const,
	testimonials: () => [...portfolioKeys.scoped(), "testimonials"] as const,
	posts: (limit?: number) => [...portfolioKeys.scoped(), "posts", { limit }] as const,
	post: (slug: string) => [...portfolioKeys.scoped(), "post", slug] as const,
};

export const profileQueryOptions = () =>
	queryOptions({
		...STATIC,
		queryKey: portfolioKeys.profile(),
		queryFn: () => portfolioSource.getProfile(getLocale()),
	});

export const projectsQueryOptions = (filter: ProjectFilter = {}) =>
	queryOptions({
		...STATIC,
		queryKey: portfolioKeys.projects(filter),
		queryFn: () => portfolioSource.listProjects(getLocale(), filter),
	});

export const projectQueryOptions = (slug: string) =>
	queryOptions({
		...STATIC,
		queryKey: portfolioKeys.project(slug),
		queryFn: () => portfolioSource.getProject(getLocale(), slug),
	});

export const experienceQueryOptions = () =>
	queryOptions({
		...STATIC,
		queryKey: portfolioKeys.experience(),
		queryFn: () => portfolioSource.listExperience(getLocale()),
	});

export const capabilitiesQueryOptions = () =>
	queryOptions({
		...STATIC,
		queryKey: portfolioKeys.capabilities(),
		queryFn: () => portfolioSource.listCapabilities(getLocale()),
	});

export const processQueryOptions = () =>
	queryOptions({
		...STATIC,
		queryKey: portfolioKeys.process(),
		queryFn: () => portfolioSource.listProcess(getLocale()),
	});

export const testimonialsQueryOptions = () =>
	queryOptions({
		...STATIC,
		queryKey: portfolioKeys.testimonials(),
		queryFn: () => portfolioSource.listTestimonials(getLocale()),
	});

export const postsQueryOptions = (limit?: number) =>
	queryOptions({
		...STATIC,
		queryKey: portfolioKeys.posts(limit),
		queryFn: () => portfolioSource.listPosts(getLocale(), { limit }),
	});

export const postQueryOptions = (slug: string) =>
	queryOptions({
		...STATIC,
		queryKey: portfolioKeys.post(slug),
		queryFn: () => portfolioSource.getPost(getLocale(), slug),
	});
