import "@tanstack/react-start/server-only";
import type { Db } from "@/server/db/types";
import { errorFields, log } from "@/server/log";
import { refreshTitles } from "./catalog/refresh";
import type { Tmdb } from "./tmdb/client";

export type PardaCronResult = { titles: { ok: boolean; skipped?: boolean; titles?: number } };

/** `GET /api/cron/parda`, once a day. Running it twice changes nothing but `refreshed_at`. */
export async function runPardaCron(db: Db, tmdb: Tmdb | null): Promise<PardaCronResult> {
	if (!tmdb) return { titles: { ok: true, skipped: true } };
	try {
		return { titles: { ok: true, ...(await refreshTitles(db, tmdb)) } };
	} catch (error) {
		log("error", "parda title refresh failed", errorFields(error));
		return { titles: { ok: false } };
	}
}
