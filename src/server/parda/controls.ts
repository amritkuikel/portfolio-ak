import "@tanstack/react-start/server-only";
import { asc } from "drizzle-orm";
import { pdBlockedTitle, pdSettings, pdSource } from "@/server/db/schema";
import type { Db } from "@/server/db/types";

/**
 * The rows every page's reads depend on, read from Postgres at most every 30 s per
 * process (decision 0229): takedowns, the settings and the sources. A change reaches
 * every server within 30 s, without a query on each read.
 */
const TTL_MS = 30_000;

export type PardaSourceRow = typeof pdSource.$inferSelect;

const DEFAULT_SETTINGS = { region: "US", cacheEpoch: 0, playbackEnabled: true } as const;

const cached = <T>(load: () => Promise<T>, now: () => number) => {
	let entry: { value: Promise<T>; until: number } | undefined;
	return () => {
		if (!entry || now() >= entry.until) {
			const value = load();
			const current = { value, until: now() + TTL_MS };
			entry = current;
			// A failed read isn't kept: the next caller tries again.
			value.catch(() => {
				if (entry === current) entry = undefined;
			});
		}
		return entry.value;
	};
};

export const titleKey = (media: string, id: number) => `${media}:${id}`;

export function createPardaControls(db: Db, now: () => number = Date.now) {
	return {
		blocked: cached(async () => {
			const rows = await db.select({ media: pdBlockedTitle.media, id: pdBlockedTitle.tmdbId }).from(pdBlockedTitle);
			return new Set(rows.map((row) => titleKey(row.media, row.id)));
		}, now),
		settings: cached(async () => {
			const [row] = await db.select().from(pdSettings).limit(1);
			return row ?? DEFAULT_SETTINGS;
		}, now),
		sources: cached(() => db.select().from(pdSource).orderBy(asc(pdSource.position)), now),
	};
}

export type PardaControls = ReturnType<typeof createPardaControls>;
