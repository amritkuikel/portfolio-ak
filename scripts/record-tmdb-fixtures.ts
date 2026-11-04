#!/usr/bin/env node
/**
 * pnpm tmdb:record: writes tests/fixtures/tmdb/ from TMDB's real answers (decision 0229),
 * with TMDB_READ_TOKEN from .env. Tests and the e2e stand-in read these files, and neither
 * ever calls TMDB. The hand-written files that ship until a token exists have the same
 * shape: `<path with _>.<language>.json`. Tests pick their ids from the popular lists, so
 * recording changes no test.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

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

const get = async (pathname: string, params: Record<string, string>) => {
	const url = new URL(`${API}/${pathname}`);
	for (const [key, value] of Object.entries({ ...params, include_adult: "false" })) url.searchParams.set(key, value);
	const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
	if (!response.ok) throw new Error(`${pathname}: ${response.status}`);
	return (await response.json()) as { results?: Array<{ id: number }> };
};

const record = async (pathname: string, params: Record<string, string> = {}) => {
	const answers = await Promise.all(LANGUAGES.map((language) => get(pathname, { ...params, language })));
	for (const [index, answer] of answers.entries()) {
		const name = `${pathname.replaceAll("/", "_")}.${LANGUAGES[index]}.json`;
		writeFileSync(path.join(OUT, name), `${JSON.stringify(answer, null, "\t")}\n`);
	}
	return answers[0];
};

mkdirSync(OUT, { recursive: true });
for (const file of readdirSync(OUT)) rmSync(path.join(OUT, file));
for (const media of ["movie", "tv"]) {
	const popular = await record(`${media}/popular`, { page: "1" });
	const first = popular?.results?.[0];
	if (!first) throw new Error(`${media}/popular returned nothing`);
	await record(`${media}/${first.id}`, { append_to_response: APPEND });
}
console.log(`record-tmdb-fixtures: wrote ${readdirSync(OUT).length} files to tests/fixtures/tmdb`);
