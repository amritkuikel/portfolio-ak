#!/usr/bin/env node
/**
 * pnpm tmdb:record: writes tests/fixtures/tmdb/ from TMDB's real answers (decisions 0229
 * and 0234), with TMDB_READ_TOKEN from .env. Tests and the e2e stand-in read these
 * files, and neither ever calls TMDB. It records:
 * - every rail of the home and the hubs (src/server/parda/catalog/rails.ts, the same
 *   requests the pages make), and the details of each billboard's titles;
 * - the popular lists and the first title of each, which the catalogue tests use.
 *
 * Files are named by `fixtureName` (e2e/harness/tmdb.ts). Tests pick their ids from the
 * recorded lists, so recording again changes no test.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fixtureName } from "../e2e/harness/tmdb.ts";
import { BILLBOARD_SIZE, PAGE_LAYOUTS, railContext } from "../src/server/parda/catalog/rails.ts";

process.loadEnvFile?.(".env");
const token = process.env.TMDB_READ_TOKEN;
if (!token) {
	console.error("record-tmdb-fixtures: set TMDB_READ_TOKEN in .env first.");
	process.exit(1);
}

const API = process.env.TMDB_API_BASE ?? "https://api.themoviedb.org/3";
const OUT = path.resolve(import.meta.dirname, "../tests/fixtures/tmdb");
const LANGUAGES = ["en-US", "ne-NP"];
const APPEND = "credits,videos,images,recommendations,similar,content_ratings,release_dates,keywords,external_ids";

type Item = {
	id: number;
	media_type?: string;
	backdrop_path?: string | null;
	adult?: boolean;
	softcore?: boolean;
};
type Answer = { results?: Item[] };
type Params = Record<string, string | number>;

const get = async (pathname: string, params: Params) => {
	const url = new URL(`${API}/${pathname}`);
	for (const [key, value] of Object.entries({ ...params, include_adult: "false" }))
		url.searchParams.set(key, String(value));
	const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
	if (!response.ok) throw new Error(`${pathname}: ${response.status}`);
	return (await response.json()) as Answer;
};

/** How many entries of a details answer's long lists are kept: pages read the first few, and the repo stays small. */
const KEEP = { cast: 12, crew: 12, images: 4, videos: 6, titles: 8 } as const;
/** The certificate regions kept: the admin's default (US), and neighbours a region may fall back to. */
const REGIONS = new Set(["US", "IN", "GB"]);

type Details = Record<string, unknown> & {
	credits?: { cast?: unknown[]; crew?: unknown[] };
	images?: Record<string, unknown[] | undefined>;
	videos?: { results?: unknown[] };
	recommendations?: { results?: unknown[] };
	similar?: { results?: unknown[] };
	release_dates?: { results?: Array<{ iso_3166_1: string }> };
	content_ratings?: { results?: Array<{ iso_3166_1: string }> };
};

/** A details answer with its long lists cut (decision 0234); every field a mapper reads is kept. */
const trim = (details: Details): Details => ({
	...details,
	...(details.credits && {
		credits: {
			...details.credits,
			cast: details.credits.cast?.slice(0, KEEP.cast),
			crew: details.credits.crew?.slice(0, KEEP.crew),
		},
	}),
	...(details.images && {
		images: Object.fromEntries(
			Object.entries(details.images).map(([kind, list]) => [kind, list?.slice(0, KEEP.images)]),
		),
	}),
	...(details.videos && { videos: { results: details.videos.results?.slice(0, KEEP.videos) } }),
	...(details.recommendations && {
		recommendations: { ...details.recommendations, results: details.recommendations.results?.slice(0, KEEP.titles) },
	}),
	...(details.similar && { similar: { ...details.similar, results: details.similar.results?.slice(0, KEEP.titles) } }),
	...(details.release_dates && {
		release_dates: { results: details.release_dates.results?.filter((row) => REGIONS.has(row.iso_3166_1)) },
	}),
	...(details.content_ratings && {
		content_ratings: { results: details.content_ratings.results?.filter((row) => REGIONS.has(row.iso_3166_1)) },
	}),
});

const recorded = new Map<string, Answer>();
const record = async (pathname: string, params: Params = {}): Promise<Answer> => {
	const entries = Object.entries(params).map(([key, value]): [string, string] => [key, String(value)]);
	const known = recorded.get(fixtureName(pathname, entries, "any"));
	if (known) return known;
	const answers = await Promise.all(LANGUAGES.map((language) => get(pathname, { ...params, language })));
	const isDetails = "append_to_response" in params;
	for (const [index, answer] of answers.entries()) {
		const language = LANGUAGES[index] ?? "en-US";
		// One line per file: these are read by code, and indentation was a third of their size.
		const body = JSON.stringify(isDetails ? trim(answer as Details) : answer);
		writeFileSync(path.join(OUT, fixtureName(pathname, entries, language)), `${body}\n`);
	}
	const english = answers[0] ?? {};
	recorded.set(fixtureName(pathname, entries, "any"), english);
	return english;
};

/** A list's titles as the mapper keeps them (catalog/mappers.ts): movies and series, nothing adult. */
const titlesOf = (answer: Answer, media: string) =>
	(answer.results ?? []).flatMap((item) => {
		const itemMedia = media === "mixed" ? item.media_type : media;
		if ((itemMedia !== "movie" && itemMedia !== "tv") || item.adult || item.softcore) return [];
		return [{ ...item, media: itemMedia }];
	});

mkdirSync(OUT, { recursive: true });
for (const file of readdirSync(OUT)) rmSync(path.join(OUT, file));

const context = railContext("US");
for (const layout of Object.values(PAGE_LAYOUTS)) {
	for (const spec of layout.rails) {
		const request = spec.request(context);
		const answer = await record(request.path, { page: 1, ...request.params });
		if (spec.id !== layout.billboardFrom) continue;
		const picks = titlesOf(answer, request.media)
			.filter((item) => item.backdrop_path)
			.slice(0, BILLBOARD_SIZE);
		for (const pick of picks) await record(`${pick.media}/${pick.id}`, { append_to_response: APPEND });
	}
}

for (const media of ["movie", "tv"]) {
	const popular = await record(`${media}/popular`, { page: 1 });
	const first = popular.results?.[0];
	if (!first) throw new Error(`${media}/popular returned nothing`);
	await record(`${media}/${first.id}`, { append_to_response: APPEND });
}
console.log(`record-tmdb-fixtures: wrote ${readdirSync(OUT).length} files to tests/fixtures/tmdb`);
