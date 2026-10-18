import { type AnyRoute, createRouter } from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";
import { pageTitle } from "@/lib/seo";
import { type Locale, locales, overwriteGetLocale } from "@/paraglide/runtime";
import type { RouterContext } from "@/router";
import { routeTree } from "@/routeTree.gen";

/**
 * SEO rules for EVERY route, from the real route tree: each page's head is
 * computed the way TanStack Router merges it (the deepest route wins per meta
 * name/property and for the title; links and JSON-LD add up), in both locales.
 *
 * - Indexable pages (INDEXABLE below) have a unique localized title and
 *   description, robots index, a canonical, hreflang en/ne/x-default, Open
 *   Graph + Twitter tags and, where they apply, valid JSON-LD.
 * - Every other page is noindex. A new page that is neither fails here: give it
 *   seo() (and add it to INDEXABLE) or privateHead() / a private layout.
 */

type Meta = Record<string, unknown>;
type Link = { rel?: string; hrefLang?: string; href?: string };
type Head = { meta?: Array<Meta | undefined>; links?: Array<Link | undefined> };
type HeadContext = { match: { search: Record<string, unknown> }; params: Record<string, string>; loaderData: unknown };

const SITE = "http://localhost:3000";

const sampleItem = {
	title: "Momo Kitchen",
	summary: "Steamed dumplings, made fresh.",
	publishedAt: "2026-09-01T08:00:00.000Z",
	price: 450,
	tags: ["food", "nepal"],
	ogImage: { url: "https://res.cloudinary.com/demo/image/upload/og.jpg", width: 1200, height: 630, alt: "A plate" },
	images: ["https://res.cloudinary.com/demo/image/upload/og.jpg"],
};

/** Loader data the portfolio pages' heads read (src/routes/portfolio). */
const samplePerson = {
	name: "Aarav Shrestha",
	role: "Full-stack developer",
	intro: "Ten years of shipping web products end to end, from schema to pixel.",
	socials: ["https://example.com/github"],
};
const sampleProject = {
	title: "Ledgerline",
	summary: "A treasury dashboard that closes the month in hours, not days.",
	slug: "ledgerline",
	year: 2026,
	client: "Himal Capital",
	stack: ["PostgreSQL", "TanStack Start"],
};
const samplePost = {
	title: "Server-render everything",
	excerpt: "A love letter to complete HTML, and why spinners are expensive.",
	slug: "server-render-everything",
	publishedAt: "2026-09-02",
	tags: ["React", "SSR"],
};

/** Every indexable page: route id, the context its head() gets, and its expected canonical path. */
const INDEXABLE: ReadonlyArray<{ id: string; label: string; context: Partial<HeadContext>; path: string }> = [
	{ id: "/_public/", label: "home", context: {}, path: "/" },
	{ id: "/_public/stack", label: "stack", context: { match: { search: { q: "", page: 1 } } }, path: "/stack" },
	{
		id: "/_public/stack",
		label: "stack p2",
		context: { match: { search: { q: "", page: 2 } } },
		path: "/stack?page=2",
	},
	{ id: "/_public/test-crud/", label: "items", context: { match: { search: { q: "", page: 1 } } }, path: "/test-crud" },
	{
		id: "/_public/test-crud/",
		label: "items p2",
		context: { match: { search: { q: "", page: 2 } } },
		path: "/test-crud?page=2",
	},
	{
		id: "/_public/test-crud/$slug",
		label: "item",
		context: { params: { slug: "momo-kitchen" }, loaderData: sampleItem },
		path: "/test-crud/momo-kitchen",
	},
	{ id: "/portfolio/", label: "portfolio", context: { loaderData: samplePerson }, path: "/portfolio" },
	{ id: "/portfolio/work/", label: "work", context: { match: { search: {} } }, path: "/portfolio/work" },
	{
		id: "/portfolio/work/$slug",
		label: "case study",
		context: { params: { slug: "ledgerline" }, loaderData: sampleProject },
		path: "/portfolio/work/ledgerline",
	},
	{ id: "/portfolio/about", label: "about", context: { loaderData: samplePerson }, path: "/portfolio/about" },
	{ id: "/portfolio/journal/", label: "journal", context: {}, path: "/portfolio/journal" },
	{
		id: "/portfolio/journal/$slug",
		label: "article",
		context: { params: { slug: samplePost.slug }, loaderData: samplePost },
		path: "/portfolio/journal/server-render-everything",
	},
	{ id: "/portfolio/contact", label: "contact", context: {}, path: "/portfolio/contact" },
];

/** Pages titled by their content (loader data), not by a message: the samples aren't translated. */
const CONTENT_TITLED = new Set(["home", "item", "portfolio", "case study", "article"]);

