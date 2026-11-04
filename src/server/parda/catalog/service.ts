import "@tanstack/react-start/server-only";
import { AppError } from "@/lib/errors";
import type { PardaMedia } from "@/server/db/schema";
import { type PardaControls, titleKey } from "../controls";
import type { TmdbCache, TmdbCacheClass } from "../tmdb/cache";
import type { Tmdb, TmdbParams } from "../tmdb/client";
import { fillIn, fillInList, mapDetails, mapList, type TitleDetails, type TitleList } from "../tmdb/mappers";

/**
 * Every catalogue read goes through here (PLAN 12.6): the one place that applies
 * takedowns and the cache epoch, so no page can show a blocked title.
 */

export type CatalogServices = { tmdb: Tmdb; cache: TmdbCache; controls: PardaControls };
/** What an answer depends on, beside its path: part of the cache key. */
export type CatalogScope = { locale: "en" | "ne"; region: string; cap: string | null };

const TMDB_LOCALE = { en: "en-US", ne: "ne-NP" } as const;
const APPEND = "credits,videos,images,recommendations,similar,content_ratings,release_dates,keywords,external_ids";

async function read<T>(
	services: CatalogServices,
	scope: CatalogScope,
	cacheClass: TmdbCacheClass,
	path: string,
	params: TmdbParams,
	map: (raw: unknown) => T,
	fill: (nepali: T, english: T) => T,
): Promise<T> {
	const { cacheEpoch: epoch } = await services.controls.settings();
	const inLocale = (locale: CatalogScope["locale"]) =>
		services.cache.read({ path, params, locale, region: scope.region, cap: scope.cap, epoch }, cacheClass, async () =>
			map(await services.tmdb.get(path, { ...params, language: TMDB_LOCALE[locale] })),
		);
	if (scope.locale === "en") return inLocale("en");
	const [nepali, english] = await Promise.all([inLocale("ne"), inLocale("en")]);
	return fill(nepali, english);
}

const withoutBlocked = async (services: CatalogServices, list: TitleList): Promise<TitleList> => {
	const blocked = await services.controls.blocked();
	return { ...list, results: list.results.filter((item) => !blocked.has(titleKey(item.media, item.id))) };
};

export async function popularTitles(
	services: CatalogServices,
	scope: CatalogScope,
	media: PardaMedia,
	page = 1,
): Promise<TitleList> {
	const list = await read(
		services,
		scope,
		"list",
		`${media}/popular`,
		{ page },
		(raw) => mapList(media, raw),
		fillInList,
	);
	return withoutBlocked(services, list);
}

/** A blocked title is a 404, the same as one that doesn't exist. */
export async function titleDetails(
	services: CatalogServices,
	scope: CatalogScope,
	media: PardaMedia,
	id: number,
): Promise<TitleDetails> {
	const blocked = await services.controls.blocked();
	if (blocked.has(titleKey(media, id))) throw new AppError("NOT_FOUND", `Blocked title ${media}/${id}`);
	return read(
		services,
		scope,
		"details",
		`${media}/${id}`,
		{ append_to_response: APPEND },
		(raw) => mapDetails(media, raw, scope.region),
		fillIn,
	);
}
