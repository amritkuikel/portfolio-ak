import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { portfolioSource } from "@/features/portfolio/sources";
import { STACK_PAGE_SIZE } from "@/features/stack/schema";
import { TEST_CRUD_PUBLIC_PAGE_SIZE } from "@/features/test-crud/schema";
import { overwriteGetLocale } from "@/paraglide/runtime";
import * as schema from "@/server/db/schema";
import { webManifest } from "@/server/seo/manifest";
import { robotsTxt } from "@/server/seo/robots";
import { sitemapEntries, sitemapXml } from "@/server/seo/sitemap";
import { STACK } from "@/server/stack/data";
import { createTestDb } from "../utils/test-db";

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
	testDb = await createTestDb();
}, 60_000);
afterAll(() => testDb.close());
beforeEach(() => testDb.reset());
afterEach(() => {
	overwriteGetLocale(() => "en");
});

const item = (slug: string, status: "draft" | "published", updatedAt: string) => ({
	title: slug,
	slug,
	summary: "",
	body: "",
	status,
	price: 100,
	tags: [],
	createdBy: testDb.adminId,
	publishedAt: status === "published" ? new Date(updatedAt) : null,
	updatedAt: new Date(updatedAt),
});

describe("sitemap", () => {
	it("lists the public pages and published items only, newest item first", async () => {
		await testDb.db
			.insert(schema.testCrud)
			.values([
				item("older", "published", "2026-09-01T00:00:00Z"),
				item("newer", "published", "2026-10-01T00:00:00Z"),
				item("secret-draft", "draft", "2026-10-05T00:00:00Z"),
			]);
		const entries = await sitemapEntries(testDb.db);
		const portfolio = await portfolioSource.listSlugs();
		const stackPages = Math.ceil(STACK.length / STACK_PAGE_SIZE);
		expect(entries.map((entry) => entry.path)).toEqual([
			"/",
			"/stack",
			...Array.from({ length: stackPages - 1 }, (_, index) => `/stack?page=${index + 2}`),
			"/test-crud",
			"/test-crud/newer",
			"/test-crud/older",
			"/portfolio",
			"/portfolio/work",
			...portfolio.projects.map((slug) => `/portfolio/work/${slug}`),
			"/portfolio/about",
			"/portfolio/journal",
			...portfolio.posts.map((slug) => `/portfolio/journal/${slug}`),
			"/portfolio/contact",
		]);
		expect(portfolio.projects).toHaveLength(7);
		expect(portfolio.posts).toHaveLength(6);
		expect(entries.find((entry) => entry.path === "/test-crud")?.lastmod?.toISOString()).toBe(
			"2026-10-01T00:00:00.000Z",
		);
		expect(entries.find((entry) => entry.path === "/test-crud/older")?.lastmod?.toISOString()).toBe(
			"2026-09-01T00:00:00.000Z",
		);
	});

	it("adds the list's later pages once items fill more than one", async () => {
		const many = Array.from({ length: TEST_CRUD_PUBLIC_PAGE_SIZE + 1 }, (_, index) =>
			item(`item-${index}`, "published", "2026-09-01T00:00:00Z"),
		);
		await testDb.db.insert(schema.testCrud).values(many);
		const paths = (await sitemapEntries(testDb.db)).map((entry) => entry.path);
		expect(paths).toContain("/test-crud?page=2");
		expect(paths).not.toContain("/test-crud?page=3");
	});

	it("never lists private pages", async () => {
		const paths = (await sitemapEntries(testDb.db)).map((entry) => entry.path);
		for (const path of paths) {
			expect(path).not.toMatch(
				/^\/(admin|login|register|sign-in-code|forgot-password|account|health|dev|reset-password|verify-email|api)/,
			);
		}
	});

	it("writes one <url> per page and language, each with every hreflang alternate", () => {
		const xml = sitemapXml([
			{ path: "/" },
			{ path: "/test-crud?page=2&x=<1>" },
			{ path: "/test-crud/momo", lastmod: new Date("2026-10-01T00:00:00Z") },
		]);
		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset')).toBe(true);
		expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
		expect(xml.match(/<url>/g)).toHaveLength(6);
		expect(xml).toContain("<loc>http://localhost:3000/</loc>");
		expect(xml).toContain("<loc>http://localhost:3000/ne/</loc>");
		expect(xml).toContain(
			"<url><loc>http://localhost:3000/ne/test-crud/momo</loc><lastmod>2026-10-01T00:00:00.000Z</lastmod>" +
				'<xhtml:link rel="alternate" hreflang="en" href="http://localhost:3000/test-crud/momo"/>' +
				'<xhtml:link rel="alternate" hreflang="ne" href="http://localhost:3000/ne/test-crud/momo"/>' +
				'<xhtml:link rel="alternate" hreflang="x-default" href="http://localhost:3000/test-crud/momo"/></url>',
		);
		// Query strings are XML-escaped.
		expect(xml).toContain("/test-crud?page=2&amp;x=%3C1%3E</loc>");
		expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
	});
});

describe("robots.txt", () => {
	it("points to the sitemap and keeps crawlers out of the admin area and endpoints", () => {
		expect(robotsTxt()).toBe(
			[
				"User-agent: *",
				"Allow: /",
				"Disallow: /admin",
				"Disallow: /ne/admin",
				"Disallow: /api/",
				"Disallow: /_serverFn/",
				"",
				"Sitemap: http://localhost:3000/sitemap.xml",
				"",
			].join("\n"),
		);
	});
});

describe("web manifest", () => {
	it("is localized and lists the app icons", () => {
		const english = webManifest("en");
		expect(english).toMatchObject({ name: "Portfolio", lang: "en", start_url: "/" });
		const manifest = webManifest("ne");
		expect(manifest).toMatchObject({ lang: "ne", start_url: "/ne/" });
		expect(manifest.description).not.toBe(english.description);
		expect(manifest.icons.map((icon) => icon.src)).toEqual([
			"/icon-192.png",
			"/icon-512.png",
			"/icon-maskable-512.png",
			"/favicon.svg",
		]);
	});
});
