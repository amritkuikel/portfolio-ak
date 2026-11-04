import "@tanstack/react-start/server-only";
import { and, asc, isNotNull, lte, sql } from "drizzle-orm";
import { PARDA_PATHS } from "@/features/parda/links";
import { titleSlug } from "@/features/parda/slug";
import { pdBlockedTitle, pdTitle } from "@/server/db/schema";
import type { Db } from "@/server/db/types";
import type { SitemapEntry } from "@/server/seo/sitemap";

/** Per media type: the top 500 titles in all (PLAN 12.5, "SEO"). */
const PER_MEDIA = 250;

/**
 * Parda's title pages in the sitemap (PLAN Task 63): the most popular of each media type
 * from `pd_title` (the daily refresh ranks them), minus takedowns, at their canonical
 * address with the slug.
 */
export async function pardaSitemapEntries({ db }: { db: Db }): Promise<SitemapEntry[]> {
	const rows = await db
		.select({ media: pdTitle.media, id: pdTitle.tmdbId, title: pdTitle.title, refreshedAt: pdTitle.refreshedAt })
		.from(pdTitle)
		.where(
			and(
				isNotNull(pdTitle.popularityRank),
				lte(pdTitle.popularityRank, PER_MEDIA),
				sql`not exists (select 1 from ${pdBlockedTitle} where ${pdBlockedTitle.media} = ${pdTitle.media} and ${pdBlockedTitle.tmdbId} = ${pdTitle.tmdbId})`,
			),
		)
		.orderBy(asc(pdTitle.media), asc(pdTitle.popularityRank));
	return rows.map((row) => ({
		path: PARDA_PATHS.title(row.media, row.id, titleSlug(row.title.en)),
		lastmod: row.refreshedAt,
	}));
}
