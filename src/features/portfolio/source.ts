import type { Locale } from "@/paraglide/runtime";
import type { Discipline } from "./schema";
import type {
	Capability,
	Experience,
	PostDetail,
	PostSummary,
	ProcessStep,
	Profile,
	ProjectDetail,
	ProjectSummary,
	Testimonial,
} from "./types";

export type ProjectFilter = {
	discipline?: Discipline | undefined;
	featured?: boolean | undefined;
};

/**
 * Where portfolio content comes from (decision 0106).
 *
 * The UI only talks to this port, through queries.ts. Today the adapter is
 * sources/fixture-source.ts (typed demo data, lazy-loaded); a database or CMS
 * adapter replaces it by implementing the same interface and being exported
 * from sources/index.ts. Nothing in routes or components changes.
 *
 * Every method takes the locale explicitly and returns content resolved to it.
 * Missing slugs resolve to null (the route turns that into a 404).
 */
export interface PortfolioSource {
	getProfile(locale: Locale): Promise<Profile>;
	/** Newest first. */
	listProjects(locale: Locale, filter?: ProjectFilter): Promise<ProjectSummary[]>;
	getProject(locale: Locale, slug: string): Promise<ProjectDetail | null>;
	/** Current position first. */
	listExperience(locale: Locale): Promise<Experience[]>;
	listCapabilities(locale: Locale): Promise<Capability[]>;
	listProcess(locale: Locale): Promise<ProcessStep[]>;
	listTestimonials(locale: Locale): Promise<Testimonial[]>;
	/** Newest first; `limit` keeps the newest N. */
	listPosts(locale: Locale, options?: { limit?: number | undefined }): Promise<PostSummary[]>;
	getPost(locale: Locale, slug: string): Promise<PostDetail | null>;
	/** Every indexable slug, for the sitemap (no locale: slugs are shared). */
	listSlugs(): Promise<{ projects: string[]; posts: string[] }>;
}
