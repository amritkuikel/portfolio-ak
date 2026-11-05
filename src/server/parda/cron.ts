import "@tanstack/react-start/server-only";
import type { Db } from "@/server/db/types";
import { errorFields, log } from "@/server/log";
import { refreshCertificates, refreshTitles } from "./catalog/refresh";
import { type RollupResult, rollupSources } from "./player/stats";
import type { Tmdb } from "./tmdb/client";

export type PardaCronResult = {
	titles: { ok: boolean; skipped?: boolean; titles?: number };
	certificates: { ok: boolean; skipped?: boolean; checked?: number; failed?: number };
	ranking: { ok: boolean } & Partial<RollupResult>;
};

/**
 * `GET /api/cron/parda`, once a day: the `pd_title` refresh, the titles' US certificates
 * (decision 0240), then the sources' rollup and scores (decision 0238), each on its own,
 * so one failing leaves the others done. Running
 * it twice changes nothing but `refreshed_at` and today's rollup rows.
 */
export async function runPardaCron(
	db: Db,
	tmdb: Tmdb | null,
	options: { now?: Date; onRanked?: () => void } = {},
): Promise<PardaCronResult> {
	let titles: PardaCronResult["titles"];
	if (!tmdb) titles = { ok: true, skipped: true };
	else {
		try {
			titles = { ok: true, ...(await refreshTitles(db, tmdb)) };
		} catch (error) {
			log("error", "parda title refresh failed", errorFields(error));
			titles = { ok: false };
		}
	}
	let certificates: PardaCronResult["certificates"];
	if (!tmdb) certificates = { ok: true, skipped: true };
	else {
		try {
			certificates = { ok: true, ...(await refreshCertificates(db, tmdb, options.now ? { now: options.now } : {})) };
		} catch (error) {
			log("error", "parda certificate refresh failed", errorFields(error));
			certificates = { ok: false };
		}
	}
	let ranking: PardaCronResult["ranking"];
	try {
		ranking = { ok: true, ...(await rollupSources(db, options.now)) };
		// This process orders from the new scores at once; others within 30 s.
		options.onRanked?.();
	} catch (error) {
		log("error", "parda source rollup failed", errorFields(error));
		ranking = { ok: false };
	}
	return { titles, certificates, ranking };
}
