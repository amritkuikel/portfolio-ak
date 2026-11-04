import "@tanstack/react-start/server-only";
import { z } from "zod";
import { AppError } from "@/lib/errors";
import type { PardaMedia } from "@/server/db/schema";

/**
 * TMDB's answers turned into lean DTOs (decision 0229): only what pages use, because
 * the dehydrated query state is in every page's HTML. Later tasks add fields as pages need them.
 */

export type TitleSummary = {
	media: PardaMedia;
	id: number;
	title: string;
	overview: string;
	year: number | null;
	poster: string | null;
	backdrop: string | null;
	genres: number[];
	/** TMDB's average vote out of 10, to one decimal; 0 when nobody has voted. */
	rating: number;
};
export type TitleDetails = TitleSummary & {
	/** Often empty, and rarely in Nepali: then there's no subtitle, never the English one (the direction contract). */
	tagline: string;
	runtime: number | null;
	imdbId: string | null;
	certification: string | null;
	seasons: number | null;
};
export type TitleList = { page: number; totalPages: number; results: TitleSummary[] };

const text = z
	.string()
	.nullish()
	.transform((value) => value ?? "");

const itemSchema = z.object({
	id: z.number().int().positive(),
	title: text,
	name: text,
	overview: text,
	poster_path: z.string().nullish(),
	backdrop_path: z.string().nullish(),
	release_date: z.string().nullish(),
	first_air_date: z.string().nullish(),
	genre_ids: z.array(z.number()).optional(),
	genres: z.array(z.object({ id: z.number() })).optional(),
	vote_average: z.number().nullish(),
	/** Trending answers mix movies, series and people; other lists leave it out. */
	media_type: z.string().optional(),
	/** `include_adult=false` doesn't reach trending, so adult titles are dropped here too. */
	adult: z.boolean().optional(),
	softcore: z.boolean().optional(),
});

const listSchema = z.object({
	page: z.number(),
	total_pages: z.number(),
	results: z.array(itemSchema),
});

const detailsSchema = itemSchema.extend({
	tagline: text,
	runtime: z.number().nullish(),
	episode_run_time: z.array(z.number()).optional(),
	imdb_id: z.string().nullish(),
	external_ids: z.object({ imdb_id: z.string().nullish() }).optional(),
	number_of_seasons: z.number().nullish(),
	content_ratings: z.object({ results: z.array(z.object({ iso_3166_1: z.string(), rating: text })) }).optional(),
	release_dates: z
		.object({
			results: z.array(z.object({ iso_3166_1: z.string(), release_dates: z.array(z.object({ certification: text })) })),
		})
		.optional(),
});

const parse = <S extends z.ZodType>(schema: S, raw: unknown, what: string): z.output<S> => {
	const result = schema.safeParse(raw);
	if (!result.success) throw new AppError("UPSTREAM_UNAVAILABLE", `TMDB: unexpected ${what}`, { cause: result.error });
	return result.data;
};

const yearOf = (date: string | null | undefined) => {
	const year = Number(date?.slice(0, 4));
	return year > 0 ? year : null;
};

const toSummary = (media: PardaMedia, item: z.output<typeof itemSchema>): TitleSummary => ({
	media,
	id: item.id,
	title: media === "movie" ? item.title : item.name,
	overview: item.overview,
	year: yearOf(media === "movie" ? item.release_date : item.first_air_date),
	poster: item.poster_path ?? null,
	backdrop: item.backdrop_path ?? null,
	genres: item.genre_ids ?? item.genres?.map((genre) => genre.id) ?? [],
	rating: Math.round((item.vote_average ?? 0) * 10) / 10,
});

/** What a list holds: one media type, or `mixed` (trending/all), where each item says which it is. */
export type ListMedia = PardaMedia | "mixed";

const mediaOf = (media: ListMedia, item: z.output<typeof itemSchema>): PardaMedia | null => {
	if (media !== "mixed") return media;
	return item.media_type === "movie" || item.media_type === "tv" ? item.media_type : null;
};

export const mapList = (media: ListMedia, raw: unknown): TitleList => {
	const list = parse(listSchema, raw, "list");
	return {
		page: list.page,
		totalPages: list.total_pages,
		results: list.results.flatMap((item) => {
			const itemMedia = mediaOf(media, item);
			// People in trending/all, and adult titles where TMDB's own filter doesn't apply.
			if (!itemMedia || item.adult || item.softcore) return [];
			return [toSummary(itemMedia, item)];
		}),
	};
};

const certificationOf = (details: z.output<typeof detailsSchema>, region: string) => {
	const rating = details.content_ratings?.results.find((row) => row.iso_3166_1 === region)?.rating;
	if (rating) return rating;
	const release = details.release_dates?.results.find((row) => row.iso_3166_1 === region);
	return release?.release_dates.find((date) => date.certification)?.certification ?? null;
};

export const mapDetails = (media: PardaMedia, raw: unknown, region: string): TitleDetails => {
	const details = parse(detailsSchema, raw, "details");
	return {
		...toSummary(media, details),
		tagline: details.tagline,
		runtime: details.runtime ?? details.episode_run_time?.[0] ?? null,
		imdbId: details.imdb_id ?? details.external_ids?.imdb_id ?? null,
		certification: certificationOf(details, region),
		seasons: details.number_of_seasons ?? null,
	};
};

/** Blank Nepali text filled in from English: TMDB has almost none (PLAN 12.4). */
export const fillIn = <T extends TitleSummary>(nepali: T, english: T): T => ({
	...nepali,
	title: nepali.title.trim() || english.title,
	overview: nepali.overview.trim() || english.overview,
});

export const fillInList = (nepali: TitleList, english: TitleList): TitleList => {
	// Keyed by media type too: a mixed list (trending/all) can hold a movie and a series with one id.
	const byKey = new Map(english.results.map((item) => [`${item.media}:${item.id}`, item]));
	return {
		...nepali,
		results: nepali.results.map((item) => {
			const fallback = byKey.get(`${item.media}:${item.id}`);
			return fallback ? fillIn(item, fallback) : item;
		}),
	};
};
