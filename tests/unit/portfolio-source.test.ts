import { describe, expect, it } from "vitest";
import { fixtureSource } from "@/features/portfolio/sources/fixture-source";

/** The demo adapter behind the PortfolioSource port (decision 0106). */
describe("fixtureSource", () => {
	it("resolves content to the requested language", async () => {
		const [english, nepali] = await Promise.all([fixtureSource.getProfile("en"), fixtureSource.getProfile("ne")]);
		expect(english.name).toBe("Aarav Shrestha");
		expect(nepali.name).toBe("आरव श्रेष्ठ");
		// Resolved records never leak { en, ne } objects to the UI.
		expect(typeof english.headline[0]).toBe("string");
		expect(typeof english.impact[0]?.label).toBe("string");
	});

	it("lists projects newest first, without case study bodies", async () => {
		const projects = await fixtureSource.listProjects("en");
		expect(projects).toHaveLength(7);
		const years = projects.map((project) => project.year);
		expect(years).toEqual([...years].sort((a, b) => b - a));
		expect(projects[0]).not.toHaveProperty("body");
		expect(projects[0]).not.toHaveProperty("links");
	});

	it("filters projects by discipline and by featured", async () => {
		const ai = await fixtureSource.listProjects("en", { discipline: "ai" });
		expect(ai.map((project) => project.slug)).toEqual(["khoj"]);
		const featured = await fixtureSource.listProjects("en", { featured: true });
		expect(featured).toHaveLength(4);
		expect(featured.every((project) => project.featured)).toBe(true);
		const platform = await fixtureSource.listProjects("en", { discipline: "platform" });
		expect(platform.every((project) => project.disciplines.includes("platform"))).toBe(true);
	});

	it("returns a case study with its position and the next project, wrapping at the end", async () => {
		const all = await fixtureSource.listProjects("en");
		const first = await fixtureSource.getProject("en", all[0]?.slug ?? "");
		expect(first).toMatchObject({ index: 1, total: 7, next: { slug: all[1]?.slug } });
		expect(first?.project.body.length).toBeGreaterThan(3);
		const last = await fixtureSource.getProject("en", all.at(-1)?.slug ?? "");
		expect(last).toMatchObject({ index: 7, next: { slug: all[0]?.slug } });
	});

	it("returns null for unknown slugs (the route turns that into a 404)", async () => {
		expect(await fixtureSource.getProject("en", "does-not-exist")).toBeNull();
		expect(await fixtureSource.getPost("en", "does-not-exist")).toBeNull();
	});

	it("lists posts newest first with a reading time, and keeps the newest N", async () => {
		const posts = await fixtureSource.listPosts("en");
		const dates = posts.map((post) => post.publishedAt);
		expect(dates).toEqual([...dates].sort().reverse());
		expect(posts.every((post) => post.readingMinutes >= 1)).toBe(true);
		expect(posts[0]).not.toHaveProperty("body");
		const latest = await fixtureSource.listPosts("en", { limit: 3 });
		expect(latest.map((post) => post.slug)).toEqual(posts.slice(0, 3).map((post) => post.slug));
	});

	it("returns an article with the next one", async () => {
		const posts = await fixtureSource.listPosts("ne");
		const detail = await fixtureSource.getPost("ne", posts[0]?.slug ?? "");
		expect(detail?.next.slug).toBe(posts[1]?.slug);
		expect(detail?.post.title).toMatch(/[ऀ-ॿ]/);
	});

	it("lists experience with the current position first", async () => {
		const experience = await fixtureSource.listExperience("en");
		expect(experience[0]?.end).toBeNull();
		const ends = experience.slice(1).map((entry) => entry.end ?? "");
		expect(ends).toEqual([...ends].sort().reverse());
	});

	it("lists every slug for the sitemap, in page order", async () => {
		const slugs = await fixtureSource.listSlugs();
		expect(slugs.projects).toEqual((await fixtureSource.listProjects("en")).map((project) => project.slug));
		expect(slugs.posts).toEqual((await fixtureSource.listPosts("en")).map((post) => post.slug));
	});
});
