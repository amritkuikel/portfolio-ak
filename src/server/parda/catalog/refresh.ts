import "@tanstack/react-start/server-only";
import { sql } from "drizzle-orm";
import { type PardaMedia, pdTitle } from "@/server/db/schema";
import type { Db } from "@/server/db/types";
import type { Tmdb } from "../tmdb/client";
import { fillInList, mapList } from "../tmdb/mappers";

/** TMDB lists 20 titles a page: 25 pages are the top 500 of each media type. */
const PAGES = 25;
const MEDIA: ReadonlyArray<PardaMedia> = ["movie", "tv"];

/**
 * Refreshes `pd_title` from TMDB's popular lists. Ranks are rewritten: a title that left
 * the top keeps its row with no rank, since later tables may still point at it.
 */
export async function refreshTitles(db: Db, tmdb: Tmdb, pages = PAGES): Promise<{ titles: number }> {
	let titles = 0;
	for (const media of MEDIA) {
		const seen = new Set<number>();
		const rows: Array<typeof pdTitle.$inferInsert> = [];
		for (let page = 1; page <= pages; page += 1) {
			const [english, nepali] = await Promise.all([
				tmdb.get(`${media}/popular`, { page, language: "en-US" }).then((raw) => mapList(media, raw)),
				tmdb.get(`${media}/popular`, { page, language: "ne-NP" }).then((raw) => mapList(media, raw)),
			]);
			const filled = fillInList(nepali, english);
			for (const item of english.results) {
				if (seen.has(item.id)) continue;
				seen.add(item.id);
				rows.push({
					media,
					tmdbId: item.id,
					title: { en: item.title, ne: filled.results.find((row) => row.id === item.id)?.title ?? item.title },
					poster: item.poster,
					backdrop: item.backdrop,
					year: item.year,
					genres: item.genres,
					popularityRank: rows.length + 1,
					refreshedAt: new Date(),
				});
			}
			if (page >= english.totalPages) break;
		}
		await db.transaction(async (tx) => {
			await tx.update(pdTitle).set({ popularityRank: null }).where(sql`${pdTitle.media} = ${media}`);
			if (rows.length === 0) return;
			await tx
				.insert(pdTitle)
				.values(rows)
				.onConflictDoUpdate({
					target: [pdTitle.media, pdTitle.tmdbId],
					set: {
						title: sql`excluded.title`,
						poster: sql`excluded.poster`,
						backdrop: sql`excluded.backdrop`,
						year: sql`excluded.year`,
						genres: sql`excluded.genres`,
						popularityRank: sql`excluded.popularity_rank`,
						refreshedAt: sql`excluded.refreshed_at`,
					},
				});
		});
		titles += rows.length;
	}
	return { titles };
}
