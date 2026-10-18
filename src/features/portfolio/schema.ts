import { z } from "zod";

/**
 * Shapes of the portfolio content. The fixtures in ./data are typed with these
 * records and parsed by tests/unit/portfolio-data.test.ts. A real backend
 * (database or CMS) would return the same records.
 *
 * Content is data, not UI copy: every human-language field is `Localized`
 * ({ en, ne }) and the source resolves it to one language (decision 0107).
 * UI chrome (labels, buttons, headings of the site itself) stays in Paraglide.
 */

/** A value written once per language. */
export const localized = <T extends z.ZodType>(value: T) => z.object({ en: value, ne: value });
const text = localized(z.string().trim().min(1));

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug = z.string().regex(SLUG);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const href = z.string().regex(/^(https:\/\/|mailto:)/);

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

export const DISCIPLINES = ["product", "frontend", "backend", "platform", "ai"] as const;
export const disciplineSchema = z.enum(DISCIPLINES);
export type Discipline = z.infer<typeof disciplineSchema>;

/** How a number is shown: `formatMetric` (lib/format-metric.ts) turns these into localized text. */
export const METRIC_FORMATS = ["number", "compact", "percent", "multiplier", "plus", "ms", "seconds"] as const;
export const metricRecordSchema = z.object({
	value: z.number().finite(),
	format: z.enum(METRIC_FORMATS),
	label: text,
});

/** Generative cover art (components/primitives/cover-art.tsx): a motif and a glyph, seeded by the slug. */
export const COVER_MOTIFS = ["grid", "orbit", "waves", "blocks", "type", "terrain", "signal"] as const;
export const coverMotifSchema = z.enum(COVER_MOTIFS);
export type CoverMotif = z.infer<typeof coverMotifSchema>;
export const coverRecordSchema = z.object({
	motif: coverMotifSchema,
	/** One to three characters set huge on the cover. */
	glyph: z.string().min(1).max(3),
});

export const linkRecordSchema = z.object({ label: text, href });

// ---------------------------------------------------------------------------
// Rich content blocks (no HTML: each block is typed and rendered by a component)
// ---------------------------------------------------------------------------

const paragraphBlock = z.object({ kind: z.literal("paragraph"), text });
const headingBlock = z.object({ kind: z.literal("heading"), text });
const quoteBlock = z.object({ kind: z.literal("quote"), text, cite: z.string().min(1).optional() });
const codeBlock = z.object({
	kind: z.literal("code"),
	language: z.enum(["ts", "tsx", "sql", "bash", "css"]),
	caption: text.optional(),
	code: z.string().min(1),
});
const listBlock = z.object({ kind: z.literal("list"), items: z.array(text).min(2) });

/** Journal article body. */
export const proseBlockSchema = z.discriminatedUnion("kind", [
	paragraphBlock,
	headingBlock,
	quoteBlock,
	codeBlock,
	listBlock,
]);

export const ARCHITECTURE_TIERS = ["client", "edge", "service", "data"] as const;

/** Case study body: titled chapters plus the special blocks a case study needs. */
export const caseStudyBlockSchema = z.discriminatedUnion("kind", [
	z.object({ kind: z.literal("chapter"), title: text, body: z.array(text).min(1) }),
	quoteBlock,
	codeBlock,
	z.object({
		kind: z.literal("architecture"),
		caption: text,
		nodes: z
			.array(z.object({ id: slug, label: text, detail: z.string().min(1), tier: z.enum(ARCHITECTURE_TIERS) }))
			.min(3),
		edges: z.array(z.tuple([slug, slug])).min(2),
	}),
	z.object({ kind: z.literal("gallery"), captions: z.array(text).min(2).max(4) }),
]);

// ---------------------------------------------------------------------------
// Records
// ---------------------------------------------------------------------------

export const profileRecordSchema = z.object({
	name: text,
	/** Two letters for the header monogram. */
	initials: z.string().length(2),
	role: text,
	location: text,
	timezone: z.string().min(1),
	email: z.email(),
	availability: z.object({ status: z.enum(["open", "limited", "closed"]), note: text }),
	/** The hero headline, one entry per line (each line rises separately). */
	headline: z.array(text).min(2).max(4),
	intro: text,
	manifesto: text,
	bio: z.array(text).min(2),
	principles: z.array(z.object({ title: text, body: text })).min(3),
	impact: z.array(metricRecordSchema).min(3).max(4),
	socials: z.array(z.object({ network: z.string().min(1), handle: z.string().min(1), href })).min(2),
	/** Tool names for the capabilities marquee (brands: not translated). */
	toolbox: z.array(z.string().min(1)).min(6),
	/** Year shown in the footer's copyright line (fixed, so server and client agree). */
	since: z.number().int(),
	updated: z.number().int(),
});

export const projectRecordSchema = z.object({
	slug,
	/** Product names are brands: the same in every language. */
	title: z.string().min(1),
	client: text,
	year: z.number().int().min(2000).max(2100),
	disciplines: z.array(disciplineSchema).min(1),
	role: text,
	duration: text,
	summary: text,
	stack: z.array(z.string().min(1)).min(3),
	featured: z.boolean(),
	cover: coverRecordSchema,
	links: z.array(linkRecordSchema),
	metrics: z.array(metricRecordSchema).min(3).max(4),
	body: z.array(caseStudyBlockSchema).min(4),
});

export const experienceRecordSchema = z.object({
	id: slug,
	company: z.string().min(1),
	role: text,
	start: yearMonth,
	/** null: the current position. */
	end: yearMonth.nullable(),
	location: text,
	summary: text,
});

export const capabilityRecordSchema = z.object({
	id: slug,
	title: text,
	summary: text,
	skills: z.array(z.string().min(1)).min(3),
});

export const processStepRecordSchema = z.object({
	id: slug,
	title: text,
	body: text,
	outputs: z.array(text).min(2),
});

export const testimonialRecordSchema = z.object({
	id: slug,
	quote: text,
	name: z.string().min(1),
	role: text,
	company: z.string().min(1),
});

export const postRecordSchema = z.object({
	slug,
	title: text,
	excerpt: text,
	publishedAt: isoDate,
	tags: z.array(z.string().min(1)).min(1),
	body: z.array(proseBlockSchema).min(4),
});

export type ProfileRecord = z.infer<typeof profileRecordSchema>;
export type ProjectRecord = z.infer<typeof projectRecordSchema>;
export type ExperienceRecord = z.infer<typeof experienceRecordSchema>;
export type CapabilityRecord = z.infer<typeof capabilityRecordSchema>;
export type ProcessStepRecord = z.infer<typeof processStepRecordSchema>;
export type TestimonialRecord = z.infer<typeof testimonialRecordSchema>;
export type PostRecord = z.infer<typeof postRecordSchema>;
export type MetricRecord = z.infer<typeof metricRecordSchema>;

// ---------------------------------------------------------------------------
// URL search params
// ---------------------------------------------------------------------------

/** /portfolio/work?discipline=frontend. A bad value means "all" (forgiving, like every list URL). */
export const workSearchSchema = z.object({
	discipline: disciplineSchema.optional().catch(undefined),
});

/** Path params of detail pages: anything that isn't a slug can't exist (the route doesn't match). */
export const portfolioSlugParamSchema = z.object({ slug });
