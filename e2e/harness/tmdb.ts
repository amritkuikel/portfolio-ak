/**
 * Stands in for TMDB in e2e (decision 0229): `/tmdb/3/<path>` answers from
 * tests/fixtures/tmdb, and `/tmdb/img/...` with a small placeholder image.
 */
import { existsSync, readFileSync } from "node:fs";
import type { ServerResponse } from "node:http";
import path from "node:path";

const FIXTURES = path.resolve(import.meta.dirname, "../../tests/fixtures/tmdb");
const PLACEHOLDER =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 3"><rect width="2" height="3" fill="#444"/></svg>';

/** Parameters that don't change which answer a request gets (the language is the file's suffix). */
const IGNORED = new Set(["language", "include_adult", "page", "append_to_response"]);

/**
 * A recorded answer's file name, shared by `pnpm tmdb:record`, this stand-in and the
 * tests (decision 0234): the path, then each parameter that picks the answer, so two
 * discover queries on one path get two files. A date's value is left out ("aired
 * today" changes daily), so a recording keeps answering later.
 *
 *   discover/tv?with_genres=16&air_date.gte=2026-11-04, ne-NP
 *   -> discover_tv+air_date.gte+with_genres=16.ne-NP.json
 */
export function fixtureName(pathname: string, params: Iterable<[string, string]>, language: string): string {
	const parts = [...params]
		.filter(([key]) => !IGNORED.has(key))
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, value]) => (key.includes("date") ? key : `${key}=${value}`).replace(/[^\w.=-]/g, "_"));
	const base = pathname
		.replace(/^\//, "")
		.replaceAll("/", "_")
		.replace(/[^\w-]/g, "");
	return `${[base, ...parts].join("+")}.${language.replace(/[^\w-]/g, "")}.json`;
}

/** A recorded answer, or undefined when there's none. */
export function readFixture(name: string): string | undefined {
	const file = path.join(FIXTURES, name);
	return existsSync(file) ? readFileSync(file, "utf8") : undefined;
}

/**
 * The first title of the home's billboard (trending this week, with a backdrop): the
 * recording always holds its details, so the review opens its page.
 */
export function fixtureTitlePath(): string {
	const list = JSON.parse(readFixture(fixtureName("trending/all/week", [], "en-US")) ?? "{}") as {
		results?: Array<{
			id: number;
			media_type?: string;
			backdrop_path?: string | null;
			adult?: boolean;
			softcore?: boolean;
		}>;
	};
	const first = list.results?.find(
		(item) =>
			(item.media_type === "movie" || item.media_type === "tv") && item.backdrop_path && !item.adult && !item.softcore,
	);
	if (!first) throw new Error("tests/fixtures/tmdb: no trending title to review; run pnpm tmdb:record");
	return `/app/parda/${first.media_type === "movie" ? "movie" : "series"}/${first.id}`;
}

/** Answers a stand-in request; false when the URL isn't one. */
export function serveTmdb(url: URL, response: ServerResponse): boolean {
	if (url.pathname.startsWith("/tmdb/img/")) {
		response.writeHead(200, { "content-type": "image/svg+xml" });
		response.end(PLACEHOLDER);
		return true;
	}
	if (!url.pathname.startsWith("/tmdb/3/")) return false;
	const name = fixtureName(
		url.pathname.slice("/tmdb/3/".length),
		url.searchParams,
		url.searchParams.get("language") ?? "en-US",
	);
	const body = readFixture(name);
	if (body === undefined) {
		response.writeHead(404, { "content-type": "application/json" });
		response.end('{"status_code":34}');
		return true;
	}
	response.writeHead(200, { "content-type": "application/json" });
	response.end(body);
	return true;
}
