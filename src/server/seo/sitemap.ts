import "@tanstack/react-start/server-only";
import { portfolioSource } from "@/features/portfolio/sources"; // @portfolio
import { localizedUrl } from "@/lib/seo";
import { baseLocale, locales } from "@/paraglide/runtime";

/** One indexable page: its de-localized path (the canonical one) and when it last changed. */
export type SitemapEntry = { path: string; lastmod?: Date | undefined };

const escapeXml = (value: string) =>
	value.replace(/[<>&'"]/g, (char) => `&${{ "<": "lt", ">": "gt", "&": "amp", "'": "apos", '"': "quot" }[char]};`);

/**
 * Every indexable page: the same pages that seo() marks index (public, not a
 * search). Private pages (admin, auth, account, /dev, health, token links) never
 * appear here; they're noindex in their head.
 */
export async function sitemapEntries(): Promise<SitemapEntry[]> {
	const entries: SitemapEntry[] = [{ path: "/" }];
	// portfolio:start
	// The portfolio (content from its PortfolioSource, decision 0106).
	const portfolio = await portfolioSource.listSlugs();
	entries.push(
		{ path: "/work" },
		...portfolio.projects.map((slug) => ({ path: `/work/${slug}` })),
		{ path: "/about" },
		{ path: "/journal" },
		...portfolio.posts.map((slug) => ({ path: `/journal/${slug}` })),
		{ path: "/contact" },
	);
	// portfolio:end
	return entries;
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
