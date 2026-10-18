import { describe, expect, it } from "vitest";
import {
	capabilities,
	experience,
	posts,
	processSteps,
	profile,
	projects,
	testimonials,
} from "@/features/portfolio/data";
import { isLocalized } from "@/features/portfolio/lib/localize";
import {
	capabilityRecordSchema,
	experienceRecordSchema,
	postRecordSchema,
	processStepRecordSchema,
	profileRecordSchema,
	projectRecordSchema,
	testimonialRecordSchema,
} from "@/features/portfolio/schema";

/**
 * The demo content is typed by the schema at compile time; these tests check
 * what types can't: every record parses, slugs are unique, every Nepali text
 * is actually written in Nepali, and case study diagrams are consistent.
 */

const DEVANAGARI = /[ऀ-ॿ]/;

/** Every { en, ne } pair anywhere in a record, with its path for error messages. */
function localizedPairs(value: unknown, path = "$"): Array<{ path: string; en: unknown; ne: unknown }> {
	if (isLocalized(value)) return [{ path, en: value.en, ne: value.ne }];
	if (Array.isArray(value)) return value.flatMap((item, index) => localizedPairs(item, `${path}[${index}]`));
	if (typeof value === "object" && value !== null) {
		return Object.entries(value).flatMap(([key, item]) => localizedPairs(item, `${path}.${key}`));
	}
	return [];
}

const ALL = { profile, projects, posts, experience, capabilities, processSteps, testimonials };

describe("portfolio demo data", () => {
	it("every record parses with its schema", () => {
		expect(() => profileRecordSchema.parse(profile)).not.toThrow();
		for (const project of projects) expect(() => projectRecordSchema.parse(project), project.slug).not.toThrow();
		for (const post of posts) expect(() => postRecordSchema.parse(post), post.slug).not.toThrow();
		for (const entry of experience) expect(() => experienceRecordSchema.parse(entry), entry.id).not.toThrow();
		for (const entry of capabilities) expect(() => capabilityRecordSchema.parse(entry), entry.id).not.toThrow();
		for (const step of processSteps) expect(() => processStepRecordSchema.parse(step), step.id).not.toThrow();
		for (const entry of testimonials) expect(() => testimonialRecordSchema.parse(entry), entry.id).not.toThrow();
	});

	it("slugs and ids are unique within each collection", () => {
		const unique = (values: string[]) => new Set(values).size === values.length;
		expect(unique(projects.map((project) => project.slug))).toBe(true);
		expect(unique(posts.map((post) => post.slug))).toBe(true);
		expect(unique(experience.map((entry) => entry.id))).toBe(true);
		expect(unique(capabilities.map((entry) => entry.id))).toBe(true);
		expect(unique(processSteps.map((step) => step.id))).toBe(true);
		expect(unique(testimonials.map((entry) => entry.id))).toBe(true);
	});

	it("every text is written in both languages: Nepali in Devanagari, English without", () => {
		const pairs = localizedPairs(ALL);
		expect(pairs.length).toBeGreaterThan(300);
		const untranslated = pairs.filter((pair) => typeof pair.ne !== "string" || !DEVANAGARI.test(pair.ne));
		const mixedUp = pairs.filter((pair) => typeof pair.en !== "string" || DEVANAGARI.test(pair.en));
		expect(untranslated.map((pair) => pair.path)).toEqual([]);
		expect(mixedUp.map((pair) => pair.path)).toEqual([]);
	});

	it("case study diagrams only connect nodes they declare", () => {
		for (const project of projects) {
			for (const block of project.body) {
				if (block.kind !== "architecture") continue;
				const ids = new Set(block.nodes.map((node) => node.id));
				for (const [from, to] of block.edges) {
					expect(ids.has(from), `${project.slug}: ${from}`).toBe(true);
					expect(ids.has(to), `${project.slug}: ${to}`).toBe(true);
				}
			}
		}
	});

	it("tells a complete story: four featured projects, each case study with a challenge and an outcome", () => {
		expect(projects.filter((project) => project.featured)).toHaveLength(4);
		for (const project of projects) {
			const chapters = project.body.filter((block) => block.kind === "chapter");
			expect(chapters.length, project.slug).toBeGreaterThanOrEqual(2);
			expect(
				project.body.some((block) => block.kind === "gallery"),
				project.slug,
			).toBe(true);
		}
		expect(experience.filter((entry) => entry.end === null)).toHaveLength(1);
	});
});
