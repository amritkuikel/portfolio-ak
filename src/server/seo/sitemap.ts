import "@tanstack/react-start/server-only";
import { portfolioSource } from "@/features/portfolio/sources";
import { STACK_PAGE_SIZE } from "@/features/stack/schema";
import { TEST_CRUD_PUBLIC_PAGE_SIZE } from "@/features/test-crud/schema";
import { localizedUrl } from "@/lib/seo";
import { baseLocale, locales } from "@/paraglide/runtime";
import type { Db } from "@/server/db/types";
import { STACK } from "@/server/stack/data";
import { listPublishedTestCrudForSitemap } from "@/server/test-crud/repository";

/** One indexable page: its de-localized path (the canonical one) and when it last changed. */
export type SitemapEntry = { path: string; lastmod?: Date | undefined };

const escapeXml = (value: string) =>
	value.replace(/[<>&'"]/g, (char) => `&${{ "<": "lt", ">": "gt", "&": "amp", "'": "apos", '"': "quot" }[char]};`);

/** Page 1 is the bare path (canonical); later pages are `?page=N`, as listSeo() makes them. */
const listPages = (path: string, total: number, pageSize: number, lastmod?: Date): SitemapEntry[] =>
	Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }, (_, index) => ({
		path: index === 0 ? path : `${path}?page=${index + 1}`,
		lastmod,
	}));

/**
 * Every indexable page: the same pages that seo() marks index (public, not a
 * search). Private pages (admin, auth, account, dev, health, token links) never
 * appear here; they're noindex in their head.
 */
export async function sitemapEntries(db: Db): Promise<SitemapEntry[]> {
	const [items, portfolio] = await Promise.all([listPublishedTestCrudForSitemap(db), portfolioSource.listSlugs()]);
	const latest = items[0]?.updatedAt;
	return [
		{ path: "/" },
		...listPages("/stack", STACK.length, STACK_PAGE_SIZE),
		...listPages("/test-crud", items.length, TEST_CRUD_PUBLIC_PAGE_SIZE, latest),
		...items.map((item) => ({ path: `/test-crud/${item.slug}`, lastmod: item.updatedAt })),
		// The editorial portfolio (demo content from its PortfolioSource, decision 0106).
		{ path: "/portfolio" },
		{ path: "/portfolio/work" },
		...portfolio.projects.map((slug) => ({ path: `/portfolio/work/${slug}` })),
		{ path: "/portfolio/about" },
		{ path: "/portfolio/journal" },
		...portfolio.posts.map((slug) => ({ path: `/portfolio/journal/${slug}` })),
		{ path: "/portfolio/contact" },
	];
}

/**
 * sitemaps.org XML with one <url> per page per locale, each listing every
 * language version (hreflang en, ne and x-default), as Google documents for
 * localized pages.
 */
export function sitemapXml(entries: ReadonlyArray<SitemapEntry>): string {
	const urls = entries.flatMap((entry) => {
		const alternates = [
			...locales.map((locale) => [locale, localizedUrl(entry.path, locale)] as const),
			["x-default", localizedUrl(entry.path, baseLocale)] as const,
		]
			.map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(href)}"/>`)
			.join("");
		const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod.toISOString()}</lastmod>` : "";
		return locales.map(
			(locale) => `<url><loc>${escapeXml(localizedUrl(entry.path, locale))}</loc>${lastmod}${alternates}</url>`,
		);
	});
	return [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
		...urls,
		"</urlset>",
		"",
	].join("\n");
}
