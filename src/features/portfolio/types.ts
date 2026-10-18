import type { Resolved } from "./lib/localize";
import type {
	CapabilityRecord,
	ExperienceRecord,
	MetricRecord,
	PostRecord,
	ProcessStepRecord,
	ProfileRecord,
	ProjectRecord,
	TestimonialRecord,
} from "./schema";

/**
 * What the UI receives: content records resolved to the page's language
 * (PortfolioSource does the resolving). Components never see `{ en, ne }`.
 */

export type Profile = Resolved<ProfileRecord>;
export type Metric = Resolved<MetricRecord>;
export type Capability = Resolved<CapabilityRecord>;
export type ProcessStep = Resolved<ProcessStepRecord>;
export type Testimonial = Resolved<TestimonialRecord>;
export type Experience = Resolved<ExperienceRecord>;

export type Project = Resolved<ProjectRecord>;
export type CaseStudyBlock = Project["body"][number];

/** A project in lists and cards: everything but the case study body. */
export type ProjectSummary = Omit<Project, "body" | "links">;

/** The case study page: the project plus where "Next project" leads. */
export type ProjectDetail = {
	project: Project;
	/** 1-based position among all projects, for the big index numeral. */
	index: number;
	total: number;
	next: Pick<ProjectSummary, "slug" | "title" | "client" | "cover">;
};

export type Post = Resolved<PostRecord> & {
	/** Estimated from the body's word count. */
	readingMinutes: number;
};
export type ProseBlock = Post["body"][number];
export type PostSummary = Omit<Post, "body">;

export type PostDetail = {
	post: Post;
	/** The next older post (wraps to the newest), for the article footer. */
	next: Pick<PostSummary, "slug" | "title" | "publishedAt">;
};
