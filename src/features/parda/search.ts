import { z } from "zod";
import { parseTitleParam } from "./slug";

/**
 * Parda's URL contract (PLAN 12.5): route files import this, never a form schema (0194).
 */

/** The hubs at /app/parda/$hub. */
export const PARDA_HUBS = ["movies", "series", "anime"] as const;
export type PardaHub = (typeof PARDA_HUBS)[number];
/** A page of rails: the home or a hub. */
export type PardaPage = "home" | PardaHub;

export const isPardaHub = (value: string): value is PardaHub => (PARDA_HUBS as ReadonlyArray<string>).includes(value);

/** A title's type in its URL (/app/parda/movie/550, /app/parda/series/1396), and TMDB's name for it. */
export const PARDA_TYPES = { movie: "movie", series: "tv" } as const;
export type PardaType = keyof typeof PARDA_TYPES;
export const typeOfMedia = (media: "movie" | "tv"): PardaType => (media === "movie" ? "movie" : "series");

const tmdbId = z.coerce.number().int().positive().max(2_147_483_647);

/** A title as the catalogue functions take it: a known type and a positive TMDB id. */
export const titleParamsSchema = z.object({ type: z.enum(["movie", "series"]), id: tmdbId });

/** A person's or a collection's `$id`. */
export const idParamSchema = z.object({ id: tmdbId });

/**
 * `$type/$id` as a title's pages read them: a known type, and an id with its slug
 * ("550-fight-club"), or nothing (a 404). A wrong slug is the loader's 301.
 */
export function titleRouteParams(params: {
	type: string;
	id: string;
}): { type: PardaType; id: number; slug: string } | null {
	const type: PardaType | null = params.type === "movie" || params.type === "series" ? params.type : null;
	const parsed = parseTitleParam(params.id);
	return type && parsed ? { type, ...parsed } : null;
}

const optionalNumber = (max: number, min = 0) => z.coerce.number().int().min(min).max(max).optional().catch(undefined);

/**
 * A title page's search (never strict: links carry utm tags): the season shown, a page
 * of its episodes (some seasons hold over a thousand), and the episode whose sheet is open.
 */
export const titleSearchSchema = z.object({
	season: optionalNumber(9_999),
	page: optionalNumber(999, 1),
	episode: optionalNumber(99_999, 1),
});

/** A season's episodes a page at a time. */
export const EPISODES_PER_PAGE = 30;

/** "Surprise me": the page it was pressed on picks the lists it draws from. */
export const surpriseSearchSchema = z.object({
	from: z
		.enum(["home", ...PARDA_HUBS])
		.default("home")
		.catch("home"),
});

/** The watch page's search: a series' season and episode (`?s=2&e=5`); a movie has neither. */
export const watchSearchSchema = z.object({
	s: optionalNumber(9_999),
	e: optionalNumber(99_999, 1),
});
