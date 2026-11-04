import { z } from "zod";

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

/** `$type/$id` as the title page reads them: a known type and a positive TMDB id, or nothing (a 404). */
export const titleParamsSchema = z.object({
	type: z.enum(["movie", "series"]),
	id: z.coerce.number().int().positive().max(2_147_483_647),
});
