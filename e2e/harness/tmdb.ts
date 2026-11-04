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

/** Answers a stand-in request; false when the URL isn't one. */
export function serveTmdb(url: URL, response: ServerResponse): boolean {
	if (url.pathname.startsWith("/tmdb/img/")) {
		response.writeHead(200, { "content-type": "image/svg+xml" });
		response.end(PLACEHOLDER);
		return true;
	}
	if (!url.pathname.startsWith("/tmdb/3/")) return false;
	const name = url.pathname
		.slice("/tmdb/3/".length)
		.replaceAll("/", "_")
		.replace(/[^\w-]/g, "");
	const language = (url.searchParams.get("language") ?? "en-US").replace(/[^\w-]/g, "");
	const file = path.join(FIXTURES, `${name}.${language}.json`);
	if (!existsSync(file)) {
		response.writeHead(404, { "content-type": "application/json" });
		response.end('{"status_code":34}');
		return true;
	}
	response.writeHead(200, { "content-type": "application/json" });
	response.end(readFileSync(file));
	return true;
}
