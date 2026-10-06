import { afterEach, describe, expect, it } from "vitest";
import { absoluteUrl, pageTitle, seo } from "@/lib/seo";
import { overwriteGetLocale } from "@/paraglide/runtime";

afterEach(() => {
	overwriteGetLocale(() => "en");
});

const linkHref = (tags: ReturnType<typeof seo>, rel: string, hrefLang?: string) =>
	tags.links.find(
		(link) => link.rel === rel && (hrefLang === undefined || ("hrefLang" in link && link.hrefLang === hrefLang)),
	)?.href;
const metaContent = (tags: ReturnType<typeof seo>, key: string) =>
	tags.meta.find((meta) => ("property" in meta && meta.property === key) || ("name" in meta && meta.name === key))
		?.content;

describe("seo()", () => {
	it("builds absolute canonical, hreflang and Open Graph tags for English", () => {
		const tags = seo({ title: "Items", description: "All items", path: "/test-crud?page=2", image: "/api/images/x" });
		expect(tags.meta[0]).toEqual({ title: pageTitle("Items") });
		expect(linkHref(tags, "canonical")).toBe("http://localhost:3000/test-crud?page=2");
		expect(linkHref(tags, "alternate", "en")).toBe("http://localhost:3000/test-crud?page=2");
		expect(linkHref(tags, "alternate", "ne")).toBe("http://localhost:3000/ne/test-crud?page=2");
		expect(linkHref(tags, "alternate", "x-default")).toBe("http://localhost:3000/test-crud?page=2");
		expect(metaContent(tags, "og:url")).toBe("http://localhost:3000/test-crud?page=2");
		expect(metaContent(tags, "og:locale")).toBe("en_US");
		expect(metaContent(tags, "og:locale:alternate")).toBe("ne_NP");
		expect(metaContent(tags, "og:image")).toBe("http://localhost:3000/api/images/x");
		expect(metaContent(tags, "twitter:card")).toBe("summary_large_image");
		expect(metaContent(tags, "robots")).toBeUndefined();
	});

	it("uses the Nepali URL as canonical on Nepali pages, keeping English as x-default", () => {
		overwriteGetLocale(() => "ne");
		const tags = seo({ title: "वस्तुहरू", description: "…", path: "/test-crud/momo", type: "article", noindex: true });
		expect(linkHref(tags, "canonical")).toBe("http://localhost:3000/ne/test-crud/momo");
		expect(linkHref(tags, "alternate", "x-default")).toBe("http://localhost:3000/test-crud/momo");
		expect(metaContent(tags, "og:locale")).toBe("ne_NP");
		expect(metaContent(tags, "og:type")).toBe("article");
		expect(metaContent(tags, "og:image")).toBeUndefined();
		expect(metaContent(tags, "twitter:card")).toBe("summary");
		expect(metaContent(tags, "robots")).toBe("noindex, follow");
	});

	it("absoluteUrl resolves site paths against VITE_SITE_URL", () => {
		expect(absoluteUrl("/a?b=1")).toBe("http://localhost:3000/a?b=1");
	});
});