// Building a router resolves every route's full id ("/_public/test-crud/$slug").
// Nothing loads, so the context is never read.
const router = createRouter({ routeTree, context: {} as RouterContext });
const children = (route: AnyRoute): AnyRoute[] => Object.values(route.children ?? {}) as AnyRoute[];
/** Pages: leaf routes that render something (server-only routes like /sitemap.xml have no component). */
const pages = (Object.values(router.routesById) as AnyRoute[]).filter(
	(route) => children(route).length === 0 && !(route.options.server && !route.options.component),
);
const byId = new Map(pages.map((route) => [route.id as string, route]));

const ancestry = (route: AnyRoute): AnyRoute[] =>
	route.parentRoute ? [...ancestry(route.parentRoute), route] : [route];

function headFor(route: AnyRoute, context: Partial<HeadContext> = {}) {
	const full: HeadContext = { match: { search: {} }, params: {}, loaderData: undefined, ...context };
	const heads = ancestry(route).map(
		(each) => ((each.options as { head?: (ctx: HeadContext) => Head }).head?.(full) ?? {}) as Head,
	);
	// Router merge rules (headContentUtils): walk from the deepest match up.
	let title: string | undefined;
	const meta = new Map<string, string>();
	const jsonLd: Meta[] = [];
	for (const head of [...heads].reverse()) {
		for (const entry of [...(head.meta ?? [])].reverse()) {
			if (!entry) continue;
			if (typeof entry.title === "string") title ??= entry.title;
			else if ("script:ld+json" in entry) jsonLd.unshift(entry["script:ld+json"] as Meta);
			else {
				const key = (entry.name ?? entry.property) as string | undefined;
				if (key && !meta.has(key)) meta.set(key, String(entry.content));
			}
		}
	}
	const links = heads.flatMap((head) => (head.links ?? []).filter((link): link is Link => Boolean(link)));
	return { title, meta, links, jsonLd };
}

const localized = (path: string, locale: Locale) => new URL(locale === "en" ? path : `/ne${path}`, SITE).href;

afterEach(() => {
	overwriteGetLocale(() => "en");
});

describe.each(locales)("route SEO (%s)", (locale) => {
	const withLocale = <T>(run: () => T): T => {
		overwriteGetLocale(() => locale);
		return run();
	};

	it("every indexable page has a title, description, canonical, hreflang, Open Graph and Twitter tags", () => {
		withLocale(() => {
			for (const page of INDEXABLE) {
				const route = byId.get(page.id);
				expect(route, page.id).toBeDefined();
				if (!route) continue;
				const head = headFor(route, page.context);
				const where = `${page.label} (${locale})`;
				expect(head.title, where).toMatch(new RegExp(`${pageTitle()}$`));
				expect(head.meta.get("description")?.length ?? 0, where).toBeGreaterThan(20);
				expect(head.meta.get("robots"), where).toMatch(/^index, follow/);

				const canonical = head.links.filter((link) => link.rel === "canonical");
				expect(
					canonical.map((link) => link.href),
					where,
				).toEqual([localized(page.path, locale)]);
				const alternates = Object.fromEntries(
					head.links.filter((link) => link.rel === "alternate").map((link) => [link.hrefLang, link.href]),
				);
				expect(alternates, where).toEqual({
					en: localized(page.path, "en"),
					ne: localized(page.path, "ne"),
					"x-default": localized(page.path, "en"),
				});

				expect(head.meta.get("og:url"), where).toBe(localized(page.path, locale));
				for (const key of ["og:title", "og:description", "og:image", "og:image:alt", "twitter:card", "twitter:image"]) {
					expect(head.meta.get(key), `${where} ${key}`).toBeTruthy();
				}
				expect(head.meta.get("og:image"), where).toMatch(/^https?:\/\//);
				expect(head.meta.get("og:locale"), where).toBe(locale === "en" ? "en_US" : "ne_NP");
			}
		});
	});

	it("indexable pages have unique titles and descriptions", () => {
		withLocale(() => {
			const heads = INDEXABLE.flatMap((page) => {
				const route = byId.get(page.id);
				return route ? [headFor(route, page.context)] : [];
			});
			const titles = heads.map((head) => head.title);
			const descriptions = heads.map((head) => head.meta.get("description"));
			expect(new Set(titles).size).toBe(INDEXABLE.length);
			expect(new Set(descriptions).size).toBe(INDEXABLE.length);
		});
	});

	it("every other page is noindex", () => {
		withLocale(() => {
			const indexable = new Set(INDEXABLE.map((page) => page.id));
			const others = pages.filter((route) => !indexable.has(route.id));
			expect(others.length).toBeGreaterThan(15);
			for (const route of others) {
				// Detail-style heads may need params; private ones never read them.
				const head = headFor(route, { params: { id: "x", slug: "x" } });
				expect(head.meta.get("robots"), `${route.id} needs privateHead() or seo()`).toMatch(/noindex/);
				expect(head.title, route.id).toBeTruthy();
			}
		});
	});

	it("searches are noindex but still canonical to the list", () => {
		withLocale(() => {
			for (const id of ["/_public/stack", "/_public/test-crud/"]) {
				const route = byId.get(id);
				if (!route) throw new Error(id);
				const head = headFor(route, { match: { search: { q: "momo", page: 1 } } });
				expect(head.meta.get("robots"), id).toBe("noindex, follow");
				expect(head.title, id).toContain("momo");
			}
		});
	});

	it("home describes the site and its owner (WebSite + Organization)", () => {
		withLocale(() => {
			const route = byId.get("/_public/");
			if (!route) throw new Error("home");
			const { jsonLd } = headFor(route);
			const website = jsonLd.find((data) => data["@type"] === "WebSite");
			const organization = jsonLd.find((data) => data["@type"] === "Organization");
			expect(website).toMatchObject({
				"@context": "https://schema.org",
				name: "Portfolio",
				url: localized("/", locale),
				inLanguage: locale,
				publisher: { "@id": `${SITE}/#organization` },
			});
			expect(organization).toMatchObject({
				"@id": `${SITE}/#organization`,
				name: "Portfolio",
				url: `${SITE}/`,
				logo: `${SITE}/icon-512.png`,
			});
		});
	});

	it("an item is a Product with an Offer and its own Open Graph image", () => {
		withLocale(() => {
			const route = byId.get("/_public/test-crud/$slug");
			if (!route) throw new Error("item");
			const head = headFor(route, { params: { slug: "momo-kitchen" }, loaderData: sampleItem });
			const url = localized("/test-crud/momo-kitchen", locale);
			expect(head.jsonLd).toEqual([
				{
					"@context": "https://schema.org",
					"@type": "Product",
					"@id": `${url}#product`,
					name: "Momo Kitchen",
					description: "Steamed dumplings, made fresh.",
					url,
					image: sampleItem.images,
					keywords: "food, nepal",
					releaseDate: sampleItem.publishedAt,
					brand: { "@id": `${SITE}/#organization` },
					offers: {
						"@type": "Offer",
						url,
						price: "450.00",
						priceCurrency: "NPR",
						availability: "https://schema.org/InStock",
						seller: { "@id": `${SITE}/#organization` },
					},
				},
			]);
			expect(head.meta.get("og:type")).toBe("article");
			expect(head.meta.get("og:image")).toBe(sampleItem.ogImage.url);
			expect(head.meta.get("og:image:alt")).toBe("A plate");
			expect(head.meta.get("article:published_time")).toBe(sampleItem.publishedAt);
		});
	});

	it("the portfolio describes its owner, case studies and articles (Person, CreativeWork, BlogPosting)", () => {
		withLocale(() => {
			const jsonLdOf = (id: string, context: Partial<HeadContext>) => {
				const route = byId.get(id);
				if (!route) throw new Error(id);
				return headFor(route, context).jsonLd;
			};
			const person = { "@id": `${SITE}/portfolio#person` };
			expect(jsonLdOf("/portfolio/", { loaderData: samplePerson })).toEqual([
				expect.objectContaining({ "@type": "Person", ...person, name: "Aarav Shrestha", sameAs: samplePerson.socials }),
			]);
			expect(jsonLdOf("/portfolio/about", { loaderData: samplePerson })).toEqual([
				expect.objectContaining({ "@type": "ProfilePage", mainEntity: expect.objectContaining(person) }),
			]);
			const caseUrl = localized("/portfolio/work/ledgerline", locale);
			expect(jsonLdOf("/portfolio/work/$slug", { params: { slug: "ledgerline" }, loaderData: sampleProject })).toEqual([
				expect.objectContaining({
					"@type": "CreativeWork",
					"@id": `${caseUrl}#work`,
					name: "Ledgerline",
					creator: person,
					inLanguage: locale,
				}),
			]);
			const articleUrl = localized("/portfolio/journal/server-render-everything", locale);
			expect(
				jsonLdOf("/portfolio/journal/$slug", { params: { slug: samplePost.slug }, loaderData: samplePost }),
			).toEqual([
				expect.objectContaining({
					"@type": "BlogPosting",
					"@id": `${articleUrl}#article`,
					headline: samplePost.title,
					datePublished: "2026-09-02",
					author: person,
				}),
			]);
		});
	});

	it("a filtered work index is noindex, still canonical to the full list", () => {
		withLocale(() => {
			const route = byId.get("/portfolio/work/");
			if (!route) throw new Error("work");
			const head = headFor(route, { match: { search: { discipline: "ai" } } });
			expect(head.meta.get("robots")).toBe("noindex, follow");
			expect(head.links.find((link) => link.rel === "canonical")?.href).toBe(localized("/portfolio/work", locale));
		});
	});
});

it("English and Nepali pages have different titles (except pages titled by their content)", () => {
	const titles = (locale: Locale) => {
		overwriteGetLocale(() => locale);
		return INDEXABLE.filter((page) => !CONTENT_TITLED.has(page.label)).map((page) => {
			const route = byId.get(page.id);
			return route ? headFor(route, page.context).title : undefined;
		});
	};
	const en = titles("en");
	const ne = titles("ne");
	en.forEach((title, index) => {
		expect(title).not.toBe(ne[index]);
	});
});
